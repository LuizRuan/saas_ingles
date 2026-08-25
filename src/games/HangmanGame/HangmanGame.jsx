import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import { useProgress } from '../../hooks/useProgress';
import useCourseData from '../../hooks/useCourseData';
import useUserLevel from '../../hooks/useUserLevel';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import { pickOneByLevel } from '../../utils/levelSelection';
import { GAME_REWARDS } from '../../utils/scoring';
import './HangmanGame.css';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Categorias que fazem sentido no jogo (as abstratas — verbos, sentimentos,
// perguntas — não dão uma palavra boa pra adivinhar letra a letra).
const CATEGORIAS_DO_JOGO = ['animais', 'comidas', 'cores', 'familia', 'casa', 'escola', 'corpo', 'roupas', 'bebidas', 'cumprimentos', 'numeros'];

// Uma palavra é jogável se dá pra adivinhar: 3+ letras e sem espaço.
const jogaveisDe = (words, catId) =>
  words.filter(w => w.category === catId && w.en.length >= 3 && !w.en.includes(' '));

const tipPtMap = {
  // === ANIMAIS ===
  "Dog": "Tem sido nosso companheiro leal há 15.000 anos. Um único farejo diz mais a ele sobre você do que qualquer documento de identidade.",
  "Cat": "Os antigos egípcios o adoravam como divino. Ele consegue se desvirar no ar e sempre cai em pé da mesma forma.",
  "Bird": "A maioria das criaturas da sua classe domina os céus, embora duas famosas — o pinguim e a avestruz — nunca saiam do chão.",
  "Fish": "Passa a vida inteira respirando algo em que outras criaturas se afogariam. Seu plural em inglês é idêntico ao singular.",
  "Horse": "Antes dos motores existirem, seu nome se tornou a unidade usada para medir a potência deles.",
  "Cow": "Seu estômago tem quatro compartimentos e ele mastiga por até oito horas por dia. Civilizações inteiras construíram sua riqueza ao redor dele.",
  "Pig": "Ao contrário de sua reputação, é um dos animais de fazenda mais limpos. Rolar na lama é apenas como ele regula sua temperatura.",
  "Chicken": "Cruzou a estrada muito antes de alguém perguntar o porquê. Tanto sua forma de ovo quanto sua forma adulta estrelam frases famosas em inglês.",
  "Duck": "Suas penas repelem água como se fossem enceradas. A frase 'como água nas costas de um pato' significa críticas que simplesmente não pegam.",
  "Rabbit": "Aparece em chapéus de mágicos e tradições de Páscoa. Na ficção, já guiou uma garota a um mundo fantástico no subsolo.",
  "Lion": "Apesar de ser chamado de rei da selva, ele na verdade evita selvas. Prefere a savana aberta — e as fêmeas fazem a maior parte da caça.",
  "Elephant": "A maior criatura terrestre da Terra. É o único animal conhecido por lamentar a morte de seus entes queridos, permanecendo em silêncio sobre seus restos mortais.",
  "Monkey": "O parente mais famoso de Darwin. Consegue descascar sua comida favorita pelo lado de baixo — o lado que evita os fiapos.",
  "Bear": "Ele dorme por meses sem comer, mas acorda bem. As crianças têm uma versão de pelúcia dele com o nome de um presidente americano.",
  "Snake": "Não tem pálpebras e não consegue piscar. Na história do Jardim do Éden, mudou tudo com uma conversa decisiva.",
  "Frog": "Passa o início da vida respirando debaixo d'água como uma criatura completamente diferente. Sua pele é um barômetro vivo da saúde ambiental.",
  "Butterfly": "Dentro do casulo, ele se dissolve completamente em líquido antes de se reconstruir em algo totalmente diferente.",
  "Turtle": "Carrega sua casa para todo lugar — e seu esqueleto é fundido a essa casa. Algumas espécies vivem mais que seus donos humanos por um século.",
  "Spider": "Uma criatura de oito patas que tece teias de seda para capturar insetos. É um aracnídeo, não um inseto!",
  "Bat": "O único mamífero que realmente voa! Ele dorme de cabeça para baixo durante o dia e usa som para 'ver' no escuro.",
  "Owl": "Uma ave que caça à noite com olhos enormes para ver no escuro. Ela faz o som 'piu' e consegue girar a cabeça quase toda a volta!",
  "Bee": "Um inseto voador que produz mel e poliniza flores. Vive em uma colmeia com milhares de outras abelhas. Sua picada dói!",
  "Ant": "Não tem pulmões e respira por pequenos buracos no corpo. Uma única colônia pode mover toneladas de terra para construir uma cidade oculta.",
  "Chameleon": "Um lagarto famoso por mudar de cor para se esconder ou se comunicar. Ele também tem olhos que se movem independentemente um do outro!",
  "Tiger": "O maior felino selvagem do mundo, conhecido por sua pelagem listrada.",
  "Wolf": "Um parente selvagem do cão que vive e caça em alcateias.",
  "Fox": "Conhecida em histórias ao redor do mundo por ser esperta e astuta.",
  "Deer": "Seu plural em inglês também é 'deer' — sem precisar adicionar 's'!",
  "Sheep": "Singular e plural são a mesma palavra em inglês: 'one sheep', 'two sheep'.",
  "Goat": "Um animal de fazenda conhecido por comer quase tudo e escalar muito bem.",
  "Mouse": "O plural em inglês é 'mice', e não 'mouses' — um plural irregular!",
  "Shark": "Um poderoso predador do oceano com fileiras de dentes afiados.",
  "Whale": "O maior animal que já existiu na Terra — ainda maior que qualquer dinossauro.",
  "Dolphin": "Mamífero marinho altamente inteligente que se comunica por assobios e cliques.",
  "Eagle": "Ave de rapina com visão aguçada, símbolo de muitos países.",
  "Penguin": "Ave que não voa, excelente nadadora e vive em climas frios.",
  "Giraffe": "O animal mais alto da Terra, com um pescoço longo para alcançar folhas altas.",
  "Zebra": "Animal africano com listras pretas e brancas únicas em cada indivíduo.",
  "Kangaroo": "Marsupial australiano que se locomove aos saltos e carrega os filhotes na bolsa.",
  "Crocodile": "Grande réptil semiaquático que existe desde a época dos dinossauros.",
  "Parrot": "Ave colorida e inteligente, capaz de imitar sons e a fala humana.",

  // === COMIDAS E BEBIDAS ===
  "Water": "Essencial para toda a vida. Cobre mais de 70% da superfície da Terra.",
  "Apple": "Fruta que cresce em árvores. Dizem que comer uma por dia mantém o médico longe!",
  "Bread": "Alimento básico feito de farinha e água, assado no forno.",
  "Cheese": "Feito de leite. Ratos adoram, e humanos colocam na pizza!",
  "Coffee": "Uma bebida escura popular feita de grãos torrados que te ajuda a acordar.",
  "Tea": "Uma bebida quente feita ao infusionar folhas secas em água quente.",
  "Milk": "Um líquido branco produzido por vacas, rico em cálcio para ossos fortes.",
  "Pizza": "Um famoso prato italiano com base de massa redonda coberta com queijo e molho de tomate.",
  "Rice": "Alimento básico consumido por mais de metade da população mundial diariamente.",
  "Egg": "Posto por galinhas e outros animais. Versátil na culinária.",
  "Meat": "Carne de animais consumida como alimento.",
  "Fish": "Alimento rico em proteínas e ômega 3, capturado em rios e oceanos.",
  "Soup": "Prato líquido quente feito cozinhando carne, vegetais ou grãos em água.",
  "Salt": "O mineral mais usado na culinária do mundo para realçar sabores e preservar alimentos.",
  "Sugar": "Substância doce extraída da cana ou beterraba, usada em sobremesas.",
  "Butter": "Feita batendo o creme de leite até virar uma pasta sólida e cremosa.",
  "Juice": "Líquido natural extraído de frutas ou vegetais.",
  "Cake": "Sobremesa assada e doce, muito popular em festas de aniversário.",
  "Salad": "Prato frio feito de vegetais crus misturados, comum como entrada saudável.",
  "Banana": "Fruta amarela e curva rica em potássio, que vem em sua própria 'embalagem' natural.",
  "Orange": "Fruta cítrica que dá nome à própria cor e é rica em vitamina C.",
  "Potato": "Tubérculo cultivado no solo, base para batatas fritas e purês.",
  "Tomato": "Botanicamente é uma fruta, mas tratado como vegetal na culinária.",
  "Onion": "Vegetal em camadas que faz cozinheiros chorarem ao ser cortado.",
  "Garlic": "Tempero com cheiro marcante, conhecido por afastar vampiros no folclore.",
  "Beer": "Uma das bebidas fermentadas mais antigas do mundo, feita de cereais.",
  "Wine": "Bebida alcoólica milenar feita pela fermentação de uvas.",
  "Soda": "Bebida doce e gaseificada muito popular.",
  "Chocolate": "Feito a partir das amêndoas do cacau, adorado no mundo todo.",
  "Sandwich": "Nomeado em homenagem ao Conde de Sandwich, que queria comer sem sujar as mãos.",
  "Pasta": "Prato italiano clássico feito de sêmola e água, em formatos como espaguete.",
  "Cookie": "Biscoito doce crocante ou macio, muitas vezes com gotas de chocolate.",

  // === CORES ===
  "Red": "A cor do fogo, do sangue e das placas de pare.",
  "Blue": "A cor do céu limpo e dos oceanos profundos.",
  "Green": "A cor das folhas das plantas, da grama e da natureza.",
  "Yellow": "A cor brilhante do sol, dos girassóis e das bananas maduras.",
  "Black": "A ausência total de luz. O oposto do branco.",
  "White": "A cor da neve fresca, das nuvens e do leite.",
  "Orange": "A cor intermediária entre o vermelho e o amarelo, como o pôr do sol.",
  "Pink": "Mistura suave de vermelho com branco, cor comum em flores.",
  "Purple": "Historicamente a cor da realeza, feita misturando azul e vermelho.",
  "Brown": "A cor da terra, dos troncos das árvores e do chocolate.",
  "Gray": "A cor das nuvens de chuva, do concreto e das cinzas.",

  // === CORPO HUMANO ===
  "Head": "A parte superior do corpo onde ficam o cérebro, o rosto e o cabelo.",
  "Eye": "Detecta a luz e envia sinais ao cérebro 60 vezes por segundo. Os humanos confiam nele mais do que em qualquer outro sentido.",
  "Ear": "O órgão usado para ouvir sons. Também é fundamental para o equilíbrio do corpo.",
  "Nose": "O órgão do olfato e da respiração. Localizado bem no centro do rosto.",
  "Mouth": "Usada para comer, beber e falar. Contém os dentes e a língua.",
  "Hand": "Tem cinco dedos. Fica na ponta do braço. Usada para segurar objetos, escrever e acenar.",
  "Foot": "Seu plural em inglês é irregular: 'feet'. Fica na ponta da perna e é usado para caminhar.",
  "Arm": "O membro que vai do ombro até a mão. Usado para carregar coisas e abraçar pessoas.",
  "Leg": "O membro que vai do quadril até o pé. Usado para caminhar, correr e chutar.",
  "Heart": "Bate cerca de 100.000 vezes por dia sem você precisar pedir. Bombeia sangue para o corpo todo.",
  "Hair": "Cresce cerca de 15 centímetros por ano e é composto por 90% de proteína.",
  "Tooth": "Os adultos têm 32 deles. A primeira dentição cai e é substituída por dentes permanentes.",
  "Tongue": "Consegue sentir sabores, ajudar na fala e na deglutição, tudo ao mesmo tempo.",
  "Blood": "É vermelho porque carrega oxigênio. Circula cerca de 19.000 quilômetros pelo corpo diariamente.",
  "Brain": "Gera cerca de 23 watts de energia e processa cerca de 11 milhões de bits de informação por segundo.",
  "Skin": "O maior órgão do corpo humano e o único que você pode ver por fora por completo.",
  "Bone": "O corpo humano adulto tem 206 deles. São estruturas vivas que sustentam nosso corpo.",
  "Lung": "Você tem dois e eles nunca param — mesmo enquanto você dorme, processando litros de ar.",
  "Shoulder": "A articulação que conecta o braço ao tronco. A expressão 'cold shoulder' significa ignorar alguém.",
  "Elbow": "A articulação central do braço que permite dobrá-lo.",
  "Knee": "A articulação que permite dobrar a perna. A letra 'k' em inglês é muda (pronuncia-se 'ní').",
  "Neck": "A parte do corpo que conecta a cabeça ao restante do tronco.",
  "Chin": "A parte inferior do rosto, logo abaixo da boca.",
  "Finger": "Cada um dos dígitos da mão; a palavra em inglês para o dedo do pé é 'toe'.",
  "Thumb": "O dedo polegar da mão. A letra 'b' no final da palavra em inglês é muda.",
  "Toe": "O equivalente a 'dedo', mas especificamente para os dedos dos pés.",
  "Ankle": "A articulação que conecta a perna ao pé.",
  "Wrist": "A articulação que conecta o antebraço à mão, onde se usa relógio.",
  "Hip": "A região do quadril que conecta a pelve às coxas.",
  "Waist": "A parte estreita do tronco humano entre as costelas e os quadris, onde se coloca o cinto.",
  "Chest": "A parte superior frontal do tronco que protege o coração e os pulmões.",
  "Back": "A parte posterior do tronco humano, que vai dos ombros até o quadril.",
  "Spine": "A coluna vertebral que sustenta o corpo e protege a medula espinhal.",
  "Muscle": "Tecido do corpo responsável por produzir força e movimento.",
  "Nerve": "Feixe de fibras que transmite impulsos sensoriais e motores por todo o corpo.",
  "Vein": "Vaso sanguíneo que transporta o sangue de volta ao coração.",
  "Artery": "Vaso sanguíneo que transporta o sangue oxigenado para longe do coração.",
  "Liver": "O fígado, órgão vital que filtra toxinas do sangue e produz bile.",
  "Kidney": "Os rins, responsáveis por filtrar os resíduos do sangue e produzir urina.",
  "Stomach": "Órgão do sistema digestivo onde os alimentos são processados pelos ácidos gástricos.",
  "Eyebrow": "A faixa de pelos localizada logo acima de cada olho na testa.",
  "Eyelash": "Os pelos finos na borda das pálpebras que protegem os olhos de poeira.",
  "Cheek": "A parte carnuda e lateral do rosto, abaixo dos olhos.",
  "Forehead": "A parte superior da face, localizada acima dos olhos e abaixo do cabelo.",
  "Jaw": "A estrutura óssea da boca onde os dentes estão fixados.",
  "Fingernail": "A lâmina protetora rígida que cobre a ponta dos dedos das mãos.",
  "Lip": "Cada uma das duas dobras carnosas que contornam a abertura da boca.",
  "Throat": "A passagem interna no pescoço que leva ar aos pulmões e comida ao estômago.",

  // === FAMÍLIA ===
  "Mother": "A figura materna que dá à luz ou cria um filho com dedicação e carinho.",
  "Father": "A figura paterna na família, que cria e orienta os filhos.",
  "Brother": "Um indivíduo do sexo masculino em relação aos outros filhos dos mesmos pais.",
  "Sister": "Um indivíduo do sexo feminino em relação aos outros filhos dos mesmos pais.",
  "Baby": "Uma criança muito jovem, nos primeiros meses de vida.",
  "Son": "Um filho do sexo masculino em relação aos seus pais.",
  "Daughter": "Uma filha do sexo feminino em relação aos seus pais.",
  "Uncle": "O irmão da sua mãe ou do seu pai, ou o marido da sua tia.",
  "Aunt": "A irmã da sua mãe ou do seu pai, ou a esposa do seu tio.",
  "Cousin": "O filho ou filha do seu tio ou da sua tia.",
  "Grandfather": "O pai do seu pai ou da sua mãe.",
  "Grandmother": "A mãe do seu pai ou da sua mãe.",
  "Parents": "O conjunto formado por pai e mãe.",
  "Family": "O grupo de pessoas unidas por laços de sangue, parentesco ou adoção.",

  // === CASA ===
  "House": "Uma construção feita para servir de moradia a uma ou mais pessoas.",
  "Home": "O lugar de acolhimento onde alguém reside, com valor emocional e familiar.",
  "Room": "Um cômodo ou espaço dividido dentro de uma casa.",
  "Door": "A estrutura móvel usada para abrir e fechar a entrada de um cômodo ou casa.",
  "Window": "Abertura na parede com vidro que permite a entrada de luz e ar fresco.",
  "Bed": "Móvel confortável projetado para dormir e descansar.",
  "Table": "Móvel com superfície plana horizontal sustentada por pernas, para refeições ou trabalho.",
  "Chair": "Assento individual com encosto para uma pessoa se sentar.",
  "Kitchen": "O cômodo da casa onde as refeições são preparadas e cozinhadas.",
  "Bathroom": "O cômodo da casa com chuveiro, pia e vaso sanitário para higiene pessoal.",
  "Sofa": "Móvel estofado confortável para várias pessoas se sentarem na sala.",
  "Lamp": "Dispositivo elétrico que produz luz para iluminar um ambiente.",
  "Wall": "Estrutura vertical que delimita e divide os cômodos de uma construção.",
  "Floor": "A superfície inferior de um cômodo sobre a qual se caminha.",
  "Roof": "A cobertura protetora superior de um edifício ou casa.",
  "Garden": "Área externa com plantas, flores ou gramado para cultivo e lazer.",
  "Key": "Objeto de metal com ranhuras usado para abrir e trancar fechaduras.",
  "Desk": "Mesa de trabalho ou estudo, muitas vezes com gavetas.",
  "Mirror": "Superfície de vidro reflexiva que mostra a imagem de quem está diante dela.",
  "Clock": "Instrumento usado para medir e indicar as horas do dia.",
  "Blanket": "Peça de tecido grosso usada na cama para aquecer durante o sono.",
  "Pillow": "Almofada macia usada para apoiar a cabeça ao dormir.",
  "Furniture": "Substantivo incontável em inglês que se refere ao conjunto de móveis de uma casa.",

  // === ESCOLA ===
  "School": "Instituição onde estudantes aprendem com professores em salas de aula.",
  "Book": "Conjunto de páginas impressas e encadernadas contendo histórias ou conhecimento.",
  "Pen": "Instrumento de escrita que utiliza tinta líquida permanente.",
  "Pencil": "Instrumento de escrita feito de madeira com grafite no interior, que pode ser apagado.",
  "Paper": "Material fino em folhas feito de celulose, usado para escrever e desenhar.",
  "Teacher": "Profissional dedicado a ensinar alunos e transmitir conhecimento.",
  "Student": "Pessoa que estuda em uma escola, curso ou universidade.",
  "Class": "Grupo de alunos reunidos para aprender uma matéria ou aula.",
  "Lesson": "Uma sessão de aprendizado ou instrução sobre um assunto específico.",
  "Blackboard": "Quadro escuro tradicional onde se escreve com giz em salas de aula.",
  "Notebook": "Caderno de folhas encadernadas para anotações e exercícios escolares.",
  "Eraser": "Borracha usada para apagar traços de lápis no papel.",
  "Ruler": "Régua rígida com marcações em centímetros usada para medir e traçar linhas retas.",
  "Backpack": "Mochila usada nas costas para carregar livros e materiais escolares.",
  "Homework": "Dever de casa que os alunos levam para praticar fora do horário de aula.",
  "Library": "Local silencioso que reúne uma grande coleção de livros para leitura e pesquisa.",
  "Classroom": "A sala de aula física onde os alunos se reúnem com o professor.",
  "Principal": "O diretor ou diretora responsável pela administração da escola.",
  "Playground": "Pátio com brinquedos e espaço aberto para recreação infantil.",
  "Cafeteria": "Refeitório ou cantina escolar onde alunos e professores fazem suas refeições.",
  "Locker": "Armário com tranca usado por estudantes para guardar seus pertences na escola.",
  "Schedule": "Cronograma ou horário organizado com as atividades e aulas da semana.",
  "Subject": "A disciplina ou matéria de estudo escolar, como matemática ou história.",
  "Assignment": "Trabalho ou tarefa acadêmica passada pelo professor para ser entregue.",
  "Quiz": "Pequeno teste rápido de perguntas para avaliar o aprendizado.",
  "Diploma": "Certificado oficial que comprova a conclusão com sucesso de um curso.",
  "Graduation": "Cerimônia solene de formatura que marca a conclusão dos estudos.",
  "Chalk": "Giz branco ou colorido usado para escrever no quadro-negro.",
  "Marker": "Canetão marcador usado para escrever em quadros brancos.",
  "Textbook": "Livro didático oficial que serve de base para o ensino de uma matéria.",
  "Recess": "Intervalo ou recreio entre as aulas para os alunos descansarem.",
  "Uniform": "Traje padrão de vestimenta obrigatório usado por alunos na escola.",
  "Tutor": "Professor particular que orienta um aluno individualmente.",
  "Attendance": "A lista de presença que registra a frequência dos alunos nas aulas.",
  "Timetable": "Tabela com os horários de todas as matérias e aulas.",

  // === ROUPAS ===
  "Shirt": "Peça de vestuário com mangas e gola que cobre a parte superior do tronco.",
  "Pants": "Calça comprida que cobre as pernas individualmente, sempre no plural em inglês.",
  "Dress": "Vestido de peça única que cobre o tronco e se estende pelas pernas.",
  "Shoes": "Calçados resistentes que protegem os pés ao caminhar no chão.",
  "Coat": "Casaco comprido e pesado usado sobre outras roupas para proteger do frio intenso.",
  "Hat": "Acessório usado na cabeça para proteção contra o sol ou pelo estilo.",
  "Socks": "Meias de tecido macio usadas nos pés por dentro dos sapatos.",
  "Jacket": "Jaqueta curta que vai até a cintura, mais leve que um sobretudo.",
  "Boots": "Botas resistentes que cobrem o pé e sobem pelo tornozelo ou perna.",
  "Gloves": "Luvas com divisões para cada dedo que aquecem e protegem as mãos.",
  "Scarf": "Cachecol ou lenço comprido enrolado ao redor do pescoço para aquecer.",
  "Belt": "Cinto de couro ou tecido usado ao redor da cintura para segurar calças.",
  "T-shirt": "Camiseta leve de algodão cujo formato aberto lembra a letra T.",
  "Jeans": "Calça feita de tecido brim resistente, popular no mundo inteiro.",
  "Shorts": "Bermuda ou short curto que deixa as pernas à mostra no calor.",
  "Blouse": "Blusa feminina mais leve e social do que uma camiseta comum.",
  "Suit": "Terno social completo composto por paletó e calça combinando.",
  "Vest": "Colete sem mangas usado sobre camisas para elegância ou aquecimento.",
  "Pajamas": "Roupa confortável de dormir usada para descansar à noite.",
  "Swimsuit": "Roupa de banho ou maiô usada em praias e piscinas.",
  "Raincoat": "Capa impermeável projetada para proteger da chuva.",
  "Umbrella": "Guarda-chuva retrátil para se abrigar da chuva ou do sol.",
  "Necklace": "Colar ou corrente com pingente usado ao redor do pescoço.",
  "Bracelet": "Pulseira decorativa usada ao redor do pulso.",
  "Earrings": "Brincos usados nos lóbulos das orelhas, geralmente em pares.",
  "Wallet": "Carteira de bolso usada para guardar dinheiro, cartões e documentos.",
  "Purse": "Bolsa de mão pequena para carregar itens pessoais.",
  "Handbag": "Bolsa feminina espaçosa com alça para carregar no ombro ou mão.",
  "Zipper": "Fecho de correr metálico ou plástico usado para fechar roupas e mochilas.",
  "Button": "Botão circular costurado na roupa que se encaixa em uma casa para fechá-la.",
  "Fabric": "Tecido ou pano antes de ser cortado e costurado em roupas.",
  "Cotton": "Fibra natural macia de algodão muito usada na fabricação de roupas leves.",
  "Leather": "Couro legítimo de pele animal tratado para sapatos, cintos e jaquetas.",
  "Sandals": "Sandálias abertas e arejadas ideais para climas quentes de verão.",
  "Sneakers": "Tênis esportivo confortável com sola de borracha para caminhada e corrida.",

  // === CUMPRIMENTOS E NÚMEROS ===
  "Hello": "A saudação amigável mais universal da língua inglesa para cumprimentar alguém.",
  "Goodbye": "Expressão usada para se despedir de alguém ao partir.",
  "Thanks": "Forma rápida e afetuosa de expressar gratidão e dizer obrigado.",
  "Welcome": "Palavra calorosa usada para acolher ou receber alguém que chega.",
  "Morning": "A primeira parte do dia, que vai do nascer do sol até o meio-dia.",
  "Night": "O período escuro entre o pôr do sol e o amanhecer, ideal para dormir.",
  "Please": "Palavra de polidez essencial usada ao fazer um pedido educado.",
  "Sorry": "Expressão sincera usada para pedir desculpas ou demonstrar arrependimento.",
  "Excuse": "Usado na expressão 'com licença' para pedir passagem ou chamar a atenção.",
  "One": "O primeiro número inteiro positivo, que representa a unidade singular.",
  "Two": "O número par que vem logo após o um e antes do três.",
  "Three": "O número ímpar que representa uma tríade.",
  "Four": "O número par correspondente aos quatro lados de um quadrado.",
  "Five": "O número que corresponde à quantidade de dedos em uma mão humana.",
  "Six": "O número que representa meia dúzia.",
  "Seven": "Número famoso associado aos sete dias da semana e às cores do arco-íris.",
  "Eight": "O número par que equivale ao número de patas de uma aranha.",
  "Nine": "O maior número de um único dígito no sistema decimal.",
  "Ten": "A base fundamental do nosso sistema decimal, correspondente a dez unidades.",
  "Eleven": "O número que vem imediatamente após o dez.",
  "Twelve": "O número correspondente a uma dúzia inteira.",
  "Hundred": "O número cem, que equivale a dez dezenas.",
  "Thousand": "O número mil, correspondente a dez centenas.",
  "Million": "O número um milhão, equivalente a mil milhares.",
};

const getTranslatedHint = (word) => {
  if (!word) return '';
  if (word.tipPt) return word.tipPt;
  if (tipPtMap[word.en]) return tipPtMap[word.en];
  return word.pt ? `Significado: "${word.pt}"` : (word.tip || '');
};

const HangmanGame = () => {
  const { words } = useCourseData();
  const { userLevel, maxLevel } = useUserLevel();
  // Filtra pelo que o curso ATIVO realmente cobre. A lista fixa acima vale
  // para o inglês; um curso sem 'roupas', por exemplo, ofereceria um botão que
  // levaria a `pickOneByLevel([], ...)` — palavra `undefined` e tela quebrada.
  const hangmanCategories = useMemo(
    () => categories.filter(c => CATEGORIAS_DO_JOGO.includes(c.id) && jogaveisDe(words, c.id).length > 0),
    [words],
  );
  const [category, setCategory] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameState, setGameState] = useState('select'); // select, playing, won, lost
  const { progress, consumeHint, consumeTipTranslation, handleCorrectAnswer, handleWrongAnswer, completeGame, addExploredCategory } = useProgress();
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal } = useSpeech();
  const [tipTranslated, setTipTranslated] = useState(false);

  const startGame = useCallback((cat) => {
    setCategory(cat);
    addExploredCategory(cat.id);
    const categoryWords = jogaveisDe(words, cat.id);
    // Enviesado pelo nível do jogador em vez de sortear uniformemente da
    // categoria inteira — ver levelSelection.js sobre o porquê.
    const word = pickOneByLevel(categoryWords, userLevel, maxLevel);
    setCurrentWord(word);
    setGuessedLetters([]);
    setWrongCount(0);
    setTipTranslated(false);
    setGameState('playing');
  }, [addExploredCategory, words, userLevel, maxLevel]);

  const handleLetterGuess = useCallback((letter) => {
    if (guessedLetters.includes(letter) || gameState !== 'playing') return;

    playClick();
    speakNormal(letter);
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);
    
    const wordUpper = currentWord.en.toUpperCase();
    
    if (!wordUpper.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      
      if (newWrong >= MAX_WRONG) {
        setGameState('lost');
        handleWrongAnswer(currentWord.en);
        playWrong();
      }
    } else {
      // Check if word is complete (exempting non-alphabet characters like spaces/hyphens)
      const allRevealed = wordUpper.split('').every(l => !/[A-Z]/.test(l) || newGuessed.includes(l));
      if (allRevealed) {
        setGameState('won');
        const isPerfect = wrongCount === 0;
        const wordPoints = isPerfect ? GAME_REWARDS.hangman.perfect : GAME_REWARDS.hangman.imperfect;
        handleCorrectAnswer(currentWord.en, isPerfect ? 1 : 2, false, wordPoints);
        completeGame('hangman', GAME_REWARDS.hangman.completion);
        playCorrect();
      }
    }
  }, [guessedLetters, gameState, currentWord, wrongCount, playClick, speakNormal, playWrong, playCorrect, handleCorrectAnswer, handleWrongAnswer, completeGame]);

  const handleUseExtraHint = useCallback(() => {
    if (!currentWord || gameState !== 'playing') return;
    if ((progress.hintsAvailable || 0) <= 0) return;

    const unrevealed = currentWord.en.toUpperCase().split('').filter(l => /[A-Z]/.test(l) && !guessedLetters.includes(l));
    if (unrevealed.length === 0) return;

    const letterToReveal = unrevealed[0];
    if (consumeHint()) {
      handleLetterGuess(letterToReveal);
    }
  }, [currentWord, gameState, guessedLetters, progress.hintsAvailable, consumeHint, handleLetterGuess]);

  const renderWord = () => {
    if (!currentWord) return null;
    return currentWord.en.toUpperCase().split('').map((letter, i) => {
      const isLetter = /[A-Z]/.test(letter);
      const isRevealed = !isLetter || guessedLetters.includes(letter) || gameState === 'lost';
      return (
        <span key={i} className={`hangman-letter ${isRevealed ? 'revealed' : ''}`}>
          {isRevealed ? letter : '_'}
        </span>
      );
    });
  };

  const renderHangman = () => {
    return (
      <svg viewBox="0 0 200 250" className="hangman-svg">
        {/* Gallows */}
        <line x1="20" y1="230" x2="180" y2="230" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="60" y1="230" x2="60" y2="20" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="60" y1="20" x2="130" y2="20" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
        
        {/* Person parts */}
        {wrongCount >= 1 && <circle cx="130" cy="65" r="15" stroke="var(--accent-red)" strokeWidth="3" fill="none" className="animate-fade-in" />}
        {wrongCount >= 2 && <line x1="130" y1="80" x2="130" y2="150" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 3 && <line x1="130" y1="100" x2="100" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 4 && <line x1="130" y1="100" x2="160" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 5 && <line x1="130" y1="150" x2="105" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 6 && <line x1="130" y1="150" x2="155" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
      </svg>
    );
  };

  // Category selection
  if (gameState === 'select') {
    return (
      <div className="page">
        <div className="container game-container text-center animate-fade-in-up">
          <Link to="/games" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>← Voltar</Link>
          <h1 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
            <img src="/hangman-icon.webp" alt="" style={{ width: '1.4em', height: '1.4em', borderRadius: 'var(--radius-sm)' }} />
            Jogo da Forca
          </h1>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-2xl)' }}>
            Escolha uma categoria e tente adivinhar a palavra em inglês!
          </p>
          <div className="category-grid">
            {hangmanCategories.map(cat => (
              <button key={cat.id} className="glass-card category-card" onClick={() => startGame(cat)}
                style={{ borderColor: `${cat.color}30` }}>
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-desc">{cat.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Won/Lost screen
  if (gameState === 'won' || gameState === 'lost') {
    return (
      <div className="page">
        <div className="container game-container text-center">
          <div className="game-result-card glass-card animate-bounce-in">
            <span style={{ fontSize: '4rem' }}>{gameState === 'won' ? '🎉' : '💪'}</span>
            <h2>{gameState === 'won' ? 'Parabéns!' : 'Boa tentativa!'}</h2>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {gameState === 'won'
                ? `Você descobriu a palavra com ${wrongCount} erro${wrongCount !== 1 ? 's' : ''}!`
                : 'Errar faz parte do aprendizado. Vamos aprender essa palavra!'}
            </p>
            <WordExplanation word={currentWord} />
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => startGame(category)}>
                🔄 Jogar novamente
              </button>
              <button className="btn btn-secondary" onClick={() => setGameState('select')}>
                Mudar categoria
              </button>
              <Link to="/games" className="btn btn-ghost">← Outros jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/hangman-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Forca</h2>
            <span className="badge badge-blue">{category.icon} {category.name}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item">
              <span>❌</span>
              <span className="value">{wrongCount}/{MAX_WRONG}</span>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="hangman-hint glass-card animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ flex: 1, lineHeight: 1.5 }}>
            <span>💡 Dica: {tipTranslated ? getTranslatedHint(currentWord) : currentWord.tip}</span>
          </div>
          {!tipTranslated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              {(progress.tipTranslationsAvailable || 0) > 0 && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { if (consumeTipTranslation()) setTipTranslated(true); }}>
                  🌐 Traduzir Dica ({progress.tipTranslationsAvailable} disp.)
                </button>
              )}
              {(progress.hintsAvailable || 0) > 0 ? (
                <button className="btn btn-secondary btn-sm" onClick={handleUseExtraHint}>
                  💡 Revelar Letra ({progress.hintsAvailable} disp.)
                </button>
              ) : (
                <Link to="/shop" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--fs-xs)', textDecoration: 'none' }}>
                  🛒 Comprar Dicas na Loja
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Hangman Drawing */}
        <div className="hangman-drawing">
          {renderHangman()}
        </div>

        {/* Word */}
        <div className="hangman-word animate-fade-in-up">
          {renderWord()}
        </div>

        {/* Keyboard */}
        <div className="hangman-keyboard animate-fade-in-up">
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && currentWord.en.toUpperCase().includes(letter);
            const isWrong = isGuessed && !currentWord.en.toUpperCase().includes(letter);
            
            return (
              <button
                key={letter}
                className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleLetterGuess(letter)}
                disabled={isGuessed}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HangmanGame;
