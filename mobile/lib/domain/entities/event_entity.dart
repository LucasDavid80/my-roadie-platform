// lib/domain/entities/event_entity.dart
class EventEntity {
  final String id;
  final String title;
  final String type;
  final DateTime date;
  final String startTime;
  final String endTime;
  final String location;
  final double fee;
  final String notes;

  const EventEntity({
    required this.id,
    required this.title,
    required this.type,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.location,
    required this.fee,
    this.notes = '',
  });
}
