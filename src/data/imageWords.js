// Palavras com boa representação visual (emoji), usadas pelo Jogo da Imagem
// (src/games/ImageQuiz). Cada entrada aponta para uma palavra REAL de
// words.js pelo `en` exato — nunca duplicamos pt/pronunciation/example/tip
// aqui. O jogo busca o objeto completo em words.js na hora de montar a
// pergunta e de mostrar o WordExplanation, exatamente como todo outro jogo.
// Isso é o que mantém o progresso de uma palavra unificado em vez de
// fragmentado entre este arquivo e o banco principal (ver src/utils/wordKey.js).
//
// A maioria do vocabulário de words.js é abstrata demais para virar uma
// imagem única e inequívoca (verbos, sentimentos, perguntas...) — por isso
// este é um SUBCONJUNTO curado, não o banco inteiro.
//
// `category` aqui é só o agrupamento visual usado para sortear as 3 opções
// erradas "parecidas" com a certa (ver buildQuestion em ImageQuiz.jsx) — não
// precisa ser igual à `category` de words.js, embora normalmente coincida.
// Cada categoria tem pelo menos 6 palavras de propósito: com menos que isso
// não dá pra montar 4 opções sem repetir ou cair para fora do grupo.
//
// `icon` é uma foto real do banco Pexels (images.pexels.com), resolvida uma
// vez por palavra via a Search API deles e congelada aqui como URL fixa —
// o app nunca chama a API do Pexels em runtime, só carrega a <img> direto.
// Por isso `img-src` em vercel.json precisa nomear esse host explicitamente
// (a CSP é `default-src 'self'`, então uma URL de fora só carrega porque foi
// liberada ali — não é wildcard, é só esse domínio, mesmo padrão do host do
// Render pro socket do duelo). `iconAlt` vem do texto alternativo que o
// próprio Pexels já retorna pra cada foto. `emoji` fica só como fallback.
//
// Trocar por outra foto: gere uma nova URL na Search API do Pexels
// (https://api.pexels.com/v1/search?query=...) com uma API key própria — a
// chave usada pra gerar este arquivo é transiente, não fica salva no repo.
import { words } from './words';

const RAW_IMAGE_WORDS = [
  // Animais — a categoria mais rica, cobre do nível 4 ao 43
  { en: 'Dog', emoji: '🐶', icon: 'https://images.pexels.com/photos/16254908/pexels-photo-16254908.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A close-up portrait of a red-coated dog wearing a black collar, outdoors.', category: 'animais' },
  { en: 'Cat', emoji: '🐱', icon: 'https://images.pexels.com/photos/33444883/pexels-photo-33444883.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Charming close-up of a black and white kitten in a monochrome setting, showcasing its playful and inquisitive nature.', category: 'animais' },
  { en: 'Bird', emoji: '🐦', icon: 'https://images.pexels.com/photos/19664299/pexels-photo-19664299.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A solitary myna bird stands gracefully on a Dubai pavement, showcasing its vibrant colors.', category: 'animais' },
  { en: 'Fish', emoji: '🐟', icon: 'https://images.pexels.com/photos/7254512/pexels-photo-7254512.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed macro shot capturing the intricate details and colors of a goldfish.', category: 'animais' },
  { en: 'Horse', emoji: '🐴', icon: 'https://images.pexels.com/photos/13514042/pexels-photo-13514042.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A peaceful scene featuring a brown and white horse in a sunny rural pasture.', category: 'animais' },
  { en: 'Cow', emoji: '🐮', icon: 'https://images.pexels.com/photos/13926431/pexels-photo-13926431.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A serene image of cows relaxing in a grassy meadow during daytime.', category: 'animais' },
  { en: 'Pig', emoji: '🐷', icon: 'https://images.pexels.com/photos/7811891/pexels-photo-7811891.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Black mini pings standing on dirty ground while grazing in farmland in sunny day', category: 'animais' },
  { en: 'Chicken', emoji: '🐔', icon: 'https://images.pexels.com/photos/35057569/pexels-photo-35057569.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed image of a white Leghorn hen showcasing its distinctive features. Ideal for agricultural themes.', category: 'animais' },
  { en: 'Duck', emoji: '🦆', icon: 'https://images.pexels.com/photos/18988503/pexels-photo-18988503.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A vivid mallard duck stands gracefully on a log, reflecting in a serene pond.', category: 'animais' },
  { en: 'Rabbit', emoji: '🐰', icon: 'https://images.pexels.com/photos/19904640/pexels-photo-19904640.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Adorable lop-eared rabbit with fluffy fur in a studio setting, perfect for pet lovers.', category: 'animais' },
  { en: 'Lion', emoji: '🦁', icon: 'https://images.pexels.com/photos/6170292/pexels-photo-6170292.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed close-up shot of a lion\'s face showing its majestic features. Perfect for wildlife and animal lovers.', category: 'animais' },
  { en: 'Elephant', emoji: '🐘', icon: 'https://images.pexels.com/photos/17081254/pexels-photo-17081254.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A stunning portrait of an African elephant in its natural grassland habitat, showcasing its grandeur.', category: 'animais' },
  { en: 'Monkey', emoji: '🐵', icon: 'https://images.pexels.com/photos/13523073/pexels-photo-13523073.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Two rhesus macaques sitting on a ledge, showcasing urban wildlife interaction.', category: 'animais' },
  { en: 'Bear', emoji: '🐻', icon: 'https://images.pexels.com/photos/7492295/pexels-photo-7492295.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'An intimate close-up of a grizzly bear resting on a rock with a natural background.', category: 'animais' },
  { en: 'Snake', emoji: '🐍', icon: 'https://images.pexels.com/photos/5140821/pexels-photo-5140821.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A detailed close-up of a snake among lush green leaves in a natural setting.', category: 'animais' },
  { en: 'Frog', emoji: '🐸', icon: 'https://images.pexels.com/photos/37164032/pexels-photo-37164032.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed capture of a vibrant green frog on a log, highlighting its intricate patterns.', category: 'animais' },
  { en: 'Butterfly', emoji: '🦋', icon: 'https://images.pexels.com/photos/36747363/pexels-photo-36747363.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed monochrome image of a butterfly resting on a tree trunk, showcasing its intricate wing patterns.', category: 'animais' },
  { en: 'Turtle', emoji: '🐢', icon: 'https://images.pexels.com/photos/8741218/pexels-photo-8741218.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Two turtles swimming in a sunlit pond with visible shell textures and aquatic plants.', category: 'animais' },
  { en: 'Spider', emoji: '🕷️', icon: 'https://images.pexels.com/photos/30337195/pexels-photo-30337195.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed close-up of a spider on its web in Quy Nhơn, Bình Định, Việt Nam.', category: 'animais' },
  { en: 'Bat', emoji: '🦇', icon: 'https://images.pexels.com/photos/33020234/pexels-photo-33020234.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Intimate close-up showing common big-eared bats hanging in Gamboa, Panama. Detailed view of nocturnal wildlife.', category: 'animais' },
  { en: 'Owl', emoji: '🦉', icon: 'https://images.pexels.com/photos/37623658/pexels-photo-37623658.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A detailed close-up of an Eurasian Eagle-Owl showcasing its striking orange eyes and feather pattern.', category: 'animais' },
  { en: 'Bee', emoji: '🐝', icon: 'https://images.pexels.com/photos/34061873/pexels-photo-34061873.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a bee on a flower, capturing nectar amidst a soft focus background.', category: 'animais' },
  { en: 'Ant', emoji: '🐜', icon: 'https://images.pexels.com/photos/36498264/pexels-photo-36498264.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed macro image of a black carpenter ant on wood, showcasing intricate details in vibrant colors.', category: 'animais' },
  { en: 'Chameleon', emoji: '🦎', icon: 'https://images.pexels.com/photos/36950973/pexels-photo-36950973.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Chameleon blending in with green leaves, showcasing its camouflage skills.', category: 'animais' },
  { en: 'Tiger', emoji: '🐯', icon: 'https://images.pexels.com/photos/145971/pexels-photo-145971.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a majestic Siberian tiger prowling its natural habitat with intense gaze.', category: 'animais' },
  { en: 'Wolf', emoji: '🐺', icon: 'https://images.pexels.com/photos/36835951/pexels-photo-36835951.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Intense close-up portrait of a gray wolf (Canis lupus) displaying its detailed fur texture and piercing eyes.', category: 'animais' },
  { en: 'Fox', emoji: '🦊', icon: 'https://images.pexels.com/photos/9075078/pexels-photo-9075078.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Captivating image of a red fox in its natural environment, showcasing the beauty of wildlife.', category: 'animais' },
  { en: 'Deer', emoji: '🦌', icon: 'https://images.pexels.com/photos/34960864/pexels-photo-34960864.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Portrait of a roe deer looking back in a snowy landscape, showcasing its natural beauty.', category: 'animais' },
  { en: 'Sheep', emoji: '🐑', icon: 'https://images.pexels.com/photos/35886459/pexels-photo-35886459.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Adorable curly-haired black sheep posing outdoors with a curious expression.', category: 'animais' },
  { en: 'Goat', emoji: '🐐', icon: 'https://images.pexels.com/photos/34565448/pexels-photo-34565448.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A group of brown goats with horns is pictured outdoors on a farm in Alkmaar, Netherlands.', category: 'animais' },
  { en: 'Mouse', emoji: '🐭', icon: 'https://images.pexels.com/photos/345736/pexels-photo-345736.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A cute wood mouse in a lush green natural setting in Staffordshire, England.', category: 'animais' },
  { en: 'Shark', emoji: '🦈', icon: 'https://images.pexels.com/photos/1700656/pexels-photo-1700656.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Large shark gracefully swimming in aquarium as people take photos with their phones.', category: 'animais' },

  // Comidas
  { en: 'Rice', emoji: '🍚', icon: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Delicious steaming fried rice in a black ceramic bowl with chopsticks, perfect for an appetizing meal.', category: 'comidas' },
  { en: 'Bread', emoji: '🍞', icon: 'https://images.pexels.com/photos/5567093/pexels-photo-5567093.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A loaf of rustic bread partially sliced on a round wooden board, accompanied by a knife.', category: 'comidas' },
  { en: 'Egg', emoji: '🥚', icon: 'https://images.pexels.com/photos/7094745/pexels-photo-7094745.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A flat lay of brown eggs and cracked shell on a black background, perfect for culinary themes.', category: 'comidas' },
  { en: 'Meat', emoji: '🍖', icon: 'https://images.pexels.com/photos/15597773/pexels-photo-15597773.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Appetizing meat dish on a plate with hands holding a fork. Perfect for culinary blogs.', category: 'comidas' },
  { en: 'Pizza', emoji: '🍕', icon: 'https://images.pexels.com/photos/8609973/pexels-photo-8609973.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Savor a mouthwatering vegetarian pizza loaded with fresh ingredients in this appetizing flatlay.', category: 'comidas' },
  { en: 'Apple', emoji: '🍎', icon: 'https://images.pexels.com/photos/11663121/pexels-photo-11663121.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Minimalist photo of a whole and halved green apple on a pastel blue background, ideal for food and health themes.', category: 'comidas' },
  { en: 'Banana', emoji: '🍌', icon: 'https://images.pexels.com/photos/16829201/pexels-photo-16829201.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Bright yellow bananas arranged on a purple surface in a playful flat lay pattern.', category: 'comidas' },
  { en: 'Cheese', emoji: '🧀', icon: 'https://images.pexels.com/photos/24206934/pexels-photo-24206934.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A delectable brunch platter featuring assorted cheeses, fruits, and bagel with orange juice.', category: 'comidas' },
  { en: 'Cake', emoji: '🎂', icon: 'https://images.pexels.com/photos/4692165/pexels-photo-4692165.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a glazed cake topped with nuts and seeds, perfect for dessert photography.', category: 'comidas' },
  { en: 'Candy', emoji: '🍬', icon: 'https://images.pexels.com/photos/32081993/pexels-photo-32081993.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Vibrant assortment of sugar-coated gumdrops. Perfect for candy themes.', category: 'comidas' },
  { en: 'Sandwich', emoji: '🥪', icon: 'https://images.pexels.com/photos/6416558/pexels-photo-6416558.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a gourmet sandwich with prosciutto, cheese, and greens on a wooden board.', category: 'comidas' },
  { en: 'Soup', emoji: '🍲', icon: 'https://images.pexels.com/photos/8696758/pexels-photo-8696758.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A person enjoying soup with bread in a cozy indoor restaurant setting.', category: 'comidas' },
  { en: 'Ice cream', emoji: '🍦', icon: 'https://images.pexels.com/photos/38398929/pexels-photo-38398929.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A vibrant pink ice cream truck parked on a sunny day in New York City.', category: 'comidas' },
  { en: 'Cookie', emoji: '🍪', icon: 'https://images.pexels.com/photos/32637653/pexels-photo-32637653.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Stack of delicious homemade cookies with powdered sugar, perfect for snacking and baking inspiration.', category: 'comidas' },
  { en: 'Chocolate', emoji: '🍫', icon: 'https://images.pexels.com/photos/31443060/pexels-photo-31443060.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'An artistic flat lay of diverse chocolates arranged on a yellow background highlighting chocolate variety.', category: 'comidas' },
  { en: 'Potato', emoji: '🥔', icon: 'https://images.pexels.com/photos/8839625/pexels-photo-8839625.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Tasty potato wedges seasoned and served on parchment paper, perfect for a delicious snack or side dish.', category: 'comidas' },
  { en: 'Tomato', emoji: '🍅', icon: 'https://images.pexels.com/photos/4247701/pexels-photo-4247701.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'From above through glass view of background of many ripe red round shaped tomatoes with shiny surface', category: 'comidas' },
  { en: 'Onion', emoji: '🧅', icon: 'https://images.pexels.com/photos/36188439/pexels-photo-36188439.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Artistic close-up of a sliced red onion revealing its texture and layers against a purple backdrop.', category: 'comidas' },
  { en: 'Garlic', emoji: '🧄', icon: 'https://images.pexels.com/photos/5973583/pexels-photo-5973583.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A detailed close-up of a fresh garlic bulb on a neutral background, perfect for culinary themes.', category: 'comidas' },

  // Bebidas
  { en: 'Water', emoji: '💧', icon: 'https://images.pexels.com/photos/11754189/pexels-photo-11754189.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A refreshing close-up of a water splash with lemon slices and mint leaves in a glass.', category: 'bebidas' },
  { en: 'Milk', emoji: '🥛', icon: 'https://images.pexels.com/photos/11857929/pexels-photo-11857929.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A person in black holds a glass of milk on a yellow plastic stool outdoors.', category: 'bebidas' },
  { en: 'Coffee', emoji: '☕', icon: 'https://images.pexels.com/photos/162994/coffee-coffee-cup-cup-cafe-162994.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Motivational coffee mug with frothy cappuccino, surrounded by coffee beans and topped with a cookie. Perfect cozy morning.', category: 'bebidas' },
  { en: 'Tea', emoji: '🍵', icon: 'https://images.pexels.com/photos/7574063/pexels-photo-7574063.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A warm glass of tea with steam rising, set in a cozy atmosphere with bokeh lighting.', category: 'bebidas' },
  { en: 'Juice', emoji: '🧃', icon: 'https://images.pexels.com/photos/15823268/pexels-photo-15823268.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A refreshing orange cocktail with a flower garnish served outdoors in Kerman, Iran.', category: 'bebidas' },
  { en: 'Soda', emoji: '🥤', icon: 'https://images.pexels.com/photos/34405414/pexels-photo-34405414.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A striking red beverage can placed on a tiled backdrop offering stark contrast.', category: 'bebidas' },
  { en: 'Wine', emoji: '🍷', icon: 'https://images.pexels.com/photos/5624664/pexels-photo-5624664.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A bottle of Canaletto Montepulciano wine with a glass on a wooden surface, beautifully lit by sunlight.', category: 'bebidas' },
  { en: 'Beer', emoji: '🍺', icon: 'https://images.pexels.com/photos/37935977/pexels-photo-37935977.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Friends clinking beer bottles in a lively indoor gathering, capturing celebration and camaraderie.', category: 'bebidas' },
  { en: 'Lemonade', emoji: '🍋', icon: 'https://images.pexels.com/photos/3651045/pexels-photo-3651045.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Glass bottle of lemonade with mint and lemon slices for a fresh, natural drink.', category: 'bebidas' },
  { en: 'Smoothie', emoji: '🥤', icon: 'https://images.pexels.com/photos/6853406/pexels-photo-6853406.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Adult woman drinking a healthy green smoothie with fresh spinach leaves. Vibrant and refreshing.', category: 'bebidas' },

  // Roupas
  { en: 'Shirt', emoji: '👕', icon: 'https://images.pexels.com/photos/8146450/pexels-photo-8146450.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Red and yellow t-shirts neatly hanging indoors on a black clothing rack.', category: 'roupas' },
  { en: 'Pants', emoji: '👖', icon: 'https://images.pexels.com/photos/4458521/pexels-photo-4458521.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Top view of a modern outfit with red pants, white top, and accessories on wooden floor.', category: 'roupas' },
  { en: 'Shoes', emoji: '👟', icon: 'https://images.pexels.com/photos/34976479/pexels-photo-34976479.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Flat lay of fall fashion items on white fabric, including boots, jeans, and sweater.', category: 'roupas' },
  { en: 'Hat', emoji: '🎩', icon: 'https://images.pexels.com/photos/5306338/pexels-photo-5306338.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Black and white photo featuring stylish fedora hats on a rustic wooden table, highlighting their classic design.', category: 'roupas' },
  { en: 'Dress', emoji: '👗', icon: 'https://images.pexels.com/photos/4428388/pexels-photo-4428388.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Stylish flatlay of a light blue striped dress with shoes and accessories.', category: 'roupas' },
  { en: 'Jacket', emoji: '🧥', icon: 'https://images.pexels.com/photos/13094233/pexels-photo-13094233.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Black and white photo of a gray jacket on a hanger indoors, showcasing minimalist style.', category: 'roupas' },
  { en: 'Socks', emoji: '🧦', icon: 'https://images.pexels.com/photos/17542996/pexels-photo-17542996.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Colorful sock with matching clothespins on a pink backdrop, perfect for creative layouts.', category: 'roupas' },
  { en: 'Ring', emoji: '💍', icon: 'https://images.pexels.com/photos/31459470/pexels-photo-31459470.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a luxurious diamond ring with intricate design on a black surface.', category: 'roupas' },
  { en: 'Glove', emoji: '🧤', icon: 'https://images.pexels.com/photos/29981497/pexels-photo-29981497.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A cheerful woman holding snow, enjoying a snowy winter day outdoors.', category: 'roupas' },
  { en: 'Scarf', emoji: '🧣', icon: 'https://images.pexels.com/photos/9033324/pexels-photo-9033324.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Stylish Asian woman in grayscale, wearing sunglasses, scarf, and gloves.', category: 'roupas' },
  { en: 'Tie', emoji: '👔', icon: 'https://images.pexels.com/photos/17887830/pexels-photo-17887830.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Black and white portrait of a young man wearing a hat and trench coat, exuding elegance.', category: 'roupas' },
  { en: 'Sunglasses', emoji: '🕶️', icon: 'https://images.pexels.com/photos/38652622/pexels-photo-38652622.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Confident woman posing in a black coat and sunglasses, exuding modern style.', category: 'roupas' },
  { en: 'Coat', emoji: '🧥', icon: 'https://images.pexels.com/photos/11066983/pexels-photo-11066983.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A playful Jack Russell Terrier wearing a striped sweater enjoying a snowy winter day outdoors.', category: 'roupas' },
  { en: 'Boots', emoji: '🥾', icon: 'https://images.pexels.com/photos/27381284/pexels-photo-27381284.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Chic brown leather ankle boots with suede cuffs, ideal for fashion-forward styles.', category: 'roupas' },

  // Corpo humano
  { en: 'Eye', emoji: '👁️', icon: 'https://images.pexels.com/photos/38226818/pexels-photo-38226818.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Macro shot highlighting the intricate details of a brown human eye, showcasing the iris and surrounding lashes.', category: 'corpo' },
  { en: 'Ear', emoji: '👂', icon: 'https://images.pexels.com/photos/16128149/pexels-photo-16128149.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Minimalist black and white image of a woman from behind, holding braided blonde hair.', category: 'corpo' },
  { en: 'Nose', emoji: '👃', icon: 'https://images.pexels.com/photos/7460707/pexels-photo-7460707.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Intense black and white close-up photo focusing on the eyes of a bearded man.', category: 'corpo' },
  { en: 'Mouth', emoji: '👄', icon: 'https://images.pexels.com/photos/19291508/pexels-photo-19291508.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a pill on a woman\'s tongue highlighting medication and health themes.', category: 'corpo' },
  { en: 'Hand', emoji: '✋', icon: 'https://images.pexels.com/photos/1454797/pexels-photo-1454797.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Elegant human hand reaching into soft, warm light creating a serene and artistic effect.', category: 'corpo' },
  { en: 'Foot', emoji: '🦶', icon: 'https://images.pexels.com/photos/356175/pexels-photo-356175.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up image showing a person barefoot with rolled-up jeans, framed by shoes.', category: 'corpo' },
  { en: 'Arm', emoji: '💪', icon: 'https://images.pexels.com/photos/9302046/pexels-photo-9302046.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Elegant arm entwined with measuring tape in neutral-toned setting, perfect for fashion or health themes.', category: 'corpo' },
  { en: 'Leg', emoji: '🦵', icon: 'https://images.pexels.com/photos/13537948/pexels-photo-13537948.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Surreal photo featuring a mirror reflecting an arm and leg on a wooden floor.', category: 'corpo' },
  { en: 'Heart', emoji: '❤️', icon: 'https://images.pexels.com/photos/15361675/pexels-photo-15361675.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of pink heart-shaped bleeding heart flowers (Lamprocapnos spectabilis) hanging delicately on a branch.', category: 'corpo' },
  { en: 'Tooth', emoji: '🦷', icon: 'https://images.pexels.com/photos/9951397/pexels-photo-9951397.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Dentist demonstrating proper teeth brushing technique on a dental model for patient education.', category: 'corpo' },
  { en: 'Tongue', emoji: '👅', icon: 'https://images.pexels.com/photos/7790836/pexels-photo-7790836.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Dynamic portrait of a woman with expressive makeup interacting with cellophane. Artistic and colorful composition.', category: 'corpo' },
  { en: 'Brain', emoji: '🧠', icon: 'https://images.pexels.com/photos/38226818/pexels-photo-38226818.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Macro shot highlighting the intricate details of a brown human eye, showcasing the iris and surrounding lashes.', category: 'corpo' },
  { en: 'Bone', emoji: '🦴', icon: 'https://images.pexels.com/photos/11061245/pexels-photo-11061245.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Grayscale image of a person holding a skull, conveying a mysterious atmosphere.', category: 'corpo' },
  { en: 'Finger', emoji: '👆', icon: 'https://images.pexels.com/photos/1454797/pexels-photo-1454797.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Elegant human hand reaching into soft, warm light creating a serene and artistic effect.', category: 'corpo' },

  // Transportes
  { en: 'Car', emoji: '🚗', icon: 'https://images.pexels.com/photos/20220873/pexels-photo-20220873.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'White Dodge Challenger Hellcat with headlights on, parked in a dimly lit parking garage in San Antonio.', category: 'transportes' },
  { en: 'Bus', emoji: '🚌', icon: 'https://images.pexels.com/photos/3829175/pexels-photo-3829175.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Capture of a city bus moving at night with blurred background, illustrating urban transportation.', category: 'transportes' },
  { en: 'Bicycle', emoji: '🚲', icon: 'https://images.pexels.com/photos/20728294/pexels-photo-20728294.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Colorful vintage bicycle with a basket by a serene pond in a sunny park setting.', category: 'transportes' },
  { en: 'Train', emoji: '🚂', icon: 'https://images.pexels.com/photos/5059248/pexels-photo-5059248.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Overhead shot of two trains at a Moscow metro station, showcasing urban transportation.', category: 'transportes' },
  { en: 'Airplane', emoji: '✈️', icon: 'https://images.pexels.com/photos/38823113/pexels-photo-38823113.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Close-up of a vintage airplane propeller displayed outdoors against a clear blue sky.', category: 'transportes' },
  { en: 'Boat', emoji: '⛵', icon: 'https://images.pexels.com/photos/8085685/pexels-photo-8085685.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Sailboat docked at Härnösand marina with historic architecture in background.', category: 'transportes' },
  { en: 'Taxi', emoji: '🚕', icon: 'https://images.pexels.com/photos/6635777/pexels-photo-6635777.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Cab driving on road in city street with modern illuminated buildings and signboards with hieroglyphs near green plants at night', category: 'transportes' },

  // Cores — cada uma já É a própria imagem, sem ambiguidade possível
  { en: 'Red', emoji: '🔴', icon: 'https://images.pexels.com/photos/11255287/pexels-photo-11255287.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Rich red fabric texture, perfect for backgrounds and design elements.', category: 'cores' },
  { en: 'Blue', emoji: '🔵', icon: 'https://images.pexels.com/photos/11255272/pexels-photo-11255272.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Seamless blue fabric texture ideal for backgrounds and design projects.', category: 'cores' },
  { en: 'Green', emoji: '🟢', icon: 'https://images.pexels.com/photos/11285444/pexels-photo-11285444.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'High-resolution white background with subtle texture, ideal for design projects and presentations.', category: 'cores' },
  { en: 'Yellow', emoji: '🟡', icon: 'https://images.pexels.com/photos/11285439/pexels-photo-11285439.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'High-quality textured brown surface ideal for wallpapers or backgrounds.', category: 'cores' },
  { en: 'Black', emoji: '⚫', icon: 'https://images.pexels.com/photos/11285435/pexels-photo-11285435.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Seamless dark gray texture perfect for backgrounds or wallpapers.', category: 'cores' },
  { en: 'White', emoji: '⚪', icon: 'https://images.pexels.com/photos/11285444/pexels-photo-11285444.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'High-resolution white background with subtle texture, ideal for design projects and presentations.', category: 'cores' },
  { en: 'Orange', emoji: '🟠', icon: 'https://images.pexels.com/photos/11285444/pexels-photo-11285444.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'High-resolution white background with subtle texture, ideal for design projects and presentations.', category: 'cores' },
  { en: 'Pink', emoji: '🩷', icon: 'https://images.pexels.com/photos/11255287/pexels-photo-11255287.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Rich red fabric texture, perfect for backgrounds and design elements.', category: 'cores' },
  { en: 'Purple', emoji: '🟣', icon: 'https://images.pexels.com/photos/11285444/pexels-photo-11285444.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'High-resolution white background with subtle texture, ideal for design projects and presentations.', category: 'cores' },
  { en: 'Brown', emoji: '🟤', icon: 'https://images.pexels.com/photos/11285439/pexels-photo-11285439.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'High-quality textured brown surface ideal for wallpapers or backgrounds.', category: 'cores' },

  // Esportes
  { en: 'Ball', emoji: '⚽', icon: 'https://images.pexels.com/photos/28222529/pexels-photo-28222529.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Soccer ball on a lush green field seen through netting, perfect for sports themes.', category: 'esportes' },
  { en: 'Chess', emoji: '♟️', icon: 'https://images.pexels.com/photos/20992934/pexels-photo-20992934.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Detailed view of chess pieces lined up on a wooden board, focusing on pawns.', category: 'esportes' },
  { en: 'Goal', emoji: '🥅', icon: 'https://images.pexels.com/photos/28222529/pexels-photo-28222529.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Soccer ball on a lush green field seen through netting, perfect for sports themes.', category: 'esportes' },
  { en: 'Dice', emoji: '🎲', icon: 'https://images.pexels.com/photos/7025165/pexels-photo-7025165.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Black and metallic dice on a detailed board game map, perfect for RPG fans.', category: 'esportes' },
  { en: 'Running', emoji: '🏃', icon: 'https://images.pexels.com/photos/29520198/pexels-photo-29520198.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Focused young male athlete running on an outdoor track, showcasing determination and fitness.', category: 'esportes' },
  { en: 'Swimming', emoji: '🏊', icon: 'https://images.pexels.com/photos/13342399/pexels-photo-13342399.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A woman wearing goggles floats in clear blue water using a pink pool noodle.', category: 'esportes' },

  // Casa
  { en: 'House', emoji: '🏠', icon: 'https://images.pexels.com/photos/28100641/pexels-photo-28100641.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Sleek minimalist kitchen with gray tones and wooden accents in Cluj-Napoca.', category: 'casa' },
  { en: 'Door', emoji: '🚪', icon: 'https://images.pexels.com/photos/26508559/pexels-photo-26508559.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Explore a serene minimalist interior with sunlight streaming on a floral cushion and modern doors.', category: 'casa' },
  { en: 'Window', emoji: '🪟', icon: 'https://images.pexels.com/photos/12548090/pexels-photo-12548090.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A peaceful outdoor scene viewed from an interior window, featuring lush green trees.', category: 'casa' },
  { en: 'Bed', emoji: '🛏️', icon: 'https://images.pexels.com/photos/10493902/pexels-photo-10493902.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A modern bedroom with stylish decor and abundant natural light', category: 'casa' },
  { en: 'Chair', emoji: '🪑', icon: 'https://images.pexels.com/photos/14781780/pexels-photo-14781780.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Warm minimalist interior featuring wooden furniture and soft lighting for a cozy atmosphere.', category: 'casa' },
  { en: 'Sofa', emoji: '🛋️', icon: 'https://images.pexels.com/photos/17264274/pexels-photo-17264274.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A modern leather sofa against a brick wall in an elegant living room with wooden flooring.', category: 'casa' },
  { en: 'TV', emoji: '📺', icon: 'https://images.pexels.com/photos/9646752/pexels-photo-9646752.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Cozy living room featuring a wall-mounted TV, wooden shelves, and potted plants.', category: 'casa' },
  { en: 'Clock', emoji: '🕐', icon: 'https://images.pexels.com/photos/191414/pexels-photo-191414.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Rustic blue alarm clock showing close-up of clock face and time, retro design.', category: 'casa' },
  { en: 'Key', emoji: '🔑', icon: 'https://images.pexels.com/photos/7397130/pexels-photo-7397130.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Weathered rusty metal key hanging on rope on shabby green wooden door of house', category: 'casa' },
  { en: 'Shower', emoji: '🚿', icon: 'https://images.pexels.com/photos/28479469/pexels-photo-28479469.png?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Elegant bathroom with white marble tiles and contemporary fixtures.', category: 'casa' },

  // Família
  { en: 'Mother', emoji: '👩', icon: 'https://images.pexels.com/photos/38624440/pexels-photo-38624440.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Warm portrait of a mother and son sharing a happy embrace at home.', category: 'familia' },
  { en: 'Father', emoji: '👨', icon: 'https://images.pexels.com/photos/38624435/pexels-photo-38624435.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A joyful family portrait featuring a father and his two sons dressed in white.', category: 'familia' },
  { en: 'Brother', emoji: '👦', icon: 'https://images.pexels.com/photos/590472/pexels-photo-590472.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A joyful brother and sister smiling outdoors in a sunlit garden. Perfect stock photo for family and lifestyle themes.', category: 'familia' },
  { en: 'Sister', emoji: '👧', icon: 'https://images.pexels.com/photos/2469645/pexels-photo-2469645.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A captivating portrait of two young sisters with striking blue eyes in a studio setting.', category: 'familia' },
  { en: 'Baby', emoji: '👶', icon: 'https://images.pexels.com/photos/38008350/pexels-photo-38008350.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Charming black and white portrait of a baby lying on a soft surface, capturing innocence.', category: 'familia' },
  { en: 'Grandmother', emoji: '👵', icon: 'https://images.pexels.com/photos/18671527/pexels-photo-18671527.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'A smiling elderly woman with Asian descent sitting indoors, exuding warmth and contentment.', category: 'familia' },
  { en: 'Grandfather', emoji: '👴', icon: 'https://images.pexels.com/photos/22601340/pexels-photo-22601340.jpeg?auto=compress&cs=tinysrgb&h=350', iconAlt: 'Black and white image of a grandfather and grandson sharing a tender moment.', category: 'familia' },
];

const wordsByEn = new Map(words.map((w) => [w.en, w]));

// Resolvido contra o banco real — `word` é o objeto completo de words.js
// (pt, pronunciation, example, examplePt, level, tip), usado tanto para
// filtrar por dificuldade quanto para alimentar o WordExplanation.
export const imageWords = RAW_IMAGE_WORDS
  .map((iw) => ({ ...iw, word: wordsByEn.get(iw.en) }))
  .filter((iw) => iw.word);

// Exportado só para o teste de integridade conferir que nenhuma entrada foi
// digitada errado e silenciosamente descartada pelo filter() acima.
export const RAW_IMAGE_WORDS_COUNT = RAW_IMAGE_WORDS.length;
