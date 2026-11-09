import type { Locale } from "@/i18n/routing";

/**
 * SAMPLE SEED DATA, not production data. Written by hand for Stage 1 so the
 * public recipe library has real content to browse. Nutrition figures are
 * estimates, and every page that shows them says so. Replaced by Supabase rows
 * (Stage 2 tables, Stage 4 food database); the shape below mirrors what a
 * database row will need, so pages keep working when the source changes.
 */

export type RecipeCategory =
  "smoothie" | "breakfast" | "lunch" | "dinner" | "snack";

export type Nutrition = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type Recipe = {
  slug: string;
  category: RecipeCategory;
  title: string;
  summary: string;
  prepMinutes: number;
  /** Servings the ingredient list is written for. */
  baseServings: number;
  /** Values for one serving. */
  perServing: Nutrition;
  ingredients: string[];
  steps: string[];
  tip: string;
  updatedAt: string;
};

export const recipeCategories: RecipeCategory[] = [
  "smoothie",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

const en: Recipe[] = [
  {
    slug: "banana-oat-smoothie",
    category: "smoothie",
    title: "Banana and oat smoothie",
    summary:
      "Oats make it thick, banana makes it sweet. Drink it slowly, not all at once.",
    prepMinutes: 5,
    baseServings: 1,
    perServing: { kcal: 520, proteinG: 22, carbsG: 78, fatG: 14 },
    ingredients: [
      "350 ml whole milk",
      "1 banana",
      "60 g rolled oats",
      "15 ml honey",
      "a pinch of cinnamon",
    ],
    steps: [
      "Put the oats and milk in the blender and let them sit for two minutes, so the oats soften.",
      "Add the banana, honey and cinnamon, then blend for one minute until thick.",
      "Pour into a glass and drink within ten minutes, while it is still cold.",
    ],
    tip: "Thicker is better. Add 20 ml more milk if the blender stalls.",
    updatedAt: "2026-10-20",
  },
  {
    slug: "peanut-butter-power-smoothie",
    category: "smoothie",
    title: "Peanut butter and yogurt smoothie",
    summary:
      "The dense one. Peanut butter carries the calories, yogurt carries the protein.",
    prepMinutes: 5,
    baseServings: 1,
    perServing: { kcal: 610, proteinG: 28, carbsG: 62, fatG: 30 },
    ingredients: [
      "200 g plain yogurt",
      "30 g peanut butter",
      "250 ml whole milk",
      "30 g rolled oats",
      "10 ml honey",
    ],
    steps: [
      "Blend the yogurt, peanut butter and milk until the peanut butter is evenly spread.",
      "Add the oats and honey, and blend again for forty seconds.",
      "Rest for two minutes before drinking, so the oats settle.",
    ],
    tip: "If it tastes thin, blend in 100 g more yogurt rather than more milk.",
    updatedAt: "2026-10-20",
  },
  {
    slug: "maple-wheat-pancakes",
    category: "breakfast",
    title: "Whole wheat pancakes with maple syrup",
    summary:
      "Two stacked pancakes, not one thin one. Wheat flour makes them heavier.",
    prepMinutes: 20,
    baseServings: 2,
    perServing: { kcal: 540, proteinG: 16, carbsG: 72, fatG: 20 },
    ingredients: [
      "180 g whole wheat flour",
      "3 eggs",
      "300 ml whole milk",
      "30 ml maple syrup",
      "30 g butter",
      "10 g baking powder",
    ],
    steps: [
      "Whisk the eggs, milk and melted butter together.",
      "Add the flour, baking powder and maple syrup, and stir until no dry patches remain.",
      "Cook four pancakes of about 12 cm, two per serving, over medium heat.",
      "Stack them and add 10 ml of maple syrup on top of each stack.",
    ],
    tip: "Keep the heat medium. High heat browns the outside before the middle sets.",
    updatedAt: "2026-10-12",
  },
  {
    slug: "egg-cheese-scramble",
    category: "breakfast",
    title: "Egg and cheese scramble with toast",
    summary:
      "Fast, savoury, and easy to eat when a sweet breakfast feels heavy.",
    prepMinutes: 12,
    baseServings: 1,
    perServing: { kcal: 480, proteinG: 26, carbsG: 22, fatG: 30 },
    ingredients: [
      "3 eggs",
      "60 g cheddar",
      "40 g butter",
      "60 ml whole milk",
      "2 slices of bread",
    ],
    steps: [
      "Beat the eggs with the milk until they are loose.",
      "Melt the butter in a pan, pour in the eggs, and stir slowly over low heat.",
      "Add the cheese when the eggs are still soft, then take the pan off the heat.",
      "Serve on toast, cut into pieces rather than one big mound.",
    ],
    tip: "Low heat keeps it soft, which is easier to finish when your appetite is small.",
    updatedAt: "2026-09-28",
  },
  {
    slug: "tuna-rice-bowl",
    category: "lunch",
    title: "Tuna and rice bowl with olive oil",
    summary: "A lunch you can build in fifteen minutes from shelf items.",
    prepMinutes: 15,
    baseServings: 1,
    perServing: { kcal: 620, proteinG: 34, carbsG: 70, fatG: 22 },
    ingredients: [
      "150 g cooked rice",
      "120 g canned tuna",
      "15 ml olive oil",
      "30 g canned white beans",
      "20 ml lemon juice",
      "a pinch of salt",
    ],
    steps: [
      "Warm the rice if it is cold, so it is easier to eat in one sitting.",
      "Drain the tuna and break it into the rice.",
      "Add the beans, olive oil, lemon juice and salt, and toss gently.",
      "Eat warm, in three passes rather than pushing through the whole bowl.",
    ],
    tip: "Olive oil is the quiet addition here, 15 ml adds about 130 kcal.",
    updatedAt: "2026-10-05",
  },
  {
    slug: "chickpea-pasta-pesto",
    category: "lunch",
    title: "Chickpea pasta with pesto",
    summary:
      "Bean pasta keeps more protein than wheat pasta, and pesto keeps the calories up.",
    prepMinutes: 20,
    baseServings: 2,
    perServing: { kcal: 640, proteinG: 28, carbsG: 74, fatG: 26 },
    ingredients: [
      "250 g chickpea pasta",
      "60 g pesto",
      "30 g parmesan",
      "20 ml olive oil",
      "salt for the cooking water",
    ],
    steps: [
      "Boil the pasta two minutes shorter than the packet says, so it stays firm.",
      "Save 100 ml of the cooking water before draining.",
      "Loosen the pesto with the cooking water, then toss the pasta in it.",
      "Add the parmesan and olive oil at the end, off the heat.",
    ],
    tip: "Bean pasta cooks faster than wheat pasta, so check it from minute eight.",
    updatedAt: "2026-10-18",
  },
  {
    slug: "creamy-chicken-rice",
    category: "dinner",
    title: "Creamy chicken with rice",
    summary:
      "One pan, two servings, and a sauce that makes the rice go down easily.",
    prepMinutes: 35,
    baseServings: 2,
    perServing: { kcal: 680, proteinG: 40, carbsG: 66, fatG: 28 },
    ingredients: [
      "300 g chicken thigh",
      "250 g cooked rice",
      "200 ml cream",
      "30 g butter",
      "15 ml lemon juice",
      "salt and black pepper",
    ],
    steps: [
      "Brown the chicken in the butter over medium heat, ten minutes per side.",
      "Add the cream and lemon juice, and simmer for five minutes until the sauce thickens.",
      "Stir the rice into the sauce and warm it through.",
      "Season at the end, and serve while the sauce is still glossy.",
    ],
    tip: "Thigh rather than breast: it stays soft and carries more fat.",
    updatedAt: "2026-10-22",
  },
  {
    slug: "beef-ragu-pasta",
    category: "dinner",
    title: "Beef ragu with pasta",
    summary: "A pot that keeps for two dinners, so cooking happens once.",
    prepMinutes: 40,
    baseServings: 3,
    perServing: { kcal: 700, proteinG: 36, carbsG: 78, fatG: 28 },
    ingredients: [
      "400 g beef mince",
      "400 g tomato passata",
      "150 g onion",
      "300 ml whole milk",
      "450 g pasta",
      "30 g butter",
      "salt and black pepper",
    ],
    steps: [
      "Soft the onion in the butter over low heat for eight minutes.",
      "Add the mince and brown it, breaking it up as it cooks.",
      "Add the passata and milk, and simmer for twenty minutes on low.",
      "Boil the pasta, then mix it into the ragu rather than pouring sauce over it.",
    ],
    tip: "Milk in the ragu is the soft part, it rounds the tomato and adds calories.",
    updatedAt: "2026-10-22",
  },
  {
    slug: "peanut-butter-energy-bites",
    category: "snack",
    title: "Peanut butter and oat energy bites",
    summary:
      "No baking. Make eight on Sunday, keep them in a jar, eat one when you need one.",
    prepMinutes: 15,
    baseServings: 4,
    perServing: { kcal: 260, proteinG: 12, carbsG: 30, fatG: 12 },
    ingredients: [
      "120 g rolled oats",
      "90 g peanut butter",
      "60 ml honey",
      "30 g desiccated coconut",
      "30 ml whole milk",
    ],
    steps: [
      "Warm the honey and peanut butter until they run together.",
      "Mix in the oats and coconut, then press the mixture flat in a bowl.",
      "Chill for twenty minutes so it holds its shape.",
      "Roll into eight bites, four per serving, and keep them cold.",
    ],
    tip: "If the mixture will not hold, add 15 ml milk, not more oats.",
    updatedAt: "2026-10-14",
  },
];

const fr: Recipe[] = [
  {
    slug: "banana-oat-smoothie",
    category: "smoothie",
    title: "Smoothie banane et avoine",
    summary:
      "L'avoine l'épaissit, la banane l'adoucit. Se boit lentement, pas d'un seul trait.",
    prepMinutes: 5,
    baseServings: 1,
    perServing: { kcal: 520, proteinG: 22, carbsG: 78, fatG: 14 },
    ingredients: [
      "350 ml de lait entier",
      "1 banane",
      "60 g de flocons d'avoine",
      "15 ml de miel",
      "une pincée de cannelle",
    ],
    steps: [
      "Mettre l'avoine et le lait dans le mixeur et attendre deux minutes, pour que l'avoine s'attendrisse.",
      "Ajouter la banane, le miel et la cannelle, puis mixer une minute jusqu'à ce que ce soit épais.",
      "Verser dans un verre et boire dans les dix minutes, tant que c'est encore froid.",
    ],
    tip: "Plus épais vaut mieux. Ajouter 20 ml de lait si le mixeur bloque.",
    updatedAt: "2026-10-20",
  },
  {
    slug: "peanut-butter-power-smoothie",
    category: "smoothie",
    title: "Smoothie beurre de cacahuète et yaourt",
    summary:
      "Le plus dense. Le beurre de cacahuète porte les calories, le yaourt les protéines.",
    prepMinutes: 5,
    baseServings: 1,
    perServing: { kcal: 610, proteinG: 28, carbsG: 62, fatG: 30 },
    ingredients: [
      "200 g de yaourt nature",
      "30 g de beurre de cacahuète",
      "250 ml de lait entier",
      "30 g de flocons d'avoine",
      "10 ml de miel",
    ],
    steps: [
      "Mixer le yaourt, le beurre de cacahuète et le lait jusqu'à ce que le beurre soit bien réparti.",
      "Ajouter l'avoine et le miel, puis mixer encore quarante secondes.",
      "Laisser reposer deux minutes avant de boire, pour que l'avoine se stabilise.",
    ],
    tip: "Si le goût est liquide, mixer 100 g de yaourt de plus plutôt que du lait.",
    updatedAt: "2026-10-20",
  },
  {
    slug: "maple-wheat-pancakes",
    category: "breakfast",
    title: "Crêpes épaisses au blé complet, sirop d'érable",
    summary:
      "Deux crêpes empilées, pas une seule fine. La farine de blé les rend plus lourdes.",
    prepMinutes: 20,
    baseServings: 2,
    perServing: { kcal: 540, proteinG: 16, carbsG: 72, fatG: 20 },
    ingredients: [
      "180 g de farine de blé complet",
      "3 œufs",
      "300 ml de lait entier",
      "30 ml de sirop d'érable",
      "30 g de beurre",
      "10 g de levure chimique",
    ],
    steps: [
      "Fouetter les œufs, le lait et le beurre fondu ensemble.",
      "Ajouter la farine, la levure et le sirop, puis remuer jusqu'à ce qu'il ne reste plus de farine sèche.",
      "Cuire quatre crêpes d'environ 12 cm, deux par portion, à feu moyen.",
      "Les empiler et mettre 10 ml de sirop d'érable sur chaque pile.",
    ],
    tip: "Garder le feu moyen. Un feu fort colore le dehors avant que le centre prenne.",
    updatedAt: "2026-10-12",
  },
  {
    slug: "egg-cheese-scramble",
    category: "breakfast",
    title: "Brouillade d'œufs et fromage, avec pain grillé",
    summary:
      "Rapide, salé, facile à manger quand un petit-déjeuner sucré paraît lourd.",
    prepMinutes: 12,
    baseServings: 1,
    perServing: { kcal: 480, proteinG: 26, carbsG: 22, fatG: 30 },
    ingredients: [
      "3 œufs",
      "60 g de cheddar",
      "40 g de beurre",
      "60 ml de lait entier",
      "2 tranches de pain",
    ],
    steps: [
      "Battre les œufs avec le lait jusqu'à ce qu'ils soient fluides.",
      "Fondre le beurre dans la poêle, verser les œufs, remuer lentement à feu doux.",
      "Ajouter le fromage quand les œufs sont encore tendres, puis retirer la poêle du feu.",
      "Servir sur le pain grillé, coupé en morceaux plutôt qu'en une seule masse.",
    ],
    tip: "Le feu doux le garde tendre, plus facile à finir quand l'appétit est petit.",
    updatedAt: "2026-09-28",
  },
  {
    slug: "tuna-rice-bowl",
    category: "lunch",
    title: "Bol de riz au thon, avec huile d'olive",
    summary:
      "Un repas du midi qu'on monte en quinze minutes avec des choses du placard.",
    prepMinutes: 15,
    baseServings: 1,
    perServing: { kcal: 620, proteinG: 34, carbsG: 70, fatG: 22 },
    ingredients: [
      "150 g de riz cuit",
      "120 g de thon en conserve",
      "15 ml d'huile d'olive",
      "30 g de haricots blancs en conserve",
      "20 ml de jus de citron",
      "une pincée de sel",
    ],
    steps: [
      "Réchauffer le riz s'il est froid, pour qu'il soit plus facile à manger d'une seule assise.",
      "Égoutter le thon et le casser dans le riz.",
      "Ajouter les haricots, l'huile d'olive, le jus de citron et le sel, puis mélanger doucement.",
      "Manger tiède, en trois passages plutôt qu'en forçant tout le bol.",
    ],
    tip: "L'huile d'olive est l'ajout discret ici, 15 ml portent environ 130 kcal.",
    updatedAt: "2026-10-05",
  },
  {
    slug: "chickpea-pasta-pesto",
    category: "lunch",
    title: "Pâtes de pois chiche au pesto",
    summary:
      "Les pâtes de légumineuses gardent plus de protéines que le blé, et le pesto tient les calories.",
    prepMinutes: 20,
    baseServings: 2,
    perServing: { kcal: 640, proteinG: 28, carbsG: 74, fatG: 26 },
    ingredients: [
      "250 g de pâtes de pois chiche",
      "60 g de pesto",
      "30 g de parmesan",
      "20 ml d'huile d'olive",
      "du sel pour l'eau de cuisson",
    ],
    steps: [
      "Bouillir les pâtes deux minutes de moins que ce que dit le paquet, pour qu'elles restent fermes.",
      "Garder 100 ml d'eau de cuisson avant d'égoutter.",
      "Détendre le pesto avec l'eau de cuisson, puis jeter les pâtes dedans.",
      "Ajouter le parmesan et l'huile d'olive à la fin, hors du feu.",
    ],
    tip: "Les pâtes de légumineuses cuisent plus vite que le blé, vérifier dès la minute huit.",
    updatedAt: "2026-10-18",
  },
  {
    slug: "creamy-chicken-rice",
    category: "dinner",
    title: "Poulet crémeux avec riz",
    summary:
      "Une seule poêle, deux portions, et une sauce qui fait passer le riz facilement.",
    prepMinutes: 35,
    baseServings: 2,
    perServing: { kcal: 680, proteinG: 40, carbsG: 66, fatG: 28 },
    ingredients: [
      "300 g de cuisse de poulet",
      "250 g de riz cuit",
      "200 ml de crème",
      "30 g de beurre",
      "15 ml de jus de citron",
      "sel et poivre noir",
    ],
    steps: [
      "Colorer le poulet dans le beurre à feu moyen, dix minutes de chaque côté.",
      "Ajouter la crème et le jus de citron, puis mijoter cinq minutes jusqu'à ce que la sauce épaississe.",
      "Remuer le riz dans la sauce et le réchauffer à travers.",
      "Assaisonner à la fin, et servir pendant que la sauce est encore brillante.",
    ],
    tip: "La cuisse plutôt que la poitrine : elle reste tendre et porte plus de gras.",
    updatedAt: "2026-10-22",
  },
  {
    slug: "beef-ragu-pasta",
    category: "dinner",
    title: "Ragoût de bœuf aux pâtes",
    summary:
      "Une marmite qui tient deux dîners, donc la cuisson se fait une fois.",
    prepMinutes: 40,
    baseServings: 3,
    perServing: { kcal: 700, proteinG: 36, carbsG: 78, fatG: 28 },
    ingredients: [
      "400 g de bœuf haché",
      "400 g de passata de tomate",
      "150 g d'oignon",
      "300 ml de lait entier",
      "450 g de pâtes",
      "30 g de beurre",
      "sel et poivre noir",
    ],
    steps: [
      "Attendrir l'oignon dans le beurre à feu doux pendant huit minutes.",
      "Ajouter le bœuf haché et le colorer, en le cassant pendant la cuisson.",
      "Ajouter la passata et le lait, puis mijoter vingt minutes à feu doux.",
      "Bouillir les pâtes, puis les mélanger dans le ragoût plutôt que de verser la sauce dessus.",
    ],
    tip: "Le lait dans le ragoût est la partie douce, il arrondit la tomate et ajoute des calories.",
    updatedAt: "2026-10-22",
  },
  {
    slug: "peanut-butter-energy-bites",
    category: "snack",
    title: "Bouchées d'avoine et beurre de cacahuète",
    summary:
      "Sans cuisson. Faire huit bouchées dimanche, les garder dans un bocal, en manger une quand il le faut.",
    prepMinutes: 15,
    baseServings: 4,
    perServing: { kcal: 260, proteinG: 12, carbsG: 30, fatG: 12 },
    ingredients: [
      "120 g de flocons d'avoine",
      "90 g de beurre de cacahuète",
      "60 ml de miel",
      "30 g de coco râpé",
      "30 ml de lait entier",
    ],
    steps: [
      "Tiédir le miel et le beurre de cacahuète jusqu'à ce qu'ils coulent ensemble.",
      "Incorporer l'avoine et le coco, puis presser le mélange à plat dans un bol.",
      "Réfrigérer vingt minutes pour que la forme tienne.",
      "Rouler en huit bouchées, quatre par portion, et garder au froid.",
    ],
    tip: "Si le mélange ne tient pas, ajouter 15 ml de lait, pas plus d'avoine.",
    updatedAt: "2026-10-14",
  },
];

export const recipesByLocale: Record<Locale, Recipe[]> = { en, fr };

/** Same slugs in both languages, so locale switching keeps you on the recipe. */
export const recipeSlugs: string[] = en.map((recipe) => recipe.slug);

export function getRecipes(locale: Locale): Recipe[] {
  return recipesByLocale[locale];
}

export function getRecipe(locale: Locale, slug: string): Recipe | undefined {
  return recipesByLocale[locale].find((recipe) => recipe.slug === slug);
}
