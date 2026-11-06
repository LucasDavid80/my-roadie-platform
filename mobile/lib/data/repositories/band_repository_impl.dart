import '../../domain/entities/band_entity.dart';
import '../../domain/interfaces/i_band_repository.dart';
import '../datasources/remote_datasource.dart';

class BandRepositoryImpl implements IBandRepository {
  final RemoteDataSource remoteDataSource;

  BandRepositoryImpl(this.remoteDataSource);

  @override
  Future<List<BandEntity>> getBands() async {
    return remoteDataSource.getBands();
  }
}
