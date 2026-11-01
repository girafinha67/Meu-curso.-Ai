# Fase 5 — Página da aula + sidebar de navegação

## Arquivos novos

- `src/lib/lesson-status.ts` — status de aula (concluída/em andamento/
  disponível/bloqueada) extraído da Fase 4 pra um util compartilhado, agora
  usado tanto por `/trilha` quanto pela nova sidebar.
- `src/components/course/course-lesson-nav.tsx` — sidebar com a lista
  completa das aulas do curso e status real de cada uma. Sticky no desktop,
  menu expansível no mobile (mesmo padrão do índice que já existia).

## Arquivos alterados

- `aula.$lessonId.tsx` — cabeçalho agora mostra: link "Voltar ao curso",
  nome do curso, "Aula X de Y", duração da aula e progresso geral do curso
  (`course_progress.percent`, real). A nova sidebar de aulas foi adicionada
  **ao lado** do índice "Nesta aula" que já existia (Introdução/Conteúdo/
  Exercícios/Conclusão) — nada foi removido, só passou a ter as duas
  navegações.

## O que não mexi (não tinha "módulo" pra mostrar)

O cabeçalho pedia "módulo atual" — como o banco não separa aulas em módulos
(é uma lista única por posição, mesma limitação já observada na Fase 3),
mostrei o nome do curso no lugar. Se quiser módulos de verdade, é uma
mudança de schema (tabela `modules` + `lessons.module_id`), não só de tela.

## Encontrado pelo caminho (fica pra Fase 6)

Em `<Quiz questions={questions} lessonId={lessonId} answeredIds={new Set()} />`
o `answeredIds` está sempre vazio — se o aluno voltar numa aula que já
respondeu antes, o quiz não sabe disso. É um ajuste de dados, não de
layout, então deixei pra mexer na Fase 6 (Exercícios), que é sobre isso.

## Próxima fase

Fase 6 — exercícios (múltipla escolha, V/F, múltipla seleção, resposta
aberta com avaliação por IA).
