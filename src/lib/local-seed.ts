/**
 * Dados de demonstração do MODO LOCAL (usado quando o Supabase não está configurado).
 * Tudo isso é gravado no localStorage do navegador — nada sai da máquina do visitante.
 */

type Row = Record<string, any>
export type LocalDB = Record<string, Row[]>

const now = () => new Date().toISOString()

interface QSpec {
  type: 'multiple_choice' | 'true_false' | 'multi_select' | 'open'
  prompt: string
  explanation?: string
  model_answer?: string
  options?: [string, boolean][]
}

interface LessonSpec {
  title: string
  description: string
  minutes: number
  objectives: string[]
  concepts: string[]
  conclusion: string
  blocks: { type: string; content: Record<string, unknown> }[]
  questions: QSpec[]
}

const lessons: LessonSpec[] = [
  {
    title: 'O que é criar sites com IA',
    description: 'Entenda o que a IA faz bem, o que ela não faz e como isso muda o jogo para quem vende sites.',
    minutes: 15,
    objectives: ['Entender o papel da IA na criação de sites', 'Saber o que continua sendo trabalho seu', 'Enxergar a oportunidade de mercado'],
    concepts: ['Prompt', 'Geração de código', 'Revisão humana'],
    conclusion: 'A IA acelera a parte braçal. O seu valor está em entender o negócio do cliente e entregar um resultado que funcione.',
    blocks: [
      { type: 'heading', content: { text: 'A IA como sua equipe de produção' } },
      { type: 'paragraph', content: { text: 'Ferramentas de IA conseguem gerar **layouts, textos e código** em minutos. O que antes levava dias agora cabe numa tarde — mas alguém precisa dirigir o processo.' } },
      { type: 'comparison', content: { title: 'Quem faz o quê', left: { title: 'A IA faz', text: 'Gera estrutura, textos e código\nSugere variações de design\nAcelera ajustes repetitivos' }, right: { title: 'Você faz', text: 'Entende o negócio do cliente\nDecide o que entra na página\nRevisa, testa e entrega' } } },
      { type: 'callout', content: { variant: 'tip', title: 'Dica', text: 'Trate a IA como um estagiário muito rápido: ótimo para executar, mas precisa de instruções claras e revisão.' } },
      { type: 'ai_tools', content: {} },
    ],
    questions: [
      { type: 'multiple_choice', prompt: 'Qual é o principal valor que VOCÊ entrega ao usar IA para criar sites?', explanation: 'A IA executa; você entende o negócio, decide e revisa.', options: [['Digitar código mais rápido que a IA', false], ['Entender o negócio do cliente e dirigir o resultado', true], ['Evitar qualquer revisão do que a IA gerou', false]] },
      { type: 'true_false', prompt: 'Verdadeiro ou falso: não é necessário revisar um site gerado por IA antes de entregar ao cliente.', explanation: 'Sempre revise: erros de conteúdo, links quebrados e problemas no celular são comuns.', options: [['Verdadeiro', false], ['Falso', true]] },
      { type: 'open', prompt: 'Explique com suas palavras como a IA muda o trabalho de quem cria sites.', model_answer: 'A IA acelera a produção de layout, texto e código, enquanto o profissional entende o cliente, direciona, revisa e entrega com qualidade.' },
    ],
  },
  {
    title: 'Escrevendo bons prompts para sites',
    description: 'Aprenda a estrutura de um prompt claro que gera páginas melhores já na primeira tentativa.',
    minutes: 20,
    objectives: ['Estruturar um prompt em contexto, objetivo e restrições', 'Iterar sobre o resultado', 'Evitar prompts vagos'],
    concepts: ['Contexto', 'Restrições', 'Iteração'],
    conclusion: 'Prompts específicos geram resultados específicos. Itere em pequenos passos em vez de pedir tudo de uma vez.',
    blocks: [
      { type: 'heading', content: { text: 'A fórmula do prompt' } },
      { type: 'steps', content: { items: [{ title: 'Contexto', text: 'Quem é o cliente, o que vende e para quem.' }, { title: 'Objetivo', text: 'O que a página precisa fazer (ex.: gerar contatos no WhatsApp).' }, { title: 'Restrições', text: 'Cores, tom de voz, seções obrigatórias, tecnologias.' }] } },
      { type: 'comparison', content: { title: 'Vago vs. específico', left: { title: 'Vago', text: 'Faça um site para uma clínica.' }, right: { title: 'Específico', text: 'Crie uma landing page para uma clínica de estética em Curitiba, tom acolhedor, azul e branco, com seção de serviços, depoimentos e botão de WhatsApp.' } } },
      { type: 'code', content: { caption: 'Exemplo de prompt', code: 'Crie uma landing page responsiva em HTML e CSS para [negócio].\nPúblico: [público].\nObjetivo: levar o visitante a clicar no WhatsApp.\nTom: [tom]. Cores: [cores].\nSeções: topo, serviços, depoimentos, contato.' } },
    ],
    questions: [
      { type: 'multi_select', prompt: 'Quais itens fazem parte de um bom prompt para criar um site?', explanation: 'Contexto, objetivo e restrições dão direção à IA.', options: [['Contexto do cliente', true], ['Objetivo da página', true], ['Nenhuma restrição, para a IA ter liberdade total', false], ['Restrições de estilo e seções', true]] },
      { type: 'multiple_choice', prompt: 'Qual abordagem costuma funcionar melhor ao refinar o resultado?', explanation: 'Mudanças pequenas e focadas são mais fáceis de controlar.', options: [['Reescrever o prompt inteiro a cada vez', false], ['Pedir ajustes pequenos e específicos, um de cada vez', true], ['Pedir tudo de novo sem explicar o que mudar', false]] },
      { type: 'open', prompt: 'Escreva um prompt para criar a landing page de uma barbearia local.', model_answer: 'Crie uma landing page responsiva para uma barbearia, com objetivo de agendamento pelo WhatsApp, tom descontraído, seções de serviços, preços, depoimentos e contato.' },
    ],
  },
  {
    title: 'Estrutura de uma página que converte',
    description: 'As seções essenciais de uma landing page e a ordem que ajuda o visitante a tomar uma decisão.',
    minutes: 18,
    objectives: ['Conhecer as seções de uma página de vendas', 'Escrever uma chamada clara', 'Posicionar botões de ação'],
    concepts: ['Proposta de valor', 'Prova social', 'CTA'],
    conclusion: 'Uma boa página responde: o que é, para quem é, por que confiar e o que fazer agora.',
    blocks: [
      { type: 'heading', content: { text: 'O caminho do visitante' } },
      { type: 'diagram', content: { title: 'Fluxo de uma landing page', steps: [{ label: 'Topo', caption: 'Promessa clara' }, { label: 'Benefícios', caption: 'Por que importa' }, { label: 'Prova social', caption: 'Confiança' }, { label: 'CTA', caption: 'Próximo passo' }] } },
      { type: 'list', content: { style: 'check', items: ['**Título** que diz o que a pessoa ganha', '**Botão** visível sem rolar a página', '**Depoimentos** reais, quando existirem', '**Contato** fácil: WhatsApp, e-mail ou formulário'] } },
      { type: 'callout', content: { variant: 'warning', title: 'Atenção', text: 'Não invente depoimentos nem números. Use só o que o cliente puder comprovar.' } },
    ],
    questions: [
      { type: 'multiple_choice', prompt: 'O que o título do topo da página deve comunicar?', explanation: 'O visitante decide em segundos se continua lendo.', options: [['O nome da agência que fez o site', false], ['O benefício principal para o visitante', true], ['Uma lista de todas as tecnologias usadas', false]] },
      { type: 'true_false', prompt: 'Verdadeiro ou falso: inventar depoimentos é uma boa forma de aumentar a confiança.', explanation: 'Depoimentos falsos prejudicam o cliente e a sua reputação.', options: [['Verdadeiro', false], ['Falso', true]] },
    ],
  },
  {
    title: 'Design e identidade visual com IA',
    description: 'Como escolher cores, fontes e imagens com coerência, usando a IA como apoio e não como piloto automático.',
    minutes: 20,
    objectives: ['Definir paleta e tipografia', 'Manter consistência visual', 'Respeitar direitos de imagem'],
    concepts: ['Paleta', 'Tipografia', 'Consistência'],
    conclusion: 'Poucas cores, uma ou duas fontes e muito espaço em branco já resolvem a maioria dos sites.',
    blocks: [
      { type: 'heading', content: { text: 'Menos é mais' } },
      { type: 'cards', content: { items: [{ title: 'Paleta', text: 'Uma cor principal, uma de apoio e neutras.' }, { title: 'Fontes', text: 'Uma para títulos e outra para texto.' }, { title: 'Imagens', text: 'Use bancos livres ou fotos do próprio cliente.' }] } },
      { type: 'callout', content: { variant: 'info', title: 'Direitos de imagem', text: 'Confira a licença de qualquer imagem antes de publicar, inclusive as geradas por IA.' } },
    ],
    questions: [
      { type: 'multi_select', prompt: 'Quais práticas ajudam a manter um visual consistente?', explanation: 'Consistência vem de poucas escolhas bem repetidas.', options: [['Usar uma paleta curta', true], ['Misturar cinco fontes diferentes', false], ['Repetir o mesmo estilo de botões', true]] },
      { type: 'true_false', prompt: 'Verdadeiro ou falso: qualquer imagem encontrada na internet pode ser usada livremente.', explanation: 'Imagens têm licenças. Use bancos livres ou fotos autorizadas.', options: [['Verdadeiro', false], ['Falso', true]] },
    ],
  },
  {
    title: 'Publicando o site: hospedagem e domínio',
    description: 'Do arquivo no computador até o endereço no ar: hospedagem, domínio e verificação final.',
    minutes: 18,
    objectives: ['Diferenciar hospedagem e domínio', 'Publicar um site estático', 'Fazer um checklist antes de entregar'],
    concepts: ['Hospedagem', 'Domínio', 'Checklist'],
    conclusion: 'Publicar é simples; o cuidado está em testar no celular e conferir tudo antes de avisar o cliente.',
    blocks: [
      { type: 'heading', content: { text: 'Hospedagem e domínio' } },
      { type: 'paragraph', content: { text: 'A **hospedagem** é onde os arquivos do site ficam. O **domínio** é o endereço que as pessoas digitam. São coisas diferentes, e o cliente deve ser o dono do domínio.' } },
      { type: 'steps', content: { items: [{ title: 'Gerar os arquivos', text: 'Exporte o site pronto.' }, { title: 'Enviar à hospedagem', text: 'Use um serviço de hospedagem de sites estáticos.' }, { title: 'Apontar o domínio', text: 'Configure o DNS conforme a hospedagem pede.' }] } },
      { type: 'checklist', content: { title: 'Antes de entregar', items: ['Testei no celular', 'Todos os links funcionam', 'Botão de contato abre o WhatsApp certo', 'Título e descrição da página preenchidos'] } },
    ],
    questions: [
      { type: 'multiple_choice', prompt: 'Qual a diferença entre hospedagem e domínio?', explanation: 'Hospedagem guarda os arquivos; domínio é o endereço.', options: [['São a mesma coisa', false], ['Hospedagem guarda os arquivos; domínio é o endereço', true], ['Domínio guarda os arquivos; hospedagem é o endereço', false]] },
      { type: 'open', prompt: 'Cite três itens que você conferiria antes de entregar um site ao cliente.', model_answer: 'Testar no celular, conferir links e botões de contato, revisar textos e preencher título e descrição da página.' },
    ],
  },
  {
    title: 'Encontrando clientes (prospecção)',
    description: 'Como achar negócios locais que precisam de site e abordar de forma respeitosa e objetiva.',
    minutes: 20,
    objectives: ['Identificar negócios com presença online fraca', 'Montar uma abordagem curta', 'Acompanhar contatos'],
    concepts: ['Prospecção', 'Abordagem', 'Follow-up'],
    conclusion: 'Prospecção é volume com respeito: contatos pessoais, curtos e com algo útil para mostrar.',
    blocks: [
      { type: 'heading', content: { text: 'Onde procurar' } },
      { type: 'list', content: { style: 'bullet', items: ['Negócios locais sem site ou com site ruim', 'Perfis de redes sociais sem link de contato', 'Indicações de conhecidos'] } },
      { type: 'example', content: { title: 'Mensagem de abordagem', text: 'Olá! Vi o perfil da sua barbearia e notei que ainda não há um site com agendamento. Montei um modelo rápido para você ver. Posso te mostrar?' } },
      { type: 'callout', content: { variant: 'tip', title: 'Follow-up', text: 'Muita venda acontece no segundo ou terceiro contato. Anote datas e responda rápido.' } },
    ],
    questions: [
      { type: 'multiple_choice', prompt: 'Qual característica uma boa mensagem de abordagem tem?', explanation: 'Curta e com algo concreto para mostrar.', options: [['Ser longa e cheia de termos técnicos', false], ['Ser curta, pessoal e mostrar algo útil', true], ['Ser idêntica para todos, sem personalizar', false]] },
      { type: 'true_false', prompt: 'Verdadeiro ou falso: fazer um segundo contato é falta de educação.', explanation: 'Um follow-up educado é parte normal do processo comercial.', options: [['Verdadeiro', false], ['Falso', true]] },
    ],
  },
  {
    title: 'Precificação, proposta e entrega',
    description: 'Como cobrar, apresentar a proposta e entregar o projeto sem surpresas para os dois lados.',
    minutes: 22,
    objectives: ['Definir preço com base em valor e escopo', 'Escrever uma proposta clara', 'Fechar a entrega com aceite'],
    concepts: ['Escopo', 'Proposta', 'Aceite'],
    conclusion: 'Escopo escrito evita conflito. Combine o que está incluso, prazos, número de revisões e forma de pagamento.',
    blocks: [
      { type: 'heading', content: { text: 'Escopo antes de preço' } },
      { type: 'paragraph', content: { text: 'Antes de falar em valor, deixe claro **o que está incluso**: número de páginas, revisões, prazo e o que fica de fora.' } },
      { type: 'checklist', content: { title: 'Itens da proposta', items: ['Descrição do que será entregue', 'Prazo de entrega', 'Número de revisões', 'Valor e forma de pagamento', 'O que não está incluso'] } },
      { type: 'callout', content: { variant: 'warning', title: 'Cuidado', text: 'Não comece sem combinar o escopo por escrito. Mudanças depois devem virar um novo combinado.' } },
      { type: 'dex_cta', content: {} },
    ],
    questions: [
      { type: 'multi_select', prompt: 'O que deve constar em uma proposta de site?', explanation: 'Escopo, prazo, revisões, valor e exclusões evitam mal-entendidos.', options: [['Escopo e prazo', true], ['Número de revisões', true], ['Valor e forma de pagamento', true], ['Nada além do preço', false]] },
      { type: 'open', prompt: 'Por que é importante definir o escopo por escrito antes de começar o projeto?', model_answer: 'Para alinhar expectativas, evitar mudanças sem custo, definir prazos e revisões e proteger os dois lados em caso de divergência.' },
    ],
  },
]

export function buildSeed(): LocalDB {
  const t = now()
  const courseId = 'course-sitesia'
  const db: LocalDB = {
    auth_users: [],
    profiles: [],
    user_roles: [],
    courses: [
      {
        id: courseId,
        slug: 'sitesia',
        title: 'SitesIA — Aprenda a criar e vender sites com IA',
        subtitle: 'Do zero ao primeiro cliente',
        description: 'Curso prático para criar sites profissionais com IA e transformar isso em renda.',
        hours_load: 20,
        price_cents: 19700,
        compare_price_cents: 29700,
        cover_url: null,
        is_published: true,
        created_at: t,
      },
    ],
    lessons: [],
    lesson_blocks: [],
    questions: [],
    question_options: [],
    answers: [],
    lesson_progress: [],
    course_progress: [],
    enrollments: [],
    orders: [],
    certificates: [],
    achievements: [
      { id: 'ach-1', key: 'first_lesson', title: 'Primeiro passo', description: 'Conclua sua primeira aula.', icon: 'Rocket', xp_bonus: 25, condition_type: 'lessons_completed', condition_value: 1, is_active: true, position: 1 },
      { id: 'ach-2', key: 'three_lessons', title: 'No ritmo', description: 'Conclua 3 aulas.', icon: 'Flame', xp_bonus: 50, condition_type: 'lessons_completed', condition_value: 3, is_active: true, position: 2 },
      { id: 'ach-3', key: 'perfect', title: 'Nota máxima', description: 'Acerte todas as questões de uma aula.', icon: 'Star', xp_bonus: 50, condition_type: 'perfect_quizzes', condition_value: 1, is_active: true, position: 3 },
      { id: 'ach-4', key: 'course', title: 'Curso concluído', description: 'Conclua todas as aulas.', icon: 'Trophy', xp_bonus: 200, condition_type: 'course_completed', condition_value: 1, is_active: true, position: 4 },
    ],
    user_achievements: [],
    ai_evaluations: [],
    site_settings: [
      { key: 'general', value: { platform_name: 'SitesIA', tagline: 'Aprenda a criar e vender sites com IA', logo_url: '', favicon_url: '', seo_title: 'SitesIA', seo_description: 'Curso prático de sites com IA', support_email: 'contato@sitesia.com', instagram_url: '', youtube_url: '', whatsapp_url: '', primary_color: '#4f46e5' }, is_public: true },
      { key: 'landing', value: { hero_title: 'Aprenda a criar e vender sites profissionais usando Inteligência Artificial.', hero_subtitle: 'Do zero até o primeiro cliente pagante: use IA para criar sites profissionais e transforme isso em uma habilidade que você vende de verdade.', cta_primary: 'Quero aprender agora', cta_secondary: 'Ver o currículo', learn_items: ['Criar páginas profissionais usando IA', 'Escrever prompts que geram bons resultados', 'Publicar um site no ar', 'Encontrar e abordar clientes locais', 'Montar propostas e precificar seu trabalho', 'Entregar o projeto com segurança'], audience_items: ['Iniciantes que querem uma nova fonte de renda', 'Freelancers que querem ganhar velocidade', 'Pequenos empreendedores que querem o próprio site'], audience_note: 'Não é preciso saber programar.', faq: [{ q: 'Preciso saber programar?', a: 'Não. O curso começa do zero e usa a IA para acelerar a parte técnica.' }, { q: 'Por quanto tempo tenho acesso?', a: 'O acesso é contínuo, para você estudar no seu ritmo.' }, { q: 'Recebo certificado?', a: 'Sim, ao concluir todas as aulas você recebe um certificado com código de verificação.' }], instructor_name: 'Equipe SitesIA', instructor_title: 'Instrutores', instructor_bio: 'Profissionais que criam e vendem sites usando IA no dia a dia.', instructor_photo_url: '', guarantee_text: 'Garantia de 7 dias: se não gostar, devolvemos o valor.', testimonials: [] }, is_public: true },
      { key: 'dex', value: { enabled: false, name: '', title: '', description: '', promo_text: '', cta_text: 'Conhecer', url: '', logo_url: '', image_url: '' }, is_public: true },
      { key: 'gamification', value: { xp_lesson_completed: 100, xp_perfect_quiz: 50, xp_question_answered: 10, xp_course_completed: 200, levels: [{ name: 'Iniciante', min_xp: 0 }, { name: 'Aprendiz', min_xp: 150 }, { name: 'Criador', min_xp: 400 }, { name: 'Profissional', min_xp: 800 }, { name: 'Mestre', min_xp: 1200 }] }, is_public: true },
      { key: 'unlock_rules', value: { min_score_percent: 60, require_content_viewed: true, require_all_questions: true, allow_retry_open_questions: true, max_attempts_per_question: 3 }, is_public: true },
      { key: 'ai_tools', value: { categories: [{ name: 'Geração de páginas', tools: [{ name: 'Assistentes de IA de código', note: 'Geram HTML, CSS e JavaScript a partir de um prompt.', url: '' }] }, { name: 'Imagens e design', tools: [{ name: 'Bancos de imagens livres', note: 'Confira sempre a licença de uso.', url: '' }] }], note: 'Ferramentas mudam rápido: teste e escolha as que fazem sentido para você.' }, is_public: true },
      { key: 'certificate', value: { course_name: 'SitesIA — Criação e venda de sites com IA', hours_load: 20, instructor_name: 'Equipe SitesIA', instructor_title: 'Instrutores', signature_text: '', issuer_name: 'SitesIA' }, is_public: true },
      { key: 'payment', value: { provider: 'local', enabled: true, pix_enabled: true, card_enabled: true, max_installments: 1 }, is_public: true },
    ],
  }

  lessons.forEach((l, i) => {
    const n = i + 1
    const lessonId = `lesson-${n}`
    db.lessons.push({
      id: lessonId,
      course_id: courseId,
      position: n,
      title: l.title,
      slug: `aula-${n}`,
      description: l.description,
      duration_minutes: l.minutes,
      cover_url: null,
      objectives: l.objectives,
      key_concepts: l.concepts,
      conclusion: l.conclusion,
      min_score_percent: null,
      is_published: true,
      created_at: t,
    })
    l.blocks.forEach((b, j) => {
      db.lesson_blocks.push({ id: `block-${n}-${j + 1}`, lesson_id: lessonId, position: j + 1, type: b.type, content: b.content })
    })
    l.questions.forEach((q, j) => {
      const qid = `q-${n}-${j + 1}`
      db.questions.push({
        id: qid,
        lesson_id: lessonId,
        position: j + 1,
        type: q.type,
        prompt: q.prompt,
        context: null,
        explanation: q.explanation ?? null,
        model_answer: q.model_answer ?? null,
        ai_criteria: null,
        points: 10,
        is_active: true,
        created_at: t,
      })
      q.options?.forEach(([text, correct], k) => {
        db.question_options.push({ id: `opt-${n}-${j + 1}-${k + 1}`, question_id: qid, position: k + 1, text, is_correct: correct, feedback: null })
      })
    })
  })

  return db
}
