// Definição de categorias com ícone, cor e descrição

export const categories = [
  { id: "cumprimentos", name: "Cumprimentos", icon: "👋", color: "#8b5cf6", description: "Olá, tchau e expressões básicas" },
  { id: "numeros", name: "Números", icon: "🔢", color: "#3b82f6", description: "Conte de 1 a 10 e além" },
  { id: "cores", name: "Cores", icon: "🎨", color: "#ec4899", description: "Aprenda todas as cores" },
  { id: "animais", name: "Animais", icon: "🐾", color: "#f59e0b", description: "Cães, gatos e muito mais" },
  { id: "comidas", name: "Comidas", icon: "🍕", color: "#ef4444", description: "Pizza, arroz, frutas..." },
  { id: "bebidas", name: "Bebidas", icon: "🥤", color: "#06b6d4", description: "Água, café, suco..." },
  { id: "familia", name: "Família", icon: "👨‍👩‍👧‍👦", color: "#10b981", description: "Mãe, pai, irmãos..." },
  { id: "casa", name: "Casa", icon: "🏠", color: "#f97316", description: "Porta, janela, cozinha..." },
  { id: "escola", name: "Escola", icon: "🏫", color: "#6366f1", description: "Professor, livro, aula..." },
  { id: "trabalho", name: "Trabalho", icon: "💼", color: "#64748b", description: "Escritório, chefe, reunião..." },
  { id: "roupas", name: "Roupas", icon: "👕", color: "#d946ef", description: "Camisa, sapato, vestido..." },
  { id: "corpo", name: "Corpo Humano", icon: "🧍", color: "#14b8a6", description: "Cabeça, mão, coração..." },
  { id: "lugares", name: "Lugares", icon: "📍", color: "#e11d48", description: "Hospital, loja, parque..." },
  { id: "transportes", name: "Transportes", icon: "🚗", color: "#0ea5e9", description: "Carro, ônibus, avião..." },
  { id: "verbos", name: "Verbos Básicos", icon: "⚡", color: "#eab308", description: "Comer, dormir, falar..." },
  { id: "sentimentos", name: "Sentimentos", icon: "😊", color: "#a855f7", description: "Feliz, triste, cansado..." },
  { id: "perguntas", name: "Perguntas Comuns", icon: "❓", color: "#22c55e", description: "O quê, onde, quando..." },
  { id: "frases", name: "Frases do Cotidiano", icon: "💬", color: "#8b5cf6", description: "Frases úteis do dia a dia" },
  { id: "tecnologia", name: "Tecnologia & Ciência", icon: "🛰️", color: "#06b6d4", description: "Internet, gravidade, código..." },
  { id: "charadas", name: "Charadas & Enigmas", icon: "🧩", color: "#a855f7", description: "Segredo, tempo, fogo..." },
  { id: "geografia", name: "Clima & Geografia", icon: "🌋", color: "#3b82f6", description: "Vulcão, oceano, estrelas..." },
  { id: "sociedade", name: "Sociedade & Cultura", icon: "⚖️", color: "#64748b", description: "Governo, lei, música..." },
  { id: "fisica", name: "Química & Materiais", icon: "🧪", color: "#10b981", description: "Ouro, vidro, plástico..." },
  { id: "ferramentas", name: "Ferramentas & Utensílios", icon: "🛠️", color: "#f59e0b", description: "Martelo, faca, tesoura..." },
  { id: "esportes", name: "Esportes & Jogos", icon: "⚽", color: "#ef4444", description: "Bola, xadrez, corrida..." },
  { id: "crimes", name: "Crimes & Investigação", icon: "🕵️", color: "#64748b", description: "Ladrão, veneno, pista..." },
  { id: "artes", name: "Artes & Mídia", icon: "🎨", color: "#ec4899", description: "Pintura, teatro, poema..." },

  // Categorias avançadas (níveis 51-100)
  { id: "negocios", name: "Negócios & Empreendedorismo", icon: "📊", color: "#0891b2", description: "Reuniões, contratos, startups..." },
  { id: "medicina", name: "Medicina & Saúde Avançada", icon: "🩺", color: "#dc2626", description: "Diagnóstico, sintomas, tratamento..." },
  { id: "direito", name: "Direito & Justiça", icon: "👨‍⚖️", color: "#78716c", description: "Contratos, julgamentos, leis..." },
  { id: "psicologia", name: "Psicologia & Mente", icon: "🧠", color: "#9333ea", description: "Memória, comportamento, percepção..." },
  { id: "meioambiente", name: "Meio Ambiente & Sustentabilidade", icon: "🌳", color: "#16a34a", description: "Clima, reciclagem, ecossistemas..." },
  { id: "culinaria", name: "Culinária & Gastronomia", icon: "🍳", color: "#f97316", description: "Receitas, temperos, sabores..." },
  { id: "viagem", name: "Viagens & Turismo", icon: "✈️", color: "#0ea5e9", description: "Aeroportos, roteiros, culturas..." },
  { id: "musica", name: "Música & Instrumentos", icon: "🎵", color: "#db2777", description: "Ritmo, melodia, instrumentos..." },
  { id: "cinema", name: "Cinema & Entretenimento", icon: "🎬", color: "#7c3aed", description: "Filmes, atores, roteiros..." },
  { id: "matematica", name: "Matemática & Lógica", icon: "➗", color: "#2563eb", description: "Equações, teoremas, raciocínio..." },
  { id: "historia_mundial", name: "História Mundial", icon: "📜", color: "#b45309", description: "Impérios, guerras, civilizações..." },
  { id: "astronomia", name: "Astronomia & Espaço", icon: "🔭", color: "#4338ca", description: "Galáxias, órbitas, telescópios..." },
  { id: "politica", name: "Política & Diplomacia", icon: "🏛️", color: "#57534e", description: "Tratados, nações, governo..." },
  { id: "linguistica", name: "Linguística & Estilo", icon: "🗣️", color: "#be185d", description: "Sintaxe, ironia, nuances..." },
  { id: "academico", name: "Vida Acadêmica", icon: "🎓", color: "#1d4ed8", description: "Teses, pesquisa, argumentação..." },
];

// Níveis de progressão (1 a 50)
// wordsNeeded conta PALAVRAS DISTINTAS do vocabulário (words.js)
// 2026: banco de inglês dobrado de 1000 para 2000 palavras, e o degrau de
// cada nível dobrado de +10 para +20 junto — o objetivo era justamente esse:
// sem dobrar o degrau, o banco maior não mudaria a velocidade de progressão
// (o jogador ainda subiria de nível a cada 10 palavras distintas, só que
// agora com o dobro de palavras "sobrando" depois do nível 100). Simplesmente
// dobrar o degrau SEM dobrar o banco também não daria: o teto (990 de 1000)
// já estava perto do limite do acervo antigo. Precisava dos dois juntos.
export const stages = [
  { stage: 1, name: "Fundamentos (1-10)", icon: "🌱", color: "#10b981" },
  { stage: 2, name: "Elementar (11-20)", icon: "🚗", color: "#3b82f6" },
  { stage: 3, name: "Intermediário (21-30)", icon: "💻", color: "#f59e0b" },
  { stage: 4, name: "Avançado (31-40)", icon: "🎭", color: "#ec4899" },
  { stage: 5, name: "Mestre (41-50)", icon: "👑", color: "#8b5cf6" },
  // A partir daqui, fluência deixa de ser "saber palavras" e vira "usar o
  // idioma em contexto profissional e erudito" — por isso os 5 novos
  // estágios são domínios de aplicação (negócios, cultura, ciência,
  // academia, maestria), não mais um salto linear de dificuldade.
  { stage: 6, name: "Fluência Profissional (51-60)", icon: "📊", color: "#0891b2" },
  { stage: 7, name: "Expressão Cultural (61-70)", icon: "🎭", color: "#db2777" },
  { stage: 8, name: "Mente Científica (71-80)", icon: "🔬", color: "#7c3aed" },
  { stage: 9, name: "Alta Cultura Acadêmica (81-90)", icon: "🎓", color: "#1d4ed8" },
  { stage: 10, name: "Maestria Lendária (91-100)", icon: "🌌", color: "#eab308" },
];

export const levels = [
  // Estágio 1: Iniciante / Fundamentos (Níveis 1 ao 10)
  { level: 1, stage: 1, name: "Primeiras Palavras", description: "Cumprimentos e primeiros passos", wordsNeeded: 0, icon: "🌱" },
  { level: 2, stage: 1, name: "Contando e Colorindo", description: "Números de 1 a 10 e cores primárias", wordsNeeded: 20, icon: "🎨" },
  { level: 3, stage: 1, name: "Mundo dos Animais", description: "Cães, gatos e bichinhos comuns", wordsNeeded: 40, icon: "🐾" },
  { level: 4, stage: 1, name: "Hora de Comer", description: "Frutas, comidas e lanches", wordsNeeded: 60, icon: "🍕" },
  { level: 5, stage: 1, name: "Hora de Beber", description: "Água, sucos e bebidas", wordsNeeded: 80, icon: "🥤" },
  { level: 6, stage: 1, name: "Minha Família", description: "Mãe, pai, irmãos e parentes", wordsNeeded: 100, icon: "👨‍👩‍👧‍👦" },
  { level: 7, stage: 1, name: "Minha Casa", description: "Cômodos, portas e janelas", wordsNeeded: 120, icon: "🏠" },
  { level: 8, stage: 1, name: "Na Escola", description: "Livros, canetas e sala de aula", wordsNeeded: 140, icon: "🏫" },
  { level: 9, stage: 1, name: "Meu Guarda-Roupa", description: "Roupas e calçados", wordsNeeded: 160, icon: "👕" },
  { level: 10, stage: 1, name: "Primeira Conquista", description: "Parabéns por dominar os fundamentos!", wordsNeeded: 180, icon: "🏆" },

  // Estágio 2: Elementar / Cotidiano (Níveis 11 ao 20)
  { level: 11, stage: 2, name: "Corpo Humano", description: "Partes do corpo e saúde", wordsNeeded: 200, icon: "🧍" },
  { level: 12, stage: 2, name: "Pela Cidade", description: "Lojas, hospitais e parques", wordsNeeded: 220, icon: "📍" },
  { level: 13, stage: 2, name: "Meios de Transporte", description: "Carros, ônibus e aviões", wordsNeeded: 240, icon: "🚗" },
  { level: 14, stage: 2, name: "Verbos em Ação", description: "Comer, correr, falar e dormir", wordsNeeded: 260, icon: "⚡" },
  { level: 15, stage: 2, name: "Sentimentos & Emoções", description: "Feliz, triste, forte e alegre", wordsNeeded: 280, icon: "😊" },
  { level: 16, stage: 2, name: "Perguntando Tudo", description: "O quê, quem, onde e por quê", wordsNeeded: 300, icon: "❓" },
  { level: 17, stage: 2, name: "No Trabalho", description: "Escritório, chefes e reuniões", wordsNeeded: 320, icon: "💼" },
  { level: 18, stage: 2, name: "Frases Úteis", description: "Diálogos simples do cotidiano", wordsNeeded: 340, icon: "💬" },
  { level: 19, stage: 2, name: "Tempo e Horas", description: "Dias da semana e horários", wordsNeeded: 360, icon: "⏰" },
  { level: 20, stage: 2, name: "Explorador Elementar", description: "Dominou a comunicação do dia a dia!", wordsNeeded: 380, icon: "🥇" },

  // Estágio 3: Intermediário / Prático (Níveis 21 ao 30)
  { level: 21, stage: 3, name: "Mundo Digital", description: "Computadores, internet e aplicativos", wordsNeeded: 400, icon: "💻" },
  { level: 22, stage: 3, name: "Ciência & Natureza", description: "Estrelas, espaço e física básica", wordsNeeded: 420, icon: "🛰️" },
  { level: 23, stage: 3, name: "Clima & Tempo", description: "Chuva, sol, neve e tempestade", wordsNeeded: 440, icon: "🌤️" },
  { level: 24, stage: 3, name: "Geografia Mundial", description: "Oceanos, montanhas e vulcões", wordsNeeded: 460, icon: "🌋" },
  { level: 25, stage: 3, name: "Ferramentas & Utensílios", description: "Chaves, martelos e ferramentas", wordsNeeded: 480, icon: "🛠️" },
  { level: 26, stage: 3, name: "Materiais & Elementos", description: "Ouro, vidro, madeira e plástico", wordsNeeded: 500, icon: "🧪" },
  { level: 27, stage: 3, name: "Esportes & Jogos", description: "Futebol, basquete e xadrez", wordsNeeded: 520, icon: "⚽" },
  { level: 28, stage: 3, name: "Charadas & Enigmas", description: "Segredos, mistérios e imaginação", wordsNeeded: 540, icon: "🧩" },
  { level: 29, stage: 3, name: "Comunicação Eficiente", description: "Expressões mais precisas", wordsNeeded: 560, icon: "📢" },
  { level: 30, stage: 3, name: "Especialista Intermediário", description: "Vocabulário prático e diversificado!", wordsNeeded: 580, icon: "🎖️" },

  // Estágio 4: Avançado / Expressão Fluida (Níveis 31 ao 40)
  { level: 31, stage: 4, name: "Sociedade & Leis", description: "Governo, justiça e cidadania", wordsNeeded: 600, icon: "⚖️" },
  { level: 32, stage: 4, name: "Artes & Cultura", description: "Teatro, música, pintura e cinema", wordsNeeded: 620, icon: "🎭" },
  { level: 33, stage: 4, name: "Mistério & Investigação", description: "Detetives, pistas e mistérios", wordsNeeded: 640, icon: "🕵️" },
  { level: 34, stage: 4, name: "Economia & Negócios", description: "Mercado, investimentos e finanças", wordsNeeded: 660, icon: "📈" },
  { level: 35, stage: 4, name: "Expressões Idiomáticas", description: "Gírias e frases populares em inglês", wordsNeeded: 680, icon: "🗣️" },
  { level: 36, stage: 4, name: "Literatura & Escrita", description: "Romances, poesias e redação", wordsNeeded: 700, icon: "📜" },
  { level: 37, stage: 4, name: "Saúde & Biologia", description: "Medicina, células e ecologia", wordsNeeded: 720, icon: "🧬" },
  { level: 38, stage: 4, name: "Arquitetura & Inovação", description: "Pontes, prédios e projetos", wordsNeeded: 740, icon: "🏗️" },
  { level: 39, stage: 4, name: "Debate & Argumentação", description: "Opiniões e pensamento crítico", wordsNeeded: 760, icon: "🧠" },
  { level: 40, stage: 4, name: "Comunicador Avançado", description: "Compreensão fluida de conversas complexas!", wordsNeeded: 780, icon: "🌟" },

  // Estágio 5: Mestre & Fluência Total (Níveis 41 ao 50)
  { level: 41, stage: 5, name: "Vocabulário Acadêmico", description: "Termos formais e universitários", wordsNeeded: 800, icon: "🎓" },
  { level: 42, stage: 5, name: "Filosofia & Ética", description: "Conceitos abstratos e ideias elevadas", wordsNeeded: 820, icon: "🏛️" },
  { level: 43, stage: 5, name: "Astronomia & Universo", description: "Galáxias, buracos negros e cosmos", wordsNeeded: 840, icon: "🌌" },
  { level: 44, stage: 5, name: "Morfologia Específica", description: "Terminologias de precisão", wordsNeeded: 860, icon: "🔍" },
  { level: 45, stage: 5, name: "Diplomacia & Política", description: "Relações internacionais e acordos", wordsNeeded: 880, icon: "🌐" },
  { level: 46, stage: 5, name: "Alta Sintaxe", description: "Estruturas gramaticais sofisticadas", wordsNeeded: 900, icon: "⚡" },
  { level: 47, stage: 5, name: "Nuances da Língua", description: "Sinônimos refinados e sutilezas", wordsNeeded: 920, icon: "💎" },
  { level: 48, stage: 5, name: "Erudição Linguística", description: "Domínio de textos eruditos e literários", wordsNeeded: 940, icon: "📖" },
  { level: 49, stage: 5, name: "Gran Mestre", description: "A um passo da maestria suprema!", wordsNeeded: 960, icon: "👑" },
  { level: 50, stage: 5, name: "Mestre Supremo", description: "Maestria e fluência total no idioma!", wordsNeeded: 980, icon: "🌌" },

  // Estágio 6: Fluência Profissional (Níveis 51 ao 60)
  { level: 51, stage: 6, name: "Mundo dos Negócios", description: "Reuniões, contratos e estratégia", wordsNeeded: 1000, icon: "📊" },
  { level: 52, stage: 6, name: "Empreendedorismo", description: "Startups, investidores e inovação", wordsNeeded: 1020, icon: "🚀" },
  { level: 53, stage: 6, name: "Marketing & Vendas", description: "Marcas, clientes e negociação", wordsNeeded: 1040, icon: "📢" },
  { level: 54, stage: 6, name: "Medicina Clínica", description: "Diagnóstico, sintomas e tratamento", wordsNeeded: 1060, icon: "🩺" },
  { level: 55, stage: 6, name: "Saúde Pública", description: "Epidemias, vacinas e bem-estar", wordsNeeded: 1080, icon: "💉" },
  { level: 56, stage: 6, name: "Direito Civil", description: "Contratos, direitos e obrigações", wordsNeeded: 1100, icon: "👨‍⚖️" },
  { level: 57, stage: 6, name: "Direito Penal", description: "Crimes, julgamentos e sentenças", wordsNeeded: 1120, icon: "🔨" },
  { level: 58, stage: 6, name: "Finanças Pessoais", description: "Orçamento, investimento e economia", wordsNeeded: 1140, icon: "💰" },
  { level: 59, stage: 6, name: "Liderança & Gestão", description: "Equipes, metas e decisões", wordsNeeded: 1160, icon: "🧭" },
  { level: 60, stage: 6, name: "Executivo Fluente", description: "Domina o inglês do mundo corporativo!", wordsNeeded: 1180, icon: "🏢" },

  // Estágio 7: Expressão Cultural (Níveis 61 ao 70)
  { level: 61, stage: 7, name: "Cinema & Roteiro", description: "Filmes, atores e direção", wordsNeeded: 1200, icon: "🎬" },
  { level: 62, stage: 7, name: "Música & Composição", description: "Instrumentos, ritmo e letras", wordsNeeded: 1220, icon: "🎵" },
  { level: 63, stage: 7, name: "Literatura Clássica", description: "Romances, poesia e autores", wordsNeeded: 1240, icon: "📚" },
  { level: 64, stage: 7, name: "Culinária Internacional", description: "Receitas, temperos e sabores", wordsNeeded: 1260, icon: "🍳" },
  { level: 65, stage: 7, name: "Viagens pelo Mundo", description: "Aeroportos, culturas e roteiros", wordsNeeded: 1280, icon: "✈️" },
  { level: 66, stage: 7, name: "Moda & Estilo", description: "Tendências, tecidos e design", wordsNeeded: 1300, icon: "👗" },
  { level: 67, stage: 7, name: "Fotografia & Design", description: "Composição, cores e criatividade", wordsNeeded: 1320, icon: "📷" },
  { level: 68, stage: 7, name: "Teatro & Performance", description: "Palco, plateia e interpretação", wordsNeeded: 1340, icon: "🎪" },
  { level: 69, stage: 7, name: "Festivais & Tradições", description: "Celebrações ao redor do mundo", wordsNeeded: 1360, icon: "🎉" },
  { level: 70, stage: 7, name: "Curador Cultural", description: "Fluência plena em artes e cultura!", wordsNeeded: 1380, icon: "🖼️" },

  // Estágio 8: Mente Científica (Níveis 71 ao 80)
  { level: 71, stage: 8, name: "Lógica & Matemática", description: "Equações, teoremas e raciocínio", wordsNeeded: 1400, icon: "➗" },
  { level: 72, stage: 8, name: "Física Avançada", description: "Energia, ondas e relatividade", wordsNeeded: 1420, icon: "⚛️" },
  { level: 73, stage: 8, name: "Astronomia Profunda", description: "Galáxias, órbitas e telescópios", wordsNeeded: 1440, icon: "🔭" },
  { level: 74, stage: 8, name: "Biotecnologia", description: "Genes, DNA e laboratórios", wordsNeeded: 1460, icon: "🧬" },
  { level: 75, stage: 8, name: "Meio Ambiente", description: "Sustentabilidade e mudança climática", wordsNeeded: 1480, icon: "🌳" },
  { level: 76, stage: 8, name: "Psicologia Cognitiva", description: "Memória, percepção e comportamento", wordsNeeded: 1500, icon: "🧠" },
  { level: 77, stage: 8, name: "Inteligência Artificial", description: "Algoritmos, dados e automação", wordsNeeded: 1520, icon: "🤖" },
  { level: 78, stage: 8, name: "Engenharia & Inovação", description: "Projetos, estruturas e protótipos", wordsNeeded: 1540, icon: "⚙️" },
  { level: 79, stage: 8, name: "Método Científico", description: "Hipóteses, testes e evidências", wordsNeeded: 1560, icon: "🔬" },
  { level: 80, stage: 8, name: "Cientista Fluente", description: "Domina o vocabulário da ciência!", wordsNeeded: 1580, icon: "🥼" },

  // Estágio 9: Alta Cultura Acadêmica (Níveis 81 ao 90)
  { level: 81, stage: 9, name: "Redação Acadêmica", description: "Teses, ensaios e argumentação", wordsNeeded: 1600, icon: "✍️" },
  { level: 82, stage: 9, name: "Retórica & Persuasão", description: "Discursos, debates e convencimento", wordsNeeded: 1620, icon: "🎙️" },
  { level: 83, stage: 9, name: "Linguística Aplicada", description: "Sintaxe, semântica e fonética", wordsNeeded: 1640, icon: "🗣️" },
  { level: 84, stage: 9, name: "História Antiga", description: "Impérios, civilizações e legados", wordsNeeded: 1660, icon: "🏺" },
  { level: 85, stage: 9, name: "História Moderna", description: "Guerras, revoluções e tratados", wordsNeeded: 1680, icon: "📜" },
  { level: 86, stage: 9, name: "Filosofia Contemporânea", description: "Ética, existência e pensamento crítico", wordsNeeded: 1700, icon: "🏛️" },
  { level: 87, stage: 9, name: "Relações Internacionais", description: "Diplomacia, tratados e política externa", wordsNeeded: 1720, icon: "🌐" },
  { level: 88, stage: 9, name: "Sociologia & Comportamento", description: "Sociedade, cultura e interação", wordsNeeded: 1740, icon: "🧩" },
  { level: 89, stage: 9, name: "Pensamento Crítico", description: "Análise, lógica e argumentação refinada", wordsNeeded: 1760, icon: "🔍" },
  { level: 90, stage: 9, name: "Acadêmico Fluente", description: "Pronto para qualquer debate erudito!", wordsNeeded: 1780, icon: "🎓" },

  // Estágio 10: Maestria Lendária (Níveis 91 ao 100)
  { level: 91, stage: 10, name: "Nuances do Idioma", description: "Ironia, sarcasmo e duplo sentido", wordsNeeded: 1800, icon: "🎭" },
  { level: 92, stage: 10, name: "Expressões Idiomáticas Avançadas", description: "Gírias raras e ditados populares", wordsNeeded: 1820, icon: "💬" },
  { level: 93, stage: 10, name: "Oratória Magistral", description: "Discursos memoráveis e inspiradores", wordsNeeded: 1840, icon: "🎤" },
  { level: 94, stage: 10, name: "Diplomacia Internacional", description: "Negociações e acordos entre nações", wordsNeeded: 1860, icon: "🕊️" },
  { level: 95, stage: 10, name: "Literatura Contemporânea", description: "Autores modernos e prêmios literários", wordsNeeded: 1880, icon: "📖" },
  { level: 96, stage: 10, name: "Escrita Criativa", description: "Ficção, narrativa e estilo próprio", wordsNeeded: 1900, icon: "✒️" },
  { level: 97, stage: 10, name: "Vocabulário Enciclopédico", description: "Termos raros de todas as áreas", wordsNeeded: 1920, icon: "🌐" },
  { level: 98, stage: 10, name: "Fluência Nativa", description: "Pensa e sonha em inglês naturalmente", wordsNeeded: 1940, icon: "💭" },
  { level: 99, stage: 10, name: "Lenda Poliglota", description: "A um passo da perfeição absoluta!", wordsNeeded: 1960, icon: "⚜️" },
  { level: 100, stage: 10, name: "Mestre Absoluto do Inglês", description: "Fluência total, do básico ao erudito!", wordsNeeded: 1980, icon: "🏆" },
];
