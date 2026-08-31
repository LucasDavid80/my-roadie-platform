import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';

/// Sementes e constantes determinísticas para a suíte E2E.
class TestSeedData {
  // Constantes de Usuário E2E
  static const String testUserId = 'user_e2e_123';
  static const String testUserEmail = 'musico.e2e@myroadie.br';
  static const String testUserPassword = 'password123';
  static const String testUserName = 'Músico E2E Teste';
  static const String testUserPhone = '11999998888';
  static const String testUserCity = 'São Paulo';
  static const String testUserUF = 'SP';
  static const String testUserExperience = '5 anos de estrada';
  static const String testUserBio =
      'Músico profissional focado em shows e eventos corporativos.';
  static const String testUserInstagram = '@musico_e2e';
  static const String testUserYoutube = 'https://youtube.com/@musico_e2e';
  static const double testUserMinCache = 500.0;
  static const List<String> testUserInstruments = ['Guitarra', 'Violão'];
  static const List<String> testUserStyles = ['Rock', 'Pop'];

  // Dados atualizados para teste de edição de perfil
  static const String updatedUserCity = 'Campinas';
  static const String updatedUserPhone = '19988887777';

  // Entidade padrão de usuário
  static UserEntity get defaultUserEntity => UserEntity(
        id: testUserId,
        name: testUserName,
        phone: testUserPhone,
        city: testUserCity,
        federativeUnit: testUserUF,
        experience: testUserExperience,
        bio: testUserBio,
        instagram: testUserInstagram,
        youtubeLink: testUserYoutube,
        minCache: testUserMinCache,
        instruments: testUserInstruments,
        styles: testUserStyles,
        isAvailable: true,
      );

  // Constantes de Evento E2E
  static const String testEventId = 'event_e2e_1';
  static const String testEventTitle = 'Show E2E no Festival';
  static const String testEventType = 'Show';
  static final DateTime testEventDate = DateTime(2026, 9, 20);
  static const String testEventStartTime = '20:00';
  static const String testEventEndTime = '22:00';
  static const String testEventLocation = 'Auditório Ibirapuera';
  static const double testEventFee = 3500.0;
  static const String testEventNotes = 'Passagem de som às 17h';

  // Dados atualizados para teste de edição de compromisso
  static const String updatedEventTitle = 'Show E2E no Festival - Confirmado';
  static const double updatedEventFee = 4000.0;

  // Entidade padrão de evento
  static EventEntity get defaultEventEntity => EventEntity(
        id: testEventId,
        title: testEventTitle,
        type: testEventType,
        date: testEventDate,
        startTime: testEventStartTime,
        endTime: testEventEndTime,
        location: testEventLocation,
        fee: testEventFee,
        notes: testEventNotes,
      );

  static EventEntity get updatedEventEntity => EventEntity(
        id: testEventId,
        title: updatedEventTitle,
        type: testEventType,
        date: testEventDate,
        startTime: testEventStartTime,
        endTime: testEventEndTime,
        location: testEventLocation,
        fee: updatedEventFee,
        notes: testEventNotes,
      );
}
