import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/app_config.dart';
import '../models/user_model.dart';
import '../../domain/models/event_model.dart';

class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException([this.message = 'Unauthorized']);
}

class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'Network error occurred']);
}

class ServerException implements Exception {
  final String message;
  ServerException([this.message = 'Server error occurred']);
}

class RemoteDataSource {
  final http.Client _client;
  final SupabaseClient? _supabase;

  RemoteDataSource({
    required http.Client client,
    SupabaseClient? supabase,
  })  : _client = client,
        _supabase = supabase;

  Map<String, String> _getHeaders() {
    final token = _supabase?.auth.currentSession?.accessToken;
    final headers = {
      'Content-Type': 'application/json',
    };
    if (token != null) {
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
      final response = await _client.get(
        Uri.parse('${AppConfig.backendUrl}/users/$id'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        return UserModel.fromJson(jsonDecode(response.body));
      } else if (response.statusCode == 401) {
        throw UnauthorizedException();
      } else {
        throw ServerException('Failed to get user profile: ${response.statusCode}');
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
        throw UnauthorizedException();
      } else {
        throw ServerException('Failed to update user profile: ${response.statusCode}');
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
