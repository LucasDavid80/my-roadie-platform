import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/band_repository_impl.dart';
import '../../domain/entities/band_entity.dart';
import '../../domain/interfaces/i_band_repository.dart';
import 'auth_controller.dart';

final bandRepositoryProvider = Provider<IBandRepository>((ref) {
  return BandRepositoryImpl(ref.read(remoteDataSourceProvider));
});

class BandWorkspaceState {
  final List<BandEntity> bands;
  final String? activeBandId;
  final bool isLoading;
  final String? error;

  const BandWorkspaceState({
    this.bands = const [],
    this.activeBandId,
    this.isLoading = false,
    this.error,
  });

  BandWorkspaceState copyWith({
    List<BandEntity>? bands,
    String? activeBandId,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return BandWorkspaceState(
      bands: bands ?? this.bands,
      activeBandId: activeBandId ?? this.activeBandId,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : error ?? this.error,
    );
  }
}

class BandController extends Notifier<BandWorkspaceState> {
  IBandRepository get _repository => ref.read(bandRepositoryProvider);

  @override
  BandWorkspaceState build() {
    return const BandWorkspaceState();
  }

  Future<void> fetchBands() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final bands = await _repository.getBands();
      final activeBandId = bands.any((band) => band.id == state.activeBandId)
          ? state.activeBandId
          : bands.isEmpty
          ? null
          : bands.first.id;

      state = BandWorkspaceState(bands: bands, activeBandId: activeBandId);
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  void selectBand(String bandId) {
    if (state.bands.any((band) => band.id == bandId)) {
      state = state.copyWith(activeBandId: bandId);
    }
  }
}

final bandProvider = NotifierProvider<BandController, BandWorkspaceState>(
  BandController.new,
);
