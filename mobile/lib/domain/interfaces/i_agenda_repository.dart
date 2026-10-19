// lib/domain/interfaces/i_agenda_repository.dart
import '../entities/event_entity.dart';

abstract class IAgendaRepository {
  Future<List<EventEntity>> getEvents([String? bandId]);
  Future<EventEntity> saveEvent(EventEntity event, [String? activeBandId]);
  Future<void> deleteEvent(String id);
}
