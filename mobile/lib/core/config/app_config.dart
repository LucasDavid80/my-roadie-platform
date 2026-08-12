// lib/core/config/app_config.dart
import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  static String _supabaseUrl = const String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://hpgvbizdmhxukyoqjvmo.supabase.co',
  );

  static String _supabaseAnonKey = const String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ3ZiaXpkbWh4dWt5b3Fqdm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDE5MjgsImV4cCI6MjA5MjI3NzkyOH0.AxH1CiWszCJyFawo1kJNFcYEI8NuAaaP8b6VFmN44WU',
  );

  static String get supabaseUrl => _supabaseUrl;
  static String get supabaseAnonKey => _supabaseAnonKey;

  @visibleForTesting
  static set supabaseUrl(String value) => _supabaseUrl = value;

  @visibleForTesting
  static set supabaseAnonKey(String value) => _supabaseAnonKey = value;

  static String get defaultBackendUrl {
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  static String get backendUrl => const String.fromEnvironment(
        'BACKEND_URL',
      ).isNotEmpty
          ? const String.fromEnvironment('BACKEND_URL')
          : defaultBackendUrl;

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty &&
      supabaseAnonKey.isNotEmpty &&
      !supabaseUrl.contains('placeholder') &&
      !supabaseAnonKey.contains('placeholder');
}
