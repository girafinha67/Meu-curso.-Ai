# SitesIA — Plataforma de Curso (Criação e Venda de Sites com IA)

Plataforma completa (frontend + backend + banco de dados + auth + pagamento +
IA + painel admin) para vender e hospedar um curso online.

**Stack:** Vite + React 19 + TanStack Router/Start + Tailwind CSS + Supabase
(Postgres, Auth, Edge Functions) + Mercado Pago.

## Estado atual

- ✅ Banco de dados criado e populado (7 aulas completas) em um projeto
  Supabase **próprio e independente**: `osygkvldmhmjxdanevwq`
  (`https://osygkvldmhmjxdanevwq.supabase.co`).
- ✅ 4 Edge Functions escritas **e já publicadas/ativas** nesse projeto:
  `submit-answer`, `complete-lesson`, `create-checkout`, `payment-webhook`.
- ✅ Frontend completo: landing, autenticação, dashboard, aula com quiz (4
  tipos de questão), perfil, certificado, checkout, painel admin (CMS de
  aulas/questões, alunos, vendas, certificados, configurações incluindo
  Dex.ai).
- ⚠️ Pendente de você: configurar as *secrets* de IA e pagamento (veja abaixo)
  — sem elas, o sistema funciona com fallback seguro (avaliação por IA cai
  num aviso amigável; checkout retorna erro amigável pedindo configuração).

## 1. Instalação local

```bash
npm install
cp .env.example .env   # já preenchido com a URL/chave do seu Supabase — confira
npm run dev
```

Abra `http://localhost:3000`.

## 2. Variáveis de ambiente

### Frontend (`.env`)
Já preenchido com os valores do projeto Supabase criado para você:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_APP_URL`

### Backend / Edge Functions (secrets do Supabase — **nunca no `.env` do frontend**)
Configure em Supabase Dashboard → Project Settings → Edge Functions → Secrets
(ou via CLI: `supabase secrets set NOME=valor --project-ref osygkvldmhmjxdanevwq`):

| Variável | Para quê | Obrigatória? |
|---|---|---|
| `SUPABASE_URL` | já configurada automaticamente pelo Supabase | sim (auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | já configurada automaticamente pelo Supabase | sim (auto) |
| `AI_API_KEY` | avaliação de respostas abertas por IA (usamos a API da Anthropic no código; troque o endpoint em `submit-answer/index.ts` se preferir outro provedor) | não — sem ela, cai em fallback amigável |
| `MERCADOPAGO_ACCESS_TOKEN` | criar cobranças Pix/cartão | não — sem ela, checkout retorna erro amigável |
| `MERCADOPAGO_WEBHOOK_SECRET` | (opcional) validar assinatura do webhook, se você implementar essa checagem extra | não |
| `APP_URL` | URL pública do seu site, usada nos back_urls do Mercado Pago | recomendada em produção |

**Nunca** coloque essas chaves no código ou no `.env` do frontend.

## 3. Banco de dados

O schema completo (tabelas, RLS, funções) e o seed das 7 aulas já foram
aplicados via migrations no projeto Supabase. Se precisar recriar em outro
projeto, os arquivos SQL aplicados estão documentados no histórico de
migrations do projeto `osygkvldmhmjxdanevwq` (schema → RLS → seed).

Tabelas principais: `profiles`, `user_roles`, `courses`, `enrollments`,
`lessons`, `lesson_blocks`, `questions`, `question_options`, `answers`,
`ai_evaluations`, `lesson_progress`, `course_progress`, `achievements`,
`user_achievements`, `orders`, `payments`, `certificates`, `site_settings`.

## 4. Criando o primeiro administrador

Não existe senha fixa de admin no código. Para promover um usuário:

1. Cadastre-se normalmente pelo `/cadastro` do site.
2. No Supabase Dashboard → SQL Editor, rode (trocando o e-mail):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'seu-email@exemplo.com'
on conflict do nothing;
```

3. Faça login novamente — o menu "Painel admin" aparece automaticamente.

## 5. Deploy das Edge Functions (se precisar redeployar)

```bash
supabase link --project-ref osygkvldmhmjxdanevwq
supabase functions deploy submit-answer
supabase functions deploy complete-lesson
supabase functions deploy create-checkout
supabase functions deploy payment-webhook --no-verify-jwt
```

## 6. Configurando o pagamento (Mercado Pago)

1. Crie uma conta/aplicação em https://www.mercadopago.com.br/developers
2. Copie o **Access Token de produção** (ou teste, para simular).
3. Configure como secret: `MERCADOPAGO_ACCESS_TOKEN`.
4. No painel do Mercado Pago, registre a URL de webhook:
   `https://osygkvldmhmjxdanevwq.supabase.co/functions/v1/payment-webhook`

## 7. Configurando a avaliação por IA

1. Gere uma chave de API (por padrão o código chama a API da Anthropic).
2. Configure como secret: `AI_API_KEY`.
3. Ajuste o prompt/critérios em **Admin → Configurações** ou diretamente na
   tabela `site_settings` (chave `evaluation`).

## 8. Adicionando novas aulas

Pelo **Admin → Aulas**, ou diretamente no banco:
1. Insira uma linha em `lessons` (defina `position` corretamente).
2. Insira os blocos de conteúdo em `lesson_blocks` (tipos suportados:
   `heading`, `paragraph`, `callout`, `example`, `cards`, `comparison`,
   `list`, `checklist`, `steps`, `diagram`, `code`, `image`, `ai_tools`,
   `dex_cta`).
3. Insira as questões em `questions` + `question_options`.

O sistema de desbloqueio, XP e conclusão funciona automaticamente para
qualquer aula nova — não é preciso alterar código.

## 9. Deploy do frontend em produção

Qualquer hospedagem compatível com Vite/Node (Vercel, Netlify, Cloudflare
Pages) funciona. Configure as mesmas variáveis `VITE_*` do `.env` como
variáveis de ambiente da hospedagem, aponte o domínio e ative HTTPS
(a maioria ativa automaticamente).

## 10. Segurança — o que já está garantido

- Toda correção de questões e cálculo de XP/progresso acontece nas Edge
  Functions com a `service role key` — o aluno não consegue alterar nota,
  progresso ou papel de admin pelo navegador.
- RLS ativado em todas as tabelas sensíveis.
- Liberação de acesso ao curso só acontece após confirmação **server-side**
  do pagamento (webhook), nunca por confirmação vinda do navegador.
- Nenhuma chave secreta (`AI_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN`,
  `SUPABASE_SERVICE_ROLE_KEY`) é usada ou exposta no frontend.
