import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitment_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Observa o provider da agenda para reconstruir quando houver alterações
    ref.watch(agendaProvider);
    // Consome os eventos passados ordenados do controller
    final pastEvents = ref.read(agendaProvider.notifier).pastEvents;

    Future<void> handleOnConfirm(EventEntity newEvent) async {
      await ref.read(agendaProvider.notifier).addOrUpdateEvent(newEvent);
    }

    Future<void> handleOnDelete(String id) async {
      await ref.read(agendaProvider.notifier).deleteEvent(id);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Histórico de Compromissos'),
        backgroundColor: AppColors.background,
        iconTheme: const IconThemeData(color: AppColors.secondary),
        titleTextStyle: const TextStyle(
          color: AppColors.secondary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: pastEvents.length,
                itemBuilder: (context, index) {
                  final commitment = pastEvents[index];
                  final bool showHeader = index == 0 ||
                      !_isSameDay(commitment.date, pastEvents[index - 1].date);

                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (showHeader) _buildDateHeader(commitment.date),
                        CommitmentCard(
                          event: commitment,
                          onConfirm: handleOnConfirm,
                          onDelete: handleOnDelete,
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Widget _buildDateHeader(DateTime date) {
    String formatted = DateFormat("EEEE, d 'de' MMMM", 'pt_BR').format(date);
    formatted = formatted[0].toUpperCase() + formatted.substring(1);

    return Padding(
      padding: const EdgeInsets.only(top: 16.0, bottom: 8.0),
      child: Text(
        formatted,
        style: TextStyle(
          color: Colors.grey[600],
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
    );
  }
}
