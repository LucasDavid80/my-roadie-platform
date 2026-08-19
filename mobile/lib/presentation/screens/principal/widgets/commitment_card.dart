import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/presentation/widgets/new_appointment_widget.dart';
import 'package:flutter/material.dart';

class CommitmentCard extends StatelessWidget {
  final EventEntity event;
  final Future<void> Function(EventEntity) onConfirm;
  final Future<void> Function(String id)? onDelete;

  const CommitmentCard({
    super.key,
    required this.event,
    required this.onConfirm,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      margin: const EdgeInsets.only(bottom: 12.0),
      decoration: BoxDecoration(
        color: AppColors.lightBackground,
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(color: AppColors.primary, width: 1.0),
        // Deixando a borda esquerda mais grossa como destaque
        borderRadius: BorderRadius.circular(16),
      ),
      child: IntrinsicHeight(
        // Garante que a borda lateral ocupe a altura toda
        child: Row(
          children: [
            // Destaque lateral laranja
            Container(
              width: 6,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 12),
            // Conteúdo principal
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(context),
                  const SizedBox(height: 12),
                  Text(
                    event.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildInfoRow(
                    Icons.schedule,
                    "${event.startTime} - ${event.endTime}",
                  ),
                  _buildInfoRow(Icons.location_on_outlined, event.location),
                  _buildInfoRow(
                    Icons.attach_money,
                    "R\$ ${event.fee.toStringAsFixed(2)}",
                    textColor: Colors.teal,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.queue_music, size: 20, color: Colors.purple),
        const SizedBox(width: 8),
        _TypeTag(label: event.type),
        const Spacer(),
        IconButton(
          icon: const Icon(Icons.edit_outlined, color: Colors.blueGrey),
          onPressed: () => _openEditModal(context),
        ),
        IconButton(
          icon: const Icon(Icons.delete_outline, color: Colors.blueGrey),
          onPressed: () => _confirmDelete(context),
        ),
      ],
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Excluir Compromisso'),
        content: const Text(
          'Tem certeza de que deseja excluir este compromisso? Esta ação não pode ser desfeita.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(dialogContext).pop();
              if (onDelete != null) {
                try {
                  await onDelete!(event.id);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Compromisso excluído com sucesso!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Erro ao excluir compromisso: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
  }

  void _openEditModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: NewAppointmentWidget(
          event: event,
          onConfirm: (edited) => onConfirm(edited),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    IconData icon,
    String text, {
    Color textColor = Colors.grey,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              color: textColor,
              fontSize: 14,
              fontWeight: textColor == Colors.teal
                  ? FontWeight.bold
                  : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}

// Sub-widget privado para manter o código limpo
class _TypeTag extends StatelessWidget {
  final String label;
  const _TypeTag({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary, // Usando a cor primária do tema
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: AppColors.textLight,
        ),
      ),
    );
  }
}
