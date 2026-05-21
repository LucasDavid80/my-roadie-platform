import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SignupBottomSheet extends StatelessWidget {
  const SignupBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    // Pega altura do teclado para o modal subir junto
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, bottomPadding + 24),
      decoration: const BoxDecoration(
        color: AppColors.background, // Cor de fundo do modal
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // "Puxador" do modal
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Crie sua conta',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.secondary,
              ),
            ),
            const Text(
              'Junte-se ao MyRoadie hoje!',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),

            // Campos de Cadastro (Simplificado)
            _buildInput('Nome Completo', Icons.person_outline),
            const SizedBox(height: 16),
            _buildInput('E-mail', Icons.email_outlined),
            const SizedBox(height: 16),
            _buildInput('Senha', Icons.lock_outline, isPassword: true),
            const SizedBox(height: 16),
            _buildInput(
              'Confirmar Senha',
              Icons.lock_outline,
              isPassword: true,
            ),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      AppColors.secondary, // Botão azul para diferenciar
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  // Lógica de cadastro aqui
                  context.pop(); // Fecha o modal
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Cadastro realizado com sucesso!'),
                    ),
                  );
                },
                child: const Text(
                  'CADASTRAR',
                  style: TextStyle(
                    color: AppColors.textLight,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInput(String label, IconData icon, {bool isPassword = false}) {
    return TextField(
      obscureText: isPassword,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: Colors.grey[50],
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
      ),
    );
  }
}
