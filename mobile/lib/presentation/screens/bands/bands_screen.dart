import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/presentation/controllers/band_controller.dart';
import 'package:agenda_musical/presentation/widgets/band_selector.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BandsScreen extends ConsumerStatefulWidget {
  const BandsScreen({super.key});

  @override
  ConsumerState<BandsScreen> createState() => _BandsScreenState();
}

class _BandsScreenState extends ConsumerState<BandsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bandProvider.notifier).fetchBands();
    });
  }

  @override
  Widget build(BuildContext context) {
    final workspace = ref.watch(bandProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workspaces'),
        backgroundColor: AppColors.background,
        iconTheme: const IconThemeData(color: AppColors.secondary),
        titleTextStyle: const TextStyle(
          color: AppColors.secondary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Banda ativa',
              style: TextStyle(
                color: AppColors.secondary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const BandSelector(),
            const SizedBox(height: 24),
            if (workspace.isLoading && workspace.bands.isEmpty)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (workspace.error != null && workspace.bands.isEmpty)
              Expanded(
                child: Center(
                  child: Text(
                    workspace.error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.erro),
                  ),
                ),
              )
            else if (workspace.bands.isEmpty)
              const Expanded(
                child: Center(
                  child: Text(
                    'Nenhuma banda disponível para esta conta.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 16),
                  ),
                ),
              )
            else
              Expanded(
                child: ListView.separated(
                  itemCount: workspace.bands.length,
                  separatorBuilder: (context, index) =>
                      const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final band = workspace.bands[index];
                    final isActive = band.id == workspace.activeBandId;

                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(band.name),
                      subtitle: Text(
                        isActive ? 'Workspace ativo' : 'Workspace disponível',
                      ),
                      trailing: isActive
                          ? const Icon(
                              Icons.check_circle,
                              color: AppColors.primary,
                            )
                          : null,
                      onTap: () {
                        ref.read(bandProvider.notifier).selectBand(band.id);
                      },
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
