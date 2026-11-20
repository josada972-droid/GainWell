import type { RecipeDef } from "./build";

/** Snacks, smoothies and desserts (Stage 7G). 19 recipes, 2 Caribbean-tagged. */
export const snacks: RecipeDef[] = [
  {
    slug: "banana-peanut-butter-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 5,
    servings: 1,
    macros: [24, 60, 24],
    title: [
      "Banana peanut butter smoothie",
      "Smoothie banane et beurre de cacahuète",
    ],
    summary: [
      "Thick, cold and sweet; the easiest way to add a few hundred calories.",
      "Épais, froid et sucré : la façon la plus simple d'ajouter quelques centaines de calories.",
    ],
    ingredients: [
      ["1 banana", "1 banane"],
      ["30 g peanut butter", "30 g de beurre de cacahuète"],
      ["250 ml whole milk", "250 ml de lait entier"],
      ["30 g rolled oats", "30 g de flocons d'avoine"],
      ["5 ml honey", "5 ml de miel"],
    ],
    steps: [
      [
        "Put the oats and milk in the blender first and let them sit two minutes.",
        "Mettre l'avoine et le lait dans le blender et laisser reposer deux minutes.",
      ],
      [
        "Add the banana, peanut butter and honey and blend one minute.",
        "Ajouter la banane, le beurre de cacahuète et le miel et mixer une minute.",
      ],
      [
        "Pour and drink while it is cold.",
        "Verser et boire pendant que c'est froid.",
      ],
    ],
    tip: [
      "A frozen banana makes it thicker without adding anything.",
      "Une banane surgelée l'épaissit sans rien ajouter.",
    ],
  },
  {
    slug: "chocolate-oat-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 5,
    servings: 1,
    macros: [18, 66, 16],
    title: ["Chocolate oat smoothie", "Smoothie chocolat et avoine"],
    summary: [
      "Cocoa, oats and milk; it drinks like a milkshake and holds like a meal.",
      "Cacao, avoine et lait : ça se boit comme un milkshake et ça tient comme un repas.",
    ],
    ingredients: [
      ["40 g rolled oats", "40 g de flocons d'avoine"],
      ["300 ml whole milk", "300 ml de lait entier"],
      ["10 g cocoa powder", "10 g de cacao en poudre"],
      ["1 banana", "1 banane"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Soak the oats in the milk for three minutes.",
        "Faire tremper l'avoine dans le lait trois minutes.",
      ],
      [
        "Add cocoa, banana and honey and blend until smooth.",
        "Ajouter cacao, banane et miel et mixer jusqu'à obtenir une texture lisse.",
      ],
      ["Serve cold.", "Servir froid."],
    ],
    tip: [
      "Cocoa and banana hide the taste of oats completely.",
      "Le cacao et la banane cachent totalement le goût de l'avoine.",
    ],
  },
  {
    slug: "mango-yogurt-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 5,
    servings: 2,
    macros: [14, 52, 10],
    title: ["Mango yogurt smoothie", "Smoothie mangue et yaourt"],
    summary: [
      "Frozen mango and yogurt; sharp, cold and not too sweet.",
      "Mangue surgelée et yaourt : acidulé, froid et pas trop sucré.",
    ],
    ingredients: [
      ["300 g frozen mango", "300 g de mangue surgelée"],
      ["200 g plain yogurt", "200 g de yaourt nature"],
      ["150 ml whole milk", "150 ml de lait entier"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Blend the mango with the yogurt and milk.",
        "Mixer la mangue avec le yaourt et le lait.",
      ],
      [
        "Add the honey to taste and blend again.",
        "Ajouter le miel selon le goût et mixer de nouveau.",
      ],
      [
        "Serve immediately, before it separates.",
        "Servir immédiatement, avant que ça ne se sépare.",
      ],
    ],
    tip: [
      "Frozen mango saves you the knife work and keeps it cold.",
      "La mangue surgelée évite la découpe et garde la boisson froide.",
    ],
  },
  {
    slug: "berry-oat-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 5,
    servings: 1,
    macros: [16, 58, 12],
    title: ["Berry and oat smoothie", "Smoothie fruits rouges et avoine"],
    summary: [
      "Frozen berries all year; oats make it hold until the next meal.",
      "Des fruits rouges surgelés toute l'année ; l'avoine le fait tenir jusqu'au repas suivant.",
    ],
    ingredients: [
      ["150 g frozen berries", "150 g de fruits rouges surgelés"],
      ["30 g rolled oats", "30 g de flocons d'avoine"],
      ["250 ml whole milk", "250 ml de lait entier"],
      ["100 g plain yogurt", "100 g de yaourt nature"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Blend the oats with the milk first, so they break down.",
        "Mixer d'abord l'avoine avec le lait pour qu'elle se défasse.",
      ],
      [
        "Add the berries, yogurt and honey and blend until thick.",
        "Ajouter les fruits rouges, le yaourt et le miel et mixer jusqu'à ce que ce soit épais.",
      ],
      [
        "Drink with a wide straw; it is too thick for a thin one.",
        "Boire avec une paille large : c'est trop épais pour une fine.",
      ],
    ],
    tip: [
      "Blending the oats first is what stops the gritty texture.",
      "Mixer l'avoine d'abord évite la texture granuleuse.",
    ],
  },
  {
    slug: "banana-coconut-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook", "caribbean"],
    prep: 5,
    servings: 2,
    macros: [12, 58, 16],
    title: ["Banana and coconut smoothie", "Smoothie banane et coco"],
    summary: [
      "Coconut milk, banana and a little lime; tastes like the islands.",
      "Lait de coco, banane et un peu de citron vert : un goût des îles.",
    ],
    ingredients: [
      ["2 bananas", "2 bananes"],
      ["250 ml coconut milk", "250 ml de lait de coco"],
      ["100 ml water", "100 ml d'eau"],
      ["1 lime", "1 citron vert"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Blend the banana with the coconut milk and water.",
        "Mixer la banane avec le lait de coco et l'eau.",
      ],
      [
        "Add the lime juice and honey and blend again.",
        "Ajouter le jus de citron vert et le miel et mixer de nouveau.",
      ],
      [
        "Serve over ice if you like it colder.",
        "Servir sur glace si vous l'aimez plus froid.",
      ],
    ],
    tip: [
      "The lime is what stops it tasting flat and sweet.",
      "Le citron vert l'empêche d'être plat et trop sucré.",
    ],
  },
  {
    slug: "strawberry-milk-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 5,
    servings: 2,
    macros: [12, 48, 12],
    title: ["Strawberry milk smoothie", "Smoothie fraise et lait"],
    summary: [
      "Three ingredients, two minutes, and children drink it without asking.",
      "Trois ingrédients, deux minutes, et les enfants le boivent sans demander.",
    ],
    ingredients: [
      ["300 g strawberries", "300 g de fraises"],
      ["350 ml whole milk", "350 ml de lait entier"],
      ["100 g plain yogurt", "100 g de yaourt nature"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Hull the strawberries and blend them with the milk.",
        "Équeuter les fraises et les mixer avec le lait.",
      ],
      [
        "Add the yogurt and honey and blend briefly.",
        "Ajouter le yaourt et le miel et mixer brièvement.",
      ],
      ["Pour into two glasses.", "Verser dans deux verres."],
    ],
    tip: [
      "Frozen strawberries work and are cheaper out of season.",
      "Les fraises surgelées font l'affaire et coûtent moins cher hors saison.",
    ],
  },
  {
    slug: "apple-oat-smoothie",
    category: "smoothie",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 8,
    servings: 2,
    macros: [14, 62, 10],
    title: ["Apple and oat smoothie", "Smoothie pomme et avoine"],
    summary: [
      "An apple, oats and cinnamon; it tastes like a baked apple, cold.",
      "Une pomme, de l'avoine et de la cannelle : un goût de pomme au four, glacé.",
    ],
    ingredients: [
      ["2 apples, cored", "2 pommes, épépinées"],
      ["40 g rolled oats", "40 g de flocons d'avoine"],
      ["300 ml whole milk", "300 ml de lait entier"],
      ["5 g cinnamon", "5 g de cannelle"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Blend the oats with the milk for thirty seconds.",
        "Mixer l'avoine avec le lait trente secondes.",
      ],
      [
        "Add the apple, cinnamon and honey and blend until smooth.",
        "Ajouter la pomme, la cannelle et le miel et mixer jusqu'à ce que ce soit lisse.",
      ],
      [
        "Drink straight away; apple browns quickly.",
        "Boire tout de suite : la pomme brunit vite.",
      ],
    ],
    tip: [
      "Leave the skin on for fibre and a little colour.",
      "Laisser la peau pour les fibres et un peu de couleur.",
    ],
  },
  {
    slug: "homemade-trail-mix",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 5,
    servings: 6,
    macros: [8, 24, 14],
    title: ["Homemade trail mix", "Mélange de fruits secs maison"],
    summary: [
      "Nuts, raisins and seeds in a jar; cheaper than the branded bags.",
      "Noix, raisins et graines dans un bocal : moins cher que les sachets de marque.",
    ],
    ingredients: [
      ["200 g peanuts", "200 g de cacahuètes"],
      ["100 g raisins", "100 g de raisins secs"],
      ["100 g almonds", "100 g d'amandes"],
      ["50 g sunflower seeds", "50 g de graines de tournesol"],
      ["50 g dark chocolate, chopped", "50 g de chocolat noir, concassé"],
    ],
    steps: [
      ["Mix everything in a bowl.", "Tout mélanger dans un bol."],
      [
        "Divide between six small jars or bags.",
        "Répartir dans six petits bocaux ou sachets.",
      ],
      [
        "Keep in a cupboard; it lasts a month.",
        "Garder dans un placard ; ça se garde un mois.",
      ],
    ],
    tip: [
      "Portion it now, or the whole jar goes in one sitting.",
      "Faire les portions maintenant, sinon le bocal entier y passe.",
    ],
  },
  {
    slug: "cheese-crackers-grapes",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 5,
    servings: 2,
    macros: [14, 26, 18],
    title: ["Cheese, crackers and grapes", "Fromage, crackers et raisin"],
    summary: [
      "Not cooking; assembling. It is still a real snack.",
      "Pas de cuisson, juste de l'assemblage. Cela reste un vrai en-cas.",
    ],
    ingredients: [
      ["80 g cheddar", "80 g de cheddar"],
      ["40 g crackers", "40 g de crackers"],
      ["100 g grapes", "100 g de raisin"],
      ["20 g walnuts", "20 g de noix"],
    ],
    steps: [
      ["Cut the cheese into slices.", "Couper le fromage en tranches."],
      [
        "Arrange on a plate with the crackers, grapes and walnuts.",
        "Disposer sur une assiette avec les crackers, le raisin et les noix.",
      ],
      [
        "Eat slowly; this one is easy to finish too fast.",
        "Manger lentement : celui-ci se termine vite.",
      ],
    ],
    tip: [
      "Cheese at room temperature tastes stronger than cold cheese.",
      "Le fromage à température ambiante a plus de goût que froid.",
    ],
  },
  {
    slug: "hummus-veg-sticks",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 10,
    servings: 2,
    macros: [10, 24, 14],
    title: ["Hummus with vegetable sticks", "Houmous et bâtonnets de légumes"],
    summary: [
      "A tub of hummus and whatever vegetables are in the drawer.",
      "Un pot de houmous et les légumes du bac à légumes.",
    ],
    ingredients: [
      ["150 g hummus", "150 g de houmous"],
      ["1 carrot, cut into sticks", "1 carotte, en bâtonnets"],
      ["1 courgette, cut into sticks", "1 courgette, en bâtonnets"],
      ["1 pepper, cut into strips", "1 poivron, en lanières"],
      ["10 ml olive oil", "10 ml d'huile d'olive"],
    ],
    steps: [
      [
        "Cut the vegetables into sticks about the size of a finger.",
        "Couper les légumes en bâtonnets de la taille d'un doigt.",
      ],
      [
        "Spoon the hummus into a small bowl and add the oil.",
        "Déposer le houmous dans un petit bol et ajouter l'huile.",
      ],
      ["Arrange the sticks around it.", "Disposer les bâtonnets autour."],
    ],
    tip: [
      "Cut them thin enough to bite through; thick sticks are hard work.",
      "Les couper assez fins pour être croqués : épais, c'est fatigant.",
    ],
  },
  {
    slug: "banana-bread",
    category: "snack",
    tags: ["vegetarian", "budget"],
    prep: 20,
    cook: 55,
    servings: 8,
    macros: [6, 42, 12],
    title: ["Banana bread", "Cake à la banane"],
    summary: [
      "The use for black bananas; one loaf covers a week of snacks.",
      "La recette des bananes noires : un cake couvre une semaine de goûters.",
    ],
    ingredients: [
      ["3 very ripe bananas", "3 bananes très mûres"],
      ["200 g plain flour", "200 g de farine"],
      ["100 g sugar", "100 g de sucre"],
      ["2 eggs", "2 œufs"],
      ["100 g butter, melted", "100 g de beurre fondu"],
      ["10 g baking powder", "10 g de levure chimique"],
    ],
    steps: [
      [
        "Mash the bananas and mix in the sugar, eggs and melted butter.",
        "Écraser les bananes et mélanger avec le sucre, les œufs et le beurre fondu.",
      ],
      [
        "Fold in the flour and baking powder without over-mixing.",
        "Incorporer la farine et la levure sans trop mélanger.",
      ],
      [
        "Bake in a lined loaf tin at 170 °C for 50 to 55 minutes.",
        "Cuire dans un moule à cake chemisé à 170 °C 50 à 55 minutes.",
      ],
    ],
    tip: [
      "A skewer comes out with crumbs, not wet batter, when it is done.",
      "La pointe du couteau ressort avec des miettes, pas de pâte humide, quand c'est cuit.",
    ],
  },
  {
    slug: "oat-cookies",
    category: "snack",
    tags: ["vegetarian", "quick", "budget"],
    prep: 15,
    cook: 12,
    servings: 8,
    macros: [4, 30, 10],
    title: ["Oat cookies", "Biscuits à l'avoine"],
    summary: [
      "One bowl, no mixer, and they keep for a week in a tin.",
      "Un bol, pas de batteur, et ils se gardent une semaine en boîte.",
    ],
    ingredients: [
      ["150 g rolled oats", "150 g de flocons d'avoine"],
      ["100 g butter, softened", "100 g de beurre, ramolli"],
      ["80 g sugar", "80 g de sucre"],
      ["1 egg", "1 œuf"],
      ["100 g plain flour", "100 g de farine"],
      ["5 g baking soda", "5 g de bicarbonate"],
    ],
    steps: [
      [
        "Mix the butter and sugar, then beat in the egg.",
        "Mélanger le beurre et le sucre, puis incorporer l'œuf.",
      ],
      [
        "Stir in the oats, flour and baking soda.",
        "Incorporer l'avoine, la farine et le bicarbonate.",
      ],
      [
        "Shape 16 balls, flatten them and bake at 180 °C for 12 minutes.",
        "Former 16 boules, les aplatir et cuire à 180 °C 12 minutes.",
      ],
    ],
    tip: [
      "They firm up as they cool; take them out while still soft.",
      "Ils durcissent en refroidissant : les sortir encore mous.",
    ],
  },
  {
    slug: "rice-pudding",
    category: "snack",
    tags: ["vegetarian", "quick", "budget"],
    prep: 5,
    cook: 35,
    servings: 4,
    macros: [8, 46, 10],
    title: ["Rice pudding", "Riz au lait"],
    summary: [
      "Milk, rice and sugar; warm or cold, it is a cheap dessert.",
      "Lait, riz et sucre : chaud ou froid, c'est un dessert économique.",
    ],
    ingredients: [
      ["150 g pudding rice", "150 g de riz à dessert"],
      ["750 ml whole milk", "750 ml de lait entier"],
      ["60 g sugar", "60 g de sucre"],
      ["5 g cinnamon", "5 g de cannelle"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Put everything except the cinnamon in a pan.",
        "Mettre tout sauf la cannelle dans une casserole.",
      ],
      [
        "Bring to a simmer and cook 30 minutes on the lowest heat, stirring often.",
        "Porter à frémissement et cuire 30 minutes à feu très doux en remuant souvent.",
      ],
      [
        "Serve warm or chilled, dusted with cinnamon.",
        "Servir tiède ou froid, saupoudré de cannelle.",
      ],
    ],
    tip: [
      "Stir more than you think; rice pudding catches at the bottom.",
      "Remuer plus que nécessaire : le riz au lait attache au fond.",
    ],
  },
  {
    slug: "fruit-yogurt-parfait",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 8,
    servings: 2,
    macros: [14, 40, 12],
    title: ["Fruit and yogurt parfait", "Parfait fruits et yaourt"],
    summary: [
      "Layers in a glass; it looks like effort and takes eight minutes.",
      "Des couches dans un verre : ça a l'air d'un effort et ça prend huit minutes.",
    ],
    ingredients: [
      ["250 g plain yogurt", "250 g de yaourt nature"],
      ["100 g berries", "100 g de fruits rouges"],
      ["1 banana, sliced", "1 banane, en rondelles"],
      ["30 g granola", "30 g de granola"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Spoon a layer of yogurt into two glasses.",
        "Déposer une couche de yaourt dans deux verres.",
      ],
      [
        "Add fruit, then granola, then yogurt again.",
        "Ajouter des fruits, puis du granola, puis de nouveau du yaourt.",
      ],
      [
        "Finish with honey and eat with a long spoon.",
        "Finir au miel et manger avec une longue cuillère.",
      ],
    ],
    tip: [
      "Add the granola last so it stays crunchy.",
      "Ajouter le granola en dernier pour qu'il reste croquant.",
    ],
  },
  {
    slug: "chocolate-mug-cake",
    category: "snack",
    tags: ["vegetarian", "quick", "budget"],
    prep: 5,
    cook: 2,
    servings: 1,
    macros: [8, 52, 14],
    title: ["Chocolate mug cake", "Gâteau au chocolat en tasse"],
    summary: [
      "Two minutes in the microwave when you want something warm and sweet.",
      "Deux minutes au micro-ondes quand vous voulez quelque chose de chaud et sucré.",
    ],
    ingredients: [
      ["40 g plain flour", "40 g de farine"],
      ["20 g cocoa powder", "20 g de cacao en poudre"],
      ["30 g sugar", "30 g de sucre"],
      ["40 ml milk", "40 ml de lait"],
      ["20 g butter, melted", "20 g de beurre fondu"],
      ["2 g baking powder", "2 g de levure chimique"],
    ],
    steps: [
      [
        "Mix the dry ingredients in a large mug.",
        "Mélanger les ingrédients secs dans une grande tasse.",
      ],
      [
        "Stir in the milk and melted butter until smooth.",
        "Incorporer le lait et le beurre fondu jusqu'à obtenir une pâte lisse.",
      ],
      [
        "Microwave 90 seconds; it rises fast, so use a big mug.",
        "Passer 90 secondes au micro-ondes ; ça monte vite, donc utiliser une grande tasse.",
      ],
    ],
    tip: [
      "Stop at 90 seconds; longer turns it rubbery.",
      "S'arrêter à 90 secondes : plus longtemps, il devient caoutchouteux.",
    ],
  },
  {
    slug: "apple-peanut-butter-slices",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 5,
    servings: 1,
    macros: [8, 24, 14],
    title: [
      "Apple slices with peanut butter",
      "Tranches de pomme au beurre de cacahuète",
    ],
    summary: [
      "Crunch and fat, no plate needed.",
      "Du croquant et du gras, sans assiette.",
    ],
    ingredients: [
      ["1 apple", "1 pomme"],
      ["25 g peanut butter", "25 g de beurre de cacahuète"],
      ["a pinch of cinnamon", "une pincée de cannelle"],
      ["10 g raisins", "10 g de raisins secs"],
    ],
    steps: [
      [
        "Core the apple and cut it into slices.",
        "Épépiner la pomme et la couper en tranches.",
      ],
      [
        "Spread peanut butter on each slice.",
        "Étaler du beurre de cacahuète sur chaque tranche.",
      ],
      [
        "Dust with cinnamon and add a few raisins.",
        "Saupoudrer de cannelle et ajouter quelques raisins.",
      ],
    ],
    tip: [
      "A crisp apple matters more than the brand of peanut butter.",
      "Une pomme croquante compte plus que la marque du beurre de cacahuète.",
    ],
  },
  {
    slug: "tropical-fruit-salad",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook", "caribbean"],
    prep: 12,
    servings: 3,
    macros: [4, 34, 4],
    title: ["Tropical fruit salad", "Salade de fruits tropicaux"],
    summary: [
      "Mango, pineapple and banana with lime; sweet without sugar.",
      "Mangue, ananas et banane au citron vert : sucré sans sucre.",
    ],
    ingredients: [
      ["1 mango, cubed", "1 mangue, en cubes"],
      ["300 g pineapple, cubed", "300 g d'ananas, en cubes"],
      ["2 bananas, sliced", "2 bananes, en rondelles"],
      ["1 lime", "1 citron vert"],
      ["a few mint leaves", "quelques feuilles de menthe"],
    ],
    steps: [
      [
        "Cut the fruit into similar-sized pieces.",
        "Couper les fruits en morceaux de taille similaire.",
      ],
      [
        "Squeeze the lime over and toss gently.",
        "Presser le citron vert dessus et mélanger doucement.",
      ],
      [
        "Tear the mint over the top and chill twenty minutes.",
        "Effeuiller la menthe dessus et réfrigérer vingt minutes.",
      ],
    ],
    tip: [
      "Lime stops banana browning; add it first.",
      "Le citron vert empêche la banane de brunir : l'ajouter en premier.",
    ],
  },
  {
    slug: "accras",
    category: "snack",
    tags: ["vegetarian", "caribbean", "budget"],
    prep: 20,
    cook: 15,
    servings: 4,
    macros: [8, 32, 12],
    title: ["Salt cod fritters (accras)", "Accras de morue"],
    summary: [
      "Salted cod fritters, the Antillean snack; a small batch goes a long way.",
      "Beignets de morue salée, l'en-cas antillais ; une petite fournée suffit.",
    ],
    ingredients: [
      ["250 g salted cod", "250 g de morue salée"],
      ["150 g plain flour", "150 g de farine"],
      ["1 onion, finely chopped", "1 oignon, finement haché"],
      ["2 spring onions, sliced", "2 oignons nouveaux, émincés"],
      ["5 g chilli, chopped", "5 g de piment, haché"],
      ["1 l oil, for frying", "1 l d'huile, pour la friture"],
    ],
    steps: [
      [
        "Soak the cod overnight, then simmer ten minutes, drain and flake it.",
        "Faire dessaler la morue une nuit, puis la cuire dix minutes, l'égoutter et l'émietter.",
      ],
      [
        "Mix the flour with 150 ml water into a thick batter, then add cod, onion and chilli.",
        "Mélanger la farine avec 150 ml d'eau en pâte épaisse, puis ajouter morue, oignon et piment.",
      ],
      [
        "Fry spoonfuls in hot oil for three minutes until golden.",
        "Frire des cuillerées dans l'huile chaude trois minutes jusqu'à ce qu'elles dorent.",
      ],
    ],
    tip: [
      "Squeeze the cod dry or the batter will not hold.",
      "Bien presser la morue, sinon la pâte ne tient pas.",
    ],
  },
  {
    slug: "coconut-chia-pudding",
    category: "snack",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 10,
    servings: 2,
    macros: [8, 32, 16],
    title: ["Coconut chia pudding", "Pudding de chia à la coco"],
    summary: [
      "Made in a jar at night, eaten cold the next day.",
      "Préparé en bocal le soir, mangé froid le lendemain.",
    ],
    ingredients: [
      ["40 g chia seeds", "40 g de graines de chia"],
      ["250 ml coconut milk", "250 ml de lait de coco"],
      ["100 g mango, cubed", "100 g de mangue, en cubes"],
      ["15 ml maple syrup", "15 ml de sirop d'érable"],
    ],
    steps: [
      [
        "Whisk the chia into the coconut milk with the syrup.",
        "Fouetter le chia dans le lait de coco avec le sirop.",
      ],
      [
        "Wait five minutes, whisk again to break the clumps, then chill overnight.",
        "Attendre cinq minutes, fouetter de nouveau pour casser les grumeaux, puis réfrigérer toute la nuit.",
      ],
      ["Top with mango before eating.", "Garnir de mangue avant de manger."],
    ],
    tip: [
      "The second whisk is the step people skip, and then it clumps.",
      "Le second fouettage est l'étape que l'on saute, et c'est là que ça s'agglomère.",
    ],
  },
];
