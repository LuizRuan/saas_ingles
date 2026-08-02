// Frases organizadas para jogos de montar frases e completar
// Cada frase: { en, pt, words (com explicação), level, category, blank (para completar) }

export const sentences = [
  // ===== NÍVEL 1 - Frases muito curtas =====
  {
    en: "I am happy.",
    pt: "Eu estou feliz.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou/sou" },
      { en: "happy", pt: "feliz" }
    ],
    grammar: "Em inglês, usamos 'I am' para dizer 'eu sou' ou 'eu estou'.",
    level: 1,
    category: "sentimentos"
  },
  {
    en: "I like pizza.",
    pt: "Eu gosto de pizza.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "like", pt: "gosto de" },
      { en: "pizza", pt: "pizza" }
    ],
    grammar: "Em inglês, dizemos 'I like' + algo. Não usamos 'de' como em português.",
    level: 1,
    category: "comidas"
  },
  {
    en: "I have a dog.",
    pt: "Eu tenho um cachorro.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "have", pt: "tenho" },
      { en: "a", pt: "um/uma" },
      { en: "dog", pt: "cachorro" }
    ],
    grammar: "'A' significa 'um' ou 'uma'. Usamos antes de substantivos no singular.",
    level: 1,
    category: "animais"
  },
  {
    en: "I need water.",
    pt: "Eu preciso de água.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "need", pt: "preciso de" },
      { en: "water", pt: "água" }
    ],
    grammar: "'Need' já inclui o significado de 'precisar de'. Não precisa de outra preposição.",
    level: 1,
    category: "bebidas"
  },
  {
    en: "I am hungry.",
    pt: "Eu estou com fome.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "hungry", pt: "com fome" }
    ],
    grammar: "Em inglês dizemos 'I am hungry' (eu estou faminto), não 'I have hungry'.",
    level: 1,
    category: "sentimentos"
  },
  {
    en: "I love my family.",
    pt: "Eu amo minha família.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "love", pt: "amo" },
      { en: "my", pt: "minha/meu" },
      { en: "family", pt: "família" }
    ],
    grammar: "'My' significa 'meu' ou 'minha'. Em inglês não muda com o gênero.",
    level: 1,
    category: "familia"
  },
  {
    en: "She is beautiful.",
    pt: "Ela é bonita.",
    words: [
      { en: "She", pt: "Ela" },
      { en: "is", pt: "é/está" },
      { en: "beautiful", pt: "bonita/bonito" }
    ],
    grammar: "'She is' para 'ela é/está'. 'He is' para 'ele é/está'.",
    level: 1,
    category: "frases"
  },
  {
    en: "He is tall.",
    pt: "Ele é alto.",
    words: [
      { en: "He", pt: "Ele" },
      { en: "is", pt: "é" },
      { en: "tall", pt: "alto" }
    ],
    grammar: "Adjetivos em inglês não mudam para masculino ou feminino.",
    level: 1,
    category: "frases"
  },
  {
    en: "The cat is black.",
    pt: "O gato é preto.",
    words: [
      { en: "The", pt: "O/A" },
      { en: "cat", pt: "gato" },
      { en: "is", pt: "é" },
      { en: "black", pt: "preto" }
    ],
    grammar: "'The' significa 'o', 'a', 'os' ou 'as'. Serve para todos!",
    level: 1,
    category: "animais"
  },
  {
    en: "It is cold.",
    pt: "Está frio.",
    words: [
      { en: "It", pt: "(ele/ela - para coisas)" },
      { en: "is", pt: "está" },
      { en: "cold", pt: "frio" }
    ],
    grammar: "Usamos 'It is' para falar do clima ou de coisas em geral.",
    level: 1,
    category: "frases"
  },

  // ===== NÍVEL 2 - Frases curtas =====
  {
    en: "I want coffee.",
    pt: "Eu quero café.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "want", pt: "quero" },
      { en: "coffee", pt: "café" }
    ],
    grammar: "A estrutura básica é: Sujeito + Verbo + Objeto.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "I go to school.",
    pt: "Eu vou à escola.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "go", pt: "vou" },
      { en: "to", pt: "para/à" },
      { en: "school", pt: "escola" }
    ],
    grammar: "'Go to' significa 'ir para'. Sempre usamos 'to' com 'go'.",
    level: 2,
    category: "escola"
  },
  {
    en: "I eat rice every day.",
    pt: "Eu como arroz todo dia.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "eat", pt: "como" },
      { en: "rice", pt: "arroz" },
      { en: "every", pt: "todo/cada" },
      { en: "day", pt: "dia" }
    ],
    grammar: "'Every day' (duas palavras) significa 'todo dia'. É uma expressão de frequência.",
    level: 2,
    category: "comidas"
  },
  {
    en: "She likes animals.",
    pt: "Ela gosta de animais.",
    words: [
      { en: "She", pt: "Ela" },
      { en: "likes", pt: "gosta de" },
      { en: "animals", pt: "animais" }
    ],
    grammar: "Com 'he', 'she' e 'it', adicionamos 's' ao verbo: like → likes.",
    level: 2,
    category: "animais"
  },
  {
    en: "My mother is nice.",
    pt: "Minha mãe é legal.",
    words: [
      { en: "My", pt: "Minha/Meu" },
      { en: "mother", pt: "mãe" },
      { en: "is", pt: "é" },
      { en: "nice", pt: "legal/gentil" }
    ],
    grammar: "'Nice' pode significar 'legal', 'gentil' ou 'agradável'.",
    level: 2,
    category: "familia"
  },
  {
    en: "The dog is big.",
    pt: "O cachorro é grande.",
    words: [
      { en: "The", pt: "O" },
      { en: "dog", pt: "cachorro" },
      { en: "is", pt: "é" },
      { en: "big", pt: "grande" }
    ],
    grammar: "Adjetivos vêm ANTES do substantivo ou depois de 'is'.",
    level: 2,
    category: "animais"
  },
  {
    en: "I drink milk every morning.",
    pt: "Eu bebo leite toda manhã.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "drink", pt: "bebo" },
      { en: "milk", pt: "leite" },
      { en: "every", pt: "toda" },
      { en: "morning", pt: "manhã" }
    ],
    grammar: "'Every morning' = toda manhã. Expressões de tempo geralmente vão no final.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "I have two brothers.",
    pt: "Eu tenho dois irmãos.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "have", pt: "tenho" },
      { en: "two", pt: "dois" },
      { en: "brothers", pt: "irmãos" }
    ],
    grammar: "Para fazer o plural em inglês, geralmente adicionamos 's': brother → brothers.",
    level: 2,
    category: "familia"
  },

  // ===== NÍVEL 3 - Frases médias =====
  {
    en: "I am going home.",
    pt: "Eu estou indo para casa.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "going", pt: "indo" },
      { en: "home", pt: "para casa" }
    ],
    grammar: "'I am going' = estou indo. 'Home' já inclui o significado de 'para casa'.",
    level: 3,
    category: "frases"
  },
  {
    en: "Can you help me?",
    pt: "Você pode me ajudar?",
    words: [
      { en: "Can", pt: "Pode" },
      { en: "you", pt: "você" },
      { en: "help", pt: "ajudar" },
      { en: "me", pt: "me" }
    ],
    grammar: "'Can' é usado para pedir algo ou falar de habilidade. A pergunta inverte: 'Can you...?'",
    level: 3,
    category: "frases"
  },
  {
    en: "What time is it?",
    pt: "Que horas são?",
    words: [
      { en: "What", pt: "Que/Qual" },
      { en: "time", pt: "horas/tempo" },
      { en: "is", pt: "são" },
      { en: "it", pt: "(pronome)" }
    ],
    grammar: "Pergunta muito útil no dia a dia. 'What time' = que horas.",
    level: 3,
    category: "perguntas"
  },
  {
    en: "Where do you live?",
    pt: "Onde você mora?",
    words: [
      { en: "Where", pt: "Onde" },
      { en: "do", pt: "(auxiliar)" },
      { en: "you", pt: "você" },
      { en: "live", pt: "mora" }
    ],
    grammar: "Em perguntas, usamos 'do' antes de 'you': 'Where do you...?'",
    level: 3,
    category: "perguntas"
  },
  {
    en: "I live in a big city.",
    pt: "Eu moro em uma cidade grande.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "live", pt: "moro" },
      { en: "in", pt: "em" },
      { en: "a", pt: "uma" },
      { en: "big", pt: "grande" },
      { en: "city", pt: "cidade" }
    ],
    grammar: "Em inglês, o adjetivo vem ANTES do substantivo: 'big city' (não 'city big').",
    level: 3,
    category: "lugares"
  },
  {
    en: "I wake up at seven.",
    pt: "Eu acordo às sete.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "wake", pt: "acordo" },
      { en: "up", pt: "(partícula)" },
      { en: "at", pt: "às" },
      { en: "seven", pt: "sete" }
    ],
    grammar: "'Wake up' é um phrasal verb que significa 'acordar'. 'At' é usado com horários.",
    level: 3,
    category: "frases"
  },
  {
    en: "Do you like chocolate?",
    pt: "Você gosta de chocolate?",
    words: [
      { en: "Do", pt: "(auxiliar)" },
      { en: "you", pt: "você" },
      { en: "like", pt: "gosta de" },
      { en: "chocolate", pt: "chocolate" }
    ],
    grammar: "Para fazer perguntas com 'you', começamos com 'Do': 'Do you like...?'",
    level: 3,
    category: "comidas"
  },
  {
    en: "I don't like snakes.",
    pt: "Eu não gosto de cobras.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "don't", pt: "não" },
      { en: "like", pt: "gosto de" },
      { en: "snakes", pt: "cobras" }
    ],
    grammar: "'Don't' é a forma curta de 'do not'. Usamos para negar: 'I don't like...'",
    level: 3,
    category: "animais"
  },

  // ===== NÍVEL 4 - Frases mais longas =====
  {
    en: "I am learning English at home.",
    pt: "Eu estou aprendendo inglês em casa.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "learning", pt: "aprendendo" },
      { en: "English", pt: "inglês" },
      { en: "at", pt: "em" },
      { en: "home", pt: "casa" }
    ],
    grammar: "'I am + verbo com -ing' = eu estou fazendo algo agora (presente contínuo).",
    level: 4,
    category: "escola"
  },
  {
    en: "She is reading a book.",
    pt: "Ela está lendo um livro.",
    words: [
      { en: "She", pt: "Ela" },
      { en: "is", pt: "está" },
      { en: "reading", pt: "lendo" },
      { en: "a", pt: "um" },
      { en: "book", pt: "livro" }
    ],
    grammar: "'She is + verbo com -ing' = ela está fazendo algo (presente contínuo).",
    level: 4,
    category: "escola"
  },
  {
    en: "We go to the park on Sunday.",
    pt: "Nós vamos ao parque no domingo.",
    words: [
      { en: "We", pt: "Nós" },
      { en: "go", pt: "vamos" },
      { en: "to", pt: "ao" },
      { en: "the", pt: "o" },
      { en: "park", pt: "parque" },
      { en: "on", pt: "no" },
      { en: "Sunday", pt: "domingo" }
    ],
    grammar: "Usamos 'on' com dias da semana: on Monday, on Tuesday, on Sunday.",
    level: 4,
    category: "lugares"
  },
  {
    en: "My father works in an office.",
    pt: "Meu pai trabalha em um escritório.",
    words: [
      { en: "My", pt: "Meu" },
      { en: "father", pt: "pai" },
      { en: "works", pt: "trabalha" },
      { en: "in", pt: "em" },
      { en: "an", pt: "um" },
      { en: "office", pt: "escritório" }
    ],
    grammar: "'An' é usado antes de palavras que começam com som de vogal: an office, an apple.",
    level: 4,
    category: "trabalho"
  },
  {
    en: "I want to buy a new shirt.",
    pt: "Eu quero comprar uma camisa nova.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "want", pt: "quero" },
      { en: "to", pt: "(para)" },
      { en: "buy", pt: "comprar" },
      { en: "a", pt: "uma" },
      { en: "new", pt: "nova" },
      { en: "shirt", pt: "camisa" }
    ],
    grammar: "'Want to + verbo' = querer fazer algo. Ex: want to buy, want to eat.",
    level: 4,
    category: "roupas"
  },
  {
    en: "There are three cats in the garden.",
    pt: "Há três gatos no jardim.",
    words: [
      { en: "There", pt: "Há/Existem" },
      { en: "are", pt: "(verbo ser - plural)" },
      { en: "three", pt: "três" },
      { en: "cats", pt: "gatos" },
      { en: "in", pt: "no" },
      { en: "the", pt: "o" },
      { en: "garden", pt: "jardim" }
    ],
    grammar: "'There are' = há/existem (plural). 'There is' = há/existe (singular).",
    level: 4,
    category: "animais"
  },
  {
    en: "I usually eat breakfast at eight.",
    pt: "Eu geralmente como café da manhã às oito.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "usually", pt: "geralmente" },
      { en: "eat", pt: "como" },
      { en: "breakfast", pt: "café da manhã" },
      { en: "at", pt: "às" },
      { en: "eight", pt: "oito" }
    ],
    grammar: "'Usually' (geralmente) é um advérbio de frequência. Fica entre o sujeito e o verbo.",
    level: 4,
    category: "comidas"
  },

  // ===== NÍVEL 5 - Frases complexas =====
  {
    en: "I would like a glass of water, please.",
    pt: "Eu gostaria de um copo de água, por favor.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "would", pt: "gostaria" },
      { en: "like", pt: "de" },
      { en: "a", pt: "um" },
      { en: "glass", pt: "copo" },
      { en: "of", pt: "de" },
      { en: "water", pt: "água" },
      { en: "please", pt: "por favor" }
    ],
    grammar: "'I would like' é mais educado que 'I want'. Use em restaurantes e lojas.",
    level: 5,
    category: "bebidas"
  },
  {
    en: "How much does this cost?",
    pt: "Quanto isso custa?",
    words: [
      { en: "How", pt: "Quanto" },
      { en: "much", pt: "(quantidade)" },
      { en: "does", pt: "(auxiliar)" },
      { en: "this", pt: "isso" },
      { en: "cost", pt: "custa" }
    ],
    grammar: "'How much' para perguntar preço. 'Does' é o auxiliar para 'this/he/she/it'.",
    level: 5,
    category: "perguntas"
  },
  {
    en: "I am going to the store to buy milk.",
    pt: "Eu estou indo à loja comprar leite.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "going", pt: "indo" },
      { en: "to", pt: "à" },
      { en: "the", pt: "a" },
      { en: "store", pt: "loja" },
      { en: "to", pt: "para" },
      { en: "buy", pt: "comprar" },
      { en: "milk", pt: "leite" }
    ],
    grammar: "'I am going to' pode indicar futuro ('eu vou fazer') ou movimento ('estou indo para').",
    level: 5,
    category: "frases"
  },
  {
    en: "Can I have the menu, please?",
    pt: "Posso ver o cardápio, por favor?",
    words: [
      { en: "Can", pt: "Posso" },
      { en: "I", pt: "eu" },
      { en: "have", pt: "ter/ver" },
      { en: "the", pt: "o" },
      { en: "menu", pt: "cardápio" },
      { en: "please", pt: "por favor" }
    ],
    grammar: "'Can I have...?' é uma forma educada de pedir algo. Muito usado em restaurantes.",
    level: 5,
    category: "frases"
  },
  {
    en: "I have been studying English for two months.",
    pt: "Eu tenho estudado inglês por dois meses.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "have", pt: "tenho" },
      { en: "been", pt: "(auxiliar)" },
      { en: "studying", pt: "estudado" },
      { en: "English", pt: "inglês" },
      { en: "for", pt: "por/há" },
      { en: "two", pt: "dois" },
      { en: "months", pt: "meses" }
    ],
    grammar: "'Have been + -ing' indica algo que começou no passado e continua até agora.",
    level: 5,
    category: "escola"
  },

  // ===== MAIS FRASES (geradas a partir do banco de palavras) =====
  {
    en: "I love you with all my heart.",
    pt: "Eu te amo com todo meu coração.",
    words: [{ en: "I", pt: "eu" }, { en: "love", pt: "amo" }, { en: "you", pt: "você" }, { en: "with", pt: "com" }, { en: "all", pt: "todo/tudo" }, { en: "my", pt: "meu/minha" }, { en: "heart.", pt: "coração" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "corpo"
  },
  {
    en: "I have a test tomorrow.",
    pt: "Eu tenho uma prova amanhã.",
    words: [{ en: "I", pt: "eu" }, { en: "have", pt: "tenho/tem" }, { en: "a", pt: "um/uma" }, { en: "test", pt: "prova / Teste" }, { en: "tomorrow.", pt: "amanhã" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "escola"
  },
  {
    en: "Don't burn your tongue.",
    pt: "Não queime sua língua.",
    words: [{ en: "Don't", pt: "não (aux.)" }, { en: "burn", pt: "queimar" }, { en: "your", pt: "seu/sua" }, { en: "tongue.", pt: "língua" }],
    grammar: "Frase negativa: em inglês, é comum usar um auxiliar (do/does/is) + 'not'.",
    level: 4,
    category: "corpo"
  },
  {
    en: "My foot hurts.",
    pt: "Meu pé dói.",
    words: [{ en: "My", pt: "meu/minha" }, { en: "foot", pt: "pé" }, { en: "hurts.", pt: "machuca/dói" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "corpo"
  },
  {
    en: "Write on the paper.",
    pt: "Escreva no papel.",
    words: [{ en: "Write", pt: "escrevo" }, { en: "on", pt: "em/sobre" }, { en: "the", pt: "o/a" }, { en: "paper.", pt: "papel" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "escola"
  },
  {
    en: "I go to bed at ten.",
    pt: "Eu vou para a cama às dez.",
    words: [{ en: "I", pt: "eu" }, { en: "go", pt: "vou" }, { en: "to", pt: "para" }, { en: "bed", pt: "cama" }, { en: "at", pt: "em/às" }, { en: "ten.", pt: "dez" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 3,
    category: "casa"
  },
  {
    en: "I play in the park.",
    pt: "Eu brinco no parque.",
    words: [{ en: "I", pt: "eu" }, { en: "play", pt: "brinco/toco" }, { en: "in", pt: "em" }, { en: "the", pt: "o/a" }, { en: "park.", pt: "parque" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "lugares"
  },
  {
    en: "I don't know the answer.",
    pt: "Eu não sei a resposta.",
    words: [{ en: "I", pt: "eu" }, { en: "don't", pt: "não (aux.)" }, { en: "know", pt: "sei" }, { en: "the", pt: "o/a" }, { en: "answer.", pt: "resposta" }],
    grammar: "Frase negativa: em inglês, é comum usar um auxiliar (do/does/is) + 'not'.",
    level: 7,
    category: "frases"
  },
  {
    en: "I love the beach.",
    pt: "Eu amo a praia.",
    words: [{ en: "I", pt: "eu" }, { en: "love", pt: "amo" }, { en: "the", pt: "o/a" }, { en: "beach.", pt: "praia" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "lugares"
  },
  {
    en: "Go to the theater.",
    pt: "Vá ao teatro.",
    words: [{ en: "Go", pt: "vou" }, { en: "to", pt: "para" }, { en: "the", pt: "o/a" }, { en: "theater.", pt: "teatro" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "artes"
  },
  {
    en: "I like pizza.",
    pt: "Eu gosto de pizza.",
    words: [{ en: "I", pt: "eu" }, { en: "like", pt: "gosto de/como" }, { en: "pizza.", pt: "pizza" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "I am happy.",
    pt: "Eu estou feliz.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "happy.", pt: "feliz" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 5,
    category: "verbos"
  },
  {
    en: "Keep this secret.",
    pt: "Mantenha este segredo.",
    words: [{ en: "Keep", pt: "mantenho" }, { en: "this", pt: "este/esta" }, { en: "secret.", pt: "segredo" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 6,
    category: "charadas"
  },
  {
    en: "At the very end.",
    pt: "Bem no final.",
    words: [{ en: "At", pt: "em/às" }, { en: "the", pt: "o/a" }, { en: "very", pt: "muito" }, { en: "end.", pt: "fim" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 6,
    category: "charadas"
  },
  {
    en: "I live in a big city.",
    pt: "Eu moro em uma cidade grande.",
    words: [{ en: "I", pt: "eu" }, { en: "live", pt: "moro" }, { en: "in", pt: "em" }, { en: "a", pt: "um/uma" }, { en: "big", pt: "grande" }, { en: "city.", pt: "cidade" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "lugares"
  },
  {
    en: "He is angry.",
    pt: "Ele está com raiva.",
    words: [{ en: "He", pt: "ele" }, { en: "is", pt: "é/está" }, { en: "angry.", pt: "irritado / Com raiva" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "She has a twin sister.",
    pt: "Ela tem uma irmã gêmea.",
    words: [{ en: "She", pt: "ela" }, { en: "has", pt: "tem" }, { en: "a", pt: "um/uma" }, { en: "twin", pt: "gêmeo(a)" }, { en: "sister.", pt: "irmã" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 3,
    category: "familia"
  },
  {
    en: "I have a dog.",
    pt: "Eu tenho um cachorro.",
    words: [{ en: "I", pt: "eu" }, { en: "have", pt: "tenho/tem" }, { en: "a", pt: "um/uma" }, { en: "dog.", pt: "cachorro" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "Walk up the staircase.",
    pt: "Suba pela escadaria.",
    words: [{ en: "Walk", pt: "caminho" }, { en: "up", pt: "para cima" }, { en: "the", pt: "o/a" }, { en: "staircase.", pt: "escadaria / Escada" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "casa"
  },
  {
    en: "It is good to forgive.",
    pt: "É bom perdoar.",
    words: [{ en: "It", pt: "isso/ele/ela" }, { en: "is", pt: "é/está" }, { en: "good", pt: "bom" }, { en: "to", pt: "para" }, { en: "forgive.", pt: "perdoar" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 5,
    category: "verbos"
  },
  {
    en: "Enjoy the dance.",
    pt: "Aproveite a dança.",
    words: [{ en: "Enjoy", pt: "gosto de" }, { en: "the", pt: "o/a" }, { en: "dance.", pt: "dança" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "artes"
  },
  {
    en: "Look at the clock.",
    pt: "Olhe o relógio.",
    words: [{ en: "Look", pt: "olho" }, { en: "at", pt: "em/às" }, { en: "the", pt: "o/a" }, { en: "clock.", pt: "relógio" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "casa"
  },
  {
    en: "She wears a silver ring.",
    pt: "Ela usa um anel de prata.",
    words: [{ en: "She", pt: "ela" }, { en: "wears", pt: "usa/veste" }, { en: "a", pt: "um/uma" }, { en: "silver", pt: "prateado" }, { en: "ring.", pt: "anel" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "roupas"
  },
  {
    en: "I am hungry.",
    pt: "Eu estou com fome.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "hungry.", pt: "com fome" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "I wear a sweater when it's cold.",
    pt: "Eu uso um suéter quando está frio.",
    words: [{ en: "I", pt: "eu" }, { en: "wear", pt: "uso/visto" }, { en: "a", pt: "um/uma" }, { en: "sweater", pt: "suéter" }, { en: "when", pt: "quando" }, { en: "it's", pt: "está/é" }, { en: "cold.", pt: "frio / Com frio" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "roupas"
  },
  {
    en: "Close the window.",
    pt: "Feche a janela.",
    words: [{ en: "Close", pt: "fecho" }, { en: "the", pt: "o/a" }, { en: "window.", pt: "janela" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "She is in the hospital.",
    pt: "Ela está no hospital.",
    words: [{ en: "She", pt: "ela" }, { en: "is", pt: "é/está" }, { en: "in", pt: "em" }, { en: "the", pt: "o/a" }, { en: "hospital.", pt: "hospital" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 5,
    category: "lugares"
  },
  {
    en: "I am surprised!",
    pt: "Eu estou surpreso(a)!",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "surprised!", pt: "surpreso(a)" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "The book is on the table.",
    pt: "O livro está na mesa.",
    words: [{ en: "The", pt: "o/a" }, { en: "book", pt: "livro" }, { en: "is", pt: "é/está" }, { en: "on", pt: "em/sobre" }, { en: "the", pt: "o/a" }, { en: "table.", pt: "mesa" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 3,
    category: "casa"
  },
  {
    en: "Open your notebook.",
    pt: "Abra seu caderno.",
    words: [{ en: "Open", pt: "abro" }, { en: "your", pt: "seu/sua" }, { en: "notebook.", pt: "caderno" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "escola"
  },
  {
    en: "What is your name?",
    pt: "Qual é o seu nome?",
    words: [{ en: "What", pt: "o quê" }, { en: "is", pt: "é/está" }, { en: "your", pt: "seu/sua" }, { en: "name?", pt: "nome" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 6,
    category: "perguntas"
  },
  {
    en: "The mouse is very small.",
    pt: "O rato é muito pequeno.",
    words: [{ en: "The", pt: "o/a" }, { en: "mouse", pt: "rato" }, { en: "is", pt: "é/está" }, { en: "very", pt: "muito" }, { en: "small.", pt: "pequeno" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 2,
    category: "animais"
  },
  {
    en: "Keep your promise.",
    pt: "Mantenha sua promessa.",
    words: [{ en: "Keep", pt: "mantenho" }, { en: "your", pt: "seu/sua" }, { en: "promise.", pt: "promessa" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "Bye! See you tomorrow.",
    pt: "Tchau! Até amanhã.",
    words: [{ en: "Bye!", pt: "tchau" }, { en: "See", pt: "vejo" }, { en: "you", pt: "você" }, { en: "tomorrow.", pt: "amanhã" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 1,
    category: "cumprimentos"
  },
  {
    en: "I want bread with butter.",
    pt: "Eu quero pão com manteiga.",
    words: [{ en: "I", pt: "eu" }, { en: "want", pt: "quero" }, { en: "bread", pt: "pão" }, { en: "with", pt: "com" }, { en: "butter.", pt: "manteiga" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 2,
    category: "comidas"
  },
  {
    en: "I am a student.",
    pt: "Eu sou um(a) estudante.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "a", pt: "um/uma" }, { en: "student.", pt: "estudante / Aluno(a)" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 4,
    category: "escola"
  },
  {
    en: "The tomato is red.",
    pt: "O tomate é vermelho.",
    words: [{ en: "The", pt: "o/a" }, { en: "tomato", pt: "tomate" }, { en: "is", pt: "é/está" }, { en: "red.", pt: "vermelho" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 2,
    category: "comidas"
  },
  {
    en: "This is good, I like it.",
    pt: "Isso é bom, eu gosto disso.",
    words: [{ en: "This", pt: "este/esta" }, { en: "is", pt: "é/está" }, { en: "good,", pt: "bom" }, { en: "I", pt: "eu" }, { en: "like", pt: "gosto de/como" }, { en: "it.", pt: "isso/ele/ela" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 7,
    category: "frases"
  },
  {
    en: "What time is it?",
    pt: "Que horas são?",
    words: [{ en: "What", pt: "o quê" }, { en: "time", pt: "tempo" }, { en: "is", pt: "é/está" }, { en: "it?", pt: "isso/ele/ela" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 6,
    category: "perguntas"
  },
  {
    en: "Hi! How are you today?",
    pt: "Oi! Como você está hoje?",
    words: [{ en: "Hi!", pt: "oi" }, { en: "How", pt: "como" }, { en: "are", pt: "são/estão" }, { en: "you", pt: "você" }, { en: "today?", pt: "hoje" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 1,
    category: "cumprimentos"
  },
  {
    en: "I take the bus to school.",
    pt: "Eu pego ônibus para a escola.",
    words: [{ en: "I", pt: "eu" }, { en: "take", pt: "levo/pego" }, { en: "the", pt: "o/a" }, { en: "bus", pt: "ônibus" }, { en: "to", pt: "para" }, { en: "school.", pt: "escola" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 5,
    category: "transportes"
  },
  {
    en: "Eat more fruit.",
    pt: "Coma mais frutas.",
    words: [{ en: "Eat", pt: "como" }, { en: "more", pt: "mais" }, { en: "fruit.", pt: "fruta" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 2,
    category: "comidas"
  },
  {
    en: "How are you?",
    pt: "Como você está?",
    words: [{ en: "How", pt: "como" }, { en: "are", pt: "são/estão" }, { en: "you?", pt: "você" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 6,
    category: "perguntas"
  },
  {
    en: "Please close the door.",
    pt: "Por favor, feche a porta.",
    words: [{ en: "Please", pt: "por favor" }, { en: "close", pt: "fecho" }, { en: "the", pt: "o/a" }, { en: "door.", pt: "porta" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "casa"
  },
  {
    en: "She loves her husband.",
    pt: "Ela ama seu marido.",
    words: [{ en: "She", pt: "ela" }, { en: "loves", pt: "ama" }, { en: "her", pt: "dela" }, { en: "husband.", pt: "marido" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 3,
    category: "familia"
  },
  {
    en: "Come here, please.",
    pt: "Venha aqui, por favor.",
    words: [{ en: "Come", pt: "venho" }, { en: "here,", pt: "aqui" }, { en: "please.", pt: "por favor" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "The fish is in the water.",
    pt: "O peixe está na água.",
    words: [{ en: "The", pt: "o/a" }, { en: "fish", pt: "peixe" }, { en: "is", pt: "é/está" }, { en: "in", pt: "em" }, { en: "the", pt: "o/a" }, { en: "water.", pt: "água" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 2,
    category: "animais"
  },
  {
    en: "I want a salad, please.",
    pt: "Eu quero uma salada, por favor.",
    words: [{ en: "I", pt: "eu" }, { en: "want", pt: "quero" }, { en: "a", pt: "um/uma" }, { en: "salad,", pt: "salada" }, { en: "please.", pt: "por favor" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 2,
    category: "comidas"
  },
  {
    en: "This is an old family tradition.",
    pt: "Essa é uma tradição de família antiga.",
    words: [{ en: "This", pt: "este/esta" }, { en: "is", pt: "é/está" }, { en: "an", pt: "um/uma" }, { en: "old", pt: "velho/antigo" }, { en: "family", pt: "família" }, { en: "tradition.", pt: "tradição" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 4,
    category: "sociedade"
  },
  {
    en: "I am thirsty.",
    pt: "Eu estou com sede.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "thirsty.", pt: "com sede" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "The cow gives milk.",
    pt: "A vaca dá leite.",
    words: [{ en: "The", pt: "o/a" }, { en: "cow", pt: "vaca" }, { en: "gives", pt: "dá" }, { en: "milk.", pt: "leite" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 2,
    category: "animais"
  },
  {
    en: "I am sick today.",
    pt: "Eu estou doente hoje.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "sick", pt: "doente" }, { en: "today.", pt: "hoje" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "I cook in the kitchen.",
    pt: "Eu cozinho na cozinha.",
    words: [{ en: "I", pt: "eu" }, { en: "cook", pt: "cozinho" }, { en: "in", pt: "em" }, { en: "the", pt: "o/a" }, { en: "kitchen.", pt: "cozinha" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "casa"
  },
  {
    en: "I don't drink soda.",
    pt: "Eu não bebo refrigerante.",
    words: [{ en: "I", pt: "eu" }, { en: "don't", pt: "não (aux.)" }, { en: "drink", pt: "bebo" }, { en: "soda.", pt: "refrigerante" }],
    grammar: "Frase negativa: em inglês, é comum usar um auxiliar (do/does/is) + 'not'.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "Goodbye, see you tomorrow!",
    pt: "Tchau, te vejo amanhã!",
    words: [{ en: "Goodbye,", pt: "tchau / Adeus" }, { en: "see", pt: "vejo" }, { en: "you", pt: "você" }, { en: "tomorrow!", pt: "amanhã" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 1,
    category: "cumprimentos"
  },
  {
    en: "Where do you live?",
    pt: "Onde você mora?",
    words: [{ en: "Where", pt: "onde" }, { en: "do", pt: "fazer/aux." }, { en: "you", pt: "você" }, { en: "live?", pt: "moro" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 6,
    category: "perguntas"
  },
  {
    en: "Can you help me?",
    pt: "Você pode me ajudar?",
    words: [{ en: "Can", pt: "pode/consegue" }, { en: "you", pt: "você" }, { en: "help", pt: "ajudo" }, { en: "me?", pt: "mim/eu" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 5,
    category: "verbos"
  },
  {
    en: "I have one brother.",
    pt: "Eu tenho um irmão.",
    words: [{ en: "I", pt: "eu" }, { en: "have", pt: "tenho/tem" }, { en: "one", pt: "um" }, { en: "brother.", pt: "irmão" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 1,
    category: "numeros"
  },
  {
    en: "I know the answer.",
    pt: "Eu sei a resposta.",
    words: [{ en: "I", pt: "eu" }, { en: "know", pt: "sei" }, { en: "the", pt: "o/a" }, { en: "answer.", pt: "resposta" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "She is my daughter.",
    pt: "Ela é minha filha.",
    words: [{ en: "She", pt: "ela" }, { en: "is", pt: "é/está" }, { en: "my", pt: "meu/minha" }, { en: "daughter.", pt: "filha" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 3,
    category: "familia"
  },
  {
    en: "I love chocolate cake.",
    pt: "Eu amo bolo de chocolate.",
    words: [{ en: "I", pt: "eu" }, { en: "love", pt: "amo" }, { en: "chocolate", pt: "chocolate" }, { en: "cake.", pt: "bolo" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 2,
    category: "comidas"
  },
  {
    en: "Zero comes before one.",
    pt: "Zero vem antes de um.",
    words: [{ en: "Zero", pt: "zero" }, { en: "comes", pt: "vem" }, { en: "before", pt: "antes de" }, { en: "one.", pt: "um" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 1,
    category: "numeros"
  },
  {
    en: "Do you want tea?",
    pt: "Você quer chá?",
    words: [{ en: "Do", pt: "fazer/aux." }, { en: "you", pt: "você" }, { en: "want", pt: "quero" }, { en: "tea?", pt: "chá" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "Open the window.",
    pt: "Abra a janela.",
    words: [{ en: "Open", pt: "abro" }, { en: "the", pt: "o/a" }, { en: "window.", pt: "janela" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "casa"
  },
  {
    en: "I love pizza!",
    pt: "Eu amo pizza!",
    words: [{ en: "I", pt: "eu" }, { en: "love", pt: "amo" }, { en: "pizza!", pt: "pizza" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 2,
    category: "comidas"
  },
  {
    en: "I have a black cat.",
    pt: "Eu tenho um gato preto.",
    words: [{ en: "I", pt: "eu" }, { en: "have", pt: "tenho/tem" }, { en: "a", pt: "um/uma" }, { en: "black", pt: "preto" }, { en: "cat.", pt: "gato" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 1,
    category: "cores"
  },
  {
    en: "I walk to school.",
    pt: "Eu ando até a escola.",
    words: [{ en: "I", pt: "eu" }, { en: "walk", pt: "caminho" }, { en: "to", pt: "para" }, { en: "school.", pt: "escola" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "Do you like meat?",
    pt: "Você gosta de carne?",
    words: [{ en: "Do", pt: "fazer/aux." }, { en: "you", pt: "você" }, { en: "like", pt: "gosto de/como" }, { en: "meat?", pt: "carne" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 2,
    category: "comidas"
  },
  {
    en: "The horse is running.",
    pt: "O cavalo está correndo.",
    words: [{ en: "The", pt: "o/a" }, { en: "horse", pt: "cavalo" }, { en: "is", pt: "é/está" }, { en: "running.", pt: "correndo" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 2,
    category: "animais"
  },
  {
    en: "I go to bed at nine.",
    pt: "Eu vou dormir às nove.",
    words: [{ en: "I", pt: "eu" }, { en: "go", pt: "vou" }, { en: "to", pt: "para" }, { en: "bed", pt: "cama" }, { en: "at", pt: "em/às" }, { en: "nine.", pt: "nove" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 1,
    category: "numeros"
  },
  {
    en: "Can you help me, please?",
    pt: "Você pode me ajudar, por favor?",
    words: [{ en: "Can", pt: "pode/consegue" }, { en: "you", pt: "você" }, { en: "help", pt: "ajudo" }, { en: "me,", pt: "mim/eu" }, { en: "please?", pt: "por favor" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 1,
    category: "cumprimentos"
  },
  {
    en: "I have a meeting at two.",
    pt: "Eu tenho uma reunião às duas.",
    words: [{ en: "I", pt: "eu" }, { en: "have", pt: "tenho/tem" }, { en: "a", pt: "um/uma" }, { en: "meeting", pt: "reunião" }, { en: "at", pt: "em/às" }, { en: "two.", pt: "dois" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "trabalho"
  },
  {
    en: "Speak a new language.",
    pt: "Fale um novo idioma.",
    words: [{ en: "Speak", pt: "falo" }, { en: "a", pt: "um/uma" }, { en: "new", pt: "novo" }, { en: "language.", pt: "língua / Idioma" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 6,
    category: "charadas"
  },
  {
    en: "Why are you sad?",
    pt: "Por que você está triste?",
    words: [{ en: "Why", pt: "por quê" }, { en: "are", pt: "são/estão" }, { en: "you", pt: "você" }, { en: "sad?", pt: "triste" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 6,
    category: "perguntas"
  },
  {
    en: "I need help.",
    pt: "Eu preciso de ajuda.",
    words: [{ en: "I", pt: "eu" }, { en: "need", pt: "preciso de" }, { en: "help.", pt: "ajuda" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 5,
    category: "verbos"
  },
  {
    en: "I drink water.",
    pt: "Eu bebo água.",
    words: [{ en: "I", pt: "eu" }, { en: "drink", pt: "bebo" }, { en: "water.", pt: "água" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "I am proud of you.",
    pt: "Eu estou orgulhoso(a) de você.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "proud", pt: "orgulhoso(a)" }, { en: "of", pt: "de" }, { en: "you.", pt: "você" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "We are at the airport.",
    pt: "Nós estamos no aeroporto.",
    words: [{ en: "We", pt: "nós" }, { en: "are", pt: "são/estão" }, { en: "at", pt: "em/às" }, { en: "the", pt: "o/a" }, { en: "airport.", pt: "aeroporto" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 5,
    category: "lugares"
  },
  {
    en: "It is very hot today.",
    pt: "Está muito quente hoje.",
    words: [{ en: "It", pt: "isso/ele/ela" }, { en: "is", pt: "é/está" }, { en: "very", pt: "muito" }, { en: "hot", pt: "quente / Com calor" }, { en: "today.", pt: "hoje" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "I write in my notebook.",
    pt: "Eu escrevo no meu caderno.",
    words: [{ en: "I", pt: "eu" }, { en: "write", pt: "escrevo" }, { en: "in", pt: "em" }, { en: "my", pt: "meu/minha" }, { en: "notebook.", pt: "caderno" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "I live in a big house.",
    pt: "Eu moro em uma casa grande.",
    words: [{ en: "I", pt: "eu" }, { en: "live", pt: "moro" }, { en: "in", pt: "em" }, { en: "a", pt: "um/uma" }, { en: "big", pt: "grande" }, { en: "house.", pt: "casa" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "casa"
  },
  {
    en: "School starts at eight.",
    pt: "A escola começa às oito.",
    words: [{ en: "School", pt: "escola" }, { en: "starts", pt: "começa" }, { en: "at", pt: "em/às" }, { en: "eight.", pt: "oito" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 1,
    category: "numeros"
  },
  {
    en: "She drinks a banana smoothie.",
    pt: "Ela toma uma vitamina de banana.",
    words: [{ en: "She", pt: "ela" }, { en: "drinks", pt: "bebe" }, { en: "a", pt: "um/uma" }, { en: "banana", pt: "banana" }, { en: "smoothie.", pt: "vitamina" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "He wears a tie to work.",
    pt: "Ele usa gravata para trabalhar.",
    words: [{ en: "He", pt: "ele" }, { en: "wears", pt: "usa/veste" }, { en: "a", pt: "um/uma" }, { en: "tie", pt: "gravata" }, { en: "to", pt: "para" }, { en: "work.", pt: "trabalho / Trabalhar" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "roupas"
  },
  {
    en: "Where is my phone?",
    pt: "Onde está meu celular?",
    words: [{ en: "Where", pt: "onde" }, { en: "is", pt: "é/está" }, { en: "my", pt: "meu/minha" }, { en: "phone?", pt: "telefone / Celular" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 4,
    category: "trabalho"
  },
  {
    en: "She has a ring on her finger.",
    pt: "Ela tem um anel no dedo.",
    words: [{ en: "She", pt: "ela" }, { en: "has", pt: "tem" }, { en: "a", pt: "um/uma" }, { en: "ring", pt: "anel" }, { en: "on", pt: "em/sobre" }, { en: "her", pt: "dela" }, { en: "finger.", pt: "dedo (da mão)" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "corpo"
  },
  {
    en: "Push the door to open.",
    pt: "Empurre a porta para abrir.",
    words: [{ en: "Push", pt: "empurrar" }, { en: "the", pt: "o/a" }, { en: "door", pt: "porta" }, { en: "to", pt: "para" }, { en: "open.", pt: "abro" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "verbos"
  },
  {
    en: "I am nervous about the test.",
    pt: "Eu estou nervoso(a) com a prova.",
    words: [{ en: "I", pt: "eu" }, { en: "am", pt: "sou/estou" }, { en: "nervous", pt: "nervoso(a)" }, { en: "about", pt: "sobre" }, { en: "the", pt: "o/a" }, { en: "test.", pt: "prova / Teste" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "Feel pride in work.",
    pt: "Sinta orgulho no trabalho.",
    words: [{ en: "Feel", pt: "sinto" }, { en: "pride", pt: "orgulho" }, { en: "in", pt: "em" }, { en: "work.", pt: "trabalho / Trabalhar" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 6,
    category: "sentimentos"
  },
  {
    en: "I like cheese on my sandwich.",
    pt: "Eu gosto de queijo no meu sanduíche.",
    words: [{ en: "I", pt: "eu" }, { en: "like", pt: "gosto de/como" }, { en: "cheese", pt: "queijo" }, { en: "on", pt: "em/sobre" }, { en: "my", pt: "meu/minha" }, { en: "sandwich.", pt: "sanduíche" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 2,
    category: "comidas"
  },
  {
    en: "I like your shirt.",
    pt: "Eu gosto da sua camisa.",
    words: [{ en: "I", pt: "eu" }, { en: "like", pt: "gosto de/como" }, { en: "your", pt: "seu/sua" }, { en: "shirt.", pt: "camisa" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 4,
    category: "roupas"
  },
  {
    en: "The soup is hot.",
    pt: "A sopa está quente.",
    words: [{ en: "The", pt: "o/a" }, { en: "soup", pt: "sopa" }, { en: "is", pt: "é/está" }, { en: "hot.", pt: "quente / Com calor" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 2,
    category: "comidas"
  },
  {
    en: "I go to the bank.",
    pt: "Eu vou ao banco.",
    words: [{ en: "I", pt: "eu" }, { en: "go", pt: "vou" }, { en: "to", pt: "para" }, { en: "the", pt: "o/a" }, { en: "bank.", pt: "banco" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 5,
    category: "lugares"
  },
  {
    en: "He has a job interview tomorrow.",
    pt: "Ele tem uma entrevista de emprego amanhã.",
    words: [{ en: "He", pt: "ele" }, { en: "has", pt: "tem" }, { en: "a", pt: "um/uma" }, { en: "job", pt: "emprego" }, { en: "interview", pt: "entrevista" }, { en: "tomorrow.", pt: "amanhã" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "trabalho"
  },
  {
    en: "I love my family.",
    pt: "Eu amo minha família.",
    words: [{ en: "I", pt: "eu" }, { en: "love", pt: "amo" }, { en: "my", pt: "meu/minha" }, { en: "family.", pt: "família" }],
    grammar: "Preste atenção na ordem das palavras: em inglês, o sujeito costuma vir logo antes do verbo.",
    level: 3,
    category: "familia"
  },
  {
    en: "He is my son.",
    pt: "Ele é meu filho.",
    words: [{ en: "He", pt: "ele" }, { en: "is", pt: "é/está" }, { en: "my", pt: "meu/minha" }, { en: "son.", pt: "filho" }],
    grammar: "Usa o verbo 'to be' (am/is/are), que muda conforme o sujeito da frase.",
    level: 3,
    category: "familia"
  },
  {
    en: "My head hurts.",
    pt: "Minha cabeça dói.",
    words: [{ en: "My", pt: "meu/minha" }, { en: "head", pt: "cabeça" }, { en: "hurts.", pt: "machuca/dói" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "corpo"
  },
  {
    en: "I need clean socks.",
    pt: "Eu preciso de meias limpas.",
    words: [{ en: "I", pt: "eu" }, { en: "need", pt: "preciso de" }, { en: "clean", pt: "limpo" }, { en: "socks.", pt: "meias" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "roupas"
  },
  {
    en: "I need to do my homework.",
    pt: "Eu preciso fazer minha lição de casa.",
    words: [{ en: "I", pt: "eu" }, { en: "need", pt: "preciso de" }, { en: "to", pt: "para" }, { en: "do", pt: "fazer/aux." }, { en: "my", pt: "meu/minha" }, { en: "homework.", pt: "lição de casa" }],
    grammar: "Repare na terminação do verbo: em inglês, ela indica tempo (presente/passado) e pessoa.",
    level: 4,
    category: "escola"
  },
  {
    en: "Hello! How are you?",
    pt: "Olá! Como você está?",
    words: [{ en: "Hello!", pt: "olá" }, { en: "How", pt: "como" }, { en: "are", pt: "são/estão" }, { en: "you?", pt: "você" }],
    grammar: "Frase interrogativa: em inglês, o verbo auxiliar costuma vir antes do sujeito.",
    level: 1,
    category: "cumprimentos"
  },
];

// Frases para o jogo de completar (fill in the blanks)
export const fillBlanks = [
  {
    sentence: "I _____ water.",
    answer: "need",
    options: ["need", "dog", "house", "morning"],
    fullSentence: "I need water.",
    translation: "Eu preciso de água.",
    explanation: "'Need' significa 'precisar'. A frase fala sobre necessidade de água.",
    level: 1
  },
  {
    sentence: "She _____ a cat.",
    answer: "has",
    options: ["has", "go", "red", "big"],
    fullSentence: "She has a cat.",
    translation: "Ela tem um gato.",
    explanation: "'Has' é a forma de 'have' para he/she/it. Indica posse.",
    level: 1
  },
  {
    sentence: "I _____ to school.",
    answer: "go",
    options: ["go", "eat", "sleep", "have"],
    fullSentence: "I go to school.",
    translation: "Eu vou à escola.",
    explanation: "'Go to' significa 'ir para'. 'Go' indica movimento.",
    level: 1
  },
  {
    sentence: "The sky is _____.",
    answer: "blue",
    options: ["blue", "eat", "dog", "happy"],
    fullSentence: "The sky is blue.",
    translation: "O céu é azul.",
    explanation: "'Blue' é uma cor. 'Sky' significa 'céu'.",
    level: 1
  },
  {
    sentence: "I _____ pizza.",
    answer: "like",
    options: ["like", "run", "big", "cold"],
    fullSentence: "I like pizza.",
    translation: "Eu gosto de pizza.",
    explanation: "'Like' significa 'gostar de'. Não precisa de preposição em inglês.",
    level: 1
  },
  {
    sentence: "He is very _____.",
    answer: "tired",
    options: ["tired", "water", "book", "door"],
    fullSentence: "He is very tired.",
    translation: "Ele está muito cansado.",
    explanation: "'Tired' é um adjetivo que significa 'cansado'. 'Very' intensifica.",
    level: 2
  },
  {
    sentence: "I _____ breakfast at seven.",
    answer: "eat",
    options: ["eat", "sleep", "run", "close"],
    fullSentence: "I eat breakfast at seven.",
    translation: "Eu como café da manhã às sete.",
    explanation: "'Eat' significa 'comer'. 'Breakfast' é a primeira refeição do dia.",
    level: 2
  },
  {
    sentence: "She _____ English very well.",
    answer: "speaks",
    options: ["speaks", "eats", "runs", "sleeps"],
    fullSentence: "She speaks English very well.",
    translation: "Ela fala inglês muito bem.",
    explanation: "'Speaks' é 'speak' com 's' porque o sujeito é 'she'. 'Very well' = muito bem.",
    level: 2
  },
  {
    sentence: "We _____ in a big house.",
    answer: "live",
    options: ["live", "eat", "run", "play"],
    fullSentence: "We live in a big house.",
    translation: "Nós moramos em uma casa grande.",
    explanation: "'Live' significa 'morar' ou 'viver'. 'In' indica localização.",
    level: 2
  },
  {
    sentence: "The children are _____ in the park.",
    answer: "playing",
    options: ["playing", "sleeping", "eating", "reading"],
    fullSentence: "The children are playing in the park.",
    translation: "As crianças estão brincando no parque.",
    explanation: "'Are playing' = estão brincando (presente contínuo). 'Children' é o plural de 'child'.",
    level: 3
  },
  {
    sentence: "I _____ to buy a new phone.",
    answer: "want",
    options: ["want", "have", "make", "give"],
    fullSentence: "I want to buy a new phone.",
    translation: "Eu quero comprar um celular novo.",
    explanation: "'Want to + verbo' = querer fazer algo.",
    level: 3
  },
  {
    sentence: "Can you _____ the door, please?",
    answer: "open",
    options: ["open", "eat", "drink", "sleep"],
    fullSentence: "Can you open the door, please?",
    translation: "Você pode abrir a porta, por favor?",
    explanation: "'Open' significa 'abrir'. 'Can you...?' é um pedido educado.",
    level: 3
  },
  {
    sentence: "My grandmother _____ delicious cake.",
    answer: "makes",
    options: ["makes", "runs", "reads", "swims"],
    fullSentence: "My grandmother makes delicious cake.",
    translation: "Minha avó faz bolo delicioso.",
    explanation: "'Makes' = faz/prepara. Com she/he, o verbo ganha 's'.",
    level: 3
  },
  {
    sentence: "I have _____ studying English for two months.",
    answer: "been",
    options: ["been", "was", "is", "are"],
    fullSentence: "I have been studying English for two months.",
    translation: "Eu tenho estudado inglês por dois meses.",
    explanation: "'Have been + -ing' indica uma ação que começou no passado e continua.",
    level: 5
  },
  {
    sentence: "_____ you like some coffee?",
    answer: "Would",
    options: ["Would", "Is", "Are", "Do"],
    fullSentence: "Would you like some coffee?",
    translation: "Você gostaria de um café?",
    explanation: "'Would you like...?' é uma forma educada de oferecer algo.",
    level: 5
  },

  // ===== MAIS FRASES (geradas a partir do banco de palavras) =====
  { sentence: "We visited an art _____.", answer: "museum", options: ["forgive", "ladder", "arm", "museum"], fullSentence: "We visited an art museum.", translation: "Nós visitamos um museu de arte.", explanation: "'museum' significa 'Museu'.", level: 4 },
  { sentence: "I broke my _____.", answer: "arm", options: ["hand", "arm", "fruit", "contract"], fullSentence: "I broke my arm.", translation: "Eu quebrei meu braço.", explanation: "'arm' significa 'Braço'.", level: 4 },
  { sentence: "Can you help me, _____?", answer: "please", options: ["baby", "pink", "library", "please"], fullSentence: "Can you help me, please?", translation: "Você pode me ajudar, por favor?", explanation: "'please' significa 'Por favor'.", level: 1 },
  { sentence: "I love listening to _____.", answer: "music", options: ["homework", "ruler", "family", "music"], fullSentence: "I love listening to music.", translation: "Eu amo ouvir música.", explanation: "'music' significa 'Música'.", level: 4 },
  { sentence: "Don't burn your _____.", answer: "tongue", options: ["chicken", "tongue", "school", "shoulder"], fullSentence: "Don't burn your tongue.", translation: "Não queime sua língua.", explanation: "'tongue' significa 'Língua'.", level: 4 },
  { sentence: "My _____ is tired.", answer: "leg", options: ["alibi", "map", "leg", "eight"], fullSentence: "My leg is tired.", translation: "Minha perna está cansada.", explanation: "'leg' significa 'Perna'.", level: 4 },
  { sentence: "The _____ gives milk.", answer: "cow", options: ["number", "cow", "grandparents", "dog"], fullSentence: "The cow gives milk.", translation: "A vaca dá leite.", explanation: "'cow' significa 'Vaca'.", level: 2 },
  { sentence: "A _____ flies at night.", answer: "bat", options: ["bat", "mother", "library", "milk"], fullSentence: "A bat flies at night.", translation: "Um morcego voa à noite.", explanation: "'bat' significa 'Morcego'.", level: 2 },
  { sentence: "I need new _____.", answer: "pants", options: ["red", "park", "chair", "pants"], fullSentence: "I need new pants.", translation: "Eu preciso de uma calça nova.", explanation: "'pants' significa 'Calça'.", level: 4 },
  { sentence: "The _____ is in the lake.", answer: "duck", options: ["meeting", "tomato", "shoe", "duck"], fullSentence: "The duck is in the lake.", translation: "O pato está no lago.", explanation: "'duck' significa 'Pato'.", level: 2 },
  { sentence: "I live in a big _____.", answer: "house", options: ["promise", "house", "nothing", "eraser"], fullSentence: "I live in a big house.", translation: "Eu moro em uma casa grande.", explanation: "'house' significa 'Casa'.", level: 3 },
  { sentence: "Drive carefully in _____.", answer: "fog", options: ["fog", "hello", "choose", "rice"], fullSentence: "Drive carefully in fog.", translation: "Dirija com cuidado no nevoeiro.", explanation: "'fog' significa 'Nevoeiro / Neblina'.", level: 5 },
  { sentence: "The _____ is slow.", answer: "turtle", options: ["wrench", "candy", "thief", "turtle"], fullSentence: "The turtle is slow.", translation: "A tartaruga é lenta.", explanation: "'turtle' significa 'Tartaruga'.", level: 2 },
  { sentence: "I have a good _____.", answer: "job", options: ["hungry", "job", "city", "time"], fullSentence: "I have a good job.", translation: "Eu tenho um bom emprego.", explanation: "'job' significa 'Emprego'.", level: 4 },
  { sentence: "Check your wrist _____.", answer: "watch", options: ["watch", "turquoise", "boat", "bear"], fullSentence: "Check your wrist watch.", translation: "Olhe seu relógio de pulso.", explanation: "'watch' significa 'Relógio de pulso'.", level: 4 },
  { sentence: "It's cold, wear a _____.", answer: "jacket", options: ["hat", "map", "jacket", "why?"], fullSentence: "It's cold, wear a jacket.", translation: "Está frio, use uma jaqueta.", explanation: "'jacket' significa 'Jaqueta / Casaco'.", level: 4 },
  { sentence: "The _____ is fast.", answer: "rabbit", options: ["job", "key", "beer", "rabbit"], fullSentence: "The rabbit is fast.", translation: "O coelho é rápido.", explanation: "'rabbit' significa 'Coelho'.", level: 2 },
  { sentence: "Water flows down the _____.", answer: "river", options: ["wife", "river", "hunger", "house"], fullSentence: "Water flows down the river.", translation: "A água flui rio abaixo.", explanation: "'river' significa 'Rio'.", level: 5 },
  { sentence: "The _____ is big.", answer: "classroom", options: ["pizza", "daughter", "bee", "classroom"], fullSentence: "The classroom is big.", translation: "A sala de aula é grande.", explanation: "'classroom' significa 'Sala de aula'.", level: 4 },
  { sentence: "The _____ announced the verdict.", answer: "judge", options: ["how?", "bone", "blue", "judge"], fullSentence: "The judge announced the verdict.", translation: "O juiz anunciou o veredito.", explanation: "'judge' significa 'Juiz'.", level: 4 },
  { sentence: "My _____ is cold.", answer: "nose", options: ["bear", "nose", "wood", "earthquake"], fullSentence: "My nose is cold.", translation: "Meu nariz está frio.", explanation: "'nose' significa 'Nariz'.", level: 4 },
  { sentence: "There are _____ chairs.", answer: "three", options: ["hole", "three", "cream", "airport"], fullSentence: "There are three chairs.", translation: "Há três cadeiras.", explanation: "'three' significa 'Três'.", level: 1 },
  { sentence: "An _____ works hard.", answer: "ant", options: ["ant", "mountain", "floor", "movie"], fullSentence: "An ant works hard.", translation: "Uma formiga trabalha duro.", explanation: "'ant' significa 'Formiga'.", level: 2 },
  { sentence: "Brazil is a big _____.", answer: "country", options: ["door", "bear", "break", "country"], fullSentence: "Brazil is a big country.", translation: "O Brasil é um país grande.", explanation: "'country' significa 'País'.", level: 5 },
  { sentence: "The _____ jumps high.", answer: "frog", options: ["whistle", "hole", "end", "frog"], fullSentence: "The frog jumps high.", translation: "O sapo pula alto.", explanation: "'frog' significa 'Sapo / Rã'.", level: 2 },
  { sentence: "I have one _____ stars.", answer: "hundred", options: ["bye", "murder", "algorithm", "hundred"], fullSentence: "I have one hundred stars.", translation: "Eu tenho cem estrelas.", explanation: "'hundred' significa 'Cem'.", level: 1 },
  { sentence: "Goodbye! _____!", answer: "have a nice day", options: ["have a nice day", "bye", "noise", "socks"], fullSentence: "Goodbye! Have a nice day!", translation: "Tchau! Tenha um bom dia!", explanation: "'Have a nice day' significa 'Tenha um bom dia'.", level: 7 },
  { sentence: "The _____ is running.", answer: "horse", options: ["horse", "guitar", "poison", "lie"], fullSentence: "The horse is running.", translation: "O cavalo está correndo.", explanation: "'horse' significa 'Cavalo'.", level: 2 },
  { sentence: "The bus arrives in _____ minutes.", answer: "thirty", options: ["age", "grandfather", "tradition", "thirty"], fullSentence: "The bus arrives in thirty minutes.", translation: "O ônibus chega em trinta minutos.", explanation: "'thirty' significa 'Trinta'.", level: 1 },
  { sentence: "The _____ is in the water.", answer: "fish", options: ["fish", "lie", "classroom", "election"], fullSentence: "The fish is in the water.", translation: "O peixe está na água.", explanation: "'fish' significa 'Peixe'.", level: 2 },
  { sentence: "The _____ maintain order.", answer: "police", options: ["two", "nervous", "paint", "police"], fullSentence: "The police maintain order.", translation: "A polícia mantém a ordem.", explanation: "'police' significa 'Polícia'.", level: 4 },
  { sentence: "I love you with all my _____.", answer: "heart", options: ["grade", "heart", "scissors", "grandparents"], fullSentence: "I love you with all my heart.", translation: "Eu te amo com todo meu coração.", explanation: "'heart' significa 'Coração'.", level: 4 },
  { sentence: "The _____ is on the water.", answer: "boat", options: ["drawing", "microscope", "please", "boat"], fullSentence: "The boat is on the water.", translation: "O barco está na água.", explanation: "'boat' significa 'Barco'.", level: 5 },
  { sentence: "Can you help me? _____!", answer: "of course", options: ["murder", "of course", "boots", "word"], fullSentence: "Can you help me? Of course!", translation: "Pode me ajudar? Claro!", explanation: "'Of course' significa 'Claro / Com certeza'.", level: 7 },
  { sentence: "The _____ is sleeping.", answer: "cat", options: ["garlic", "movie", "cat", "reflection"], fullSentence: "The cat is sleeping.", translation: "O gato está dormindo.", explanation: "'cat' significa 'Gato'.", level: 2 },
  { sentence: "Speak a new _____.", answer: "language", options: ["city", "language", "salad", "computer"], fullSentence: "Speak a new language.", translation: "Fale um novo idioma.", explanation: "'language' significa 'Língua / Idioma'.", level: 6 },
  { sentence: "Put on a face _____.", answer: "mask", options: ["hole", "mask", "why?", "zero"], fullSentence: "Put on a face mask.", translation: "Coloque uma máscara facial.", explanation: "'mask' significa 'Máscara'.", level: 4 },
  { sentence: "It's late, _____.", answer: "i'm going home", options: ["i'm going home", "train", "brown", "history"], fullSentence: "It's late, I'm going home.", translation: "Está tarde, estou indo para casa.", explanation: "'I'm going home' significa 'Estou indo para casa'.", level: 7 },
  { sentence: "No _____ in trying.", answer: "shame", options: ["shame", "theater", "forgive", "tiger"], fullSentence: "No shame in trying.", translation: "Sem vergonha de tentar.", explanation: "'shame' significa 'Vergonha'.", level: 6 },
  { sentence: "The _____ beam is bright.", answer: "laser", options: ["book", "laser", "death", "monkey"], fullSentence: "The laser beam is bright.", translation: "O feixe de laser é brilhante.", explanation: "'laser' significa 'Laser'.", level: 5 },
  { sentence: "I have a _____ cat.", answer: "black", options: ["exam", "thousand", "drawing", "black"], fullSentence: "I have a black cat.", translation: "Eu tenho um gato preto.", explanation: "'black' significa 'Preto'.", level: 1 },
  { sentence: "Don't _____ your keys.", answer: "forget", options: ["forget", "clue", "vacuum", "pencil"], fullSentence: "Don't forget your keys.", translation: "Não se esqueça das suas chaves.", explanation: "'forget' significa 'Esquecer'.", level: 5 },
  { sentence: "I ride my _____.", answer: "bicycle", options: ["forget", "eraser", "bicycle", "skirt"], fullSentence: "I ride my bicycle.", translation: "Eu ando de bicicleta.", explanation: "'bicycle' significa 'Bicicleta'.", level: 5 },
  { sentence: "She is _____ years old.", answer: "twenty", options: ["goodbye", "gold", "dance", "twenty"], fullSentence: "She is twenty years old.", translation: "Ela tem vinte anos.", explanation: "'twenty' significa 'Vinte'.", level: 1 },
  { sentence: "The _____ is fast.", answer: "train", options: ["scared", "fish", "mirror", "train"], fullSentence: "The train is fast.", translation: "O trem é rápido.", explanation: "'train' significa 'Trem'.", level: 5 },
  { sentence: "Fasten your leather _____.", answer: "belt", options: ["brother", "dog", "belt", "where?"], fullSentence: "Fasten your leather belt.", translation: "Aperte seu cinto de couro.", explanation: "'belt' significa 'Cinto'.", level: 4 },
  { sentence: "Where are my _____?", answer: "shoes", options: ["window", "bathroom", "prison", "shoes"], fullSentence: "Where are my shoes?", translation: "Onde estão meus sapatos?", explanation: "'shoes' significa 'Sapatos'.", level: 4 },
  { sentence: "They _____ new structures.", answer: "build", options: ["camera", "build", "gray", "shoulder"], fullSentence: "They build new structures.", translation: "Eles constroem novas estruturas.", explanation: "'build' significa 'Construir'.", level: 5 },
  { sentence: "It is very _____ today.", answer: "hot", options: ["melt", "hot", "believe", "nervous"], fullSentence: "It is very hot today.", translation: "Está muito quente hoje.", explanation: "'hot' significa 'Quente / Com calor'.", level: 6 },
  { sentence: "Bye! _____.", answer: "see you tomorrow", options: ["see you tomorrow", "angry", "silence", "sorry"], fullSentence: "Bye! See you tomorrow.", translation: "Tchau! Até amanhã.", explanation: "'See you tomorrow' significa 'Até amanhã'.", level: 1 },
  { sentence: "School starts at _____.", answer: "eight", options: ["eight", "shower", "drawing", "candy"], fullSentence: "School starts at eight.", translation: "A escola começa às oito.", explanation: "'eight' significa 'Oito'.", level: 1 },
  { sentence: "I fly by _____.", answer: "airplane", options: ["airplane", "lesson", "one", "juice"], fullSentence: "I fly by airplane.", translation: "Eu viajo de avião.", explanation: "'airplane' significa 'Avião'.", level: 5 },
  { sentence: "Rain falls on the _____.", answer: "roof", options: ["river", "ear", "roof", "clock"], fullSentence: "Rain falls on the roof.", translation: "A chuva cai no telhado.", explanation: "'roof' significa 'Telhado'.", level: 3 },
  { sentence: "Oxygen is a vital _____.", answer: "gas", options: ["potato", "island", "thunder", "gas"], fullSentence: "Oxygen is a vital gas.", translation: "Oxigênio é um gás vital.", explanation: "'gas' significa 'Gás'.", level: 5 },
  { sentence: "I like _____ roses.", answer: "red", options: ["wrench", "five", "wall", "red"], fullSentence: "I like red roses.", translation: "Eu gosto de rosas vermelhas.", explanation: "'red' significa 'Vermelho'.", level: 1 },
  { sentence: "It is good to _____.", answer: "forgive", options: ["forgive", "ten", "nail", "sculpture"], fullSentence: "It is good to forgive.", translation: "É bom perdoar.", explanation: "'forgive' significa 'Perdoar'.", level: 5 },
  { sentence: "I wake up at _____.", answer: "six", options: ["neighbor", "shame", "job", "six"], fullSentence: "I wake up at six.", translation: "Eu acordo às seis.", explanation: "'six' significa 'Seis'.", level: 1 },
  { sentence: "Plan for the _____.", answer: "future", options: ["iron", "sandwich", "future", "swimming"], fullSentence: "Plan for the future.", translation: "Planeje para o futuro.", explanation: "'future' significa 'Futuro'.", level: 6 },
  { sentence: "Catch a big _____.", answer: "wave", options: ["future", "nephew", "glove", "wave"], fullSentence: "Catch a big wave.", translation: "Pegue uma grande onda.", explanation: "'wave' significa 'Onda'.", level: 5 },
  { sentence: "I have _____ brother.", answer: "one", options: ["tv", "one", "grandfather", "chameleon"], fullSentence: "I have one brother.", translation: "Eu tenho um irmão.", explanation: "'one' significa 'Um'.", level: 1 },
  { sentence: "She is in the _____.", answer: "hospital", options: ["hospital", "thunder", "vote", "pencil"], fullSentence: "She is in the hospital.", translation: "Ela está no hospital.", explanation: "'hospital' significa 'Hospital'.", level: 5 },
  { sentence: "The _____ shook buildings.", answer: "earthquake", options: ["earthquake", "owl", "smoke", "bat"], fullSentence: "The earthquake shook buildings.", translation: "O terremoto balançou prédios.", explanation: "'earthquake' significa 'Terremoto'.", level: 5 },
  { sentence: "He has _____ dollars.", answer: "fifty", options: ["please", "vacuum", "wrench", "fifty"], fullSentence: "He has fifty dollars.", translation: "Ele tem cinquenta dólares.", explanation: "'fifty' significa 'Cinquenta'.", level: 1 },
  { sentence: "The clouds are _____.", answer: "gray", options: ["garlic", "head", "gray", "interview"], fullSentence: "The clouds are gray.", translation: "As nuvens estão cinzas.", explanation: "'gray' significa 'Cinza'.", level: 1 },
  { sentence: "The _____ is strong.", answer: "lion", options: ["bus", "ladder", "lion", "test"], fullSentence: "The lion is strong.", translation: "O leão é forte.", explanation: "'lion' significa 'Leão'.", level: 2 },
  { sentence: "Leaves _____ in autumn.", answer: "fall", options: ["lesson", "fall", "floor", "neighbor"], fullSentence: "Leaves fall in autumn.", translation: "Folhas caem no outono.", explanation: "'fall' significa 'Cair'.", level: 5 },
  { sentence: "Do you want _____?", answer: "tea", options: ["shoe", "doubt", "ladder", "tea"], fullSentence: "Do you want tea?", translation: "Você quer chá?", explanation: "'tea' significa 'Chá'.", level: 2 },
  { sentence: "Hang a picture on the _____.", answer: "wall", options: ["wall", "ceiling", "twin", "fox"], fullSentence: "Hang a picture on the wall.", translation: "Pendure um quadro na parede.", explanation: "'wall' significa 'Parede / Muro'.", level: 3 },
  { sentence: "Whales swim in the _____.", answer: "ocean", options: ["juice", "turquoise", "ocean", "hide"], fullSentence: "Whales swim in the ocean.", translation: "Baleias nadam no oceano.", explanation: "'ocean' significa 'Oceano'.", level: 5 },
  { sentence: "I want _____ a book.", answer: "to buy", options: ["project", "smoothie", "to buy", "blue"], fullSentence: "I want to buy a book.", translation: "Eu quero comprar um livro.", explanation: "'to buy' significa 'Comprar'.", level: 5 },
  { sentence: "I go to the _____ every day.", answer: "office", options: ["meeting", "magnet", "office", "no"], fullSentence: "I go to the office every day.", translation: "Eu vou ao escritório todo dia.", explanation: "'office' significa 'Escritório'.", level: 4 },
  { sentence: "I _____ that claim.", answer: "doubt", options: ["doubt", "brown", "ten", "arm"], fullSentence: "I doubt that claim.", translation: "Eu duvido dessa afirmação.", explanation: "'doubt' significa 'Duvidar'.", level: 5 },
  { sentence: "Turn on the _____.", answer: "light", options: ["light", "dog", "chair", "nose"], fullSentence: "Turn on the light.", translation: "Ligue a luz.", explanation: "'light' significa 'Luz'.", level: 6 },
  { sentence: "I take the _____ to school.", answer: "bus", options: ["iron", "mother", "bus", "cow"], fullSentence: "I take the bus to school.", translation: "Eu pego ônibus para a escola.", explanation: "'bus' significa 'Ônibus'.", level: 5 },
  { sentence: "The _____ will prevail.", answer: "truth", options: ["resume", "truth", "poem", "dance"], fullSentence: "The truth will prevail.", translation: "A verdade prevalecerá.", explanation: "'truth' significa 'Verdade'.", level: 6 },
  { sentence: "I am _____ about the test.", answer: "nervous", options: ["ten", "email", "ring", "nervous"], fullSentence: "I am nervous about the test.", translation: "Eu estou nervoso(a) com a prova.", explanation: "'nervous' significa 'Nervoso(a)'.", level: 6 },
  { sentence: "I love the _____.", answer: "beach", options: ["goat", "beach", "end", "vote"], fullSentence: "I love the beach.", translation: "Eu amo a praia.", explanation: "'beach' significa 'Praia'.", level: 5 },
  { sentence: "He wears a _____ coat.", answer: "beige", options: ["nine", "fog", "beige", "no"], fullSentence: "He wears a beige coat.", translation: "Ele usa um casaco bege.", explanation: "'beige' significa 'Bege'.", level: 1 },
  { sentence: "The _____ is beautiful.", answer: "butterfly", options: ["brain", "paper", "butterfly", "pencil"], fullSentence: "The butterfly is beautiful.", translation: "A borboleta é bonita.", explanation: "'butterfly' significa 'Borboleta'.", level: 2 },
  { sentence: "I am _____ of snakes.", answer: "scared", options: ["scared", "void", "secret", "family"], fullSentence: "I am scared of snakes.", translation: "Eu tenho medo de cobras.", explanation: "'scared' significa 'Com medo / Assustado'.", level: 6 },
  { sentence: "I play in the _____.", answer: "park", options: ["chair", "brother", "park", "bat"], fullSentence: "I play in the park.", translation: "Eu brinco no parque.", explanation: "'park' significa 'Parque'.", level: 5 },
  { sentence: "The table is made of _____.", answer: "wood", options: ["chocolate", "wood", "hello", "lightning"], fullSentence: "The table is made of wood.", translation: "A mesa é feita de madeira.", explanation: "'wood' significa 'Madeira'.", level: 5 },
  { sentence: "Orange _____ is my favorite.", answer: "juice", options: ["void", "mountain", "candy", "juice"], fullSentence: "Orange juice is my favorite.", translation: "Suco de laranja é meu favorito.", explanation: "'juice' significa 'Suco'.", level: 2 },
  { sentence: "The book is on the _____.", answer: "table", options: ["table", "clothes", "cow", "airport"], fullSentence: "The book is on the table.", translation: "O livro está na mesa.", explanation: "'table' significa 'Mesa'.", level: 3 },
  { sentence: "Life and _____ in nature.", answer: "death", options: ["death", "car", "goal", "alibi"], fullSentence: "Life and death in nature.", translation: "Vida e morte na natureza.", explanation: "'death' significa 'Morte'.", level: 6 },
  { sentence: "I am _____ of you.", answer: "proud", options: ["deer", "niece", "sadness", "proud"], fullSentence: "I am proud of you.", translation: "Eu estou orgulhoso(a) de você.", explanation: "'proud' significa 'Orgulhoso(a)'.", level: 6 },
  { sentence: "There is _____ here.", answer: "nothing", options: ["nothing", "chameleon", "head", "gravity"], fullSentence: "There is nothing here.", translation: "Não há nada aqui.", explanation: "'nothing' significa 'Nada'.", level: 6 },
  { sentence: "I sit on the _____.", answer: "sofa", options: ["sofa", "chess", "nephew", "who?"], fullSentence: "I sit on the sofa.", translation: "Eu sento no sofá.", explanation: "'sofa' significa 'Sofá'.", level: 3 },
  { sentence: "She has a _____ sister.", answer: "twin", options: ["needle", "husband", "wrench", "twin"], fullSentence: "She has a twin sister.", translation: "Ela tem uma irmã gêmea.", explanation: "'twin' significa 'Gêmeo(a)'.", level: 3 },
  { sentence: "I have one _____.", answer: "brother", options: ["brother", "pink", "cheese", "forgive"], fullSentence: "I have one brother.", translation: "Eu tenho um irmão.", explanation: "'brother' significa 'Irmão'.", level: 3 },
  { sentence: "Put the milk in the _____.", answer: "refrigerator", options: ["desert", "cow", "store", "refrigerator"], fullSentence: "Put the milk in the refrigerator.", translation: "Coloque o leite na geladeira.", explanation: "'refrigerator' significa 'Geladeira'.", level: 3 },
  { sentence: "The sun is _____.", answer: "yellow", options: ["wife", "yellow", "bird", "learn"], fullSentence: "The sun is yellow.", translation: "O sol é amarelo.", explanation: "'yellow' significa 'Amarelo'.", level: 1 },
  { sentence: "I have _____ friends.", answer: "four", options: ["push", "card", "sister", "four"], fullSentence: "I have four friends.", translation: "Eu tenho quatro amigos.", explanation: "'four' significa 'Quatro'.", level: 1 },
  { sentence: "The _____ is hot.", answer: "soup", options: ["soup", "chaos", "classroom", "steam"], fullSentence: "The soup is hot.", translation: "A sopa está quente.", explanation: "'soup' significa 'Sopa'.", level: 2 },
  { sentence: "Ask an important _____.", answer: "question", options: ["aunt", "test", "question", "champion"], fullSentence: "Ask an important question.", translation: "Faça uma pergunta importante.", explanation: "'question' significa 'Pergunta'.", level: 6 },
  { sentence: "He ordered a cold _____.", answer: "beer", options: ["truth", "beer", "monkey", "hungry"], fullSentence: "He ordered a cold beer.", translation: "Ele pediu uma cerveja gelada.", explanation: "'beer' significa 'Cerveja'.", level: 2 },
  { sentence: "Feel _____ in work.", answer: "pride", options: ["backyard", "election", "pride", "horse"], fullSentence: "Feel pride in work.", translation: "Sinta orgulho no trabalho.", explanation: "'pride' significa 'Orgulho'.", level: 6 },
  { sentence: "My _____ is ten years old.", answer: "sister", options: ["judge", "alibi", "interview", "sister"], fullSentence: "My sister is ten years old.", translation: "Minha irmã tem dez anos.", explanation: "'sister' significa 'Irmã'.", level: 3 },
  { sentence: "I cook in the _____.", answer: "kitchen", options: ["elbow", "running", "drill", "kitchen"], fullSentence: "I cook in the kitchen.", translation: "Eu cozinho na cozinha.", explanation: "'kitchen' significa 'Cozinha'.", level: 3 },
  { sentence: "Steel is made from _____.", answer: "iron", options: ["iron", "secret", "brother", "interview"], fullSentence: "Steel is made from iron.", translation: "Aço é feito de ferro.", explanation: "'iron' significa 'Ferro'.", level: 5 },
];

// Frases para verdadeiro ou falso
export const trueFalse = [
  { word: "Apple", translation: "Maçã", isCorrect: true, correctTranslation: "Maçã", level: 1 },
  { word: "Dog", translation: "Gato", isCorrect: false, correctTranslation: "Cachorro", level: 1 },
  { word: "Blue", translation: "Azul", isCorrect: true, correctTranslation: "Azul", level: 1 },
  { word: "House", translation: "Cachorro", isCorrect: false, correctTranslation: "Casa", level: 1 },
  { word: "Cat", translation: "Gato", isCorrect: true, correctTranslation: "Gato", level: 1 },
  { word: "Water", translation: "Água", isCorrect: true, correctTranslation: "Água", level: 1 },
  { word: "Mother", translation: "Pai", isCorrect: false, correctTranslation: "Mãe", level: 1 },
  { word: "Red", translation: "Vermelho", isCorrect: true, correctTranslation: "Vermelho", level: 1 },
  { word: "Book", translation: "Caderno", isCorrect: false, correctTranslation: "Livro", level: 2 },
  { word: "Happy", translation: "Feliz", isCorrect: true, correctTranslation: "Feliz", level: 2 },
  { word: "Car", translation: "Carro", isCorrect: true, correctTranslation: "Carro", level: 2 },
  { word: "Bread", translation: "Arroz", isCorrect: false, correctTranslation: "Pão", level: 2 },
  { word: "Sister", translation: "Irmã", isCorrect: true, correctTranslation: "Irmã", level: 2 },
  { word: "School", translation: "Hospital", isCorrect: false, correctTranslation: "Escola", level: 2 },
  { word: "Fish", translation: "Peixe", isCorrect: true, correctTranslation: "Peixe", level: 2 },
  { word: "Milk", translation: "Suco", isCorrect: false, correctTranslation: "Leite", level: 2 },
  { word: "Head", translation: "Cabeça", isCorrect: true, correctTranslation: "Cabeça", level: 3 },
  { word: "Shirt", translation: "Sapato", isCorrect: false, correctTranslation: "Camisa", level: 3 },
  { word: "Kitchen", translation: "Cozinha", isCorrect: true, correctTranslation: "Cozinha", level: 3 },
  { word: "Airplane", translation: "Barco", isCorrect: false, correctTranslation: "Avião", level: 3 },
  { word: "Hungry", translation: "Com fome", isCorrect: true, correctTranslation: "Com fome", level: 3 },
  { word: "Library", translation: "Livraria", isCorrect: false, correctTranslation: "Biblioteca", level: 3 },
  { word: "Tired", translation: "Cansado", isCorrect: true, correctTranslation: "Cansado", level: 4 },
  { word: "Money", translation: "Comida", isCorrect: false, correctTranslation: "Dinheiro", level: 4 },

  // ===== MAIS ITENS (gerados a partir do banco de palavras) =====
  { word: "Religion", translation: "Religião", isCorrect: true, correctTranslation: "Religião", level: 4 },
  { word: "Bucket", translation: "Compasso", isCorrect: false, correctTranslation: "Balde", level: 4 },
  { word: "Stepmother", translation: "Madrasta", isCorrect: true, correctTranslation: "Madrasta", level: 3 },
  { word: "Doctor", translation: "Música", isCorrect: false, correctTranslation: "Médico", level: 4 },
  { word: "Photograph", translation: "Fotografia", isCorrect: true, correctTranslation: "Fotografia", level: 4 },
  { word: "Twenty", translation: "Um", isCorrect: false, correctTranslation: "Vinte", level: 1 },
  { word: "Take it easy", translation: "Vai com calma", isCorrect: true, correctTranslation: "Vai com calma", level: 1 },
  { word: "Tomato", translation: "Cebola", isCorrect: false, correctTranslation: "Tomate", level: 2 },
  { word: "Skirt", translation: "Saia", isCorrect: true, correctTranslation: "Saia", level: 4 },
  { word: "Balcony", translation: "Escadaria / Escada", isCorrect: false, correctTranslation: "Varanda / Sacada", level: 3 },
  { word: "Chocolate", translation: "Chocolate", isCorrect: true, correctTranslation: "Chocolate", level: 2 },
  { word: "Bone", translation: "Mão", isCorrect: false, correctTranslation: "Osso", level: 4 },
  { word: "Hot chocolate", translation: "Chocolate quente", isCorrect: true, correctTranslation: "Chocolate quente", level: 2 },
  { word: "Coat", translation: "Bolso", isCorrect: false, correctTranslation: "Casaco", level: 4 },
  { word: "Shoulder", translation: "Ombro", isCorrect: true, correctTranslation: "Ombro", level: 4 },
  { word: "Project", translation: "Contrato", isCorrect: false, correctTranslation: "Projeto", level: 4 },
  { word: "Backyard", translation: "Quintal", isCorrect: true, correctTranslation: "Quintal", level: 3 },
  { word: "Cookie", translation: "Carne", isCorrect: false, correctTranslation: "Biscoito", level: 2 },
  { word: "Ceiling", translation: "Teto", isCorrect: true, correctTranslation: "Teto", level: 3 },
  { word: "Eleven", translation: "Doze", isCorrect: false, correctTranslation: "Onze", level: 1 },
  { word: "Sweater", translation: "Suéter", isCorrect: true, correctTranslation: "Suéter", level: 4 },
  { word: "Culture", translation: "Religião", isCorrect: false, correctTranslation: "Cultura", level: 4 },
  { word: "Music", translation: "Música", isCorrect: true, correctTranslation: "Música", level: 4 },
  { word: "Police", translation: "Governo", isCorrect: false, correctTranslation: "Polícia", level: 4 },
  { word: "Tiger", translation: "Tigre", isCorrect: true, correctTranslation: "Tigre", level: 2 },
  { word: "Lung", translation: "Dente", isCorrect: false, correctTranslation: "Pulmão", level: 4 },
  { word: "Nail", translation: "Prego", isCorrect: true, correctTranslation: "Prego", level: 4 },
  { word: "Guitar", translation: "Filme", isCorrect: false, correctTranslation: "Violão / Guitarra", level: 4 },
  { word: "Four", translation: "Quatro", isCorrect: true, correctTranslation: "Quatro", level: 1 },
  { word: "Ring", translation: "Calça", isCorrect: false, correctTranslation: "Anel", level: 4 },
  { word: "Chair", translation: "Cadeira", isCorrect: true, correctTranslation: "Cadeira", level: 3 },
  { word: "Nine", translation: "Cem", isCorrect: false, correctTranslation: "Nove", level: 1 },
  { word: "Sunglasses", translation: "Óculos de sol", isCorrect: true, correctTranslation: "Óculos de sol", level: 4 },
  { word: "Radio", translation: "Teatro", isCorrect: false, correctTranslation: "Rádio", level: 4 },
  { word: "Backpack", translation: "Mochila", isCorrect: true, correctTranslation: "Mochila", level: 4 },
  { word: "Deer", translation: "Pássaro", isCorrect: false, correctTranslation: "Cervo", level: 2 },
  { word: "Sculpture", translation: "Escultura", isCorrect: true, correctTranslation: "Escultura", level: 4 },
  { word: "Wine", translation: "Vitamina", isCorrect: false, correctTranslation: "Vinho", level: 2 },
  { word: "Thirty", translation: "Trinta", isCorrect: true, correctTranslation: "Trinta", level: 1 },
  { word: "Dance", translation: "Escultura", isCorrect: false, correctTranslation: "Dança", level: 4 },
  { word: "Butterfly", translation: "Borboleta", isCorrect: true, correctTranslation: "Borboleta", level: 2 },
  { word: "Cheese", translation: "Sopa", isCorrect: false, correctTranslation: "Queijo", level: 2 },
  { word: "Clock", translation: "Relógio", isCorrect: true, correctTranslation: "Relógio", level: 3 },
  { word: "Fruit", translation: "Carne", isCorrect: false, correctTranslation: "Fruta", level: 2 },
  { word: "Hello", translation: "Olá", isCorrect: true, correctTranslation: "Olá", level: 1 },
  { word: "Family", translation: "Tia", isCorrect: false, correctTranslation: "Família", level: 3 },
  { word: "Blackboard", translation: "Quadro-negro", isCorrect: true, correctTranslation: "Quadro-negro", level: 4 },
  { word: "Nose", translation: "Osso", isCorrect: false, correctTranslation: "Nariz", level: 4 },
  { word: "Poem", translation: "Poema", isCorrect: true, correctTranslation: "Poema", level: 4 },
  { word: "Deadline", translation: "Telefone / Celular", isCorrect: false, correctTranslation: "Prazo", level: 4 },
  { word: "Eraser", translation: "Borracha", isCorrect: true, correctTranslation: "Borracha", level: 4 },
  { word: "Sheep", translation: "Galinha / Frango", isCorrect: false, correctTranslation: "Ovelha", level: 2 },
  { word: "Duck", translation: "Pato", isCorrect: true, correctTranslation: "Pato", level: 2 },
  { word: "Daughter", translation: "Família", isCorrect: false, correctTranslation: "Filha", level: 3 },
  { word: "Grandfather", translation: "Avô", isCorrect: true, correctTranslation: "Avô", level: 3 },
  { word: "Mask", translation: "Jaqueta / Casaco", isCorrect: false, correctTranslation: "Máscara", level: 4 },
  { word: "Ant", translation: "Formiga", isCorrect: true, correctTranslation: "Formiga", level: 2 },
  { word: "Spoon", translation: "Balde", isCorrect: false, correctTranslation: "Colher", level: 4 },
  { word: "Watch", translation: "Relógio de pulso", isCorrect: true, correctTranslation: "Relógio de pulso", level: 4 },
  { word: "Drill", translation: "Martelo", isCorrect: false, correctTranslation: "Furadeira", level: 4 },
  { word: "Email", translation: "E-mail", isCorrect: true, correctTranslation: "E-mail", level: 4 },
  { word: "Bedroom", translation: "Varanda / Sacada", isCorrect: false, correctTranslation: "Quarto", level: 3 },
  { word: "Thank you", translation: "Obrigado(a)", isCorrect: true, correctTranslation: "Obrigado(a)", level: 1 },
  { word: "Aunt", translation: "Avó", isCorrect: false, correctTranslation: "Tia", level: 3 },
  { word: "Mouse", translation: "Rato", isCorrect: true, correctTranslation: "Rato", level: 2 },
  { word: "Smoothie", translation: "Chocolate quente", isCorrect: false, correctTranslation: "Vitamina", level: 2 },
  { word: "Phone", translation: "Telefone / Celular", isCorrect: true, correctTranslation: "Telefone / Celular", level: 4 },
  { word: "Frog", translation: "Pato", isCorrect: false, correctTranslation: "Sapo / Rã", level: 2 },
  { word: "Homework", translation: "Lição de casa", isCorrect: true, correctTranslation: "Lição de casa", level: 4 },
  { word: "Congratulations", translation: "Não", isCorrect: false, correctTranslation: "Parabéns", level: 1 },
  { word: "Arm", translation: "Braço", isCorrect: true, correctTranslation: "Braço", level: 4 },
  { word: "Bat", translation: "Porco", isCorrect: false, correctTranslation: "Morcego", level: 2 },
  { word: "Twin", translation: "Gêmeo(a)", isCorrect: true, correctTranslation: "Gêmeo(a)", level: 3 },
  { word: "Egg", translation: "Tomate", isCorrect: false, correctTranslation: "Ovo", level: 2 },
  { word: "Pocket", translation: "Bolso", isCorrect: true, correctTranslation: "Bolso", level: 4 },
  { word: "Gray", translation: "Turquesa", isCorrect: false, correctTranslation: "Cinza", level: 1 },
  { word: "See you tomorrow", translation: "Até amanhã", isCorrect: true, correctTranslation: "Até amanhã", level: 1 },
  { word: "Cream", translation: "Azul claro", isCorrect: false, correctTranslation: "Cor de creme", level: 1 },
  { word: "Bird", translation: "Pássaro", isCorrect: true, correctTranslation: "Pássaro", level: 2 },
  { word: "Silver", translation: "Turquesa", isCorrect: false, correctTranslation: "Prateado", level: 1 },
  { word: "Socks", translation: "Meias", isCorrect: true, correctTranslation: "Meias", level: 4 },
  { word: "Hammer", translation: "Colher", isCorrect: false, correctTranslation: "Martelo", level: 4 },
  { word: "Yes", translation: "Sim", isCorrect: true, correctTranslation: "Sim", level: 1 },
  { word: "Letter", translation: "Dança", isCorrect: false, correctTranslation: "Carta / Letra", level: 4 },
  { word: "Grandparents", translation: "Avós", isCorrect: true, correctTranslation: "Avós", level: 3 },
  { word: "Violet", translation: "Preto", isCorrect: false, correctTranslation: "Violeta", level: 1 },
  { word: "Garden", translation: "Jardim", isCorrect: true, correctTranslation: "Jardim", level: 3 },
  { word: "Scarf", translation: "Bolso", isCorrect: false, correctTranslation: "Cachecol", level: 4 },
  { word: "Foot", translation: "Pé", isCorrect: true, correctTranslation: "Pé", level: 4 },
  { word: "Ladder", translation: "Chave inglesa", isCorrect: false, correctTranslation: "Escada de mão", level: 4 },
  { word: "Number", translation: "Número", isCorrect: true, correctTranslation: "Número", level: 1 },
  { word: "Computer", translation: "Papel", isCorrect: false, correctTranslation: "Computador", level: 4 },
  { word: "Drawing", translation: "Desenho", isCorrect: true, correctTranslation: "Desenho", level: 4 },
  { word: "Purple", translation: "Azul claro", isCorrect: false, correctTranslation: "Roxo", level: 1 },
  { word: "Shower", translation: "Chuveiro", isCorrect: true, correctTranslation: "Chuveiro", level: 3 },
  { word: "Clothes", translation: "Cinto", isCorrect: false, correctTranslation: "Roupas / Vestuário", level: 4 },
  { word: "Exam", translation: "Prova / Exame", isCorrect: true, correctTranslation: "Prova / Exame", level: 4 },
  { word: "Banana", translation: "Arroz", isCorrect: false, correctTranslation: "Banana", level: 2 },
  { word: "Staircase", translation: "Escadaria / Escada", isCorrect: true, correctTranslation: "Escadaria / Escada", level: 3 },
  { word: "Orange", translation: "Bege", isCorrect: false, correctTranslation: "Laranja", level: 1 },
];

// Frases para tradução (quiz de múltipla escolha)
export const translationQuizzes = [
  // Inglês → Português
  {
    direction: "en-pt",
    question: "Good morning!",
    correct: "Bom dia!",
    options: ["Bom dia!", "Boa noite!", "Boa tarde!", "Olá!"],
    level: 1
  },
  {
    direction: "en-pt",
    question: "I am hungry.",
    correct: "Eu estou com fome.",
    options: ["Eu estou com fome.", "Eu estou com sede.", "Eu estou cansado.", "Eu estou feliz."],
    level: 1
  },
  {
    direction: "en-pt",
    question: "What are you doing?",
    correct: "O que você está fazendo?",
    options: ["Onde você mora?", "O que você está fazendo?", "Que horas são?", "Você está bem?"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I have two brothers.",
    correct: "Eu tenho dois irmãos.",
    options: ["Eu tenho dois irmãos.", "Eu tenho duas irmãs.", "Eu tenho dois gatos.", "Eu tenho dois amigos."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Where is the bathroom?",
    correct: "Onde fica o banheiro?",
    options: ["Onde fica o banheiro?", "Onde fica a escola?", "Onde fica o hospital?", "Onde fica a loja?"],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I would like a glass of water.",
    correct: "Eu gostaria de um copo de água.",
    options: ["Eu gostaria de um copo de água.", "Eu gosto de beber água.", "Eu preciso de água.", "Eu quero comprar água."],
    level: 4
  },

  // Português → Inglês
  {
    direction: "pt-en",
    question: "Eu preciso de ajuda.",
    correct: "I need help.",
    options: ["I need help.", "I like help.", "I make help.", "I am help."],
    wrongExplanations: {
      "I like help.": "'Like' significa 'gostar'. Para dizer 'precisar', usamos 'need'.",
      "I make help.": "'Make' significa 'fazer/criar'. Para 'precisar', usamos 'need'.",
      "I am help.": "'Am' é uma forma de 'ser/estar'. Para 'precisar', usamos 'need'."
    },
    level: 1
  },
  {
    direction: "pt-en",
    question: "Eu gosto de pizza.",
    correct: "I like pizza.",
    options: ["I like pizza.", "I want pizza.", "I need pizza.", "I eat pizza."],
    wrongExplanations: {
      "I want pizza.": "'Want' significa 'querer', não 'gostar'. 'Gostar' é 'like'.",
      "I need pizza.": "'Need' significa 'precisar', não 'gostar'. 'Gostar' é 'like'.",
      "I eat pizza.": "'Eat' significa 'comer', não 'gostar'. 'Gostar' é 'like'."
    },
    level: 1
  },
  {
    direction: "pt-en",
    question: "Onde você mora?",
    correct: "Where do you live?",
    options: ["Where do you live?", "What do you like?", "How are you?", "Where is you?"],
    wrongExplanations: {
      "What do you like?": "'What do you like?' significa 'Do que você gosta?'. 'Onde' é 'where'.",
      "How are you?": "'How are you?' significa 'Como você está?'. 'Onde' é 'where'.",
      "Where is you?": "Com 'you', usamos 'do': 'Where do you live?'. 'Is' é para he/she/it."
    },
    level: 2
  },
  {
    direction: "pt-en",
    question: "Que horas são?",
    correct: "What time is it?",
    options: ["What time is it?", "How time is it?", "Where time is it?", "When time is it?"],
    wrongExplanations: {
      "How time is it?": "'How' significa 'como'. Para 'que horas', usamos 'What time'.",
      "Where time is it?": "'Where' significa 'onde'. Para 'que horas', usamos 'What time'.",
      "When time is it?": "'When' significa 'quando'. A forma correta é 'What time is it?'."
    },
    level: 2
  },
  {
    direction: "pt-en",
    question: "Eu estou aprendendo inglês.",
    correct: "I am learning English.",
    options: ["I am learning English.", "I learn English.", "I is learning English.", "I learning English."],
    wrongExplanations: {
      "I learn English.": "Essa frase está gramaticamente correta, mas para 'estou aprendendo' (ação no momento), usamos 'I am learning'.",
      "I is learning English.": "Com 'I', usamos 'am', não 'is'. 'Is' é para he/she/it.",
      "I learning English.": "Falta o verbo 'am'. O correto é 'I am learning English'."
    },
    level: 3
  },
  {
    direction: "pt-en",
    question: "Minha mãe cozinha muito bem.",
    correct: "My mother cooks very well.",
    options: ["My mother cooks very well.", "My mother cook very well.", "My mother is cook very well.", "My mother cooking very well."],
    wrongExplanations: {
      "My mother cook very well.": "Com 'she/he/it' (e nomes), o verbo ganha 's': cooks, not cook.",
      "My mother is cook very well.": "Não usamos 'is' + verbo base. O correto é 'My mother cooks...'",
      "My mother cooking very well.": "Falta o verbo auxiliar. Seria 'My mother is cooking...' ou 'My mother cooks...'"
    },
    level: 4
  },

  // ===== MAIS QUIZZES (gerados a partir do banco de palavras) =====
  // Inglês → Português (geradas a partir do banco de palavras)
  {
    direction: "en-pt",
    question: "The goat eats grass.",
    correct: "A cabra come grama.",
    options: ["Ligue o rádio.", "A cabra come grama.", "Meu nariz está frio.", "Bem-vindo(a) à minha casa!"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "You passed the test? That's great!",
    correct: "Você passou na prova? Que ótimo!",
    options: ["O juiz anunciou o veredito.", "O leão é forte.", "Eu como café da manhã às sete.", "Você passou na prova? Que ótimo!"],
    level: 7
  },
  {
    direction: "en-pt",
    question: "My niece loves to sing.",
    correct: "Minha sobrinha ama cantar.",
    options: ["Ela recebe o salário dela todo mês.", "Atletas pulam alto.", "Ele toca violão todos os dias.", "Minha sobrinha ama cantar."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Goodbye! Have a nice day!",
    correct: "Tchau! Tenha um bom dia!",
    options: ["Eu tenho um cachorro.", "Ele varreu o chão com uma vassoura.", "Estou bem, obrigado(a)!", "Tchau! Tenha um bom dia!"],
    level: 7
  },
  {
    direction: "en-pt",
    question: "I want to buy a book.",
    correct: "Eu quero comprar um livro.",
    options: ["Olhe seu relógio de pulso.", "Água de coco é refrescante.", "Ligue o rádio.", "Eu quero comprar um livro."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "I am proud of you.",
    correct: "Eu estou orgulhoso(a) de você.",
    options: ["Eles assinaram o contrato ontem.", "Eu uso o computador.", "Eu tenho quatro amigos.", "Eu estou orgulhoso(a) de você."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "I don't know the answer.",
    correct: "Eu não sei a resposta.",
    options: ["Coloque seu sapato.", "Você gosta de chocolate?", "O cavalo está correndo.", "Eu não sei a resposta."],
    level: 7
  },
  {
    direction: "en-pt",
    question: "Excuse me, where is the bathroom?",
    correct: "Com licença, onde fica o banheiro?",
    options: ["Eu acordo às seis.", "Com licença, onde fica o banheiro?", "Para dentro do vazio.", "Ela usa botas no inverno."],
    level: 7
  },
  {
    direction: "en-pt",
    question: "I know all the words to this song.",
    correct: "Eu sei todas as palavras dessa música.",
    options: ["Eu sei todas as palavras dessa música.", "Vamos comer no restaurante.", "Eles passaram o verão em uma ilha.", "Esconder uma arma."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "Her stepmother cooks well.",
    correct: "A madrasta dela cozinha bem.",
    options: ["A madrasta dela cozinha bem.", "Eu tenho três cachorros.", "Eu gosto da sua camisa.", "Ele tem uma entrevista de emprego amanhã."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "My colleague helped me finish the project.",
    correct: "Meu colega de trabalho me ajudou a terminar o projeto.",
    options: ["Suba pela escadaria.", "O porco é rosa.", "Coloque seu sapato.", "Meu colega de trabalho me ajudou a terminar o projeto."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "The lamp hangs from the ceiling.",
    correct: "A luminária pende do teto.",
    options: ["A luminária pende do teto.", "O fogo nos mantém aquecidos.", "O cachorro é marrom.", "Marque um gol."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I speak Portuguese.",
    correct: "Eu falo português.",
    options: ["A árvore projeta uma sombra.", "Eu falo português.", "Minha irmã tem dez anos.", "Estou aprendendo inglês em casa."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "Listen to the music.",
    correct: "Escute a música.",
    options: ["Uvas são roxas.", "Sinta orgulho no trabalho.", "Eu não sei a resposta.", "Escute a música."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "She goes to church on Sunday.",
    correct: "Ela vai à igreja no domingo.",
    options: ["Quanto custa isso?", "Ela vai à igreja no domingo.", "Coloque o leite na geladeira.", "Meu tio mora em São Paulo."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "I drink hot chocolate in winter.",
    correct: "Eu bebo chocolate quente no inverno.",
    options: ["Eu bebo chocolate quente no inverno.", "Use um chapéu no sol.", "O médico examina pacientes.", "Eu preciso de ajuda com minha lição."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I play soccer.",
    correct: "Eu jogo futebol.",
    options: ["Eu jogo futebol.", "Abra a janela.", "Espere um momento, por favor.", "Encha o balde com água."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "I wear a sweater when it's cold.",
    correct: "Eu uso um suéter quando está frio.",
    options: ["Está tarde, é hora de ir.", "Macacos gostam de bananas.", "Há doze meses em um ano.", "Eu uso um suéter quando está frio."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "We made lemonade in summer.",
    correct: "Fizemos limonada no verão.",
    options: ["Fizemos limonada no verão.", "O ônibus chega em trinta minutos.", "Minha cabeça dói.", "Coma com uma colher."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Every word matters.",
    correct: "Cada palavra importa.",
    options: ["Ei! E aí?", "Uvas são roxas.", "Eu tenho uma reunião às duas.", "Cada palavra importa."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "I take the bus to school.",
    correct: "Eu pego ônibus para a escola.",
    options: ["Está tarde, estou indo para casa.", "Supere seu medo.", "Eu pego ônibus para a escola.", "Ela ama seu marido."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "Can you help me? Of course!",
    correct: "Pode me ajudar? Claro!",
    options: ["Está muito quente hoje.", "Boa noite, durma bem.", "Tire um cartão vermelho.", "Pode me ajudar? Claro!"],
    level: 7
  },
  {
    direction: "en-pt",
    question: "We watched a movie last night.",
    correct: "Nós assistimos a um filme ontem à noite.",
    options: ["Nós assistimos a um filme ontem à noite.", "Minha avó faz ótimo bolo.", "Ela tem uma irmã gêmea.", "Bem-vindo(a) à minha casa!"],
    level: 4
  },
  {
    direction: "en-pt",
    question: "Storms can destroy homes.",
    correct: "Tempestades podem destruir casas.",
    options: ["Eu uso uma régua para desenhar linhas retas.", "Eu gosto de batatas fritas.", "Dirija com cuidado no nevoeiro.", "Tempestades podem destruir casas."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "She wears boots in winter.",
    correct: "Ela usa botas no inverno.",
    options: ["A grama é verde.", "Ela usa botas no inverno.", "Eu jogo futebol.", "Ela tem olhos azuis."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "Birds fly above clouds.",
    correct: "Pássaros voam acima das nuvens.",
    options: ["Pássaros voam acima das nuvens.", "Eu escrevo no meu caderno.", "Tchau! Tenha um bom dia!", "Eu trabalho de segunda a sexta."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "She has a silver necklace.",
    correct: "Ela tem um colar prateado.",
    options: ["Coloque no seu bolso.", "Eu ando de bicicleta.", "Onde você mora?", "Ela tem um colar prateado."],
    level: 1
  },
  {
    direction: "en-pt",
    question: "I go to the bank.",
    correct: "Eu vou ao banco.",
    options: ["O livro está na mesa.", "Eu ando de bicicleta.", "Eu vou ao banco.", "Ela sabe a resposta certa."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "I study at the library.",
    correct: "Eu estudo na biblioteca.",
    options: ["Eu estudo na biblioteca.", "Pode repetir, por favor?", "Apare com uma tesoura.", "O cervo correu para a floresta."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "Play chess.",
    correct: "Jogue xadrez.",
    options: ["Jogue xadrez.", "Fale um novo idioma.", "Eu vou de carro.", "Eu cozinho o jantar."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "Sunscreen protects skin.",
    correct: "Protetor solar protege a pele.",
    options: ["Protetor solar protege a pele.", "Tranque o cadeado.", "O terremoto balançou prédios.", "O macaco gosta de bananas."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "I live in a big house.",
    correct: "Eu moro em uma casa grande.",
    options: ["O som viaja em ondas.", "Eu moro em uma casa grande.", "A escola começa às oito.", "Conte até dez."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Eat with a spoon.",
    correct: "Coma com uma colher.",
    options: ["Folhas caem no outono.", "A rua está movimentada.", "Coma com uma colher.", "Pegue uma grande onda."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "I love pizza!",
    correct: "Eu amo pizza!",
    options: ["Oi! Prazer em conhecê-lo(a).", "Tchau! Até amanhã.", "As nuvens estão cinzas.", "Eu amo pizza!"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I have a beautiful garden.",
    correct: "Eu tenho um jardim bonito.",
    options: ["Eu tenho um jardim bonito.", "Eu escrevo no meu caderno.", "Eu como café da manhã às sete.", "O tubarão nada no oceano."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I watch TV at night.",
    correct: "Eu assisto TV à noite.",
    options: ["O mar parece turquesa aqui.", "O ímã atrai ferro.", "O silêncio é de ouro.", "Eu assisto TV à noite."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I drink milk every morning.",
    correct: "Eu bebo leite toda manhã.",
    options: ["Eu bebo leite toda manhã.", "Minha perna está cansada.", "O prazo do projeto é sexta-feira.", "As nuvens estão cinzas."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Strike with a hammer.",
    correct: "Bata com um martelo.",
    options: ["Eu estou empolgado(a) com a viagem.", "Sinta orgulho no trabalho.", "O urso é grande e forte.", "Bata com um martelo."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "He wears a beige coat.",
    correct: "Ele usa um casaco bege.",
    options: ["Supere seu medo.", "Meu sobrinho é muito engraçado.", "Costure com uma agulha.", "Ele usa um casaco bege."],
    level: 1
  },
  {
    direction: "en-pt",
    question: "I made a sandwich.",
    correct: "Eu fiz um sanduíche.",
    options: ["Obrigado(a) pela sua ajuda.", "Eu fiz um sanduíche.", "O tubarão nada no oceano.", "As pessoas praticam muitas religiões ao redor do mundo."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "She is sad.",
    correct: "Ela está triste.",
    options: ["Eu não bebo refrigerante.", "Eu estou nervoso(a) com a prova.", "Ele tem cinquenta dólares.", "Ela está triste."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "He touched his chin while thinking.",
    correct: "Ele tocou o queixo enquanto pensava.",
    options: ["Eu tenho um jardim bonito.", "Eu tenho cem estrelas.", "Ele tocou o queixo enquanto pensava.", "Mantenha sua promessa."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "I run every morning.",
    correct: "Eu corro toda manhã.",
    options: ["Eu corro toda manhã.", "Coloque seu sapato.", "Você quer chá?", "Eu estou surpreso(a)!"],
    level: 5
  },
  {
    direction: "en-pt",
    question: "Open the window.",
    correct: "Abra a janela.",
    options: ["Abra a janela.", "Fizemos limonada no verão.", "Coma com uma colher.", "Vá para uma sessão de corrida."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Do you like meat?",
    correct: "Você gosta de carne?",
    options: ["Eu quero café.", "Vá para uma sessão de corrida.", "Eu quero uma salada, por favor.", "Você gosta de carne?"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Learn from history.",
    correct: "Aprenda com a história.",
    options: ["Aprenda com a história.", "Eu moro em uma cidade grande.", "Ela usa um anel de prata.", "Mantenha sua promessa."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "The tiger has orange stripes.",
    correct: "O tigre tem listras laranjas.",
    options: ["Planeje para o futuro.", "Oi! Como você está hoje?", "O tigre tem listras laranjas.", "Apite o apito."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I cook in the kitchen.",
    correct: "Eu cozinho na cozinha.",
    options: ["Eu cozinho na cozinha.", "Ela tem uma irmã gêmea.", "Ela gosta de flores rosas.", "Encontre a pista que falta."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Rain falls on the roof.",
    correct: "A chuva cai no telhado.",
    options: ["A chuva cai no telhado.", "Eu bebo água.", "Posso pegar sua borracha emprestada?", "Meu vizinho é muito simpático."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I need water.",
    correct: "Eu preciso de água.",
    options: ["Eu preciso de óculos de sol; está muito ensolarado.", "Ela carrega seus livros em uma mochila.", "Eu preciso de água.", "Coloque o leite na geladeira."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Roll the dice.",
    correct: "Jogue os dados.",
    options: ["Satisfaça sua fome.", "Jogue os dados.", "Eu ouço com meus ouvidos.", "Expresse sua tristeza."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "My father works a lot.",
    correct: "Meu pai trabalha muito.",
    options: ["Meu pai trabalha muito.", "Onde você mora?", "Você pode me ajudar, por favor?", "Não se preocupe, vai com calma."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I want a salad, please.",
    correct: "Eu quero uma salada, por favor.",
    options: ["Eu quero uma salada, por favor.", "Ligue a luz.", "Você pode me ajudar, por favor?", "Qual é o seu nome?"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I am very happy today.",
    correct: "Eu estou muito feliz hoje.",
    options: ["Há três cadeiras.", "Nós assistimos a um filme ontem à noite.", "Eu estou muito feliz hoje.", "O coelho é rápido."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "My grandmother makes great cake.",
    correct: "Minha avó faz ótimo bolo.",
    options: ["Minha avó faz ótimo bolo.", "Eu estou muito feliz hoje.", "Ela usa um anel de prata.", "A tartaruga é lenta."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I am happy.",
    correct: "Eu estou feliz.",
    options: ["Pendure um quadro na parede.", "Vá para uma sessão de corrida.", "Eu estou feliz.", "A cabra come grama."],
    level: 5
  },
  {
    direction: "en-pt",
    question: "He loves his wife.",
    correct: "Ele ama sua esposa.",
    options: ["Ele ama sua esposa.", "Vida e morte na natureza.", "Bom dia, professor(a)!", "Está frio, use uma jaqueta."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Congratulations on your new job!",
    correct: "Parabéns pelo seu novo emprego!",
    options: ["O alho dá um ótimo sabor à comida.", "Eu duvido dessa afirmação.", "Ela tem dois gatos.", "Parabéns pelo seu novo emprego!"],
    level: 1
  },
  {
    direction: "en-pt",
    question: "Trim with scissors.",
    correct: "Apare com uma tesoura.",
    options: ["Eu bebo chocolate quente no inverno.", "O cachorro é marrom.", "Eu ouço com meus ouvidos.", "Apare com uma tesoura."],
    level: 4
  },
  {
    direction: "en-pt",
    question: "Time moves fast.",
    correct: "O tempo passa rápido.",
    options: ["O tempo passa rápido.", "Protetor solar protege a pele.", "A flor é violeta.", "A água flui rio abaixo."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "An apple a day keeps the doctor away.",
    correct: "Uma maçã por dia mantém o médico longe.",
    options: ["Uma coruja observa da árvore.", "Como você está?", "Uma maçã por dia mantém o médico longe.", "Ligue o rádio."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I want bread with butter.",
    correct: "Eu quero pão com manteiga.",
    options: ["Eu quero pão com manteiga.", "Eu como arroz todo dia.", "Veneno letal.", "Baleias nadam no oceano."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Eat more fruit.",
    correct: "Coma mais frutas.",
    options: ["Coma mais frutas.", "O verdadeiro campeão.", "A raposa é esperta.", "Estou bem, obrigado(a)!"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I am eleven years old.",
    correct: "Eu tenho onze anos.",
    options: ["Olá! Como você está?", "Me dê uma caneta, por favor.", "O cachorro é marrom.", "Eu tenho onze anos."],
    level: 1
  },
  {
    direction: "en-pt",
    question: "I am thirsty.",
    correct: "Eu estou com sede.",
    options: ["Eu estou com sede.", "A raposa é esperta.", "Eu tive um sonho.", "Eu vou ao banco."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "He is my son.",
    correct: "Ele é meu filho.",
    options: ["Encha o balde com água.", "Ele é meu filho.", "Essa sopa tem cebola nela.", "Mantenha este segredo."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Please sit on the chair.",
    correct: "Por favor, sente na cadeira.",
    options: ["Por favor, sente na cadeira.", "O tubarão nada no oceano.", "Eu tenho três cachorros.", "Para dentro do vazio."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Turn on the light.",
    correct: "Ligue a luz.",
    options: ["A abelha faz mel.", "Dobre suas roupas limpas.", "Bem no final.", "Ligue a luz."],
    level: 6
  },
  {
    direction: "en-pt",
    question: "Turn on the lamp.",
    correct: "Ligue a lâmpada.",
    options: ["Ela é minha filha.", "Ela está no hospital.", "O gelo derrete sob o calor.", "Ligue a lâmpada."],
    level: 3
  },
  {
    direction: "en-pt",
    question: "They drank wine at dinner.",
    correct: "Eles beberam vinho no jantar.",
    options: ["Coloque o leite na geladeira.", "Fale um novo idioma.", "Qual é o seu nome?", "Eles beberam vinho no jantar."],
    level: 2
  },

  // Português → Inglês (geradas a partir do banco de palavras)
  {
    direction: "pt-en",
    question: "O gelo derrete sob o calor.",
    correct: "Ice melts under heat.",
    options: ["The grass is green.", "Lightning struck the tree.", "The flower is violet.", "Ice melts under heat."],
    level: 5
  },
  {
    direction: "pt-en",
    question: "O bebê está dormindo.",
    correct: "The baby is sleeping.",
    options: ["The baby is sleeping.", "Push the door to open.", "Orange juice is my favorite.", "Good night, sleep well."],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Meu tio mora em São Paulo.",
    correct: "My uncle lives in São Paulo.",
    options: ["The goat eats grass.", "She has blue eyes.", "I need new pants.", "My uncle lives in São Paulo."],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Vai chover? Eu acho que sim.",
    correct: "Is it going to rain? I think so.",
    options: ["A fond memory.", "Secure the lock.", "Satisfy your hunger.", "Is it going to rain? I think so."],
    level: 7
  },
  {
    direction: "pt-en",
    question: "Suco de laranja é meu favorito.",
    correct: "Orange juice is my favorite.",
    options: ["The kids play in the backyard.", "The deer ran into the forest.", "Orange juice is my favorite.", "I play soccer."],
    level: 2
  },
  {
    direction: "pt-en",
    question: "A raposa é esperta.",
    correct: "The fox is clever.",
    options: ["The fox is clever.", "The city has a thousand shops.", "Believe in yourself.", "He is my son."],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Eu preciso de óculos de sol; está muito ensolarado.",
    correct: "I need sunglasses; it's very sunny.",
    options: ["I need sunglasses; it's very sunny.", "Send your resume to apply for the job.", "He is angry.", "No, thank you."],
    level: 4
  },
  {
    direction: "pt-en",
    question: "O mar parece turquesa aqui.",
    correct: "The sea looks turquoise here.",
    options: ["She likes pink flowers.", "The sea looks turquoise here.", "I use the computer.", "Listen to the music."],
    level: 1
  },
  {
    direction: "pt-en",
    question: "Meu(minha) primo(a) é meu(minha) melhor amigo(a).",
    correct: "My cousin is my best friend.",
    options: ["My cousin is my best friend.", "I write in my notebook.", "Yes, I understand.", "The chameleon changes color."],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Eu quero café, por favor.",
    correct: "I want coffee, please.",
    options: ["Thank you! No problem!", "I want coffee, please.", "Why are you sad?", "It is very hot today."],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Reflexão da água.",
    correct: "Water reflection.",
    options: ["Water reflection.", "I want a salad, please.", "Speak a new language.", "The cat sleeps on the floor."],
    level: 6
  },
  {
    direction: "pt-en",
    question: "Eu como ovos no café da manhã.",
    correct: "I eat eggs for breakfast.",
    options: ["I eat eggs for breakfast.", "No shame in trying.", "This is an old family tradition.", "I go to school."],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Eu não entendo esta palavra.",
    correct: "I don't understand this word.",
    options: ["Smoke rose from the chimney.", "I broke my arm.", "I don't understand this word.", "I take a shower every morning."],
    level: 7
  },
  {
    direction: "pt-en",
    question: "A árvore projeta uma sombra.",
    correct: "The tree casts a shadow.",
    options: ["The tree casts a shadow.", "I go to bed at nine.", "I put butter on my bread.", "The cake is delicious."],
    level: 6
  },
  {
    direction: "pt-en",
    question: "Eu gosto de sentar na varanda.",
    correct: "I like to sit on the balcony.",
    options: ["I play in the park.", "Express your sadness.", "I like to sit on the balcony.", "Excuse me, where is the bathroom?"],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Tranque o cadeado.",
    correct: "Secure the lock.",
    options: ["The government passed a policy.", "Where do you live?", "The chameleon changes color.", "Secure the lock."],
    level: 4
  },
  {
    direction: "pt-en",
    question: "Por favor, feche a porta.",
    correct: "Please close the door.",
    options: ["A fond memory.", "Can I borrow your eraser?", "Please close the door.", "Ice covers the lake."],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Minha tia é professora.",
    correct: "My aunt is a teacher.",
    options: ["Where are my shoes?", "My aunt is a teacher.", "Check the map.", "Smoke rose from the chimney."],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Ele pediu uma cerveja gelada.",
    correct: "He ordered a cold beer.",
    options: ["He ordered a cold beer.", "Open your notebook.", "I like orange juice.", "Where is my key?"],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Crianças amam doces.",
    correct: "Kids love candy.",
    options: ["I live in a big house.", "Kids love candy.", "I don't understand this word.", "My nose is cold."],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Chute a bola.",
    correct: "Kick the ball.",
    options: ["Kick the ball.", "Do you want tea?", "I doubt that claim.", "Where do you live?"],
    level: 5
  },
  {
    direction: "pt-en",
    question: "Eu quero sorvete de chocolate.",
    correct: "I want chocolate ice cream.",
    options: ["The fox is clever.", "Time moves fast.", "Put on a face mask.", "I want chocolate ice cream."],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Não há nada aqui.",
    correct: "There is nothing here.",
    options: ["Count to ten.", "The grass is green.", "There is nothing here.", "Age brings wisdom."],
    level: 6
  },
  {
    direction: "pt-en",
    question: "Tchau, se cuida!",
    correct: "Goodbye, take care!",
    options: ["Zero comes before one.", "Goodbye, take care!", "She drinks a banana smoothie.", "My uncle lives in São Paulo."],
    level: 1
  },
  {
    direction: "pt-en",
    question: "Ela é minha filha.",
    correct: "She is my daughter.",
    options: ["I'm fine, thank you!", "Score a goal.", "She is my daughter.", "Milk strengthens bones."],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Você pode me ajudar, por favor?",
    correct: "Can you help me, please?",
    options: ["Can you help me, please?", "Keep this secret.", "Believe in yourself.", "She has blue eyes."],
    level: 1
  },
  {
    direction: "pt-en",
    question: "A grama é verde.",
    correct: "The grass is green.",
    options: ["Open your mouth.", "Loud noise outside.", "The sky is blue.", "The grass is green."],
    level: 1
  },
  {
    direction: "pt-en",
    question: "Ela enrolou um cachecol no pescoço.",
    correct: "She wrapped a scarf around her neck.",
    options: ["The soup is hot.", "It's late, it's time to go.", "I go to the bank.", "She wrapped a scarf around her neck."],
    level: 4
  },
  {
    direction: "pt-en",
    question: "Eu tenho um cachorro.",
    correct: "I have a dog.",
    options: ["I have a dog.", "Desert sand is warm.", "Believe in yourself.", "The earthquake shook buildings."],
    level: 5
  },
  {
    direction: "pt-en",
    question: "Todo mundo ajuda nessa comunidade.",
    correct: "Everyone helps in this community.",
    options: ["Everyone helps in this community.", "See you soon, take care!", "Keep this secret.", "I drink milk every morning."],
    level: 4
  },
];
