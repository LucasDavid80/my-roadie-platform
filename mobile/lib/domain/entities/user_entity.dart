class UserEntity {
  final String id;
  final String name;
  final String experience;
  final String phone;
  final String instagram;
  final String city;
  final String federativeUnit;
  final double minCache;
  final String youtubeLink;
  final String bio;
  final List<String> instruments;
  final List<String> styles;
  final bool isAvailable;

  UserEntity({
    required this.id,
    this.name = '',
    this.experience = '',
    this.phone = '',
    this.instagram = '',
    this.city = '',
    this.federativeUnit = '',
    this.minCache = 0.0,
    this.youtubeLink = '',
    this.bio = '',
    this.instruments = const [],
    this.styles = const [],
    this.isAvailable = true,
  });

  UserEntity copyWith({
    String? name,
    String? experience,
    String? phone,
    String? instagram,
    String? city,
    String? federativeUnit,
    double? minCache,
    String? youtubeLink,
    String? bio,
    List<String>? instruments,
    List<String>? styles,
    bool? isAvailable,
  }) {
    return UserEntity(
      id: id,
      name: name ?? this.name,
      experience: experience ?? this.experience,
      phone: phone ?? this.phone,
      instagram: instagram ?? this.instagram,
      city: city ?? this.city,
      federativeUnit: federativeUnit ?? this.federativeUnit,
      minCache: minCache ?? this.minCache,
      youtubeLink: youtubeLink ?? this.youtubeLink,
      bio: bio ?? this.bio,
      instruments: instruments ?? this.instruments,
      styles: styles ?? this.styles,
      isAvailable: isAvailable ?? this.isAvailable,
    );
  }
}
