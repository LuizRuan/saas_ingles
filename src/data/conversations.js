// Diálogos simulados para o treino de conversação
// Cada conversa: { topic, topicPt, icon, messages[] }
// Cada mensagem pode ser 'system' (pergunta do sistema) ou 'user' (opções de resposta)

export const conversations = [
  {
    id: "greetings",
    topic: "Greetings",
    topicPt: "Cumprimentos",
    icon: "👋",
    level: 1,
    messages: [
      { role: "system", text: "Hello! How are you?", translation: "Olá! Como você está?" },
      {
        role: "user",
        options: [
          { text: "I'm fine, thank you!", translation: "Estou bem, obrigado(a)!", correct: true },
          { text: "I'm good, and you?", translation: "Estou bem, e você?", correct: true },
          { text: "I'm tired today.", translation: "Estou cansado(a) hoje.", correct: true },
          { text: "I'm happy!", translation: "Estou feliz!", correct: true }
        ]
      },
      { role: "system", text: "That's nice! What is your name?", translation: "Que bom! Qual é o seu nome?" },
      {
        role: "user",
        options: [
          { text: "My name is Maria.", translation: "Meu nome é Maria.", correct: true },
          { text: "I'm João.", translation: "Eu sou o João.", correct: true },
          { text: "You can call me Ana.", translation: "Pode me chamar de Ana.", correct: true }
        ]
      },
      { role: "system", text: "Nice to meet you! Where are you from?", translation: "Prazer em conhecer! De onde você é?" },
      {
        role: "user",
        options: [
          { text: "I'm from Brazil.", translation: "Eu sou do Brasil.", correct: true },
          { text: "I'm from São Paulo.", translation: "Eu sou de São Paulo.", correct: true },
          { text: "I'm Brazilian.", translation: "Eu sou brasileiro(a).", correct: true }
        ]
      },
      { role: "system", text: "Cool! It was great talking to you. Goodbye!", translation: "Legal! Foi ótimo conversar com você. Tchau!" },
      {
        role: "user",
        options: [
          { text: "Goodbye! See you later!", translation: "Tchau! Até mais tarde!", correct: true },
          { text: "Bye! Have a nice day!", translation: "Tchau! Tenha um bom dia!", correct: true }
        ]
      }
    ]
  },
  {
    id: "breakfast",
    topic: "Breakfast",
    topicPt: "Café da manhã",
    icon: "🍳",
    level: 2,
    messages: [
      { role: "system", text: "Good morning! Did you eat breakfast?", translation: "Bom dia! Você comeu café da manhã?" },
      {
        role: "user",
        options: [
          { text: "Yes, I ate bread and coffee.", translation: "Sim, eu comi pão e café.", correct: true },
          { text: "No, I'm hungry.", translation: "Não, estou com fome.", correct: true },
          { text: "I'm eating now.", translation: "Estou comendo agora.", correct: true }
        ]
      },
      { role: "system", text: "What do you usually eat for breakfast?", translation: "O que você geralmente come no café da manhã?" },
      {
        role: "user",
        options: [
          { text: "I eat bread with butter and drink coffee.", translation: "Eu como pão com manteiga e bebo café.", correct: true },
          { text: "I eat eggs and juice.", translation: "Eu como ovos e suco.", correct: true },
          { text: "I eat fruit and milk.", translation: "Eu como frutas e leite.", correct: true }
        ]
      },
      { role: "system", text: "That sounds delicious! Do you cook your breakfast?", translation: "Parece delicioso! Você cozinha seu café da manhã?" },
      {
        role: "user",
        options: [
          { text: "Yes, I cook every morning.", translation: "Sim, eu cozinho toda manhã.", correct: true },
          { text: "No, my mother cooks for me.", translation: "Não, minha mãe cozinha para mim.", correct: true },
          { text: "Sometimes I cook.", translation: "Às vezes eu cozinho.", correct: true }
        ]
      }
    ]
  },
  {
    id: "school",
    topic: "School",
    topicPt: "Escola",
    icon: "🏫",
    level: 2,
    messages: [
      { role: "system", text: "Do you go to school?", translation: "Você vai à escola?" },
      {
        role: "user",
        options: [
          { text: "Yes, I go to school every day.", translation: "Sim, eu vou à escola todo dia.", correct: true },
          { text: "Yes, I'm a student.", translation: "Sim, eu sou um(a) estudante.", correct: true },
          { text: "No, I work.", translation: "Não, eu trabalho.", correct: true }
        ]
      },
      { role: "system", text: "What is your favorite subject?", translation: "Qual é sua matéria favorita?" },
      {
        role: "user",
        options: [
          { text: "I like English.", translation: "Eu gosto de inglês.", correct: true },
          { text: "My favorite is math.", translation: "Minha favorita é matemática.", correct: true },
          { text: "I like science.", translation: "Eu gosto de ciências.", correct: true }
        ]
      },
      { role: "system", text: "That's great! Do you like your teacher?", translation: "Que legal! Você gosta do(a) seu(sua) professor(a)?" },
      {
        role: "user",
        options: [
          { text: "Yes, my teacher is very nice.", translation: "Sim, meu(minha) professor(a) é muito legal.", correct: true },
          { text: "Yes, I like all my teachers.", translation: "Sim, eu gosto de todos os meus professores.", correct: true }
        ]
      }
    ]
  },
  {
    id: "family",
    topic: "Family",
    topicPt: "Família",
    icon: "👨‍👩‍👧‍👦",
    level: 2,
    messages: [
      { role: "system", text: "Tell me about your family. Do you have brothers or sisters?", translation: "Me conte sobre sua família. Você tem irmãos ou irmãs?" },
      {
        role: "user",
        options: [
          { text: "I have one brother and one sister.", translation: "Eu tenho um irmão e uma irmã.", correct: true },
          { text: "I have two brothers.", translation: "Eu tenho dois irmãos.", correct: true },
          { text: "No, I'm an only child.", translation: "Não, sou filho(a) único(a).", correct: true }
        ]
      },
      { role: "system", text: "How many people are in your family?", translation: "Quantas pessoas tem na sua família?" },
      {
        role: "user",
        options: [
          { text: "There are four people in my family.", translation: "Há quatro pessoas na minha família.", correct: true },
          { text: "We are five: my parents, my siblings, and me.", translation: "Somos cinco: meus pais, meus irmãos e eu.", correct: true },
          { text: "My family is small.", translation: "Minha família é pequena.", correct: true }
        ]
      },
      { role: "system", text: "Do you live with your family?", translation: "Você mora com sua família?" },
      {
        role: "user",
        options: [
          { text: "Yes, I live with my parents.", translation: "Sim, eu moro com meus pais.", correct: true },
          { text: "Yes, I live with my family.", translation: "Sim, eu moro com minha família.", correct: true },
          { text: "I live with my grandmother.", translation: "Eu moro com minha avó.", correct: true }
        ]
      }
    ]
  },
  {
    id: "restaurant",
    topic: "Restaurant",
    topicPt: "Restaurante",
    icon: "🍽️",
    level: 3,
    messages: [
      { role: "system", text: "Welcome to our restaurant! Table for how many?", translation: "Bem-vindo ao nosso restaurante! Mesa para quantos?" },
      {
        role: "user",
        options: [
          { text: "Table for two, please.", translation: "Mesa para dois, por favor.", correct: true },
          { text: "Just for me, thank you.", translation: "Só para mim, obrigado(a).", correct: true },
          { text: "For three people, please.", translation: "Para três pessoas, por favor.", correct: true }
        ]
      },
      { role: "system", text: "Here is the menu. What would you like to order?", translation: "Aqui está o cardápio. O que gostaria de pedir?" },
      {
        role: "user",
        options: [
          { text: "I would like a pizza, please.", translation: "Eu gostaria de uma pizza, por favor.", correct: true },
          { text: "Can I have a salad and juice?", translation: "Posso pedir uma salada e suco?", correct: true },
          { text: "I want chicken with rice.", translation: "Eu quero frango com arroz.", correct: true }
        ]
      },
      { role: "system", text: "Would you like something to drink?", translation: "Gostaria de algo para beber?" },
      {
        role: "user",
        options: [
          { text: "A glass of water, please.", translation: "Um copo de água, por favor.", correct: true },
          { text: "I would like orange juice.", translation: "Eu gostaria de suco de laranja.", correct: true },
          { text: "No, thank you.", translation: "Não, obrigado(a).", correct: true }
        ]
      },
      { role: "system", text: "Here is your food. Enjoy your meal!", translation: "Aqui está sua comida. Bom apetite!" },
      {
        role: "user",
        options: [
          { text: "Thank you! It looks delicious!", translation: "Obrigado(a)! Parece delicioso!", correct: true },
          { text: "Thank you very much!", translation: "Muito obrigado(a)!", correct: true }
        ]
      }
    ]
  },
  {
    id: "shopping",
    topic: "Shopping",
    topicPt: "Compras",
    icon: "🛍️",
    level: 3,
    messages: [
      { role: "system", text: "Hello! Can I help you?", translation: "Olá! Posso ajudar?" },
      {
        role: "user",
        options: [
          { text: "Yes, I'm looking for a shirt.", translation: "Sim, estou procurando uma camisa.", correct: true },
          { text: "I want to buy shoes.", translation: "Eu quero comprar sapatos.", correct: true },
          { text: "I'm just looking, thank you.", translation: "Estou só olhando, obrigado(a).", correct: true }
        ]
      },
      { role: "system", text: "What color do you prefer?", translation: "Que cor você prefere?" },
      {
        role: "user",
        options: [
          { text: "I like blue.", translation: "Eu gosto de azul.", correct: true },
          { text: "Do you have it in black?", translation: "Vocês têm em preto?", correct: true },
          { text: "Any color is fine.", translation: "Qualquer cor está bom.", correct: true }
        ]
      },
      { role: "system", text: "Here you go. Would you like to try it on?", translation: "Aqui está. Gostaria de experimentar?" },
      {
        role: "user",
        options: [
          { text: "Yes, please. Where is the fitting room?", translation: "Sim, por favor. Onde fica o provador?", correct: true },
          { text: "No, I'll take it. How much is it?", translation: "Não, vou levar. Quanto custa?", correct: true }
        ]
      }
    ]
  },
  {
    id: "asking_directions",
    topic: "Asking for Directions",
    topicPt: "Pedindo direções",
    icon: "🗺️",
    level: 3,
    messages: [
      { role: "system", text: "Excuse me, can I help you?", translation: "Com licença, posso ajudar?" },
      {
        role: "user",
        options: [
          { text: "Yes, where is the hospital?", translation: "Sim, onde fica o hospital?", correct: true },
          { text: "How do I get to the park?", translation: "Como eu chego ao parque?", correct: true },
          { text: "Is there a restaurant nearby?", translation: "Tem um restaurante por perto?", correct: true }
        ]
      },
      { role: "system", text: "Go straight and turn left at the corner.", translation: "Vá em frente e vire à esquerda na esquina." },
      {
        role: "user",
        options: [
          { text: "Thank you very much!", translation: "Muito obrigado(a)!", correct: true },
          { text: "Is it far from here?", translation: "É longe daqui?", correct: true },
          { text: "Can you repeat, please?", translation: "Pode repetir, por favor?", correct: true }
        ]
      }
    ]
  },
  {
    id: "introducing",
    topic: "Introducing Yourself",
    topicPt: "Apresentando-se",
    icon: "🙋",
    level: 1,
    messages: [
      { role: "system", text: "Hi there! What's your name?", translation: "Oi! Qual é o seu nome?" },
      {
        role: "user",
        options: [
          { text: "My name is Carlos.", translation: "Meu nome é Carlos.", correct: true },
          { text: "I'm Ana. Nice to meet you!", translation: "Eu sou Ana. Prazer em conhecer!", correct: true },
          { text: "Hi! I'm Pedro.", translation: "Oi! Eu sou Pedro.", correct: true }
        ]
      },
      { role: "system", text: "Nice to meet you! How old are you?", translation: "Prazer! Quantos anos você tem?" },
      {
        role: "user",
        options: [
          { text: "I'm twenty years old.", translation: "Eu tenho vinte anos.", correct: true },
          { text: "I'm fifteen.", translation: "Eu tenho quinze.", correct: true },
          { text: "I'm thirty-two.", translation: "Eu tenho trinta e dois.", correct: true }
        ]
      },
      { role: "system", text: "What do you do?", translation: "O que você faz? (profissão)" },
      {
        role: "user",
        options: [
          { text: "I'm a student.", translation: "Eu sou estudante.", correct: true },
          { text: "I work in an office.", translation: "Eu trabalho em um escritório.", correct: true },
          { text: "I'm a teacher.", translation: "Eu sou professor(a).", correct: true }
        ]
      }
    ]
  },
  {
    id: "telling_time",
    topic: "Telling Time",
    topicPt: "Perguntando as horas",
    icon: "🕐",
    level: 3,
    messages: [
      { role: "system", text: "Excuse me, what time is it?", translation: "Com licença, que horas são?" },
      {
        role: "user",
        options: [
          { text: "It's ten o'clock.", translation: "São dez horas.", correct: true },
          { text: "It's half past three.", translation: "São três e meia.", correct: true },
          { text: "Sorry, I don't have a watch.", translation: "Desculpe, eu não tenho relógio.", correct: true }
        ]
      },
      { role: "system", text: "Thank you! What time does the store open?", translation: "Obrigado! A que horas a loja abre?" },
      {
        role: "user",
        options: [
          { text: "It opens at nine in the morning.", translation: "Abre às nove da manhã.", correct: true },
          { text: "I think it opens at eight.", translation: "Eu acho que abre às oito.", correct: true },
          { text: "I don't know, sorry.", translation: "Eu não sei, desculpe.", correct: true }
        ]
      }
    ]
  },
  {
    id: "animals",
    topic: "Talking About Animals",
    topicPt: "Falando sobre animais",
    icon: "🐾",
    level: 2,
    messages: [
      { role: "system", text: "Do you have any pets?", translation: "Você tem algum animal de estimação?" },
      {
        role: "user",
        options: [
          { text: "Yes, I have a dog.", translation: "Sim, eu tenho um cachorro.", correct: true },
          { text: "I have two cats.", translation: "Eu tenho dois gatos.", correct: true },
          { text: "No, but I want a pet.", translation: "Não, mas eu quero um animal de estimação.", correct: true }
        ]
      },
      { role: "system", text: "What's your pet's name?", translation: "Qual é o nome do seu animal?" },
      {
        role: "user",
        options: [
          { text: "His name is Rex.", translation: "O nome dele é Rex.", correct: true },
          { text: "Her name is Luna.", translation: "O nome dela é Luna.", correct: true },
          { text: "I call him Buddy.", translation: "Eu o chamo de Buddy.", correct: true }
        ]
      },
      { role: "system", text: "That's cute! What is your favorite animal?", translation: "Que fofo! Qual é seu animal favorito?" },
      {
        role: "user",
        options: [
          { text: "I love dogs.", translation: "Eu amo cachorros.", correct: true },
          { text: "My favorite animal is the dolphin.", translation: "Meu animal favorito é o golfinho.", correct: true },
          { text: "I like cats and birds.", translation: "Eu gosto de gatos e pássaros.", correct: true }
        ]
      }
    ]
  },
  {
    id: "going_places",
    topic: "Going Places",
    topicPt: "Dizendo onde está indo",
    icon: "🚶",
    level: 3,
    messages: [
      { role: "system", text: "Hey! Where are you going?", translation: "Ei! Para onde você está indo?" },
      {
        role: "user",
        options: [
          { text: "I'm going to the store.", translation: "Estou indo à loja.", correct: true },
          { text: "I'm going home.", translation: "Estou indo para casa.", correct: true },
          { text: "I'm going to the park.", translation: "Estou indo ao parque.", correct: true }
        ]
      },
      { role: "system", text: "How are you getting there?", translation: "Como você vai chegar lá?" },
      {
        role: "user",
        options: [
          { text: "I'm taking the bus.", translation: "Estou pegando o ônibus.", correct: true },
          { text: "I'm walking.", translation: "Estou andando.", correct: true },
          { text: "I'm going by car.", translation: "Estou indo de carro.", correct: true }
        ]
      },
      { role: "system", text: "Can I go with you?", translation: "Posso ir com você?" },
      {
        role: "user",
        options: [
          { text: "Of course! Let's go!", translation: "Claro! Vamos lá!", correct: true },
          { text: "Sure, come with me.", translation: "Claro, venha comigo.", correct: true },
          { text: "Sorry, I'm in a hurry.", translation: "Desculpe, estou com pressa.", correct: true }
        ]
      }
    ]
  },
  {
    id: "asking_help",
    topic: "Asking for Help",
    topicPt: "Pedindo ajuda",
    icon: "🆘",
    level: 2,
    messages: [
      { role: "system", text: "You look confused. Do you need help?", translation: "Você parece confuso(a). Precisa de ajuda?" },
      {
        role: "user",
        options: [
          { text: "Yes, please. I need help.", translation: "Sim, por favor. Eu preciso de ajuda.", correct: true },
          { text: "Can you help me, please?", translation: "Você pode me ajudar, por favor?", correct: true },
          { text: "I don't understand this.", translation: "Eu não entendo isso.", correct: true }
        ]
      },
      { role: "system", text: "Of course! What do you need?", translation: "Claro! Do que você precisa?" },
      {
        role: "user",
        options: [
          { text: "I'm lost. Where is the bus stop?", translation: "Estou perdido(a). Onde é a parada de ônibus?", correct: true },
          { text: "Can you speak slowly, please?", translation: "Pode falar devagar, por favor?", correct: true },
          { text: "I don't speak English very well.", translation: "Eu não falo inglês muito bem.", correct: true }
        ]
      },
      { role: "system", text: "No problem! I can help you.", translation: "Sem problema! Eu posso te ajudar." },
      {
        role: "user",
        options: [
          { text: "Thank you so much!", translation: "Muito obrigado(a)!", correct: true },
          { text: "You are very kind.", translation: "Você é muito gentil.", correct: true }
        ]
      }
    ]
  },
];
