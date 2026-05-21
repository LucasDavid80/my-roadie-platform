import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:flutter/material.dart';

class PhotoWidget extends StatelessWidget {
  const PhotoWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        color: AppColors.background,
        boxShadow: [
          BoxShadow(
            color: AppColors.textGrey.withValues(alpha: 0.05),
            spreadRadius: 2,
            blurRadius: 5,
            offset: Offset(0, 3),
          ),
        ],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            alignment: Alignment.centerLeft,
            child: Text(
              'Foto de Perfil',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black, fontSize: 24),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: 24.0,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.rectangle,
                  border: Border.all(color: AppColors.primary, width: 2),
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
                child: Icon(
                  Icons.music_note,
                  size: 60,
                  color: AppColors.background,
                ),
              ),
              Column(
                children: [
                  ElevatedButton(
                    onPressed: () {
                      // Ação para alterar a foto
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.upload, color: AppColors.background),
                        Text(
                          "Enviar Foto",
                          style: TextStyle(color: AppColors.background),
                        ),
                      ],
                    ),
                  ),
                  Text('Recomendado: 400x400px'),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
