import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/core/constants/app_strings.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/presentation/widgets/custom_text_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class InfoWidget extends ConsumerWidget {
  const InfoWidget({super.key});

  @override
  // Adicionamos o WidgetRef ref para "conversar" com os providers
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05), // Sombra mais suave
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, // Alinha tudo à esquerda
        mainAxisSize: MainAxisSize.min,
        children: [
          // Título da Seção
          const Text(
            AppStrings.tituloSecao,
            style: TextStyle(
              color: Colors.black87,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24.0),

          // Campos do formulário usando o método auxiliar
          CustomTextField(
            label: AppStrings.labelArtistName,
            hint: AppStrings.hintArtistName,
            isRequired: true,
            onChanged: (val) => ref.read(userProvider.notifier).updateName(val),
          ),

          CustomTextField(
            label: AppStrings.labelExperience,
            hint: AppStrings.hintExperience,
            keyboardType: TextInputType.number,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateExperience(val),
          ),

          CustomTextField(
            label: AppStrings.labelPhone,
            hint: AppStrings.hintPhone,
            keyboardType: TextInputType.phone,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updatePhone(val),
          ),

          CustomTextField(
            label: AppStrings.labelInstagram,
            hint: AppStrings.hintInstagram,
            keyboardType: TextInputType.url,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateInstagram(val),
          ),

          CustomTextField(
            label: AppStrings.labelCity,
            hint: AppStrings.hintCity,
            onChanged: (val) => ref.read(userProvider.notifier).updateCity(val),
          ),

          CustomTextField(
            label: AppStrings.labelState,
            hint: AppStrings.hintState,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateFederativeUnit(val),
          ),

          CustomTextField(
            label: AppStrings.labelMinimumFee,
            hint: AppStrings.hintMinimumFee,
            keyboardType: TextInputType.number,
            onChanged: (val) => ref
                .read(userProvider.notifier)
                .updateMinimumFee(double.tryParse(val) ?? 0.0),
          ),

          CustomTextField(
            label: AppStrings.labelVideoLink,
            hint: AppStrings.hintVideoLink,
            keyboardType: TextInputType.url,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateVideoLink(val),
          ),

          CustomTextField(
            label: AppStrings.labelBio,
            hint: AppStrings.hintBio,
            maxLines: 4, // Caixa maior para biografia
            onChanged: (val) => ref.read(userProvider.notifier).updateBio(val),
          ),
        ],
      ),
    );
  }
}
