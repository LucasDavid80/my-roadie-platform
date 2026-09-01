import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MyRoadieAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String selectedScreen;

  const MyRoadieAppBar({
    super.key,
    this.selectedScreen = '', // Valores esperados: 'calendar', 'profile', etc.
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor:
          AppColors.background, // Branco para manter o visual limpo
      elevation: 0, // Remove a sombra padrão para ficar flat e limpo
      centerTitle: false,

      // Ajuste do Logo para não ficar distorcido
      leadingWidth: 70,
      leading: Padding(
        padding: const EdgeInsets.only(left: 16.0, top: 8, bottom: 8),
        child: Image.asset(
          'assets/images/logo.png',
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) => const Icon(
            Icons.music_note,
            color: AppColors.primary,
            size: 32,
          ),
        ),
      ),

      title: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          // 1. Ícone Calendário (Home)
          IconButton(
            key: const ValueKey('calendar_appbar_button'),
            icon: const Icon(Icons.calendar_today),
            // Lógica ternária: Se for 'calendar' usa laranja, senão usa azul escuro
            color: selectedScreen == 'calendar'
                ? AppColors.primary
                : AppColors.secondary,
            tooltip: 'Agenda',
            onPressed: () {
              // Use context.go('/') para "trocar" de aba raiz, em vez de empilhar
              if (selectedScreen != 'calendar') context.go('/');
            },
          ),

          const SizedBox(width: 4),

          // 2. Ícone Perfil
          IconButton(
            key: const ValueKey('profile_appbar_button'),
            icon: const Icon(Icons.person),
            color: selectedScreen == 'profile'
                ? AppColors.primary
                : AppColors.secondary,
            tooltip: 'Meu Perfil',
            onPressed: () {
              // Use push se quiser que tenha botão de voltar, ou go se for uma aba fixa
              if (selectedScreen != 'profile') context.push('/profile');
            },
          ),

          const SizedBox(width: 8),

          // 3. Divisor
          SizedBox(
            height: 24, // Altura controlada do divisor
            child: VerticalDivider(color: Colors.grey.shade300, thickness: 1),
          ),

          const SizedBox(width: 8),

          // 4. Ícone Logout
          IconButton(
            icon: const Icon(Icons.logout),
            color:
                AppColors.secondary, // Logout geralmente não fica "selecionado"
            tooltip: 'Sair',
            onPressed: () {
              // context.go('/login') limpa o histórico de navegação
              context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}
