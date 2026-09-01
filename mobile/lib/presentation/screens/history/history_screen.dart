import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Observa o provider da agenda para reconstruir quando houver alterações
    ref.watch(agendaProvider);
    // Consome os eventos passados ordenados do controller
    final pastEvents = ref.read(agendaProvider.notifier).pastEvents;

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
              // pastEvents disponível para renderização e estado vazio (T2.2 / T2.3)
              if (pastEvents.isEmpty)
                const SizedBox.shrink()
              else
                const SizedBox.shrink(),
            ],
          ),
        ),
      ),
    );
  }
}
