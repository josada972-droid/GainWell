import type { RecipeDef } from "./build";

/** Lunch expansion (Stage 7G). 23 recipes, including 3 Caribbean-tagged. */
export const lunch: RecipeDef[] = [
  {
    slug: "chicken-pesto-pasta",
    category: "lunch",
    tags: ["highProtein"],
    prep: 20,
    cook: 12,
    servings: 2,
    macros: [38, 68, 26],
    title: ["Chicken pesto pasta", "Pâtes au poulet et pesto"],
    summary: [
      "Cold pesto, hot pasta and sliced chicken; a lunch that travels well.",
      "Pesto froid, pâtes chaudes et poulet émincé : un déjeuner qui voyage bien.",
    ],
    ingredients: [
      ["250 g pasta", "250 g de pâtes"],
      ["250 g chicken breast", "250 g de blanc de poulet"],
      ["60 g pesto", "60 g de pesto"],
      ["30 g parmesan", "30 g de parmesan"],
      ["15 ml olive oil", "15 ml d'huile d'olive"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Boil the pasta in salted water until just firm.",
        "Cuire les pâtes à l'eau salée jusqu'à ce qu'elles soient juste fermes.",
      ],
      [
        "Pan-fry the chicken in oil, six minutes a side, then slice it.",
        "Poêler le poulet à l'huile, six minutes par face, puis l'émincer.",
      ],
      [
        "Drain the pasta, keep 100 ml of water, and toss with pesto and a little of that water.",
        "Égoutter les pâtes, garder 100 ml d'eau et mélanger avec le pesto et un peu de cette eau.",
      ],
      [
        "Add the chicken and parmesan and eat warm or cold.",
        "Ajouter le poulet et le parmesan et manger chaud ou froid.",
      ],
    ],
    tip: [
      "The cooking water is what stops pesto turning into a paste.",
      "L'eau de cuisson empêche le pesto de devenir une pâte compacte.",
    ],
  },
  {
    slug: "chicken-rice-bowl",
    category: "lunch",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 15,
    servings: 2,
    macros: [36, 62, 22],
    title: ["Chicken and rice bowl", "Bol de poulet et riz"],
    summary: [
      "Rice, chicken, a crunchy vegetable and a spoon of sauce; assembled in fifteen minutes.",
      "Riz, poulet, un légume croquant et une cuillère de sauce : assemblé en quinze minutes.",
    ],
    ingredients: [
      ["300 g cooked rice", "300 g de riz cuit"],
      ["300 g chicken thigh, sliced", "300 g de cuisse de poulet, émincée"],
      ["1 carrot, grated", "1 carotte, râpée"],
      ["100 g cucumber, sliced", "100 g de concombre, en rondelles"],
      ["30 ml soy sauce", "30 ml de sauce soja"],
      ["15 ml oil", "15 ml d'huile"],
    ],
    steps: [
      [
        "Fry the chicken in oil over high heat for eight minutes.",
        "Sauter le poulet à l'huile à feu vif huit minutes.",
      ],
      [
        "Add the soy sauce at the end so it glazes rather than burns.",
        "Ajouter la sauce soja à la fin pour qu'elle nappe sans brûler.",
      ],
      [
        "Divide the rice between two bowls and add chicken, carrot and cucumber.",
        "Répartir le riz dans deux bols et ajouter poulet, carotte et concombre.",
      ],
    ],
    tip: [
      "Cold cooked rice from the day before fries better than fresh rice.",
      "Le riz cuit de la veille saute mieux que le riz frais.",
    ],
  },
  {
    slug: "beef-burrito-bowl",
    category: "lunch",
    tags: ["highProtein"],
    prep: 20,
    cook: 20,
    servings: 3,
    macros: [34, 66, 24],
    title: ["Beef burrito bowl", "Bol burrito au bœuf"],
    summary: [
      "Everything a burrito holds, without the rolling.",
      "Tout ce que contient un burrito, sans avoir à le rouler.",
    ],
    ingredients: [
      ["400 g beef mince", "400 g de bœuf haché"],
      ["450 g cooked rice", "450 g de riz cuit"],
      ["200 g canned black beans", "200 g de haricots noirs en conserve"],
      ["2 tomatoes, diced", "2 tomates, en dés"],
      ["100 g cheddar, grated", "100 g de cheddar, râpé"],
      ["10 g ground cumin", "10 g de cumin moulu"],
    ],
    steps: [
      [
        "Brown the beef with the cumin, breaking it up as it cooks.",
        "Faire dorer le bœuf avec le cumin en l'écrasant pendant la cuisson.",
      ],
      [
        "Warm the beans in a small pan with two spoons of water.",
        "Réchauffer les haricots dans une petite poêle avec deux cuillères d'eau.",
      ],
      [
        "Build three bowls with rice, beef, beans, tomato and cheese.",
        "Monter trois bols avec riz, bœuf, haricots, tomate et fromage.",
      ],
    ],
    tip: [
      "Season the rice with a little salt and lime; plain rice makes the bowl taste flat.",
      "Assaisonner le riz avec un peu de sel et de citron vert : sans ça, le bol est fade.",
    ],
  },
  {
    slug: "tuna-pasta-salad",
    category: "lunch",
    tags: ["highProtein", "quick", "budget"],
    prep: 15,
    cook: 10,
    servings: 2,
    macros: [32, 60, 22],
    title: ["Tuna pasta salad", "Salade de pâtes au thon"],
    summary: [
      "Made in the time the pasta boils, and better the next day.",
      "Prête le temps que les pâtes cuisent, et meilleure le lendemain.",
    ],
    ingredients: [
      ["200 g pasta", "200 g de pâtes"],
      ["160 g canned tuna", "160 g de thon en conserve"],
      ["150 g sweetcorn", "150 g de maïs doux"],
      ["100 g cucumber, diced", "100 g de concombre, en dés"],
      ["60 g mayonnaise", "60 g de mayonnaise"],
      ["20 ml lemon juice", "20 ml de jus de citron"],
    ],
    steps: [
      [
        "Boil the pasta, drain it and cool it under cold water.",
        "Cuire les pâtes, les égoutter et les refroidir à l'eau froide.",
      ],
      [
        "Drain the tuna and flake it into the pasta.",
        "Égoutter le thon et l'émietter dans les pâtes.",
      ],
      [
        "Add corn, cucumber, mayonnaise and lemon, and mix well.",
        "Ajouter le maïs, le concombre, la mayonnaise et le citron, et bien mélanger.",
      ],
    ],
    tip: [
      "Cool the pasta completely, or the mayonnaise splits.",
      "Refroidir complètement les pâtes, sinon la mayonnaise tranche.",
    ],
  },
  {
    slug: "creamy-mushroom-pasta",
    category: "lunch",
    tags: ["vegetarian", "quick"],
    prep: 15,
    cook: 15,
    servings: 2,
    macros: [22, 72, 26],
    title: ["Creamy mushroom pasta", "Pâtes crémeuses aux champignons"],
    summary: [
      "Mushrooms browned properly first, then cream; cheap and filling.",
      "Des champignons bien dorés d'abord, puis la crème : économique et rassasiant.",
    ],
    ingredients: [
      ["250 g pasta", "250 g de pâtes"],
      ["300 g mushrooms, sliced", "300 g de champignons, émincés"],
      ["200 ml cream", "200 ml de crème"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["30 g butter", "30 g de beurre"],
      ["30 g parmesan", "30 g de parmesan"],
    ],
    steps: [
      [
        "Brown the mushrooms in butter in a wide pan without stirring for five minutes.",
        "Faire dorer les champignons au beurre dans une grande poêle sans remuer cinq minutes.",
      ],
      [
        "Add the onion and cook four minutes more.",
        "Ajouter l'oignon et cuire quatre minutes de plus.",
      ],
      [
        "Pour in the cream, simmer three minutes, then toss with the drained pasta and parmesan.",
        "Verser la crème, mijoter trois minutes, puis mélanger avec les pâtes égouttées et le parmesan.",
      ],
    ],
    tip: [
      "A crowded pan steams mushrooms instead of browning them.",
      "Une poêle trop chargée fait suer les champignons au lieu de les dorer.",
    ],
  },
  {
    slug: "salmon-rice-bowl",
    category: "lunch",
    tags: ["highProtein"],
    prep: 20,
    cook: 15,
    servings: 2,
    macros: [32, 58, 24],
    title: ["Salmon rice bowl", "Bol de saumon et riz"],
    summary: [
      "Pan-seared salmon over rice with cucumber and a yogurt sauce.",
      "Saumon saisi sur riz avec concombre et une sauce au yaourt.",
    ],
    ingredients: [
      ["2 salmon fillets", "2 filets de saumon"],
      ["300 g cooked rice", "300 g de riz cuit"],
      ["150 g cucumber, sliced", "150 g de concombre, en rondelles"],
      ["120 g plain yogurt", "120 g de yaourt nature"],
      ["10 ml lemon juice", "10 ml de jus de citron"],
      ["15 ml oil", "15 ml d'huile"],
    ],
    steps: [
      [
        "Mix the yogurt with the lemon juice, salt and pepper.",
        "Mélanger le yaourt avec le jus de citron, le sel et le poivre.",
      ],
      [
        "Fry the salmon skin-side down in oil for four minutes, then two on the other side.",
        "Cuire le saumon côté peau à l'huile quatre minutes, puis deux de l'autre côté.",
      ],
      [
        "Divide rice and cucumber between bowls, add the salmon and spoon the sauce over.",
        "Répartir riz et concombre dans les bols, ajouter le saumon et napper de sauce.",
      ],
    ],
    tip: [
      "Salmon keeps cooking off the heat; take it out while the middle is still pink.",
      "Le saumon continue de cuire hors du feu : le sortir quand le cœur est encore rosé.",
    ],
  },
  {
    slug: "chickpea-rice-bowl",
    category: "lunch",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 12,
    servings: 2,
    macros: [20, 68, 18],
    title: ["Chickpea and rice bowl", "Bol de pois chiches et riz"],
    summary: [
      "A tin of chickpeas, cold rice and a sharp dressing; no stove at all.",
      "Une boîte de pois chiches, du riz froid et une vinaigrette relevée ; aucune cuisson.",
    ],
    ingredients: [
      [
        "400 g canned chickpeas, drained",
        "400 g de pois chiches en conserve, égouttés",
      ],
      ["300 g cooked rice", "300 g de riz cuit"],
      ["1 tomato, diced", "1 tomate, en dés"],
      ["1 small red onion, chopped", "1 petit oignon rouge, haché"],
      ["30 ml olive oil", "30 ml d'huile d'olive"],
      ["20 ml lemon juice", "20 ml de jus de citron"],
    ],
    steps: [
      [
        "Whisk the oil, lemon juice, salt and pepper in a large bowl.",
        "Fouetter l'huile, le jus de citron, le sel et le poivre dans un grand bol.",
      ],
      [
        "Add the chickpeas, rice, tomato and onion and toss until coated.",
        "Ajouter les pois chiches, le riz, la tomate et l'oignon et mélanger jusqu'à ce que tout soit enrobé.",
      ],
      [
        "Rest ten minutes before eating so the rice takes the dressing.",
        "Laisser reposer dix minutes avant de manger pour que le riz prenne la vinaigrette.",
      ],
    ],
    tip: [
      "Rinse tinned chickpeas; the liquid tastes of the tin.",
      "Rincer les pois chiches en conserve : le liquide a un goût de boîte.",
    ],
  },
  {
    slug: "beef-burger",
    category: "lunch",
    tags: ["highProtein"],
    prep: 20,
    cook: 12,
    servings: 2,
    macros: [36, 48, 30],
    title: ["Homemade beef burger", "Burger maison au bœuf"],
    summary: [
      "One good patty beats a stack of thin ones, and it costs less than takeaway.",
      "Une bonne galette vaut mieux qu'une pile de fines, et ça coûte moins qu'à emporter.",
    ],
    ingredients: [
      ["400 g beef mince", "400 g de bœuf haché"],
      ["2 burger buns", "2 pains à burger"],
      ["2 slices of cheddar", "2 tranches de cheddar"],
      ["1 tomato, sliced", "1 tomate, en tranches"],
      ["4 lettuce leaves", "4 feuilles de salade"],
      ["1 small onion, sliced", "1 petit oignon, en rondelles"],
    ],
    steps: [
      [
        "Shape the mince into two patties, wider than the buns, and season the outside.",
        "Former deux galettes plus larges que les pains et assaisonner l'extérieur.",
      ],
      [
        "Cook in a hot dry pan for four minutes a side without pressing them.",
        "Cuire dans une poêle chaude et sèche quatre minutes par face sans les presser.",
      ],
      [
        "Melt the cheese on the patties, toast the buns, then build with tomato, lettuce and onion.",
        "Faire fondre le fromage sur les galettes, griller les pains, puis monter avec tomate, salade et oignon.",
      ],
    ],
    tip: [
      "Do not press the patty; the juice you squeeze out is the point of it.",
      "Ne pas presser la galette : le jus que vous en chassez fait tout l'intérêt.",
    ],
  },
  {
    slug: "mediterranean-couscous",
    category: "lunch",
    tags: ["vegetarian", "quick", "budget"],
    prep: 15,
    cook: 10,
    servings: 3,
    macros: [18, 74, 18],
    title: ["Mediterranean couscous bowl", "Bol de couscous méditerranéen"],
    summary: [
      "Couscous, chickpeas, cucumber and feta; made once, eaten twice.",
      "Couscous, pois chiches, concombre et feta : préparé une fois, mangé deux fois.",
    ],
    ingredients: [
      ["200 g couscous", "200 g de couscous"],
      [
        "400 g canned chickpeas, drained",
        "400 g de pois chiches en conserve, égouttés",
      ],
      ["1 cucumber, diced", "1 concombre, en dés"],
      ["2 tomatoes, diced", "2 tomates, en dés"],
      ["100 g feta", "100 g de feta"],
      ["30 ml olive oil", "30 ml d'huile d'olive"],
    ],
    steps: [
      [
        "Pour 250 ml of boiling water over the couscous, cover and wait five minutes.",
        "Verser 250 ml d'eau bouillante sur le couscous, couvrir et attendre cinq minutes.",
      ],
      [
        "Fork it through with the olive oil, salt and pepper.",
        "L'égrener à la fourchette avec l'huile d'olive, le sel et le poivre.",
      ],
      [
        "Fold in the chickpeas, cucumber and tomato and crumble the feta over the top.",
        "Incorporer les pois chiches, le concombre et la tomate et émietter la feta dessus.",
      ],
    ],
    tip: [
      "Fork, never stir, the couscous; stirring makes it clump.",
      "Égrener le couscous à la fourchette, jamais en remuant : il s'agglomère.",
    ],
  },
  {
    slug: "tuna-melt-sandwich",
    category: "lunch",
    tags: ["highProtein", "quick"],
    prep: 10,
    cook: 5,
    servings: 1,
    macros: [32, 40, 24],
    title: ["Tuna melt sandwich", "Sandwich thon fondu"],
    summary: [
      "Tuna, sweetcorn and cheese, grilled until the top bubbles.",
      "Thon, maïs et fromage, passés au gril jusqu'à ce que le dessus bouillonne.",
    ],
    ingredients: [
      ["2 slices of bread", "2 tranches de pain"],
      ["120 g canned tuna", "120 g de thon en conserve"],
      ["50 g sweetcorn", "50 g de maïs doux"],
      ["40 g cheddar, grated", "40 g de cheddar, râpé"],
      ["20 g mayonnaise", "20 g de mayonnaise"],
      ["a pinch of black pepper", "une pincée de poivre noir"],
    ],
    steps: [
      [
        "Mix the drained tuna with the corn, mayonnaise and pepper.",
        "Mélanger le thon égoutté avec le maïs, la mayonnaise et le poivre.",
      ],
      [
        "Spread on the bread and cover with cheese.",
        "Étaler sur le pain et couvrir de fromage.",
      ],
      [
        "Grill for four minutes until the cheese melts and browns.",
        "Passer au gril quatre minutes jusqu'à ce que le fromage fonde et dore.",
      ],
    ],
    tip: [
      "Drain the tuna well, or the bread gives way.",
      "Bien égoutter le thon, sinon le pain se détrempe.",
    ],
  },
  {
    slug: "egg-salad-sandwich",
    category: "lunch",
    tags: ["vegetarian", "quick", "noCook", "budget"],
    prep: 12,
    servings: 2,
    macros: [20, 36, 22],
    title: ["Egg salad sandwich", "Sandwich à la salade d'œufs"],
    summary: [
      "Boil eggs the night before and this is a five-minute lunch.",
      "Faites cuire les œufs la veille et c'est un déjeuner en cinq minutes.",
    ],
    ingredients: [
      ["4 eggs", "4 œufs"],
      ["4 slices of bread", "4 tranches de pain"],
      ["40 g mayonnaise", "40 g de mayonnaise"],
      ["5 g mustard", "5 g de moutarde"],
      ["2 spring onions, sliced", "2 oignons nouveaux, émincés"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Boil the eggs ten minutes, cool them in cold water and peel.",
        "Cuire les œufs dix minutes, les refroidir à l'eau froide et les écaler.",
      ],
      [
        "Mash them roughly with mayonnaise, mustard, spring onion, salt and pepper.",
        "Les écraser grossièrement avec la mayonnaise, la moutarde, l'oignon, le sel et le poivre.",
      ],
      [
        "Spread between the bread slices and cut in half.",
        "Étaler entre les tranches de pain et couper en deux.",
      ],
    ],
    tip: [
      "Ten minutes gives a firm yolk that mashes without turning to paste.",
      "Dix minutes donnent un jaune ferme qui s'écrase sans devenir une pâte.",
    ],
  },
  {
    slug: "lentil-soup-bread",
    category: "lunch",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 30,
    servings: 4,
    macros: [18, 44, 10],
    title: ["Lentil soup with bread", "Soupe de lentilles avec pain"],
    summary: [
      "A pot for four from a bag of lentils and a carrot.",
      "Une marmite pour quatre à partir d'un sachet de lentilles et d'une carotte.",
    ],
    ingredients: [
      ["300 g red lentils", "300 g de lentilles corail"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["2 carrots, diced", "2 carottes, en dés"],
      ["1.2 l water", "1,2 l d'eau"],
      ["10 g ground cumin", "10 g de cumin moulu"],
      ["4 slices of bread", "4 tranches de pain"],
    ],
    steps: [
      [
        "Soften the onion and carrot in oil for six minutes.",
        "Faire fondre l'oignon et la carotte à l'huile six minutes.",
      ],
      [
        "Add the lentils, cumin and water, then simmer twenty-five minutes.",
        "Ajouter les lentilles, le cumin et l'eau, puis mijoter vingt-cinq minutes.",
      ],
      [
        "Season, and serve with bread to dip.",
        "Assaisonner et servir avec du pain pour tremper.",
      ],
    ],
    tip: [
      "Red lentils fall apart into soup by themselves; no blending needed.",
      "Les lentilles corail se défont en soupe toutes seules : pas besoin de mixer.",
    ],
  },
  {
    slug: "grilled-cheese-tomato-soup",
    category: "lunch",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 20,
    servings: 2,
    macros: [22, 48, 24],
    title: [
      "Grilled cheese and tomato soup",
      "Croque-monsieur et soupe de tomate",
    ],
    summary: [
      "Tinned tomato soup and a toasted cheese sandwich, both ready together.",
      "Soupe de tomate en boîte et sandwich au fromage grillé, prêts en même temps.",
    ],
    ingredients: [
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["4 slices of bread", "4 tranches de pain"],
      ["100 g cheddar, grated", "100 g de cheddar, râpé"],
      ["30 g butter", "30 g de beurre"],
      ["5 g sugar", "5 g de sucre"],
    ],
    steps: [
      [
        "Soften the onion in half the butter, add tomatoes and sugar, and simmer fifteen minutes.",
        "Faire fondre l'oignon dans la moitié du beurre, ajouter les tomates et le sucre et mijoter quinze minutes.",
      ],
      [
        "Butter the bread on the outside, fill with cheese and fry until golden on both sides.",
        "Beurrer le pain à l'extérieur, garnir de fromage et dorer sur les deux faces.",
      ],
      [
        "Blend the soup if you like it smooth, then serve with the sandwich.",
        "Mixer la soupe si vous l'aimez lisse, puis servir avec le sandwich.",
      ],
    ],
    tip: [
      "A little sugar fixes an acidic tin of tomatoes.",
      "Un peu de sucre corrige une boîte de tomates trop acide.",
    ],
  },
  {
    slug: "chicken-caesar-wrap",
    category: "lunch",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 10,
    servings: 2,
    macros: [34, 44, 24],
    title: ["Chicken caesar wrap", "Wrap césar au poulet"],
    summary: [
      "Crunchy lettuce, warm chicken and a thick dressing, rolled tight.",
      "Salade croquante, poulet chaud et une sauce épaisse, roulés serré.",
    ],
    ingredients: [
      ["2 large tortillas", "2 grandes tortillas"],
      ["250 g chicken breast", "250 g de blanc de poulet"],
      ["1 romaine lettuce", "1 romaine"],
      ["60 g caesar dressing", "60 g de sauce césar"],
      ["30 g parmesan", "30 g de parmesan"],
      ["15 ml oil", "15 ml d'huile"],
    ],
    steps: [
      [
        "Fry the chicken in oil, five minutes a side, then slice into strips.",
        "Cuire le poulet à l'huile, cinq minutes par face, puis l'émincer en lanières.",
      ],
      [
        "Toss the shredded lettuce with the dressing and parmesan.",
        "Mélanger la salade émincée avec la sauce et le parmesan.",
      ],
      [
        "Fill the tortillas, fold the sides in and roll tightly.",
        "Garnir les tortillas, rabattre les côtés et rouler serré.",
      ],
    ],
    tip: [
      "Dry the lettuce well; wet leaves make the wrap slide apart.",
      "Bien sécher la salade : humide, elle fait glisser le wrap.",
    ],
  },
  {
    slug: "veggie-pasta-salad",
    category: "lunch",
    tags: ["vegetarian", "budget", "quick"],
    prep: 15,
    cook: 10,
    servings: 3,
    macros: [14, 66, 16],
    title: ["Vegetable pasta salad", "Salade de pâtes aux légumes"],
    summary: [
      "Keeps two days in the fridge and improves overnight.",
      "Se garde deux jours au frais et gagne en goût la nuit.",
    ],
    ingredients: [
      ["250 g pasta", "250 g de pâtes"],
      ["1 courgette, diced", "1 courgette, en dés"],
      [
        "200 g cherry tomatoes, halved",
        "200 g de tomates cerises, coupées en deux",
      ],
      ["1 red pepper, diced", "1 poivron rouge, en dés"],
      ["40 ml olive oil", "40 ml d'huile d'olive"],
      ["20 ml balsamic vinegar", "20 ml de vinaigre balsamique"],
    ],
    steps: [
      [
        "Boil the pasta, drain and cool it completely.",
        "Cuire les pâtes, les égoutter et les refroidir complètement.",
      ],
      [
        "Toss the vegetables with the oil, vinegar, salt and pepper.",
        "Mélanger les légumes avec l'huile, le vinaigre, le sel et le poivre.",
      ],
      [
        "Fold in the pasta and rest thirty minutes before eating.",
        "Incorporer les pâtes et laisser reposer trente minutes avant de manger.",
      ],
    ],
    tip: [
      "Salt the vegetables first, then the pasta; it seasons both better.",
      "Saler les légumes d'abord, puis les pâtes : les deux sont mieux assaisonnés.",
    ],
  },
  {
    slug: "bean-quesadilla",
    category: "lunch",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 8,
    servings: 2,
    macros: [24, 52, 22],
    title: ["Bean and cheese quesadilla", "Quesadilla haricots et fromage"],
    summary: [
      "Ten minutes from tin to plate, and children eat it too.",
      "Dix minutes de la boîte à l'assiette, et les enfants en mangent aussi.",
    ],
    ingredients: [
      ["2 large tortillas", "2 grandes tortillas"],
      [
        "200 g canned kidney beans, drained",
        "200 g de haricots rouges en conserve, égouttés",
      ],
      ["100 g cheddar, grated", "100 g de cheddar, râpé"],
      ["5 g ground cumin", "5 g de cumin moulu"],
      ["15 g butter", "15 g de beurre"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Mash the beans with the cumin, salt and pepper.",
        "Écraser les haricots avec le cumin, le sel et le poivre.",
      ],
      [
        "Spread over half of each tortilla, add cheese and fold.",
        "Étaler sur la moitié de chaque tortilla, ajouter le fromage et plier.",
      ],
      [
        "Fry in butter two minutes a side, then cut into wedges.",
        "Cuire au beurre deux minutes par face, puis couper en quartiers.",
      ],
    ],
    tip: [
      "Mashing the beans stops them rolling out when you fold it.",
      "Écraser les haricots les empêche de s'échapper au pliage.",
    ],
  },
  {
    slug: "chicken-noodle-soup",
    category: "lunch",
    tags: ["highProtein", "quick", "budget"],
    prep: 15,
    cook: 25,
    servings: 4,
    macros: [24, 42, 10],
    title: ["Chicken noodle soup", "Soupe de poulet aux nouilles"],
    summary: [
      "The one to make when nothing else appeals; gentle and easy to finish.",
      "Celle à faire quand rien d'autre ne tente : douce et facile à finir.",
    ],
    ingredients: [
      ["400 g chicken thigh", "400 g de cuisse de poulet"],
      ["1.5 l chicken stock", "1,5 l de bouillon de poulet"],
      ["150 g noodles", "150 g de nouilles"],
      ["2 carrots, sliced", "2 carottes, en rondelles"],
      ["2 celery sticks, sliced", "2 branches de céleri, émincées"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Simmer the chicken in the stock for fifteen minutes, then lift it out and shred it.",
        "Mijoter le poulet dans le bouillon quinze minutes, puis le retirer et l'effilocher.",
      ],
      [
        "Add the carrot and celery and cook ten minutes.",
        "Ajouter la carotte et le céleri et cuire dix minutes.",
      ],
      [
        "Return the chicken, add the noodles and cook until tender.",
        "Remettre le poulet, ajouter les nouilles et cuire jusqu'à ce qu'elles soient tendres.",
      ],
    ],
    tip: [
      "Shred, do not cube: shredded chicken is easier to eat in soup.",
      "Effilocher plutôt que couper en dés : le poulet effiloché se mange plus facilement en soupe.",
    ],
  },
  {
    slug: "ham-cheese-baguette",
    category: "lunch",
    tags: ["quick", "noCook", "budget"],
    prep: 8,
    servings: 2,
    macros: [24, 52, 18],
    title: ["Ham and cheese baguette", "Baguette jambon-fromage"],
    summary: [
      "The five-minute lunch that costs less than a supermarket meal deal.",
      "Le déjeuner en cinq minutes qui coûte moins qu'un menu de supermarché.",
    ],
    ingredients: [
      ["1 baguette", "1 baguette"],
      ["4 slices of ham", "4 tranches de jambon"],
      ["100 g emmental, sliced", "100 g d'emmental, en tranches"],
      ["30 g butter", "30 g de beurre"],
      ["1 tomato, sliced", "1 tomate, en tranches"],
      ["a few lettuce leaves", "quelques feuilles de salade"],
    ],
    steps: [
      [
        "Split the baguette and butter both halves.",
        "Ouvrir la baguette et beurrer les deux moitiés.",
      ],
      [
        "Layer ham, cheese, tomato and lettuce.",
        "Superposer jambon, fromage, tomate et salade.",
      ],
      [
        "Close, press gently and cut in two.",
        "Refermer, presser doucement et couper en deux.",
      ],
    ],
    tip: [
      "Butter before the filling: it keeps the bread from going soft.",
      "Beurrer avant la garniture : le pain ne ramollit pas.",
    ],
  },
  {
    slug: "tuna-nicoise-salad",
    category: "lunch",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 10,
    servings: 2,
    macros: [30, 32, 24],
    title: ["Tuna nicoise salad", "Salade niçoise au thon"],
    summary: [
      "Eggs, potatoes, tuna and olives in one bowl; a salad that actually fills.",
      "Œufs, pommes de terre, thon et olives dans un bol : une salade qui rassasie vraiment.",
    ],
    ingredients: [
      ["2 eggs", "2 œufs"],
      ["300 g new potatoes", "300 g de pommes de terre nouvelles"],
      ["160 g canned tuna", "160 g de thon en conserve"],
      ["100 g green beans", "100 g de haricots verts"],
      ["60 g black olives", "60 g d'olives noires"],
      ["30 ml olive oil", "30 ml d'huile d'olive"],
    ],
    steps: [
      [
        "Boil the potatoes and beans together for ten minutes; add the eggs for the last eight.",
        "Cuire les pommes de terre et les haricots ensemble dix minutes ; ajouter les œufs pour les huit dernières.",
      ],
      [
        "Drain everything and cool the eggs in cold water.",
        "Tout égoutter et refroidir les œufs à l'eau froide.",
      ],
      [
        "Arrange with the flaked tuna and olives, then dress with oil, salt and pepper.",
        "Disposer avec le thon émietté et les olives, puis assaisonner d'huile, de sel et de poivre.",
      ],
    ],
    tip: [
      "Dress it while the potatoes are still warm; they absorb more.",
      "Assaisonner pendant que les pommes de terre sont tièdes : elles absorbent mieux.",
    ],
  },
  {
    slug: "baked-potato-beans",
    category: "lunch",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 45,
    servings: 2,
    macros: [20, 62, 14],
    title: ["Baked potato with beans", "Pomme de terre au four et haricots"],
    summary: [
      "The oven does the work; you only open a tin at the end.",
      "Le four fait le travail ; vous n'ouvrez qu'une boîte à la fin.",
    ],
    ingredients: [
      ["2 large baking potatoes", "2 grosses pommes de terre à four"],
      ["400 g canned baked beans", "400 g de haricots à la tomate en conserve"],
      ["60 g cheddar, grated", "60 g de cheddar, râpé"],
      ["20 g butter", "20 g de beurre"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Prick the potatoes, rub with salt and bake at 200 °C for 45 minutes.",
        "Piquer les pommes de terre, les frotter de sel et cuire à 200 °C pendant 45 minutes.",
      ],
      [
        "Warm the beans in a pan.",
        "Réchauffer les haricots dans une casserole.",
      ],
      [
        "Split the potatoes, add butter, beans and cheese.",
        "Ouvrir les pommes de terre, ajouter beurre, haricots et fromage.",
      ],
    ],
    tip: [
      "Rub the skins with salt: it dries them into something worth eating.",
      "Frotter la peau de sel : elle sèche et devient croustillante.",
    ],
  },
  {
    slug: "sweet-potato-chicken-bowl",
    category: "lunch",
    tags: ["highProtein", "caribbean"],
    prep: 20,
    cook: 25,
    servings: 2,
    macros: [34, 62, 20],
    title: ["Sweet potato and chicken bowl", "Bol de patate douce et poulet"],
    summary: [
      "Roasted sweet potato, spiced chicken and black beans, with lime over the top.",
      "Patate douce rôtie, poulet épicé et haricots noirs, avec du citron vert par-dessus.",
    ],
    ingredients: [
      ["500 g sweet potato, cubed", "500 g de patate douce, en cubes"],
      ["300 g chicken thigh, sliced", "300 g de cuisse de poulet, émincée"],
      ["200 g canned black beans", "200 g de haricots noirs en conserve"],
      ["10 g paprika", "10 g de paprika"],
      ["30 ml oil", "30 ml d'huile"],
      ["1 lime", "1 citron vert"],
    ],
    steps: [
      [
        "Toss the sweet potato in half the oil and paprika and roast at 200 °C for 25 minutes.",
        "Mélanger la patate douce avec la moitié de l'huile et le paprika et rôtir à 200 °C 25 minutes.",
      ],
      [
        "Fry the chicken in the rest of the oil with the remaining paprika.",
        "Sauter le poulet dans le reste d'huile avec le reste de paprika.",
      ],
      [
        "Build two bowls with sweet potato, chicken and beans and squeeze lime over.",
        "Monter deux bols avec patate douce, poulet et haricots et presser le citron vert.",
      ],
    ],
    tip: [
      "Cut the sweet potato the same size so it roasts evenly.",
      "Couper la patate douce de la même taille pour qu'elle rôtisse uniformément.",
    ],
  },
  {
    slug: "caribbean-chicken-wrap",
    category: "lunch",
    tags: ["highProtein", "caribbean", "quick"],
    prep: 15,
    cook: 12,
    servings: 2,
    macros: [32, 46, 22],
    title: ["Caribbean chicken wrap", "Wrap de poulet antillais"],
    summary: [
      "Chicken rubbed with allspice and thyme, rolled with mango and slaw.",
      "Poulet frotté au quatre-épices et au thym, roulé avec mangue et chou.",
    ],
    ingredients: [
      ["300 g chicken breast", "300 g de blanc de poulet"],
      ["2 large tortillas", "2 grandes tortillas"],
      ["5 g allspice", "5 g de quatre-épices"],
      ["5 g dried thyme", "5 g de thym séché"],
      ["1 mango, sliced", "1 mangue, en tranches"],
      ["100 g white cabbage, shredded", "100 g de chou blanc, émincé"],
    ],
    steps: [
      [
        "Rub the chicken with allspice, thyme, salt and oil.",
        "Frotter le poulet avec le quatre-épices, le thym, le sel et l'huile.",
      ],
      [
        "Fry it five minutes a side, rest, then slice.",
        "Le cuire cinq minutes par face, le laisser reposer, puis l'émincer.",
      ],
      [
        "Fill the tortillas with chicken, mango and cabbage, fold and roll.",
        "Garnir les tortillas de poulet, de mangue et de chou, plier et rouler.",
      ],
    ],
    tip: [
      "Rest the chicken five minutes before slicing so it stays juicy.",
      "Laisser reposer le poulet cinq minutes avant de l'émincer pour qu'il reste juteux.",
    ],
  },
  {
    slug: "caribbean-bean-rice-bowl",
    category: "lunch",
    tags: ["vegetarian", "caribbean", "budget", "quick"],
    prep: 15,
    cook: 20,
    servings: 3,
    macros: [18, 72, 16],
    title: ["Caribbean-style rice and beans", "Riz et haricots à l'antillaise"],
    summary: [
      "Rice cooked with coconut milk, beans and thyme; a whole meal from the cupboard.",
      "Riz cuit au lait de coco avec haricots et thym : un repas entier venu du placard.",
    ],
    ingredients: [
      ["300 g rice", "300 g de riz"],
      ["250 ml coconut milk", "250 ml de lait de coco"],
      [
        "400 g canned kidney beans, drained",
        "400 g de haricots rouges en conserve, égouttés",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["5 g dried thyme", "5 g de thym séché"],
      ["400 ml water", "400 ml d'eau"],
    ],
    steps: [
      [
        "Soften the onion in oil with the thyme for five minutes.",
        "Faire fondre l'oignon à l'huile avec le thym cinq minutes.",
      ],
      [
        "Add the rice, coconut milk, water and beans, and bring to a boil.",
        "Ajouter le riz, le lait de coco, l'eau et les haricots et porter à ébullition.",
      ],
      [
        "Cover and cook on low for fifteen minutes without stirring.",
        "Couvrir et cuire à feu doux quinze minutes sans remuer.",
      ],
    ],
    tip: [
      "Do not stir while it cooks; stirring makes the rice sticky.",
      "Ne pas remuer pendant la cuisson : le riz devient collant.",
    ],
  },
];
