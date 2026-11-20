import type { RecipeDef } from "./build";

/** Dinner expansion (Stage 7G). 28 recipes, including 8 Caribbean-tagged. */
export const dinner: RecipeDef[] = [
  {
    slug: "creamy-chicken-pasta",
    category: "dinner",
    tags: ["highProtein"],
    prep: 20,
    cook: 20,
    servings: 3,
    macros: [38, 66, 28],
    title: ["Creamy chicken pasta", "Pâtes crémeuses au poulet"],
    summary: [
      "One pan for the chicken and sauce, one pot for the pasta.",
      "Une poêle pour le poulet et la sauce, une casserole pour les pâtes.",
    ],
    ingredients: [
      ["400 g pasta", "400 g de pâtes"],
      ["400 g chicken thigh, sliced", "400 g de cuisse de poulet, émincée"],
      ["200 ml cream", "200 ml de crème"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["40 g parmesan", "40 g de parmesan"],
      ["30 g butter", "30 g de beurre"],
    ],
    steps: [
      [
        "Brown the chicken in butter for eight minutes, then set aside.",
        "Faire dorer le poulet au beurre huit minutes, puis réserver.",
      ],
      [
        "Soften the onion, add the cream and simmer five minutes.",
        "Faire fondre l'oignon, ajouter la crème et mijoter cinq minutes.",
      ],
      [
        "Return the chicken, toss with the drained pasta and parmesan.",
        "Remettre le poulet, mélanger avec les pâtes égouttées et le parmesan.",
      ],
    ],
    tip: [
      "Keep a cup of pasta water; it rescues a sauce that tightens.",
      "Garder une tasse d'eau de cuisson : elle rattrape une sauce qui serre.",
    ],
  },
  {
    slug: "baked-salmon-potatoes",
    category: "dinner",
    tags: ["highProtein"],
    prep: 20,
    cook: 30,
    servings: 2,
    macros: [34, 52, 26],
    title: ["Baked salmon with potatoes", "Saumon au four et pommes de terre"],
    summary: [
      "One tray, lemon and herbs; the oven does everything.",
      "Une plaque, du citron et des herbes ; le four fait tout.",
    ],
    ingredients: [
      ["2 salmon fillets", "2 filets de saumon"],
      ["600 g potatoes, quartered", "600 g de pommes de terre, en quartiers"],
      ["1 lemon, sliced", "1 citron, en tranches"],
      ["30 ml olive oil", "30 ml d'huile d'olive"],
      ["5 g dried oregano", "5 g d'origan séché"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Toss the potatoes in half the oil and roast at 200 °C for 20 minutes.",
        "Mélanger les pommes de terre avec la moitié de l'huile et rôtir à 200 °C 20 minutes.",
      ],
      [
        "Add the salmon, lemon, oregano and remaining oil to the tray.",
        "Ajouter le saumon, le citron, l'origan et le reste d'huile sur la plaque.",
      ],
      [
        "Bake ten more minutes, until the salmon flakes.",
        "Cuire dix minutes de plus, jusqu'à ce que le saumon s'effeuille.",
      ],
    ],
    tip: [
      "Salmon needs far less time than the potatoes; add it late.",
      "Le saumon cuit bien plus vite que les pommes de terre : l'ajouter en fin de cuisson.",
    ],
  },
  {
    slug: "beef-lasagna",
    category: "dinner",
    tags: ["highProtein"],
    prep: 30,
    cook: 40,
    servings: 4,
    macros: [36, 62, 30],
    title: ["Beef lasagna", "Lasagnes au bœuf"],
    summary: [
      "An hour of work for four dinners, and it freezes well.",
      "Une heure de travail pour quatre dîners, et ça se congèle bien.",
    ],
    ingredients: [
      ["500 g beef mince", "500 g de bœuf haché"],
      ["12 lasagna sheets", "12 feuilles de lasagnes"],
      ["700 g passata", "700 g de passata"],
      ["500 ml milk", "500 ml de lait"],
      ["60 g flour", "60 g de farine"],
      ["60 g butter", "60 g de beurre"],
      ["100 g parmesan", "100 g de parmesan"],
    ],
    steps: [
      [
        "Brown the beef, add the passata and simmer 20 minutes.",
        "Faire dorer le bœuf, ajouter la passata et mijoter 20 minutes.",
      ],
      [
        "Melt the butter, stir in the flour, then the milk, and cook until thick.",
        "Faire fondre le beurre, incorporer la farine, puis le lait, et cuire jusqu'à épaississement.",
      ],
      [
        "Layer pasta, meat and white sauce twice, top with parmesan and bake at 190 °C for 35 minutes.",
        "Alterner deux fois pâtes, viande et sauce blanche, couvrir de parmesan et cuire à 190 °C 35 minutes.",
      ],
    ],
    tip: [
      "Let it rest ten minutes before cutting; it holds its shape.",
      "Laisser reposer dix minutes avant de couper : elle se tient.",
    ],
  },
  {
    slug: "chicken-curry-rice",
    category: "dinner",
    tags: ["highProtein", "budget"],
    prep: 20,
    cook: 30,
    servings: 3,
    macros: [36, 64, 24],
    title: ["Chicken curry with rice", "Poulet au curry et riz"],
    summary: [
      "Mild, creamy and made from a spoon of curry powder.",
      "Doux, crémeux et préparé avec une cuillère de curry en poudre.",
    ],
    ingredients: [
      ["500 g chicken thigh, cubed", "500 g de cuisse de poulet, en cubes"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["150 ml cream", "150 ml de crème"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["15 g curry powder", "15 g de curry en poudre"],
      ["400 g cooked rice", "400 g de riz cuit"],
    ],
    steps: [
      [
        "Soften the onion, add the curry powder and cook one minute.",
        "Faire fondre l'oignon, ajouter le curry et cuire une minute.",
      ],
      [
        "Add the chicken, tomatoes and cream and simmer 25 minutes.",
        "Ajouter le poulet, les tomates et la crème et mijoter 25 minutes.",
      ],
      ["Serve over the rice.", "Servir sur le riz."],
    ],
    tip: [
      "Frying the powder in oil first is what makes the curry taste of something.",
      "Faire revenir la poudre dans l'huile donne tout son goût au curry.",
    ],
  },
  {
    slug: "shepherds-pie",
    category: "dinner",
    tags: ["highProtein"],
    prep: 30,
    cook: 35,
    servings: 4,
    macros: [32, 54, 24],
    title: ["Shepherd's pie", "Hachis parmentier"],
    summary: [
      "Mince and vegetables under a mash lid; a whole dinner in one dish.",
      "Viande hachée et légumes sous une couche de purée : un dîner entier dans un plat.",
    ],
    ingredients: [
      ["500 g beef mince", "500 g de bœuf haché"],
      ["1 kg potatoes", "1 kg de pommes de terre"],
      ["2 carrots, diced", "2 carottes, en dés"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["80 ml milk", "80 ml de lait"],
      ["60 g butter", "60 g de beurre"],
    ],
    steps: [
      [
        "Boil the potatoes, then mash with milk and butter.",
        "Cuire les pommes de terre, puis les écraser avec le lait et le beurre.",
      ],
      [
        "Brown the mince with the carrot, add tomatoes and simmer 15 minutes.",
        "Faire dorer la viande avec la carotte, ajouter les tomates et mijoter 15 minutes.",
      ],
      [
        "Spread the mash over the meat and bake at 200 °C for 25 minutes.",
        "Étaler la purée sur la viande et cuire à 200 °C 25 minutes.",
      ],
    ],
    tip: [
      "Rough the mash with a fork so the top crisps.",
      "Rayer la purée à la fourchette pour que le dessus croustille.",
    ],
  },
  {
    slug: "chicken-gratin",
    category: "dinner",
    tags: ["highProtein"],
    prep: 25,
    cook: 30,
    servings: 3,
    macros: [34, 44, 26],
    title: ["Chicken and potato gratin", "Gratin de poulet et pommes de terre"],
    summary: [
      "Sliced potatoes, chicken and cream, baked until the top browns.",
      "Pommes de terre en lamelles, poulet et crème, gratinés jusqu'à ce que le dessus dore.",
    ],
    ingredients: [
      [
        "600 g potatoes, thinly sliced",
        "600 g de pommes de terre, finement tranchées",
      ],
      ["400 g chicken thigh, sliced", "400 g de cuisse de poulet, émincée"],
      ["300 ml cream", "300 ml de crème"],
      ["1 onion, sliced", "1 oignon, en lamelles"],
      ["80 g cheese, grated", "80 g de fromage, râpé"],
      ["30 g butter", "30 g de beurre"],
    ],
    steps: [
      [
        "Soften the onion and brown the chicken in butter.",
        "Faire fondre l'oignon et dorer le poulet au beurre.",
      ],
      [
        "Layer potatoes, chicken and onion in a dish and pour the cream over.",
        "Alterner pommes de terre, poulet et oignon dans un plat et verser la crème.",
      ],
      [
        "Cover with cheese and bake at 180 °C for 30 minutes.",
        "Couvrir de fromage et cuire à 180 °C 30 minutes.",
      ],
    ],
    tip: [
      "Slice the potatoes 3 mm thick; thicker slices stay hard.",
      "Trancher les pommes de terre à 3 mm ; plus épaisses, elles restent dures.",
    ],
  },
  {
    slug: "homemade-pizza",
    category: "dinner",
    tags: ["vegetarian", "budget"],
    prep: 30,
    cook: 20,
    servings: 2,
    macros: [26, 78, 24],
    title: ["Homemade pizza", "Pizza maison"],
    summary: [
      "Bread dough, tomato and cheese; cheaper and better than delivery.",
      "Pâte à pain, tomate et fromage : moins cher et meilleur qu'en livraison.",
    ],
    ingredients: [
      ["300 g bread flour", "300 g de farine à pain"],
      ["180 ml warm water", "180 ml d'eau tiède"],
      ["7 g dried yeast", "7 g de levure sèche"],
      ["200 g passata", "200 g de passata"],
      ["200 g mozzarella", "200 g de mozzarella"],
      ["15 ml olive oil", "15 ml d'huile d'olive"],
    ],
    steps: [
      [
        "Mix flour, yeast, water and oil, knead five minutes and rest one hour.",
        "Mélanger farine, levure, eau et huile, pétrir cinq minutes et laisser lever une heure.",
      ],
      [
        "Stretch the dough, spread the passata and add the mozzarella.",
        "Étirer la pâte, étaler la passata et ajouter la mozzarella.",
      ],
      [
        "Bake at 240 °C for 12 to 15 minutes.",
        "Cuire à 240 °C pendant 12 à 15 minutes.",
      ],
    ],
    tip: [
      "The hotter the oven, the better the base; preheat it fully.",
      "Plus le four est chaud, meilleure est la pâte : bien le préchauffer.",
    ],
  },
  {
    slug: "beef-veg-stir-fry",
    category: "dinner",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 12,
    servings: 2,
    macros: [34, 48, 20],
    title: ["Beef and vegetable stir-fry", "Bœuf sauté aux légumes"],
    summary: [
      "Everything in one hot pan, on the table in under half an hour.",
      "Tout dans une poêle bien chaude, sur la table en moins d'une demi-heure.",
    ],
    ingredients: [
      ["300 g beef strips", "300 g de bœuf en lanières"],
      ["1 red pepper, sliced", "1 poivron rouge, en lamelles"],
      ["1 courgette, sliced", "1 courgette, en lamelles"],
      ["2 spring onions, sliced", "2 oignons nouveaux, émincés"],
      ["40 ml soy sauce", "40 ml de sauce soja"],
      ["200 g cooked noodles", "200 g de nouilles cuites"],
    ],
    steps: [
      [
        "Fry the beef in a very hot pan for two minutes and set aside.",
        "Sauter le bœuf dans une poêle très chaude deux minutes et réserver.",
      ],
      [
        "Fry the vegetables for five minutes, keeping them crisp.",
        "Sauter les légumes cinq minutes en les gardant croquants.",
      ],
      [
        "Return the beef, add the noodles and soy sauce and toss for a minute.",
        "Remettre le bœuf, ajouter les nouilles et la sauce soja et mélanger une minute.",
      ],
    ],
    tip: [
      "Cook the beef in two batches; one crowded batch steams.",
      "Cuire le bœuf en deux fois : une seule fournée le fait suer.",
    ],
  },
  {
    slug: "chilli-con-carne-rice",
    category: "dinner",
    tags: ["highProtein", "budget"],
    prep: 20,
    cook: 40,
    servings: 4,
    macros: [30, 58, 20],
    title: ["Chilli con carne with rice", "Chili con carne et riz"],
    summary: [
      "A big pot that gets better the next day.",
      "Une grande marmite qui est meilleure le lendemain.",
    ],
    ingredients: [
      ["500 g beef mince", "500 g de bœuf haché"],
      ["400 g canned kidney beans", "400 g de haricots rouges en conserve"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["15 g chilli powder", "15 g de piment en poudre"],
      ["400 g cooked rice", "400 g de riz cuit"],
    ],
    steps: [
      [
        "Brown the mince with the onion for eight minutes.",
        "Faire dorer la viande avec l'oignon huit minutes.",
      ],
      [
        "Add the chilli, tomatoes and beans and simmer 30 minutes.",
        "Ajouter le piment, les tomates et les haricots et mijoter 30 minutes.",
      ],
      [
        "Serve over rice, with a spoon of yogurt if it is too hot.",
        "Servir sur le riz, avec une cuillère de yaourt si c'est trop piquant.",
      ],
    ],
    tip: [
      "Chilli powder varies a lot; add half, taste, then decide.",
      "Le piment en poudre varie beaucoup : en mettre la moitié, goûter, puis décider.",
    ],
  },
  {
    slug: "roast-chicken-potatoes",
    category: "dinner",
    tags: ["highProtein"],
    prep: 20,
    cook: 80,
    servings: 4,
    macros: [38, 46, 26],
    title: ["Roast chicken with potatoes", "Poulet rôti et pommes de terre"],
    summary: [
      "One bird, four plates, and the potatoes cook in the fat.",
      "Un poulet, quatre assiettes, et les pommes de terre cuisent dans le gras.",
    ],
    ingredients: [
      ["1 whole chicken, about 1.5 kg", "1 poulet entier, environ 1,5 kg"],
      ["1 kg potatoes, quartered", "1 kg de pommes de terre, en quartiers"],
      ["2 onions, quartered", "2 oignons, en quartiers"],
      ["40 ml olive oil", "40 ml d'huile d'olive"],
      ["5 g dried thyme", "5 g de thym séché"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Rub the chicken with oil, salt, pepper and thyme.",
        "Frotter le poulet d'huile, de sel, de poivre et de thym.",
      ],
      [
        "Put it in a tray with the potatoes and onions around it.",
        "Le placer dans un plat avec les pommes de terre et les oignons autour.",
      ],
      [
        "Roast at 200 °C for 80 minutes, turning the potatoes twice.",
        "Rôtir à 200 °C 80 minutes en retournant les pommes de terre deux fois.",
      ],
    ],
    tip: [
      "Let the bird rest 10 minutes before carving; the juice stays in.",
      "Laisser reposer la volaille 10 minutes avant de découper : le jus reste dedans.",
    ],
  },
  {
    slug: "pork-chops-mash",
    category: "dinner",
    tags: ["highProtein"],
    prep: 20,
    cook: 25,
    servings: 2,
    macros: [36, 44, 26],
    title: ["Pork chops with mash", "Côtes de porc et purée"],
    summary: [
      "Chops fried in butter, mash underneath, pan juices over both.",
      "Côtes cuites au beurre, purée dessous, jus de cuisson sur les deux.",
    ],
    ingredients: [
      ["2 pork chops", "2 côtes de porc"],
      ["700 g potatoes", "700 g de pommes de terre"],
      ["60 ml milk", "60 ml de lait"],
      ["50 g butter", "50 g de beurre"],
      ["5 g dried sage", "5 g de sauge séchée"],
      ["salt and pepper", "sel et poivre"],
    ],
    steps: [
      [
        "Boil and mash the potatoes with milk and half the butter.",
        "Cuire et écraser les pommes de terre avec le lait et la moitié du beurre.",
      ],
      [
        "Fry the chops in the rest of the butter with sage, four minutes a side.",
        "Cuire les côtes dans le reste du beurre avec la sauge, quatre minutes par face.",
      ],
      [
        "Serve on the mash and spoon the pan juices over.",
        "Servir sur la purée et napper du jus de cuisson.",
      ],
    ],
    tip: [
      "Rest the chops three minutes; pork releases a lot of juice.",
      "Laisser reposer les côtes trois minutes : le porc rend beaucoup de jus.",
    ],
  },
  {
    slug: "fish-pie",
    category: "dinner",
    tags: ["highProtein"],
    prep: 25,
    cook: 35,
    servings: 4,
    macros: [30, 50, 24],
    title: ["Fish pie", "Tourte au poisson"],
    summary: [
      "White fish in a creamy sauce under mash; mild enough for anyone.",
      "Poisson blanc en sauce crémeuse sous une purée : assez doux pour tout le monde.",
    ],
    ingredients: [
      ["600 g white fish", "600 g de poisson blanc"],
      ["1 kg potatoes", "1 kg de pommes de terre"],
      ["300 ml milk", "300 ml de lait"],
      ["40 g flour", "40 g de farine"],
      ["40 g butter", "40 g de beurre"],
      ["100 g peas", "100 g de petits pois"],
    ],
    steps: [
      [
        "Poach the fish in the milk for five minutes, then lift it out.",
        "Pocher le poisson dans le lait cinq minutes, puis le retirer.",
      ],
      [
        "Make a sauce with the butter, flour and that milk, then add peas and fish.",
        "Faire une sauce avec le beurre, la farine et ce lait, puis ajouter petits pois et poisson.",
      ],
      [
        "Top with mash and bake at 200 °C for 25 minutes.",
        "Couvrir de purée et cuire à 200 °C 25 minutes.",
      ],
    ],
    tip: [
      "Poaching in milk flavours the sauce twice; do not throw it away.",
      "Pocher dans le lait parfume la sauce deux fois : ne pas le jeter.",
    ],
  },
  {
    slug: "veggie-lasagna",
    category: "dinner",
    tags: ["vegetarian", "budget"],
    prep: 30,
    cook: 40,
    servings: 4,
    macros: [24, 66, 24],
    title: ["Vegetable lasagna", "Lasagnes aux légumes"],
    summary: [
      "Courgette, pepper and tomato between pasta and white sauce.",
      "Courgette, poivron et tomate entre pâtes et sauce blanche.",
    ],
    ingredients: [
      ["12 lasagna sheets", "12 feuilles de lasagnes"],
      ["2 courgettes, diced", "2 courgettes, en dés"],
      ["2 red peppers, diced", "2 poivrons rouges, en dés"],
      ["700 g passata", "700 g de passata"],
      ["500 ml milk", "500 ml de lait"],
      ["60 g flour and 60 g butter", "60 g de farine et 60 g de beurre"],
    ],
    steps: [
      [
        "Roast the vegetables at 200 °C for 20 minutes.",
        "Rôtir les légumes à 200 °C 20 minutes.",
      ],
      [
        "Make a white sauce with butter, flour and milk.",
        "Préparer une sauce blanche avec beurre, farine et lait.",
      ],
      [
        "Layer pasta, vegetables, passata and sauce twice, then bake 30 minutes.",
        "Alterner deux fois pâtes, légumes, passata et sauce, puis cuire 30 minutes.",
      ],
    ],
    tip: [
      "Roast the vegetables first; it removes the water that makes lasagna run.",
      "Rôtir les légumes d'abord : cela retire l'eau qui fait couler les lasagnes.",
    ],
  },
  {
    slug: "mushroom-risotto",
    category: "dinner",
    tags: ["vegetarian", "quick", "budget"],
    prep: 15,
    cook: 30,
    servings: 3,
    macros: [20, 68, 20],
    title: ["Mushroom risotto", "Risotto aux champignons"],
    summary: [
      "Stirring is the whole technique, and it is worth it.",
      "Remuer est toute la technique, et ça vaut le coup.",
    ],
    ingredients: [
      ["300 g risotto rice", "300 g de riz à risotto"],
      ["400 g mushrooms, sliced", "400 g de champignons, émincés"],
      ["1 l hot vegetable stock", "1 l de bouillon de légumes chaud"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["60 g parmesan", "60 g de parmesan"],
      ["40 g butter", "40 g de beurre"],
    ],
    steps: [
      [
        "Brown the mushrooms in half the butter and set aside.",
        "Faire dorer les champignons dans la moitié du beurre et réserver.",
      ],
      [
        "Soften the onion, add the rice, then add the stock a ladle at a time, stirring.",
        "Faire fondre l'oignon, ajouter le riz, puis verser le bouillon louche par louche en remuant.",
      ],
      [
        "After about 20 minutes, fold in the mushrooms, parmesan and rest of the butter.",
        "Au bout d'environ 20 minutes, incorporer champignons, parmesan et le reste du beurre.",
      ],
    ],
    tip: [
      "The stock must be hot; cold stock stops the rice from releasing starch.",
      "Le bouillon doit être chaud : froid, il empêche le riz de libérer son amidon.",
    ],
  },
  {
    slug: "sausage-lentil-stew",
    category: "dinner",
    tags: ["highProtein", "quick", "budget"],
    prep: 15,
    cook: 35,
    servings: 4,
    macros: [30, 44, 22],
    title: ["Sausage and lentil stew", "Ragoût de saucisses et lentilles"],
    summary: [
      "Sausages, lentils and a tin of tomatoes; cheap and filling.",
      "Saucisses, lentilles et une boîte de tomates : économique et rassasiant.",
    ],
    ingredients: [
      ["6 pork sausages", "6 saucisses de porc"],
      ["250 g green lentils", "250 g de lentilles vertes"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["1 carrot, diced", "1 carotte, en dés"],
      ["800 ml water", "800 ml d'eau"],
    ],
    steps: [
      [
        "Brown the sausages, then cut them into thirds.",
        "Faire dorer les saucisses, puis les couper en trois.",
      ],
      [
        "Soften onion and carrot, add lentils, tomatoes and water.",
        "Faire fondre oignon et carotte, ajouter lentilles, tomates et eau.",
      ],
      [
        "Return the sausages and simmer 30 minutes until the lentils are soft.",
        "Remettre les saucisses et mijoter 30 minutes jusqu'à ce que les lentilles soient tendres.",
      ],
    ],
    tip: [
      "Green lentils hold their shape; red ones would turn to soup.",
      "Les lentilles vertes tiennent ; les corail se déferaient en soupe.",
    ],
  },
  {
    slug: "chicken-fajitas",
    category: "dinner",
    tags: ["highProtein", "quick"],
    prep: 15,
    cook: 15,
    servings: 3,
    macros: [32, 52, 20],
    title: ["Chicken fajitas", "Fajitas au poulet"],
    summary: [
      "Strips of chicken and pepper, warm tortillas, everyone fills their own.",
      "Lanières de poulet et poivrons, tortillas chaudes, chacun garnit la sienne.",
    ],
    ingredients: [
      ["450 g chicken breast, sliced", "450 g de blanc de poulet, émincé"],
      ["2 peppers, sliced", "2 poivrons, en lamelles"],
      ["1 onion, sliced", "1 oignon, en lamelles"],
      ["6 tortillas", "6 tortillas"],
      ["15 g fajita seasoning", "15 g d'épices pour fajitas"],
      ["30 ml oil", "30 ml d'huile"],
    ],
    steps: [
      [
        "Fry the chicken in oil over high heat for six minutes.",
        "Sauter le poulet à l'huile à feu vif six minutes.",
      ],
      [
        "Add the peppers, onion and seasoning and cook five minutes.",
        "Ajouter les poivrons, l'oignon et les épices et cuire cinq minutes.",
      ],
      [
        "Warm the tortillas and serve the filling in the middle of the table.",
        "Réchauffer les tortillas et servir la garniture au centre de la table.",
      ],
    ],
    tip: [
      "Warm the tortillas in a dry pan, ten seconds a side.",
      "Réchauffer les tortillas dans une poêle sèche, dix secondes par face.",
    ],
  },
  {
    slug: "lentil-dahl-rice",
    category: "dinner",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 30,
    servings: 3,
    macros: [20, 62, 14],
    title: ["Lentil dahl with rice", "Dahl de lentilles et riz"],
    summary: [
      "A bag of lentils, a spoon of spices, and dinner for three.",
      "Un sachet de lentilles, une cuillère d'épices et un dîner pour trois.",
    ],
    ingredients: [
      ["250 g red lentils", "250 g de lentilles corail"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["10 g curry powder", "10 g de curry en poudre"],
      ["200 ml coconut milk", "200 ml de lait de coco"],
      ["300 g cooked rice", "300 g de riz cuit"],
    ],
    steps: [
      [
        "Soften the onion, add the curry and cook one minute.",
        "Faire fondre l'oignon, ajouter le curry et cuire une minute.",
      ],
      [
        "Add lentils, tomatoes, coconut milk and 400 ml water and simmer 25 minutes.",
        "Ajouter lentilles, tomates, lait de coco et 400 ml d'eau et mijoter 25 minutes.",
      ],
      ["Serve over rice.", "Servir sur le riz."],
    ],
    tip: [
      "Red lentils need no soaking; they soften in the sauce.",
      "Les lentilles corail ne trempent pas : elles fondent dans la sauce.",
    ],
  },
  {
    slug: "gnocchi-tomato-cheese",
    category: "dinner",
    tags: ["vegetarian", "quick", "budget"],
    prep: 10,
    cook: 15,
    servings: 2,
    macros: [20, 66, 22],
    title: ["Gnocchi with tomato and cheese", "Gnocchis tomate et fromage"],
    summary: [
      "Gnocchi cook in two minutes; the sauce does the rest.",
      "Les gnocchis cuisent en deux minutes ; la sauce fait le reste.",
    ],
    ingredients: [
      ["500 g gnocchi", "500 g de gnocchis"],
      ["400 g passata", "400 g de passata"],
      ["150 g mozzarella", "150 g de mozzarella"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["20 ml olive oil", "20 ml d'huile d'olive"],
      ["5 g dried basil", "5 g de basilic séché"],
    ],
    steps: [
      [
        "Soften the onion in oil, add the passata and basil and simmer ten minutes.",
        "Faire fondre l'oignon à l'huile, ajouter la passata et le basilic et mijoter dix minutes.",
      ],
      [
        "Boil the gnocchi until they float, about two minutes.",
        "Cuire les gnocchis jusqu'à ce qu'ils remontent, environ deux minutes.",
      ],
      [
        "Combine with the sauce, top with mozzarella and grill until it bubbles.",
        "Mélanger avec la sauce, couvrir de mozzarella et passer au gril jusqu'à ce que ça bouillonne.",
      ],
    ],
    tip: [
      "Scoop the gnocchi out with a slotted spoon; draining in a colander crushes them.",
      "Sortir les gnocchis à l'écumoire : les égoutter dans une passoire les écrase.",
    ],
  },
  {
    slug: "beef-goulash-rice",
    category: "dinner",
    tags: ["highProtein", "budget"],
    prep: 20,
    cook: 90,
    servings: 4,
    macros: [34, 54, 20],
    title: ["Beef goulash with rice", "Goulash de bœuf et riz"],
    summary: [
      "Cheap beef, paprika and time; it looks after itself.",
      "Un bœuf économique, du paprika et du temps : ça se fait tout seul.",
    ],
    ingredients: [
      ["800 g beef shin, cubed", "800 g de jarret de bœuf, en cubes"],
      ["2 onions, sliced", "2 oignons, en lamelles"],
      ["20 g paprika", "20 g de paprika"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["300 ml water", "300 ml d'eau"],
      ["400 g cooked rice", "400 g de riz cuit"],
    ],
    steps: [
      [
        "Brown the beef in batches, then set aside.",
        "Faire dorer le bœuf en plusieurs fois, puis réserver.",
      ],
      [
        "Soften the onions, add the paprika, then the beef, tomatoes and water.",
        "Faire fondre les oignons, ajouter le paprika, puis le bœuf, les tomates et l'eau.",
      ],
      [
        "Cover and simmer 90 minutes until the beef pulls apart; serve with rice.",
        "Couvrir et mijoter 90 minutes jusqu'à ce que le bœuf se défasse ; servir avec le riz.",
      ],
    ],
    tip: [
      "Shin needs long, slow heat; a quick cook leaves it tough.",
      "Le jarret demande une cuisson longue et douce ; rapide, il reste dur.",
    ],
  },
  {
    slug: "tofu-stir-fry-rice",
    category: "dinner",
    tags: ["vegetarian", "quick", "budget"],
    prep: 15,
    cook: 15,
    servings: 2,
    macros: [24, 58, 18],
    title: ["Tofu stir-fry with rice", "Tofu sauté et riz"],
    summary: [
      "Crisp tofu, frozen vegetables and soy; faster than takeaway.",
      "Tofu croustillant, légumes surgelés et soja : plus rapide qu'à emporter.",
    ],
    ingredients: [
      ["300 g firm tofu, cubed", "300 g de tofu ferme, en cubes"],
      ["400 g frozen mixed vegetables", "400 g de légumes surgelés mélangés"],
      ["300 g cooked rice", "300 g de riz cuit"],
      ["40 ml soy sauce", "40 ml de sauce soja"],
      ["15 g cornflour", "15 g de fécule de maïs"],
      ["30 ml oil", "30 ml d'huile"],
    ],
    steps: [
      [
        "Coat the tofu in cornflour and fry until crisp on all sides.",
        "Enrober le tofu de fécule et le faire dorer sur toutes les faces.",
      ],
      [
        "Stir-fry the vegetables for five minutes.",
        "Sauter les légumes cinq minutes.",
      ],
      [
        "Add the rice, tofu and soy sauce and toss until hot.",
        "Ajouter le riz, le tofu et la sauce soja et mélanger jusqu'à ce que ce soit chaud.",
      ],
    ],
    tip: [
      "Cornflour is what makes tofu crisp instead of spongy.",
      "La fécule rend le tofu croustillant au lieu d'épongeux.",
    ],
  },
  {
    slug: "poulet-colombo-rice",
    category: "dinner",
    tags: ["highProtein", "caribbean"],
    prep: 20,
    cook: 40,
    servings: 4,
    macros: [36, 62, 22],
    title: ["Poulet colombo with rice", "Poulet colombo et riz"],
    summary: [
      "The Guadeloupean curry: mild, thickened with a little flour, served with rice.",
      "Le curry guadeloupéen : doux, lié à la farine, servi avec du riz.",
    ],
    ingredients: [
      ["800 g chicken thigh, cubed", "800 g de cuisse de poulet, en cubes"],
      ["2 onions, sliced", "2 oignons, en lamelles"],
      ["20 g colombo powder", "20 g de poudre de colombo"],
      ["1 courgette, cubed", "1 courgette, en cubes"],
      ["15 g flour", "15 g de farine"],
      ["400 g cooked rice", "400 g de riz cuit"],
    ],
    steps: [
      [
        "Brown the chicken, then set it aside.",
        "Faire dorer le poulet, puis réserver.",
      ],
      [
        "Soften the onions, add the colombo powder and flour, then the chicken and 500 ml water.",
        "Faire fondre les oignons, ajouter le colombo et la farine, puis le poulet et 500 ml d'eau.",
      ],
      [
        "Add the courgette and simmer 30 minutes; serve with rice.",
        "Ajouter la courgette et mijoter 30 minutes ; servir avec le riz.",
      ],
    ],
    tip: [
      "Colombo is mild by design; the flour, not heat, is what thickens it.",
      "Le colombo est doux par nature : c'est la farine, pas le piquant, qui l'épaissit.",
    ],
  },
  {
    slug: "caribbean-coconut-chicken",
    category: "dinner",
    tags: ["highProtein", "caribbean"],
    prep: 20,
    cook: 35,
    servings: 4,
    macros: [34, 54, 26],
    title: ["Caribbean coconut chicken", "Poulet coco antillais"],
    summary: [
      "Chicken simmered in coconut milk with thyme, allspice and pepper.",
      "Poulet mijoté au lait de coco avec thym, quatre-épices et poivron.",
    ],
    ingredients: [
      ["800 g chicken thigh", "800 g de cuisse de poulet"],
      ["400 ml coconut milk", "400 ml de lait de coco"],
      ["1 onion, sliced", "1 oignon, en lamelles"],
      ["1 pepper, sliced", "1 poivron, en lamelles"],
      ["5 g allspice", "5 g de quatre-épices"],
      ["5 g dried thyme", "5 g de thym séché"],
    ],
    steps: [
      [
        "Brown the chicken in oil for eight minutes.",
        "Faire dorer le poulet à l'huile huit minutes.",
      ],
      [
        "Add onion, pepper, allspice and thyme and cook five minutes.",
        "Ajouter oignon, poivron, quatre-épices et thym et cuire cinq minutes.",
      ],
      [
        "Pour in the coconut milk and simmer 25 minutes until the sauce coats the chicken.",
        "Verser le lait de coco et mijoter 25 minutes jusqu'à ce que la sauce nappe le poulet.",
      ],
    ],
    tip: [
      "Simmer gently: coconut milk splits if it boils hard.",
      "Mijoter doucement : le lait de coco tranche s'il bout fort.",
    ],
  },
  {
    slug: "chicken-boucane-inspired",
    category: "dinner",
    tags: ["highProtein", "caribbean"],
    prep: 25,
    cook: 30,
    servings: 4,
    macros: [36, 40, 24],
    title: [
      "Smoked-style chicken with sweet potato",
      "Poulet fumé et patate douce",
    ],
    summary: [
      "Inspired by boucané: smoked paprika, lime and thyme over chicken and sweet potato.",
      "Inspiré du boucané : paprika fumé, citron vert et thym sur poulet et patate douce.",
    ],
    ingredients: [
      ["800 g chicken thigh", "800 g de cuisse de poulet"],
      ["600 g sweet potato, cubed", "600 g de patate douce, en cubes"],
      ["10 g smoked paprika", "10 g de paprika fumé"],
      ["5 g dried thyme", "5 g de thym séché"],
      ["1 lime", "1 citron vert"],
      ["30 ml oil", "30 ml d'huile"],
    ],
    steps: [
      [
        "Rub the chicken with paprika, thyme, lime juice and oil and leave 15 minutes.",
        "Frotter le poulet de paprika, thym, jus de citron vert et huile et laisser 15 minutes.",
      ],
      [
        "Roast the sweet potato at 200 °C for 25 minutes.",
        "Rôtir la patate douce à 200 °C 25 minutes.",
      ],
      [
        "Pan-fry the chicken 12 minutes, slice it and serve over the sweet potato.",
        "Poêler le poulet 12 minutes, l'émincer et servir sur la patate douce.",
      ],
    ],
    tip: [
      "Smoked paprika is the whole point here; sweet paprika will taste flat.",
      "Le paprika fumé fait tout ici ; le doux paraîtra fade.",
    ],
  },
  {
    slug: "creole-chicken-pasta",
    category: "dinner",
    tags: ["highProtein", "caribbean", "budget"],
    prep: 20,
    cook: 25,
    servings: 3,
    macros: [34, 66, 22],
    title: ["Creole chicken pasta", "Pâtes créoles au poulet"],
    summary: [
      "Tomato, pepper and thyme with chicken, tossed through pasta.",
      "Tomate, poivron et thym avec du poulet, mélangés aux pâtes.",
    ],
    ingredients: [
      ["400 g pasta", "400 g de pâtes"],
      ["400 g chicken thigh, sliced", "400 g de cuisse de poulet, émincée"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 pepper, sliced", "1 poivron, en lamelles"],
      ["1 onion, chopped", "1 oignon, haché"],
      ["5 g dried thyme", "5 g de thym séché"],
    ],
    steps: [
      [
        "Brown the chicken for eight minutes, then set aside.",
        "Faire dorer le poulet huit minutes, puis réserver.",
      ],
      [
        "Soften onion and pepper, add tomatoes and thyme and simmer ten minutes.",
        "Faire fondre oignon et poivron, ajouter tomates et thym et mijoter dix minutes.",
      ],
      [
        "Return the chicken and toss with the drained pasta.",
        "Remettre le poulet et mélanger avec les pâtes égouttées.",
      ],
    ],
    tip: [
      "A pinch of chilli is optional; the thyme and pepper carry it.",
      "Une pincée de piment est facultative : le thym et le poivron suffisent.",
    ],
  },
  {
    slug: "plantain-gratin",
    category: "dinner",
    tags: ["vegetarian", "caribbean"],
    prep: 20,
    cook: 35,
    servings: 4,
    macros: [14, 62, 22],
    title: ["Plantain gratin", "Gratin de bananes plantain"],
    summary: [
      "Ripe plantain baked in a light white sauce with nutmeg and cheese.",
      "Banane plantain mûre gratinée dans une sauce blanche au muscade et au fromage.",
    ],
    ingredients: [
      ["4 ripe plantains, sliced", "4 bananes plantain mûres, en rondelles"],
      ["400 ml milk", "400 ml de lait"],
      ["40 g flour", "40 g de farine"],
      ["40 g butter", "40 g de beurre"],
      ["100 g cheese, grated", "100 g de fromage, râpé"],
      ["5 g nutmeg", "5 g de muscade"],
    ],
    steps: [
      [
        "Make a white sauce with the butter, flour and milk; season with nutmeg.",
        "Préparer une sauce blanche avec beurre, farine et lait ; assaisonner de muscade.",
      ],
      [
        "Layer the plantain in a dish and pour the sauce over.",
        "Disposer les plantains dans un plat et verser la sauce.",
      ],
      [
        "Top with cheese and bake at 190 °C for 30 minutes.",
        "Couvrir de fromage et cuire à 190 °C 30 minutes.",
      ],
    ],
    tip: [
      "Black-skinned plantains are the sweet ones; green ones are for frying.",
      "Les plantains à peau noire sont les sucrés ; les verts sont pour la friture.",
    ],
  },
  {
    slug: "caribbean-fish-rice",
    category: "dinner",
    tags: ["highProtein", "caribbean"],
    prep: 20,
    cook: 25,
    servings: 3,
    macros: [32, 56, 18],
    title: ["Caribbean-style fish with rice", "Poisson antillais et riz"],
    summary: [
      "White fish in a lime, thyme and tomato sauce, over rice.",
      "Poisson blanc en sauce citron vert, thym et tomate, sur du riz.",
    ],
    ingredients: [
      ["600 g white fish fillets", "600 g de filets de poisson blanc"],
      [
        "400 g canned chopped tomatoes",
        "400 g de tomates concassées en conserve",
      ],
      ["1 onion, chopped", "1 oignon, haché"],
      ["1 lime", "1 citron vert"],
      ["5 g dried thyme", "5 g de thym séché"],
      ["350 g cooked rice", "350 g de riz cuit"],
    ],
    steps: [
      [
        "Soften the onion, add tomatoes, thyme and lime juice and simmer ten minutes.",
        "Faire fondre l'oignon, ajouter tomates, thym et jus de citron vert et mijoter dix minutes.",
      ],
      [
        "Lay the fish in the sauce, cover and cook eight minutes.",
        "Déposer le poisson dans la sauce, couvrir et cuire huit minutes.",
      ],
      [
        "Serve over rice, spooning the sauce on top.",
        "Servir sur le riz en nappant de sauce.",
      ],
    ],
    tip: [
      "Cook the fish in the sauce, not beside it; it stays moist.",
      "Cuire le poisson dans la sauce, pas à côté : il reste moelleux.",
    ],
  },
  {
    slug: "coconut-rice-grilled-chicken",
    category: "dinner",
    tags: ["highProtein", "caribbean"],
    prep: 20,
    cook: 30,
    servings: 3,
    macros: [36, 62, 22],
    title: ["Coconut rice with grilled chicken", "Riz coco et poulet grillé"],
    summary: [
      "Rice cooked in coconut milk, chicken charred in a hot pan.",
      "Riz cuit au lait de coco, poulet saisi dans une poêle bien chaude.",
    ],
    ingredients: [
      ["300 g rice", "300 g de riz"],
      ["400 ml coconut milk", "400 ml de lait de coco"],
      ["600 g chicken thigh", "600 g de cuisse de poulet"],
      ["5 g paprika", "5 g de paprika"],
      ["2 spring onions, sliced", "2 oignons nouveaux, émincés"],
      ["30 ml oil", "30 ml d'huile"],
    ],
    steps: [
      [
        "Simmer the rice in the coconut milk with a pinch of salt for 15 minutes, covered.",
        "Cuire le riz dans le lait de coco avec une pincée de sel 15 minutes à couvert.",
      ],
      [
        "Rub the chicken with paprika, salt and oil and pan-fry 12 minutes.",
        "Frotter le poulet de paprika, sel et huile et le poêler 12 minutes.",
      ],
      [
        "Slice the chicken over the rice and scatter the spring onion.",
        "Émincer le poulet sur le riz et parsemer d'oignon nouveau.",
      ],
    ],
    tip: [
      "Rinse the rice first so the coconut milk does not glue it together.",
      "Rincer le riz d'abord pour que le lait de coco ne le colle pas.",
    ],
  },
  {
    slug: "christophine-gratin",
    category: "dinner",
    tags: ["vegetarian", "caribbean"],
    prep: 25,
    cook: 35,
    servings: 4,
    macros: [16, 44, 22],
    title: ["Christophine gratin", "Gratin de christophines"],
    summary: [
      "Chayote baked under a cheese sauce; mild, soft and cheap.",
      "Chayote gratinée sous une sauce au fromage : douce, fondante et économique.",
    ],
    ingredients: [
      ["3 christophines (chayote)", "3 christophines"],
      ["400 ml milk", "400 ml de lait"],
      ["40 g flour", "40 g de farine"],
      ["40 g butter", "40 g de beurre"],
      ["120 g cheese, grated", "120 g de fromage, râpé"],
      ["5 g nutmeg", "5 g de muscade"],
    ],
    steps: [
      [
        "Boil the christophines whole for 20 minutes, then peel and slice them.",
        "Cuire les christophines entières 20 minutes, puis les peler et les trancher.",
      ],
      [
        "Make a white sauce with butter, flour, milk and nutmeg.",
        "Préparer une sauce blanche avec beurre, farine, lait et muscade.",
      ],
      [
        "Layer the slices with the sauce, top with cheese and bake 25 minutes at 190 °C.",
        "Alterner les tranches et la sauce, couvrir de fromage et cuire 25 minutes à 190 °C.",
      ],
    ],
    tip: [
      "Peel them under running water; the sap is sticky on warm hands.",
      "Les peler sous l'eau courante : la sève colle sur les mains chaudes.",
    ],
  },
];
