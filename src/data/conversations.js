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
    level: 2,
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
    level: 2,
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
];
