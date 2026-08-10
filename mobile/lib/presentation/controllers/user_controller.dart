import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_user_repository.dart';
import 'package:agenda_musical/data/repositories/user_repository_impl.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'auth_controller.dart';

class SaveProfileResult {
  final bool isSuccess;
  final String? errorMessage;

  const SaveProfileResult({
    required this.isSuccess,
    this.errorMessage,
  });

  factory SaveProfileResult.success() =>
      const SaveProfileResult(isSuccess: true);

  factory SaveProfileResult.failure(String message) =>
      SaveProfileResult(isSuccess: false, errorMessage: message);
}

// Provider para injeção do repositório de usuário
final userRepositoryProvider = Provider<IUserRepository>((ref) {
  return UserRepositoryImpl(ref.read(remoteDataSourceProvider));
});

// 1. Mudamos de StateNotifier para Notifier
class UserNotifier extends Notifier<UserEntity> {
  // 2. O valor inicial agora é passado dentro do método obrigatório build()
  @override
  UserEntity build() {
    final authState = ref.watch(authProvider);
    final userId = authState.user?.id ?? authState.user?.email;
    final validUserId = (userId != null && userId.isNotEmpty) ? userId : '1';

    Future.microtask(() => fetchProfile(validUserId));

    return UserEntity(
      id: validUserId,
      instruments: const [],
      styles: const [],
    );
  }

  Future<void> fetchProfile([String? userId]) async {
    final authState = ref.read(authProvider);
    final currentUserId = authState.user?.id ?? authState.user?.email;
    final targetId = (userId != null && userId.isNotEmpty)
        ? userId
        : ((currentUserId != null && currentUserId.isNotEmpty) ? currentUserId : state.id);
    if (targetId.isEmpty) return;
    try {
      final userProfile =
          await ref.read(userRepositoryProvider).getUser(targetId);
      state = userProfile;
    } catch (e, stack) {
      debugPrint('fetchProfile ERRO: $e');
      debugPrintStack(stackTrace: stack);
    }
  }

  Future<SaveProfileResult> saveProfile() async {
    if (state.id.isEmpty) {
      return SaveProfileResult.failure('ID do usuário não fornecido');
    }
    try {
      final updated =
          await ref.read(userRepositoryProvider).updateUser(state.id, state);
      state = updated;
      return SaveProfileResult.success();
    } catch (e, stack) {
      debugPrint('saveProfile ERRO: $e');
      debugPrintStack(stackTrace: stack);
      String message = 'Erro ao salvar perfil';
      if (e is UnauthorizedException) {
        message = e.message;
      } else if (e is NetworkException) {
        message = e.message;
      } else if (e is ServerException) {
        message = e.message;
      } else {
        final errStr = e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
        if (errStr.isNotEmpty) {
          message = errStr;
        }
      }
      return SaveProfileResult.failure(message);
    }
  }

  void updateName(String val) => state = state.copyWith(name: val);
  void updateExperience(String val) => state = state.copyWith(experience: val);
  void updatePhone(String val) => state = state.copyWith(phone: val);
  void updateInstagram(String val) => state = state.copyWith(instagram: val);
  void updateCity(String val) => state = state.copyWith(city: val);
  void updateFederativeUnit(String val) =>
      state = state.copyWith(federativeUnit: val);
  void updateVideoLink(String val) => state = state.copyWith(youtubeLink: val);
  void updateBio(String val) => state = state.copyWith(bio: val);

  void updateMinimumFee(double val) => state = state.copyWith(minCache: val);

  void toggleInstrument(String item) {
    final current = List<String>.from(state.instruments);
    if (current.contains(item)) {
      current.remove(item);
    } else {
      current.add(item);
    }
    state = state.copyWith(instruments: List<String>.unmodifiable(current));
  }

  void toggleStyle(String item) {
    final current = List<String>.from(state.styles);
    if (current.contains(item)) {
      current.remove(item);
    } else {
      current.add(item);
    }
    state = state.copyWith(styles: List<String>.unmodifiable(current));
  }

  void updateAvailability(bool val) => state = state.copyWith(isAvailable: val);
}

// 3. Mudamos de StateNotifierProvider para NotifierProvider
final userProvider = NotifierProvider<UserNotifier, UserEntity>(() {
  return UserNotifier();
});
