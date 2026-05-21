import 'package:agenda_musical/presentation/screens/auth/login_page.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

// Importe suas telas aqui
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:agenda_musical/presentation/screens/person/person_screen.dart';

final GoRouter router = GoRouter(
  initialLocation: '/login', // <--- Mude para começar no login
  routes: <RouteBase>[
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
    GoRoute(
      path: '/',
      name: 'home',
      builder: (BuildContext context, GoRouterState state) {
        return const PrincipalScreen(); // Sua tela inicial
      },
      routes: [
        // Rota do Perfil (Aninhada ou separada, aqui vou deixar aninhada para facilitar o "voltar")
        GoRoute(
          path: 'profile', // Note que não tem "/" antes quando é sub-rota
          name: 'profile',
          builder: (BuildContext context, GoRouterState state) {
            return const PersonScreen();
          },
        ),
      ],
    ),
  ],
);
