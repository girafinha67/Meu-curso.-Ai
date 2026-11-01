# Fase 9 — Checkout + navegação da área logada

## AppShell reescrito

- Nav principal: Dashboard / Mapa do curso / Conquistas (a última leva pra
  `/perfil#conquistas` — não criei uma página nova só pra isso, reaproveitei
  a seção que já existe no perfil).
- Sino de notificações **com dados reais**: mostra as últimas conquistas
  desbloqueadas (`user_achievements.earned_at`) e o certificado emitido
  (`certificates.issued_at`) — sem tabela nova, sem estado de lido/não-lido
  inventado. Se não houver nada, mostra "Nenhuma notificação por enquanto."
- Avatar agora abre um dropdown: Meu perfil, Certificados, Configurações,
  Sair — como pedido. "Sair" saiu da navegação principal e foi pra dentro
  do menu da conta (some no mobile permanece acessível no menu hambúrguer).

## Checkout

- Nada da integração de pagamento foi tocado — mesma chamada
  `supabase.functions.invoke('create-checkout', ...)`, mesmos redirecionamentos.
- Botão principal agora diz "Garantir meu acesso" (como pedido), com resumo
  do curso, lista do que está incluso e o preço "de/por" quando há desconto
  configurado.
- Contagem de aulas no resumo agora é real (`lessons.length`), não mais um
  "7" fixo no texto.

## Próxima fase

Fase 10 — revisão de responsividade e revisão final.
