import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/presentation/screens/auth/widgets/login_form.dart';
import 'package:agenda_musical/presentation/screens/auth/widgets/signup_bottom_sheet.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool animLogo = false;
  bool animForm = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 500)).then((_) {
      setState(() {
        animLogo = true;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    // Altura total da tela
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          // AQUI ESTÁ A MÁGICA DO DEGRADÊ
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: AppColors.primaryGradient,
          ),
        ),
        child: SingleChildScrollView(
          child: SizedBox(
            height: height,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // --- 1. O LOGO ANIMADO ---
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeInOutBack,
                  // Se a animação rolou, o logo sobe. Se não, fica no meio.
                  top: animForm ? height * 0.12 : height * 0.35,
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        animForm =
                            !animForm; // Clique no logo para alternar (efeito legal)
                      });
                    },
                    child: Column(
                      children: [
                        Hero(
                          tag: 'logo',
                          child: Container(
                            height: 120,
                            width: 120,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.4),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Container(
                              // Padding externo se precisar separar de outros widgets
                              // margin: EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors
                                    .background, // Cor de fundo do "card"
                                borderRadius: BorderRadius.circular(
                                  12,
                                ), // Arredondamento
                                // AQUI ESTÁ A MÁGICA DA SOMBRA SUAVE:
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(
                                      0.5,
                                    ), // Preto muito transparente (fica um cinza suave)
                                    spreadRadius:
                                        1, // O quanto a sombra "espalha" para os lados
                                    blurRadius:
                                        15, // O quão "borrada" ela é. Quanto maior, mais suave.
                                    offset: const Offset(
                                      0,
                                      4,
                                    ), // Deslocamento (X, Y). Um pouco para baixo.
                                  ),
                                ],
                              ),
                              // O conteúdo do card
                              child: Image.asset(
                                'assets/images/logo.png',
                                fit: BoxFit.contain,
                                // height: 100,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        AnimatedOpacity(
                          duration: const Duration(milliseconds: 500),
                          opacity: animForm
                              ? 0
                              : 1, // Some o texto quando o form abre
                          child: const Text(
                            "MyRoadie",
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondary,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // --- 2. TEXTO "CLIQUE PARA COMEÇAR" ---
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 800),
                  bottom: animForm
                      ? -100
                      : height * 0.15, // Sai da tela se o form abrir
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 800),
                    opacity: (!animLogo || animForm) ? 0 : 1,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          animForm = true;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.secondary,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: const Text(
                          'Toque para entrar',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.background,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // --- 3. O FORMULÁRIO QUE SOBE ---
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeInOutCubic,
                  bottom: animForm
                      ? 0
                      : -height * 0.6, // Fica escondido embaixo
                  left: 0,
                  right: 0,
                  child: Container(
                    height: height * 0.6, // Ocupa 60% da tela
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 32,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(40),
                        topRight: Radius.circular(40),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 30,
                          offset: const Offset(0, -10),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Bem-vindo de volta!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.secondary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 32),

                        const LoginForm(), // Widget do formulário

                        const Spacer(),

                        // Link para Cadastro (Abre o BottomSheet)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text("Ainda não tem conta? "),
                            GestureDetector(
                              onTap: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled:
                                      true, // Importante para tela cheia
                                  backgroundColor: Colors.transparent,
                                  builder: (context) =>
                                      const SignupBottomSheet(),
                                );
                              },
                              child: const Text(
                                "Cadastre-se",
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
