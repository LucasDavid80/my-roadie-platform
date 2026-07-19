import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/repositories/agenda_repository_impl.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/models/event_model.dart';

class MockRemoteDataSource extends Mock implements RemoteDataSource {}

void main() {
  late AgendaRepositoryImpl repository;
  late MockRemoteDataSource mockRemoteDataSource;

  setUpAll(() {
    registerFallbackValue(
      EventModel(
        id: '1',
        title: 'Test Event',
        type: 'SHOW',
        date: DateTime(2026, 7, 16),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Test Location',
        fee: 100.0,
      ),
    );
  });

  setUp(() {
    mockRemoteDataSource = MockRemoteDataSource();
    repository = AgendaRepositoryImpl(mockRemoteDataSource);
  });

  group('AgendaRepositoryImpl', () {
    final tDateTime = DateTime(2026, 7, 16);
    final tEventEntity = EventEntity(
      id: '1',
      title: 'Show Rock',
      type: 'SHOW',
      date: tDateTime,
      startTime: '20:00',
      endTime: '22:00',
      location: 'Bar do Rock',
      fee: 500.0,
      notes: 'Trazer cabos',
    );
    final tEventModel = EventModel(
      id: '1',
      title: 'Show Rock',
      type: 'SHOW',
      date: tDateTime,
      startTime: '20:00',
      endTime: '22:00',
      location: 'Bar do Rock',
      fee: 500.0,
      notes: 'Trazer cabos',
    );

    test('getEvents should return list of EventEntity when datasource succeeds (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getEvents())
          .thenAnswer((_) async => [tEventModel]);

      // act
      final result = await repository.getEvents();

      // assert
      expect(result, isA<List<EventEntity>>());
      expect(result.length, 1);
      expect(result.first.title, 'Show Rock');
      verify(() => mockRemoteDataSource.getEvents()).called(1);
    });

    test('getEvents should throw exception when datasource fails (negative case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getEvents())
          .thenThrow(ServerException('Server Error'));

      // act & assert
      expect(() => repository.getEvents(), throwsA(isA<ServerException>()));
    });

    test('saveEvent should call saveEvent on datasource (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.saveEvent(any()))
          .thenAnswer((_) async => {});

      // act
      await repository.saveEvent(tEventEntity);

      // assert
      verify(() => mockRemoteDataSource.saveEvent(any())).called(1);
    });

    test('deleteEvent should call deleteEvent on datasource (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.deleteEvent(any()))
          .thenAnswer((_) async => {});

      // act
      await repository.deleteEvent('1');

      // assert
      verify(() => mockRemoteDataSource.deleteEvent('1')).called(1);
    });
  });
}
