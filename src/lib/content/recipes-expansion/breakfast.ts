import type { RecipeDef } from "./build";

/** Breakfast expansion (Stage 7G). 23 recipes, bilingual, Atwater-consistent. */
export const breakfast: RecipeDef[] = [
  {
    slug: "banana-peanut-butter-overnight-oats",
    category: "breakfast",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 10,
    servings: 2,
    macros: [22, 74, 22],
    title: [
      "Banana and peanut butter overnight oats",
      "Overnight oats banane et beurre de cacahuète",
    ],
    summary: [
      "Made the night before, so breakfast is already waiting and nothing has to be decided at 7 a.m.",
      "Préparé la veille : le petit-déjeuner attend déjà et rien n'est à décider à 7 h.",
    ],
    ingredients: [
      ["120 g rolled oats", "120 g de flocons d'avoine"],
      ["300 ml whole milk", "300 ml de lait entier"],
      ["2 bananas, sliced", "2 bananes, en rondelles"],
      ["40 g peanut butter", "40 g de beurre de cacahuète"],
      ["10 g chia seeds", "10 g de graines de chia"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Stir the oats, milk, chia and salt in a bowl or two jars.",
        "Mélanger l'avoine, le lait, le chia et le sel dans un bol ou deux bocaux.",
      ],
      [
        "Add the peanut butter in small spoonfuls so it does not sit in one lump.",
        "Ajouter le beurre de cacahuète par petites cuillères pour qu'il ne reste pas en un seul bloc.",
      ],
      [
        "Cover and refrigerate overnight; add the banana in the morning.",
        "Couvrir et réfrigérer toute la nuit ; ajouter la banane le matin.",
      ],
    ],
    tip: [
      "If it sets too firm, loosen with 30 ml of milk before eating.",
      "Si le mélange est trop ferme, le détendre avec 30 ml de lait avant de manger.",
    ],
  },
  {
    slug: "chocolate-oatmeal",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 5,
    cook: 10,
    servings: 1,
    macros: [16, 78, 16],
    title: ["Chocolate oatmeal", "Porridge au chocolat"],
    summary: [
      "Porridge with cocoa and a little peanut butter; tastes like dessert, costs almost nothing.",
      "Un porridge au cacao avec un peu de beurre de cacahuète : un goût de dessert pour presque rien.",
    ],
    ingredients: [
      ["60 g rolled oats", "60 g de flocons d'avoine"],
      ["250 ml whole milk", "250 ml de lait entier"],
      ["10 g cocoa powder", "10 g de cacao en poudre"],
      ["15 g peanut butter", "15 g de beurre de cacahuète"],
      ["10 ml honey", "10 ml de miel"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Warm the milk with the salt, then stir in the oats.",
        "Chauffer le lait avec le sel, puis incorporer l'avoine.",
      ],
      [
        "Cook for six to eight minutes on low heat, stirring now and then.",
        "Cuire six à huit minutes à feu doux en remuant de temps en temps.",
      ],
      [
        "Take off the heat and stir in the cocoa, peanut butter and honey.",
        "Retirer du feu et incorporer le cacao, le beurre de cacahuète et le miel.",
      ],
    ],
    tip: [
      "Add the cocoa off the heat; boiled cocoa turns bitter.",
      "Ajouter le cacao hors du feu : bouilli, il devient amer.",
    ],
  },
  {
    slug: "granola-yogurt-bowl",
    category: "breakfast",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 5,
    servings: 1,
    macros: [20, 62, 22],
    title: ["Granola and yogurt bowl", "Bol de granola et yaourt"],
    summary: [
      "Three layers, no cooking, and it keeps you going until lunch.",
      "Trois couches, aucune cuisson, et de quoi tenir jusqu'au déjeuner.",
    ],
    ingredients: [
      ["200 g plain yogurt", "200 g de yaourt nature"],
      ["50 g granola", "50 g de granola"],
      ["1 banana, sliced", "1 banane, en rondelles"],
      ["15 g almonds", "15 g d'amandes"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      ["Spoon the yogurt into a bowl.", "Déposer le yaourt dans un bol."],
      [
        "Add the granola, then the banana and almonds.",
        "Ajouter le granola, puis la banane et les amandes.",
      ],
      [
        "Finish with the honey, just before eating so the granola stays crunchy.",
        "Finir avec le miel, juste avant de manger pour que le granola reste croquant.",
      ],
    ],
    tip: [
      "Keep the granola separate until the last moment if you are eating later.",
      "Garder le granola à part jusqu'au dernier moment si vous mangez plus tard.",
    ],
  },
  {
    slug: "banana-pancakes",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 15,
    cook: 10,
    servings: 2,
    macros: [16, 64, 18],
    title: ["Banana pancakes", "Pancakes à la banane"],
    summary: [
      "Three ingredients and a fork; the banana does the sweetening.",
      "Trois ingrédients et une fourchette : la banane s'occupe du sucré.",
    ],
    ingredients: [
      ["2 ripe bananas", "2 bananes bien mûres"],
      ["2 eggs", "2 œufs"],
      ["100 g plain flour", "100 g de farine"],
      ["10 g baking powder", "10 g de levure chimique"],
      ["20 g butter, for the pan", "20 g de beurre, pour la poêle"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Mash the bananas, then beat in the eggs.",
        "Écraser les bananes, puis incorporer les œufs au fouet.",
      ],
      [
        "Stir in the flour, baking powder and salt; the batter stays lumpy.",
        "Incorporer la farine, la levure et le sel ; la pâte reste grumeleuse.",
      ],
      [
        "Cook small pancakes in butter over medium heat, two minutes a side.",
        "Cuire de petits pancakes au beurre à feu moyen, deux minutes par face.",
      ],
    ],
    tip: [
      "Small pancakes flip more easily than one large one.",
      "De petits pancakes se retournent plus facilement qu'un seul grand.",
    ],
  },
  {
    slug: "french-toast",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 8,
    servings: 2,
    macros: [18, 58, 20],
    title: ["French toast with cinnamon", "Pain perdu à la cannelle"],
    summary: [
      "Stale bread is the right bread here; eggs and milk do the rest.",
      "Le pain rassis est le bon pain ici ; les œufs et le lait font le reste.",
    ],
    ingredients: [
      ["4 slices of bread, a day old", "4 tranches de pain de la veille"],
      ["2 eggs", "2 œufs"],
      ["150 ml whole milk", "150 ml de lait entier"],
      ["5 g cinnamon", "5 g de cannelle"],
      ["30 g butter", "30 g de beurre"],
      ["20 ml maple syrup", "20 ml de sirop d'érable"],
    ],
    steps: [
      [
        "Beat the eggs with the milk and cinnamon in a shallow dish.",
        "Battre les œufs avec le lait et la cannelle dans un plat creux.",
      ],
      [
        "Soak each slice for twenty seconds a side, no longer.",
        "Tremper chaque tranche vingt secondes par face, pas plus.",
      ],
      [
        "Fry in butter over medium heat until golden, then serve with syrup.",
        "Cuire au beurre à feu moyen jusqu'à ce qu'elles soient dorées, puis servir avec le sirop.",
      ],
    ],
    tip: [
      "A firmer bread soaks without falling apart.",
      "Un pain plus ferme s'imbibe sans se défaire.",
    ],
  },
  {
    slug: "egg-cheese-sandwich",
    category: "breakfast",
    tags: ["highProtein", "quick"],
    prep: 10,
    cook: 5,
    servings: 1,
    macros: [28, 40, 24],
    title: ["Egg and cheese sandwich", "Sandwich œuf et fromage"],
    summary: [
      "Fried egg, melted cheese, toasted bread: ready before the kettle boils twice.",
      "Œuf au plat, fromage fondu, pain grillé : prêt avant que la bouilloire bout deux fois.",
    ],
    ingredients: [
      ["2 eggs", "2 œufs"],
      ["2 slices of bread", "2 tranches de pain"],
      ["40 g cheddar", "40 g de cheddar"],
      ["15 g butter", "15 g de beurre"],
      [
        "a few drops of hot sauce, optional",
        "quelques gouttes de sauce piquante, facultatif",
      ],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Toast the bread and butter one side of each slice.",
        "Griller le pain et beurrer une face de chaque tranche.",
      ],
      [
        "Fry the eggs in the same pan, breaking the yolks gently.",
        "Cuire les œufs dans la même poêle en cassant doucement les jaunes.",
      ],
      [
        "Lay the cheese on the hot egg, then close the sandwich and press for a minute.",
        "Poser le fromage sur l'œuf chaud, fermer le sandwich et presser une minute.",
      ],
    ],
    tip: [
      "Cheese goes on the egg, never on the bread: it melts better.",
      "Le fromage va sur l'œuf, jamais sur le pain : il fond mieux.",
    ],
  },
  {
    slug: "avocado-toast-eggs",
    category: "breakfast",
    tags: ["vegetarian", "quick"],
    prep: 10,
    cook: 6,
    servings: 1,
    macros: [20, 34, 30],
    title: ["Avocado toast with eggs", "Tartine d'avocat et œufs"],
    summary: [
      "Smashed avocado, two eggs, lemon and salt on thick toast.",
      "Avocat écrasé, deux œufs, citron et sel sur un pain épais.",
    ],
    ingredients: [
      ["2 slices of thick bread", "2 tranches de pain épais"],
      ["1 ripe avocado", "1 avocat bien mûr"],
      ["2 eggs", "2 œufs"],
      ["10 ml lemon juice", "10 ml de jus de citron"],
      ["10 ml olive oil", "10 ml d'huile d'olive"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Toast the bread and poach or fry the eggs.",
        "Griller le pain et pocher ou frire les œufs.",
      ],
      [
        "Mash the avocado with the lemon, salt and pepper, keeping some texture.",
        "Écraser l'avocat avec le citron, le sel et le poivre en gardant un peu de texture.",
      ],
      [
        "Spread on the toast, set the eggs on top and finish with olive oil.",
        "Étaler sur le pain, poser les œufs et finir à l'huile d'olive.",
      ],
    ],
    tip: [
      "A ripe avocado gives when pressed; a hard one is not ready.",
      "Un avocat mûr cède sous le doigt ; un avocat dur n'est pas prêt.",
    ],
  },
  {
    slug: "yogurt-fruit-nuts-bowl",
    category: "breakfast",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 5,
    servings: 1,
    macros: [18, 54, 20],
    title: ["Yogurt, fruit and nuts bowl", "Bol de yaourt, fruits et noix"],
    summary: [
      "Whatever fruit is in the fridge, plus nuts for the part that keeps you full.",
      "Les fruits du frigo, plus des noix pour la partie qui rassasie.",
    ],
    ingredients: [
      ["250 g plain yogurt", "250 g de yaourt nature"],
      ["1 apple or 1 pear", "1 pomme ou 1 poire"],
      ["1 kiwi", "1 kiwi"],
      ["20 g walnuts", "20 g de noix"],
      ["10 ml honey", "10 ml de miel"],
    ],
    steps: [
      [
        "Cut the fruit into bite-sized pieces.",
        "Couper les fruits en morceaux de la taille d'une bouchée.",
      ],
      [
        "Spoon the yogurt into a bowl and add the fruit.",
        "Déposer le yaourt dans un bol et ajouter les fruits.",
      ],
      [
        "Break the walnuts over the top and add the honey.",
        "Casser les noix au-dessus et ajouter le miel.",
      ],
    ],
    tip: [
      "Frozen berries work all year and need no chopping.",
      "Les fruits rouges surgelés font l'affaire toute l'année et ne demandent aucune découpe.",
    ],
  },
  {
    slug: "breakfast-burrito",
    category: "breakfast",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 10,
    servings: 2,
    macros: [24, 56, 24],
    title: ["Breakfast burrito", "Burrito du petit-déjeuner"],
    summary: [
      "Eggs, beans and cheese in a warm tortilla; wrap both and take one with you.",
      "Œufs, haricots et fromage dans une tortilla chaude ; roulez les deux et emportez-en un.",
    ],
    ingredients: [
      ["4 eggs", "4 œufs"],
      ["2 large tortillas", "2 grandes tortillas"],
      ["120 g cooked black beans", "120 g de haricots noirs cuits"],
      ["60 g cheddar, grated", "60 g de cheddar râpé"],
      ["1 tomato, diced", "1 tomate, en dés"],
      ["20 g butter", "20 g de beurre"],
    ],
    steps: [
      [
        "Warm the beans in a pan with a spoon of water.",
        "Réchauffer les haricots dans une poêle avec une cuillère d'eau.",
      ],
      [
        "Scramble the eggs in butter, softly, then take the pan off the heat.",
        "Brouiller les œufs au beurre, doucement, puis retirer la poêle du feu.",
      ],
      [
        "Fill each tortilla with eggs, beans, cheese and tomato, fold the sides in and roll.",
        "Garnir chaque tortilla d'œufs, de haricots, de fromage et de tomate, rabattre les côtés et rouler.",
      ],
    ],
    tip: [
      "Let the filling cool slightly before rolling, or the tortilla tears.",
      "Laisser un peu refroidir la garniture avant de rouler, sinon la tortilla se déchire.",
    ],
  },
  {
    slug: "shakshuka-toast",
    category: "breakfast",
    tags: ["vegetarian", "quick"],
    prep: 15,
    cook: 15,
    servings: 2,
    macros: [20, 40, 22],
    title: ["Shakshuka with toast", "Chakchouka avec pain grillé"],
    summary: [
      "Eggs poached in a quick tomato and pepper sauce, with bread to mop it up.",
      "Œufs pochés dans une sauce rapide tomate-poivron, avec du pain pour saucer.",
    ],
    ingredients: [
      ["4 eggs", "4 œufs"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 red pepper, sliced", "1 poivron rouge, en lamelles"],
      ["1 onion, sliced", "1 oignon, en lamelles"],
      ["30 ml olive oil", "30 ml d'huile d'olive"],
      ["4 slices of bread", "4 tranches de pain"],
    ],
    steps: [
      [
        "Soften the onion and pepper in the oil for six minutes.",
        "Faire fondre l'oignon et le poivron dans l'huile six minutes.",
      ],
      [
        "Add the tomatoes and simmer eight minutes until thick.",
        "Ajouter les tomates et mijoter huit minutes jusqu'à épaississement.",
      ],
      [
        "Make four wells, break an egg into each, cover and cook five minutes.",
        "Faire quatre puits, casser un œuf dans chacun, couvrir et cuire cinq minutes.",
      ],
    ],
    tip: [
      "Cover the pan: the eggs set from the steam and stay soft.",
      "Couvrir la poêle : les œufs prennent à la vapeur et restent moelleux.",
    ],
  },
  {
    slug: "honey-almond-porridge",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 5,
    cook: 10,
    servings: 1,
    macros: [15, 70, 18],
    title: ["Honey and almond porridge", "Porridge miel et amandes"],
    summary: [
      "The plain one, done well: oats, milk, honey, toasted almonds.",
      "Le classique bien fait : avoine, lait, miel, amandes grillées.",
    ],
    ingredients: [
      ["60 g rolled oats", "60 g de flocons d'avoine"],
      ["300 ml whole milk", "300 ml de lait entier"],
      ["20 g almonds, chopped", "20 g d'amandes, concassées"],
      ["15 ml honey", "15 ml de miel"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Toast the almonds in a dry pan for two minutes, then set aside.",
        "Griller les amandes à sec deux minutes, puis réserver.",
      ],
      [
        "Warm the milk with the salt and stir in the oats.",
        "Chauffer le lait avec le sel et incorporer l'avoine.",
      ],
      [
        "Cook eight minutes, then serve with the honey and almonds.",
        "Cuire huit minutes, puis servir avec le miel et les amandes.",
      ],
    ],
    tip: [
      "Salt in porridge is not optional; it makes the oats taste of something.",
      "Le sel dans le porridge n'est pas facultatif : il donne du goût à l'avoine.",
    ],
  },
  {
    slug: "peanut-butter-banana-toast",
    category: "breakfast",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 5,
    servings: 1,
    macros: [18, 52, 20],
    title: [
      "Peanut butter and banana toast",
      "Tartine beurre de cacahuète et banane",
    ],
    summary: [
      "Two minutes of work for a breakfast that actually holds until lunch.",
      "Deux minutes de travail pour un petit-déjeuner qui tient vraiment jusqu'au déjeuner.",
    ],
    ingredients: [
      ["2 slices of bread", "2 tranches de pain"],
      ["30 g peanut butter", "30 g de beurre de cacahuète"],
      ["1 banana, sliced", "1 banane, en rondelles"],
      ["a pinch of cinnamon", "une pincée de cannelle"],
    ],
    steps: [
      [
        "Toast the bread if you like it warm.",
        "Griller le pain si vous l'aimez chaud.",
      ],
      [
        "Spread the peanut butter edge to edge.",
        "Étaler le beurre de cacahuète jusqu'aux bords.",
      ],
      [
        "Layer the banana on top and dust with cinnamon.",
        "Disposer la banane par-dessus et saupoudrer de cannelle.",
      ],
    ],
    tip: [
      "Peanut butter with no added sugar keeps better and costs less.",
      "Un beurre de cacahuète sans sucre ajouté se garde mieux et coûte moins cher.",
    ],
  },
  {
    slug: "veggie-omelette-cheese",
    category: "breakfast",
    tags: ["vegetarian", "highProtein", "quick", "budget"],
    prep: 10,
    cook: 8,
    servings: 1,
    macros: [26, 20, 26],
    title: [
      "Vegetable omelette with cheese",
      "Omelette aux légumes et fromage",
    ],
    summary: [
      "Three eggs, whatever vegetables are left, and a handful of cheese.",
      "Trois œufs, les légumes qui restent et une poignée de fromage.",
    ],
    ingredients: [
      ["3 eggs", "3 œufs"],
      ["1 small courgette, grated", "1 petite courgette, râpée"],
      ["1 tomato, diced", "1 tomate, en dés"],
      ["40 g cheese, grated", "40 g de fromage, râpé"],
      ["15 g butter", "15 g de beurre"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Squeeze the grated courgette in a clean cloth to remove water.",
        "Presser la courgette râpée dans un torchon pour retirer l'eau.",
      ],
      [
        "Soften the courgette and tomato in butter for three minutes.",
        "Faire fondre la courgette et la tomate au beurre trois minutes.",
      ],
      [
        "Pour in the beaten eggs, cook gently, add the cheese and fold.",
        "Verser les œufs battus, cuire doucement, ajouter le fromage et plier.",
      ],
    ],
    tip: [
      "Wet vegetables make a weeping omelette; squeeze them first.",
      "Les légumes humides font pleurer l'omelette : les presser d'abord.",
    ],
  },
  {
    slug: "ricotta-berry-toast",
    category: "breakfast",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 8,
    servings: 1,
    macros: [16, 46, 18],
    title: ["Ricotta and berry toast", "Tartine ricotta et fruits rouges"],
    summary: [
      "Thick toast, cold ricotta, berries on top; no cooking at all.",
      "Pain épais, ricotta froide, fruits rouges par-dessus ; aucune cuisson.",
    ],
    ingredients: [
      ["2 slices of thick bread", "2 tranches de pain épais"],
      ["120 g ricotta", "120 g de ricotta"],
      ["100 g berries", "100 g de fruits rouges"],
      ["10 ml honey", "10 ml de miel"],
      [
        "a few mint leaves, optional",
        "quelques feuilles de menthe, facultatif",
      ],
    ],
    steps: [
      [
        "Toast the bread and let it cool for a minute.",
        "Griller le pain et le laisser tiédir une minute.",
      ],
      ["Spread the ricotta thickly.", "Étaler la ricotta généreusement."],
      [
        "Crush half the berries with a fork and lay the rest on top with the honey.",
        "Écraser la moitié des fruits à la fourchette et disposer le reste par-dessus avec le miel.",
      ],
    ],
    tip: [
      "Ricotta straight from the fridge spreads better than warm ricotta.",
      "La ricotta sortie du froid s'étale mieux que tiède.",
    ],
  },
  {
    slug: "breakfast-potato-hash",
    category: "breakfast",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 20,
    servings: 2,
    macros: [22, 48, 22],
    title: [
      "Breakfast potato hash with eggs",
      "Pommes de terre sautées et œufs",
    ],
    summary: [
      "Potatoes, onion and eggs in one pan; the cheap breakfast that fills.",
      "Pommes de terre, oignon et œufs dans une poêle : le petit-déjeuner économique qui rassasie.",
    ],
    ingredients: [
      [
        "500 g potatoes, diced small",
        "500 g de pommes de terre, en petits dés",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["4 eggs", "4 œufs"],
      ["30 ml olive oil", "30 ml d'huile d'olive"],
      ["salt, pepper and paprika", "sel, poivre et paprika"],
    ],
    steps: [
      [
        "Fry the potato cubes in oil for twelve minutes, turning twice.",
        "Faire dorer les dés de pommes de terre à l'huile douze minutes, en remuant deux fois.",
      ],
      [
        "Add the onion and paprika and cook five minutes more.",
        "Ajouter l'oignon et le paprika et cuire cinq minutes de plus.",
      ],
      [
        "Make four wells, break in the eggs, cover and cook until set.",
        "Faire quatre puits, casser les œufs, couvrir et cuire jusqu'à prise.",
      ],
    ],
    tip: [
      "Small cubes cook through; large ones brown outside and stay hard.",
      "De petits dés cuisent à cœur ; de gros dorent dehors et restent durs.",
    ],
  },
  {
    slug: "spiced-apple-porridge",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 8,
    cook: 12,
    servings: 2,
    macros: [14, 66, 14],
    title: ["Spiced apple porridge", "Porridge aux pommes épicées"],
    summary: [
      "Grated apple and cinnamon cook into the oats and sweeten them without sugar.",
      "La pomme râpée et la cannelle cuisent dans l'avoine et la sucrent sans sucre.",
    ],
    ingredients: [
      ["100 g rolled oats", "100 g de flocons d'avoine"],
      ["400 ml whole milk", "400 ml de lait entier"],
      ["2 apples, grated", "2 pommes, râpées"],
      ["5 g cinnamon", "5 g de cannelle"],
      ["20 g raisins", "20 g de raisins secs"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Warm the milk, oats, salt and cinnamon together.",
        "Chauffer ensemble le lait, l'avoine, le sel et la cannelle.",
      ],
      [
        "Add the grated apple and raisins and cook eight minutes, stirring.",
        "Ajouter la pomme râpée et les raisins et cuire huit minutes en remuant.",
      ],
      [
        "Serve when the oats have broken down and the apple has softened.",
        "Servir quand l'avoine s'est fondue et que la pomme a ramolli.",
      ],
    ],
    tip: [
      "Leave the skin on the apple; it thickens the porridge.",
      "Laisser la peau de la pomme : elle épaissit le porridge.",
    ],
  },
  {
    slug: "egg-muffin-cups",
    category: "breakfast",
    tags: ["vegetarian", "highProtein", "quick"],
    prep: 15,
    cook: 22,
    servings: 3,
    macros: [20, 14, 20],
    title: ["Baked egg muffin cups", "Muffins aux œufs"],
    summary: [
      "Bake twelve at once and reheat two each morning; no pan on weekdays.",
      "En cuire douze d'un coup et en réchauffer deux chaque matin ; pas de poêle en semaine.",
    ],
    ingredients: [
      ["6 eggs", "6 œufs"],
      ["100 ml whole milk", "100 ml de lait entier"],
      ["80 g cheese, grated", "80 g de fromage, râpé"],
      ["1 red pepper, diced", "1 poivron rouge, en dés"],
      ["1 handful of spinach", "1 poignée d'épinards"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Heat the oven to 180 °C and oil a twelve-hole muffin tin.",
        "Préchauffer le four à 180 °C et huiler un moule à douze alvéoles.",
      ],
      [
        "Beat the eggs with the milk, salt and pepper.",
        "Battre les œufs avec le lait, le sel et le poivre.",
      ],
      [
        "Divide the cheese, pepper and spinach between the holes, pour the egg over and bake 20 minutes.",
        "Répartir le fromage, le poivron et les épinards dans les alvéoles, verser l'œuf et cuire 20 minutes.",
      ],
    ],
    tip: [
      "They puff in the oven and settle as they cool; that is normal.",
      "Ils gonflent au four et retombent en refroidissant : c'est normal.",
    ],
  },
  {
    slug: "cheese-tomato-toast",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 6,
    cook: 4,
    servings: 1,
    macros: [18, 40, 18],
    title: [
      "Grilled cheese and tomato toast",
      "Tartine fromage et tomate grillée",
    ],
    summary: [
      "Bread, tomato, cheese, four minutes under the grill.",
      "Pain, tomate, fromage, quatre minutes sous le gril.",
    ],
    ingredients: [
      ["2 slices of bread", "2 tranches de pain"],
      ["60 g cheese, sliced", "60 g de fromage, en tranches"],
      ["1 tomato, sliced", "1 tomate, en tranches"],
      ["5 ml olive oil", "5 ml d'huile d'olive"],
      ["dried oregano", "origan séché"],
    ],
    steps: [
      [
        "Toast the bread lightly and heat the grill.",
        "Griller légèrement le pain et allumer le gril.",
      ],
      [
        "Lay the tomato on the bread, then the cheese, then oregano and oil.",
        "Poser la tomate sur le pain, puis le fromage, puis l'origan et l'huile.",
      ],
      [
        "Grill until the cheese bubbles, about four minutes.",
        "Passer sous le gril jusqu'à ce que le fromage bouillonne, environ quatre minutes.",
      ],
    ],
    tip: [
      "Pat the tomato dry so the toast does not go soggy.",
      "Éponger la tomate pour que la tartine ne détrempe pas.",
    ],
  },
  {
    slug: "oat-crepes",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 15,
    cook: 12,
    servings: 2,
    macros: [16, 58, 16],
    title: [
      "Oat crepes with lemon and sugar",
      "Crêpes à l'avoine, citron et sucre",
    ],
    summary: [
      "Blitz oats into flour and you have crepes in half an hour.",
      "Mixer l'avoine en farine et vous avez des crêpes en une demi-heure.",
    ],
    ingredients: [
      ["100 g rolled oats", "100 g de flocons d'avoine"],
      ["2 eggs", "2 œufs"],
      ["250 ml whole milk", "250 ml de lait entier"],
      ["20 g sugar", "20 g de sucre"],
      ["1 lemon", "1 citron"],
      ["15 g butter, for the pan", "15 g de beurre, pour la poêle"],
    ],
    steps: [
      [
        "Blend the oats to a flour, then blend in the eggs, milk and sugar.",
        "Mixer l'avoine en farine, puis mixer avec les œufs, le lait et le sucre.",
      ],
      [
        "Rest the batter ten minutes so it thickens.",
        "Laisser reposer la pâte dix minutes pour qu'elle épaississe.",
      ],
      [
        "Cook thin crepes in butter, then serve with lemon juice and sugar.",
        "Cuire de fines crêpes au beurre, puis servir avec le jus de citron et du sucre.",
      ],
    ],
    tip: [
      "Oat flour drinks more milk than wheat flour; add 20 ml if needed.",
      "La farine d'avoine boit plus de lait que le blé : ajouter 20 ml si besoin.",
    ],
  },
  {
    slug: "breakfast-smoothie-bowl",
    category: "breakfast",
    tags: ["vegetarian", "quick", "noCook"],
    prep: 10,
    servings: 1,
    macros: [16, 64, 14],
    title: ["Breakfast smoothie bowl", "Bol smoothie du petit-déjeuner"],
    summary: [
      "A thick smoothie you eat with a spoon, with granola and fruit on top.",
      "Un smoothie épais qui se mange à la cuillère, avec granola et fruits dessus.",
    ],
    ingredients: [
      ["150 g frozen banana", "150 g de banane surgelée"],
      ["100 g plain yogurt", "100 g de yaourt nature"],
      ["80 ml whole milk", "80 ml de lait entier"],
      ["40 g granola", "40 g de granola"],
      ["50 g berries", "50 g de fruits rouges"],
    ],
    steps: [
      [
        "Blend the frozen banana, yogurt and milk until thick.",
        "Mixer la banane surgelée, le yaourt et le lait jusqu'à obtenir une texture épaisse.",
      ],
      ["Pour into a shallow bowl.", "Verser dans un bol peu profond."],
      [
        "Top with granola and berries and eat straight away.",
        "Garnir de granola et de fruits rouges et manger tout de suite.",
      ],
    ],
    tip: [
      "Frozen banana is what makes it spoonable; fresh banana makes it a drink.",
      "La banane surgelée le rend mangeable à la cuillère ; fraîche, elle en fait une boisson.",
    ],
  },
  {
    slug: "scrambled-tofu-toast",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 8,
    servings: 2,
    macros: [20, 30, 18],
    title: ["Scrambled tofu on toast", "Tofu brouillé sur tartine"],
    summary: [
      "Turmeric turns tofu yellow and savoury; no eggs needed.",
      "Le curcuma jaunit et assaisonne le tofu ; pas besoin d'œufs.",
    ],
    ingredients: [
      ["300 g firm tofu", "300 g de tofu ferme"],
      ["2 slices of bread", "2 tranches de pain"],
      ["1 small onion, chopped", "1 petit oignon, haché"],
      ["15 ml olive oil", "15 ml d'huile d'olive"],
      ["5 g turmeric", "5 g de curcuma"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Soften the onion in oil for four minutes.",
        "Faire fondre l'oignon à l'huile quatre minutes.",
      ],
      [
        "Crumble the tofu in with your hands, add the turmeric, salt and pepper, and cook five minutes.",
        "Émietter le tofu à la main, ajouter le curcuma, le sel et le poivre et cuire cinq minutes.",
      ],
      [
        "Pile onto toast while it is still warm.",
        "Empiler sur les tartines pendant que c'est encore chaud.",
      ],
    ],
    tip: [
      "Squeeze the tofu block first so it takes the colour instead of water.",
      "Presser le bloc de tofu d'abord pour qu'il prenne la couleur au lieu de l'eau.",
    ],
  },
  {
    slug: "coconut-porridge",
    category: "breakfast",
    tags: ["vegetarian", "quick", "budget"],
    prep: 5,
    cook: 12,
    servings: 2,
    macros: [12, 60, 20],
    title: ["Coconut porridge", "Porridge à la noix de coco"],
    summary: [
      "Half coconut milk, half water, and the oats taste like something else entirely.",
      "Moitié lait de coco, moitié eau : l'avoine prend un tout autre goût.",
    ],
    ingredients: [
      ["100 g rolled oats", "100 g de flocons d'avoine"],
      ["200 ml coconut milk", "200 ml de lait de coco"],
      ["200 ml water", "200 ml d'eau"],
      ["20 g desiccated coconut", "20 g de noix de coco râpée"],
      ["10 ml honey", "10 ml de miel"],
      ["a pinch of salt", "une pincée de sel"],
    ],
    steps: [
      [
        "Warm the coconut milk, water and salt, then add the oats.",
        "Chauffer le lait de coco, l'eau et le sel, puis ajouter l'avoine.",
      ],
      [
        "Cook ten minutes on low heat, stirring so it does not catch.",
        "Cuire dix minutes à feu doux en remuant pour que ça n'attache pas.",
      ],
      [
        "Toast the coconut in a dry pan and scatter it on top with the honey.",
        "Griller la noix de coco à sec et la parsemer avec le miel.",
      ],
    ],
    tip: [
      "Shake the coconut milk tin well before opening.",
      "Bien secouer la boîte de lait de coco avant de l'ouvrir.",
    ],
  },
  {
    slug: "bacon-egg-muffin",
    category: "breakfast",
    tags: ["highProtein", "quick"],
    prep: 12,
    cook: 10,
    servings: 2,
    macros: [30, 36, 26],
    title: ["Bacon and egg muffin", "Muffin bacon et œuf"],
    summary: [
      "The diner sandwich, made at home for a fraction of the price.",
      "Le sandwich du diner, fait à la maison pour une fraction du prix.",
    ],
    ingredients: [
      ["4 rashers of bacon", "4 tranches de bacon"],
      ["2 eggs", "2 œufs"],
      ["2 English muffins", "2 muffins anglais"],
      ["2 slices of cheddar", "2 tranches de cheddar"],
      ["15 g butter", "15 g de beurre"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Grill the bacon until it is crisp, then keep it warm.",
        "Griller le bacon jusqu'à ce qu'il soit croustillant, puis le garder au chaud.",
      ],
      [
        "Fry the eggs in butter, breaking the yolks.",
        "Cuire les œufs au beurre en cassant les jaunes.",
      ],
      [
        "Toast the muffins, layer cheese, bacon and egg, and close.",
        "Griller les muffins, empiler fromage, bacon et œuf, et refermer.",
      ],
    ],
    tip: [
      "Crisp bacon cuts cleanly with a knife; floppy bacon slides out of the sandwich.",
      "Le bacon croustillant se coupe net ; le bacon mou glisse hors du sandwich.",
    ],
  },
];
