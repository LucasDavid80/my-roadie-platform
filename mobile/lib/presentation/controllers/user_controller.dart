import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';

// 1. Mudamos de StateNotifier para Notifier
class UserNotifier extends Notifier<UserEntity> {
  // 2. O valor inicial agora é passado dentro do método obrigatório build()
  @override
  UserEntity build() {
    return UserEntity(id: '1');
  }

  // O resto da sua lógica continua idêntico, o 'state' funciona perfeitamente aqui!
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
    current.contains(item) ? current.remove(item) : current.add(item);
    state = state.copyWith(instruments: current);
  }

  void toggleStyle(String item) {
    final current = List<String>.from(state.styles);
    current.contains(item) ? current.remove(item) : current.add(item);
    state = state.copyWith(styles: current);
  }

  void updateAvailability(bool val) => state = state.copyWith(isAvailable: val);
}

// 3. Mudamos de StateNotifierProvider para NotifierProvider
final userProvider = NotifierProvider<UserNotifier, UserEntity>(() {
  return UserNotifier();
});
