// Banco de dados de palavras organizadas por categoria
// Cada palavra contém: en, pt, category, pronunciation, example, examplePt, level, tip

export const words = [
  // ===== CUMPRIMENTOS (Greetings) - Level 1 =====
  { en: "Hello", pt: "Olá", category: "cumprimentos", pronunciation: "rélou", example: "Hello! How are you?", examplePt: "Olá! Como você está?", level: 1, tip: "É o cumprimento mais comum em inglês." },
  { en: "Hi", pt: "Oi", category: "cumprimentos", pronunciation: "rái", example: "Hi, my name is Ana.", examplePt: "Oi, meu nome é Ana.", level: 1, tip: "Mais informal que 'Hello'." },
  { en: "Good morning", pt: "Bom dia", category: "cumprimentos", pronunciation: "gud mórning", example: "Good morning, teacher!", examplePt: "Bom dia, professor(a)!", level: 1, tip: "Usado pela manhã." },
  { en: "Good afternoon", pt: "Boa tarde", category: "cumprimentos", pronunciation: "gud afternún", example: "Good afternoon, everyone.", examplePt: "Boa tarde, todos.", level: 1, tip: "Usado a partir do meio-dia." },
  { en: "Good night", pt: "Boa noite", category: "cumprimentos", pronunciation: "gud náit", example: "Good night, sleep well.", examplePt: "Boa noite, durma bem.", level: 1, tip: "Usado ao se despedir à noite." },
  { en: "Goodbye", pt: "Tchau / Adeus", category: "cumprimentos", pronunciation: "gudbái", example: "Goodbye, see you tomorrow!", examplePt: "Tchau, te vejo amanhã!", level: 1, tip: "Despedida formal." },
  { en: "Bye", pt: "Tchau", category: "cumprimentos", pronunciation: "bái", example: "Bye! Have a nice day!", examplePt: "Tchau! Tenha um bom dia!", level: 1, tip: "Despedida informal e curta." },
  { en: "Please", pt: "Por favor", category: "cumprimentos", pronunciation: "plíz", example: "Can you help me, please?", examplePt: "Você pode me ajudar, por favor?", level: 1, tip: "Palavra mágica da educação." },
  { en: "Thank you", pt: "Obrigado(a)", category: "cumprimentos", pronunciation: "ténk iú", example: "Thank you for your help.", examplePt: "Obrigado(a) pela sua ajuda.", level: 1, tip: "'Thanks' é a versão curta." },
  { en: "Sorry", pt: "Desculpa", category: "cumprimentos", pronunciation: "sóri", example: "Sorry, I'm late.", examplePt: "Desculpa, estou atrasado(a).", level: 1, tip: "Use quando errar ou se desculpar." },
  { en: "Yes", pt: "Sim", category: "cumprimentos", pronunciation: "iés", example: "Yes, I understand.", examplePt: "Sim, eu entendo.", level: 1, tip: "Afirmação simples." },
  { en: "No", pt: "Não", category: "cumprimentos", pronunciation: "nôu", example: "No, thank you.", examplePt: "Não, obrigado(a).", level: 1, tip: "Negação simples." },
  { en: "Welcome", pt: "Bem-vindo(a)", category: "cumprimentos", pronunciation: "uélcom", example: "Welcome to my house!", examplePt: "Bem-vindo(a) à minha casa!", level: 1, tip: "Também usado em 'You're welcome' (De nada)." },
  { en: "How are you?", pt: "Como você está?", category: "cumprimentos", pronunciation: "ráu ar iú", example: "Hi! How are you today?", examplePt: "Oi! Como você está hoje?", level: 1, tip: "Pergunta básica para iniciar conversa." },
  { en: "I'm fine", pt: "Estou bem", category: "cumprimentos", pronunciation: "aim fáin", example: "I'm fine, thank you!", examplePt: "Estou bem, obrigado(a)!", level: 1, tip: "Resposta padrão para 'How are you?'." },

  // ===== NÚMEROS (Numbers) - Level 1 =====
  { en: "One", pt: "Um", category: "numeros", pronunciation: "uan", example: "I have one brother.", examplePt: "Eu tenho um irmão.", level: 1, tip: "Número 1." },
  { en: "Two", pt: "Dois", category: "numeros", pronunciation: "tchú", example: "She has two cats.", examplePt: "Ela tem dois gatos.", level: 1, tip: "Número 2. Não confundir com 'too' (também)." },
  { en: "Three", pt: "Três", category: "numeros", pronunciation: "thrí", example: "There are three chairs.", examplePt: "Há três cadeiras.", level: 1, tip: "Número 3. O 'th' é com a língua entre os dentes." },
  { en: "Four", pt: "Quatro", category: "numeros", pronunciation: "fór", example: "I have four friends.", examplePt: "Eu tenho quatro amigos.", level: 1, tip: "Número 4. Não confundir com 'for' (para)." },
  { en: "Five", pt: "Cinco", category: "numeros", pronunciation: "fáiv", example: "Give me five minutes.", examplePt: "Me dê cinco minutos.", level: 1, tip: "Número 5. 'High five' é 'toca aqui'." },
  { en: "Six", pt: "Seis", category: "numeros", pronunciation: "síks", example: "I wake up at six.", examplePt: "Eu acordo às seis.", level: 1, tip: "Número 6." },
  { en: "Seven", pt: "Sete", category: "numeros", pronunciation: "sévn", example: "There are seven days in a week.", examplePt: "Há sete dias na semana.", level: 1, tip: "Número 7." },
  { en: "Eight", pt: "Oito", category: "numeros", pronunciation: "êit", example: "School starts at eight.", examplePt: "A escola começa às oito.", level: 1, tip: "Número 8. O 'gh' é mudo." },
  { en: "Nine", pt: "Nove", category: "numeros", pronunciation: "náin", example: "I go to bed at nine.", examplePt: "Eu vou dormir às nove.", level: 1, tip: "Número 9." },
  { en: "Ten", pt: "Dez", category: "numeros", pronunciation: "tén", example: "Count to ten.", examplePt: "Conte até dez.", level: 1, tip: "Número 10." },

  // ===== CORES (Colors) - Level 1 =====
  { en: "Red", pt: "Vermelho", category: "cores", pronunciation: "réd", example: "I like red roses.", examplePt: "Eu gosto de rosas vermelhas.", level: 1, tip: "A cor do coração." },
  { en: "Blue", pt: "Azul", category: "cores", pronunciation: "blú", example: "The sky is blue.", examplePt: "O céu é azul.", level: 1, tip: "A cor do céu." },
  { en: "Green", pt: "Verde", category: "cores", pronunciation: "grín", example: "The grass is green.", examplePt: "A grama é verde.", level: 1, tip: "A cor da natureza." },
  { en: "Yellow", pt: "Amarelo", category: "cores", pronunciation: "iélou", example: "The sun is yellow.", examplePt: "O sol é amarelo.", level: 1, tip: "A cor do sol." },
  { en: "Black", pt: "Preto", category: "cores", pronunciation: "blék", example: "I have a black cat.", examplePt: "Eu tenho um gato preto.", level: 1, tip: "Oposto de 'white' (branco)." },
  { en: "White", pt: "Branco", category: "cores", pronunciation: "uáit", example: "Snow is white.", examplePt: "A neve é branca.", level: 1, tip: "Oposto de 'black' (preto)." },
  { en: "Orange", pt: "Laranja", category: "cores", pronunciation: "órendj", example: "I like orange juice.", examplePt: "Eu gosto de suco de laranja.", level: 1, tip: "Também é o nome da fruta." },
  { en: "Pink", pt: "Rosa", category: "cores", pronunciation: "pínk", example: "She likes pink flowers.", examplePt: "Ela gosta de flores rosas.", level: 1, tip: "Um vermelho mais claro." },
  { en: "Purple", pt: "Roxo", category: "cores", pronunciation: "pârpol", example: "Grapes are purple.", examplePt: "Uvas são roxas.", level: 1, tip: "Mistura de vermelho e azul." },
  { en: "Brown", pt: "Marrom", category: "cores", pronunciation: "bráun", example: "The dog is brown.", examplePt: "O cachorro é marrom.", level: 1, tip: "A cor do chocolate." },
  { en: "Gray", pt: "Cinza", category: "cores", pronunciation: "grêi", example: "The clouds are gray.", examplePt: "As nuvens estão cinzas.", level: 1, tip: "Mistura de preto e branco." },

  // ===== ANIMAIS (Animals) - Level 2 =====
  { en: "Dog", pt: "Cachorro", category: "animais", pronunciation: "dóg", example: "I have three dogs.", examplePt: "Eu tenho três cachorros.", level: 2, tip: "O melhor amigo do homem." },
  { en: "Cat", pt: "Gato", category: "animais", pronunciation: "két", example: "The cat is sleeping.", examplePt: "O gato está dormindo.", level: 2, tip: "Animal independente que mia." },
  { en: "Bird", pt: "Pássaro", category: "animais", pronunciation: "bârd", example: "The bird is singing.", examplePt: "O pássaro está cantando.", level: 2, tip: "Animal com asas que voa." },
  { en: "Fish", pt: "Peixe", category: "animais", pronunciation: "fích", example: "The fish is in the water.", examplePt: "O peixe está na água.", level: 2, tip: "Vive na água. O plural também é 'fish'." },
  { en: "Horse", pt: "Cavalo", category: "animais", pronunciation: "hórs", example: "The horse is running.", examplePt: "O cavalo está correndo.", level: 2, tip: "Animal grande usado para montar." },
  { en: "Cow", pt: "Vaca", category: "animais", pronunciation: "cáu", example: "The cow gives milk.", examplePt: "A vaca dá leite.", level: 2, tip: "Animal que produz leite." },
  { en: "Pig", pt: "Porco", category: "animais", pronunciation: "píg", example: "The pig is pink.", examplePt: "O porco é rosa.", level: 2, tip: "Animal da fazenda que faz 'oink'." },
  { en: "Chicken", pt: "Galinha / Frango", category: "animais", pronunciation: "tchíken", example: "I like fried chicken.", examplePt: "Eu gosto de frango frito.", level: 2, tip: "O animal e a carne usam a mesma palavra." },
  { en: "Duck", pt: "Pato", category: "animais", pronunciation: "dâk", example: "The duck is in the lake.", examplePt: "O pato está no lago.", level: 2, tip: "Animal que nada e faz 'quack'." },
  { en: "Rabbit", pt: "Coelho", category: "animais", pronunciation: "rébit", example: "The rabbit is fast.", examplePt: "O coelho é rápido.", level: 2, tip: "Animal fofo com orelhas longas." },
  { en: "Lion", pt: "Leão", category: "animais", pronunciation: "láion", example: "The lion is strong.", examplePt: "O leão é forte.", level: 2, tip: "O rei da selva." },
  { en: "Elephant", pt: "Elefante", category: "animais", pronunciation: "élefant", example: "The elephant is big.", examplePt: "O elefante é grande.", level: 2, tip: "O maior animal terrestre." },
  { en: "Monkey", pt: "Macaco", category: "animais", pronunciation: "mânki", example: "The monkey likes bananas.", examplePt: "O macaco gosta de bananas.", level: 2, tip: "Animal que vive nas árvores." },
  { en: "Bear", pt: "Urso", category: "animais", pronunciation: "bér", example: "The bear is big and strong.", examplePt: "O urso é grande e forte.", level: 2, tip: "Animal grande que hiberna no inverno." },
  { en: "Snake", pt: "Cobra", category: "animais", pronunciation: "snêik", example: "The snake is long.", examplePt: "A cobra é comprida.", level: 2, tip: "Animal sem patas que rasteja." },
  { en: "Frog", pt: "Sapo", category: "animais", pronunciation: "fróg", example: "The frog jumps high.", examplePt: "O sapo pula alto.", level: 2, tip: "Animal verde que pula e vive perto da água." },
  { en: "Butterfly", pt: "Borboleta", category: "animais", pronunciation: "bâterflái", example: "The butterfly is beautiful.", examplePt: "A borboleta é bonita.", level: 2, tip: "Inseto com asas coloridas." },
  { en: "Turtle", pt: "Tartaruga", category: "animais", pronunciation: "târtol", example: "The turtle is slow.", examplePt: "A tartaruga é lenta.", level: 2, tip: "Animal com casco que anda devagar." },

  // ===== COMIDAS (Foods) - Level 2 =====
  { en: "Rice", pt: "Arroz", category: "comidas", pronunciation: "ráis", example: "I eat rice every day.", examplePt: "Eu como arroz todo dia.", level: 2, tip: "Alimento básico em muitos países." },
  { en: "Bread", pt: "Pão", category: "comidas", pronunciation: "bréd", example: "I want bread with butter.", examplePt: "Eu quero pão com manteiga.", level: 2, tip: "Feito de farinha de trigo." },
  { en: "Egg", pt: "Ovo", category: "comidas", pronunciation: "ég", example: "I eat eggs for breakfast.", examplePt: "Eu como ovos no café da manhã.", level: 2, tip: "Vem da galinha." },
  { en: "Meat", pt: "Carne", category: "comidas", pronunciation: "mít", example: "Do you like meat?", examplePt: "Você gosta de carne?", level: 2, tip: "Não confundir com 'meet' (encontrar)." },
  { en: "Pizza", pt: "Pizza", category: "comidas", pronunciation: "pítsa", example: "I love pizza!", examplePt: "Eu amo pizza!", level: 2, tip: "Igual em português!" },
  { en: "Apple", pt: "Maçã", category: "comidas", pronunciation: "épol", example: "An apple a day keeps the doctor away.", examplePt: "Uma maçã por dia mantém o médico longe.", level: 2, tip: "Fruta vermelha ou verde." },
  { en: "Banana", pt: "Banana", category: "comidas", pronunciation: "banéna", example: "Monkeys like bananas.", examplePt: "Macacos gostam de bananas.", level: 2, tip: "Fruta amarela. Igual em português!" },
  { en: "Cheese", pt: "Queijo", category: "comidas", pronunciation: "tchíz", example: "I like cheese on my sandwich.", examplePt: "Eu gosto de queijo no meu sanduíche.", level: 2, tip: "Feito de leite." },
  { en: "Cake", pt: "Bolo", category: "comidas", pronunciation: "kêik", example: "The cake is delicious.", examplePt: "O bolo é delicioso.", level: 2, tip: "Doce assado para festas." },
  { en: "Candy", pt: "Doce / Bala", category: "comidas", pronunciation: "kéndi", example: "Kids love candy.", examplePt: "Crianças amam doces.", level: 2, tip: "Algo doce e pequeno." },
  { en: "Fruit", pt: "Fruta", category: "comidas", pronunciation: "frút", example: "Eat more fruit.", examplePt: "Coma mais frutas.", level: 2, tip: "Alimento natural e saudável." },
  { en: "Salad", pt: "Salada", category: "comidas", pronunciation: "séled", example: "I want a salad, please.", examplePt: "Eu quero uma salada, por favor.", level: 2, tip: "Prato com verduras e legumes." },
  { en: "Soup", pt: "Sopa", category: "comidas", pronunciation: "súp", example: "The soup is hot.", examplePt: "A sopa está quente.", level: 2, tip: "Comida líquida e quente." },
  { en: "Sandwich", pt: "Sanduíche", category: "comidas", pronunciation: "sénduitch", example: "I made a sandwich.", examplePt: "Eu fiz um sanduíche.", level: 2, tip: "Pão com recheio." },
  { en: "Ice cream", pt: "Sorvete", category: "comidas", pronunciation: "áis crim", example: "I want chocolate ice cream.", examplePt: "Eu quero sorvete de chocolate.", level: 2, tip: "Sobremesa gelada e doce." },

  // ===== BEBIDAS (Drinks) - Level 2 =====
  { en: "Water", pt: "Água", category: "bebidas", pronunciation: "uóter", example: "I need water.", examplePt: "Eu preciso de água.", level: 2, tip: "A bebida mais importante." },
  { en: "Milk", pt: "Leite", category: "bebidas", pronunciation: "mílk", example: "I drink milk every morning.", examplePt: "Eu bebo leite toda manhã.", level: 2, tip: "Bebida branca que vem da vaca." },
  { en: "Coffee", pt: "Café", category: "bebidas", pronunciation: "cófi", example: "I want coffee, please.", examplePt: "Eu quero café, por favor.", level: 2, tip: "Bebida quente feita de grãos." },
  { en: "Tea", pt: "Chá", category: "bebidas", pronunciation: "tí", example: "Do you want tea?", examplePt: "Você quer chá?", level: 2, tip: "Bebida quente feita de ervas." },
  { en: "Juice", pt: "Suco", category: "bebidas", pronunciation: "djús", example: "Orange juice is my favorite.", examplePt: "Suco de laranja é meu favorito.", level: 2, tip: "Bebida feita de frutas." },
  { en: "Soda", pt: "Refrigerante", category: "bebidas", pronunciation: "sôuda", example: "I don't drink soda.", examplePt: "Eu não bebo refrigerante.", level: 2, tip: "Bebida doce com gás." },

  // ===== FAMÍLIA (Family) - Level 3 =====
  { en: "Mother", pt: "Mãe", category: "familia", pronunciation: "mâder", example: "My mother is beautiful.", examplePt: "Minha mãe é bonita.", level: 3, tip: "'Mom' é a versão informal." },
  { en: "Father", pt: "Pai", category: "familia", pronunciation: "fáder", example: "My father works a lot.", examplePt: "Meu pai trabalha muito.", level: 3, tip: "'Dad' é a versão informal." },
  { en: "Brother", pt: "Irmão", category: "familia", pronunciation: "bráder", example: "I have one brother.", examplePt: "Eu tenho um irmão.", level: 3, tip: "Parente masculino dos mesmos pais." },
  { en: "Sister", pt: "Irmã", category: "familia", pronunciation: "síster", example: "My sister is ten years old.", examplePt: "Minha irmã tem dez anos.", level: 3, tip: "Parente feminino dos mesmos pais." },
  { en: "Son", pt: "Filho", category: "familia", pronunciation: "sân", example: "He is my son.", examplePt: "Ele é meu filho.", level: 3, tip: "Não confundir com 'sun' (sol)." },
  { en: "Daughter", pt: "Filha", category: "familia", pronunciation: "dóter", example: "She is my daughter.", examplePt: "Ela é minha filha.", level: 3, tip: "O 'gh' é mudo." },
  { en: "Baby", pt: "Bebê", category: "familia", pronunciation: "bêibi", example: "The baby is sleeping.", examplePt: "O bebê está dormindo.", level: 3, tip: "Criança muito pequena." },
  { en: "Family", pt: "Família", category: "familia", pronunciation: "fémili", example: "I love my family.", examplePt: "Eu amo minha família.", level: 3, tip: "Grupo de pessoas ligadas por parentesco." },
  { en: "Grandmother", pt: "Avó", category: "familia", pronunciation: "grénmader", example: "My grandmother makes great cake.", examplePt: "Minha avó faz ótimo bolo.", level: 3, tip: "'Grandma' é a versão informal." },
  { en: "Grandfather", pt: "Avô", category: "familia", pronunciation: "gréndfader", example: "My grandfather is 80 years old.", examplePt: "Meu avô tem 80 anos.", level: 3, tip: "'Grandpa' é a versão informal." },
  { en: "Husband", pt: "Marido", category: "familia", pronunciation: "râzbend", example: "She loves her husband.", examplePt: "Ela ama seu marido.", level: 3, tip: "Parceiro masculino no casamento." },
  { en: "Wife", pt: "Esposa", category: "familia", pronunciation: "uáif", example: "He loves his wife.", examplePt: "Ele ama sua esposa.", level: 3, tip: "Parceira feminina no casamento." },
  { en: "Uncle", pt: "Tio", category: "familia", pronunciation: "ânkol", example: "My uncle lives in São Paulo.", examplePt: "Meu tio mora em São Paulo.", level: 3, tip: "Irmão do pai ou da mãe." },
  { en: "Aunt", pt: "Tia", category: "familia", pronunciation: "ént", example: "My aunt is a teacher.", examplePt: "Minha tia é professora.", level: 3, tip: "Irmã do pai ou da mãe." },
  { en: "Cousin", pt: "Primo(a)", category: "familia", pronunciation: "câzin", example: "My cousin is my best friend.", examplePt: "Meu(minha) primo(a) é meu(minha) melhor amigo(a).", level: 3, tip: "Filho(a) do tio ou tia." },

  // ===== CASA (House) - Level 3 =====
  { en: "House", pt: "Casa", category: "casa", pronunciation: "ráus", example: "I live in a big house.", examplePt: "Eu moro em uma casa grande.", level: 3, tip: "Lugar onde uma pessoa mora." },
  { en: "Door", pt: "Porta", category: "casa", pronunciation: "dór", example: "Please close the door.", examplePt: "Por favor, feche a porta.", level: 3, tip: "Entrada de uma sala ou casa." },
  { en: "Window", pt: "Janela", category: "casa", pronunciation: "uíndou", example: "Open the window.", examplePt: "Abra a janela.", level: 3, tip: "Abertura na parede para ver fora." },
  { en: "Kitchen", pt: "Cozinha", category: "casa", pronunciation: "kítchen", example: "I cook in the kitchen.", examplePt: "Eu cozinho na cozinha.", level: 3, tip: "Cômodo onde se prepara comida." },
  { en: "Bedroom", pt: "Quarto", category: "casa", pronunciation: "bédrum", example: "My bedroom is clean.", examplePt: "Meu quarto está limpo.", level: 3, tip: "'Bed' (cama) + 'room' (sala) = quarto." },
  { en: "Bathroom", pt: "Banheiro", category: "casa", pronunciation: "béthrum", example: "Where is the bathroom?", examplePt: "Onde fica o banheiro?", level: 3, tip: "Cômodo com chuveiro e vaso sanitário." },
  { en: "Table", pt: "Mesa", category: "casa", pronunciation: "têibol", example: "The book is on the table.", examplePt: "O livro está na mesa.", level: 3, tip: "Móvel para comer ou trabalhar." },
  { en: "Chair", pt: "Cadeira", category: "casa", pronunciation: "tchér", example: "Please sit on the chair.", examplePt: "Por favor, sente na cadeira.", level: 3, tip: "Móvel para sentar." },
  { en: "Bed", pt: "Cama", category: "casa", pronunciation: "béd", example: "I go to bed at ten.", examplePt: "Eu vou para a cama às dez.", level: 3, tip: "Móvel para dormir." },
  { en: "Sofa", pt: "Sofá", category: "casa", pronunciation: "sôufa", example: "I sit on the sofa.", examplePt: "Eu sento no sofá.", level: 3, tip: "Assento grande e confortável." },
  { en: "TV", pt: "TV / Televisão", category: "casa", pronunciation: "tí ví", example: "I watch TV at night.", examplePt: "Eu assisto TV à noite.", level: 3, tip: "Aparelho para assistir programas." },
  { en: "Clock", pt: "Relógio", category: "casa", pronunciation: "clók", example: "Look at the clock.", examplePt: "Olhe o relógio.", level: 3, tip: "Aparelho que mostra as horas na parede." },
  { en: "Key", pt: "Chave", category: "casa", pronunciation: "kí", example: "Where is my key?", examplePt: "Onde está minha chave?", level: 3, tip: "Objeto usado para abrir portas." },
  { en: "Lamp", pt: "Lâmpada / Abajur", category: "casa", pronunciation: "lémp", example: "Turn on the lamp.", examplePt: "Ligue a lâmpada.", level: 3, tip: "Objeto que produz luz." },
  { en: "Garden", pt: "Jardim", category: "casa", pronunciation: "gárden", example: "I have a beautiful garden.", examplePt: "Eu tenho um jardim bonito.", level: 3, tip: "Área verde fora da casa." },

  // ===== ESCOLA (School) - Level 4 =====
  { en: "School", pt: "Escola", category: "escola", pronunciation: "skúl", example: "I go to school every day.", examplePt: "Eu vou à escola todo dia.", level: 4, tip: "Lugar de aprendizado." },
  { en: "Teacher", pt: "Professor(a)", category: "escola", pronunciation: "títcher", example: "My teacher is nice.", examplePt: "Meu(minha) professor(a) é legal.", level: 4, tip: "Pessoa que ensina." },
  { en: "Student", pt: "Estudante / Aluno(a)", category: "escola", pronunciation: "stiúdent", example: "I am a student.", examplePt: "Eu sou um(a) estudante.", level: 4, tip: "Pessoa que aprende." },
  { en: "Book", pt: "Livro", category: "escola", pronunciation: "búk", example: "I read a book every week.", examplePt: "Eu leio um livro toda semana.", level: 4, tip: "Objeto com páginas para ler." },
  { en: "Pen", pt: "Caneta", category: "escola", pronunciation: "pén", example: "Give me a pen, please.", examplePt: "Me dê uma caneta, por favor.", level: 4, tip: "Objeto para escrever com tinta." },
  { en: "Pencil", pt: "Lápis", category: "escola", pronunciation: "pénsol", example: "I need a pencil.", examplePt: "Eu preciso de um lápis.", level: 4, tip: "Objeto para escrever com grafite." },
  { en: "Paper", pt: "Papel", category: "escola", pronunciation: "pêiper", example: "Write on the paper.", examplePt: "Escreva no papel.", level: 4, tip: "Folha branca para escrever." },
  { en: "Notebook", pt: "Caderno", category: "escola", pronunciation: "nôutbuk", example: "Open your notebook.", examplePt: "Abra seu caderno.", level: 4, tip: "Muitas folhas de papel juntas." },
  { en: "Classroom", pt: "Sala de aula", category: "escola", pronunciation: "cléssrum", example: "The classroom is big.", examplePt: "A sala de aula é grande.", level: 4, tip: "'Class' (aula) + 'room' (sala)." },
  { en: "Homework", pt: "Lição de casa", category: "escola", pronunciation: "hôum-uôrk", example: "I need to do my homework.", examplePt: "Eu preciso fazer minha lição de casa.", level: 4, tip: "'Home' (casa) + 'work' (trabalho)." },
  { en: "Test", pt: "Prova / Teste", category: "escola", pronunciation: "tést", example: "I have a test tomorrow.", examplePt: "Eu tenho uma prova amanhã.", level: 4, tip: "Avaliação de conhecimento." },
  { en: "Computer", pt: "Computador", category: "escola", pronunciation: "compiúter", example: "I use the computer.", examplePt: "Eu uso o computador.", level: 4, tip: "Máquina eletrônica." },

  // ===== TRABALHO (Work) - Level 4 =====
  { en: "Work", pt: "Trabalho / Trabalhar", category: "trabalho", pronunciation: "uôrk", example: "I work from Monday to Friday.", examplePt: "Eu trabalho de segunda a sexta.", level: 4, tip: "Pode ser verbo ou substantivo." },
  { en: "Office", pt: "Escritório", category: "trabalho", pronunciation: "ófis", example: "I go to the office every day.", examplePt: "Eu vou ao escritório todo dia.", level: 4, tip: "Local de trabalho com mesa e computador." },
  { en: "Boss", pt: "Chefe", category: "trabalho", pronunciation: "bós", example: "My boss is friendly.", examplePt: "Meu chefe é amigável.", level: 4, tip: "Pessoa responsável no trabalho." },
  { en: "Job", pt: "Emprego", category: "trabalho", pronunciation: "djób", example: "I have a good job.", examplePt: "Eu tenho um bom emprego.", level: 4, tip: "Ocupação profissional." },
  { en: "Money", pt: "Dinheiro", category: "trabalho", pronunciation: "mâni", example: "I need to save money.", examplePt: "Eu preciso economizar dinheiro.", level: 4, tip: "Usado para comprar coisas." },
  { en: "Meeting", pt: "Reunião", category: "trabalho", pronunciation: "míting", example: "I have a meeting at two.", examplePt: "Eu tenho uma reunião às duas.", level: 4, tip: "Encontro para discutir assuntos." },
  { en: "Phone", pt: "Telefone / Celular", category: "trabalho", pronunciation: "fôun", example: "Where is my phone?", examplePt: "Onde está meu celular?", level: 4, tip: "Aparelho de comunicação." },
  { en: "Email", pt: "E-mail", category: "trabalho", pronunciation: "ímeiol", example: "I will send you an email.", examplePt: "Eu vou te enviar um e-mail.", level: 4, tip: "Mensagem eletrônica." },

  // ===== ROUPAS (Clothes) - Level 4 =====
  { en: "Shirt", pt: "Camisa", category: "roupas", pronunciation: "chârt", example: "I like your shirt.", examplePt: "Eu gosto da sua camisa.", level: 4, tip: "Roupa usada na parte de cima." },
  { en: "Pants", pt: "Calça", category: "roupas", pronunciation: "pénts", example: "I need new pants.", examplePt: "Eu preciso de uma calça nova.", level: 4, tip: "Roupa usada nas pernas." },
  { en: "Shoes", pt: "Sapatos", category: "roupas", pronunciation: "chúz", example: "Where are my shoes?", examplePt: "Onde estão meus sapatos?", level: 4, tip: "Usados nos pés." },
  { en: "Hat", pt: "Chapéu / Boné", category: "roupas", pronunciation: "rét", example: "I wear a hat in the sun.", examplePt: "Eu uso chapéu no sol.", level: 4, tip: "Usado na cabeça." },
  { en: "Dress", pt: "Vestido", category: "roupas", pronunciation: "drés", example: "She is wearing a beautiful dress.", examplePt: "Ela está usando um vestido bonito.", level: 4, tip: "Roupa feminina inteira." },
  { en: "Jacket", pt: "Jaqueta / Casaco", category: "roupas", pronunciation: "djéket", example: "It's cold, wear a jacket.", examplePt: "Está frio, use uma jaqueta.", level: 4, tip: "Roupa para se aquecer." },
  { en: "Socks", pt: "Meias", category: "roupas", pronunciation: "sóks", example: "I need clean socks.", examplePt: "Eu preciso de meias limpas.", level: 4, tip: "Usadas nos pés dentro do sapato." },

  // ===== CORPO HUMANO (Body) - Level 4 =====
  { en: "Head", pt: "Cabeça", category: "corpo", pronunciation: "réd", example: "My head hurts.", examplePt: "Minha cabeça dói.", level: 4, tip: "Parte do corpo onde fica o cérebro." },
  { en: "Eye", pt: "Olho", category: "corpo", pronunciation: "ái", example: "She has blue eyes.", examplePt: "Ela tem olhos azuis.", level: 4, tip: "Órgão da visão." },
  { en: "Ear", pt: "Orelha / Ouvido", category: "corpo", pronunciation: "ír", example: "I hear with my ears.", examplePt: "Eu ouço com meus ouvidos.", level: 4, tip: "Órgão da audição." },
  { en: "Nose", pt: "Nariz", category: "corpo", pronunciation: "nôuz", example: "My nose is cold.", examplePt: "Meu nariz está frio.", level: 4, tip: "Órgão do olfato." },
  { en: "Mouth", pt: "Boca", category: "corpo", pronunciation: "máuth", example: "Open your mouth.", examplePt: "Abra sua boca.", level: 4, tip: "Usada para comer e falar." },
  { en: "Hand", pt: "Mão", category: "corpo", pronunciation: "rénd", example: "Wash your hands.", examplePt: "Lave suas mãos.", level: 4, tip: "Usada para pegar coisas." },
  { en: "Foot", pt: "Pé", category: "corpo", pronunciation: "fút", example: "My foot hurts.", examplePt: "Meu pé dói.", level: 4, tip: "Plural: 'feet'. Usado para andar." },
  { en: "Arm", pt: "Braço", category: "corpo", pronunciation: "árm", example: "I broke my arm.", examplePt: "Eu quebrei meu braço.", level: 4, tip: "Parte do corpo entre ombro e mão." },
  { en: "Leg", pt: "Perna", category: "corpo", pronunciation: "lég", example: "My leg is tired.", examplePt: "Minha perna está cansada.", level: 4, tip: "Usada para andar e correr." },
  { en: "Heart", pt: "Coração", category: "corpo", pronunciation: "rárt", example: "I love you with all my heart.", examplePt: "Eu te amo com todo meu coração.", level: 4, tip: "Órgão que bombeia sangue. Símbolo do amor." },
  { en: "Hair", pt: "Cabelo", category: "corpo", pronunciation: "rér", example: "She has long hair.", examplePt: "Ela tem cabelo longo.", level: 4, tip: "Fios que crescem na cabeça." },
  { en: "Tooth", pt: "Dente", category: "corpo", pronunciation: "túth", example: "Brush your teeth.", examplePt: "Escove seus dentes.", level: 4, tip: "Plural: 'teeth'. Usado para mastigar." },

  // ===== LUGARES (Places) - Level 5 =====
  { en: "Hospital", pt: "Hospital", category: "lugares", pronunciation: "róspitol", example: "She is in the hospital.", examplePt: "Ela está no hospital.", level: 5, tip: "Lugar para cuidar de doentes." },
  { en: "Store", pt: "Loja", category: "lugares", pronunciation: "stór", example: "I go to the store.", examplePt: "Eu vou à loja.", level: 5, tip: "Lugar para comprar coisas." },
  { en: "Restaurant", pt: "Restaurante", category: "lugares", pronunciation: "réstaurant", example: "Let's eat at the restaurant.", examplePt: "Vamos comer no restaurante.", level: 5, tip: "Lugar para comer fora." },
  { en: "Park", pt: "Parque", category: "lugares", pronunciation: "párk", example: "I play in the park.", examplePt: "Eu brinco no parque.", level: 5, tip: "Área verde para lazer." },
  { en: "Beach", pt: "Praia", category: "lugares", pronunciation: "bítch", example: "I love the beach.", examplePt: "Eu amo a praia.", level: 5, tip: "Lugar com areia perto do mar." },
  { en: "Airport", pt: "Aeroporto", category: "lugares", pronunciation: "érport", example: "We are at the airport.", examplePt: "Nós estamos no aeroporto.", level: 5, tip: "Lugar de onde saem os aviões." },
  { en: "Church", pt: "Igreja", category: "lugares", pronunciation: "tchârtch", example: "She goes to church on Sunday.", examplePt: "Ela vai à igreja no domingo.", level: 5, tip: "Lugar de oração." },
  { en: "Bank", pt: "Banco", category: "lugares", pronunciation: "bénk", example: "I go to the bank.", examplePt: "Eu vou ao banco.", level: 5, tip: "Lugar para guardar dinheiro." },
  { en: "Library", pt: "Biblioteca", category: "lugares", pronunciation: "láibreri", example: "I study at the library.", examplePt: "Eu estudo na biblioteca.", level: 5, tip: "Lugar com muitos livros. Cuidado: 'livraria' é 'bookstore'." },
  { en: "Street", pt: "Rua", category: "lugares", pronunciation: "strít", example: "The street is busy.", examplePt: "A rua está movimentada.", level: 5, tip: "Caminho na cidade por onde passam carros." },
  { en: "City", pt: "Cidade", category: "lugares", pronunciation: "síti", example: "I live in a big city.", examplePt: "Eu moro em uma cidade grande.", level: 5, tip: "Área urbana com muitas pessoas." },
  { en: "Country", pt: "País", category: "lugares", pronunciation: "câuntri", example: "Brazil is a big country.", examplePt: "O Brasil é um país grande.", level: 5, tip: "Também pode significar 'campo' (zona rural)." },

  // ===== TRANSPORTES (Transport) - Level 5 =====
  { en: "Car", pt: "Carro", category: "transportes", pronunciation: "cár", example: "I go by car.", examplePt: "Eu vou de carro.", level: 5, tip: "Veículo com quatro rodas." },
  { en: "Bus", pt: "Ônibus", category: "transportes", pronunciation: "bâs", example: "I take the bus to school.", examplePt: "Eu pego ônibus para a escola.", level: 5, tip: "Transporte público grande." },
  { en: "Bicycle", pt: "Bicicleta", category: "transportes", pronunciation: "báisikol", example: "I ride my bicycle.", examplePt: "Eu ando de bicicleta.", level: 5, tip: "Veículo com duas rodas e pedais." },
  { en: "Train", pt: "Trem", category: "transportes", pronunciation: "trêin", example: "The train is fast.", examplePt: "O trem é rápido.", level: 5, tip: "Viaja em trilhos." },
  { en: "Airplane", pt: "Avião", category: "transportes", pronunciation: "érplein", example: "I fly by airplane.", examplePt: "Eu viajo de avião.", level: 5, tip: "'Air' (ar) + 'plane' (plano) = avião." },
  { en: "Boat", pt: "Barco", category: "transportes", pronunciation: "bôut", example: "The boat is on the water.", examplePt: "O barco está na água.", level: 5, tip: "Veículo que anda na água." },
  { en: "Taxi", pt: "Táxi", category: "transportes", pronunciation: "téksi", example: "Let's take a taxi.", examplePt: "Vamos pegar um táxi.", level: 5, tip: "Carro particular de transporte." },

  // ===== VERBOS BÁSICOS (Verbs) - Level 5 =====
  { en: "To be", pt: "Ser / Estar", category: "verbos", pronunciation: "tu bí", example: "I am happy.", examplePt: "Eu estou feliz.", level: 5, tip: "O verbo mais importante do inglês." },
  { en: "To have", pt: "Ter", category: "verbos", pronunciation: "tu rév", example: "I have a dog.", examplePt: "Eu tenho um cachorro.", level: 5, tip: "Indica posse." },
  { en: "To go", pt: "Ir", category: "verbos", pronunciation: "tu gôu", example: "I go to school.", examplePt: "Eu vou à escola.", level: 5, tip: "Indica movimento." },
  { en: "To eat", pt: "Comer", category: "verbos", pronunciation: "tu ít", example: "I eat breakfast at seven.", examplePt: "Eu como café da manhã às sete.", level: 5, tip: "Ação de comer alimento." },
  { en: "To drink", pt: "Beber", category: "verbos", pronunciation: "tu drínk", example: "I drink water.", examplePt: "Eu bebo água.", level: 5, tip: "Ação de beber líquido." },
  { en: "To sleep", pt: "Dormir", category: "verbos", pronunciation: "tu slíp", example: "I sleep eight hours.", examplePt: "Eu durmo oito horas.", level: 5, tip: "Descansar de olhos fechados." },
  { en: "To read", pt: "Ler", category: "verbos", pronunciation: "tu ríd", example: "I read books.", examplePt: "Eu leio livros.", level: 5, tip: "O passado é 'read' (réd)." },
  { en: "To write", pt: "Escrever", category: "verbos", pronunciation: "tu ráit", example: "I write in my notebook.", examplePt: "Eu escrevo no meu caderno.", level: 5, tip: "O 'w' é mudo." },
  { en: "To speak", pt: "Falar", category: "verbos", pronunciation: "tu spík", example: "I speak Portuguese.", examplePt: "Eu falo português.", level: 5, tip: "Ação de usar a voz." },
  { en: "To listen", pt: "Ouvir / Escutar", category: "verbos", pronunciation: "tu lísen", example: "Listen to the music.", examplePt: "Escute a música.", level: 5, tip: "Prestar atenção ao som." },
  { en: "To see", pt: "Ver", category: "verbos", pronunciation: "tu sí", example: "I see the stars.", examplePt: "Eu vejo as estrelas.", level: 5, tip: "Usar os olhos." },
  { en: "To like", pt: "Gostar", category: "verbos", pronunciation: "tu láik", example: "I like pizza.", examplePt: "Eu gosto de pizza.", level: 5, tip: "Ter apreço por algo." },
  { en: "To love", pt: "Amar", category: "verbos", pronunciation: "tu lâv", example: "I love my family.", examplePt: "Eu amo minha família.", level: 5, tip: "Sentimento mais forte que 'like'." },
  { en: "To want", pt: "Querer", category: "verbos", pronunciation: "tu uónt", example: "I want coffee.", examplePt: "Eu quero café.", level: 5, tip: "Desejar algo." },
  { en: "To need", pt: "Precisar", category: "verbos", pronunciation: "tu níd", example: "I need help.", examplePt: "Eu preciso de ajuda.", level: 5, tip: "Necessitar de algo." },
  { en: "To know", pt: "Saber / Conhecer", category: "verbos", pronunciation: "tu nôu", example: "I know the answer.", examplePt: "Eu sei a resposta.", level: 5, tip: "O 'k' é mudo." },
  { en: "To make", pt: "Fazer / Preparar", category: "verbos", pronunciation: "tu mêik", example: "I make breakfast.", examplePt: "Eu faço o café da manhã.", level: 5, tip: "Criar ou produzir algo." },
  { en: "To come", pt: "Vir", category: "verbos", pronunciation: "tu câm", example: "Come here, please.", examplePt: "Venha aqui, por favor.", level: 5, tip: "Mover-se para perto de alguém." },
  { en: "To play", pt: "Brincar / Jogar / Tocar", category: "verbos", pronunciation: "tu plêi", example: "I play soccer.", examplePt: "Eu jogo futebol.", level: 5, tip: "Pode ser brincar, jogar ou tocar instrumento." },
  { en: "To run", pt: "Correr", category: "verbos", pronunciation: "tu rân", example: "I run every morning.", examplePt: "Eu corro toda manhã.", level: 5, tip: "Mover-se rapidamente." },
  { en: "To walk", pt: "Andar / Caminhar", category: "verbos", pronunciation: "tu uók", example: "I walk to school.", examplePt: "Eu ando até a escola.", level: 5, tip: "O 'l' é mudo." },
  { en: "To open", pt: "Abrir", category: "verbos", pronunciation: "tu ôupen", example: "Open the door.", examplePt: "Abra a porta.", level: 5, tip: "Oposto de 'close' (fechar)." },
  { en: "To close", pt: "Fechar", category: "verbos", pronunciation: "tu clôuz", example: "Close the window.", examplePt: "Feche a janela.", level: 5, tip: "Oposto de 'open' (abrir)." },
  { en: "To buy", pt: "Comprar", category: "verbos", pronunciation: "tu bái", example: "I want to buy a book.", examplePt: "Eu quero comprar um livro.", level: 5, tip: "Trocar dinheiro por algo." },
  { en: "To help", pt: "Ajudar", category: "verbos", pronunciation: "tu rélp", example: "Can you help me?", examplePt: "Você pode me ajudar?", level: 5, tip: "Dar assistência a alguém." },
  { en: "To study", pt: "Estudar", category: "verbos", pronunciation: "tu stâdi", example: "I study English every day.", examplePt: "Eu estudo inglês todo dia.", level: 5, tip: "Aprender por meio de leitura e prática." },
  { en: "To cook", pt: "Cozinhar", category: "verbos", pronunciation: "tu cúk", example: "I cook dinner.", examplePt: "Eu cozinho o jantar.", level: 5, tip: "Preparar comida usando calor." },
  { en: "To give", pt: "Dar", category: "verbos", pronunciation: "tu guív", example: "Give me the book.", examplePt: "Me dê o livro.", level: 5, tip: "Entregar algo a alguém." },
  { en: "To take", pt: "Pegar / Levar", category: "verbos", pronunciation: "tu têik", example: "Take your umbrella.", examplePt: "Leve seu guarda-chuva.", level: 5, tip: "Pegar ou levar algo." },
  { en: "To think", pt: "Pensar", category: "verbos", pronunciation: "tu thínk", example: "I think you are right.", examplePt: "Eu acho que você está certo.", level: 5, tip: "Usar a mente." },

  // ===== SENTIMENTOS (Feelings) - Level 6 =====
  { en: "Happy", pt: "Feliz", category: "sentimentos", pronunciation: "répi", example: "I am very happy today.", examplePt: "Eu estou muito feliz hoje.", level: 6, tip: "Sentimento de alegria." },
  { en: "Sad", pt: "Triste", category: "sentimentos", pronunciation: "séd", example: "She is sad.", examplePt: "Ela está triste.", level: 6, tip: "Oposto de 'happy'." },
  { en: "Angry", pt: "Irritado / Com raiva", category: "sentimentos", pronunciation: "éngri", example: "He is angry.", examplePt: "Ele está com raiva.", level: 6, tip: "Sentimento de raiva." },
  { en: "Tired", pt: "Cansado(a)", category: "sentimentos", pronunciation: "táierd", example: "I am tired after work.", examplePt: "Eu estou cansado(a) depois do trabalho.", level: 6, tip: "Sentimento de cansaço." },
  { en: "Hungry", pt: "Com fome", category: "sentimentos", pronunciation: "rângri", example: "I am hungry.", examplePt: "Eu estou com fome.", level: 6, tip: "Quando o estômago precisa de comida." },
  { en: "Thirsty", pt: "Com sede", category: "sentimentos", pronunciation: "thârsti", example: "I am thirsty.", examplePt: "Eu estou com sede.", level: 6, tip: "Quando o corpo precisa de água." },
  { en: "Scared", pt: "Com medo / Assustado", category: "sentimentos", pronunciation: "skérd", example: "I am scared of snakes.", examplePt: "Eu tenho medo de cobras.", level: 6, tip: "Sentimento de medo." },
  { en: "Sick", pt: "Doente", category: "sentimentos", pronunciation: "sík", example: "I am sick today.", examplePt: "Eu estou doente hoje.", level: 6, tip: "Quando não está se sentindo bem." },
  { en: "Cold", pt: "Frio / Com frio", category: "sentimentos", pronunciation: "côuld", example: "I am cold.", examplePt: "Eu estou com frio.", level: 6, tip: "Sensação de baixa temperatura." },
  { en: "Hot", pt: "Quente / Com calor", category: "sentimentos", pronunciation: "rót", example: "It is very hot today.", examplePt: "Está muito quente hoje.", level: 6, tip: "Sensação de alta temperatura." },
  { en: "Excited", pt: "Empolgado(a)", category: "sentimentos", pronunciation: "eksáited", example: "I am excited about the trip.", examplePt: "Eu estou empolgado(a) com a viagem.", level: 6, tip: "Sentimento de grande entusiasmo." },
  { en: "Nervous", pt: "Nervoso(a)", category: "sentimentos", pronunciation: "nârvos", example: "I am nervous about the test.", examplePt: "Eu estou nervoso(a) com a prova.", level: 6, tip: "Ansiedade antes de algo importante." },
  { en: "Surprised", pt: "Surpreso(a)", category: "sentimentos", pronunciation: "surpráizd", example: "I am surprised!", examplePt: "Eu estou surpreso(a)!", level: 6, tip: "Reação ao inesperado." },
  { en: "Bored", pt: "Entediado(a)", category: "sentimentos", pronunciation: "bórd", example: "I am bored.", examplePt: "Eu estou entediado(a).", level: 6, tip: "Sem nada interessante para fazer." },
  { en: "Proud", pt: "Orgulhoso(a)", category: "sentimentos", pronunciation: "práud", example: "I am proud of you.", examplePt: "Eu estou orgulhoso(a) de você.", level: 6, tip: "Sentimento de satisfação pessoal." },

  // ===== PERGUNTAS COMUNS (Common Questions) - Level 6 =====
  { en: "What?", pt: "O quê?", category: "perguntas", pronunciation: "uót", example: "What is your name?", examplePt: "Qual é o seu nome?", level: 6, tip: "Pergunta sobre coisas." },
  { en: "Where?", pt: "Onde?", category: "perguntas", pronunciation: "uér", example: "Where do you live?", examplePt: "Onde você mora?", level: 6, tip: "Pergunta sobre lugar." },
  { en: "When?", pt: "Quando?", category: "perguntas", pronunciation: "uén", example: "When is your birthday?", examplePt: "Quando é seu aniversário?", level: 6, tip: "Pergunta sobre tempo." },
  { en: "Who?", pt: "Quem?", category: "perguntas", pronunciation: "rú", example: "Who is your teacher?", examplePt: "Quem é seu(sua) professor(a)?", level: 6, tip: "Pergunta sobre pessoas." },
  { en: "Why?", pt: "Por quê?", category: "perguntas", pronunciation: "uái", example: "Why are you sad?", examplePt: "Por que você está triste?", level: 6, tip: "Pergunta sobre motivo." },
  { en: "How?", pt: "Como?", category: "perguntas", pronunciation: "ráu", example: "How are you?", examplePt: "Como você está?", level: 6, tip: "Pergunta sobre maneira." },
  { en: "How much?", pt: "Quanto? (preço)", category: "perguntas", pronunciation: "ráu mâtch", example: "How much is this?", examplePt: "Quanto custa isso?", level: 6, tip: "Para perguntar preço ou quantidade incontável." },
  { en: "How many?", pt: "Quantos(as)?", category: "perguntas", pronunciation: "ráu méni", example: "How many brothers do you have?", examplePt: "Quantos irmãos você tem?", level: 6, tip: "Para perguntar quantidade contável." },
  { en: "What time?", pt: "Que horas?", category: "perguntas", pronunciation: "uót táim", example: "What time is it?", examplePt: "Que horas são?", level: 6, tip: "Pergunta sobre horário." },
  { en: "Do you like?", pt: "Você gosta?", category: "perguntas", pronunciation: "du iú láik", example: "Do you like chocolate?", examplePt: "Você gosta de chocolate?", level: 6, tip: "Para perguntar sobre gostos." },
  { en: "Can you?", pt: "Você pode?", category: "perguntas", pronunciation: "kén iú", example: "Can you help me?", examplePt: "Você pode me ajudar?", level: 6, tip: "Para pedir algo ou perguntar sobre habilidade." },

  // ===== FRASES DO COTIDIANO (Daily Phrases) - Level 7 =====
  { en: "I don't know", pt: "Eu não sei", category: "frases", pronunciation: "ái dôunt nôu", example: "I don't know the answer.", examplePt: "Eu não sei a resposta.", level: 7, tip: "Expressa falta de conhecimento." },
  { en: "I don't understand", pt: "Eu não entendo", category: "frases", pronunciation: "ái dôunt andersténd", example: "I don't understand this word.", examplePt: "Eu não entendo esta palavra.", level: 7, tip: "Use quando não compreender algo." },
  { en: "Can you repeat?", pt: "Pode repetir?", category: "frases", pronunciation: "kén iú ripít", example: "Can you repeat, please?", examplePt: "Pode repetir, por favor?", level: 7, tip: "Pedir para alguém falar de novo." },
  { en: "I'm learning English", pt: "Estou aprendendo inglês", category: "frases", pronunciation: "aim lârning ínglish", example: "I'm learning English at home.", examplePt: "Estou aprendendo inglês em casa.", level: 7, tip: "Frase útil para iniciantes!" },
  { en: "Nice to meet you", pt: "Prazer em conhecê-lo(a)", category: "frases", pronunciation: "náis tu mít iú", example: "Hi! Nice to meet you.", examplePt: "Oi! Prazer em conhecê-lo(a).", level: 7, tip: "Usada ao conhecer alguém novo." },
  { en: "See you later", pt: "Até mais tarde", category: "frases", pronunciation: "sí iú lêiter", example: "Bye! See you later.", examplePt: "Tchau! Até mais tarde.", level: 7, tip: "Despedida informal." },
  { en: "Have a nice day", pt: "Tenha um bom dia", category: "frases", pronunciation: "rév a náis dêi", example: "Goodbye! Have a nice day!", examplePt: "Tchau! Tenha um bom dia!", level: 7, tip: "Desejo positivo ao se despedir." },
  { en: "I'm going home", pt: "Estou indo para casa", category: "frases", pronunciation: "aim gôing hôum", example: "It's late, I'm going home.", examplePt: "Está tarde, estou indo para casa.", level: 7, tip: "'Going' indica ação em progresso." },
  { en: "What are you doing?", pt: "O que você está fazendo?", category: "frases", pronunciation: "uót ar iú dúing", example: "Hey! What are you doing?", examplePt: "Ei! O que você está fazendo?", level: 7, tip: "Pergunta sobre atividade atual." },
  { en: "I like it", pt: "Eu gosto disso", category: "frases", pronunciation: "ái láik it", example: "This is good, I like it.", examplePt: "Isso é bom, eu gosto disso.", level: 7, tip: "'It' substitui a coisa mencionada." },
  { en: "Let's go", pt: "Vamos lá", category: "frases", pronunciation: "léts gôu", example: "Let's go to the park!", examplePt: "Vamos ao parque!", level: 7, tip: "Convite para fazer algo juntos." },
  { en: "I'm sorry", pt: "Me desculpe", category: "frases", pronunciation: "aim sóri", example: "I'm sorry for being late.", examplePt: "Me desculpe por estar atrasado(a).", level: 7, tip: "Mais formal que apenas 'sorry'." },
  { en: "Excuse me", pt: "Com licença", category: "frases", pronunciation: "ekskiúz mi", example: "Excuse me, where is the bathroom?", examplePt: "Com licença, onde fica o banheiro?", level: 7, tip: "Usada para chamar atenção educadamente." },
  { en: "Of course", pt: "Claro / Com certeza", category: "frases", pronunciation: "óv córs", example: "Can you help me? Of course!", examplePt: "Pode me ajudar? Claro!", level: 7, tip: "Afirmação positiva e enfática." },
  { en: "I think so", pt: "Eu acho que sim", category: "frases", pronunciation: "ái thínk sôu", example: "Is it going to rain? I think so.", examplePt: "Vai chover? Eu acho que sim.", level: 7, tip: "Expressa opinião incerta." },
  { en: "Wait a moment", pt: "Espere um momento", category: "frases", pronunciation: "uêit a môument", example: "Wait a moment, please.", examplePt: "Espere um momento, por favor.", level: 7, tip: "Pedir paciência." },
  { en: "That's great", pt: "Que ótimo", category: "frases", pronunciation: "déts grêit", example: "You passed the test? That's great!", examplePt: "Você passou na prova? Que ótimo!", level: 7, tip: "Expressa entusiasmo." },
  { en: "No problem", pt: "Sem problema", category: "frases", pronunciation: "nôu próblem", example: "Thank you! No problem!", examplePt: "Obrigado(a)! Sem problema!", level: 7, tip: "Resposta para 'obrigado' ou 'desculpa'." },
  { en: "I need help", pt: "Eu preciso de ajuda", category: "frases", pronunciation: "ái níd rélp", example: "I need help with my homework.", examplePt: "Eu preciso de ajuda com minha lição.", level: 7, tip: "'Need' = precisar, 'help' = ajuda." },
  { en: "It's time to go", pt: "É hora de ir", category: "frases", pronunciation: "its táim tu gôu", example: "It's late, it's time to go.", examplePt: "Está tarde, é hora de ir.", level: 7, tip: "Indica que o momento de partir chegou." },
];

// Helper function to get words by category
export const getWordsByCategory = (category) => {
  return words.filter(w => w.category === category);
};

// Helper function to get words by level
export const getWordsByLevel = (level) => {
  return words.filter(w => w.level <= level);
};

// Helper function to get random words
export const getRandomWords = (count, excludeIds = []) => {
  const available = words.filter((_, i) => !excludeIds.includes(i));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper to shuffle array
export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
