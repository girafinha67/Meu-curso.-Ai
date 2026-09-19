# Fase 2 — Landing page

## Arquivos novos

- `src/components/landing/dashboard-mockup.tsx` — mockup visual do dashboard
  no hero (progresso, aula atual, XP, streak, certificado). Números fixos —
  é uma prévia ilustrativa do produto, não uma tela real com dados de
  alguém.
- `src/components/landing/capabilities-section.tsx` — "O que você vai
  conseguir fazer" (4 cards).
- `src/components/landing/journey-section.tsx` — "Do zero ao primeiro
  cliente" (01→06).
- `src/components/landing/benefits-section.tsx` — benefícios reais da
  plataforma (feedback por IA, progresso, XP/conquistas, certificado — todos
  recursos que já existem no banco, nada inventado).
- `src/components/landing/testimonials-section.tsx` — seção de depoimentos.
  **Só aparece quando existirem depoimentos reais** em
  `site_settings.landing.testimonials`; com a chave vazia ela não renderiza
  nada (mesmo padrão que o FAQ já usava). Ainda não há uma tela de admin
  para cadastrar isso — hoje dá pra popular direto na tabela `site_settings`,
  igual ao FAQ. Se quiser, faço o campo no admin numa próxima fase.
- `src/components/landing/security-section.tsx` — "compra segura": Mercado
  Pago, acesso imediato, suporte, e o `guarantee_text` (se o admin tiver
  preenchido — nada de garantia inventada).
- `src/components/landing/landing-page.tsx` — composição única da página.
  `index.tsx` (`/`) e `curso.tsx` (`/curso`) já renderizavam exatamente o
  mesmo conteúdo duplicado; agora os dois usam este componente compartilhado.

## Arquivos alterados

- `hero-section.tsx` — layout em duas colunas (texto + mockup), mantendo
  todo o conteúdo original (badge, título, subtítulo, os dois CTAs, o trio
  "Sites com IA / Prospecção real / 7 aulas práticas").
- `curriculum-section.tsx` — cada aula agora mostra até 3 objetivos reais
  (campo `objectives` que já existia no banco e não era usado na landing),
  selo "Após a matrícula", e a contagem real de exercícios **quando a
  consulta tiver permissão de leitura** (ver nota técnica abaixo).
- `pricing-cta-section.tsx` — visual mais premium; removi a linha de
  garantia duplicada porque ela já aparece, mais completa, na nova seção de
  segurança logo acima.
- `learn-section.tsx`, `audience-section.tsx`, `faq-section.tsx` — só
  polimento visual (fonte dos títulos, sombras), zero mudança de conteúdo
  ou lógica.
- `use-course.ts` — novo hook `useLessonQuestionCounts` (ver nota técnica).
- `types/database.ts` — campo `testimonials` adicionado (opcional) ao tipo
  de `landing`.

## Nota técnica: contagem de exercícios no currículo

Não tenho acesso ao seu Supabase real neste ambiente, então não sei se a
tabela `questions` permite leitura pública (RLS). Implementei a busca da
contagem como uma consulta **isolada e best-effort**: se a permissão não
existir, ela falha em silêncio e o número simplesmente não aparece —
nunca inventa uma quantidade. Teste localmente; se o número não aparecer,
é só me avisar (ou ajustar a policy de SELECT de `questions` para a role
`anon`, se quiser esse dado público).

## Ordem final da página

Hero → O que você vai conseguir fazer → Jornada (01–06) → O que você vai
aprender → Para quem é → Currículo → Benefícios → Depoimentos (se houver) →
FAQ → Compra segura → Preço/CTA final.

## Pendências para as próximas fases

- Admin: campo para cadastrar depoimentos (hoje só via tabela).
- Fases 3–10 do pedido original seguem como combinado.
