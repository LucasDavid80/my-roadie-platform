// lib/core/config/app_config.dart

class AppConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://hpgvbizdmhxukyoqjvmo.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ3ZiaXpkbWh4dWt5b3Fqdm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDE5MjgsImV4cCI6MjA5MjI3NzkyOH0.AxH1CiWszCJyFawo1kJNFcYEI8NuAaaP8b6VFmN44WU',
  );

  static const String backendUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://localhost:3000',
  );

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
