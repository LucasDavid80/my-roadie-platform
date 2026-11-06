// lib/data/repositories/agenda_repository_impl.dart
import '../../domain/entities/event_entity.dart';
import '../../domain/interfaces/i_agenda_repository.dart';
import '../../domain/models/event_model.dart';
import '../datasources/remote_datasource.dart';

class AgendaRepositoryImpl implements IAgendaRepository {
  final RemoteDataSource remoteDataSource;

  AgendaRepositoryImpl(this.remoteDataSource);

  @override
  Future<List<EventEntity>> getEvents([String? bandId]) async {
    return remoteDataSource.getEvents(bandId);
  }

  @override
  Future<EventEntity> saveEvent(
    EventEntity event, [
    String? activeBandId,
  ]) async {
    final model = EventModel(
      id: event.id,
      title: event.title,
      type: event.type,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      timezone: event.timezone,
      location: event.location,
      fee: event.fee,
      notes: event.notes,
      bandId: event.bandId ?? activeBandId,
    );
    final savedModel = await remoteDataSource.saveEvent(model);
    return savedModel ?? event;
  }

  @override
  Future<void> deleteEvent(String id) async {
    await remoteDataSource.deleteEvent(id);
  }
}
