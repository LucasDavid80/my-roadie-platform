import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
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
}
