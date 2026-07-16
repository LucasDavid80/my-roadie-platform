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
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      experience: json['experience'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      instagram: json['instagram'] as String? ?? '',
      city: json['city'] as String? ?? '',
      federativeUnit: json['federativeUnit'] as String? ?? '',
      minCache: (json['minCache'] as num?)?.toDouble() ?? 0.0,
      youtubeLink: json['youtubeLink'] as String? ?? '',
      bio: json['bio'] as String? ?? '',
      instruments: (json['instruments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      styles: (json['styles'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      isAvailable: json['isAvailable'] as bool? ?? true,
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
