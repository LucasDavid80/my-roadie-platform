// lib/data/repositories/legal_repository_impl.dart
import '../../domain/interfaces/i_legal_repository.dart';
import '../datasources/remote_datasource.dart';

class LegalRepositoryImpl implements ILegalRepository {
  final RemoteDataSource remoteDataSource;

  LegalRepositoryImpl(this.remoteDataSource);

  @override
  Future<String> getCurrentTermsVersion() async {
    return await remoteDataSource.getCurrentTermsVersion();
  }

  @override
  Future<void> acceptTerms(String version) async {
    await remoteDataSource.acceptTerms(version);
  }
}
