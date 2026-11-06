import 'dart:convert';

import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/band_model.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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
    registerFallbackValue(Uri.parse('http://localhost:3000/bands'));
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

  group('getBands', () {
    final tBandsJson = [
      {
        'id': 'band-1',
        'name': 'Banda Aurora',
        'createdAt': '2026-10-01T10:00:00.000Z',
        'updatedAt': '2026-10-02T11:30:00.000Z',
      },
      {'id': 'band-2', 'name': 'Banda Eclipse'},
    ];

    test('should return List<BandModel> when status code is 200 (positive case)', () async {
      // arrange
      when(
        () => mockHttpClient.get(any(), headers: any(named: 'headers')),
      ).thenAnswer((_) async => http.Response(jsonEncode(tBandsJson), 200));

      // act
      final result = await remoteDataSource.getBands();

      // assert
      expect(result, isA<List<BandModel>>());
      expect(result.length, 2);
      expect(result.first.id, 'band-1');
      expect(result.first.name, 'Banda Aurora');
      expect(
        result.first.createdAt,
        DateTime.parse('2026-10-01T10:00:00.000Z'),
      );
      expect(result[1].createdAt, isNull);

      final captured = verify(
        () => mockHttpClient.get(
          captureAny(),
          headers: any(named: 'headers'),
        ),
      ).captured;
      expect((captured.single as Uri).path, '/bands');
    });

    test('should throw ServerException when body is not a list (negative case)', () async {
      // arrange
      when(
        () => mockHttpClient.get(any(), headers: any(named: 'headers')),
      ).thenAnswer(
        (_) async => http.Response(jsonEncode({'id': 'band-1'}), 200),
      );

      // act & assert
      expect(
        () => remoteDataSource.getBands(),
        throwsA(isA<ServerException>()),
      );
    });

    test('should throw UnauthorizedException when status code is 401 (negative case)', () async {
      // arrange
      when(
        () => mockHttpClient.get(any(), headers: any(named: 'headers')),
      ).thenAnswer(
        (_) async =>
            http.Response(jsonEncode({'message': 'Token inválido'}), 401),
      );

      // act & assert
      expect(
        () => remoteDataSource.getBands(),
        throwsA(isA<UnauthorizedException>()),
      );
    });

    test('should throw ServerException when status code is 500 (negative case)', () async {
      // arrange
      when(
        () => mockHttpClient.get(any(), headers: any(named: 'headers')),
      ).thenAnswer((_) async => http.Response('', 500));

      // act & assert
      expect(
        () => remoteDataSource.getBands(),
        throwsA(isA<ServerException>()),
      );
    });

    test('should throw NetworkException when ClientException is thrown (negative case)', () async {
      // arrange
      when(
        () => mockHttpClient.get(any(), headers: any(named: 'headers')),
      ).thenThrow(http.ClientException('No Internet'));

      // act & assert
      expect(
        () => remoteDataSource.getBands(),
        throwsA(isA<NetworkException>()),
      );
    });
  });
}
