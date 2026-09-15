// lib/data/models/event_model.dart
import '../../domain/entities/event_entity.dart';

class EventModel extends EventEntity {
  const EventModel({
    required super.id,
    required super.title,
    required super.type,
    required super.startsAt,
    super.endsAt,
    required super.timezone,
    required super.location,
    required super.fee,
    super.notes,
    super.bandId,
  });

  // Converte a partir da resposta da API ou banco local
  factory EventModel.fromMap(Map<String, dynamic> map) {
    DateTime parsedStartsAt;
    if (map['startsAt'] != null) {
      parsedStartsAt = DateTime.tryParse(map['startsAt'].toString())?.toLocal() ?? DateTime.now();
    } else {
      parsedStartsAt = DateTime.now();
    }

    DateTime? parsedEndsAt;
    if (map['endsAt'] != null) {
      parsedEndsAt = DateTime.tryParse(map['endsAt'].toString())?.toLocal();
    }

    double parsedFee = 0.0;
    if (map['fee'] != null) {
      if (map['fee'] is num) {
        parsedFee = (map['fee'] as num).toDouble();
      } else {
        parsedFee = double.tryParse(map['fee'].toString()) ?? 0.0;
      }
    }

    return EventModel(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      type: map['type']?.toString() ?? 'Show',
      startsAt: parsedStartsAt,
      endsAt: parsedEndsAt,
      timezone: map['timezone']?.toString() ?? 'America/Sao_Paulo',
      location: map['location']?.toString() ?? '',
      fee: parsedFee,
      notes: map['notes']?.toString() ?? map['description']?.toString() ?? '',
      bandId: map['bandId']?.toString(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'type': type,
      'startsAt': startsAt.toUtc().toIso8601String(),
      if (endsAt != null) 'endsAt': endsAt!.toUtc().toIso8601String(),
      'timezone': timezone,
      'location': location,
      'fee': fee,
      'notes': notes,
      if (bandId != null) 'bandId': bandId,
    };
  }

  /// Gera o payload sanitizado para criação no backend (removendo id gerado pelo cliente)
  Map<String, dynamic> toCreatePayload() {
    final payload = <String, dynamic>{
      'title': title,
      'startsAt': startsAt.toUtc().toIso8601String(),
      'timezone': timezone,
      'location': location,
      'fee': fee,
    };
    if (endsAt != null) {
      payload['endsAt'] = endsAt!.toUtc().toIso8601String();
    }
    if (type.isNotEmpty) {
      payload['type'] = type;
    }
    if (notes.isNotEmpty) {
      payload['description'] = notes;
    }
    if (bandId != null && bandId!.isNotEmpty) {
      payload['bandId'] = bandId;
    }
    return payload;
  }
}
