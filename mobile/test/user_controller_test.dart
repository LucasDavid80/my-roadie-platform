import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';

void main() {
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() {
    container.dispose();
  });

  test('Should start with a default user', () {
    final user = container.read(userProvider);
    expect(user.id, '1');
    expect(user.instruments, isEmpty);
  });

  test('Should update user name', () {
    container.read(userProvider.notifier).updateName('New Name');
    final user = container.read(userProvider);
    expect(user.name, 'New Name');
  });

  test('Should update availability', () {
    container.read(userProvider.notifier).updateAvailability(true);
    expect(container.read(userProvider).isAvailable, isTrue);

    container.read(userProvider.notifier).updateAvailability(false);
    expect(container.read(userProvider).isAvailable, isFalse);
  });

  test('Should toggle instruments', () {
    final instrument = 'Guitar';
    
    // Add
    container.read(userProvider.notifier).toggleInstrument(instrument);
    expect(container.read(userProvider).instruments, contains(instrument));

    // Remove
    container.read(userProvider.notifier).toggleInstrument(instrument);
    expect(container.read(userProvider).instruments, isNot(contains(instrument)));
  });

  test('Should toggle musical styles', () {
    final style = 'Rock';
    
    // Add
    container.read(userProvider.notifier).toggleStyle(style);
    expect(container.read(userProvider).styles, contains(style));

    // Remove
    container.read(userProvider.notifier).toggleStyle(style);
    expect(container.read(userProvider).styles, isNot(contains(style)));
  });

  test('Should update multiple fields and keep consistency', () {
    final notifier = container.read(userProvider.notifier);
    
    notifier.updateCity('São Paulo');
    notifier.updateFederativeUnit('SP');
    notifier.updateMinimumFee(1000.0);
    
    final user = container.read(userProvider);
    expect(user.city, 'São Paulo');
    expect(user.federativeUnit, 'SP');
    expect(user.minCache, 1000.0);
    expect(user.id, '1'); // Should still be '1'
  });
}
