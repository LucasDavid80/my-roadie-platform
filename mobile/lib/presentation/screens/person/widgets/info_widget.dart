import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/core/constants/app_strings.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/presentation/widgets/custom_text_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class InfoWidget extends ConsumerStatefulWidget {
  const InfoWidget({super.key});

  @override
  ConsumerState<InfoWidget> createState() => _InfoWidgetState();
}

class _InfoWidgetState extends ConsumerState<InfoWidget> {
  late final TextEditingController _nameController;
  late final TextEditingController _experienceController;
  late final TextEditingController _phoneController;
  late final TextEditingController _instagramController;
  late final TextEditingController _cityController;
  late final TextEditingController _stateController;
  late final TextEditingController _minCacheController;
  late final TextEditingController _youtubeLinkController;
  late final TextEditingController _bioController;

  @override
  void initState() {
    super.initState();
    final user = ref.read(userProvider);
    _nameController = TextEditingController(text: user.name);
    _experienceController = TextEditingController(text: user.experience);
    _phoneController = TextEditingController(text: user.phone);
    _instagramController = TextEditingController(text: user.instagram);
    _cityController = TextEditingController(text: user.city);
    _stateController = TextEditingController(text: user.federativeUnit);
    _minCacheController =
        TextEditingController(text: _formatMinCache(user.minCache));
    _youtubeLinkController = TextEditingController(text: user.youtubeLink);
    _bioController = TextEditingController(text: user.bio);
  }

  String _formatMinCache(double minCache) {
    if (minCache <= 0) return '';
    return minCache % 1 == 0 ? minCache.toInt().toString() : minCache.toString();
  }

  void _syncControllersWithUser(UserEntity user) {
    if (_nameController.text != user.name) {
      _nameController.text = user.name;
    }
    if (_experienceController.text != user.experience) {
      _experienceController.text = user.experience;
    }
    if (_phoneController.text != user.phone) {
      _phoneController.text = user.phone;
    }
    if (_instagramController.text != user.instagram) {
      _instagramController.text = user.instagram;
    }
    if (_cityController.text != user.city) {
      _cityController.text = user.city;
    }
    if (_stateController.text != user.federativeUnit) {
      _stateController.text = user.federativeUnit;
    }
    final formattedCache = _formatMinCache(user.minCache);
    if (_minCacheController.text != formattedCache) {
      _minCacheController.text = formattedCache;
    }
    if (_youtubeLinkController.text != user.youtubeLink) {
      _youtubeLinkController.text = user.youtubeLink;
    }
    if (_bioController.text != user.bio) {
      _bioController.text = user.bio;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _experienceController.dispose();
    _phoneController.dispose();
    _instagramController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _minCacheController.dispose();
    _youtubeLinkController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<UserEntity>(userProvider, (previous, next) {
      if (previous?.id != next.id ||
          (previous?.name.isEmpty == true && next.name.isNotEmpty)) {
        _syncControllersWithUser(next);
      }
    });

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withValues(alpha: 0.05),
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            AppStrings.tituloSecao,
            style: TextStyle(
              color: Colors.black87,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24.0),

          CustomTextField(
            label: AppStrings.labelArtistName,
            hint: AppStrings.hintArtistName,
            controller: _nameController,
            isRequired: true,
            onChanged: (val) => ref.read(userProvider.notifier).updateName(val),
          ),

          CustomTextField(
            label: AppStrings.labelExperience,
            hint: AppStrings.hintExperience,
            controller: _experienceController,
            keyboardType: TextInputType.number,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateExperience(val),
          ),

          CustomTextField(
            label: AppStrings.labelPhone,
            hint: AppStrings.hintPhone,
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updatePhone(val),
          ),

          CustomTextField(
            label: AppStrings.labelInstagram,
            hint: AppStrings.hintInstagram,
            controller: _instagramController,
            keyboardType: TextInputType.url,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateInstagram(val),
          ),

          CustomTextField(
            label: AppStrings.labelCity,
            hint: AppStrings.hintCity,
            controller: _cityController,
            onChanged: (val) => ref.read(userProvider.notifier).updateCity(val),
          ),

          CustomTextField(
            label: AppStrings.labelState,
            hint: AppStrings.hintState,
            controller: _stateController,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateFederativeUnit(val),
          ),

          CustomTextField(
            label: AppStrings.labelMinimumFee,
            hint: AppStrings.hintMinimumFee,
            controller: _minCacheController,
            keyboardType: TextInputType.number,
            onChanged: (val) {
              final cleaned = val.replaceAll(',', '.').trim();
              final parsed = double.tryParse(cleaned) ?? 0.0;
              ref.read(userProvider.notifier).updateMinimumFee(parsed);
            },
          ),

          CustomTextField(
            label: AppStrings.labelVideoLink,
            hint: AppStrings.hintVideoLink,
            controller: _youtubeLinkController,
            keyboardType: TextInputType.url,
            onChanged: (val) =>
                ref.read(userProvider.notifier).updateVideoLink(val),
          ),

          CustomTextField(
            label: AppStrings.labelBio,
            hint: AppStrings.hintBio,
            controller: _bioController,
            maxLines: 4,
            onChanged: (val) => ref.read(userProvider.notifier).updateBio(val),
          ),
        ],
      ),
    );
  }
}
