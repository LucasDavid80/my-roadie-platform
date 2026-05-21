import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:flutter/material.dart';

class AvailabilityWidget extends StatelessWidget {
  final bool isAvailable;
  final ValueChanged<bool?> onChanged;

  const AvailabilityWidget({
    super.key,
    required this.isAvailable,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Disponibilidade',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Checkbox(
                value: isAvailable,
                onChanged: onChanged,
                activeColor: AppColors.primary,
              ),
              const Expanded(
                child: Text(
                  'Estou disponível para contratação',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
