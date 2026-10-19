import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/presentation/controllers/band_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BandSelector extends ConsumerWidget {
  const BandSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workspace = ref.watch(bandProvider);

    if (workspace.isLoading && workspace.bands.isEmpty) {
      return const SizedBox(
        height: 48,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }

    if (workspace.error != null && workspace.bands.isEmpty) {
      return Row(
        children: [
          const Expanded(
            child: Text(
              'Não foi possível carregar as bandas.',
              style: TextStyle(color: AppColors.erro),
            ),
          ),
          IconButton(
            tooltip: 'Tentar novamente',
            onPressed: () => ref.read(bandProvider.notifier).fetchBands(),
            icon: const Icon(Icons.refresh, color: AppColors.erro),
          ),
        ],
      );
    }

    if (workspace.bands.isEmpty) {
      return const Text(
        'Nenhuma banda disponível',
        style: TextStyle(color: Colors.grey),
      );
    }

    return DropdownButtonHideUnderline(
      child: DropdownButton<String>(
        value: workspace.activeBandId,
        isExpanded: true,
        icon: const Icon(Icons.keyboard_arrow_down),
        hint: const Text('Selecione uma banda'),
        items: workspace.bands
            .map(
              (band) => DropdownMenuItem<String>(
                value: band.id,
                child: Text(band.name, overflow: TextOverflow.ellipsis),
              ),
            )
            .toList(),
        onChanged: (bandId) {
          if (bandId != null) {
            ref.read(bandProvider.notifier).selectBand(bandId);
          }
        },
      ),
    );
  }
}
