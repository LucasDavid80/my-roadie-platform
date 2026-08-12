// lib/data/models/user_model.dart
import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  UserModel({
    required super.id,
    super.name,
    super.experience,
    super.phone,
    super.instagram,
    super.city,
    super.federativeUnit,
    super.minCache,
    super.youtubeLink,
    super.bio,
    super.instruments,
    super.styles,
    super.isAvailable,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    List<String> parseStringList(dynamic value) {
      if (value == null) return const [];
      if (value is List) {
        return value
            .map((e) => e?.toString() ?? '')
            .where((s) => s.isNotEmpty)
            .toList();
      }
      return const [];
    }

    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      experience: json['experience']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      instagram: json['instagram']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      federativeUnit: json['federativeUnit']?.toString() ?? '',
      minCache: parseDouble(json['minCache']),
      youtubeLink: json['youtubeLink']?.toString() ?? '',
      bio: json['bio']?.toString() ?? '',
      instruments: parseStringList(json['instruments']),
      styles: parseStringList(json['styles']),
      isAvailable: json['isAvailable'] is bool
          ? json['isAvailable'] as bool
          : true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'experience': experience,
      'phone': phone,
      'instagram': instagram,
      'city': city,
      'federativeUnit': federativeUnit,
      'minCache': minCache,
      'youtubeLink': youtubeLink,
      'bio': bio,
      'instruments': instruments,
      'styles': styles,
      'isAvailable': isAvailable,
    };
  }
}
