// lib/domain/entities/event_entity.dart
class EventEntity {
  final String id;
  final String title;
  final String type;
  final DateTime startsAt;
  final DateTime? endsAt;
  final String timezone;
  final String location;
  final double fee;
  final String notes;
  final String? bandId;

  const EventEntity({
    required this.id,
    required this.title,
    required this.type,
    required this.startsAt,
    this.endsAt,
    required this.timezone,
    required this.location,
    required this.fee,
    this.notes = '',
    this.bandId,
  });
}
