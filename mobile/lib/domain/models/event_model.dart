// lib/data/models/event_model.dart
import '../../domain/entities/event_entity.dart';

class EventModel extends EventEntity {
  const EventModel({
    required super.id,
    required super.title,
    required super.type,
    required super.date,
    required super.startTime,
    required super.endTime,
    required super.location,
    required super.fee,
    super.notes,
    super.bandId,
  });

  // Converte a partir da resposta da API ou banco local
  factory EventModel.fromMap(Map<String, dynamic> map) {
    DateTime parsedDate;
    if (map['date'] != null) {
      parsedDate = DateTime.tryParse(map['date'].toString()) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
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
      date: parsedDate,
      startTime: map['startTime']?.toString() ?? '',
      endTime: map['endTime']?.toString() ?? '',
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
      'date': date.toIso8601String(),
      'startTime': startTime,
      'endTime': endTime,
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
      'date': date.toIso8601String(),
      'location': location,
    };
    if (startTime.isNotEmpty) {
      payload['startTime'] = startTime;
    }
    if (endTime.isNotEmpty) {
      payload['endTime'] = endTime;
    }
    if (type.isNotEmpty) {
      payload['type'] = type;
    }
    if (fee > 0) {
      payload['fee'] = fee;
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
