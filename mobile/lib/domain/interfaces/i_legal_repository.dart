// lib/domain/interfaces/i_legal_repository.dart
abstract class ILegalRepository {
  Future<String> getCurrentTermsVersion();
  Future<void> acceptTerms(String version);
}
