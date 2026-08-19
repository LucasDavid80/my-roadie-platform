import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart'; // Para formatar a data

class NewAppointmentWidget extends StatefulWidget {
  final Future<void> Function(EventEntity) onConfirm;
  final EventEntity?
  event; // <--- AGORA É OPCIONAL (Pode ser nulo se for criar)

  const NewAppointmentWidget({super.key, required this.onConfirm, this.event});

  @override
  State<NewAppointmentWidget> createState() => _NewAppointmentWidgetState();
}

class _NewAppointmentWidgetState extends State<NewAppointmentWidget> {
  // --- 1. Controladores (Para pegar o texto digitado) ---
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();
  final _cacheController = TextEditingController();
  final _notesController = TextEditingController();

  // --- 2. Variáveis de Estado (Para guardar as escolhas) ---
  String _selectedType = 'Show'; // Valor inicial do dropdown
  DateTime? _selectedDate;
  TimeOfDay? _startTime;
  TimeOfDay? _endTime;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // AQUI ESTÁ A MÁGICA DA EDIÇÃO:
    if (widget.event != null) {
      final e = widget.event!;
      _titleController.text = e.title;
      _locationController.text = e.location;

      // Formata o dinheiro para string (ex: 3000.0 -> "3000,00")
      _cacheController.text = e.fee.toStringAsFixed(2).replaceAll('.', ',');

      _notesController.text = e.notes;
      _selectedType = e.type;
      _selectedDate = e.date;

      // Converte String "HH:mm" para TimeOfDay
      _startTime = _parseTimeOfDay(e.startTime);
      _endTime = _parseTimeOfDay(e.endTime);
    }
  }

  // Função auxiliar para converter String "19:30" em TimeOfDay(19, 30)
  TimeOfDay? _parseTimeOfDay(String timeString) {
    if (timeString == '--:--' || timeString.isEmpty) return null;
    try {
      final parts = timeString.split(':');
      return TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
    } catch (e) {
      return null;
    }
  }

  @override
  void dispose() {
    // É boa prática limpar os controladores ao fechar a tela
    _titleController.dispose();
    _locationController.dispose();
    _cacheController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  // --- Lógica para abrir o Calendário ---
  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2030),
      builder: (context, child) {
        // Customiza a cor do calendário para Laranja
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(primary: AppColors.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  // --- Lógica para abrir o Relógio ---
  Future<void> _pickTime(bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(primary: AppColors.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Muda o título dependendo se está editando ou criando
    final isEditing = widget.event != null;
    final showsFee = _selectedType == 'Show' || _selectedType == 'Gravação';
    return Center(
      child: SingleChildScrollView(
        child: Container(
          width: double.infinity,
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- CABEÇALHO ---
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.music_note, color: AppColors.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      isEditing ? 'Editar Compromisso' : 'Novo Compromisso',
                      style: const TextStyle(
                        color: AppColors.textLight,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: const Icon(
                        Icons.close,
                        color: AppColors.textGrey,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ),

              // --- FORMULÁRIO ---
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // TÍTULO
                    _buildLabel('Título'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _titleController, // Conectado ao controller
                      decoration: _inputDecoration('Ex: Pagode na Adega'),
                    ),
                    const SizedBox(height: 16),

                    // TIPO E DATA
                    Row(
                      children: [
                        // Dropdown de Tipo
                        Expanded(
                          flex: 4,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Tipo'),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                ),
                                height: 48,
                                decoration: _boxDecoration(),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _selectedType,
                                    isExpanded: true,
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down,
                                      color: Colors.grey,
                                    ),
                                    items:
                                        [
                                          'Show',
                                          'Ensaio',
                                          'Gravação',
                                          'Reunião',
                                        ].map((String value) {
                                          return DropdownMenuItem<String>(
                                            value: value,
                                            child: Row(
                                              children: [
                                                Icon(
                                                  Icons.music_note,
                                                  size: 18,
                                                  color: Colors.pinkAccent,
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  value,
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }).toList(),
                                    onChanged: (newValue) {
                                      setState(() {
                                        _selectedType = newValue!;
                                        if (_selectedType != 'Show' &&
                                            _selectedType != 'Gravação') {
                                          _cacheController.clear();
                                        }
                                      });
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Seletor de Data (Agora clicável)
                        Expanded(
                          flex: 4,
                          child: InkWell(
                            onTap: _pickDate, // Abre o calendário
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Data'),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                  ),
                                  height: 48,
                                  decoration: _boxDecoration(),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Flexible(
                                        child: Text(
                                          _selectedDate == null
                                              ? 'Selecionar'
                                              : DateFormat('dd/MM/yyyy').format(
                                                  _selectedDate!,
                                                ), // Formata a data
                                          style: const TextStyle(
                                            color: Colors.black87,
                                          ),
                                        ),
                                      ),
                                      const Icon(
                                        Icons.calendar_today_outlined,
                                        size: 18,
                                        color: Colors.black54,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // HORÁRIOS (Agora clicáveis)
                    Row(
                      children: [
                        Expanded(
                          child: _buildClickableTimeField(
                            'Início',
                            _startTime,
                            () => _pickTime(true),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildClickableTimeField(
                            'Término',
                            _endTime,
                            () => _pickTime(false),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // LOCAL E CACHÊ
                    if (showsFee)
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: _buildSimpleInput(
                              controller: _locationController,
                              label: 'Local',
                              hint: 'Endereço...',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildSimpleInput(
                              controller: _cacheController,
                              label: 'Cachê',
                              hint: '0,00',
                              isMoney: true,
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      )
                    else
                      _buildSimpleInput(
                        controller: _locationController,
                        label: 'Local',
                        hint: 'Endereço...',
                      ),
                    const SizedBox(height: 16),

                    // OBSERVAÇÕES
                    _buildLabel('Observações'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _notesController,
                      maxLines: 4,
                      decoration: _inputDecoration('Anotações, setlist...'),
                    ),
                    const SizedBox(height: 24),

                    // BOTÕES
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        OutlinedButton(
                          onPressed: () => context.pop(),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: Colors.grey.shade300),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Cancelar',
                            style: TextStyle(color: Colors.black87),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Center(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : () async {
                                    if (_titleController.text.trim().isEmpty ||
                                        _selectedDate == null) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                            'Por favor, preencha o título e selecione uma data.',
                                          ),
                                          backgroundColor: AppColors.erro,
                                        ),
                                      );
                                      return;
                                    }

                                    setState(() {
                                      _isLoading = true;
                                    });

                                    final newEvent = EventEntity(
                                      // Se estiver editando, MANTÉM o ID original. Se for novo, gera um novo.
                                      id: isEditing
                                          ? widget.event!.id
                                          : DateTime.now().toString(),
                                      title: _titleController.text.trim(),
                                      type: _selectedType,
                                      date: _selectedDate!,
                                      startTime:
                                          _startTime?.format(context) ??
                                          '--:--',
                                      endTime:
                                          _endTime?.format(context) ?? '--:--',
                                      location: _locationController.text.trim(),
                                      fee: showsFee
                                          ? double.tryParse(
                                                  _cacheController.text
                                                      .replaceAll(',', '.'),
                                                ) ??
                                                0.0
                                          : 0.0,
                                      notes: _notesController.text.trim(),
                                      bandId: widget.event?.bandId,
                                    );

                                    try {
                                      await widget.onConfirm(newEvent);
                                      if (context.mounted) {
                                        Navigator.of(context).pop();
                                      }
                                    } catch (error, stackTrace) {
                                      debugPrint(
                                        'Erro ao salvar compromisso: $error',
                                      );
                                      debugPrintStack(stackTrace: stackTrace);
                                      if (context.mounted) {
                                        setState(() {
                                          _isLoading = false;
                                        });
                                        final rawMessage = error
                                            .toString()
                                            .replaceFirst('Exception: ', '')
                                            .trim();
                                        final message = rawMessage.isNotEmpty
                                            ? rawMessage
                                            : 'Erro ao salvar compromisso. Tente novamente.';
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(
                                            behavior: SnackBarBehavior.floating,
                                            duration: const Duration(
                                              seconds: 15,
                                            ),
                                            content: Text(
                                              'Erro ao salvar compromisso:\n$message',
                                              maxLines: 6,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            backgroundColor: AppColors.erro,
                                          ),
                                        );
                                      }
                                    }
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 0,
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        AppColors.textLight,
                                      ),
                                    ),
                                  )
                                : Text(
                                    isEditing
                                        ? 'Salvar Alterações'
                                        : 'Criar Compromisso',
                                    style: const TextStyle(
                                      color: AppColors.textLight,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- WIDGETS AUXILIARES REUTILIZÁVEIS ---

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey[400]),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: AppColors.primary, width: 2),
      ),
    );
  }

  BoxDecoration _boxDecoration() {
    return BoxDecoration(
      border: Border.all(color: Colors.grey.shade300),
      borderRadius: BorderRadius.circular(8),
    );
  }

  Widget _buildLabel(String text) => Text(
    text,
    style: TextStyle(fontWeight: FontWeight.w600, color: Colors.blueGrey[700]),
  );

  Widget _buildClickableTimeField(
    String label,
    TimeOfDay? time,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLabel(label),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            height: 48,
            decoration: _boxDecoration(),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  time == null ? '--:--' : time.format(context),
                  style: const TextStyle(color: Colors.black87),
                ),
                const Icon(Icons.access_time, size: 18, color: Colors.black54),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSimpleInput({
    required TextEditingController controller,
    required String label,
    required String hint,
    bool isMoney = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            if (isMoney) ...[
              const Icon(Icons.attach_money, size: 14, color: Colors.grey),
              const SizedBox(width: 4),
            ],
            _buildLabel(label),
          ],
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: _inputDecoration(hint),
        ),
      ],
    );
  }
}
