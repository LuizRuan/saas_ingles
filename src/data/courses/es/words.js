// Banco de dados de palavras em Espanhol (Curso: es-pt)
// Cada palavra contém: en (palavra no idioma-alvo), pt (tradução), category, pronunciation, example, examplePt, level, tip

export const words = [
  // ===== CUMPRIMENTOS (Saludos) - Level 1 =====
  { en: "Hola", pt: "Olá", category: "cumprimentos", pronunciation: "óla", example: "¡Hola! ¿Cómo estás?", examplePt: "Olá! Como você está?", level: 1, tip: "O cumprimento mais comum em espanhol. O 'h' é sempre mudo!" },
  { en: "Buenos días", pt: "Bom dia", category: "cumprimentos", pronunciation: "buénos días", example: "¡Buenos días, profesor!", examplePt: "Bom dia, professor!", level: 1, tip: "Usado pela manhã até o meio-dia." },
  { en: "Buenas tardes", pt: "Boa tarde", category: "cumprimentos", pronunciation: "buénas tárdes", example: "Buenas tardes a todos.", examplePt: "Boa tarde a todos.", level: 1, tip: "Usado do meio-dia até o anoitecer." },
  { en: "Buenas noches", pt: "Boa noite", category: "cumprimentos", pronunciation: "buénas nótches", example: "Buenas noches, ¡que descanses!", examplePt: "Boa noite, descanse bem!", level: 1, tip: "Usado tanto ao chegar quanto ao se despedir à noite." },
  { en: "Gracias", pt: "Obrigado(a)", category: "cumprimentos", pronunciation: "grásiass", example: "Muchas gracias por tu ayuda.", examplePt: "Muito obrigado pela sua ajuda.", level: 1, tip: "Palavra mágica de gratidão. Para responder diga 'De nada'." },
  { en: "De nada", pt: "De nada", category: "cumprimentos", pronunciation: "de náda", example: "De nada, fue un placer.", examplePt: "De nada, foi um prazer.", level: 1, tip: "A resposta padrão para 'Gracias'." },
  { en: "Por favor", pt: "Por favor", category: "cumprimentos", pronunciation: "por favór", example: "Un café, por favor.", examplePt: "Um café, por favor.", level: 1, tip: "Gentileza essencial em qualquer pedido." },
  { en: "Hasta luego", pt: "Até logo", category: "cumprimentos", pronunciation: "ásta luégo", example: "¡Nos vemos, hasta luego!", examplePt: "A gente se vê, até logo!", level: 1, tip: "Despedida muito comum. O 'h' é mudo." },
  { en: "Chao", pt: "Tchau", category: "cumprimentos", pronunciation: "tcháo", example: "¡Chao! Que tengas buen día.", examplePt: "Tchau! Tenha um bom dia.", level: 1, tip: "Despedida informal e carinhosa entre amigos." },

  // ===== NÚMEROS (Números) - Level 1 =====
  { en: "Uno", pt: "Um", category: "numeros", pronunciation: "úno", example: "Tengo uno.", examplePt: "Eu tenho um.", level: 1, tip: "O primeiro número inteiro." },
  { en: "Dos", pt: "Dois", category: "numeros", pronunciation: "dós", example: "Dos cafés, por favor.", examplePt: "Dois cafés, por favor.", level: 1, tip: "Número 2." },
  { en: "Tres", pt: "Três", category: "numeros", pronunciation: "trés", example: "Tres amigos.", examplePt: "Três amigos.", level: 1, tip: "Número 3." },
  { en: "Cuatro", pt: "Quatro", category: "numeros", pronunciation: "cuátro", example: "Cuatro estaciones.", examplePt: "Quatro estações.", level: 1, tip: "Número 4." },
  { en: "Cinco", pt: "Cinco", category: "numeros", pronunciation: "sínco", example: "Cinco minutos.", examplePt: "Cinco minutos.", level: 1, tip: "Número 5." },

  // ===== CORES (Colores) - Level 2 =====
  { en: "Rojo", pt: "Vermelho", category: "cores", pronunciation: "róho", example: "El coche es rojo.", examplePt: "O carro é vermelho.", level: 2, tip: "A cor do morango e do coração. O 'j' em espanhol tem som de 'r' forte!" },
  { en: "Azul", pt: "Azul", category: "cores", pronunciation: "asúl", example: "El cielo es azul.", examplePt: "O céu é azul.", level: 2, tip: "A cor do céu e do mar." },
  { en: "Verde", pt: "Verde", category: "cores", pronunciation: "bérde", example: "La hierba es verde.", examplePt: "A grama é verde.", level: 2, tip: "A cor da natureza e das plantas." },
  { en: "Amarillo", pt: "Amarelo", category: "cores", pronunciation: "amaríjo", example: "El sol es amarillo.", examplePt: "O sol é amarelo.", level: 2, tip: "A cor do sol e da banana." },

  // ===== ANIMAIS (Animales) - Level 2 =====
  { en: "Gato", pt: "Gato", category: "animais", pronunciation: "gáto", example: "El gato duerme mucho.", examplePt: "O gato dorme muito.", level: 2, tip: "Um felino fofo." },
  { en: "Perro", pt: "Cachorro", category: "animais", pronunciation: "pérro", example: "El perro corre en el parque.", examplePt: "O cachorro corre no parque.", level: 2, tip: "O melhor amigo do homem. O 'rr' vibra com força na língua!" },
  { en: "Pájaro", pt: "Pássaro", category: "animais", pronunciation: "páharo", example: "El pájaro canta alegremente.", examplePt: "O pássaro canta alegremente.", level: 2, tip: "Animal com asas que voa no céu." },

  // ===== COMIDA (Comida) - Level 3 =====
  { en: "Agua", pt: "Água", category: "comida", pronunciation: "água", example: "Quiero un vaso de agua.", examplePt: "Quero um copo de água.", level: 3, tip: "Essencial para a vida." },
  { en: "Pan", pt: "Pão", category: "comida", pronunciation: "pan", example: "Pan fresco por la mañana.", examplePt: "Pão fresco de manhã.", level: 3, tip: "Alimento básico e saboroso." },
  { en: "Leche", pt: "Leite", category: "comida", pronunciation: "létche", example: "Café con leche.", examplePt: "Café com leite.", level: 3, tip: "Bebida branca e nutritiva." }
];

export const shuffleArray = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default words;
