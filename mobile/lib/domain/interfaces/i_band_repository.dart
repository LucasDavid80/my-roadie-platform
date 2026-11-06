import '../entities/band_entity.dart';

abstract class IBandRepository {
  Future<List<BandEntity>> getBands();
}
