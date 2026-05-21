import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFf59e0b); // Laranja base
  static const Color primaryDark = Color(0xFFD97706); // Laranja mais escuro

  // Cores Secundárias e Profundidade
  static const Color secondary = Color(0xFF2c3e50); // Azul Escuro
  static const Color black = Color(0xFF000000);
  static const Color erro = Colors.red;

  static const Color background = Colors.white;
  static const Color lightBackground = Color(0xFFFFFBEB); // Um creme suave
  static const Color inputBorder = Color(0xFFE0E0E0);

  static const Color textDark = Colors.black;
  static const Color textLight = Colors.white;
  static const Color textGrey = Colors.grey;

  // Cores para Cards e Destaques
  static const Color cardBlue = Color(0xFF3B82F6); // Para Info / Edição
  static const Color cardGreen = Color(
    0xFF10B981,
  ); // Para Sucesso / Disponibilidade
  static const Color cardPurple = Color(
    0xFF8B5CF6,
  ); // Para Categorias / Estilos

  // Degradês pré-definidos para facilitar o uso na UI
  static const List<Color> primaryGradient = [primary, primaryDark];

  static const List<Color> depthGradient = [secondary, black];
}
