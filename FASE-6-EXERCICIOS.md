# Fase 6 — Exercícios

## Bug real corrigido: XP duplicado em respostas abertas

Em `supabase/functions/submit-answer/index.ts`, `handleOpenAnswer` concedia
10 XP **toda vez que a função rodava**, mesmo reenviando a mesma resposta
(coisa que já acontecia sempre que a aula era reaberta, por causa do bug do
`answeredIds` corrigido nesta mesma fase). Corrigido: XP só é dado na
primeira vez que aquela questão é respondida por aquele aluno
(`if (!existingAnswer)`), igual já funcionava pras questões fechadas.
**Isso precisa ser reimplantado**: `supabase functions deploy submit-answer`.

## Bug corrigido: `answeredIds` sempre vazio (achado na Fase 5)

- `src/hooks/use-answers.ts` (novo) — busca as respostas que o aluno já deu
  na aula e recupera o resultado completo de cada uma **reaproveitando a
  idempotência que a própria Edge Function já tinha**: reenvia
  `selected_option_ids`/`open_text` (dados que já são do próprio aluno) pro
  mesmo `submit-answer`, que devolve o resultado salvo sem repontuar e sem
  dar XP de novo. Não foi criada nenhuma rota nova nem exposto gabarito
  pelo cliente — o fluxo de segurança original continua intacto.
- Os 4 componentes de questão (`multiple-choice`, `true-false`,
  `multi-select`, `open-answer`) agora aceitam `initialSelectedOptionIds` /
  `initialText` + `initialResult`, pra já nascerem no estado "respondida"
  quando for o caso.
- `quiz.tsx` reescrito pra usar isso — reabrir uma aula já respondida agora
  mostra o resultado de cada questão em vez de um formulário em branco.

## Melhorias de interface

- "Questão X de Y" agora em `Badge`, com a pontuação da questão ao lado.
- Toast "+XP" (usa a animação `toast-in` da Fase 1) aparece no canto
  superior ao responder certo uma questão nova.

## O que já estava bom e não mexi

Os 4 tipos de questão (múltipla escolha, V/F, múltipla seleção, resposta
aberta) já tratavam corretamente: mostrar acerto/erro, destacar a opção
certa, avaliação por IA com nota/pontos fortes/a melhorar pras respostas
abertas, e nunca expor a chave de IA no frontend (fica só na Edge Function).
Não reescrevi essa lógica, só corrigi os dois bugs acima e ajustei o visual.

## Próxima fase

Fase 7 — gamificação (toasts de conquista desbloqueada, tela de conclusão
de curso).
