import 'package:agenda_musical/data/models/band_model.dart';
import 'package:agenda_musical/domain/entities/band_entity.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('BandModel', () {
    test('should parse all fields from json (positive case)', () {
      // arrange
      final json = {
        'id': 'band-1',
        'name': 'Banda Aurora',
        'createdAt': '2026-10-01T10:00:00.000Z',
        'updatedAt': '2026-10-02T11:30:00.000Z',
      };

      // act
      final model = BandModel.fromJson(json);

      // assert
      expect(model, isA<BandEntity>());
      expect(model.id, 'band-1');
      expect(model.name, 'Banda Aurora');
      expect(model.createdAt, DateTime.parse('2026-10-01T10:00:00.000Z'));
      expect(model.updatedAt, DateTime.parse('2026-10-02T11:30:00.000Z'));
    });

    test('should fall back to empty strings and null dates when fields are missing (edge case)', () {
      // act
      final model = BandModel.fromJson({});

      // assert
      expect(model.id, '');
      expect(model.name, '');
      expect(model.createdAt, isNull);
      expect(model.updatedAt, isNull);
    });

    test('should convert ids to string and ignore invalid dates (edge case)', () {
      // arrange
      final json = {
        'id': 42,
        'name': 'Banda Eclipse',
        'createdAt': 'not-a-date',
        'updatedAt': 123,
      };

      // act
      final model = BandModel.fromJson(json);

      // assert
      expect(model.id, '42');
      expect(model.name, 'Banda Eclipse');
      expect(model.createdAt, isNull);
      expect(model.updatedAt, isNull);
    });
  });
}
