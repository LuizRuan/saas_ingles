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
// `icon` é uma foto real (banco Pexels), baixada uma vez e auto-hospedada em
// public/photos/ — não faz nenhuma chamada de rede pro Pexels em runtime, só
// carrega a <img> local, exatamente como os outros ícones do app (a CSP em
// vercel.json continua `default-src 'self'`, sem exceção nenhuma pra isso).
// `iconAlt` guarda o texto alternativo que o Pexels retornou pra cada foto —
// não é usado como `alt` visível no jogo (entregaria a resposta pra quem usa
// leitor de tela), só documenta de onde veio cada imagem. `emoji` fica como
// fallback.
//
// Trocar por outra foto: baixe um arquivo novo pra public/photos/<slug>.<ext>
// e aponte `icon` pra ele. Pra buscar uma nova via Pexels, use a Search API
// deles (https://api.pexels.com/v1/search?query=...) com uma API key própria
// — a chave usada pra gerar este banco foi usada uma única vez, fora do
// repositório, e nunca foi salva em nenhum arquivo do projeto.
import { words } from './words';

const RAW_IMAGE_WORDS = [
  // Animais — a categoria mais rica, cobre do nível 4 ao 43
  { en: 'Dog', emoji: '🐶', icon: '/photos/dog.jpg', iconAlt: 'A close-up portrait of a red-coated dog wearing a black collar, outdoors.', category: 'animais' },
  { en: 'Cat', emoji: '🐱', icon: '/photos/cat.jpg', iconAlt: 'Charming close-up of a black and white kitten in a monochrome setting, showcasing its playful and inquisitive nature.', category: 'animais' },
  { en: 'Bird', emoji: '🐦', icon: '/photos/bird.jpg', iconAlt: 'A solitary myna bird stands gracefully on a Dubai pavement, showcasing its vibrant colors.', category: 'animais' },
  { en: 'Fish', emoji: '🐟', icon: '/photos/fish.jpg', iconAlt: 'Detailed macro shot capturing the intricate details and colors of a goldfish.', category: 'animais' },
  { en: 'Horse', emoji: '🐴', icon: '/photos/horse.jpg', iconAlt: 'A peaceful scene featuring a brown and white horse in a sunny rural pasture.', category: 'animais' },
  { en: 'Cow', emoji: '🐮', icon: '/photos/cow.jpg', iconAlt: 'A serene image of cows relaxing in a grassy meadow during daytime.', category: 'animais' },
  { en: 'Pig', emoji: '🐷', icon: '/photos/pig.jpg', iconAlt: 'Black mini pings standing on dirty ground while grazing in farmland in sunny day', category: 'animais' },
  { en: 'Chicken', emoji: '🐔', icon: '/photos/chicken.jpg', iconAlt: 'Detailed image of a white Leghorn hen showcasing its distinctive features. Ideal for agricultural themes.', category: 'animais' },
  { en: 'Duck', emoji: '🦆', icon: '/photos/duck.jpg', iconAlt: 'A vivid mallard duck stands gracefully on a log, reflecting in a serene pond.', category: 'animais' },
  { en: 'Rabbit', emoji: '🐰', icon: '/photos/rabbit.jpg', iconAlt: 'Adorable lop-eared rabbit with fluffy fur in a studio setting, perfect for pet lovers.', category: 'animais' },
  { en: 'Lion', emoji: '🦁', icon: '/photos/lion.jpg', iconAlt: 'Detailed close-up shot of a lion\'s face showing its majestic features. Perfect for wildlife and animal lovers.', category: 'animais' },
  { en: 'Elephant', emoji: '🐘', icon: '/photos/elephant.jpg', iconAlt: 'A stunning portrait of an African elephant in its natural grassland habitat, showcasing its grandeur.', category: 'animais' },
  { en: 'Monkey', emoji: '🐵', icon: '/photos/monkey.jpg', iconAlt: 'Two rhesus macaques sitting on a ledge, showcasing urban wildlife interaction.', category: 'animais' },
  { en: 'Bear', emoji: '🐻', icon: '/photos/bear.jpg', iconAlt: 'An intimate close-up of a grizzly bear resting on a rock with a natural background.', category: 'animais' },
  { en: 'Snake', emoji: '🐍', icon: '/photos/snake.jpg', iconAlt: 'A detailed close-up of a snake among lush green leaves in a natural setting.', category: 'animais' },
  { en: 'Frog', emoji: '🐸', icon: '/photos/frog.jpg', iconAlt: 'Detailed capture of a vibrant green frog on a log, highlighting its intricate patterns.', category: 'animais' },
  { en: 'Butterfly', emoji: '🦋', icon: '/photos/butterfly.jpg', iconAlt: 'Detailed monochrome image of a butterfly resting on a tree trunk, showcasing its intricate wing patterns.', category: 'animais' },
  { en: 'Turtle', emoji: '🐢', icon: '/photos/turtle.jpg', iconAlt: 'A serene scene of a sea turtle gracefully swimming in crystal-clear tropical waters.', category: 'animais' },
  { en: 'Spider', emoji: '🕷️', icon: '/photos/spider.jpg', iconAlt: 'Detailed close-up of a spider on its web in Quy Nhơn, Bình Định, Việt Nam.', category: 'animais' },
  { en: 'Bat', emoji: '🦇', icon: '/photos/bat.jpg', iconAlt: 'Intimate close-up showing common big-eared bats hanging in Gamboa, Panama. Detailed view of nocturnal wildlife.', category: 'animais' },
  { en: 'Owl', emoji: '🦉', icon: '/photos/owl.jpg', iconAlt: 'A detailed close-up of an Eurasian Eagle-Owl showcasing its striking orange eyes and feather pattern.', category: 'animais' },
  { en: 'Bee', emoji: '🐝', icon: '/photos/bee.jpg', iconAlt: 'Close-up of a bee on a flower, capturing nectar amidst a soft focus background.', category: 'animais' },
  { en: 'Ant', emoji: '🐜', icon: '/photos/ant.jpg', iconAlt: 'Detailed macro image of a black carpenter ant on wood, showcasing intricate details in vibrant colors.', category: 'animais' },
  { en: 'Chameleon', emoji: '🦎', icon: '/photos/chameleon.jpg', iconAlt: 'Chameleon blending in with green leaves, showcasing its camouflage skills.', category: 'animais' },
  { en: 'Tiger', emoji: '🐯', icon: '/photos/tiger.jpg', iconAlt: 'Close-up of a majestic Siberian tiger prowling its natural habitat with intense gaze.', category: 'animais' },
  { en: 'Wolf', emoji: '🐺', icon: '/photos/wolf.jpg', iconAlt: 'Intense close-up portrait of a gray wolf (Canis lupus) displaying its detailed fur texture and piercing eyes.', category: 'animais' },
  { en: 'Fox', emoji: '🦊', icon: '/photos/fox.jpg', iconAlt: 'Captivating image of a red fox in its natural environment, showcasing the beauty of wildlife.', category: 'animais' },
  { en: 'Deer', emoji: '🦌', icon: '/photos/deer.jpg', iconAlt: 'Portrait of a roe deer looking back in a snowy landscape, showcasing its natural beauty.', category: 'animais' },
  { en: 'Sheep', emoji: '🐑', icon: '/photos/sheep.jpg', iconAlt: 'Adorable curly-haired black sheep posing outdoors with a curious expression.', category: 'animais' },
  { en: 'Goat', emoji: '🐐', icon: '/photos/goat.jpg', iconAlt: 'A group of brown goats with horns is pictured outdoors on a farm in Alkmaar, Netherlands.', category: 'animais' },
  { en: 'Mouse', emoji: '🐭', icon: '/photos/mouse.jpg', iconAlt: 'A cute wood mouse in a lush green natural setting in Staffordshire, England.', category: 'animais' },
  { en: 'Shark', emoji: '🦈', icon: '/photos/shark.jpg', iconAlt: 'Large shark gracefully swimming in aquarium as people take photos with their phones.', category: 'animais' },

  // Comidas
  { en: 'Rice', emoji: '🍚', icon: '/photos/rice.jpg', iconAlt: 'Delicious steaming fried rice in a black ceramic bowl with chopsticks, perfect for an appetizing meal.', category: 'comidas' },
  { en: 'Bread', emoji: '🍞', icon: '/photos/bread.jpg', iconAlt: 'A loaf of rustic bread partially sliced on a round wooden board, accompanied by a knife.', category: 'comidas' },
  { en: 'Egg', emoji: '🥚', icon: '/photos/egg.jpg', iconAlt: 'A flat lay of brown eggs and cracked shell on a black background, perfect for culinary themes.', category: 'comidas' },
  { en: 'Meat', emoji: '🍖', icon: '/photos/meat.jpg', iconAlt: 'Appetizing meat dish on a plate with hands holding a fork. Perfect for culinary blogs.', category: 'comidas' },
  { en: 'Pizza', emoji: '🍕', icon: '/photos/pizza.jpg', iconAlt: 'Savor a mouthwatering vegetarian pizza loaded with fresh ingredients in this appetizing flatlay.', category: 'comidas' },
  { en: 'Apple', emoji: '🍎', icon: '/photos/apple.jpg', iconAlt: 'Minimalist photo of a whole and halved green apple on a pastel blue background, ideal for food and health themes.', category: 'comidas' },
  { en: 'Banana', emoji: '🍌', icon: '/photos/banana.jpg', iconAlt: 'Bright yellow bananas arranged on a purple surface in a playful flat lay pattern.', category: 'comidas' },
  { en: 'Cheese', emoji: '🧀', icon: '/photos/cheese.jpg', iconAlt: 'A delectable brunch platter featuring assorted cheeses, fruits, and bagel with orange juice.', category: 'comidas' },
  { en: 'Cake', emoji: '🎂', icon: '/photos/cake.jpg', iconAlt: 'Close-up of a glazed cake topped with nuts and seeds, perfect for dessert photography.', category: 'comidas' },
  { en: 'Candy', emoji: '🍬', icon: '/photos/candy.jpg', iconAlt: 'Vibrant assortment of sugar-coated gumdrops. Perfect for candy themes.', category: 'comidas' },
  { en: 'Sandwich', emoji: '🥪', icon: '/photos/sandwich.jpg', iconAlt: 'Close-up of a gourmet sandwich with prosciutto, cheese, and greens on a wooden board.', category: 'comidas' },
  { en: 'Soup', emoji: '🍲', icon: '/photos/soup.jpg', iconAlt: 'A person enjoying soup with bread in a cozy indoor restaurant setting.', category: 'comidas' },
  { en: 'Ice cream', emoji: '🍦', icon: '/photos/ice-cream.jpg', iconAlt: 'A vibrant pink ice cream truck parked on a sunny day in New York City.', category: 'comidas' },
  { en: 'Cookie', emoji: '🍪', icon: '/photos/cookie.jpg', iconAlt: 'Stack of delicious homemade cookies with powdered sugar, perfect for snacking and baking inspiration.', category: 'comidas' },
  { en: 'Chocolate', emoji: '🍫', icon: '/photos/chocolate.jpg', iconAlt: 'An artistic flat lay of diverse chocolates arranged on a yellow background highlighting chocolate variety.', category: 'comidas' },
  { en: 'Potato', emoji: '🥔', icon: '/photos/potato.jpg', iconAlt: 'Tasty potato wedges seasoned and served on parchment paper, perfect for a delicious snack or side dish.', category: 'comidas' },
  { en: 'Tomato', emoji: '🍅', icon: '/photos/tomato.jpg', iconAlt: 'From above through glass view of background of many ripe red round shaped tomatoes with shiny surface', category: 'comidas' },
  { en: 'Onion', emoji: '🧅', icon: '/photos/onion.jpg', iconAlt: 'Artistic close-up of a sliced red onion revealing its texture and layers against a purple backdrop.', category: 'comidas' },
  { en: 'Garlic', emoji: '🧄', icon: '/photos/garlic.jpg', iconAlt: 'A detailed close-up of a fresh garlic bulb on a neutral background, perfect for culinary themes.', category: 'comidas' },

  // Bebidas
  { en: 'Water', emoji: '💧', icon: '/photos/water.jpg', iconAlt: 'A refreshing close-up of a water splash with lemon slices and mint leaves in a glass.', category: 'bebidas' },
  { en: 'Milk', emoji: '🥛', icon: '/photos/milk.jpg', iconAlt: 'A person in black holds a glass of milk on a yellow plastic stool outdoors.', category: 'bebidas' },
  { en: 'Coffee', emoji: '☕', icon: '/photos/coffee.jpg', iconAlt: 'Motivational coffee mug with frothy cappuccino, surrounded by coffee beans and topped with a cookie. Perfect cozy morning.', category: 'bebidas' },
  { en: 'Tea', emoji: '🍵', icon: '/photos/tea.jpg', iconAlt: 'A warm glass of tea with steam rising, set in a cozy atmosphere with bokeh lighting.', category: 'bebidas' },
  { en: 'Juice', emoji: '🧃', icon: '/photos/juice.jpg', iconAlt: 'A refreshing orange cocktail with a flower garnish served outdoors in Kerman, Iran.', category: 'bebidas' },
  { en: 'Soda', emoji: '🥤', icon: '/photos/soda.jpg', iconAlt: 'A striking red beverage can placed on a tiled backdrop offering stark contrast.', category: 'bebidas' },
  { en: 'Wine', emoji: '🍷', icon: '/photos/wine.jpg', iconAlt: 'A bottle of Canaletto Montepulciano wine with a glass on a wooden surface, beautifully lit by sunlight.', category: 'bebidas' },
  { en: 'Beer', emoji: '🍺', icon: '/photos/beer.jpg', iconAlt: 'Friends clinking beer bottles in a lively indoor gathering, capturing celebration and camaraderie.', category: 'bebidas' },
  { en: 'Lemonade', emoji: '🍋', icon: '/photos/lemonade.jpg', iconAlt: 'Glass bottle of lemonade with mint and lemon slices for a fresh, natural drink.', category: 'bebidas' },
  { en: 'Smoothie', emoji: '🥤', icon: '/photos/smoothie.jpg', iconAlt: 'Adult woman drinking a healthy green smoothie with fresh spinach leaves. Vibrant and refreshing.', category: 'bebidas' },

  // Roupas
  { en: 'Shirt', emoji: '👕', icon: '/photos/shirt.jpg', iconAlt: 'Red and yellow t-shirts neatly hanging indoors on a black clothing rack.', category: 'roupas' },
  { en: 'Pants', emoji: '👖', icon: '/photos/pants.jpg', iconAlt: 'Top view of a modern outfit with red pants, white top, and accessories on wooden floor.', category: 'roupas' },
  { en: 'Shoes', emoji: '👟', icon: '/photos/shoes.jpg', iconAlt: 'Close-up of black and white sneakers with red trim on a cardboard box.', category: 'roupas' },
  { en: 'Hat', emoji: '🎩', icon: '/photos/hat.jpg', iconAlt: 'Black and white photo featuring stylish fedora hats on a rustic wooden table, highlighting their classic design.', category: 'roupas' },
  { en: 'Dress', emoji: '👗', icon: '/photos/dress.jpg', iconAlt: 'Stylish flatlay of a light blue striped dress with shoes and accessories.', category: 'roupas' },
  { en: 'Jacket', emoji: '🧥', icon: '/photos/jacket.jpg', iconAlt: 'Black and white photo of a gray jacket on a hanger indoors, showcasing minimalist style.', category: 'roupas' },
  { en: 'Socks', emoji: '🧦', icon: '/photos/socks.jpg', iconAlt: 'Colorful sock with matching clothespins on a pink backdrop, perfect for creative layouts.', category: 'roupas' },
  { en: 'Ring', emoji: '💍', icon: '/photos/ring.jpg', iconAlt: 'Close-up of a luxurious diamond ring with intricate design on a black surface.', category: 'roupas' },
  { en: 'Glove', emoji: '🧤', icon: '/photos/glove.jpg', iconAlt: 'Close-up of brown leather gloves, perfect for winter fashion and warmth.', category: 'roupas' },
  { en: 'Scarf', emoji: '🧣', icon: '/photos/scarf.jpg', iconAlt: 'Stylish Asian woman in grayscale, wearing sunglasses, scarf, and gloves.', category: 'roupas' },
  { en: 'Tie', emoji: '👔', icon: '/photos/tie.jpg', iconAlt: 'A colorful assortment of rolled ties showcasing patterns and textures, ideal for fashion enthusiasts.', category: 'roupas' },
  { en: 'Sunglasses', emoji: '🕶️', icon: '/photos/sunglasses.jpg', iconAlt: 'Confident woman posing in a black coat and sunglasses, exuding modern style.', category: 'roupas' },
  { en: 'Coat', emoji: '🧥', icon: '/photos/coat.jpg', iconAlt: 'Fashion-forward models posing in coats on a city street, exuding modern style.', category: 'roupas' },
  { en: 'Boots', emoji: '🥾', icon: '/photos/boots.png', iconAlt: 'Chic brown leather ankle boots with suede cuffs, ideal for fashion-forward styles.', category: 'roupas' },

  // Corpo humano
  { en: 'Eye', emoji: '👁️', icon: '/photos/eye.jpg', iconAlt: 'Macro shot highlighting the intricate details of a brown human eye, showcasing the iris and surrounding lashes.', category: 'corpo' },
  { en: 'Ear', emoji: '👂', icon: '/photos/ear.jpg', iconAlt: 'Detailed view of a human ear featuring multiple piercings and an emerald stud.', category: 'corpo' },
  { en: 'Nose', emoji: '👃', icon: '/photos/nose.jpg', iconAlt: 'Detailed side view of a woman\'s nose and lips with natural skin texture.', category: 'corpo' },
  { en: 'Mouth', emoji: '👄', icon: '/photos/mouth.jpg', iconAlt: 'Close-up of a pill on a woman\'s tongue highlighting medication and health themes.', category: 'corpo' },
  { en: 'Hand', emoji: '✋', icon: '/photos/hand.jpg', iconAlt: 'Elegant human hand reaching into soft, warm light creating a serene and artistic effect.', category: 'corpo' },
  { en: 'Foot', emoji: '🦶', icon: '/photos/foot.jpg', iconAlt: 'Close-up image showing a person barefoot with rolled-up jeans, framed by shoes.', category: 'corpo' },
  { en: 'Arm', emoji: '💪', icon: '/photos/arm.jpg', iconAlt: 'Elegant arm entwined with measuring tape in neutral-toned setting, perfect for fashion or health themes.', category: 'corpo' },
  { en: 'Leg', emoji: '🦵', icon: '/photos/leg.jpg', iconAlt: 'Surreal photo featuring a mirror reflecting an arm and leg on a wooden floor.', category: 'corpo' },
  { en: 'Heart', emoji: '❤️', icon: '/photos/heart.jpg', iconAlt: 'Close-up of pink heart-shaped bleeding heart flowers (Lamprocapnos spectabilis) hanging delicately on a branch.', category: 'corpo' },
  { en: 'Tooth', emoji: '🦷', icon: '/photos/tooth.jpg', iconAlt: 'Dentist demonstrating proper teeth brushing technique on a dental model for patient education.', category: 'corpo' },
  { en: 'Tongue', emoji: '👅', icon: '/photos/tongue.jpg', iconAlt: 'Close-up image of a person placing a pill on their tongue, symbolizing medication or health care.', category: 'corpo' },
  { en: 'Brain', emoji: '🧠', icon: '/photos/brain.jpg', iconAlt: 'A human brain model placed on a blue plate, viewed from above against a pastel background.', category: 'corpo' },
  { en: 'Bone', emoji: '🦴', icon: '/photos/bone.jpg', iconAlt: 'Grayscale image of a person holding a skull, conveying a mysterious atmosphere.', category: 'corpo' },
  { en: 'Finger', emoji: '👆', icon: '/photos/finger.jpg', iconAlt: '3D illustration of a hand pointing with index finger on a black background.', category: 'corpo' },

  // Transportes
  { en: 'Car', emoji: '🚗', icon: '/photos/car.jpg', iconAlt: 'White Dodge Challenger Hellcat with headlights on, parked in a dimly lit parking garage in San Antonio.', category: 'transportes' },
  { en: 'Bus', emoji: '🚌', icon: '/photos/bus.jpg', iconAlt: 'Capture of a city bus moving at night with blurred background, illustrating urban transportation.', category: 'transportes' },
  { en: 'Bicycle', emoji: '🚲', icon: '/photos/bicycle.jpg', iconAlt: 'Colorful vintage bicycle with a basket by a serene pond in a sunny park setting.', category: 'transportes' },
  { en: 'Train', emoji: '🚂', icon: '/photos/train.jpg', iconAlt: 'Overhead shot of two trains at a Moscow metro station, showcasing urban transportation.', category: 'transportes' },
  { en: 'Airplane', emoji: '✈️', icon: '/photos/airplane.jpg', iconAlt: 'Close-up of a vintage airplane propeller displayed outdoors against a clear blue sky.', category: 'transportes' },
  { en: 'Boat', emoji: '⛵', icon: '/photos/boat.jpg', iconAlt: 'Sailboat docked at Härnösand marina with historic architecture in background.', category: 'transportes' },
  { en: 'Taxi', emoji: '🚕', icon: '/photos/taxi.jpg', iconAlt: 'Cab driving on road in city street with modern illuminated buildings and signboards with hieroglyphs near green plants at night', category: 'transportes' },

  // Cores — cada uma já É a própria imagem, sem ambiguidade possível
  { en: 'Red', emoji: '🔴', icon: '/photos/red.jpg', iconAlt: 'Rich red fabric texture, perfect for backgrounds and design elements.', category: 'cores' },
  { en: 'Blue', emoji: '🔵', icon: '/photos/blue.jpg', iconAlt: 'Seamless blue fabric texture ideal for backgrounds and design projects.', category: 'cores' },
  { en: 'Green', emoji: '🟢', icon: '/photos/green.jpg', iconAlt: 'Smooth lime green fabric texture ideal for backgrounds and designs.', category: 'cores' },
  { en: 'Yellow', emoji: '🟡', icon: '/photos/yellow.jpg', iconAlt: 'Abstract yellow texture with grunge details for creative design.', category: 'cores' },
  { en: 'Black', emoji: '⚫', icon: '/photos/black.jpg', iconAlt: 'A minimalistic and textured black fabric background, ideal for use in design and artistic projects.', category: 'cores' },
  { en: 'White', emoji: '⚪', icon: '/photos/white.jpg', iconAlt: 'High-resolution image of plain white paper texture, perfect for backgrounds.', category: 'cores' },
  { en: 'Orange', emoji: '🟠', icon: '/photos/orange.jpg', iconAlt: 'Close-up of a vibrant orange abstract texture on canvas with bold brushstrokes.', category: 'cores' },
  { en: 'Pink', emoji: '🩷', icon: '/photos/pink.jpg', iconAlt: 'A vivid pink textured background perfect for artistic and feminine designs.', category: 'cores' },
  { en: 'Purple', emoji: '🟣', icon: '/photos/purple.jpg', iconAlt: 'Detailed close-up of a deep purple textured fabric surface.', category: 'cores' },
  { en: 'Brown', emoji: '🟤', icon: '/photos/brown.png', iconAlt: 'High-quality textured brown surface ideal for wallpapers or backgrounds.', category: 'cores' },

  // Esportes
  { en: 'Ball', emoji: '⚽', icon: '/photos/ball.jpg', iconAlt: 'Soccer ball on a lush green field seen through netting, perfect for sports themes.', category: 'esportes' },
  { en: 'Chess', emoji: '♟️', icon: '/photos/chess.jpg', iconAlt: 'Detailed view of chess pieces lined up on a wooden board, focusing on pawns.', category: 'esportes' },
  { en: 'Goal', emoji: '🥅', icon: '/photos/goal.jpg', iconAlt: 'Empty soccer goal on a pastel-colored court under a cloudy sky.', category: 'esportes' },
  { en: 'Dice', emoji: '🎲', icon: '/photos/dice.jpg', iconAlt: 'Black and metallic dice on a detailed board game map, perfect for RPG fans.', category: 'esportes' },
  { en: 'Running', emoji: '🏃', icon: '/photos/running.jpg', iconAlt: 'Focused young male athlete running on an outdoor track, showcasing determination and fitness.', category: 'esportes' },
  { en: 'Swimming', emoji: '🏊', icon: '/photos/swimming.jpg', iconAlt: 'A woman wearing goggles floats in clear blue water using a pink pool noodle.', category: 'esportes' },

  // Casa
  { en: 'House', emoji: '🏠', icon: '/photos/house.jpg', iconAlt: 'A picturesque red house surrounded by greenery in an urban setting in Istanbul, Turkey.', category: 'casa' },
  { en: 'Door', emoji: '🚪', icon: '/photos/door.jpg', iconAlt: 'Explore a serene minimalist interior with sunlight streaming on a floral cushion and modern doors.', category: 'casa' },
  { en: 'Window', emoji: '🪟', icon: '/photos/window.jpg', iconAlt: 'A peaceful outdoor scene viewed from an interior window, featuring lush green trees.', category: 'casa' },
  { en: 'Bed', emoji: '🛏️', icon: '/photos/bed.jpg', iconAlt: 'A modern bedroom with stylish decor and abundant natural light', category: 'casa' },
  { en: 'Chair', emoji: '🪑', icon: '/photos/chair.jpg', iconAlt: 'A minimalist setting featuring two yellow wooden chairs beside a modern table.', category: 'casa' },
  { en: 'Sofa', emoji: '🛋️', icon: '/photos/sofa.jpg', iconAlt: 'A modern leather sofa against a brick wall in an elegant living room with wooden flooring.', category: 'casa' },
  { en: 'TV', emoji: '📺', icon: '/photos/tv.jpg', iconAlt: 'Cozy living room featuring a wall-mounted TV, wooden shelves, and potted plants.', category: 'casa' },
  { en: 'Clock', emoji: '🕐', icon: '/photos/clock.jpg', iconAlt: 'Rustic blue alarm clock showing close-up of clock face and time, retro design.', category: 'casa' },
  { en: 'Key', emoji: '🔑', icon: '/photos/key.jpg', iconAlt: 'Weathered rusty metal key hanging on rope on shabby green wooden door of house', category: 'casa' },
  { en: 'Shower', emoji: '🚿', icon: '/photos/shower.jpg', iconAlt: 'Close-up of a modern shower head with water streaming in a white bathroom setting.', category: 'casa' },

  // Família
  { en: 'Mother', emoji: '👩', icon: '/photos/mother.jpg', iconAlt: 'Warm portrait of a mother and son sharing a happy embrace at home.', category: 'familia' },
  { en: 'Father', emoji: '👨', icon: '/photos/father.jpg', iconAlt: 'A joyful family portrait featuring a father and his two sons dressed in white.', category: 'familia' },
  { en: 'Brother', emoji: '👦', icon: '/photos/brother.jpg', iconAlt: 'A joyful brother and sister smiling outdoors in a sunlit garden. Perfect stock photo for family and lifestyle themes.', category: 'familia' },
  { en: 'Sister', emoji: '👧', icon: '/photos/sister.jpg', iconAlt: 'A captivating portrait of two young sisters with striking blue eyes in a studio setting.', category: 'familia' },
  { en: 'Baby', emoji: '👶', icon: '/photos/baby.jpg', iconAlt: 'Charming black and white portrait of a baby lying on a soft surface, capturing innocence.', category: 'familia' },
  { en: 'Grandmother', emoji: '👵', icon: '/photos/grandmother.jpg', iconAlt: 'A smiling elderly woman with Asian descent sitting indoors, exuding warmth and contentment.', category: 'familia' },
  { en: 'Grandfather', emoji: '👴', icon: '/photos/grandfather.jpg', iconAlt: 'Black and white image of a grandfather and grandson sharing a tender moment.', category: 'familia' },
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
