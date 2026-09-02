import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitments_widget.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/custom_calendar.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/header_widget.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/infos_widget.dart';
import 'package:agenda_musical/presentation/widgets/my_roadie_app_bar.dart';
import 'package:agenda_musical/presentation/widgets/new_appointment_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 1. Mudamos para StatefulWidget para poder atualizar a lista
class PrincipalScreen extends ConsumerWidget {
  const PrincipalScreen({super.key});

  @override
  // O build agora recebe o 'WidgetRef ref' (que é o controle remoto do Riverpod)
  Widget build(BuildContext context, WidgetRef ref) {
    // 1. "Observa" a lista de eventos (se o controller mudar, aqui reconstrói)
    final events = ref.watch(agendaProvider);

    // 2. Pega os cálculos do controller
    final monthlyEvents = ref.read(agendaProvider.notifier).monthlyEvents;
    final monthlyFee = ref.read(agendaProvider.notifier).monthlyFee;
    final showsCount = ref.read(agendaProvider.notifier).monthlyShows;
    final upcomingEvents = ref.read(agendaProvider.notifier).upcomingEvents;

    // 3. Criamos uma função simples para os widgets filhos chamarem o controller
    Future<void> handleOnConfirm(newEvent) async {
      await ref.read(agendaProvider.notifier).addOrUpdateEvent(newEvent);
    }

    Future<void> handleOnDelete(String id) async {
      await ref.read(agendaProvider.notifier).deleteEvent(id);
    }

    return SafeArea(
      child: Scaffold(
        appBar: const MyRoadieAppBar(selectedScreen: 'calendar'),

        // 4. Botão Flutuante para Adicionar
        floatingActionButton: FloatingActionButton(
          key: const ValueKey('agenda_add_button'),
          backgroundColor: AppColors.primary, // Laranja
          child: const Icon(
            Icons.add,
            color: AppColors.textLight,
          ), // Ícone branco
          onPressed: () {
            showDialog(
              context: context,
              builder: (context) => Dialog(
                backgroundColor: Colors.transparent,
                insetPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 24,
                ),
                child: NewAppointmentWidget(
                  onConfirm: (newEvent) async {
                    // Aqui a mágica acontece: avisamos o motor para adicionar o evento
                    await ref
                        .read(agendaProvider.notifier)
                        .addOrUpdateEvent(newEvent);
                  },
                ),
              ),
            );
          },
        ),

        body: SingleChildScrollView(
          child: Column(
            spacing: 8,
            children: [
              Container(
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey.shade300, width: 1.0),
                  ),
                ),
                child: const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: HeaderWidget(),
                ),
              ),

              // Os Widgets agora recebem os dados atualizados automaticamente
              InfosWidget(
                compromissosTotal: monthlyEvents.length,
                proximos: upcomingEvents.length,
                shows: showsCount,
                faturamento: monthlyFee,
              ),

              CustomCalendar(events: events), // <-- Passando a lista observada

              CommitmentsWidget(
                commitments: upcomingEvents, // <-- Passando a lista de próximos compromissos
                onConfirm:
                    handleOnConfirm, // <-- Passando a função do controller
                onDelete: handleOnDelete,
              ),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }
}
