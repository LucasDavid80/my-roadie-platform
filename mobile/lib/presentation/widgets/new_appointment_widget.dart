import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/core/utils/app_logger.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  // Função auxiliar para formatar TimeOfDay no formato estrito "HH:mm"
  String _formatTimeOfDay(TimeOfDay? time) {
    if (time == null) return '--:--';
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  // --- Lógica para abrir o Calendário ---
  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
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
    final initial = (isStart ? _startTime : _endTime) ?? TimeOfDay.now();
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: initial,
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
          margin: EdgeInsets.zero,
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
                      onTap: () => Navigator.of(context).pop(),
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
                  horizontal: 16,
                  vertical: 20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // TÍTULO
                    _buildLabel('Título'),
                    const SizedBox(height: 6),
                    TextField(
                      key: const ValueKey('appointment_title_field'),
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
                                    key: const ValueKey(
                                      'appointment_type_dropdown',
                                    ),
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
                                            child: Text(
                                              value,
                                              style: const TextStyle(
                                                fontSize: 14,
                                              ),
                                              overflow: TextOverflow.ellipsis,
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
                            key: const ValueKey('appointment_start_time_field'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildClickableTimeField(
                            'Término',
                            _endTime,
                            () => _pickTime(false),
                            key: const ValueKey('appointment_end_time_field'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // LOCAL
                    _buildSimpleInput(
                      key: const ValueKey('appointment_location_field'),
                      controller: _locationController,
                      label: 'Local',
                      hint: 'Endereço...',
                    ),
                    const SizedBox(height: 16),

                    // CACHÊ (Condicional ao tipo Show ou Gravação)
                    if (showsFee) ...[
                      _buildSimpleInput(
                        key: const ValueKey('appointment_fee_field'),
                        controller: _cacheController,
                        label: 'Cachê',
                        hint: '0,00',
                        isMoney: true,
                        prefixText: 'R\$ ',
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          CurrencyInputFormatter(),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],

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
                          onPressed: () => Navigator.of(context).pop(),
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
                        ElevatedButton(
                          key: const ValueKey('appointment_confirm_button'),
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
                                    startTime: _formatTimeOfDay(_startTime),
                                    endTime: _formatTimeOfDay(_endTime),
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
                                    AppLogger.error(
                                      'Erro ao salvar compromisso',
                                      error,
                                      stackTrace,
                                    );
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

  InputDecoration _inputDecoration(String hint, {String? prefixText}) {
    return InputDecoration(
      hintText: hint,
      prefixText: prefixText,
      prefixStyle: const TextStyle(
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
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
    VoidCallback onTap, {
    Key? key,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 6),
        InkWell(
          key: key,
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            height: 48,
            decoration: _boxDecoration(),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _formatTimeOfDay(time),
                  style: const TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                  ),
                ),
                const Icon(Icons.access_time, size: 18, color: Colors.black54),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSimpleInput({
    Key? key,
    required TextEditingController controller,
    required String label,
    required String hint,
    bool isMoney = false,
    String? prefixText,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? inputFormatters,
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
          key: key,
          controller: controller,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          decoration: _inputDecoration(hint, prefixText: prefixText),
        ),
      ],
    );
  }
}

/// Formata valores numéricos para moeda em tempo real (centavos da direita para a esquerda).
class CurrencyInputFormatter extends TextInputFormatter {
  final int maxDigits;

  CurrencyInputFormatter({this.maxDigits = 10});

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    // Extrai apenas dígitos
    String digitsOnly = newValue.text.replaceAll(RegExp(r'[^\d]'), '');

    if (digitsOnly.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }

    if (digitsOnly.length > maxDigits) {
      digitsOnly = digitsOnly.substring(0, maxDigits);
    }

    // Converte os dígitos inteiros em centavos
    final parsed = int.tryParse(digitsOnly) ?? 0;
    final double value = parsed / 100.0;
    final formatted = value.toStringAsFixed(2).replaceAll('.', ',');

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

