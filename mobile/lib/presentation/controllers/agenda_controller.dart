import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/event_entity.dart';
import '../../../domain/interfaces/i_agenda_repository.dart';
import '../../../data/repositories/agenda_repository_impl.dart';
import 'auth_controller.dart';

// Providers para injeção do repositório de agenda
final agendaRepositoryProvider = Provider<IAgendaRepository>((ref) {
  return AgendaRepositoryImpl(ref.read(remoteDataSourceProvider));
});

// O Estado da nossa agenda é apenas a lista de eventos
class AgendaController extends Notifier<List<EventEntity>> {
  IAgendaRepository get _repository => ref.read(agendaRepositoryProvider);

  @override
  List<EventEntity> build() {
    // Carrega os eventos de forma assíncrona logo após a criação do Notifier
    Future.microtask(() => fetchEvents());
    return [];
  }

  Future<void> fetchEvents() async {
    try {
      final events = await _repository.getEvents();
      state = events;
    } catch (e) {
      // Trata erros de forma segura silenciosa ou setando estado, conforme a spec/plan
    }
  }

  Future<void> addOrUpdateEvent(EventEntity event) async {
    try {
      final savedEvent = await _repository.saveEvent(event);
      final index = state.indexWhere(
        (e) =>
            e.id == savedEvent.id ||
            (event.id.isNotEmpty && e.id == event.id),
      );
      if (index != -1) {
        state = [
          for (final e in state)
            if (e.id == savedEvent.id ||
                (event.id.isNotEmpty && e.id == event.id))
              savedEvent
            else
              e,
        ];
      } else {
        state = [...state, savedEvent];
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteEvent(String id) async {
    try {
      await _repository.deleteEvent(id);
      state = state.where((e) => e.id != id).toList();
    } catch (e) {
      // Trata erros de forma segura
    }
  }

  double get totalFee => state.fold(0.0, (sum, event) => sum + event.fee);

  int get monthlyShows {
    final now = DateTime.now();
    return state
        .where((e) => e.date.month == now.month && e.date.year == now.year)
        .length;
  }

  DateTime _startOfDay(DateTime d) => DateTime(d.year, d.month, d.day);

  List<EventEntity> get upcomingEvents {
    final today = _startOfDay(DateTime.now());
    return state.where((e) => !_startOfDay(e.date).isBefore(today)).toList()
      ..sort((a, b) => a.date.compareTo(b.date));
  }

  List<EventEntity> get pastEvents {
    final today = _startOfDay(DateTime.now());
    return state.where((e) => _startOfDay(e.date).isBefore(today)).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
  }
}

// O Provider que a UI vai escutar
final agendaProvider = NotifierProvider<AgendaController, List<EventEntity>>(
  () => AgendaController(),
);
