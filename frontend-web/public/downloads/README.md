# Downloads de Release (MVP)

Esta pasta armazena os arquivos de build gerados para distribuição aos testadores convidados do My Roadie.

## Arquivos Esperados
- `my-roadie-release.apk`: Build Android gerado via `flutter build apk --release`.
- `my-roadie-release.ipa`: Build iOS gerado e assinado para sideload.

## Hospedagem Externa Opcional
Caso prefira hospedar os arquivos em um bucket do Supabase Storage ou serviço CDN externo, basta configurar as seguintes variáveis de ambiente no frontend-web:
- `NEXT_PUBLIC_APK_DOWNLOAD_URL`: URL completa para o arquivo `.apk`.
- `NEXT_PUBLIC_IPA_DOWNLOAD_URL`: URL completa para o arquivo `.ipa`.
