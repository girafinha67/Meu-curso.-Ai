# Fase 4 — Mapa do curso

## Arquivo novo

- `src/routes/trilha.tsx` (rota `/trilha`) — trilha vertical com uma aula
  por nó, terminando no certificado. Status 100% dinâmico, real, calculado
  por aula:
  - **Concluída** — `lesson_progress.completed = true`
  - **Em andamento** — desbloqueada e `content_viewed = true` (o registro
    já é gravado assim que o aluno abre a aula, em `aula.$lessonId.tsx`)
  - **Disponível** — desbloqueada, ainda não aberta
  - **Bloqueada** — aula anterior ainda não concluída (mesma regra visual
    que já existia no dashboard)
  - **Certificado** — libera quando `course_progress.completed = true`

  Nenhum status é inventado: os quatro estados do seu pedido original
  mapeiam 1:1 pra colunas que já existem no banco.

## Arquivos alterados

- `types/database.ts` — `content_viewed_at` adicionado ao tipo (mesmo caso
  do `completed_at` na Fase 3: a coluna já existia, só faltava no tipo).
- `app-shell.tsx` — novo link "Mapa do curso" no menu da área logada.
- `dashboard.tsx` — link "Ver mapa completo" acima da lista de aulas.
- `badge.tsx` — ajuste de cor: "Concluída" (verde, `success`) e "Em
  andamento" (azul, `progress`) agora usam tons diferentes — antes ficavam
  parecidos demais pra distinguir de relance.

## Próxima fase

Fase 5 — página da aula com sidebar de navegação entre todas as aulas.
