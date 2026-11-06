class BandEntity {
  final String id;
  final String name;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const BandEntity({
    required this.id,
    required this.name,
    this.createdAt,
    this.updatedAt,
  });
}
