import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitment_card.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CommitmentsWidget extends StatelessWidget {
  // Pode mudar para StatelessWidget!
  final List<EventEntity> commitments;
  final Future<void> Function(EventEntity) onConfirm;
  final Future<void> Function(String id) onDelete;

  const CommitmentsWidget({
    super.key,
    required this.commitments,
    required this.onConfirm,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    // Ordenação (Boa prática: fazer uma cópia antes de ordenar para não mutar a original)
    final sortedCommitments = [...commitments]
      ..sort((a, b) => a.date.compareTo(b.date));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Cabeçalho da Seção
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            children: [
              Icon(
                Icons.calendar_month_outlined,
                size: 28,
                color: AppColors.primary, // Usando a cor primária do tema
              ),
              SizedBox(width: 8),
              Text(
                "Próximos Compromissos",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (commitments.isEmpty)
          const Padding(
            padding: EdgeInsets.all(32.0),
            child: Center(
              child: Text(
                'Nenhum compromisso para este dia.',
                style: TextStyle(color: Colors.grey),
              ),
            ),
          ),

        // Lista de Cards
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: sortedCommitments.length,
          itemBuilder: (context, index) {
            final commitment = sortedCommitments[index];
            bool showHeader =
                index == 0 ||
                commitment.date != sortedCommitments[index - 1].date;

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (showHeader) _buildDateHeader(commitment.date),
                  CommitmentCard(
                    event: commitment,
                    onConfirm: onConfirm,
                    onDelete: onDelete,
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // O método que faltava para o seu código compilar
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
