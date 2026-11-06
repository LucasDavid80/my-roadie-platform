import '../../domain/entities/band_entity.dart';

class BandModel extends BandEntity {
  const BandModel({
    required super.id,
    required super.name,
    super.createdAt,
    super.updatedAt,
  });

  factory BandModel.fromJson(Map<String, dynamic> json) {
    return BandModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    return DateTime.tryParse(value.toString());
  }
}
