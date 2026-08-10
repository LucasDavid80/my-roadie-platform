import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/presentation/screens/person/widgets/availability_widget.dart';
import 'package:agenda_musical/presentation/screens/person/widgets/info_widget.dart';
import 'package:agenda_musical/presentation/screens/person/widgets/multi_selection_widget.dart';
import 'package:agenda_musical/presentation/screens/person/widgets/photo_widget.dart';
import 'package:agenda_musical/presentation/screens/person/widgets/profile_header.dart';
import 'package:agenda_musical/presentation/widgets/my_roadie_app_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PersonScreen extends ConsumerStatefulWidget {
  const PersonScreen({super.key});

  @override
  ConsumerState<PersonScreen> createState() => _PersonScreenState();
}

class _PersonScreenState extends ConsumerState<PersonScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(userProvider.notifier).fetchProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProvider);
    final userNotifier = ref.read(userProvider.notifier);

    final List<String> instrumentos = [
      'Violão',
      'Guitarra',
      'Baixo',
      'Bateria',
      'Teclado',
      'Voz/Vocal',
    ];
    final List<String> estilos = ['MPB', 'Rock', 'Jazz', 'Samba', 'Sertanejo'];

    return Scaffold(
      appBar: const MyRoadieAppBar(selectedScreen: 'profile'),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const ProfileHeader(),
            const SizedBox(height: 16),
            const PhotoWidget(),
            const InfoWidget(),
            MultiSelectionWidget(
              title: 'Instrumentos *',
              options: instrumentos,
              selectedItems: user.instruments,
              onToggle: (item) =>
                  userNotifier.toggleInstrument(item),
            ),

            MultiSelectionWidget(
              title: 'Estilos Musicais *',
              options: estilos,
              selectedItems: user.styles,
              onToggle: (item) => userNotifier.toggleStyle(item),
            ),

            AvailabilityWidget(
              isAvailable: user.isAvailable,
              onChanged: (val) =>
                  userNotifier.updateAvailability(val ?? true),
            ),

            _buildSaveButton(context),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSaveButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          minimumSize: const Size(double.infinity, 54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        onPressed: () async {
          final result = await ref.read(userProvider.notifier).saveProfile();
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  result.isSuccess
                      ? 'Perfil salvo com sucesso!'
                      : (result.errorMessage ?? 'Erro ao salvar perfil. Tente novamente.'),
                ),
                backgroundColor:
                    result.isSuccess ? AppColors.primary : AppColors.erro,
              ),
            );
          }
        },
        icon: const Icon(Icons.save, color: Colors.white),
        label: const Text(
          "Salvar Perfil",
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
