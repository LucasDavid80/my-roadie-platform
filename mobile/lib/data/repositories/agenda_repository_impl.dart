// lib/data/repositories/agenda_repository_impl.dart
import '../../domain/entities/event_entity.dart';
import '../../domain/interfaces/i_agenda_repository.dart';
import '../../domain/models/event_model.dart';
import '../datasources/remote_datasource.dart';

class AgendaRepositoryImpl implements IAgendaRepository {
  final RemoteDataSource remoteDataSource;

  AgendaRepositoryImpl(this.remoteDataSource);

  @override
  Future<List<EventEntity>> getEvents() async {
    return await remoteDataSource.getEvents();
  }

  @override
  Future<void> saveEvent(EventEntity event) async {
    final model = EventModel(
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      fee: event.fee,
      notes: event.notes,
    );
    await remoteDataSource.saveEvent(model);
  }

  @override
  Future<void> deleteEvent(String id) async {
    await remoteDataSource.deleteEvent(id);
  }
}
