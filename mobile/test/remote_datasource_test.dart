import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/user_model.dart';
import 'package:agenda_musical/domain/models/event_model.dart';

class MockHttpClient extends Mock implements http.Client {}
class MockSupabaseClient extends Mock implements SupabaseClient {}
class MockGoTrueClient extends Mock implements GoTrueClient {}
class MockSession extends Mock implements Session {}

void main() {
  late RemoteDataSource remoteDataSource;
  late MockHttpClient mockHttpClient;
  late MockSupabaseClient mockSupabaseClient;
  late MockGoTrueClient mockGoTrueClient;
  late MockSession mockSession;

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://localhost:3000/events'));
  });

  setUp(() {
    mockHttpClient = MockHttpClient();
    mockSupabaseClient = MockSupabaseClient();
    mockGoTrueClient = MockGoTrueClient();
    mockSession = MockSession();

    when(() => mockSupabaseClient.auth).thenReturn(mockGoTrueClient);
    when(() => mockGoTrueClient.currentSession).thenReturn(mockSession);
    when(() => mockSession.accessToken).thenReturn('test-access-token');

    remoteDataSource = RemoteDataSource(
      client: mockHttpClient,
      supabase: mockSupabaseClient,
    );
  });

  group('getEvents', () {
    final tEventsJson = [
      {
        'id': '1',
        'title': 'Show Rock',
        'type': 'SHOW',
        'date': '2026-07-16T12:00:00.000',
        'startTime': '20:00',
        'endTime': '22:00',
        'location': 'Bar do Rock',
        'fee': 500.0,
        'notes': 'Trazer cabos'
      }
    ];

    test('should return List<EventModel> when status code is 200 (positive case)', () async {
      // arrange
      when(() => mockHttpClient.get(
            any(),
            headers: any(named: 'headers'),
          )).thenAnswer((_) async => http.Response(jsonEncode(tEventsJson), 200));

      // act
      final result = await remoteDataSource.getEvents();

      // assert
      expect(result, isA<List<EventModel>>());
      expect(result.length, 1);
      expect(result.first.title, 'Show Rock');
      expect(result.first.fee, 500.0);
    });

    test('should throw UnauthorizedException when status code is 401 (negative case)', () async {
      // arrange
      when(() => mockHttpClient.get(
            any(),
            headers: any(named: 'headers'),
          )).thenAnswer((_) async => http.Response('Unauthorized', 401));

      // act & assert
      expect(
        () => remoteDataSource.getEvents(),
        throwsA(isA<UnauthorizedException>()),
      );
    });

    test('should throw NetworkException when ClientException is thrown (negative case)', () async {
      // arrange
      when(() => mockHttpClient.get(
            any(),
            headers: any(named: 'headers'),
          )).thenThrow(http.ClientException('No Internet'));

      // act & assert
      expect(
        () => remoteDataSource.getEvents(),
        throwsA(isA<NetworkException>()),
      );
    });
  });

  group('saveEvent', () {
    final tEventModel = EventModel(
      id: 'temp-id-123',
      title: 'Show Rock',
      type: 'Show',
      date: DateTime(2026, 7, 16, 20, 0),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Bar do Rock',
      fee: 500.0,
      notes: 'Trazer cabos',
      bandId: 'band-uuid-1',
    );

    final tSavedResponseJson = {
      'id': 'persisted-uuid-999',
      'title': 'Show Rock',
      'date': '2026-07-16T20:00:00.000',
      'location': 'Bar do Rock',
      'description': 'Trazer cabos',
      'bandId': 'band-uuid-1',
      'createdById': 'user-uuid-1',
      'status': 'PENDING',
    };

    test('should return persisted EventModel and send sanitized payload when status is 201 (positive case)', () async {
      // arrange
      String? capturedBody;
      when(() => mockHttpClient.post(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenAnswer((invocation) async {
        capturedBody = invocation.namedArguments[#body] as String?;
        return http.Response(jsonEncode(tSavedResponseJson), 201);
      });

      // act
      final result = await remoteDataSource.saveEvent(tEventModel);

      // assert
      expect(result, isA<EventModel>());
      expect(result?.id, 'persisted-uuid-999');
      expect(result?.title, 'Show Rock');
      expect(result?.notes, 'Trazer cabos');
      expect(result?.bandId, 'band-uuid-1');

      // Verifica sanitização do payload (sem 'id', 'fee', 'type', 'startTime', 'endTime')
      expect(capturedBody, isNotNull);
      final dynamic decodedPayload = jsonDecode(capturedBody!);
      expect(decodedPayload['id'], isNull);
      expect(decodedPayload['fee'], isNull);
      expect(decodedPayload['type'], isNull);
      expect(decodedPayload['title'], 'Show Rock');
      expect(decodedPayload['description'], 'Trazer cabos');
      expect(decodedPayload['bandId'], 'band-uuid-1');
    });

    test('should throw UnauthorizedException when status code is 401 (negative case)', () async {
      // arrange
      when(() => mockHttpClient.post(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenAnswer((_) async => http.Response(jsonEncode({'message': 'Sessão inválida'}), 401));

      // act & assert
      expect(
        () => remoteDataSource.saveEvent(tEventModel),
        throwsA(isA<UnauthorizedException>()),
      );
    });

    test('should throw ServerException when status code is 400 or 500 (negative case)', () async {
      // arrange
      when(() => mockHttpClient.post(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenAnswer((_) async => http.Response(jsonEncode({'message': 'Erro de validação'}), 400));

      // act & assert
      expect(
        () => remoteDataSource.saveEvent(tEventModel),
        throwsA(isA<ServerException>()),
      );
    });

    test('should throw NetworkException when ClientException is thrown (negative case)', () async {
      // arrange
      when(() => mockHttpClient.post(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenThrow(http.ClientException('No Internet'));

      // act & assert
      expect(
        () => remoteDataSource.saveEvent(tEventModel),
        throwsA(isA<NetworkException>()),
      );
    });
  });

  group('getUserProfile', () {
    final tUserJson = {
      'id': 'user-123',
      'name': 'Lucas',
      'experience': 'PRO',
      'phone': '123456789',
      'instagram': '@lucas',
      'city': 'São Paulo',
      'federativeUnit': 'SP',
      'minCache': 1000.0,
      'youtubeLink': 'http://youtube.com',
      'bio': 'Musician bio',
      'instruments': ['Guitar'],
      'styles': ['Rock'],
      'isAvailable': true
    };

    test('should return UserModel when status code is 200 (positive case)', () async {
      // arrange
      when(() => mockHttpClient.get(
            any(),
            headers: any(named: 'headers'),
          )).thenAnswer((_) async => http.Response(jsonEncode(tUserJson), 200));

      // act
      final result = await remoteDataSource.getUserProfile('user-123');

      // assert
      expect(result, isA<UserModel>());
      expect(result.id, 'user-123');
      expect(result.name, 'Lucas');
    });

    test('should throw UnauthorizedException when status code is 401 (negative case)', () async {
      // arrange
      when(() => mockHttpClient.get(
            any(),
            headers: any(named: 'headers'),
          )).thenAnswer((_) async => http.Response('Unauthorized', 401));

      // act & assert
      expect(
        () => remoteDataSource.getUserProfile('user-123'),
        throwsA(isA<UnauthorizedException>()),
      );
    });
  });

  group('updateUserProfile', () {
    final tUserJson = {
      'id': 'user-123',
      'name': 'Lucas Edit',
      'experience': 'PRO',
      'phone': '123456789',
      'instagram': '@lucas',
      'city': 'São Paulo',
      'federativeUnit': 'SP',
      'minCache': 1000.0,
      'youtubeLink': 'http://youtube.com',
      'bio': 'Musician bio',
      'instruments': ['Guitar'],
      'styles': ['Rock'],
      'isAvailable': true
    };

    final tUserModel = UserModel(
      id: 'user-123',
      name: 'Lucas Edit',
      experience: 'PRO',
      phone: '123456789',
      instagram: '@lucas',
      city: 'São Paulo',
      federativeUnit: 'SP',
      minCache: 1000.0,
      youtubeLink: 'http://youtube.com',
      bio: 'Musician bio',
      instruments: const ['Guitar'],
      styles: const ['Rock'],
      isAvailable: true,
    );

    test('should return updated UserModel when status code is 200 (positive case)', () async {
      // arrange
      when(() => mockHttpClient.patch(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenAnswer((_) async => http.Response(jsonEncode(tUserJson), 200));

      // act
      final result = await remoteDataSource.updateUserProfile('user-123', tUserModel);

      // assert
      expect(result, isA<UserModel>());
      expect(result.id, 'user-123');
      expect(result.name, 'Lucas Edit');
    });

    test('should throw ServerException when status code is 500 (negative case)', () async {
      // arrange
      when(() => mockHttpClient.patch(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenAnswer((_) async => http.Response('Server Error', 500));

      // act & assert
      expect(
        () => remoteDataSource.updateUserProfile('user-123', tUserModel),
        throwsA(isA<ServerException>()),
      );
    });
  });
}
