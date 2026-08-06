// Diálogos ramificados do treino de conversação.
//
// FORMATO — grafo de nós, não lista linear:
//   { id, topic, topicPt, icon, level, start, nodes: { [id]: nó } }
//   nó    = { text, translation, replies: [] }
//   reply = { text, translation, next, accepts?: [] }
//
// `next` aponta o id do próximo nó, e é ele que faz a ramificação existir de
// verdade: a versão antiga deste arquivo era linear e a escolha do usuário não
// mudava nada, então repetir um tema dava sempre o mesmo diálogo.
//
// Um nó com `replies: []` encerra a conversa.
//
// `accepts` mora na RESPOSTA, não no nó: são as outras formas de dizer aquela
// mesma coisa, aceitas quando o usuário digita em vez de clicar. Como estão
// presas à resposta, a frase digitada segue o mesmo caminho da alternativa
// equivalente. Se `accepts` ficasse no nó, não haveria como saber o `next`.
// answerCheck.js normaliza tudo (caixa, pontuação, contrações), então não é
// preciso listar "I'm" e "I am" separadamente.
//
// data.test.js valida a integridade do grafo: todo `next` existe, todo nó é
// alcançável a partir de `start` e toda conversa chega a um fim.

export const conversations = [
  {
    id: 'greetings',
    topic: 'Greetings',
    topicPt: 'Cumprimentos',
    icon: '👋',
    level: 1,
    start: 'hello',
    nodes: {
      hello: {
        text: 'Hello! How are you today?',
        translation: 'Olá! Como você está hoje?',
        replies: [
          { text: "I'm fine, thank you!", translation: 'Estou bem, obrigado(a)!', next: 'ask_name', accepts: ["I'm good", 'Very well, thanks', "I'm great"] },
          { text: "I'm a little tired.", translation: 'Estou um pouco cansado(a).', next: 'why_tired', accepts: ["I'm tired", 'A bit tired'] },
          { text: 'Not so good, honestly.', translation: 'Não muito bem, sinceramente.', next: 'what_happened', accepts: ['Not very good', 'Not great'] },
        ],
      },
      why_tired: {
        text: 'Oh no! Why are you tired?',
        translation: 'Ah não! Por que você está cansado(a)?',
        replies: [
          { text: 'I worked a lot yesterday.', translation: 'Eu trabalhei muito ontem.', next: 'take_care', accepts: ['I worked too much'] },
          { text: "I didn't sleep well.", translation: 'Eu não dormi bem.', next: 'take_care', accepts: ['I slept badly', "I couldn't sleep"] },
        ],
      },
      what_happened: {
        text: "I'm sorry to hear that. Do you want to talk about it?",
        translation: 'Sinto muito por isso. Você quer falar sobre isso?',
        replies: [
          { text: 'Yes, I had a difficult day.', translation: 'Sim, eu tive um dia difícil.', next: 'take_care', accepts: ['I had a bad day'] },
          { text: 'No, but thank you for asking.', translation: 'Não, mas obrigado(a) por perguntar.', next: 'ask_name', accepts: ['No, thanks for asking'] },
        ],
      },
      take_care: {
        text: 'Take care of yourself! By the way, what is your name?',
        translation: 'Se cuide! A propósito, qual é o seu nome?',
        replies: [
          { text: 'My name is Maria.', translation: 'Meu nome é Maria.', next: 'where_from', accepts: ["I'm Maria", 'Maria'] },
          { text: 'You can call me Pedro.', translation: 'Pode me chamar de Pedro.', next: 'where_from', accepts: ["I'm Pedro"] },
        ],
      },
      ask_name: {
        text: "That's good to hear! What is your name?",
        translation: 'Que bom ouvir isso! Qual é o seu nome?',
        replies: [
          { text: 'My name is Ana.', translation: 'Meu nome é Ana.', next: 'where_from', accepts: ["I'm Ana", 'Ana'] },
          { text: "I'm João. Nice to meet you!", translation: 'Eu sou o João. Prazer em conhecer!', next: 'where_from', accepts: ['My name is João'] },
        ],
      },
      where_from: {
        text: 'Nice to meet you! Where are you from?',
        translation: 'Prazer em conhecer! De onde você é?',
        replies: [
          { text: "I'm from Brazil.", translation: 'Eu sou do Brasil.', next: 'about_brazil', accepts: ["I'm Brazilian", 'I come from Brazil'] },
          { text: 'I live here in this city.', translation: 'Eu moro aqui nesta cidade.', next: 'goodbye', accepts: ['I live here'] },
        ],
      },
      about_brazil: {
        text: 'Brazil is beautiful! Do you like living there?',
        translation: 'O Brasil é lindo! Você gosta de morar lá?',
        replies: [
          { text: 'Yes, I love it!', translation: 'Sim, eu amo!', next: 'goodbye', accepts: ['Yes, I love my country'] },
          { text: 'Yes, but the weather is very hot.', translation: 'Sim, mas o clima é muito quente.', next: 'goodbye', accepts: ["It's very hot there"] },
        ],
      },
      goodbye: {
        text: 'It was great talking to you. Have a nice day. Goodbye!',
        translation: 'Foi ótimo conversar com você. Tenha um bom dia. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'introducing',
    topic: 'Introducing Yourself',
    topicPt: 'Apresentando-se',
    icon: '🙋',
    level: 1,
    start: 'hi',
    nodes: {
      hi: {
        text: "Hi there! I don't think we have met. What's your name?",
        translation: 'Oi! Acho que não nos conhecemos. Qual é o seu nome?',
        replies: [
          { text: "I'm Carlos. Nice to meet you!", translation: 'Eu sou o Carlos. Prazer em conhecer!', next: 'how_old', accepts: ['My name is Carlos'] },
          { text: 'My name is Beatriz.', translation: 'Meu nome é Beatriz.', next: 'how_old', accepts: ["I'm Beatriz"] },
        ],
      },
      how_old: {
        text: 'Nice to meet you too! How old are you?',
        translation: 'Prazer em conhecer também! Quantos anos você tem?',
        replies: [
          { text: "I'm twenty years old.", translation: 'Eu tenho vinte anos.', next: 'what_do', accepts: ["I'm 20 years old", "I'm twenty"] },
          { text: "I'm thirty-two.", translation: 'Eu tenho trinta e dois.', next: 'what_do', accepts: ["I'm 32", "I'm thirty two years old"] },
          { text: "I'd rather not say.", translation: 'Prefiro não dizer.', next: 'no_problem', accepts: ['I prefer not to say'] },
        ],
      },
      no_problem: {
        text: 'No problem at all! So, what do you do?',
        translation: 'Sem problema nenhum! Então, o que você faz?',
        replies: [
          { text: "I'm a student.", translation: 'Eu sou estudante.', next: 'study_what', accepts: ['I study'] },
          { text: 'I work in an office.', translation: 'Eu trabalho em um escritório.', next: 'like_job', accepts: ['I work at an office'] },
        ],
      },
      what_do: {
        text: 'Cool! And what do you do?',
        translation: 'Legal! E o que você faz?',
        replies: [
          { text: "I'm a student.", translation: 'Eu sou estudante.', next: 'study_what', accepts: ['I study', "I'm still studying"] },
          { text: "I'm a teacher.", translation: 'Eu sou professor(a).', next: 'like_job', accepts: ['I teach'] },
          { text: 'I work in an office.', translation: 'Eu trabalho em um escritório.', next: 'like_job', accepts: ['I work at an office'] },
        ],
      },
      study_what: {
        text: 'That sounds interesting. What do you study?',
        translation: 'Parece interessante. O que você estuda?',
        replies: [
          { text: 'I study English.', translation: 'Eu estudo inglês.', next: 'why_english', accepts: ["I'm studying English"] },
          { text: 'I study medicine.', translation: 'Eu estudo medicina.', next: 'end_nice', accepts: ["I'm studying medicine"] },
        ],
      },
      like_job: {
        text: 'Do you like your job?',
        translation: 'Você gosta do seu trabalho?',
        replies: [
          { text: 'Yes, I like it a lot.', translation: 'Sim, eu gosto muito.', next: 'end_nice', accepts: ['Yes, I love it'] },
          { text: "It's okay, but it's tiring.", translation: 'É ok, mas é cansativo.', next: 'end_nice', accepts: ["It's tiring"] },
        ],
      },
      why_english: {
        text: "That's great! Why are you learning English?",
        translation: 'Que ótimo! Por que você está aprendendo inglês?',
        replies: [
          { text: 'I want to travel abroad.', translation: 'Eu quero viajar para o exterior.', next: 'end_nice', accepts: ['I want to travel'] },
          { text: 'I need it for my job.', translation: 'Eu preciso para o meu trabalho.', next: 'end_nice', accepts: ['I need it for work'] },
        ],
      },
      end_nice: {
        text: 'It was really nice meeting you. See you around!',
        translation: 'Foi muito bom te conhecer. Até mais!',
        replies: [],
      },
    },
  },

  {
    id: 'colors',
    topic: 'Colors & Things',
    topicPt: 'Cores e objetos',
    icon: '🎨',
    level: 1,
    start: 'favorite_color',
    nodes: {
      favorite_color: {
        text: 'Hi! What is your favorite color?',
        translation: 'Oi! Qual é a sua cor favorita?',
        replies: [
          { text: 'My favorite color is blue.', translation: 'Minha cor favorita é azul.', next: 'why_blue', accepts: ['Blue', 'I like blue'] },
          { text: 'I love the color red.', translation: 'Eu adoro a cor vermelha.', next: 'red_things', accepts: ['Red', 'I like red'] },
          { text: 'I like green the most.', translation: 'Eu gosto mais de verde.', next: 'green_things', accepts: ['Green', 'I like green'] },
        ],
      },
      why_blue: {
        text: 'Nice! Blue is the color of the sky. What things are blue?',
        translation: 'Legal! Azul é a cor do céu. Que coisas são azuis?',
        replies: [
          { text: 'The sky and the ocean are blue.', translation: 'O céu e o oceano são azuis.', next: 'your_clothes', accepts: ['Sky and ocean'] },
          { text: 'My pen and my notebook are blue.', translation: 'Minha caneta e meu caderno são azuis.', next: 'your_clothes', accepts: ['Pen and notebook'] },
        ],
      },
      red_things: {
        text: 'Red is a strong color! What things are red?',
        translation: 'Vermelho é uma cor forte! Que coisas são vermelhas?',
        replies: [
          { text: 'Apples and tomatoes are red.', translation: 'Maçãs e tomates são vermelhos.', next: 'your_clothes', accepts: ['Apples and tomatoes'] },
          { text: 'My bag is red.', translation: 'Minha bolsa é vermelha.', next: 'your_clothes', accepts: ['My bag'] },
        ],
      },
      green_things: {
        text: 'Green is the color of nature! What things are green?',
        translation: 'Verde é a cor da natureza! Que coisas são verdes?',
        replies: [
          { text: 'Leaves and grass are green.', translation: 'Folhas e grama são verdes.', next: 'your_clothes', accepts: ['Leaves and grass'] },
          { text: 'Broccoli and spinach are green.', translation: 'Brócolis e espinafre são verdes.', next: 'your_clothes', accepts: ['Broccoli and spinach'] },
        ],
      },
      your_clothes: {
        text: 'What color are your clothes today?',
        translation: 'De que cor são as suas roupas hoje?',
        replies: [
          { text: 'I am wearing a white shirt.', translation: 'Estou usando uma camisa branca.', next: 'mix_colors', accepts: ['White shirt'] },
          { text: 'My pants are black.', translation: 'Minha calça é preta.', next: 'mix_colors', accepts: ['Black pants'] },
          { text: 'I am wearing many colors today.', translation: 'Estou usando muitas cores hoje.', next: 'mix_colors', accepts: ['Many colors'] },
        ],
      },
      mix_colors: {
        text: 'Do you know what color you get when you mix blue and yellow?',
        translation: 'Você sabe que cor você obtém ao misturar azul e amarelo?',
        replies: [
          { text: 'You get green!', translation: 'Você obtém verde!', next: 'end_colors', accepts: ['Green'] },
          { text: 'I am not sure.', translation: 'Não tenho certeza.', next: 'end_colors', accepts: ["I don't know"] },
        ],
      },
      end_colors: {
        text: "Correct! Blue + Yellow = Green. You're doing great. Goodbye!",
        translation: 'Correto! Azul + Amarelo = Verde. Você está indo muito bem. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'numbers',
    topic: 'Numbers & Counting',
    topicPt: 'Números e contagem',
    icon: '🔢',
    level: 1,
    start: 'count_to_ten',
    nodes: {
      count_to_ten: {
        text: 'Let\'s practice numbers! Can you count from one to five?',
        translation: 'Vamos praticar números! Você consegue contar de um a cinco?',
        replies: [
          { text: 'One, two, three, four, five.', translation: 'Um, dois, três, quatro, cinco.', next: 'how_old', accepts: ['1, 2, 3, 4, 5'] },
          { text: 'I know the numbers in English!', translation: 'Eu sei os números em inglês!', next: 'know_numbers', accepts: ['I know them'] },
        ],
      },
      know_numbers: {
        text: 'Awesome! Number practice is very important. How old are you?',
        translation: 'Incrível! Praticar números é muito importante. Quantos anos você tem?',
        replies: [
          { text: 'I am twenty years old.', translation: 'Eu tenho vinte anos.', next: 'how_many_siblings', accepts: ["I'm 20", "I'm twenty"] },
          { text: 'I am thirty years old.', translation: 'Eu tenho trinta anos.', next: 'how_many_siblings', accepts: ["I'm 30", "I'm thirty"] },
        ],
      },
      how_old: {
        text: 'Perfect! How old are you? Tell me in English.',
        translation: 'Perfeito! Quantos anos você tem? Diga em inglês.',
        replies: [
          { text: 'I am twenty years old.', translation: 'Eu tenho vinte anos.', next: 'how_many_siblings', accepts: ["I'm 20", "I'm twenty"] },
          { text: 'I am thirty years old.', translation: 'Eu tenho trinta anos.', next: 'how_many_siblings', accepts: ["I'm 30", "I'm thirty"] },
          { text: 'I am twenty-five years old.', translation: 'Eu tenho vinte e cinco anos.', next: 'how_many_siblings', accepts: ["I'm 25", "I'm twenty five"] },
        ],
      },
      how_many_siblings: {
        text: 'Good! How many brothers and sisters do you have?',
        translation: 'Ótimo! Quantos irmãos e irmãs você tem?',
        replies: [
          { text: 'I have two brothers and one sister.', translation: 'Eu tenho dois irmãos e uma irmã.', next: 'phone_number', accepts: ['Two brothers and one sister'] },
          { text: 'I have no siblings.', translation: 'Eu não tenho irmãos.', next: 'phone_number', accepts: ['No siblings', 'None'] },
          { text: 'I have three sisters.', translation: 'Eu tenho três irmãs.', next: 'phone_number', accepts: ['Three sisters'] },
        ],
      },
      phone_number: {
        text: 'Can you say a phone number in English? Try saying each digit.',
        translation: 'Você consegue dizer um número de telefone em inglês? Tente dizer cada dígito.',
        replies: [
          { text: 'Nine, one, zero, five, two.', translation: 'Nove, um, zero, cinco, dois.', next: 'price_game', accepts: ['9, 1, 0, 5, 2'] },
          { text: 'One, two, three, four, five.', translation: 'Um, dois, três, quatro, cinco.', next: 'price_game', accepts: ['1, 2, 3, 4, 5'] },
        ],
      },
      price_game: {
        text: 'Great! A coffee costs two dollars fifty. How much is it?',
        translation: 'Ótimo! Um café custa dois dólares e cinquenta. Quanto é?',
        replies: [
          { text: 'It is two fifty.', translation: 'É dois e cinquenta.', next: 'end_numbers', accepts: ['Two dollars fifty', "It's 2.50"] },
          { text: 'Two dollars and fifty cents.', translation: 'Dois dólares e cinquenta centavos.', next: 'end_numbers', accepts: ['2 dollars 50 cents'] },
        ],
      },
      end_numbers: {
        text: 'Excellent work! Numbers are very useful every day. See you next time!',
        translation: 'Excelente trabalho! Os números são muito úteis todo dia. Até a próxima!',
        replies: [],
      },
    },
  },

  {
    id: 'daily_routine',
    topic: 'Daily Routine',
    topicPt: 'Rotina diária',
    icon: '🌅',
    level: 1,
    start: 'wake_up',
    nodes: {
      wake_up: {
        text: 'What time do you usually wake up?',
        translation: 'A que horas você geralmente acorda?',
        replies: [
          { text: 'I wake up at six in the morning.', translation: 'Eu acordo às seis da manhã.', next: 'morning_activities', accepts: ['At six', 'Six in the morning'] },
          { text: 'I wake up at seven thirty.', translation: 'Eu acordo às sete e meia.', next: 'morning_activities', accepts: ['At seven thirty', '7:30'] },
          { text: 'I wake up late, around nine.', translation: 'Eu acordo tarde, perto das nove.', next: 'sleep_late', accepts: ['Around nine', 'At nine'] },
        ],
      },
      sleep_late: {
        text: 'Waking up late is nice! What do you do next?',
        translation: 'Acordar tarde é muito bom! O que você faz em seguida?',
        replies: [
          { text: 'First, I take a shower.', translation: 'Primeiro, eu tomo banho.', next: 'breakfast_q', accepts: ['I shower first'] },
          { text: 'I brush my teeth.', translation: 'Eu escovo meus dentes.', next: 'breakfast_q', accepts: ['Brush teeth'] },
        ],
      },
      morning_activities: {
        text: 'What do you do first in the morning?',
        translation: 'O que você faz primeiro de manhã?',
        replies: [
          { text: 'First, I take a shower.', translation: 'Primeiro, eu tomo banho.', next: 'breakfast_q', accepts: ['I shower first'] },
          { text: 'I drink coffee and check my phone.', translation: 'Eu tomo café e vejo meu celular.', next: 'breakfast_q', accepts: ['Coffee and phone'] },
          { text: 'I brush my teeth.', translation: 'Eu escovo meus dentes.', next: 'breakfast_q', accepts: ['Brush teeth'] },
        ],
      },
      breakfast_q: {
        text: 'Do you eat breakfast every day?',
        translation: 'Você toma café da manhã todo dia?',
        replies: [
          { text: 'Yes, breakfast is very important for me.', translation: 'Sim, o café da manhã é muito importante para mim.', next: 'go_to_work', accepts: ['Yes, always'] },
          { text: 'No, I am not hungry in the morning.', translation: 'Não, não tenho fome de manhã.', next: 'go_to_work', accepts: ['No, never'] },
        ],
      },
      go_to_work: {
        text: 'What time do you go to work or school?',
        translation: 'A que horas você vai trabalhar ou para a escola?',
        replies: [
          { text: 'I leave the house at eight.', translation: 'Eu saio de casa às oito.', next: 'evening_routine', accepts: ['At eight'] },
          { text: 'I start at nine in the morning.', translation: 'Eu começo às nove da manhã.', next: 'evening_routine', accepts: ['At nine', 'Nine in the morning'] },
        ],
      },
      evening_routine: {
        text: 'What do you do in the evening?',
        translation: 'O que você faz à noite?',
        replies: [
          { text: 'I watch TV and then go to sleep.', translation: 'Eu assisto TV e depois durmo.', next: 'end_routine', accepts: ['Watch TV'] },
          { text: 'I study English at night.', translation: 'Eu estudo inglês à noite.', next: 'end_routine', accepts: ['I study'] },
          { text: 'I cook dinner and eat with my family.', translation: 'Eu cozinho jantar e como com minha família.', next: 'end_routine', accepts: ['Cook dinner'] },
        ],
      },
      end_routine: {
        text: 'That sounds like a good day! Routines help us stay organised. Goodbye!',
        translation: 'Parece um bom dia! Rotinas nos ajudam a ficar organizados. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'food_drinks',
    topic: 'Food & Drinks',
    topicPt: 'Comidas e bebidas',
    icon: '🍎',
    level: 1,
    start: 'hungry',
    nodes: {
      hungry: {
        text: 'Are you hungry? What is your favorite food?',
        translation: 'Você está com fome? Qual é a sua comida favorita?',
        replies: [
          { text: 'I love pizza!', translation: 'Eu adoro pizza!', next: 'pizza_topping', accepts: ['Pizza is my favorite'] },
          { text: 'My favorite food is rice and beans.', translation: 'Minha comida favorita é arroz e feijão.', next: 'like_sweets', accepts: ['Rice and beans'] },
          { text: 'I love fruit. Especially mango.', translation: 'Eu adoro frutas. Especialmente manga.', next: 'like_sweets', accepts: ['I love fruit', 'Mango'] },
        ],
      },
      pizza_topping: {
        text: 'Yummy! What is your favorite pizza topping?',
        translation: 'Que delícia! Qual é o seu topping de pizza favorito?',
        replies: [
          { text: 'I like cheese and tomato.', translation: 'Eu gosto de queijo e tomate.', next: 'like_sweets', accepts: ['Cheese and tomato'] },
          { text: 'I prefer pepperoni.', translation: 'Eu prefiro pepperoni.', next: 'like_sweets', accepts: ['Pepperoni'] },
        ],
      },
      like_sweets: {
        text: 'Do you like sweets? What is your favorite dessert?',
        translation: 'Você gosta de doces? Qual é a sua sobremesa favorita?',
        replies: [
          { text: 'I love chocolate cake.', translation: 'Eu adoro bolo de chocolate.', next: 'drink_pref', accepts: ['Chocolate cake'] },
          { text: 'I prefer ice cream.', translation: 'Eu prefiro sorvete.', next: 'drink_pref', accepts: ['Ice cream'] },
          { text: 'I do not eat sweets.', translation: 'Eu não como doces.', next: 'drink_pref', accepts: ["I don't like sweets"] },
        ],
      },
      drink_pref: {
        text: 'What do you drink every day?',
        translation: 'O que você bebe todo dia?',
        replies: [
          { text: 'I drink a lot of water.', translation: 'Eu bebo muita água.', next: 'food_dislike', accepts: ['Water'] },
          { text: 'I love coffee.', translation: 'Eu adoro café.', next: 'food_dislike', accepts: ['Coffee'] },
          { text: 'I drink juice in the morning.', translation: 'Eu bebo suco de manhã.', next: 'food_dislike', accepts: ['Juice'] },
        ],
      },
      food_dislike: {
        text: 'Is there any food you do not like?',
        translation: 'Existe alguma comida que você não gosta?',
        replies: [
          { text: 'I do not like vegetables.', translation: 'Eu não gosto de legumes.', next: 'end_food', accepts: ["I don't like vegetables"] },
          { text: 'I dislike spicy food.', translation: 'Eu não gosto de comida picante.', next: 'end_food', accepts: ["I don't like spicy food"] },
          { text: 'I like almost everything!', translation: 'Eu gosto de quase tudo!', next: 'end_food', accepts: ['I like everything'] },
        ],
      },
      end_food: {
        text: 'Talking about food always makes me hungry! See you soon!',
        translation: 'Falar de comida sempre me dá fome! Até logo!',
        replies: [],
      },
    },
  },

  {
    id: 'body_health',
    topic: 'Body Parts & Feelings',
    topicPt: 'Partes do corpo e sentimentos',
    icon: '🤒',
    level: 1,
    start: 'how_are_you',
    nodes: {
      how_are_you: {
        text: 'Hi! How are you feeling today?',
        translation: 'Oi! Como você está se sentindo hoje?',
        replies: [
          { text: 'I feel great today!', translation: 'Estou ótimo(a) hoje!', next: 'body_parts', accepts: ["I'm great", 'Very well'] },
          { text: 'I have a headache.', translation: 'Estou com dor de cabeça.', next: 'head_pain', accepts: ['My head hurts'] },
          { text: 'My legs are tired.', translation: 'Minhas pernas estão cansadas.', next: 'leg_pain', accepts: ['My legs hurt'] },
        ],
      },
      head_pain: {
        text: 'Oh no! Did you drink enough water today?',
        translation: 'Ah não! Você bebeu água suficiente hoje?',
        replies: [
          { text: 'No, I forgot to drink water.', translation: 'Não, eu esqueci de beber água.', next: 'body_parts', accepts: ["I didn't drink water"] },
          { text: 'Yes, but I slept badly.', translation: 'Sim, mas eu dormi mal.', next: 'body_parts', accepts: ['I slept badly'] },
        ],
      },
      leg_pain: {
        text: 'Did you exercise a lot yesterday?',
        translation: 'Você se exercitou muito ontem?',
        replies: [
          { text: 'Yes, I ran for one hour.', translation: 'Sim, eu corri por uma hora.', next: 'body_parts', accepts: ['I ran yesterday'] },
          { text: 'I walked a lot.', translation: 'Eu caminhei muito.', next: 'body_parts', accepts: ['I walked a lot'] },
        ],
      },
      body_parts: {
        text: 'Let\'s learn body parts! Can you point to your nose?',
        translation: 'Vamos aprender partes do corpo! Você consegue apontar para o seu nariz?',
        replies: [
          { text: 'Yes! I can also point to my eyes and ears.', translation: 'Sim! Também consigo apontar meus olhos e ouvidos.', next: 'hands_feet', accepts: ['Eyes and ears'] },
          { text: 'Nose! And mouth. And eyes.', translation: 'Nariz! E boca. E olhos.', next: 'hands_feet', accepts: ['Nose mouth eyes'] },
        ],
      },
      hands_feet: {
        text: 'Great! How many fingers do you have on one hand?',
        translation: 'Ótimo! Quantos dedos você tem em uma mão?',
        replies: [
          { text: 'I have five fingers on one hand.', translation: 'Eu tenho cinco dedos em uma mão.', next: 'end_body', accepts: ['Five fingers'] },
          { text: 'Five! And ten fingers total.', translation: 'Cinco! E dez dedos no total.', next: 'end_body', accepts: ['Five and ten total'] },
        ],
      },
      end_body: {
        text: 'Excellent! Take care of your body every day. Goodbye!',
        translation: 'Excelente! Cuide do seu corpo todo dia. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'places_city',
    topic: 'Places in the City',
    topicPt: 'Lugares na cidade',
    icon: '🏙️',
    level: 1,
    start: 'your_city',
    nodes: {
      your_city: {
        text: 'Tell me about your city! Do you live in a big city or a small town?',
        translation: 'Me fale sobre a sua cidade! Você mora em uma cidade grande ou numa cidadezinha?',
        replies: [
          { text: 'I live in a big city.', translation: 'Eu moro em uma cidade grande.', next: 'what_places', accepts: ['Big city'] },
          { text: 'I live in a small town.', translation: 'Eu moro em uma cidade pequena.', next: 'small_town_info', accepts: ['Small town'] },
        ],
      },
      small_town_info: {
        text: 'Small towns are very peaceful! What places are near your home?',
        translation: 'Cidades pequenas são muito tranquilas! Que lugares ficam perto da sua casa?',
        replies: [
          { text: 'There is a park and a school.', translation: 'Tem um parque e uma escola.', next: 'favorite_place', accepts: ['Park and school'] },
          { text: 'There is a supermarket and a bank.', translation: 'Tem um supermercado e um banco.', next: 'favorite_place', accepts: ['Supermarket and bank'] },
        ],
      },
      what_places: {
        text: 'What places are near your home?',
        translation: 'Que lugares ficam perto da sua casa?',
        replies: [
          { text: 'There is a supermarket and a bank.', translation: 'Tem um supermercado e um banco.', next: 'favorite_place', accepts: ['Supermarket and bank'] },
          { text: 'There is a park and a school.', translation: 'Tem um parque e uma escola.', next: 'favorite_place', accepts: ['Park and school'] },
          { text: 'There is a hospital and a pharmacy.', translation: 'Tem um hospital e uma farmácia.', next: 'favorite_place', accepts: ['Hospital and pharmacy'] },
        ],
      },
      favorite_place: {
        text: 'What is your favorite place in the city?',
        translation: 'Qual é o seu lugar favorito na cidade?',
        replies: [
          { text: 'I love the park.', translation: 'Eu adoro o parque.', next: 'go_how', accepts: ['The park'] },
          { text: 'The shopping mall is my favorite.', translation: 'O shopping é o meu favorito.', next: 'go_how', accepts: ['The mall'] },
          { text: 'I like the library.', translation: 'Eu gosto da biblioteca.', next: 'go_how', accepts: ['The library'] },
        ],
      },
      go_how: {
        text: 'How do you usually get around the city?',
        translation: 'Como você geralmente se locomove pela cidade?',
        replies: [
          { text: 'I take the bus.', translation: 'Eu pego o ônibus.', next: 'dangerous', accepts: ['By bus'] },
          { text: 'I walk or ride my bike.', translation: 'Eu caminho ou ando de bicicleta.', next: 'dangerous', accepts: ['Walk or bike'] },
          { text: 'My parents drive me.', translation: 'Meus pais me levam de carro.', next: 'dangerous', accepts: ['My parents drive me'] },
        ],
      },
      dangerous: {
        text: 'Is your city safe?',
        translation: 'A sua cidade é segura?',
        replies: [
          { text: 'Yes, it is very safe here.', translation: 'Sim, é muito seguro aqui.', next: 'end_city', accepts: ['Yes, very safe'] },
          { text: 'It is okay in some areas.', translation: 'É ok em algumas áreas.', next: 'end_city', accepts: ['In some areas'] },
        ],
      },
      end_city: {
        text: 'Every city is unique! Thanks for sharing. See you!',
        translation: 'Toda cidade é única! Obrigado por compartilhar. Até mais!',
        replies: [],
      },
    },
  },

  {
    id: 'clothes',
    topic: 'Clothes & Getting Dressed',
    topicPt: 'Roupas e se vestir',
    icon: '👕',
    level: 1,
    start: 'what_wearing',
    nodes: {
      what_wearing: {
        text: 'Hello! What are you wearing today?',
        translation: 'Olá! O que você está usando hoje?',
        replies: [
          { text: 'I am wearing a T-shirt and jeans.', translation: 'Estou usando uma camiseta e jeans.', next: 'color_clothes', accepts: ['T-shirt and jeans'] },
          { text: 'I am wearing a dress.', translation: 'Estou usando um vestido.', next: 'color_clothes', accepts: ['A dress'] },
          { text: 'I am wearing a shirt and trousers.', translation: 'Estou usando uma camisa e calça.', next: 'comfy_wear', accepts: ['Shirt and trousers'] },
        ],
      },
      comfy_wear: {
        text: 'Comfortable clothing is the best! What color are your clothes?',
        translation: 'Roupas confortáveis são as melhores! De que cor são suas roupas?',
        replies: [
          { text: 'My shirt is white and my pants are blue.', translation: 'Minha camiseta é branca e minha calça é azul.', next: 'shoes', accepts: ['White and blue'] },
          { text: 'All black today.', translation: 'Tudo preto hoje.', next: 'shoes', accepts: ['Black'] },
        ],
      },
      color_clothes: {
        text: 'Nice! What color are your clothes?',
        translation: 'Legal! De que cor são suas roupas?',
        replies: [
          { text: 'My shirt is white and my pants are blue.', translation: 'Minha camiseta é branca e minha calça é azul.', next: 'shoes', accepts: ['White and blue'] },
          { text: 'All black today.', translation: 'Tudo preto hoje.', next: 'shoes', accepts: ['Black'] },
          { text: 'I have many colors on.', translation: 'Estou usando muitas cores.', next: 'shoes', accepts: ['Many colors'] },
        ],
      },
      shoes: {
        text: 'What kind of shoes are you wearing?',
        translation: 'Que tipo de sapato você está usando?',
        replies: [
          { text: 'I am wearing sneakers.', translation: 'Estou usando tênis.', next: 'weather_dress', accepts: ['Sneakers'] },
          { text: 'I am wearing sandals.', translation: 'Estou usando sandálias.', next: 'weather_dress', accepts: ['Sandals'] },
          { text: 'I am wearing boots.', translation: 'Estou usando botas.', next: 'weather_dress', accepts: ['Boots'] },
        ],
      },
      weather_dress: {
        text: 'Do you dress differently in summer and winter?',
        translation: 'Você se veste de forma diferente no verão e no inverno?',
        replies: [
          { text: 'Yes! In summer I wear shorts and in winter a coat.', translation: 'Sim! No verão uso shorts e no inverno um casaco.', next: 'favorite_outfit', accepts: ['Shorts in summer, coat in winter'] },
          { text: 'I live in a warm place so always the same.', translation: 'Eu moro em um lugar quente então sempre igual.', next: 'favorite_outfit', accepts: ['Always the same'] },
        ],
      },
      favorite_outfit: {
        text: 'What is your favorite outfit?',
        translation: 'Qual é o seu look favorito?',
        replies: [
          { text: 'I love jeans and a simple T-shirt.', translation: 'Eu adoro jeans e uma camiseta simples.', next: 'end_clothes', accepts: ['Jeans and T-shirt'] },
          { text: 'I like to dress elegantly.', translation: 'Eu gosto de me vestir elegante.', next: 'end_clothes', accepts: ['Elegant clothes'] },
          { text: 'Comfortable clothes are my favorite.', translation: 'Roupas confortáveis são meu favorito.', next: 'end_clothes', accepts: ['Comfortable clothes'] },
        ],
      },
      end_clothes: {
        text: 'Fashion is fun! Wear what makes you happy. Goodbye!',
        translation: 'Moda é divertido! Use o que te faz feliz. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'classroom',
    topic: 'In the Classroom',
    topicPt: 'Na sala de aula',
    icon: '📚',
    level: 1,
    start: 'good_morning_class',
    nodes: {
      good_morning_class: {
        text: 'Good morning, class! Are you ready to learn?',
        translation: 'Bom dia, turma! Vocês estão prontos para aprender?',
        replies: [
          { text: 'Yes, teacher! I am ready.', translation: 'Sim, professor(a)! Estou pronto(a).', next: 'sit_down', accepts: ["Yes, I'm ready"] },
          { text: 'Good morning! I have a question.', translation: 'Bom dia! Tenho uma pergunta.', next: 'ask_question', accepts: ['I have a question'] },
        ],
      },
      ask_question: {
        text: 'Of course! What is your question?',
        translation: 'Claro! Qual é a sua pergunta?',
        replies: [
          { text: 'Can you repeat that, please?', translation: 'Pode repetir isso, por favor?', next: 'sit_down', accepts: ['Please repeat'] },
          { text: 'Can you speak more slowly?', translation: 'Pode falar mais devagar?', next: 'sit_down', accepts: ['Speak slowly please'] },
          { text: 'What does this word mean?', translation: 'O que essa palavra significa?', next: 'sit_down', accepts: ['What does it mean?'] },
        ],
      },
      sit_down: {
        text: 'Please sit down. Open your books to page ten.',
        translation: 'Por favor, sentem-se. Abram os livros na página dez.',
        replies: [
          { text: 'Okay, I am opening my book.', translation: 'Ok, estou abrindo meu livro.', next: 'classroom_objects', accepts: ['I opened my book'] },
          { text: 'I forgot my book at home.', translation: 'Esqueci meu livro em casa.', next: 'forgot_book', accepts: ['I forgot my book'] },
        ],
      },
      forgot_book: {
        text: 'That is okay. You can share with your classmate.',
        translation: 'Tudo bem. Você pode compartilhar com seu colega.',
        replies: [
          { text: 'Thank you, teacher.', translation: 'Obrigado(a), professor(a).', next: 'classroom_objects', accepts: ['Thank you'] },
        ],
      },
      classroom_objects: {
        text: 'What objects do you have on your desk?',
        translation: 'Que objetos você tem sobre sua mesa?',
        replies: [
          { text: 'I have a pen, a pencil, and a ruler.', translation: 'Tenho uma caneta, um lápis e uma régua.', next: 'end_class', accepts: ['Pen, pencil, ruler'] },
          { text: 'I have my notebook and an eraser.', translation: 'Tenho meu caderno e uma borracha.', next: 'end_class', accepts: ['Notebook and eraser'] },
        ],
      },
      end_class: {
        text: "Excellent! Class is over. See you tomorrow. Don't forget your homework!",
        translation: 'Excelente! A aula acabou. Até amanhã. Não esqueçam o dever de casa!',
        replies: [],
      },
    },
  },

  // ─── LEVEL 2 — novas conversas (+5) ─────────────────────────────────────────,

  {
    id: 'breakfast',
    topic: 'Breakfast',
    topicPt: 'Café da manhã',
    icon: '🍳',
    level: 2,
    start: 'morning',
    nodes: {
      morning: {
        text: 'Good morning! Did you have breakfast today?',
        translation: 'Bom dia! Você tomou café da manhã hoje?',
        replies: [
          { text: 'Yes, I ate bread and coffee.', translation: 'Sim, eu comi pão e café.', next: 'usually_eat', accepts: ['Yes, I had bread and coffee'] },
          { text: "No, I'm very hungry.", translation: 'Não, estou com muita fome.', next: 'why_not', accepts: ["No, I'm hungry", "I didn't eat"] },
          { text: "I'm eating right now.", translation: 'Estou comendo agora mesmo.', next: 'usually_eat', accepts: ["I'm eating now"] },
        ],
      },
      why_not: {
        text: "You should eat something! Why didn't you eat?",
        translation: 'Você devia comer alguma coisa! Por que não comeu?',
        replies: [
          { text: 'I woke up late.', translation: 'Eu acordei tarde.', next: 'offer_food', accepts: ['I got up late'] },
          { text: "I don't like eating in the morning.", translation: 'Eu não gosto de comer de manhã.', next: 'offer_food', accepts: ["I don't eat in the morning"] },
        ],
      },
      offer_food: {
        text: 'I have some fruit here. Would you like an apple?',
        translation: 'Eu tenho umas frutas aqui. Você quer uma maçã?',
        replies: [
          { text: 'Yes, please. Thank you!', translation: 'Sim, por favor. Obrigado(a)!', next: 'end_enjoy', accepts: ['Yes please', "I'd love one"] },
          { text: 'No, thank you. I will eat later.', translation: 'Não, obrigado(a). Vou comer mais tarde.', next: 'end_later', accepts: ['No thanks, later'] },
        ],
      },
      usually_eat: {
        text: 'What do you usually eat for breakfast?',
        translation: 'O que você geralmente come no café da manhã?',
        replies: [
          { text: 'I eat bread with butter.', translation: 'Eu como pão com manteiga.', next: 'drink_what', accepts: ['Bread with butter'] },
          { text: 'I eat eggs and fruit.', translation: 'Eu como ovos e frutas.', next: 'drink_what', accepts: ['Eggs and fruit'] },
          { text: 'It depends on the day.', translation: 'Depende do dia.', next: 'drink_what', accepts: ['It depends'] },
        ],
      },
      drink_what: {
        text: 'And what do you drink in the morning?',
        translation: 'E o que você bebe de manhã?',
        replies: [
          { text: 'I drink coffee every day.', translation: 'Eu bebo café todo dia.', next: 'who_cooks', accepts: ['Coffee', 'I drink coffee'] },
          { text: 'I prefer orange juice.', translation: 'Eu prefiro suco de laranja.', next: 'who_cooks', accepts: ['Orange juice', 'I drink juice'] },
          { text: 'Just water.', translation: 'Só água.', next: 'who_cooks', accepts: ['I drink water', 'Water'] },
        ],
      },
      who_cooks: {
        text: 'That sounds good! Do you cook your own breakfast?',
        translation: 'Parece bom! Você faz seu próprio café da manhã?',
        replies: [
          { text: 'Yes, I cook every morning.', translation: 'Sim, eu cozinho toda manhã.', next: 'end_enjoy', accepts: ['Yes, I cook'] },
          { text: 'No, my mother cooks for me.', translation: 'Não, minha mãe cozinha para mim.', next: 'end_lucky', accepts: ['My mother cooks'] },
          { text: 'Sometimes I cook, sometimes I buy it.', translation: 'Às vezes eu cozinho, às vezes eu compro.', next: 'end_enjoy', accepts: ['Sometimes I cook'] },
        ],
      },
      end_enjoy: {
        text: 'Enjoy your meal! Have a great morning.',
        translation: 'Bom apetite! Tenha uma ótima manhã.',
        replies: [],
      },
      end_lucky: {
        text: "You're lucky! Say thank you to her for me. See you!",
        translation: 'Você tem sorte! Agradeça a ela por mim. Até mais!',
        replies: [],
      },
      end_later: {
        text: "Alright, don't forget to eat. See you later!",
        translation: 'Certo, não esqueça de comer. Até mais tarde!',
        replies: [],
      },
    },
  },

  {
    id: 'school',
    topic: 'School',
    topicPt: 'Escola',
    icon: '🏫',
    level: 2,
    start: 'go_school',
    nodes: {
      go_school: {
        text: 'Do you go to school?',
        translation: 'Você vai à escola?',
        replies: [
          { text: 'Yes, I go to school every day.', translation: 'Sim, eu vou à escola todo dia.', next: 'favorite_subject', accepts: ['Yes, every day'] },
          { text: "Yes, I'm a student.", translation: 'Sim, eu sou estudante.', next: 'favorite_subject', accepts: ["I'm a student"] },
          { text: 'No, I work now.', translation: 'Não, eu trabalho agora.', next: 'miss_school', accepts: ['No, I work'] },
        ],
      },
      miss_school: {
        text: 'I see. Do you miss studying?',
        translation: 'Entendi. Você sente falta de estudar?',
        replies: [
          { text: 'Yes, I miss my friends.', translation: 'Sim, eu sinto falta dos meus amigos.', next: 'study_again', accepts: ['I miss my friends'] },
          { text: 'No, I prefer working.', translation: 'Não, eu prefiro trabalhar.', next: 'end_good_luck', accepts: ['I prefer to work'] },
        ],
      },
      study_again: {
        text: 'Would you like to study again one day?',
        translation: 'Você gostaria de estudar de novo um dia?',
        replies: [
          { text: 'Yes, I want to study English.', translation: 'Sim, eu quero estudar inglês.', next: 'end_good_luck', accepts: ['I want to study English'] },
          { text: 'Maybe in the future.', translation: 'Talvez no futuro.', next: 'end_good_luck', accepts: ['Maybe someday'] },
        ],
      },
      favorite_subject: {
        text: 'What is your favorite subject?',
        translation: 'Qual é a sua matéria favorita?',
        replies: [
          { text: 'I like English the most.', translation: 'Eu gosto mais de inglês.', next: 'why_english', accepts: ['I like English', 'English'] },
          { text: 'My favorite is math.', translation: 'Minha favorita é matemática.', next: 'hard_subject', accepts: ['Math', 'I like math'] },
          { text: 'I like science.', translation: 'Eu gosto de ciências.', next: 'hard_subject', accepts: ['Science'] },
        ],
      },
      why_english: {
        text: 'Nice! Why do you like English?',
        translation: 'Legal! Por que você gosta de inglês?',
        replies: [
          { text: 'Because I want to travel.', translation: 'Porque eu quero viajar.', next: 'teacher_nice', accepts: ['I want to travel'] },
          { text: 'Because I like music in English.', translation: 'Porque eu gosto de música em inglês.', next: 'teacher_nice', accepts: ['I like English music'] },
        ],
      },
      hard_subject: {
        text: 'And which subject is difficult for you?',
        translation: 'E qual matéria é difícil para você?',
        replies: [
          { text: 'History is difficult for me.', translation: 'História é difícil para mim.', next: 'teacher_nice', accepts: ['History is hard'] },
          { text: 'Nothing is really difficult.', translation: 'Nada é muito difícil.', next: 'teacher_nice', accepts: ['Nothing is hard'] },
        ],
      },
      teacher_nice: {
        text: 'Do you like your teacher?',
        translation: 'Você gosta do(a) seu(sua) professor(a)?',
        replies: [
          { text: 'Yes, my teacher is very nice.', translation: 'Sim, meu(minha) professor(a) é muito legal.', next: 'end_study_well', accepts: ['My teacher is nice'] },
          { text: 'Yes, I like all my teachers.', translation: 'Sim, eu gosto de todos os meus professores.', next: 'end_study_well', accepts: ['I like my teachers'] },
        ],
      },
      end_study_well: {
        text: 'Keep studying hard. Good luck at school!',
        translation: 'Continue estudando bastante. Boa sorte na escola!',
        replies: [],
      },
      end_good_luck: {
        text: 'Good luck with everything. It was nice talking to you!',
        translation: 'Boa sorte com tudo. Foi bom conversar com você!',
        replies: [],
      },
    },
  },

  {
    id: 'family',
    topic: 'Family',
    topicPt: 'Família',
    icon: '👨‍👩‍👧‍👦',
    level: 2,
    start: 'siblings',
    nodes: {
      siblings: {
        text: 'Tell me about your family. Do you have brothers or sisters?',
        translation: 'Me conte sobre sua família. Você tem irmãos ou irmãs?',
        replies: [
          { text: 'I have one brother and one sister.', translation: 'Eu tenho um irmão e uma irmã.', next: 'older_younger', accepts: ['One brother and one sister'] },
          { text: 'I have two brothers.', translation: 'Eu tenho dois irmãos.', next: 'older_younger', accepts: ['Two brothers'] },
          { text: "No, I'm an only child.", translation: 'Não, sou filho(a) único(a).', next: 'only_child', accepts: ["I'm an only child"] },
        ],
      },
      only_child: {
        text: 'Do you like being an only child?',
        translation: 'Você gosta de ser filho(a) único(a)?',
        replies: [
          { text: 'Yes, I have my own room!', translation: 'Sim, eu tenho meu próprio quarto!', next: 'how_many', accepts: ['Yes, I like it'] },
          { text: 'Sometimes I feel lonely.', translation: 'Às vezes eu me sinto sozinho(a).', next: 'how_many', accepts: ['I feel lonely sometimes'] },
        ],
      },
      older_younger: {
        text: 'Are they older or younger than you?',
        translation: 'Eles são mais velhos ou mais novos que você?',
        replies: [
          { text: 'My brother is older than me.', translation: 'Meu irmão é mais velho que eu.', next: 'how_many', accepts: ['He is older'] },
          { text: 'They are both younger.', translation: 'Os dois são mais novos.', next: 'how_many', accepts: ['They are younger'] },
        ],
      },
      how_many: {
        text: 'How many people are there in your family?',
        translation: 'Quantas pessoas há na sua família?',
        replies: [
          { text: 'There are four people in my family.', translation: 'Há quatro pessoas na minha família.', next: 'live_with', accepts: ['Four people', 'We are four'] },
          { text: 'My family is very big.', translation: 'Minha família é muito grande.', next: 'live_with', accepts: ['We have a big family'] },
          { text: 'My family is small.', translation: 'Minha família é pequena.', next: 'live_with', accepts: ['We are a small family'] },
        ],
      },
      live_with: {
        text: 'Do you live with your family?',
        translation: 'Você mora com sua família?',
        replies: [
          { text: 'Yes, I live with my parents.', translation: 'Sim, eu moro com meus pais.', next: 'weekend_together', accepts: ['I live with my parents'] },
          { text: 'I live with my grandmother.', translation: 'Eu moro com minha avó.', next: 'weekend_together', accepts: ['With my grandmother'] },
          { text: 'No, I live alone now.', translation: 'Não, eu moro sozinho(a) agora.', next: 'visit_them', accepts: ['I live alone'] },
        ],
      },
      visit_them: {
        text: 'Do you visit them often?',
        translation: 'Você os visita com frequência?',
        replies: [
          { text: 'Yes, every weekend.', translation: 'Sim, todo fim de semana.', next: 'end_family', accepts: ['Every weekend'] },
          { text: 'Not very often, they live far away.', translation: 'Não muito, eles moram longe.', next: 'end_family', accepts: ['They live far away'] },
        ],
      },
      weekend_together: {
        text: 'That is nice. What do you do together on weekends?',
        translation: 'Que bom. O que vocês fazem juntos nos fins de semana?',
        replies: [
          { text: 'We have lunch together.', translation: 'Nós almoçamos juntos.', next: 'end_family', accepts: ['We eat lunch together'] },
          { text: 'We watch movies at home.', translation: 'Nós assistimos filmes em casa.', next: 'end_family', accepts: ['We watch movies'] },
          { text: 'We go to the park.', translation: 'Nós vamos ao parque.', next: 'end_family', accepts: ['We go to the park together'] },
        ],
      },
      end_family: {
        text: 'Family is important. Thank you for sharing! Goodbye!',
        translation: 'Família é importante. Obrigado por compartilhar! Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'animals',
    topic: 'Talking About Animals',
    topicPt: 'Falando sobre animais',
    icon: '🐾',
    level: 2,
    start: 'have_pets',
    nodes: {
      have_pets: {
        text: 'Do you have any pets?',
        translation: 'Você tem algum animal de estimação?',
        replies: [
          { text: 'Yes, I have a dog.', translation: 'Sim, eu tenho um cachorro.', next: 'pet_name', accepts: ['I have a dog'] },
          { text: 'I have two cats.', translation: 'Eu tenho dois gatos.', next: 'pet_name', accepts: ['Two cats'] },
          { text: 'No, but I want one.', translation: 'Não, mas eu quero um.', next: 'which_pet', accepts: ['No, but I want a pet'] },
        ],
      },
      which_pet: {
        text: 'Which animal would you like to have?',
        translation: 'Qual animal você gostaria de ter?',
        replies: [
          { text: 'I would like a small dog.', translation: 'Eu gostaria de um cachorro pequeno.', next: 'why_no_pet', accepts: ['A small dog', 'I want a dog'] },
          { text: 'I would like a cat.', translation: 'Eu gostaria de um gato.', next: 'why_no_pet', accepts: ['A cat', 'I want a cat'] },
        ],
      },
      why_no_pet: {
        text: 'Why don\'t you have one yet?',
        translation: 'Por que você ainda não tem um?',
        replies: [
          { text: 'My apartment is too small.', translation: 'Meu apartamento é pequeno demais.', next: 'favorite_animal', accepts: ['My house is small'] },
          { text: 'I work a lot and have no time.', translation: 'Eu trabalho muito e não tenho tempo.', next: 'favorite_animal', accepts: ['I have no time'] },
        ],
      },
      pet_name: {
        text: "That's lovely! What is your pet's name?",
        translation: 'Que amor! Qual é o nome do seu bichinho?',
        replies: [
          { text: 'His name is Rex.', translation: 'O nome dele é Rex.', next: 'pet_age', accepts: ['He is called Rex'] },
          { text: 'Her name is Luna.', translation: 'O nome dela é Luna.', next: 'pet_age', accepts: ['She is called Luna'] },
        ],
      },
      pet_age: {
        text: 'How old is your pet?',
        translation: 'Quantos anos tem seu bichinho?',
        replies: [
          { text: 'He is three years old.', translation: 'Ele tem três anos.', next: 'take_walks', accepts: ['Three years old'] },
          { text: 'She is still a baby.', translation: 'Ela ainda é um bebê.', next: 'take_walks', accepts: ['She is very young'] },
        ],
      },
      take_walks: {
        text: 'Do you take your pet for walks?',
        translation: 'Você leva seu bichinho para passear?',
        replies: [
          { text: 'Yes, every morning.', translation: 'Sim, toda manhã.', next: 'favorite_animal', accepts: ['Every morning'] },
          { text: 'No, cats stay at home.', translation: 'Não, gatos ficam em casa.', next: 'favorite_animal', accepts: ['Cats stay home'] },
        ],
      },
      favorite_animal: {
        text: 'One last question: what is your favorite animal?',
        translation: 'Última pergunta: qual é seu animal favorito?',
        replies: [
          { text: 'I love dogs.', translation: 'Eu amo cachorros.', next: 'end_animals', accepts: ['Dogs'] },
          { text: 'My favorite animal is the dolphin.', translation: 'Meu animal favorito é o golfinho.', next: 'end_animals', accepts: ['Dolphins'] },
          { text: 'I like birds.', translation: 'Eu gosto de pássaros.', next: 'end_animals', accepts: ['Birds'] },
        ],
      },
      end_animals: {
        text: 'Animals make life better! Thanks for talking with me. Bye!',
        translation: 'Animais deixam a vida melhor! Obrigado por conversar comigo. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'asking_help',
    topic: 'Asking for Help',
    topicPt: 'Pedindo ajuda',
    icon: '🆘',
    level: 2,
    start: 'need_help',
    nodes: {
      need_help: {
        text: 'You look confused. Do you need help?',
        translation: 'Você parece confuso(a). Precisa de ajuda?',
        replies: [
          { text: 'Yes, please. I need help.', translation: 'Sim, por favor. Eu preciso de ajuda.', next: 'what_need', accepts: ['Yes, I need help'] },
          { text: "I'm lost. Can you help me?", translation: 'Estou perdido(a). Você pode me ajudar?', next: 'where_going', accepts: ['Can you help me?'] },
          { text: "No, thank you. I'm fine.", translation: 'Não, obrigado(a). Estou bem.', next: 'end_no_help', accepts: ['No thanks'] },
        ],
      },
      what_need: {
        text: 'Of course! What do you need?',
        translation: 'Claro! Do que você precisa?',
        replies: [
          { text: "I don't speak English very well.", translation: 'Eu não falo inglês muito bem.', next: 'speak_slowly', accepts: ['My English is not good'] },
          { text: "I can't find the bus stop.", translation: 'Não consigo achar a parada de ônibus.', next: 'where_going', accepts: ['I need the bus stop'] },
        ],
      },
      speak_slowly: {
        text: 'No problem. I will speak slowly. Is that better?',
        translation: 'Sem problema. Vou falar devagar. Assim está melhor?',
        replies: [
          { text: 'Yes, much better. Thank you!', translation: 'Sim, muito melhor. Obrigado(a)!', next: 'anything_else', accepts: ['Yes, thank you'] },
          { text: 'Can you repeat, please?', translation: 'Pode repetir, por favor?', next: 'anything_else', accepts: ['Please repeat'] },
        ],
      },
      where_going: {
        text: 'Where are you trying to go?',
        translation: 'Para onde você está tentando ir?',
        replies: [
          { text: 'I want to go to the train station.', translation: 'Eu quero ir para a estação de trem.', next: 'show_way', accepts: ['To the train station'] },
          { text: "I'm looking for my hotel.", translation: 'Estou procurando meu hotel.', next: 'show_way', accepts: ['I need my hotel'] },
        ],
      },
      show_way: {
        text: 'I can show you the way. Do you want to walk or take a taxi?',
        translation: 'Eu posso te mostrar o caminho. Você quer ir a pé ou de táxi?',
        replies: [
          { text: 'I prefer to walk.', translation: 'Eu prefiro ir a pé.', next: 'anything_else', accepts: ['I want to walk'] },
          { text: 'A taxi, please. I am in a hurry.', translation: 'Um táxi, por favor. Estou com pressa.', next: 'anything_else', accepts: ['A taxi please'] },
        ],
      },
      anything_else: {
        text: 'Do you need anything else?',
        translation: 'Você precisa de mais alguma coisa?',
        replies: [
          { text: 'No, you helped me a lot. Thank you!', translation: 'Não, você me ajudou muito. Obrigado(a)!', next: 'end_kind', accepts: ['No, thank you so much'] },
          { text: 'You are very kind.', translation: 'Você é muito gentil.', next: 'end_kind', accepts: ['Thank you, you are kind'] },
        ],
      },
      end_kind: {
        text: 'Happy to help! Have a safe trip. Goodbye!',
        translation: 'Feliz em ajudar! Boa viagem. Tchau!',
        replies: [],
      },
      end_no_help: {
        text: 'Alright! If you need anything, just ask. Take care!',
        translation: 'Tudo bem! Se precisar de algo, é só pedir. Se cuide!',
        replies: [],
      },
    },
  },

  {
    id: 'birthday',
    topic: 'Birthday Party',
    topicPt: 'Festa de aniversário',
    icon: '🎂',
    level: 2,
    start: 'happy_birthday',
    nodes: {
      happy_birthday: {
        text: 'Happy birthday! How old are you today?',
        translation: 'Feliz aniversário! Quantos anos você faz hoje?',
        replies: [
          { text: 'Thank you! I am turning eighteen.', translation: 'Obrigado(a)! Estou completando dezoito anos.', next: 'party_plans', accepts: ["I'm eighteen today"] },
          { text: 'Thank you! I am twenty-five today.', translation: 'Obrigado(a)! Tenho vinte e cinco hoje.', next: 'party_plans', accepts: ["I'm 25"] },
          { text: 'Thank you very much! I feel old!', translation: 'Muito obrigado(a)! Estou me sentindo velho(a)!', next: 'party_plans', accepts: ['I feel old!'] },
        ],
      },
      party_plans: {
        text: 'Are you having a party?',
        translation: 'Você vai fazer uma festa?',
        replies: [
          { text: 'Yes, I am having a party at home tonight.', translation: 'Sim, vou fazer uma festa em casa hoje à noite.', next: 'who_invited', accepts: ['Yes, a party at home'] },
          { text: 'No, just a small dinner with family.', translation: 'Não, só um jantarzinho com a família.', next: 'birthday_food', accepts: ['Small dinner'] },
        ],
      },
      who_invited: {
        text: 'Great! How many people did you invite?',
        translation: 'Que ótimo! Quantas pessoas você convidou?',
        replies: [
          { text: 'About twenty friends.', translation: 'Uns vinte amigos.', next: 'birthday_food', accepts: ['Twenty friends'] },
          { text: 'Only my best friends, about ten people.', translation: 'Só meus melhores amigos, umas dez pessoas.', next: 'birthday_food', accepts: ['Ten people', 'My best friends'] },
        ],
      },
      birthday_food: {
        text: 'What kind of cake did you get?',
        translation: 'Que tipo de bolo você vai ter?',
        replies: [
          { text: 'Chocolate cake with strawberries.', translation: 'Bolo de chocolate com morangos.', next: 'gift', accepts: ['Chocolate cake'] },
          { text: 'A vanilla and lemon cake.', translation: 'Bolo de baunilha com limão.', next: 'gift', accepts: ['Vanilla cake'] },
        ],
      },
      gift: {
        text: 'Did you get any special gifts?',
        translation: 'Você ganhou algum presente especial?',
        replies: [
          { text: 'Yes! I got a new phone!', translation: 'Sim! Ganhei um celular novo!', next: 'end_birthday', accepts: ['A new phone'] },
          { text: 'I got money and some clothes.', translation: 'Ganhei dinheiro e algumas roupas.', next: 'end_birthday', accepts: ['Money and clothes'] },
          { text: 'The best gift is being with my friends.', translation: 'O melhor presente é estar com meus amigos.', next: 'end_birthday', accepts: ['Being with friends'] },
        ],
      },
      end_birthday: {
        text: 'That sounds wonderful! Happy birthday again. Have a great celebration!',
        translation: 'Parece maravilhoso! Feliz aniversário de novo. Aproveite muito!',
        replies: [],
      },
    },
  },

  {
    id: 'supermarket',
    topic: 'At the Supermarket',
    topicPt: 'No supermercado',
    icon: '🛒',
    level: 2,
    start: 'welcome_super',
    nodes: {
      welcome_super: {
        text: 'Welcome! Are you looking for something specific today?',
        translation: 'Bem-vindo(a)! Você está procurando algo específico hoje?',
        replies: [
          { text: 'Yes, where is the bread section?', translation: 'Sim, onde fica a seção de pão?', next: 'bread_aisle', accepts: ['Where is the bread?'] },
          { text: 'I need to find some vegetables.', translation: 'Eu preciso encontrar alguns legumes.', next: 'veggie_aisle', accepts: ['I need vegetables'] },
          { text: 'No, I am just browsing today.', translation: 'Não, estou só dando uma olhada hoje.', next: 'have_list', accepts: ['Just browsing'] },
        ],
      },
      bread_aisle: {
        text: 'The bread is in aisle three, on the left side.',
        translation: 'O pão fica no corredor três, do lado esquerdo.',
        replies: [
          { text: 'Thank you! Do you also have whole wheat bread?', translation: 'Obrigado(a)! Vocês também têm pão integral?', next: 'have_list', accepts: ['Whole wheat bread?'] },
          { text: 'Great, I will find it. Thank you!', translation: 'Ótimo, vou encontrar. Obrigado(a)!', next: 'have_list', accepts: ['Thank you'] },
        ],
      },
      veggie_aisle: {
        text: 'The vegetables are in the fresh produce section, at the back of the store.',
        translation: 'Os legumes ficam na seção de hortifrúti, no fundo da loja.',
        replies: [
          { text: 'Perfect. Do you have organic tomatoes?', translation: 'Perfeito. Vocês têm tomates orgânicos?', next: 'have_list', accepts: ['Organic tomatoes?'] },
          { text: 'Thank you, I will go there now.', translation: 'Obrigado(a), vou lá agora.', next: 'have_list', accepts: ['Thank you'] },
        ],
      },
      have_list: {
        text: 'Do you have a shopping list today?',
        translation: 'Você tem uma lista de compras hoje?',
        replies: [
          { text: 'Yes, I have a list on my phone.', translation: 'Sim, tenho uma lista no celular.', next: 'compare_prices', accepts: ['Yes, on my phone'] },
          { text: 'No, I just buy what I need.', translation: 'Não, compro só o que preciso.', next: 'compare_prices', accepts: ['No list'] },
        ],
      },
      compare_prices: {
        text: 'We have a sale this week. Two for the price of one on juices!',
        translation: 'Temos promoção essa semana. Dois pelo preço de um nos sucos!',
        replies: [
          { text: 'That is a great deal! I will take two.', translation: 'Que promoção ótima! Vou levar dois.', next: 'checkout', accepts: ["I'll take two"] },
          { text: 'No, thank you. I do not drink juice.', translation: 'Não, obrigado(a). Eu não bebo suco.', next: 'checkout', accepts: ["I don't drink juice"] },
        ],
      },
      checkout: {
        text: 'Are you ready to pay? Our express line is open.',
        translation: 'Está pronto(a) para pagar? Nossa fila expressa está aberta.',
        replies: [
          { text: 'Yes, I only have five items.', translation: 'Sim, tenho só cinco itens.', next: 'end_supermarket', accepts: ['Yes, five items'] },
          { text: 'I need a few more things. Thank you!', translation: 'Preciso de mais algumas coisas. Obrigado(a)!', next: 'end_supermarket', accepts: ['A few more things'] },
        ],
      },
      end_supermarket: {
        text: 'Enjoy your shopping! Have a great day.',
        translation: 'Aproveite suas compras! Tenha um ótimo dia.',
        replies: [],
      },
    },
  },

  {
    id: 'weekend_plans',
    topic: 'Weekend Plans',
    topicPt: 'Planos para o fim de semana',
    icon: '📅',
    level: 2,
    start: 'what_plans',
    nodes: {
      what_plans: {
        text: 'Hey! Do you have any plans for this weekend?',
        translation: 'Ei! Você tem algum plano para esse fim de semana?',
        replies: [
          { text: 'Yes! I am going to visit my grandparents.', translation: 'Sim! Vou visitar meus avós.', next: 'grandparents_where', accepts: ['Visiting my grandparents'] },
          { text: 'I want to go to the cinema.', translation: 'Quero ir ao cinema.', next: 'what_movie', accepts: ['Going to the cinema'] },
          { text: 'Nothing special, just resting.', translation: 'Nada especial, só descansando.', next: 'rest_why', accepts: ['Just resting'] },
        ],
      },
      rest_why: {
        text: 'Sometimes resting is the best plan. What do you do when you rest?',
        translation: 'Às vezes descansar é o melhor plano. O que você faz quando descansa?',
        replies: [
          { text: 'I watch series on TV.', translation: 'Assisto séries na TV.', next: 'together_alone', accepts: ['Watch series'] },
          { text: 'I sleep a lot and eat well.', translation: 'Durmo muito e como bem.', next: 'together_alone', accepts: ['Sleep and eat'] },
        ],
      },
      grandparents_where: {
        text: 'That is lovely! Do they live far from you?',
        translation: 'Que bonito! Eles moram longe de você?',
        replies: [
          { text: 'Not so far, about one hour by car.', translation: 'Não muito longe, umas uma hora de carro.', next: 'together_alone', accepts: ['One hour by car'] },
          { text: 'Yes, they live in another city.', translation: 'Sim, eles moram em outra cidade.', next: 'together_alone', accepts: ['Another city'] },
        ],
      },
      what_movie: {
        text: 'What kind of movie do you want to see?',
        translation: 'Que tipo de filme você quer ver?',
        replies: [
          { text: 'I want to see an action film.', translation: 'Quero ver um filme de ação.', next: 'together_alone', accepts: ['Action film'] },
          { text: 'I prefer a comedy or romance.', translation: 'Prefiro comédia ou romance.', next: 'together_alone', accepts: ['Comedy or romance'] },
        ],
      },
      together_alone: {
        text: 'Are you going alone or with someone?',
        translation: 'Você vai sozinho(a) ou com alguém?',
        replies: [
          { text: 'I am going with my best friend.', translation: 'Vou com meu(minha) melhor amigo(a).', next: 'sunday_plan', accepts: ['With my best friend'] },
          { text: 'With my family.', translation: 'Com minha família.', next: 'sunday_plan', accepts: ['With my family'] },
          { text: 'I prefer to go alone.', translation: 'Prefiro ir sozinho(a).', next: 'sunday_plan', accepts: ['Alone'] },
        ],
      },
      sunday_plan: {
        text: 'What about Sunday? Any plans?',
        translation: 'E no domingo? Algum plano?',
        replies: [
          { text: 'Sunday I stay home and prepare for the week.', translation: 'No domingo fico em casa e me preparo para a semana.', next: 'end_weekend', accepts: ['Prepare for the week'] },
          { text: 'Sunday lunch with the family is a tradition.', translation: 'Almoço de domingo com a família é tradição.', next: 'end_weekend', accepts: ['Family lunch on Sunday'] },
        ],
      },
      end_weekend: {
        text: 'Sounds like a great weekend! Enjoy every moment. Bye!',
        translation: 'Parece um ótimo fim de semana! Aproveite cada momento. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'sports_gym',
    topic: 'Sports & the Gym',
    topicPt: 'Esportes e academia',
    icon: '🏋️',
    level: 2,
    start: 'do_sports',
    nodes: {
      do_sports: {
        text: 'Do you play any sport or exercise regularly?',
        translation: 'Você pratica algum esporte ou se exercita regularmente?',
        replies: [
          { text: 'Yes, I go to the gym three times a week.', translation: 'Sim, vou à academia três vezes por semana.', next: 'gym_activities', accepts: ['I go to the gym'] },
          { text: 'I play football on weekends.', translation: 'Jogo futebol nos fins de semana.', next: 'play_position', accepts: ['Football on weekends'] },
          { text: 'No, I am not very active.', translation: 'Não, não sou muito ativo(a).', next: 'want_to_start', accepts: ["I'm not active"] },
        ],
      },
      want_to_start: {
        text: 'Would you like to start exercising? What would you try?',
        translation: 'Você gostaria de começar a se exercitar? O que você tentaria?',
        replies: [
          { text: 'Maybe I could try walking or running.', translation: 'Talvez eu pudesse tentar caminhar ou correr.', next: 'health_benefits', accepts: ['Walking or running'] },
          { text: 'I would like to try swimming.', translation: 'Eu gostaria de tentar natação.', next: 'health_benefits', accepts: ['Swimming'] },
        ],
      },
      gym_activities: {
        text: 'What do you do at the gym?',
        translation: 'O que você faz na academia?',
        replies: [
          { text: 'I lift weights and do cardio.', translation: 'Faço musculação e cardio.', next: 'health_benefits', accepts: ['Weights and cardio'] },
          { text: 'I use the treadmill and the bike.', translation: 'Uso a esteira e a bicicleta.', next: 'health_benefits', accepts: ['Treadmill and bike'] },
        ],
      },
      play_position: {
        text: 'That is great! What position do you play?',
        translation: 'Que ótimo! Qual posição você joga?',
        replies: [
          { text: 'I am a striker.', translation: 'Sou atacante.', next: 'health_benefits', accepts: ['Striker', 'Forward'] },
          { text: 'I play in defense.', translation: 'Jogo na defesa.', next: 'health_benefits', accepts: ['Defense', 'Defender'] },
          { text: 'I am the goalkeeper.', translation: 'Sou o goleiro.', next: 'health_benefits', accepts: ['Goalkeeper'] },
        ],
      },
      health_benefits: {
        text: 'Exercise is very good for our health. Do you feel different when you exercise?',
        translation: 'Exercício é muito bom para a nossa saúde. Você se sente diferente quando se exercita?',
        replies: [
          { text: 'Yes, I have more energy and sleep better.', translation: 'Sim, tenho mais energia e durmo melhor.', next: 'end_sports', accepts: ['More energy and sleep better'] },
          { text: 'Yes, I feel happier and less stressed.', translation: 'Sim, me sinto mais feliz e menos estressado(a).', next: 'end_sports', accepts: ['Happier and less stressed'] },
        ],
      },
      end_sports: {
        text: 'Keep it up! A healthy body is a happy body. Goodbye!',
        translation: 'Continue assim! Um corpo saudável é um corpo feliz. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'transportation',
    topic: 'Getting Around',
    topicPt: 'Locomovendo-se pela cidade',
    icon: '🚌',
    level: 2,
    start: 'need_ride',
    nodes: {
      need_ride: {
        text: 'Excuse me! How do I get to the city centre from here?',
        translation: 'Com licença! Como eu vou ao centro da cidade daqui?',
        replies: [
          { text: 'You can take bus number twelve.', translation: 'Você pode pegar o ônibus número doze.', next: 'bus_stop', accepts: ['Bus twelve', 'Bus number 12'] },
          { text: 'The subway is faster. Take line two.', translation: 'O metrô é mais rápido. Pegue a linha dois.', next: 'subway_info', accepts: ['The subway', 'Line two'] },
          { text: 'You could take a taxi or use an app.', translation: 'Você pode pegar um táxi ou usar um aplicativo.', next: 'how_much', accepts: ['Taxi or app'] },
        ],
      },
      bus_stop: {
        text: 'The bus stop is around the corner. How often does the bus come?',
        translation: 'A parada de ônibus fica na esquina. De quanto em quanto tempo o ônibus passa?',
        replies: [
          { text: 'Every fifteen minutes.', translation: 'A cada quinze minutos.', next: 'how_much', accepts: ['Every fifteen minutes'] },
          { text: 'I am not sure. Maybe every ten minutes.', translation: 'Não tenho certeza. Talvez a cada dez minutos.', next: 'how_much', accepts: ['Every ten minutes maybe'] },
        ],
      },
      subway_info: {
        text: 'Where is the nearest subway station?',
        translation: 'Onde fica a estação de metrô mais próxima?',
        replies: [
          { text: 'It is two blocks from here, on the right.', translation: 'Fica dois quarteirões daqui, à direita.', next: 'how_much', accepts: ['Two blocks right'] },
          { text: 'Follow this street for five minutes.', translation: 'Siga essa rua por cinco minutos.', next: 'how_much', accepts: ['Five minutes down this street'] },
        ],
      },
      how_much: {
        text: 'How much does a bus or subway ticket cost?',
        translation: 'Quanto custa um bilhete de ônibus ou metrô?',
        replies: [
          { text: 'It costs about two dollars.', translation: 'Custa uns dois dólares.', next: 'buy_ticket', accepts: ['Two dollars'] },
          { text: 'I think it is one fifty.', translation: 'Acho que é um e cinquenta.', next: 'buy_ticket', accepts: ['One fifty'] },
        ],
      },
      buy_ticket: {
        text: 'Where can I buy a ticket?',
        translation: 'Onde posso comprar um bilhete?',
        replies: [
          { text: 'You can buy it at the machine or on the app.', translation: 'Você pode comprar na máquina ou no aplicativo.', next: 'end_transport', accepts: ['Machine or app'] },
          { text: 'You pay directly on the bus with change.', translation: 'Você paga direto no ônibus com troco.', next: 'end_transport', accepts: ['Pay on the bus'] },
        ],
      },
      end_transport: {
        text: 'Perfect, thank you so much! I think I can find my way now.',
        translation: 'Perfeito, muito obrigado(a)! Acho que consigo encontrar o caminho agora.',
        replies: [],
      },
    },
  },

  // ─── LEVEL 4 — novas conversas (+9) ─────────────────────────────────────────,

  {
    id: 'restaurant',
    topic: 'At the Restaurant',
    topicPt: 'Restaurante',
    icon: '🍽️',
    level: 3,
    start: 'welcome',
    nodes: {
      welcome: {
        text: 'Welcome to our restaurant! A table for how many?',
        translation: 'Bem-vindo ao nosso restaurante! Mesa para quantos?',
        replies: [
          { text: 'A table for two, please.', translation: 'Mesa para dois, por favor.', next: 'menu', accepts: ['For two people please', 'Two, please'] },
          { text: 'Just for me, thank you.', translation: 'Só para mim, obrigado(a).', next: 'menu', accepts: ['Only me', 'A table for one'] },
          { text: 'Do you have a table outside?', translation: 'Vocês têm mesa lá fora?', next: 'outside', accepts: ['A table outside please'] },
        ],
      },
      outside: {
        text: 'Yes, we do! The garden is very nice today. Follow me.',
        translation: 'Sim, temos! O jardim está muito bonito hoje. Me acompanhe.',
        replies: [
          { text: 'Thank you, that sounds great.', translation: 'Obrigado(a), parece ótimo.', next: 'menu', accepts: ['Great, thank you'] },
        ],
      },
      menu: {
        text: 'Here is the menu. What would you like to order?',
        translation: 'Aqui está o cardápio. O que você gostaria de pedir?',
        replies: [
          { text: 'I would like a pizza, please.', translation: 'Eu gostaria de uma pizza, por favor.', next: 'drink', accepts: ['A pizza please', 'I want a pizza'] },
          { text: 'Can I have chicken with rice?', translation: 'Posso pedir frango com arroz?', next: 'drink', accepts: ['Chicken with rice please'] },
          { text: 'What do you recommend?', translation: 'O que você recomenda?', next: 'recommend', accepts: ['What is good here?'] },
        ],
      },
      recommend: {
        text: 'The fish is very fresh today, and our salad is famous.',
        translation: 'O peixe está muito fresco hoje, e nossa salada é famosa.',
        replies: [
          { text: "I'll take the fish, then.", translation: 'Vou querer o peixe, então.', next: 'drink', accepts: ['The fish please'] },
          { text: 'A salad sounds perfect.', translation: 'Uma salada parece perfeita.', next: 'drink', accepts: ['I want the salad'] },
        ],
      },
      drink: {
        text: 'Excellent choice. Would you like something to drink?',
        translation: 'Excelente escolha. Gostaria de algo para beber?',
        replies: [
          { text: 'A glass of water, please.', translation: 'Um copo de água, por favor.', next: 'serve_food', accepts: ['Water please'] },
          { text: 'I would like orange juice.', translation: 'Eu gostaria de suco de laranja.', next: 'serve_food', accepts: ['Orange juice please'] },
          { text: 'No, thank you.', translation: 'Não, obrigado(a).', next: 'serve_food', accepts: ['Nothing, thanks'] },
        ],
      },
      serve_food: {
        text: 'Here is your food. Enjoy your meal!',
        translation: 'Aqui está sua comida. Bom apetite!',
        replies: [
          { text: 'Thank you! It looks delicious.', translation: 'Obrigado(a)! Parece delicioso.', next: 'how_was_it', accepts: ['It looks great, thank you'] },
          { text: 'Excuse me, I did not order this.', translation: 'Com licença, eu não pedi isso.', next: 'wrong_order', accepts: ['This is not my order'] },
        ],
      },
      wrong_order: {
        text: "I'm so sorry! I will bring the correct dish right away.",
        translation: 'Sinto muito! Vou trazer o prato correto agora mesmo.',
        replies: [
          { text: 'No problem, thank you.', translation: 'Sem problema, obrigado(a).', next: 'how_was_it', accepts: ["It's okay, thanks"] },
        ],
      },
      how_was_it: {
        text: 'How was everything? Would you like the bill?',
        translation: 'Como estava tudo? Gostaria da conta?',
        replies: [
          { text: 'Everything was delicious. The bill, please.', translation: 'Estava tudo delicioso. A conta, por favor.', next: 'end_bill', accepts: ['The bill please'] },
          { text: 'Can I see the dessert menu?', translation: 'Posso ver o cardápio de sobremesas?', next: 'dessert', accepts: ['I want dessert'] },
        ],
      },
      dessert: {
        text: 'Of course! We have chocolate cake and ice cream.',
        translation: 'Claro! Temos bolo de chocolate e sorvete.',
        replies: [
          { text: 'Chocolate cake, please!', translation: 'Bolo de chocolate, por favor!', next: 'end_bill', accepts: ['The cake please'] },
          { text: 'Ice cream for me.', translation: 'Sorvete para mim.', next: 'end_bill', accepts: ['I want ice cream'] },
        ],
      },
      end_bill: {
        text: 'Here you are. Thank you for coming, and please visit us again!',
        translation: 'Aqui está. Obrigado por vir, e volte sempre!',
        replies: [],
      },
    },
  },

  {
    id: 'shopping',
    topic: 'Shopping',
    topicPt: 'Compras',
    icon: '🛍️',
    level: 3,
    start: 'can_help',
    nodes: {
      can_help: {
        text: 'Hello! Can I help you?',
        translation: 'Olá! Posso ajudar?',
        replies: [
          { text: "Yes, I'm looking for a shirt.", translation: 'Sim, estou procurando uma camisa.', next: 'what_color', accepts: ['I need a shirt'] },
          { text: 'I want to buy shoes.', translation: 'Eu quero comprar sapatos.', next: 'what_size', accepts: ['I need shoes'] },
          { text: "I'm just looking, thank you.", translation: 'Estou só olhando, obrigado(a).', next: 'end_looking', accepts: ['Just looking'] },
        ],
      },
      what_color: {
        text: 'We have many shirts. What color do you prefer?',
        translation: 'Temos muitas camisas. Que cor você prefere?',
        replies: [
          { text: 'I like blue.', translation: 'Eu gosto de azul.', next: 'try_on', accepts: ['Blue please'] },
          { text: 'Do you have it in black?', translation: 'Vocês têm em preto?', next: 'try_on', accepts: ['Black please'] },
          { text: 'Any color is fine.', translation: 'Qualquer cor está bom.', next: 'try_on', accepts: ['Any color'] },
        ],
      },
      what_size: {
        text: 'What size do you wear?',
        translation: 'Qual número você calça?',
        replies: [
          { text: 'I wear size forty.', translation: 'Eu calço quarenta.', next: 'try_on', accepts: ['Size 40'] },
          { text: "I'm not sure. Can you measure my foot?", translation: 'Não tenho certeza. Pode medir meu pé?', next: 'try_on', accepts: ["I don't know my size"] },
        ],
      },
      try_on: {
        text: 'Here you go. Would you like to try it on?',
        translation: 'Aqui está. Gostaria de experimentar?',
        replies: [
          { text: 'Yes, please. Where is the fitting room?', translation: 'Sim, por favor. Onde fica o provador?', next: 'fits_well', accepts: ['Where can I try it on?'] },
          { text: "No, I'll take it. How much is it?", translation: 'Não, vou levar. Quanto custa?', next: 'price', accepts: ['How much is it?'] },
        ],
      },
      fits_well: {
        text: 'How does it fit?',
        translation: 'Ficou bom?',
        replies: [
          { text: 'It fits perfectly!', translation: 'Ficou perfeito!', next: 'price', accepts: ["It's perfect"] },
          { text: 'It is too small. Do you have a bigger one?', translation: 'Está pequeno demais. Tem um maior?', next: 'bigger', accepts: ["It's too small"] },
        ],
      },
      bigger: {
        text: 'Yes, here is a bigger size. Try this one.',
        translation: 'Sim, aqui está um tamanho maior. Experimente este.',
        replies: [
          { text: 'This one is much better, thank you.', translation: 'Este ficou bem melhor, obrigado(a).', next: 'price', accepts: ['This is better'] },
        ],
      },
      price: {
        text: 'It costs thirty dollars. How would you like to pay?',
        translation: 'Custa trinta dólares. Como você gostaria de pagar?',
        replies: [
          { text: 'I will pay with my card.', translation: 'Vou pagar com meu cartão.', next: 'end_thanks', accepts: ['By card', 'With a card'] },
          { text: 'I will pay in cash.', translation: 'Vou pagar em dinheiro.', next: 'end_thanks', accepts: ['In cash', 'With cash'] },
          { text: "That's too expensive for me.", translation: 'Isso é caro demais para mim.', next: 'end_expensive', accepts: ["It's too expensive"] },
        ],
      },
      end_thanks: {
        text: 'Thank you for your purchase! Have a great day!',
        translation: 'Obrigado pela compra! Tenha um ótimo dia!',
        replies: [],
      },
      end_expensive: {
        text: 'I understand. We have a sale next week. Come back then!',
        translation: 'Eu entendo. Teremos promoção semana que vem. Volte lá!',
        replies: [],
      },
      end_looking: {
        text: 'No problem! Let me know if you need anything.',
        translation: 'Sem problema! Me avise se precisar de algo.',
        replies: [],
      },
    },
  },

  {
    id: 'asking_directions',
    topic: 'Asking for Directions',
    topicPt: 'Pedindo direções',
    icon: '🗺️',
    level: 3,
    start: 'excuse_me',
    nodes: {
      excuse_me: {
        text: 'Excuse me, do you need something?',
        translation: 'Com licença, você precisa de algo?',
        replies: [
          { text: 'Yes, where is the hospital?', translation: 'Sim, onde fica o hospital?', next: 'hospital_way', accepts: ['Where is the hospital?'] },
          { text: 'How do I get to the park?', translation: 'Como eu chego ao parque?', next: 'park_way', accepts: ['How can I get to the park?'] },
          { text: 'Is there a restaurant nearby?', translation: 'Tem um restaurante por perto?', next: 'restaurant_way', accepts: ['Is there a restaurant near here?'] },
        ],
      },
      hospital_way: {
        text: 'Go straight and turn left at the corner. It is a big white building.',
        translation: 'Vá em frente e vire à esquerda na esquina. É um prédio branco grande.',
        replies: [
          { text: 'Is it far from here?', translation: 'É longe daqui?', next: 'how_far', accepts: ['Is it far?'] },
          { text: 'Thank you very much!', translation: 'Muito obrigado(a)!', next: 'end_directions', accepts: ['Thanks a lot'] },
        ],
      },
      park_way: {
        text: 'Walk two blocks and turn right. You will see the gate.',
        translation: 'Ande dois quarteirões e vire à direita. Você verá o portão.',
        replies: [
          { text: 'Can you repeat, please?', translation: 'Pode repetir, por favor?', next: 'repeat', accepts: ['Please repeat'] },
          { text: 'Is it far from here?', translation: 'É longe daqui?', next: 'how_far', accepts: ['Is it far?'] },
        ],
      },
      restaurant_way: {
        text: 'Yes, there is a good one next to the bank, across the street.',
        translation: 'Sim, tem um bom ao lado do banco, do outro lado da rua.',
        replies: [
          { text: 'Thank you very much!', translation: 'Muito obrigado(a)!', next: 'end_directions', accepts: ['Thanks a lot'] },
          { text: 'Is it expensive?', translation: 'É caro?', next: 'is_expensive', accepts: ['Is it cheap?'] },
        ],
      },
      is_expensive: {
        text: 'No, it is cheap and the food is delicious.',
        translation: 'Não, é barato e a comida é deliciosa.',
        replies: [
          { text: 'Perfect, I will go there.', translation: 'Perfeito, vou lá.', next: 'end_directions', accepts: ['I will go there'] },
        ],
      },
      repeat: {
        text: 'Of course. Two blocks straight, then turn right.',
        translation: 'Claro. Dois quarteirões em frente, depois vire à direita.',
        replies: [
          { text: 'Now I understand. Thank you!', translation: 'Agora entendi. Obrigado(a)!', next: 'end_directions', accepts: ['I understand now'] },
        ],
      },
      how_far: {
        text: 'It is about ten minutes on foot.',
        translation: 'É mais ou menos dez minutos a pé.',
        replies: [
          { text: 'That is close. Thank you!', translation: 'Isso é perto. Obrigado(a)!', next: 'end_directions', accepts: ["That's close, thanks"] },
          { text: 'Can I take a bus?', translation: 'Posso pegar um ônibus?', next: 'take_bus', accepts: ['Is there a bus?'] },
        ],
      },
      take_bus: {
        text: 'Yes, bus number five stops right here.',
        translation: 'Sim, o ônibus número cinco para bem aqui.',
        replies: [
          { text: 'Great, thank you for your help!', translation: 'Ótimo, obrigado(a) pela ajuda!', next: 'end_directions', accepts: ['Thank you for helping me'] },
        ],
      },
      end_directions: {
        text: "You're welcome. Have a good day!",
        translation: 'De nada. Tenha um bom dia!',
        replies: [],
      },
    },
  },

  {
    id: 'telling_time',
    topic: 'Telling Time',
    topicPt: 'Perguntando as horas',
    icon: '🕐',
    level: 3,
    start: 'what_time',
    nodes: {
      what_time: {
        text: 'Excuse me, what time is it?',
        translation: 'Com licença, que horas são?',
        replies: [
          { text: "It's ten o'clock.", translation: 'São dez horas.', next: 'store_open', accepts: ["It is ten o'clock", "It's 10 o'clock"] },
          { text: "It's half past three.", translation: 'São três e meia.', next: 'store_open', accepts: ['It is half past three'] },
          { text: "Sorry, I don't have a watch.", translation: 'Desculpe, eu não tenho relógio.', next: 'no_watch', accepts: ["I don't have a watch"] },
        ],
      },
      no_watch: {
        text: 'No problem. Do you know if the store is open?',
        translation: 'Sem problema. Você sabe se a loja está aberta?',
        replies: [
          { text: 'I think it is open now.', translation: 'Acho que está aberta agora.', next: 'end_time', accepts: ['I think so'] },
          { text: "I don't know, sorry.", translation: 'Eu não sei, desculpe.', next: 'end_time', accepts: ["I don't know"] },
        ],
      },
      store_open: {
        text: 'Thank you! What time does the store open?',
        translation: 'Obrigado! A que horas a loja abre?',
        replies: [
          { text: 'It opens at nine in the morning.', translation: 'Abre às nove da manhã.', next: 'when_close', accepts: ['At nine in the morning'] },
          { text: 'I think it opens at eight.', translation: 'Eu acho que abre às oito.', next: 'when_close', accepts: ['Maybe at eight'] },
        ],
      },
      when_close: {
        text: 'And do you know what time it closes?',
        translation: 'E você sabe a que horas fecha?',
        replies: [
          { text: 'It closes at six in the evening.', translation: 'Fecha às seis da noite.', next: 'meet_later', accepts: ['At six in the evening'] },
          { text: "I'm not sure about that.", translation: 'Não tenho certeza sobre isso.', next: 'meet_later', accepts: ["I'm not sure"] },
        ],
      },
      meet_later: {
        text: 'Perfect. Can we meet later today?',
        translation: 'Perfeito. Podemos nos encontrar mais tarde hoje?',
        replies: [
          { text: 'Yes, at five in the afternoon.', translation: 'Sim, às cinco da tarde.', next: 'end_time', accepts: ['At five', 'Yes, at 5 pm'] },
          { text: 'Sorry, I am busy today.', translation: 'Desculpe, estou ocupado(a) hoje.', next: 'end_busy', accepts: ["I'm busy today"] },
        ],
      },
      end_time: {
        text: 'Great, see you then. Goodbye!',
        translation: 'Ótimo, até lá. Tchau!',
        replies: [],
      },
      end_busy: {
        text: 'No worries, maybe tomorrow. Take care!',
        translation: 'Sem problema, talvez amanhã. Se cuide!',
        replies: [],
      },
    },
  },

  {
    id: 'going_places',
    topic: 'Going Places',
    topicPt: 'Dizendo onde está indo',
    icon: '🚶',
    level: 3,
    start: 'where_going',
    nodes: {
      where_going: {
        text: 'Hey! Where are you going?',
        translation: 'Ei! Para onde você está indo?',
        replies: [
          { text: "I'm going to the store.", translation: 'Estou indo à loja.', next: 'buy_what', accepts: ['To the store'] },
          { text: "I'm going home.", translation: 'Estou indo para casa.', next: 'how_get', accepts: ['Home'] },
          { text: "I'm going to the park.", translation: 'Estou indo ao parque.', next: 'do_what_park', accepts: ['To the park'] },
        ],
      },
      buy_what: {
        text: 'What are you going to buy?',
        translation: 'O que você vai comprar?',
        replies: [
          { text: 'I need to buy some food.', translation: 'Eu preciso comprar comida.', next: 'how_get', accepts: ['Some food'] },
          { text: 'I want to buy a gift for my mother.', translation: 'Quero comprar um presente para minha mãe.', next: 'how_get', accepts: ['A gift'] },
        ],
      },
      do_what_park: {
        text: 'Nice! What are you going to do there?',
        translation: 'Legal! O que você vai fazer lá?',
        replies: [
          { text: 'I am going to run.', translation: 'Eu vou correr.', next: 'how_get', accepts: ['I will run'] },
          { text: 'I want to read a book outside.', translation: 'Quero ler um livro lá fora.', next: 'how_get', accepts: ['I will read'] },
        ],
      },
      how_get: {
        text: 'How are you getting there?',
        translation: 'Como você vai chegar lá?',
        replies: [
          { text: "I'm taking the bus.", translation: 'Estou pegando o ônibus.', next: 'come_with', accepts: ['By bus'] },
          { text: "I'm walking.", translation: 'Estou indo a pé.', next: 'come_with', accepts: ['On foot', 'I will walk'] },
          { text: "I'm going by car.", translation: 'Estou indo de carro.', next: 'come_with', accepts: ['By car'] },
        ],
      },
      come_with: {
        text: 'Can I come with you?',
        translation: 'Posso ir com você?',
        replies: [
          { text: "Of course! Let's go!", translation: 'Claro! Vamos lá!', next: 'end_together', accepts: ['Sure, come with me'] },
          { text: "Sorry, I'm in a hurry.", translation: 'Desculpe, estou com pressa.', next: 'end_hurry', accepts: ["I'm in a hurry"] },
        ],
      },
      end_together: {
        text: 'Awesome! I love going out with you. Let me get my jacket!',
        translation: 'Maravilha! Adoro sair com você. Deixa eu pegar minha jaqueta!',
        replies: [],
      },
      end_hurry: {
        text: 'No problem, maybe next time. See you later!',
        translation: 'Sem problema, talvez na próxima. Até mais!',
        replies: [],
      },
    },
  },

  {
    id: 'weather',
    topic: 'The Weather',
    topicPt: 'O tempo',
    icon: '🌦️',
    level: 3,
    start: 'nice_day',
    nodes: {
      nice_day: {
        text: 'What a day! How is the weather where you are?',
        translation: 'Que dia! Como está o tempo aí onde você está?',
        replies: [
          { text: 'It is sunny and hot today.', translation: 'Está ensolarado e quente hoje.', next: 'like_hot', accepts: ["It's hot", "It's sunny"] },
          { text: 'It is raining a lot.', translation: 'Está chovendo muito.', next: 'rain_plans', accepts: ["It's raining"] },
          { text: 'It is cold and cloudy.', translation: 'Está frio e nublado.', next: 'like_cold', accepts: ["It's cold"] },
        ],
      },
      like_hot: {
        text: 'Do you like hot weather?',
        translation: 'Você gosta de calor?',
        replies: [
          { text: 'Yes, I love the sun!', translation: 'Sim, eu amo o sol!', next: 'beach_plan', accepts: ['I love the sun'] },
          { text: 'No, it is too hot for me.', translation: 'Não, é quente demais para mim.', next: 'favorite_season', accepts: ["It's too hot"] },
        ],
      },
      like_cold: {
        text: 'Brrr! Do you have a coat?',
        translation: 'Brrr! Você tem um casaco?',
        replies: [
          { text: 'Yes, I am wearing a warm coat.', translation: 'Sim, estou usando um casaco quente.', next: 'favorite_season', accepts: ["I'm wearing a coat"] },
          { text: 'No, and I am freezing!', translation: 'Não, e estou congelando!', next: 'favorite_season', accepts: ["I'm freezing"] },
        ],
      },
      rain_plans: {
        text: 'Rainy days are good for staying home. What will you do?',
        translation: 'Dias de chuva são bons para ficar em casa. O que você vai fazer?',
        replies: [
          { text: 'I will watch a movie.', translation: 'Vou assistir um filme.', next: 'favorite_season', accepts: ['Watch a movie'] },
          { text: 'I still have to go to work.', translation: 'Eu ainda tenho que ir trabalhar.', next: 'take_umbrella', accepts: ['I have to work'] },
        ],
      },
      take_umbrella: {
        text: "Don't forget your umbrella! Do you have one?",
        translation: 'Não esqueça seu guarda-chuva! Você tem um?',
        replies: [
          { text: 'Yes, it is in my bag.', translation: 'Sim, está na minha bolsa.', next: 'favorite_season', accepts: ["It's in my bag"] },
          { text: 'No, I will get wet again.', translation: 'Não, vou me molhar de novo.', next: 'favorite_season', accepts: ['I will get wet'] },
        ],
      },
      beach_plan: {
        text: 'Perfect weather for the beach! Are you going?',
        translation: 'Tempo perfeito para a praia! Você vai?',
        replies: [
          { text: 'Yes, I am going this afternoon.', translation: 'Sim, vou hoje à tarde.', next: 'end_weather', accepts: ["I'm going this afternoon"] },
          { text: 'I wish I could, but I am working.', translation: 'Eu queria, mas estou trabalhando.', next: 'favorite_season', accepts: ["I'm working"] },
        ],
      },
      favorite_season: {
        text: 'Which season do you like the most?',
        translation: 'De qual estação você mais gosta?',
        replies: [
          { text: 'I like summer because of the beach.', translation: 'Gosto do verão por causa da praia.', next: 'end_weather', accepts: ['Summer'] },
          { text: 'Winter is my favorite season.', translation: 'Inverno é minha estação favorita.', next: 'end_weather', accepts: ['Winter'] },
          { text: 'I prefer spring, it is not too hot.', translation: 'Prefiro a primavera, não é quente demais.', next: 'end_weather', accepts: ['Spring'] },
        ],
      },
      end_weather: {
        text: 'Well, enjoy your day whatever the weather! Bye!',
        translation: 'Bom, aproveite seu dia faça o tempo que fizer! Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'hobbies',
    topic: 'Hobbies and Free Time',
    topicPt: 'Passatempos',
    icon: '⚽',
    level: 3,
    start: 'free_time',
    nodes: {
      free_time: {
        text: 'What do you like to do in your free time?',
        translation: 'O que você gosta de fazer no seu tempo livre?',
        replies: [
          { text: 'I like playing football.', translation: 'Eu gosto de jogar futebol.', next: 'sport_often', accepts: ['I play football', 'I like soccer'] },
          { text: 'I love listening to music.', translation: 'Eu adoro ouvir música.', next: 'music_kind', accepts: ['I listen to music'] },
          { text: 'I like reading books.', translation: 'Eu gosto de ler livros.', next: 'book_kind', accepts: ['I read books'] },
        ],
      },
      sport_often: {
        text: 'Nice! How often do you play?',
        translation: 'Legal! Com que frequência você joga?',
        replies: [
          { text: 'I play twice a week.', translation: 'Eu jogo duas vezes por semana.', next: 'with_friends', accepts: ['Twice a week'] },
          { text: 'Only on weekends.', translation: 'Só nos fins de semana.', next: 'with_friends', accepts: ['On weekends'] },
        ],
      },
      with_friends: {
        text: 'Do you play with friends or in a team?',
        translation: 'Você joga com amigos ou em um time?',
        replies: [
          { text: 'I play with my friends.', translation: 'Eu jogo com meus amigos.', next: 'other_hobby', accepts: ['With my friends'] },
          { text: 'I play in a small team.', translation: 'Eu jogo em um time pequeno.', next: 'other_hobby', accepts: ['In a team'] },
        ],
      },
      music_kind: {
        text: 'What kind of music do you like?',
        translation: 'Que tipo de música você gosta?',
        replies: [
          { text: 'I like rock music.', translation: 'Eu gosto de rock.', next: 'play_instrument', accepts: ['Rock'] },
          { text: 'I listen to Brazilian music.', translation: 'Eu ouço música brasileira.', next: 'play_instrument', accepts: ['Brazilian music'] },
          { text: 'I like songs in English, to practice.', translation: 'Gosto de músicas em inglês, para praticar.', next: 'play_instrument', accepts: ['Songs in English'] },
        ],
      },
      play_instrument: {
        text: 'Do you play any instrument?',
        translation: 'Você toca algum instrumento?',
        replies: [
          { text: 'Yes, I play the guitar.', translation: 'Sim, eu toco violão.', next: 'other_hobby', accepts: ['I play guitar'] },
          { text: 'No, but I would like to learn.', translation: 'Não, mas gostaria de aprender.', next: 'other_hobby', accepts: ['I want to learn'] },
        ],
      },
      book_kind: {
        text: 'What kind of books do you read?',
        translation: 'Que tipo de livros você lê?',
        replies: [
          { text: 'I read adventure stories.', translation: 'Eu leio histórias de aventura.', next: 'other_hobby', accepts: ['Adventure books'] },
          { text: 'I like books about history.', translation: 'Eu gosto de livros de história.', next: 'other_hobby', accepts: ['History books'] },
        ],
      },
      other_hobby: {
        text: 'Is there a hobby you want to try someday?',
        translation: 'Tem algum hobby que você quer experimentar um dia?',
        replies: [
          { text: 'I want to learn how to cook.', translation: 'Eu quero aprender a cozinhar.', next: 'end_hobbies', accepts: ['I want to cook'] },
          { text: 'I would like to travel more.', translation: 'Eu gostaria de viajar mais.', next: 'end_hobbies', accepts: ['I want to travel'] },
          { text: 'I want to speak English fluently.', translation: 'Eu quero falar inglês fluentemente.', next: 'end_english_goal', accepts: ['I want to speak English well'] },
        ],
      },
      end_english_goal: {
        text: 'You are doing it right now! Keep practicing. See you!',
        translation: 'Você está fazendo isso agora mesmo! Continue praticando. Até mais!',
        replies: [],
      },
      end_hobbies: {
        text: 'That sounds wonderful. Have fun! Goodbye!',
        translation: 'Isso parece maravilhoso. Divirta-se! Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'doctor',
    topic: 'At the Doctor',
    topicPt: 'No médico',
    icon: '🏥',
    level: 3,
    start: 'how_feel',
    nodes: {
      how_feel: {
        text: 'Good morning. How are you feeling today?',
        translation: 'Bom dia. Como você está se sentindo hoje?',
        replies: [
          { text: 'I have a headache.', translation: 'Estou com dor de cabeça.', next: 'since_when', accepts: ['My head hurts'] },
          { text: 'I have a sore throat and a fever.', translation: 'Estou com dor de garganta e febre.', next: 'since_when', accepts: ['My throat hurts'] },
          { text: 'My stomach hurts a lot.', translation: 'Meu estômago dói muito.', next: 'since_when', accepts: ['I have a stomach ache'] },
        ],
      },
      since_when: {
        text: 'I see. Since when do you feel like this?',
        translation: 'Entendi. Desde quando você se sente assim?',
        replies: [
          { text: 'Since yesterday morning.', translation: 'Desde ontem de manhã.', next: 'take_medicine', accepts: ['Since yesterday'] },
          { text: 'For about three days.', translation: 'Faz uns três dias.', next: 'take_medicine', accepts: ['Three days'] },
        ],
      },
      take_medicine: {
        text: 'Are you taking any medicine?',
        translation: 'Você está tomando algum remédio?',
        replies: [
          { text: 'No, I am not taking anything.', translation: 'Não, não estou tomando nada.', next: 'allergy', accepts: ["I'm not taking anything"] },
          { text: 'Yes, I took a pill this morning.', translation: 'Sim, tomei um comprimido hoje de manhã.', next: 'allergy', accepts: ['I took a pill'] },
        ],
      },
      allergy: {
        text: 'Do you have any allergies?',
        translation: 'Você tem alguma alergia?',
        replies: [
          { text: 'No, I do not have allergies.', translation: 'Não, eu não tenho alergias.', next: 'diagnosis', accepts: ['No allergies'] },
          { text: 'Yes, I am allergic to some medicines.', translation: 'Sim, sou alérgico(a) a alguns remédios.', next: 'diagnosis', accepts: ["I'm allergic to medicine"] },
        ],
      },
      diagnosis: {
        text: 'Alright. You need to rest and drink a lot of water. Do you understand?',
        translation: 'Certo. Você precisa descansar e beber muita água. Você entendeu?',
        replies: [
          { text: 'Yes, I understand. Thank you, doctor.', translation: 'Sim, entendi. Obrigado(a), doutor(a).', next: 'end_rest', accepts: ['I understand'] },
          { text: 'Can you repeat more slowly, please?', translation: 'Pode repetir mais devagar, por favor?', next: 'repeat_slow', accepts: ['Please repeat slowly'] },
          { text: 'Do I need to come back?', translation: 'Eu preciso voltar?', next: 'come_back', accepts: ['Should I come back?'] },
        ],
      },
      repeat_slow: {
        text: 'Of course. Rest at home, and drink water many times a day.',
        translation: 'Claro. Descanse em casa e beba água várias vezes ao dia.',
        replies: [
          { text: 'Now it is clear. Thank you!', translation: 'Agora ficou claro. Obrigado(a)!', next: 'end_rest', accepts: ['Now I understand'] },
        ],
      },
      come_back: {
        text: 'Only if you still feel bad in three days.',
        translation: 'Só se você ainda se sentir mal em três dias.',
        replies: [
          { text: 'Okay, thank you very much.', translation: 'Ok, muito obrigado(a).', next: 'end_rest', accepts: ['Okay, thanks'] },
        ],
      },
      end_rest: {
        text: 'Take care and get well soon. Goodbye!',
        translation: 'Se cuide e melhoras. Tchau!',
        replies: [],
      },
    },
  },

  {
    id: 'phone',
    topic: 'On the Phone',
    topicPt: 'Ao telefone',
    icon: '📞',
    level: 3,
    start: 'hello_phone',
    nodes: {
      hello_phone: {
        text: 'Hello? Good afternoon, this is Green Hotel. How can I help you?',
        translation: 'Alô? Boa tarde, aqui é o Green Hotel. Como posso ajudar?',
        replies: [
          { text: 'Hello, I would like to book a room.', translation: 'Olá, eu gostaria de reservar um quarto.', next: 'which_dates', accepts: ['I want to book a room'] },
          { text: 'Hi, can I speak to Mr. Smith?', translation: 'Oi, posso falar com o Sr. Smith?', next: 'not_available', accepts: ['I want to speak to Mr. Smith'] },
          { text: 'Sorry, I think I called the wrong number.', translation: 'Desculpe, acho que liguei para o número errado.', next: 'end_wrong_number', accepts: ['Wrong number, sorry'] },
        ],
      },
      not_available: {
        text: 'I am sorry, he is not available right now. Can I take a message?',
        translation: 'Sinto muito, ele não está disponível agora. Posso anotar um recado?',
        replies: [
          { text: 'Yes, please tell him I called.', translation: 'Sim, por favor diga a ele que eu liguei.', next: 'your_name', accepts: ['Tell him I called'] },
          { text: 'No, I will call again later.', translation: 'Não, eu ligo de novo mais tarde.', next: 'end_call_later', accepts: ['I will call later'] },
        ],
      },
      your_name: {
        text: 'Of course. What is your name, please?',
        translation: 'Claro. Qual é o seu nome, por favor?',
        replies: [
          { text: 'My name is Ana Silva.', translation: 'Meu nome é Ana Silva.', next: 'end_message', accepts: ["I'm Ana Silva"] },
          { text: 'This is Pedro from the school.', translation: 'Aqui é o Pedro, da escola.', next: 'end_message', accepts: ["It's Pedro"] },
        ],
      },
      which_dates: {
        text: 'Certainly. For which dates?',
        translation: 'Com certeza. Para quais datas?',
        replies: [
          { text: 'From Friday to Sunday.', translation: 'De sexta a domingo.', next: 'how_many_people', accepts: ['Friday to Sunday'] },
          { text: 'Next week, for three nights.', translation: 'Semana que vem, por três noites.', next: 'how_many_people', accepts: ['Three nights next week'] },
        ],
      },
      how_many_people: {
        text: 'And how many people will stay?',
        translation: 'E quantas pessoas vão ficar?',
        replies: [
          { text: 'Two people, please.', translation: 'Duas pessoas, por favor.', next: 'confirm_booking', accepts: ['For two people'] },
          { text: 'Just me.', translation: 'Só eu.', next: 'confirm_booking', accepts: ['Only me', 'One person'] },
        ],
      },
      confirm_booking: {
        text: 'Perfect. Can you repeat your phone number, please?',
        translation: 'Perfeito. Pode repetir seu telefone, por favor?',
        replies: [
          { text: 'Sure, it is nine one two three four.', translation: 'Claro, é nove um dois três quatro.', next: 'end_booked', accepts: ['It is 91234'] },
          { text: 'Can you speak more slowly? My English is not good.', translation: 'Pode falar mais devagar? Meu inglês não é bom.', next: 'speak_slow_phone', accepts: ['Please speak slowly'] },
        ],
      },
      speak_slow_phone: {
        text: 'No problem at all. Please. Repeat. Your. Phone. Number.',
        translation: 'Sem problema nenhum. Por favor. Repita. Seu. Telefone.',
        replies: [
          { text: 'Thank you. It is nine one two three four.', translation: 'Obrigado(a). É nove um dois três quatro.', next: 'end_booked', accepts: ['It is 91234'] },
        ],
      },
      end_booked: {
        text: 'Your room is booked. Thank you for calling. Goodbye!',
        translation: 'Seu quarto está reservado. Obrigado por ligar. Tchau!',
        replies: [],
      },
      end_message: {
        text: 'I will give him your message. Thank you for calling!',
        translation: 'Vou dar o recado a ele. Obrigado por ligar!',
        replies: [],
      },
      end_call_later: {
        text: 'Alright, he will be here after five. Goodbye!',
        translation: 'Certo, ele estará aqui depois das cinco. Tchau!',
        replies: [],
      },
      end_wrong_number: {
        text: 'No problem, it happens. Have a nice day!',
        translation: 'Sem problema, acontece. Tenha um bom dia!',
        replies: [],
      },
    },
  },

  {
    id: 'hotel',
    topic: 'At the Hotel',
    topicPt: 'No hotel',
    icon: '🏨',
    level: 3,
    start: 'check_in',
    nodes: {
      check_in: {
        text: 'Welcome! Do you have a reservation?',
        translation: 'Bem-vindo! Você tem reserva?',
        replies: [
          { text: 'Yes, I have a reservation.', translation: 'Sim, eu tenho uma reserva.', next: 'your_name_hotel', accepts: ['Yes, I booked a room'] },
          { text: 'No. Do you have a room available?', translation: 'Não. Vocês têm quarto disponível?', next: 'room_available', accepts: ['Do you have a free room?'] },
        ],
      },
      room_available: {
        text: 'Let me check. Yes, we have one room left. For how many nights?',
        translation: 'Deixe-me verificar. Sim, temos um quarto. Por quantas noites?',
        replies: [
          { text: 'For two nights, please.', translation: 'Por duas noites, por favor.', next: 'breakfast_included', accepts: ['Two nights'] },
          { text: 'Just one night.', translation: 'Só uma noite.', next: 'breakfast_included', accepts: ['One night'] },
        ],
      },
      your_name_hotel: {
        text: 'Great. What name is the reservation under?',
        translation: 'Ótimo. A reserva está em nome de quem?',
        replies: [
          { text: 'It is under Silva.', translation: 'Está no nome Silva.', next: 'breakfast_included', accepts: ['Silva', 'Under Silva'] },
          { text: 'My name is Carlos Souza.', translation: 'Meu nome é Carlos Souza.', next: 'breakfast_included', accepts: ["I'm Carlos Souza"] },
        ],
      },
      breakfast_included: {
        text: 'Found it! Breakfast is from seven to ten. Do you need anything else?',
        translation: 'Encontrei! O café da manhã é das sete às dez. Precisa de mais alguma coisa?',
        replies: [
          { text: 'Is there wifi in the room?', translation: 'Tem wi-fi no quarto?', next: 'wifi', accepts: ['Do you have wifi?'] },
          { text: 'What time do I have to leave?', translation: 'Que horas eu tenho que sair?', next: 'checkout_time', accepts: ['When is checkout?'] },
          { text: 'No, everything is fine. Thank you!', translation: 'Não, está tudo bem. Obrigado(a)!', next: 'end_enjoy_stay', accepts: ['No, thank you'] },
        ],
      },
      wifi: {
        text: 'Yes, the password is on the desk in your room.',
        translation: 'Sim, a senha está na mesa do seu quarto.',
        replies: [
          { text: 'Perfect, thank you very much.', translation: 'Perfeito, muito obrigado(a).', next: 'end_enjoy_stay', accepts: ['Thanks a lot'] },
          { text: 'What time do I have to leave?', translation: 'Que horas eu tenho que sair?', next: 'checkout_time', accepts: ['When is checkout?'] },
        ],
      },
      checkout_time: {
        text: 'Checkout is at eleven in the morning.',
        translation: 'A saída é às onze da manhã.',
        replies: [
          { text: 'Okay, I will remember that.', translation: 'Ok, vou lembrar disso.', next: 'end_enjoy_stay', accepts: ['I will remember'] },
          { text: 'Can I leave a little later?', translation: 'Posso sair um pouco mais tarde?', next: 'late_checkout', accepts: ['Can I leave later?'] },
        ],
      },
      late_checkout: {
        text: 'Yes, you can stay until one, but there is a small fee.',
        translation: 'Sim, você pode ficar até uma, mas há uma pequena taxa.',
        replies: [
          { text: 'That is fine, thank you.', translation: 'Tudo bem, obrigado(a).', next: 'end_enjoy_stay', accepts: ["That's okay"] },
          { text: 'Never mind, I will leave at eleven.', translation: 'Deixa pra lá, vou sair às onze.', next: 'end_enjoy_stay', accepts: ['I will leave at eleven'] },
        ],
      },
      end_enjoy_stay: {
        text: 'Here is your key. Enjoy your stay with us!',
        translation: 'Aqui está sua chave. Aproveite sua estadia conosco!',
        replies: [],
      },
    },
  },

  {
    id: 'job_interview',
    topic: 'Job Interview',
    topicPt: 'Entrevista de emprego',
    icon: '💼',
    level: 4,
    start: 'tell_about',
    nodes: {
      tell_about: {
        text: 'Thank you for coming. Please, tell me a little about yourself.',
        translation: 'Obrigado por vir. Por favor, me fale um pouco sobre você.',
        replies: [
          { text: 'My name is Ana and I am a designer.', translation: 'Meu nome é Ana e eu sou designer.', next: 'experience', accepts: ["I'm Ana, a designer"] },
          { text: 'I finished school last year and I want to learn.', translation: 'Terminei a escola ano passado e quero aprender.', next: 'first_job', accepts: ['I just finished school'] },
        ],
      },
      first_job: {
        text: 'So this would be your first job. Why do you want to work here?',
        translation: 'Então este seria seu primeiro emprego. Por que quer trabalhar aqui?',
        replies: [
          { text: 'Because I want to grow and learn a lot.', translation: 'Porque quero crescer e aprender muito.', next: 'strengths', accepts: ['I want to learn'] },
          { text: 'I like this company very much.', translation: 'Eu gosto muito desta empresa.', next: 'strengths', accepts: ['I like the company'] },
        ],
      },
      experience: {
        text: 'How many years of experience do you have?',
        translation: 'Quantos anos de experiência você tem?',
        replies: [
          { text: 'I have three years of experience.', translation: 'Eu tenho três anos de experiência.', next: 'strengths', accepts: ['Three years'] },
          { text: 'I have worked in two companies before.', translation: 'Eu trabalhei em duas empresas antes.', next: 'strengths', accepts: ['I worked in two companies'] },
        ],
      },
      strengths: {
        text: 'What would you say is your greatest strength?',
        translation: 'O que você diria que é seu maior ponto forte?',
        replies: [
          { text: 'I work very well in a team.', translation: 'Eu trabalho muito bem em equipe.', next: 'speak_english', accepts: ['I am good in a team'] },
          { text: 'I learn new things quickly.', translation: 'Eu aprendo coisas novas rapidamente.', next: 'speak_english', accepts: ['I learn fast'] },
          { text: 'I am organized and always on time.', translation: 'Sou organizado(a) e sempre pontual.', next: 'speak_english', accepts: ["I'm organized"] },
        ],
      },
      speak_english: {
        text: 'Do you speak English at work?',
        translation: 'Você fala inglês no trabalho?',
        replies: [
          { text: 'Yes, I use English every day.', translation: 'Sim, eu uso inglês todo dia.', next: 'questions_for_us', accepts: ['I use English daily'] },
          { text: 'I am still learning, but I practice a lot.', translation: 'Ainda estou aprendendo, mas pratico muito.', next: 'questions_for_us', accepts: ["I'm still learning"] },
        ],
      },
      questions_for_us: {
        text: 'Do you have any questions for us?',
        translation: 'Você tem alguma pergunta para nós?',
        replies: [
          { text: 'Yes. What are the working hours?', translation: 'Sim. Qual é o horário de trabalho?', next: 'hours_answer', accepts: ['What are the hours?'] },
          { text: 'Can I work from home sometimes?', translation: 'Posso trabalhar de casa às vezes?', next: 'remote_answer', accepts: ['Is remote work possible?'] },
          { text: 'No, you explained everything. Thank you.', translation: 'Não, você explicou tudo. Obrigado(a).', next: 'end_interview', accepts: ['No questions, thank you'] },
        ],
      },
      hours_answer: {
        text: 'From nine to six, with one hour for lunch.',
        translation: 'Das nove às seis, com uma hora de almoço.',
        replies: [
          { text: 'That works for me, thank you.', translation: 'Isso funciona para mim, obrigado(a).', next: 'end_interview', accepts: ["That's fine for me"] },
        ],
      },
      remote_answer: {
        text: 'Yes, two days a week you can work from home.',
        translation: 'Sim, dois dias por semana você pode trabalhar de casa.',
        replies: [
          { text: 'That is great news, thank you.', translation: 'Essa é uma ótima notícia, obrigado(a).', next: 'end_interview', accepts: ['Great, thank you'] },
        ],
      },
      end_interview: {
        text: 'Thank you for your time. We will call you next week. Goodbye!',
        translation: 'Obrigado pelo seu tempo. Vamos te ligar semana que vem. Tchau!',
        replies: [],
      },
    },
  },

  // ─── LEVEL 1 — novas conversas (+8) ─────────────────────────────────────────,

  {
    id: 'renting_apartment',
    topic: 'Renting an Apartment',
    topicPt: 'Alugando um apartamento',
    icon: '🏠',
    level: 4,
    start: 'ad_seen',
    nodes: {
      ad_seen: {
        text: 'Hello! I am calling about the apartment for rent. Is it still available?',
        translation: 'Olá! Estou ligando sobre o apartamento para alugar. Ainda está disponível?',
        replies: [
          { text: 'Yes, the apartment is still available.', translation: 'Sim, o apartamento ainda está disponível.', next: 'visit_arrange', accepts: ['Yes, still available'] },
          { text: 'I am sorry, it was rented yesterday.', translation: 'Lamento, ele foi alugado ontem.', next: 'other_options', accepts: ['It was rented'] },
        ],
      },
      other_options: {
        text: 'We have other units available. Would you like to see them?',
        translation: 'Temos outras unidades disponíveis. Gostaria de vê-las?',
        replies: [
          { text: 'Yes, please! What are the options?', translation: 'Sim, por favor! Quais são as opções?', next: 'visit_arrange', accepts: ['Yes please'] },
          { text: 'Thank you, but I will keep looking.', translation: 'Obrigado(a), mas vou continuar procurando.', next: 'end_rent', accepts: ["I'll keep looking"] },
        ],
      },
      visit_arrange: {
        text: 'Great. When would you like to visit?',
        translation: 'Ótimo. Quando você gostaria de visitar?',
        replies: [
          { text: 'Could we visit this Saturday morning?', translation: 'Poderíamos visitar neste sábado de manhã?', next: 'apartment_details', accepts: ['Saturday morning'] },
          { text: 'Tomorrow afternoon works for me.', translation: 'Amanhã à tarde me cabe bem.', next: 'apartment_details', accepts: ['Tomorrow afternoon'] },
        ],
      },
      apartment_details: {
        text: 'Perfect. The apartment has two bedrooms and one bathroom. The rent is fifteen hundred a month.',
        translation: 'Perfeito. O apartamento tem dois quartos e um banheiro. O aluguel é mil e quinhentos por mês.',
        replies: [
          { text: 'Does the price include water and electricity?', translation: 'O preço inclui água e luz?', next: 'included', accepts: ['Water and electricity included?'] },
          { text: 'Is there a parking space?', translation: 'Tem vaga de garagem?', next: 'included', accepts: ['Is there parking?'] },
        ],
      },
      included: {
        text: 'Water is included. Electricity is separate. There is one parking space.',
        translation: 'Água está incluída. Luz é separada. Há uma vaga de garagem.',
        replies: [
          { text: 'Can I negotiate the price a little?', translation: 'Posso negociar o preço um pouco?', next: 'negotiate', accepts: ['Can I negotiate?'] },
          { text: 'That sounds reasonable. I am interested.', translation: 'Parece razoável. Estou interessado(a).', next: 'end_rent', accepts: ["I'm interested"] },
        ],
      },
      negotiate: {
        text: 'The owner is flexible. We could discuss a small discount for a longer contract.',
        translation: 'O proprietário é flexível. Poderíamos discutir um pequeno desconto para um contrato mais longo.',
        replies: [
          { text: 'Excellent! I would prefer a one-year contract.', translation: 'Excelente! Prefiro um contrato de um ano.', next: 'end_rent', accepts: ['One-year contract'] },
          { text: 'Let me think about it and call you back.', translation: 'Deixe-me pensar e ligo de volta.', next: 'end_rent', accepts: ["I'll call back"] },
        ],
      },
      end_rent: {
        text: 'Perfect. We look forward to hearing from you. Have a great day!',
        translation: 'Perfeito. Esperamos seu retorno. Tenha um ótimo dia!',
        replies: [],
      },
    },
  },

  {
    id: 'airport',
    topic: 'At the Airport',
    topicPt: 'No aeroporto',
    icon: '✈️',
    level: 4,
    start: 'check_in_airport',
    nodes: {
      check_in_airport: {
        text: 'Good morning. Can I see your passport and booking confirmation, please?',
        translation: 'Bom dia. Posso ver seu passaporte e confirmação de reserva, por favor?',
        replies: [
          { text: 'Of course. Here is my passport.', translation: 'Claro. Aqui está meu passaporte.', next: 'baggage', accepts: ['Here is my passport'] },
          { text: 'I have my documents on my phone. Is that okay?', translation: 'Tenho meus documentos no celular. Tudo bem?', next: 'baggage', accepts: ['Documents on phone'] },
        ],
      },
      baggage: {
        text: 'Thank you. How many bags are you checking in today?',
        translation: 'Obrigado(a). Quantas malas você vai despachar hoje?',
        replies: [
          { text: 'Just one suitcase.', translation: 'Só uma mala.', next: 'seat_preference', accepts: ['One suitcase'] },
          { text: 'Two bags. One is quite heavy.', translation: 'Duas malas. Uma é bem pesada.', next: 'overweight', accepts: ['Two bags, one heavy'] },
          { text: 'No bags. Just hand luggage.', translation: 'Nenhuma mala. Só bagagem de mão.', next: 'seat_preference', accepts: ['Only hand luggage'] },
        ],
      },
      overweight: {
        text: 'The heavy bag is thirty kilos. The limit is twenty-three. There will be a surcharge of fifty dollars.',
        translation: 'A mala pesada tem trinta quilos. O limite é vinte e três. Haverá uma taxa adicional de cinquenta dólares.',
        replies: [
          { text: 'Oh no. Can I transfer some items to my other bag?', translation: 'Ah não. Posso transferir alguns itens para a outra mala?', next: 'seat_preference', accepts: ['Transfer items'] },
          { text: 'Okay, I will pay the surcharge.', translation: 'Ok, vou pagar a taxa adicional.', next: 'seat_preference', accepts: ["I'll pay"] },
        ],
      },
      seat_preference: {
        text: 'Do you have a seat preference? Window or aisle?',
        translation: 'Você tem preferência de assento? Janela ou corredor?',
        replies: [
          { text: 'Window seat, please. I love the view.', translation: 'Assento de janela, por favor. Adoro a vista.', next: 'gate_info', accepts: ['Window please'] },
          { text: 'Aisle, please. I like to walk around.', translation: 'Corredor, por favor. Gosto de circular.', next: 'gate_info', accepts: ['Aisle please'] },
        ],
      },
      gate_info: {
        text: 'Here is your boarding pass. Your gate is B fourteen. Boarding begins at nine forty-five.',
        translation: 'Aqui está seu cartão de embarque. Seu portão é o B catorze. O embarque começa às nove e quarenta e cinco.',
        replies: [
          { text: 'How long does it take to reach gate B14?', translation: 'Quanto tempo leva para chegar ao portão B14?', next: 'end_airport', accepts: ['How far is gate B14?'] },
          { text: 'Thank you very much! Have a good day.', translation: 'Muito obrigado(a)! Tenha um bom dia.', next: 'end_airport', accepts: ['Thank you, goodbye'] },
        ],
      },
      end_airport: {
        text: 'About ten minutes by foot. Have a pleasant flight!',
        translation: 'Uns dez minutos a pé. Tenha um voo agradável!',
        replies: [],
      },
    },
  },

  {
    id: 'bank',
    topic: 'At the Bank',
    topicPt: 'No banco',
    icon: '🏦',
    level: 4,
    start: 'bank_welcome',
    nodes: {
      bank_welcome: {
        text: 'Good afternoon. How can I assist you today?',
        translation: 'Boa tarde. Como posso ajudá-lo(a) hoje?',
        replies: [
          { text: 'I would like to open a current account.', translation: 'Gostaria de abrir uma conta corrente.', next: 'documents_needed', accepts: ['Open an account'] },
          { text: 'I need to make an international transfer.', translation: 'Preciso fazer uma transferência internacional.', next: 'transfer_details', accepts: ['International transfer'] },
          { text: 'My card was blocked. Can you help me?', translation: 'Meu cartão foi bloqueado. Pode me ajudar?', next: 'card_blocked', accepts: ['My card was blocked'] },
        ],
      },
      card_blocked: {
        text: "I'm sorry about that. Can I see some identification, please?",
        translation: 'Sinto muito por isso. Posso ver um documento de identificação, por favor?',
        replies: [
          { text: 'Here is my passport.', translation: 'Aqui está meu passaporte.', next: 'card_reason', accepts: ['Here is my passport'] },
          { text: 'I have my ID card.', translation: 'Tenho minha carteira de identidade.', next: 'card_reason', accepts: ['Here is my ID'] },
        ],
      },
      card_reason: {
        text: 'The system shows your card was blocked due to suspicious activity. Did you make a purchase in another country recently?',
        translation: 'O sistema mostra que seu cartão foi bloqueado por atividade suspeita. Você fez uma compra em outro país recentemente?',
        replies: [
          { text: 'Yes! I was traveling last week.', translation: 'Sim! Estava viajando semana passada.', next: 'unblock', accepts: ['I was traveling'] },
          { text: 'No, I have not used it abroad.', translation: 'Não, não usei no exterior.', next: 'unblock', accepts: ['I have not used it abroad'] },
        ],
      },
      unblock: {
        text: "I'll unblock your card now. You'll receive a confirmation message on your phone.",
        translation: 'Vou desbloquear seu cartão agora. Você receberá uma mensagem de confirmação no celular.',
        replies: [
          { text: 'Thank you. Should I change my PIN?', translation: 'Obrigado(a). Devo trocar meu PIN?', next: 'end_bank', accepts: ['Change my PIN?'] },
          { text: 'Great, thank you so much!', translation: 'Ótimo, muito obrigado(a)!', next: 'end_bank', accepts: ['Thank you!'] },
        ],
      },
      documents_needed: {
        text: 'To open an account we need your passport, proof of address, and proof of income.',
        translation: 'Para abrir uma conta precisamos de seu passaporte, comprovante de endereço e comprovante de renda.',
        replies: [
          { text: 'I have all those documents with me.', translation: 'Tenho todos esses documentos comigo.', next: 'end_bank', accepts: ['I have them all'] },
          { text: 'I do not have proof of income. Can I still open one?', translation: 'Não tenho comprovante de renda. Posso abrir mesmo assim?', next: 'end_bank', accepts: ['No proof of income'] },
        ],
      },
      transfer_details: {
        text: 'For international transfers we need the recipient\'s IBAN or SWIFT code. Do you have that?',
        translation: 'Para transferências internacionais precisamos do IBAN ou código SWIFT do destinatário. Você tem isso?',
        replies: [
          { text: 'Yes, I have the IBAN code here.', translation: 'Sim, tenho o código IBAN aqui.', next: 'end_bank', accepts: ['I have the IBAN'] },
          { text: 'I will have to get that information first.', translation: 'Vou precisar obter essa informação primeiro.', next: 'end_bank', accepts: ["I'll get the information first"] },
        ],
      },
      end_bank: {
        text: 'We are happy to help. Is there anything else we can assist you with today?',
        translation: 'Estamos felizes em ajudar. Há mais alguma coisa em que possamos ajudá-lo(a) hoje?',
        replies: [],
      },
    },
  },

  {
    id: 'business_meeting',
    topic: 'Business Meeting',
    topicPt: 'Reunião de negócios',
    icon: '💻',
    level: 4,
    start: 'open_meeting',
    nodes: {
      open_meeting: {
        text: "Good morning everyone. Let's get started. First, can you give us a brief update on last quarter's results?",
        translation: 'Bom dia a todos. Vamos começar. Primeiramente, você pode nos dar uma atualização breve sobre os resultados do trimestre passado?',
        replies: [
          { text: 'Sure. We achieved a fifteen percent growth in revenue.', translation: 'Claro. Alcançamos um crescimento de quinze por cento na receita.', next: 'next_steps', accepts: ['Fifteen percent growth'] },
          { text: 'Unfortunately, we fell short of our targets by five percent.', translation: 'Infelizmente, ficamos cinco por cento abaixo das metas.', next: 'why_missed', accepts: ['We missed our targets'] },
        ],
      },
      why_missed: {
        text: 'I see. What were the main reasons for missing the targets?',
        translation: 'Entendo. Quais foram os principais motivos para não alcançar as metas?',
        replies: [
          { text: 'Supply chain delays affected our delivery times.', translation: 'Atrasos na cadeia de suprimentos afetaram nossos prazos de entrega.', next: 'next_steps', accepts: ['Supply chain delays'] },
          { text: 'Market conditions were more challenging than expected.', translation: 'As condições de mercado foram mais desafiadoras do que o esperado.', next: 'next_steps', accepts: ['Market conditions'] },
        ],
      },
      next_steps: {
        text: 'Thank you. What are the main priorities for this quarter?',
        translation: 'Obrigado(a). Quais são as principais prioridades para este trimestre?',
        replies: [
          { text: 'We will focus on customer retention and expanding to new markets.', translation: 'Vamos focar na retenção de clientes e na expansão para novos mercados.', next: 'proposal', accepts: ['Customer retention and new markets'] },
          { text: 'Our priority is reducing operational costs by ten percent.', translation: 'Nossa prioridade é reduzir os custos operacionais em dez por cento.', next: 'proposal', accepts: ['Reducing costs'] },
        ],
      },
      proposal: {
        text: 'Interesting. I would like to propose a new partnership to help achieve those goals.',
        translation: 'Interessante. Gostaria de propor uma nova parceria para ajudar a alcançar esses objetivos.',
        replies: [
          { text: 'We are open to hearing the proposal. Please go ahead.', translation: 'Estamos abertos a ouvir a proposta. Por favor, continue.', next: 'timeline', accepts: ["We're open to it"] },
          { text: 'Can you send us the details in writing first?', translation: 'Você pode nos enviar os detalhes por escrito primeiro?', next: 'timeline', accepts: ['Send details in writing'] },
        ],
      },
      timeline: {
        text: 'Of course. What timeline are you thinking for implementation?',
        translation: 'Claro. Qual prazo você está pensando para a implementação?',
        replies: [
          { text: 'We could start the pilot in Q2 and full rollout by Q3.', translation: 'Poderíamos iniciar o piloto no T2 e implantação completa até o T3.', next: 'end_meeting', accepts: ['Q2 pilot, Q3 rollout'] },
          { text: 'We would need at least six months for proper planning.', translation: 'Precisaríamos de pelo menos seis meses para um planejamento adequado.', next: 'end_meeting', accepts: ['Six months for planning'] },
        ],
      },
      end_meeting: {
        text: "Excellent discussion today. We'll schedule a follow-up meeting next week. Thank you all.",
        translation: 'Excelente discussão hoje. Agendaremos uma reunião de acompanhamento na semana que vem. Obrigado(a) a todos.',
        replies: [],
      },
    },
  },

  {
    id: 'health_insurance',
    topic: 'Health & Insurance',
    topicPt: 'Saúde e plano de saúde',
    icon: '🏥',
    level: 4,
    start: 'insurance_call',
    nodes: {
      insurance_call: {
        text: 'Thank you for calling HealthCare Plus. How can I help you today?',
        translation: 'Obrigado por ligar para a HealthCare Plus. Como posso ajudá-lo(a) hoje?',
        replies: [
          { text: 'I would like to inquire about your health insurance plans.', translation: 'Gostaria de saber mais sobre os planos de saúde de vocês.', next: 'plan_types', accepts: ['About your plans'] },
          { text: 'I need to make a claim for a medical expense.', translation: 'Preciso fazer um pedido de reembolso por despesa médica.', next: 'claim_process', accepts: ['Make a claim'] },
          { text: 'I have a question about my current coverage.', translation: 'Tenho uma dúvida sobre minha cobertura atual.', next: 'coverage_q', accepts: ['About my coverage'] },
        ],
      },
      plan_types: {
        text: 'We offer three plans: Basic, Standard, and Premium. What is your budget per month?',
        translation: 'Oferecemos três planos: Básico, Padrão e Premium. Qual é o seu orçamento por mês?',
        replies: [
          { text: 'I can afford around two hundred dollars a month.', translation: 'Consigo pagar cerca de duzentos dólares por mês.', next: 'recommend_plan', accepts: ['Two hundred dollars'] },
          { text: 'I want the best coverage regardless of price.', translation: 'Quero a melhor cobertura independente do preço.', next: 'recommend_plan', accepts: ['Best coverage'] },
        ],
      },
      recommend_plan: {
        text: 'I recommend our Standard plan. It covers doctor visits, hospital stays, and prescriptions.',
        translation: 'Recomendo nosso plano Padrão. Cobre consultas médicas, internações e receituários.',
        replies: [
          { text: 'Does it include dental and vision?', translation: 'Inclui dentista e oftalmologista?', next: 'end_insurance', accepts: ['Dental and vision?'] },
          { text: 'What is the deductible for that plan?', translation: 'Qual é a franquia desse plano?', next: 'end_insurance', accepts: ['What is the deductible?'] },
        ],
      },
      claim_process: {
        text: 'To make a claim, please provide the date of treatment, the provider name, and the invoice amount.',
        translation: 'Para fazer um reembolso, forneça a data do atendimento, o nome do prestador e o valor da fatura.',
        replies: [
          { text: 'I have all that information. How long does reimbursement take?', translation: 'Tenho todas essas informações. Quanto tempo leva o reembolso?', next: 'end_insurance', accepts: ['How long for reimbursement?'] },
          { text: 'Can I submit the claim online?', translation: 'Posso enviar o pedido online?', next: 'end_insurance', accepts: ['Submit online?'] },
        ],
      },
      coverage_q: {
        text: 'Could I have your policy number, please?',
        translation: 'Poderia me informar o número da sua apólice, por favor?',
        replies: [
          { text: 'It is A-seven-seven-three-two-one.', translation: 'É A-sete-sete-três-dois-um.', next: 'end_insurance', accepts: ['A77321'] },
          { text: 'I need to look it up. Can I call back?', translation: 'Preciso procurar. Posso ligar de volta?', next: 'end_insurance', accepts: ["I'll call back"] },
        ],
      },
      end_insurance: {
        text: 'Of course. Reimbursement typically takes five to ten business days. Is there anything else I can help you with?',
        translation: 'Claro. O reembolso normalmente leva de cinco a dez dias úteis. Há mais alguma coisa em que eu possa ajudá-lo(a)?',
        replies: [],
      },
    },
  },

  {
    id: 'negotiating',
    topic: 'Negotiating a Deal',
    topicPt: 'Negociando um acordo',
    icon: '🤝',
    level: 4,
    start: 'open_negotiation',
    nodes: {
      open_negotiation: {
        text: "We've reviewed your proposal. The quality looks excellent, but the price is above our budget.",
        translation: 'Analisamos sua proposta. A qualidade parece excelente, mas o preço está acima do nosso orçamento.',
        replies: [
          { text: 'I understand your concern. What budget did you have in mind?', translation: 'Entendo sua preocupação. Qual orçamento você tinha em mente?', next: 'counter_offer', accepts: ['What is your budget?'] },
          { text: 'Our pricing reflects the quality and service included.', translation: 'Nosso preço reflete a qualidade e o serviço incluídos.', next: 'pricing_justification', accepts: ['Price reflects quality'] },
        ],
      },
      pricing_justification: {
        text: 'I understand quality costs money. But our budget is limited. Can you adjust the terms?',
        translation: 'Entendo que qualidade custa dinheiro. Mas nosso orçamento é limitado. Pode ajustar os termos?',
        replies: [
          { text: 'What if we adjust the payment terms?', translation: 'E se ajustarmos os termos de pagamento?', next: 'discuss_terms', accepts: ['Adjust payment terms'] },
          { text: 'I need to consult my manager before reducing the price.', translation: 'Preciso consultar meu gerente antes de reduzir o preço.', next: 'discuss_terms', accepts: ['Consult my manager'] },
        ],
      },
      counter_offer: {
        text: 'We were hoping for something around twenty thousand. Your quote was twenty-eight.',
        translation: 'Esperávamos algo em torno de vinte mil. Seu orçamento foi de vinte e oito.',
        replies: [
          { text: 'That is quite a gap. Could we meet in the middle at twenty-four?', translation: 'É uma diferença grande. Poderíamos nos encontrar no meio-termo em vinte e quatro?', next: 'discuss_terms', accepts: ['Twenty-four thousand?'] },
          { text: 'I need to consult my manager before reducing the price.', translation: 'Preciso consultar meu gerente antes de reduzir o preço.', next: 'discuss_terms', accepts: ['Consult my manager'] },
        ],
      },
      discuss_terms: {
        text: 'What if we adjust the payment terms? We could offer sixty days instead of thirty.',
        translation: 'E se ajustarmos os termos de pagamento? Poderíamos oferecer sessenta dias em vez de trinta.',
        replies: [
          { text: 'Sixty-day payment terms would help us significantly.', translation: 'Termos de pagamento de sessenta dias nos ajudariam bastante.', next: 'volume_discount', accepts: ['Sixty days is helpful'] },
          { text: 'We also need a faster delivery time.', translation: 'Também precisamos de um prazo de entrega mais rápido.', next: 'volume_discount', accepts: ['Faster delivery'] },
        ],
      },
      volume_discount: {
        text: 'If you commit to purchasing a larger volume, we can offer a ten percent discount.',
        translation: 'Se você se comprometer a comprar um volume maior, podemos oferecer um desconto de dez por cento.',
        replies: [
          { text: 'We could increase the order if the unit price drops.', translation: 'Poderíamos aumentar o pedido se o preço unitário cair.', next: 'close_deal', accepts: ['Increase order if price drops'] },
          { text: 'Our current volume is all we can commit to right now.', translation: 'Nosso volume atual é tudo o que podemos comprometer agora.', next: 'close_deal', accepts: ['Current volume only'] },
        ],
      },
      close_deal: {
        text: "Let's do this: we'll agree on twenty-five thousand with sixty-day payment terms. Does that work?",
        translation: 'Vamos fazer assim: acordamos em vinte e cinco mil com prazo de pagamento de sessenta dias. Isso funciona?',
        replies: [
          { text: "You have a deal. Let's put it in writing.", translation: 'Temos um acordo. Vamos colocar por escrito.', next: 'end_negotiation', accepts: ["We have a deal"] },
          { text: 'I need one more day to confirm with my team.', translation: 'Preciso de mais um dia para confirmar com minha equipe.', next: 'end_negotiation', accepts: ['One more day'] },
        ],
      },
      end_negotiation: {
        text: "Excellent! We'll send you the contract by tomorrow morning. Thank you for your partnership.",
        translation: 'Excelente! Enviaremos o contrato até amanhã de manhã. Obrigado(a) pela parceria.',
        replies: [],
      },
    },
  },

  {
    id: 'university',
    topic: 'University Life',
    topicPt: 'Vida universitária',
    icon: '🎓',
    level: 4,
    start: 'enrolment',
    nodes: {
      enrolment: {
        text: "Hello! I am here to enrol in the Advanced English Literature course. Is it still open?",
        translation: 'Olá! Estou aqui para me matricular no curso de Literatura Inglesa Avançada. Ainda está aberto?',
        replies: [
          { text: 'Yes, but there are only a few spots left.', translation: 'Sim, mas há poucas vagas restantes.', next: 'prerequisites', accepts: ['A few spots left'] },
          { text: 'Unfortunately, enrolment has already closed.', translation: 'Infelizmente, as matrículas já foram encerradas.', next: 'waitlist', accepts: ['Enrolment closed'] },
        ],
      },
      waitlist: {
        text: 'You can join the waitlist. We will contact you if a spot becomes available.',
        translation: 'Você pode entrar na lista de espera. Entraremos em contato se uma vaga ficar disponível.',
        replies: [
          { text: 'Yes, please put me on the waitlist.', translation: 'Sim, por favor me coloque na lista de espera.', next: 'prerequisites', accepts: ['Yes, put me on the waitlist'] },
          { text: 'Is there a similar course available this semester?', translation: 'Há um curso similar disponível neste semestre?', next: 'prerequisites', accepts: ['Similar course?'] },
        ],
      },
      prerequisites: {
        text: 'Before we proceed, do you have the prerequisites? A B2 English certificate is required.',
        translation: 'Antes de prosseguir, você tem os pré-requisitos? Um certificado de inglês B2 é exigido.',
        replies: [
          { text: 'Yes, I passed the IELTS exam with a score of six point five.', translation: 'Sim, passei no exame IELTS com nota seis e meio.', next: 'professor_contact', accepts: ['IELTS 6.5'] },
          { text: 'I do not have a certificate but I am fluent.', translation: 'Não tenho certificado mas sou fluente.', next: 'professor_contact', accepts: ["I don't have a certificate"] },
        ],
      },
      professor_contact: {
        text: 'You will also need to contact the professor to get the reading list before the semester starts.',
        translation: 'Você também precisará entrar em contato com o professor para obter a lista de leituras antes do semestre começar.',
        replies: [
          { text: 'Can you give me the professor\'s email address?', translation: 'Pode me dar o endereço de e-mail do professor?', next: 'thesis', accepts: ["Professor's email?"] },
          { text: 'Is the reading list available online?', translation: 'A lista de leituras está disponível online?', next: 'thesis', accepts: ['Reading list online?'] },
        ],
      },
      thesis: {
        text: 'Also, be aware that this course requires a ten-thousand-word thesis at the end.',
        translation: 'Além disso, saiba que este curso exige um trabalho de conclusão de dez mil palavras ao final.',
        replies: [
          { text: 'That is challenging but I am prepared for it.', translation: 'É desafiador mas estou preparado(a) para isso.', next: 'end_university', accepts: ["I'm prepared"] },
          { text: 'Can the thesis be co-written with another student?', translation: 'O trabalho pode ser co-escrito com outro estudante?', next: 'end_university', accepts: ['Co-written thesis?'] },
        ],
      },
      end_university: {
        text: "Great attitude! Welcome to the course. We'll see you at the first lecture on Monday.",
        translation: 'Ótima atitude! Bem-vindo(a) ao curso. Nos vemos na primeira aula na segunda-feira.',
        replies: [],
      },
    },
  },

  {
    id: 'tech_support',
    topic: 'Tech Support',
    topicPt: 'Suporte técnico',
    icon: '💻',
    level: 4,
    start: 'tech_open',
    nodes: {
      tech_open: {
        text: 'Thank you for calling TechHelp. My name is Mark. What seems to be the issue?',
        translation: 'Obrigado por ligar para a TechHelp. Meu nome é Mark. Qual parece ser o problema?',
        replies: [
          { text: 'My computer has been running very slowly since this morning.', translation: 'Meu computador está rodando muito devagar desde esta manhã.', next: 'slow_check', accepts: ['Computer running slowly'] },
          { text: 'I cannot connect to the internet.', translation: 'Não consigo conectar à internet.', next: 'internet_check', accepts: ['Cannot connect to internet'] },
          { text: 'My software is showing an error code.', translation: 'Meu software está mostrando um código de erro.', next: 'error_code', accepts: ['Error code'] },
        ],
      },
      slow_check: {
        text: 'I see. How much free space do you have on your hard drive?',
        translation: 'Entendo. Quanto espaço livre você tem no seu disco rígido?',
        replies: [
          { text: 'It says I only have two gigabytes left.', translation: 'Diz que tenho apenas dois gigabytes restantes.', next: 'fix_slow', accepts: ['Two gigabytes left'] },
          { text: 'I am not sure how to check that.', translation: 'Não tenho certeza de como verificar isso.', next: 'fix_slow', accepts: ["I don't know how to check"] },
        ],
      },
      fix_slow: {
        text: 'That is likely the problem. I recommend clearing your downloads folder and running a disk cleanup.',
        translation: 'Esse é provavelmente o problema. Recomendo limpar sua pasta de downloads e executar uma limpeza de disco.',
        replies: [
          { text: 'Can you guide me through that step by step?', translation: 'Você pode me guiar passo a passo?', next: 'remote_access', accepts: ['Guide me step by step'] },
          { text: 'I can try to do that myself. Thank you!', translation: 'Posso tentar fazer isso sozinho(a). Obrigado(a)!', next: 'remote_access', accepts: ["I'll do it myself"] },
        ],
      },
      internet_check: {
        text: 'Let\'s try some basic steps. First, have you restarted your router?',
        translation: 'Vamos tentar alguns passos básicos. Primeiro, você reiniciou seu roteador?',
        replies: [
          { text: 'Yes, I already restarted it twice.', translation: 'Sim, já reiniciei duas vezes.', next: 'remote_access', accepts: ['Restarted twice'] },
          { text: 'No, let me try that now.', translation: 'Não, deixa eu tentar agora.', next: 'remote_access', accepts: ["I'll try now"] },
        ],
      },
      error_code: {
        text: 'What is the error code you are seeing?',
        translation: 'Qual é o código de erro que você está vendo?',
        replies: [
          { text: 'It says Error 404 not found.', translation: 'Diz Error 404 not found.', next: 'remote_access', accepts: ['Error 404'] },
          { text: 'The code is 0xC0000005.', translation: 'O código é 0xC0000005.', next: 'remote_access', accepts: ['0xC0000005'] },
        ],
      },
      remote_access: {
        text: 'Would you like me to access your computer remotely to fix the issue directly?',
        translation: 'Gostaria que eu acessasse seu computador remotamente para resolver o problema diretamente?',
        replies: [
          { text: 'Yes, that would be very helpful.', translation: 'Sim, isso seria muito útil.', next: 'end_tech', accepts: ['Yes, remote access'] },
          { text: 'I prefer to fix it myself. Can you send me the instructions?', translation: 'Prefiro resolver sozinho(a). Você pode me enviar as instruções?', next: 'end_tech', accepts: ['Send me instructions'] },
        ],
      },
      end_tech: {
        text: "Perfect. I'll send you an email with detailed instructions and a link for remote access. Is there anything else?",
        translation: 'Perfeito. Enviarei um e-mail com instruções detalhadas e um link para acesso remoto. Há mais alguma coisa?',
        replies: [],
      },
    },
  },

  {
    id: 'travel_agency',
    topic: 'At the Travel Agency',
    topicPt: 'Na agência de viagens',
    icon: '🌍',
    level: 4,
    start: 'agency_welcome',
    nodes: {
      agency_welcome: {
        text: 'Welcome to Dream Journeys Travel Agency! Where would you like to go?',
        translation: 'Bem-vindo(a) à Agência de Viagens Dream Journeys! Para onde você gostaria de ir?',
        replies: [
          { text: 'I would like to visit Europe next summer.', translation: 'Gostaria de visitar a Europa no próximo verão.', next: 'europe_details', accepts: ['Europe next summer'] },
          { text: 'I am thinking about Southeast Asia for two weeks.', translation: 'Estou pensando no Sudeste Asiático por duas semanas.', next: 'asia_details', accepts: ['Southeast Asia'] },
          { text: 'I would like to plan a honeymoon package.', translation: 'Gostaria de planejar um pacote para lua de mel.', next: 'honeymoon', accepts: ['Honeymoon package'] },
        ],
      },
      honeymoon: {
        text: 'How romantic! When is the wedding and what is your budget?',
        translation: 'Que romântico! Quando é o casamento e qual é o seu orçamento?',
        replies: [
          { text: 'The wedding is in November. Budget is five thousand dollars.', translation: 'O casamento é em novembro. Orçamento é cinco mil dólares.', next: 'visa_question', accepts: ['November, five thousand'] },
          { text: 'We are getting married in March. We have ten thousand.', translation: 'Vamos nos casar em março. Temos dez mil.', next: 'visa_question', accepts: ['March, ten thousand'] },
        ],
      },
      europe_details: {
        text: 'Europe is wonderful! Which countries are you interested in visiting?',
        translation: 'A Europa é maravilhosa! Quais países você tem interesse em visitar?',
        replies: [
          { text: 'Italy, France, and Spain would be my dream trip.', translation: 'Itália, França e Espanha seria a viagem dos meus sonhos.', next: 'visa_question', accepts: ['Italy, France, Spain'] },
          { text: 'I am particularly interested in Portugal and the UK.', translation: 'Estou particularmente interessado(a) em Portugal e no Reino Unido.', next: 'visa_question', accepts: ['Portugal and UK'] },
        ],
      },
      asia_details: {
        text: 'Southeast Asia is amazing! Thailand, Vietnam, and Bali are very popular. Any preference?',
        translation: 'O Sudeste Asiático é incrível! Tailândia, Vietnã e Bali são muito populares. Alguma preferência?',
        replies: [
          { text: 'Thailand and Vietnam sound perfect.', translation: 'Tailândia e Vietnã parecem perfeito.', next: 'visa_question', accepts: ['Thailand and Vietnam'] },
          { text: 'I would love to see Bali and Singapore.', translation: 'Adoraria conhecer Bali e Singapura.', next: 'visa_question', accepts: ['Bali and Singapore'] },
        ],
      },
      visa_question: {
        text: 'Do you have a valid passport? Some destinations may require a visa.',
        translation: 'Você tem passaporte válido? Alguns destinos podem exigir visto.',
        replies: [
          { text: 'Yes, my passport is valid for five more years.', translation: 'Sim, meu passaporte é válido por mais cinco anos.', next: 'package_options', accepts: ['Valid for five years'] },
          { text: 'I need to renew my passport. How long does it take?', translation: 'Preciso renovar meu passaporte. Quanto tempo leva?', next: 'package_options', accepts: ['Need to renew passport'] },
        ],
      },
      package_options: {
        text: 'We offer all-inclusive packages with flights, hotels, and guided tours. Would you prefer that or a custom itinerary?',
        translation: 'Oferecemos pacotes tudo incluído com voos, hotéis e passeios guiados. Prefere isso ou um itinerário personalizado?',
        replies: [
          { text: 'An all-inclusive package sounds stress-free.', translation: 'Um pacote tudo incluído parece tranquilo.', next: 'end_agency', accepts: ['All-inclusive package'] },
          { text: 'I prefer a custom itinerary so I can explore freely.', translation: 'Prefiro um itinerário personalizado para explorar livremente.', next: 'end_agency', accepts: ['Custom itinerary'] },
        ],
      },
      end_agency: {
        text: "Excellent choice! I'll prepare two options for you and email the details by tomorrow. Have a wonderful day!",
        translation: 'Excelente escolha! Vou preparar duas opções e enviar os detalhes por e-mail até amanhã. Tenha um dia maravilhoso!',
        replies: [],
      },
    },
  }
];
