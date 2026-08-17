import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';

class CustomCalendar extends StatefulWidget {
  // Recebe a lista de eventos da tela principal
  final List<EventEntity> events;

  const CustomCalendar({
    super.key,
    required this.events, // Obrigatório passar a lista agora
  });

  @override
  State<CustomCalendar> createState() => _CustomCalendarState();
}

class _CustomCalendarState extends State<CustomCalendar> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  /// No filtro _getEventsForDay, não precisa mais de DateTime.parse:
  List<EventEntity> _getEventsForDay(DateTime day) {
    return widget.events.where((event) {
      return isSameDay(event.date, day); // Muito mais simples!
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildCustomHeader(),
          const SizedBox(height: 10),
          TableCalendar(
            locale: 'pt_BR',
            firstDay: DateTime.utc(2020, 10, 16),
            lastDay: DateTime.utc(2030, 3, 14),
            focusedDay: _focusedDay,
            availableGestures: AvailableGestures.horizontalSwipe,

            // Lógica de seleção
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },

            // AQUI É A MÁGICA: Carrega os eventos dinamicamente
            eventLoader: _getEventsForDay,

            // --- CONFIGURAÇÃO VISUAL (Igual ao seu anterior) ---
            headerVisible: false,
            daysOfWeekHeight: 40,

            calendarStyle: CalendarStyle(
              todayDecoration: const BoxDecoration(
                color: AppColors.primary, // Laranja
                shape: BoxShape.circle,
              ),
              todayTextStyle: const TextStyle(
                color: AppColors.background,
                fontWeight: FontWeight.bold,
              ),
              selectedDecoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.5),
                shape: BoxShape.circle,
              ),
              outsideDaysVisible: true,
              outsideTextStyle: TextStyle(color: Colors.grey.shade300),
              defaultTextStyle: const TextStyle(color: Colors.black87),
              weekendTextStyle: const TextStyle(color: Colors.black87),
            ),

            // MARCADORES LARANJAS (Bloquinhos)
            calendarBuilders: CalendarBuilders(
              markerBuilder: (context, date, events) {
                if (events.isEmpty) return const SizedBox();

                return Positioned(
                  bottom: 1,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: events.take(3).map((event) {
                      // Limita a 3 bolinhas
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 1.5),
                        width: 8, // Bolinha menor fica mais elegante
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.primary, // Laranja
                          shape: BoxShape
                              .circle, // Mudei para círculo (padrão Google Calendar)
                        ),
                      );
                    }).toList(),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // --- Header customizado (Mantido igual) ---
  Widget _buildCustomHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          _capitalizeMonth(
            DateFormat('MMMM yyyy', 'pt_BR').format(_focusedDay),
          ),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.secondary,
          ),
        ),
        Row(
          children: [
            TextButton(
              onPressed: () {
                setState(() {
                  _focusedDay = DateTime.now();
                });
              },
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Hoje',
                style: TextStyle(color: Colors.black87),
              ),
            ),
            const SizedBox(width: 8),
            _buildArrowButton(
              icon: Icons.chevron_left,
              onTap: () {
                setState(() {
                  _focusedDay = DateTime(
                    _focusedDay.year,
                    _focusedDay.month - 1,
                  );
                });
              },
            ),
            const SizedBox(width: 4),
            _buildArrowButton(
              icon: Icons.chevron_right,
              onTap: () {
                setState(() {
                  _focusedDay = DateTime(
                    _focusedDay.year,
                    _focusedDay.month + 1,
                  );
                });
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildArrowButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        icon: Icon(icon, size: 20, color: Colors.blueGrey),
        onPressed: onTap,
      ),
    );
  }

  String _capitalizeMonth(String text) {
    return "${text[0].toUpperCase()}${text.substring(1)}";
  }
}
