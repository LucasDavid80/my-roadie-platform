# Downloads de Release do MVP

Esta pasta (`frontend-web/public/downloads/`) serve como referência de estrutura para os binários compilados das aplicações mobile do **My Roadie**.

> **Aviso Importante:** Binários de compilação (`.apk` e `.ipa`) **não** devem ser comitados no repositório Git para evitar inchaço no histórico do projeto e violação de cotas em plataformas de hospedagem estática (Vercel).

---

## 📱 Binários de Release Mobile

- **Android:** `my-roadie-release.apk` (gerado via `flutter build apk --release` no CI/CD)
- **iOS:** `my-roadie-release.ipa` (gerado e empacotado para sideload no CI/CD)

---

## 🌐 Configuração de Variáveis de Ambiente

Para disponibilizar os links de download na rota de testadores (`/testers`), configure as variáveis de ambiente no arquivo `.env.local` (desenvolvimento) ou no painel da Vercel (produção):

### 1. `NEXT_PUBLIC_APK_DOWNLOAD_URL`
URL pública direta para download do `.apk` Android.

- **GitHub Releases (Última Versão):**
  ```env
  NEXT_PUBLIC_APK_DOWNLOAD_URL="https://github.com/LucasDavid80/my-roadie-platform/releases/latest/download/my-roadie-release.apk"
  ```
- **GitHub Releases (Versão Específica):**
  ```env
  NEXT_PUBLIC_APK_DOWNLOAD_URL="https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0-mvp/my-roadie-release.apk"
  ```
- **Supabase Storage (Bucket Público):**
  ```env
  NEXT_PUBLIC_APK_DOWNLOAD_URL="https://<project-ref>.supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.apk"
  ```

### 2. `NEXT_PUBLIC_IPA_DOWNLOAD_URL`
URL pública direta para download do `.ipa` iOS.

- **GitHub Releases (Última Versão):**
  ```env
  NEXT_PUBLIC_IPA_DOWNLOAD_URL="https://github.com/LucasDavid80/my-roadie-platform/releases/latest/download/my-roadie-release.ipa"
  ```
- **GitHub Releases (Versão Específica):**
  ```env
  NEXT_PUBLIC_IPA_DOWNLOAD_URL="https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0-mvp/my-roadie-release.ipa"
  ```
- **Supabase Storage (Bucket Público):**
  ```env
  NEXT_PUBLIC_IPA_DOWNLOAD_URL="https://<project-ref>.supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.ipa"
  ```

### 3. `NEXT_PUBLIC_APP_VERSION` *(Opcional)*
Identificador textual da versão ativa exibida nos cards da rota `/testers` (padrão: `MVP 1.0.0`).

```env
NEXT_PUBLIC_APP_VERSION="MVP 1.0.0"
```

---

## 📚 Documentação Relacionada
Para detalhes sobre o padrão canônico de URLs e distribuição de releases, consulte [`docs/distribution/download-urls.md`](file:///C:/dev/my-roadie-platform/docs/distribution/download-urls.md).
