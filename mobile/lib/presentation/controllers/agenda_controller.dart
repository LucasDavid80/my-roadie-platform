import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/event_entity.dart';

// O Estado da nossa agenda é apenas a lista de eventos
class AgendaController extends Notifier<List<EventEntity>> {
  @override
  List<EventEntity> build() {
    return []; // Começa vazio, ou com dados do repositório no futuro
  }

  void addOrUpdateEvent(EventEntity event) {
    final index = state.indexWhere((e) => e.id == event.id);
    if (index != -1) {
      // Edição: Criamos uma nova lista (imutabilidade!)
      state = [
        for (final e in state)
          if (e.id == event.id) event else e,
      ];
    } else {
      // Novo: Adiciona à lista
      state = [...state, event];
    }
  }

  // Lógica de negócio que estava na Screen vem pra cá
  double get totalFee => state.fold(0.0, (sum, event) => sum + event.fee);

  int get monthlyShows {
    final now = DateTime.now();
    return state
        .where((e) => e.date.month == now.month && e.date.year == now.year)
        .length;
  }
}

// O Provider que a UI vai escutar
final agendaProvider = NotifierProvider<AgendaController, List<EventEntity>>(
  () => AgendaController(),
);
