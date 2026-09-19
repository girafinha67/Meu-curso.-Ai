# Fase 3 — Dashboard do aluno

## Descoberta importante: `completed_at` já existe no banco

A Edge Function `complete-lesson` já grava `completed_at` em `lesson_progress`
e `course_progress` — só o *tipo* TypeScript do frontend não tinha esse
campo (por isso a landing/dashboard nunca usavam essa data). Adicionei o
campo em `types/database.ts` e isso abriu a porta pra uma **sequência de
estudos (streak) real**, sem precisar criar nenhuma tabela nova.

## Arquivos novos

- `src/components/course/streak-card.tsx` — 🔥 streak + últimos 7 dias com
  os dias estudados destacados.

## Arquivos alterados

- `types/database.ts` — `completed_at` adicionado a `LessonProgress` e
  `CourseProgress` (campos que já existiam no banco).
- `use-progress.ts` — novo `useStudyStreak`: conta dias consecutivos com
  pelo menos uma aula concluída, calculado a partir de `completed_at` real.
- `level-card.tsx` — agora usa o tom dourado (`accent`) reservado à
  gamificação desde a Fase 1, em vez do azul do progresso do curso — fica
  visualmente claro que XP/nível é uma coisa e progresso do curso é outra.
- `dashboard.tsx` — redesenhado: saudação, card "continue de onde parou"
  maior, grid de estatísticas (aulas concluídas, restantes, nota média,
  tempo estudado, nível, streak), lista de aulas (mantida), conquistas com
  badge "Conquistada"/"Bloqueada".

## O que ficou de fora, e por quê

- **Tempo estudado**: a plataforma não cronometra tempo de estudo de
  verdade. Mostro uma **estimativa** (soma da duração das aulas já
  concluídas) e deixo isso explícito no rótulo ("estimado") — não é um
  número inventado, mas também não é um relógio real. Se quiser precisão,
  precisaria de um evento de "tempo em tela" por aula, o que é mudança de
  arquitetura, não só de tela.
- **"Progresso por módulo"**: o banco não tem conceito de módulo — as aulas
  são uma lista única (`course_id` + `position`). Não criei módulos falsos;
  se quiser essa camada, dá pra adicionar uma tabela `modules` de verdade
  numa fase de banco, mas não inventei isso na tela.

## Próxima fase

Fase 4 — mapa visual do curso (a jornada aula a aula, ✓ / ▶ / 🔒 / 🏆).
