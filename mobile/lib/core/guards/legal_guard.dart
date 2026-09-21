import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/remote_datasource.dart';
import '../../data/repositories/legal_repository_impl.dart';
import '../../domain/interfaces/i_legal_repository.dart';
import '../../presentation/widgets/legal_consent_modal.dart';
import '../../presentation/controllers/user_controller.dart';
import '../../presentation/controllers/auth_controller.dart';

final legalRepositoryProvider = Provider<ILegalRepository>((ref) {
  return LegalRepositoryImpl(ref.read(remoteDataSourceProvider));
});

class LegalGuard extends ConsumerStatefulWidget {
  final Widget child;

  const LegalGuard({super.key, required this.child});

  @override
  ConsumerState<LegalGuard> createState() => _LegalGuardState();
}

class _LegalGuardState extends ConsumerState<LegalGuard> {
  bool _isChecking = true;
  bool _isModalShowing = false;
  String? _currentVersion;

  @override
  void initState() {
    super.initState();
    _checkLegalStatus();
  }

  Future<void> _checkLegalStatus() async {
    try {
      _currentVersion = await ref.read(legalRepositoryProvider).getCurrentTermsVersion();
      // Força fetch do profile para ter os dados atualizados
      await ref.read(userProvider.notifier).fetchProfile(null, true);
    } catch (e) {
      // Ignora erro de rede, permite o app continuar (resiliência)
    }
    
    if (mounted) {
      setState(() {
        _isChecking = false;
      });
    }
  }

  void _showModal(BuildContext context, String version) {
    if (_isModalShowing) return;
    _isModalShowing = true;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (dialogContext) => StatefulBuilder(
          builder: (context, setDialogState) {
            bool isLoading = false;
            return LegalConsentModal(
              isLoading: isLoading,
              onAccept: () async {
                setDialogState(() => isLoading = true);
                try {
                  await ref.read(legalRepositoryProvider).acceptTerms(version);
                  await ref.read(userProvider.notifier).fetchProfile(null, true);
                  if (context.mounted) {
                    Navigator.of(dialogContext).pop();
                    _isModalShowing = false;
                  }
                } catch (e) {
                  setDialogState(() => isLoading = false);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Erro ao aceitar termos. Tente novamente.')),
                    );
                  }
                }
              },
            );
          },
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isChecking) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final user = ref.watch(userProvider);
    final authState = ref.watch(authProvider);

    if (authState.user != null && _currentVersion != null && _currentVersion!.isNotEmpty) {
      if (user.termsAcceptedVersion != _currentVersion) {
        _showModal(context, _currentVersion!);
      }
    }

    return widget.child;
  }
}
