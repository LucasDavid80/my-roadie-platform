import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:flutter/material.dart';

class InfosWidget extends StatelessWidget {
  final int compromissosTotal, compromissosConcluidos, shows;
  final double faturamento;

  const InfosWidget({
    super.key,
    required this.compromissosTotal,
    required this.compromissosConcluidos,
    required this.shows,
    required this.faturamento,
  });

  @override
  Widget build(BuildContext context) {
    int proximosCompromissos = compromissosTotal - compromissosConcluidos;
    return Column(
      spacing: 16.0,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: 8.0,
          children: [
            infoCard(
              "Este Mês",
              compromissosTotal.toString(),
              Icons.event,
              AppColors.cardBlue,
            ),
            infoCard(
              "Próximos",
              proximosCompromissos.toString(),
              Icons.check_circle,
              AppColors.cardGreen,
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: 8.0,
          children: [
            infoCard(
              "Shows/Mês",
              shows.toString(),
              Icons.music_note,
              AppColors.primary, // Usando a cor primária do tema
            ),
            infoCard(
              "Cachê/Mês",
              faturamento.toString(),
              Icons.attach_money,
              AppColors.cardPurple,
            ),
          ],
        ),
      ],
    );
  }
}

Widget infoCard(String title, String description, IconData icon, Color color) {
  return Card(
    // 1. Força o fundo a ser Branco
    color: AppColors.background, // Usando a cor de fundo do tema
    // 2. Remove a "sujeira" (tint) cinza/azulada causada pela sombra no Material 3
    surfaceTintColor: AppColors.textLight,

    elevation: 2, // Opcional: controla o tamanho da sombra
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ), // Opcional: arredondamento

    child: Container(
      width: 180,
      padding: EdgeInsets.all(8),
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 24, color: color),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.grey,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          description,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
      ),
    ),
  );
}
