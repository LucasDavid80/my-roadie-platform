# UX States

Este documento descreve os estados principais de UI usados no frontend-web para páginas e componentes.

1. Loading
   - Mostrado enquanto dados são carregados (skeletons/spinners).
   - Deve ser acessível e ter tamanho previsível para evitar layout shift.

2. Empty / No Data
   - Mensagem amigável com CTA para criar/atualizar conteúdo.
   - Incluir ilustração discreta e instruções.

3. Error
   - Mostrar erro genérico com opção de tentar novamente e um link para suporte.
   - Não exibir mensagens de erro técnicas ao usuário final.

4. Success / Confirmations
   - Uso de toasts ou banners para confirmar ações (salvo, enviado).

5. Form Validation
   - Validação inline com mensagens claras; usar regras do backend para consistência.

Notas:
- Seguir os componentes de design system (botões, modais, toasts) do projeto.
- Priorizar feedback rápido para ações que demoram (ex.: upload, sync).