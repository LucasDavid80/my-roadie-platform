import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/app_config.dart';
import '../models/user_model.dart';
import '../../domain/models/event_model.dart';

class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException([this.message = 'Não autorizado']);
  @override
  String toString() => message;
}

class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'Erro de conexão com o servidor']);
  @override
  String toString() => message;
}

class ServerException implements Exception {
  final String message;
  ServerException([this.message = 'Erro no servidor']);
  @override
  String toString() => message;
}

String _extractErrorMessage(String body) {
  if (body.isEmpty) return 'Não autorizado';
  try {
    final dynamic decoded = jsonDecode(body);
    if (decoded is Map && decoded['message'] != null) {
      final msg = decoded['message'];
      // Nest costuma mandar message como String ou List<String>
      if (msg is List) return msg.join('; ');
      return msg.toString();
    }
  } catch (_) {
    // corpo não é JSON — devolve como veio
  }
  return body;
}

class RemoteDataSource {
  final http.Client _client;
  final SupabaseClient? _supabase;

  RemoteDataSource({required http.Client client, SupabaseClient? supabase})
    : _client = client,
      _supabase = supabase;

  Map<String, String> _getHeaders() {
    String? token = _supabase?.auth.currentSession?.accessToken;
    if (token == null || token.isEmpty) {
      try {
        token = Supabase.instance.client.auth.currentSession?.accessToken;
      } catch (_) {}
    }

    debugPrint('DEBUG AUTH TOKEN PRESENTE: ${token != null && token.isNotEmpty}');
    if (token != null && token.length > 20) {
      debugPrint('DEBUG AUTH TOKEN (início): ${token.substring(0, 20)}...');
    }

    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // --- Events ---

  Future<List<EventModel>> getEvents() async {
    try {
      final response = await _client.get(
        Uri.parse('${AppConfig.backendUrl}/events'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => EventModel.fromMap(json)).toList();
      } else if (response.statusCode == 401) {
        throw UnauthorizedException();
      } else {
        throw ServerException('Failed to load events: ${response.statusCode}');
      }
    } on http.ClientException {
      throw NetworkException();
    } catch (e) {
      if (e is UnauthorizedException || e is ServerException) {
        rethrow;
      }
      throw NetworkException(e.toString());
    }
  }

  Future<EventModel?> saveEvent(EventModel event) async {
    try {
      final response = await _client.post(
        Uri.parse('${AppConfig.backendUrl}/events'),
        headers: _getHeaders(),
        body: jsonEncode(event.toMap()),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.body.isNotEmpty) {
          final dynamic data = jsonDecode(response.body);
          if (data is Map<String, dynamic>) {
            return EventModel.fromMap(data);
          }
        }
        return event;
      } else {
        if (response.statusCode == 401) {
          throw UnauthorizedException();
        }
        throw ServerException('Failed to save event: ${response.statusCode}');
      }
    } on http.ClientException {
      throw NetworkException();
    } catch (e) {
      if (e is UnauthorizedException || e is ServerException) {
        rethrow;
      }
      throw NetworkException(e.toString());
    }
  }

  Future<void> deleteEvent(String id) async {
    try {
      final response = await _client.delete(
        Uri.parse('${AppConfig.backendUrl}/events/$id'),
        headers: _getHeaders(),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        if (response.statusCode == 401) {
          throw UnauthorizedException();
        }
        throw ServerException('Failed to delete event: ${response.statusCode}');
      }
    } on http.ClientException {
      throw NetworkException();
    } catch (e) {
      if (e is UnauthorizedException || e is ServerException) {
        rethrow;
      }
      throw NetworkException(e.toString());
    }
  }

  // --- User Profile ---

  Future<UserModel> getUserProfile(String id) async {
    try {
      final headers = _getHeaders();
      final url = '${AppConfig.backendUrl}/users/$id';

      debugPrint('DEBUG REQUEST URL: $url');
      debugPrint('DEBUG REQUEST HEADERS: $headers');

      final response = await _client.get(
        Uri.parse(url),
        headers: headers,
      );

      debugPrint('DEBUG RESPONSE STATUS: ${response.statusCode}');
      debugPrint('DEBUG RESPONSE BODY: ${response.body}');

      if (response.statusCode == 200) {
        return UserModel.fromJson(jsonDecode(response.body));
      } else if (response.statusCode == 401) {
        throw UnauthorizedException(_extractErrorMessage(response.body));
      } else {
        throw ServerException(
          'Failed to get user profile: ${response.statusCode}',
        );
      }
    } on http.ClientException {
      throw NetworkException();
    } catch (e) {
      if (e is UnauthorizedException || e is ServerException) {
        rethrow;
      }
      throw NetworkException(e.toString());
    }
  }

  Future<UserModel> updateUserProfile(String id, UserModel user) async {
    try {
      final response = await _client.patch(
        Uri.parse('${AppConfig.backendUrl}/users/$id'),
        headers: _getHeaders(),
        body: jsonEncode(user.toJson()),
      );

      if (response.statusCode == 200) {
        return UserModel.fromJson(jsonDecode(response.body));
      } else if (response.statusCode == 401) {
        throw UnauthorizedException(_extractErrorMessage(response.body));
      } else {
        throw ServerException(
          'Failed to update user profile: ${response.statusCode}',
        );
      }
    } on http.ClientException {
      throw NetworkException();
    } catch (e) {
      if (e is UnauthorizedException || e is ServerException) {
        rethrow;
      }
      throw NetworkException(e.toString());
    }
  }

  Future<UserModel> createUser({
    required String email,
    required String supabaseId,
    required String name,
    required String role,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('${AppConfig.backendUrl}/users'),
        headers: _getHeaders(),
        body: jsonEncode({
          'email': email,
          'supabaseId': supabaseId,
          'name': name,
          'role': role,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return UserModel.fromJson(jsonDecode(response.body));
      } else if (response.statusCode == 401) {
        throw UnauthorizedException();
      } else {
        final dynamic body = jsonDecode(response.body);
        final String message = body is Map && body['message'] != null
            ? body['message'].toString()
            : 'Failed to create user: ${response.statusCode}';
        throw ServerException(message);
      }
    } on http.ClientException {
      throw NetworkException();
    } catch (e) {
      if (e is UnauthorizedException || e is ServerException) {
        rethrow;
      }
      throw NetworkException(e.toString());
    }
  }
}
