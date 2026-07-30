// lib/domain/interfaces/i_agenda_repository.dart
import '../entities/event_entity.dart';

abstract class IAgendaRepository {
  Future<List<EventEntity>> getEvents();
  Future<EventEntity> saveEvent(EventEntity event);
  Future<void> deleteEvent(String id);
}
