# Fase 1 — Redesign visual global

## O que mudou (só design system, zero lógica/backend tocado)

**Arquivos alterados:** `tailwind.config.ts`, `src/styles/global.css`,
`src/components/ui/button.tsx`, `card.tsx`, `progress-bar.tsx`, `states.tsx`,
`input.tsx`, `textarea.tsx`.
**Arquivo novo:** `src/components/ui/badge.tsx` (pílulas de status —
concluída/em andamento/bloqueada/XP/IA — vai ser usado a partir da Fase 3).

Nada foi removido: todas as props, nomes de export e classes utilitárias
(`gradient-hero`, `animate-fade-up`, `animate-scale-in`, `focus-ring`)
continuam existindo com os mesmos nomes. Como **100% do app já consumia a cor
primária pela escala numerada do Tailwind** (`bg-primary-600`,
`text-primary-700`, etc. — nunca a cor "crua"), troquei só essa escala no
`tailwind.config.ts` e a plataforma inteira (landing, dashboard, admin,
aulas, checkout, certificado) já herda a nova identidade automaticamente,
sem precisar editar cada tela uma por uma.

## Direção de design

> Atualização: a proposta inicial trocava a marca para verde. A pedido do
> usuário, a cor de marca voltou a ser o **azul original** (`#2563eb`/
> `hsl(217 91% 60%)`). O restante da Fase 1 (tipografia, sombras, animações,
> tokens novos de gamificação/IA) foi mantido.

- **Cor de marca:** azul original do projeto (`#2563eb`).
- **Dourado de gamificação** (`accent`, `#F0A202`): reservado só para XP,
  nível, streak e conquistas — não se mistura com o verde de "concluído"
  nem com o laranja de aviso do sistema.
- **Roxo de IA** (`ai`, `#6D5EF5`): reservado para marcar conteúdo
  gerado/avaliado por IA (feedback de resposta aberta, seção de ferramentas).
- **Tipografia:** títulos em Sora (mais geométrica e com personalidade),
  texto corrido continua em Inter (legibilidade). Import via Google Fonts
  no `global.css`.
- **Fundo:** branco quente (não `#fff` puro) — sensação mais premium.
- **Sombras em duas camadas** (`shadow-soft`, `shadow-elevated`, `shadow-glow`)
  no lugar da sombra cinza plana padrão.
- Skeleton com brilho animado, cards com elevação sutil no hover
  (`card-interactive`, opt-in — não em todo card, só nos clicáveis),
  `prefers-reduced-motion` respeitado.

## Limitação deste ambiente

Não tenho acesso à internet nem `node_modules` aqui, então não rodei
`npm install` / `npm run dev` para conferir visualmente. Rode localmente:

```bash
npm install
npm run dev
```

e me avise qualquer coisa estranha (ex: import de fonte bloqueado por CSP,
contraste em algum componente específico) para eu ajustar.

## Próximas fases (ordem do seu pedido original)

2. Landing page (hero com mockup do dashboard, jornada 01→06, currículo,
   depoimentos, FAQ, garantia)
3. Dashboard do aluno (saudação, progresso dinâmico, XP, streak)
4. Mapa do curso (jornada visual aula a aula)
5. Página da aula + sidebar de navegação
6–9. Exercícios, gamificação (conquistas/streak/confete), notificações
10. Perfil, certificado, checkout, header da área logada, responsividade,
    revisão final

Posso seguir direto para a Fase 2 (landing page) na próxima mensagem.
