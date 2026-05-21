import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:flutter/material.dart';

class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade300)),
      ),
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [_buildIcon(), const SizedBox(width: 16), _buildTitleText()],
      ),
    );
  }

  Widget _buildIcon() {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: AppColors.primary, // Usando a cor primária do tema
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: const Icon(Icons.music_note, size: 40, color: AppColors.textLight),
    );
  }

  Widget _buildTitleText() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Meu Perfil de Músico",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        Text(
          "Configure seu perfil profissional",
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
      ],
    );
  }
}
