# Padrão Canônico de URLs de Download de Releases (MVP)

Este documento define os padrões canônicos para URLs públicas de download dos binários de release mobile (`my-roadie-release.apk` para Android e `my-roadie-release.ipa` para iOS) utilizados na rota de testadores (`/testers`) do My Roadie.

---

## 1. Provedor Primário: GitHub Releases

O GitHub Releases é o canal oficial e automatizado pelo pipeline de CI/CD para disponibilização de builds de release públicos aos testadores.

### A. Download por Tag Versionada (Imutável)
Ideal para fixar uma versão específica (ex.: `v1.0.0-mvp`) nas variáveis de ambiente:

- **Android (.apk):**
  ```text
  https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.apk
  ```
  *Exemplo:* `https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0-mvp/my-roadie-release.apk`

- **iOS (.ipa):**
  ```text
  https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.ipa
  ```
  *Exemplo:* `https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0-mvp/my-roadie-release.ipa`

### B. Download da Última Versão (`latest` - Dinâmico)
O GitHub redireciona automaticamente para o asset anexado na release marcada como mais recente:

- **Android (.apk):**
  ```text
  https://github.com/<owner>/<repo>/releases/latest/download/my-roadie-release.apk
  ```
  *Exemplo:* `https://github.com/LucasDavid80/my-roadie-platform/releases/latest/download/my-roadie-release.apk`

- **iOS (.ipa):**
  ```text
  https://github.com/<owner>/<repo>/releases/latest/download/my-roadie-release.ipa
  ```
  *Exemplo:* `https://github.com/LucasDavid80/my-roadie-platform/releases/latest/download/my-roadie-release.ipa`

---

## 2. Provedor Secundário / Alternativo: Supabase Storage

Caso seja necessário hospedar os executáveis em bucket próprio do Supabase (bucket público `releases`):

### A. Download por Versão/Pasta
- **Android (.apk):**
  ```text
  https://<project-ref>.supabase.co/storage/v1/object/public/releases/<tag>/my-roadie-release.apk
  ```
- **iOS (.ipa):**
  ```text
  https://<project-ref>.supabase.co/storage/v1/object/public/releases/<tag>/my-roadie-release.ipa
  ```

### B. Download por Alias `latest`
- **Android (.apk):**
  ```text
  https://<project-ref>.supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.apk
  ```
- **iOS (.ipa):**
  ```text
  https://<project-ref>.supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.ipa
  ```

---

## 3. Mapeamento com Variáveis de Ambiente no Frontend Web

As variáveis são consumidas em tempo de build/execução pela página [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx):

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_APK_DOWNLOAD_URL` | URL pública direta do binário Android | `https://github.com/LucasDavid80/my-roadie-platform/releases/latest/download/my-roadie-release.apk` |
| `NEXT_PUBLIC_IPA_DOWNLOAD_URL` | URL pública direta do binário iOS | `https://github.com/LucasDavid80/my-roadie-platform/releases/latest/download/my-roadie-release.ipa` |
| `NEXT_PUBLIC_APP_VERSION` | Versão exibida na interface para os testers | `v1.0.0-mvp` ou `MVP 1.0.0` |

---

## 4. Recomendações Operacionais

1. **Nunca comitar binários (.apk / .ipa) no Git:** O versionamento de arquivos compilados deve ser feito exclusivamente em storage externo (GitHub Releases / Supabase Storage).
2. **Ambiente Local:** O arquivo `.env.local` em `frontend-web/` pode apontar para a URL `latest` do GitHub Releases ou permanecer vazio (com a UI exibindo o estado informativo seguro).
3. **Produção (Vercel):** Configurar `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL` no painel da Vercel para garantir links funcionais na rota `/testers`.
