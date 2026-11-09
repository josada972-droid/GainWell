import type { Locale } from "@/i18n/routing";

/**
 * SAMPLE SEED DATA, not production data. Written by hand for Stage 1. General
 * information only, never medical advice, and no promised results. Replaced by
 * database-backed articles when the content tables exist (Stage 2).
 */

export type GuideSection = {
  heading: string;
  body: string[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  readingMinutes: number;
  updatedAt: string;
  sections: GuideSection[];
};

const en: Guide[] = [
  {
    slug: "weight-gain-basics",
    title: "Healthy weight gain, in plain words",
    summary: "What eating more actually means, and what it does not mean.",
    readingMinutes: 6,
    updatedAt: "2026-10-24",
    sections: [
      {
        heading: "Eating more, not eating junk",
        body: [
          "Weight gain comes from eating more energy than you use over days, not from one big meal. The easy way to get there is to add food you already like, rather than to force things you do not.",
          "Ultra-processed food can do the job, but it often leaves you less hungry an hour later. A smoothie with milk, oats and banana works better for most people than a bag of chips.",
        ],
      },
      {
        heading: "A pace you can keep",
        body: [
          "Most people gain at a slow, uneven pace. Some weeks the scale moves, some weeks it does not, and appetite changes with stress, sleep and weather.",
          "A small daily addition is easier to hold than a large one. Two hundred extra kilocalories, added to a meal you already eat, is a change most people can keep doing.",
        ],
      },
      {
        heading: "What to watch instead of the scale",
        body: [
          "Clothes, strength, and how often you finish what you serve tell you more than a morning number. Tracking meals shows whether you really ate more, which the scale cannot tell you.",
          "If you have a health condition, or if your weight changes without you changing your eating, talk to a doctor or a dietitian first.",
        ],
      },
    ],
  },
  {
    slug: "calories-and-macros",
    title: "Calories and macronutrients",
    summary: "The three numbers on a label, and what each one is for.",
    readingMinutes: 7,
    updatedAt: "2026-10-19",
    sections: [
      {
        heading: "Calories are a count of energy",
        body: [
          "A kilocalorie is a unit of energy. Your body spends it on moving, warming, digesting and thinking. Food is the only way in.",
          "Labels count energy, not quality. A food can carry many kilocalories and still be poor at giving you protein, fibre and vitamins.",
        ],
      },
      {
        heading: "Protein, carbohydrate, fat",
        body: [
          "Protein builds and repairs tissue. It comes from meat, fish, eggs, dairy, beans and soy. Protein in every meal helps you feel satisfied, which is why a sugary snack often fails.",
          "Carbohydrates carry the energy for movement. Bread, rice, oats, pasta, potatoes and fruit are the everyday sources.",
          "Fat carries the most energy per gram and makes food taste good. Olive oil, butter, nuts, peanut butter, cream and cheese are small additions with a large effect.",
        ],
      },
      {
        heading: "Reading a label without guessing",
        body: [
          "Most labels are written per 100 g or per 100 ml. Multiply by the amount you actually eat, then add the extras you pour on top.",
          "A serving printed on a packet rarely matches the serving you cook. Keep your own measure in grams, and you will know what you ate.",
        ],
      },
      {
        heading: "A rough shape of a day",
        body: [
          "Three meals plus one extra is a shape many people hold: breakfast, lunch, dinner, and a second helping or a snack at a fixed hour.",
          "The extra does not have to be new food. Adding butter to your eggs, cream to your sauce or oil to your rice is enough on most days.",
        ],
      },
    ],
  },
  {
    slug: "eating-with-low-appetite",
    title: "Eating when your appetite is small",
    summary: "Full stomachs, early satiety, and ways around them.",
    readingMinutes: 6,
    updatedAt: "2026-10-26",
    sections: [
      {
        heading: "Fullness is the real limit",
        body: [
          "When appetite is low, the problem is not willpower, it is volume. A big plate of vegetables fills the stomach before the calories arrive.",
          "Dense food beats large food. Rice, oats, pasta, nuts and dairy give more energy in the same mouthful than soup, salad or broth.",
        ],
      },
      {
        heading: "Drink the calories that will not chew",
        body: [
          "Liquid is easier to finish than solid food. Milk with oats, yogurt with peanut butter, or a banana smoothie can carry several hundred kilocalories with little chewing.",
          "Drink slowly, over ten minutes, rather than in one go. Fast drinking often ends in discomfort, and then you stop.",
        ],
      },
      {
        heading: "Move the hour, not the plate",
        body: [
          "If a meal stalls at the halfway point, stop there and eat the rest an hour later. Two half meals beat one abandoned plate.",
          "A fixed snack hour works better than waiting for hunger, because hunger may never arrive on a low-appetite day.",
        ],
      },
      {
        heading: "When to ask someone",
        body: [
          "Loss of appetite that lasts weeks, or that comes with pain, nausea or weight loss you did not choose, is worth a conversation with a doctor or a dietitian.",
          "This guide describes ordinary eating difficulty. It does not diagnose anything.",
        ],
      },
    ],
  },
  {
    slug: "affordable-nutritious-meals",
    title: "Nutritious meals on a small budget",
    summary: "The cheap staples that carry protein and energy.",
    readingMinutes: 5,
    updatedAt: "2026-10-16",
    sections: [
      {
        heading: "The four cheap workhorses",
        body: [
          "Whole milk, oats, eggs and canned beans carry protein and energy at low cost, and they keep well. Dried pasta and rice fill the gaps.",
          "Frozen vegetables are as good as fresh and do not spoil, so nothing gets thrown away when you cook late.",
        ],
      },
      {
        heading: "Cook once, eat twice",
        body: [
          "A pot of ragu or a creamy chicken makes two dinners. Cooking once costs less fuel, less time and less waste than cooking twice.",
          "Portion the second dinner into a jar while the pot is warm, so it is ready when you are tired.",
        ],
      },
      {
        heading: "The quiet additions",
        body: [
          "Oil, butter, cream and peanut butter are the cheapest calories in a kitchen. Fifteen millilitres of olive oil adds about 130 kilocalories to a bowl.",
          "Add them at the end, off the heat, so the taste stays clear and the amount stays visible.",
        ],
      },
    ],
  },
  {
    slug: "nutritious-smoothies",
    title: "Nutritious smoothies you can make at home",
    summary: "How to make a smoothie that fills you, not just sweetens you.",
    readingMinutes: 5,
    updatedAt: "2026-10-21",
    sections: [
      {
        heading: "Three parts, always",
        body: [
          "A smoothie that works has a liquid, a carbohydrate and a protein. Milk or yogurt for the liquid, oats or banana for the carbohydrate, peanut butter, nuts or protein-rich yogurt for the protein.",
          "Fruit juice alone is sugar and volume. It fills the stomach before it adds much energy.",
        ],
      },
      {
        heading: "Thick beats thin",
        body: [
          "Oats and yogurt make a smoothie thick, which keeps you satisfied longer. A thin smoothie is easy to drink and easy to forget.",
          "Blend short, then rest two minutes. Oats swell, and the glass feels fuller than it looked.",
        ],
      },
      {
        heading: "Keep it a snack, not a fourth meal",
        body: [
          "A smoothie works best at a fixed hour, between two meals, so it does not push the next meal away.",
          "If it replaces a meal, add something savoury, such a spoon of peanut butter in a yogurt smoothie, so the protein is clear.",
        ],
      },
    ],
  },
];

const fr: Guide[] = [
  {
    slug: "weight-gain-basics",
    title: "Prendre du poids sainement, avec des mots simples",
    summary:
      "Ce que manger plus veut vraiment dire, et ce que cela ne veut pas dire.",
    readingMinutes: 6,
    updatedAt: "2026-10-24",
    sections: [
      {
        heading: "Manger plus, pas manger n'importe quoi",
        body: [
          "La prise de poids vient d'une énergie plus grande que celle que vous utilisez sur plusieurs jours, pas d'un seul gros repas. Le chemin facile est d'ajouter des aliments que vous aimez déjà, plutôt que de forcer des choses que vous n'aimez pas.",
          "Les aliments très transformés peuvent faire le travail, mais ils laissent souvent moins faim une heure après. Un smoothie avec lait, avoine et banane marche mieux pour la plupart des gens qu'un sac de chips.",
        ],
      },
      {
        heading: "Un rythme que vous pouvez tenir",
        body: [
          "La plupart des personnes prennent du poids lentement et sans régularité. Certaines semaines la balance bouge, d'autres non, et l'appétit change avec le stress, le sommeil et la météo.",
          "Une petite addition quotidienne est plus tenable qu'une grande. Deux cents kilocalories de plus, ajoutées à un repas que vous mangez déjà, est un changement que la plupart peuvent continuer.",
        ],
      },
      {
        heading: "Ce que regarder plutôt que la balance",
        body: [
          "Les vêtements, la force et la fréquence à laquelle vous finissez ce que vous servez disent plus qu'un chiffre du matin. Suivre les repas montre si vous avez vraiment mangé plus, ce que la balance ne peut pas dire.",
          "Si vous avez un problème de santé, ou si votre poids change sans que vous changiez votre alimentation, parlez d'abord à un médecin ou à un diététicien.",
        ],
      },
    ],
  },
  {
    slug: "calories-and-macros",
    title: "Calories et macronutriments",
    summary: "Les trois chiffres d'une étiquette, et à quoi sert chacun.",
    readingMinutes: 7,
    updatedAt: "2026-10-19",
    sections: [
      {
        heading: "Les calories comptent l'énergie",
        body: [
          "La kilocalorie est une unité d'énergie. Votre corps la dépense pour bouger, se réchauffer, digérer et penser. La nourriture est la seule entrée.",
          "Les étiquettes comptent l'énergie, pas la qualité. Un aliment peut porter beaucoup de kilocalories et rester pauvre en protéines, fibres et vitamines.",
        ],
      },
      {
        heading: "Protéines, glucides, lipides",
        body: [
          "Les protéines construisent et réparent les tissus. Elles viennent de la viande, du poisson, des œufs, des produits laitiers, des légumineuses et du soja. Des protéines dans chaque repas aident à être satisfait, voilà pourquoi une collation sucrée échoue souvent.",
          "Les glucides portent l'énergie du mouvement. Le pain, le riz, l'avoine, les pâtes, les pommes de terre et les fruits sont les sources du quotidien.",
          "Les lipides portent le plus d'énergie par gramme et rendent la nourriture bonne. L'huile d'olive, le beurre, les noix, le beurre de cacahuète, la crème et le fromage sont de petites additions avec un grand effet.",
        ],
      },
      {
        heading: "Lire une étiquette sans deviner",
        body: [
          "La plupart des étiquettes sont écrites pour 100 g ou 100 ml. Multipliez par la quantité que vous mangez vraiment, puis ajoutez ce que vous versez dessus.",
          "La portion imprimée sur le paquet correspond rarement à la portion que vous cuisez. Gardez votre propre mesure en grammes, et vous saurez ce que vous avez mangé.",
        ],
      },
      {
        heading: "Une forme approximative de la journée",
        body: [
          "Trois repas plus un extra est une forme que beaucoup tiennent : petit-déjeuner, midi, dîner, et une deuxième part ou une collation à une heure fixe.",
          "L'extra n'a pas besoin d'être un aliment nouveau. Ajouter du beurre aux œufs, de la crème à la sauce ou de l'huile au riz suffit la plupart des jours.",
        ],
      },
    ],
  },
  {
    slug: "eating-with-low-appetite",
    title: "Manger quand l'appétit est petit",
    summary: "Estomacs pleins, satiété rapide, et des chemins autour.",
    readingMinutes: 6,
    updatedAt: "2026-10-26",
    sections: [
      {
        heading: "La satiété est la vraie limite",
        body: [
          "Quand l'appétit est bas, le problème n'est pas la volonté, c'est le volume. Une grande assiette de légumes remplit l'estomac avant que les calories arrivent.",
          "La nourriture dense bat la nourriture grande. Le riz, l'avoine, les pâtes, les noix et les produits laitiers donnent plus d'énergie dans la même bouchée que la soupe, la salade ou le bouillon.",
        ],
      },
      {
        heading: "Boire les calories qui ne se mâchent pas",
        body: [
          "Le liquide est plus facile à finir que le solide. Le lait avec l'avoine, le yaourt avec le beurre de cacahuète ou un smoothie de banane peuvent porter plusieurs centaines de kilocalories avec peu de mastication.",
          "Boire lentement, sur dix minutes, plutôt qu'en une seule fois. Boire vite finit souvent par un inconfort, et on arrête.",
        ],
      },
      {
        heading: "Bouger l'heure, pas l'assiette",
        body: [
          "Si un repas bloque à la moitié, arrêter là et manger le reste une heure plus tard. Deux demi-repas battent une assiette abandonnée.",
          "Une heure de collation fixe marche mieux qu'attendre la faim, parce que la faim peut ne jamais arriver un jour d'appétit bas.",
        ],
      },
      {
        heading: "Quand demander à quelqu'un",
        body: [
          "Une perte d'appétit qui dure des semaines, ou qui vient avec des douleurs, des nausées ou une perte de poids que vous n'avez pas choisie, mérite une conversation avec un médecin ou un diététicien.",
          "Ce guide décrit une difficulté ordinaire de manger. Il ne diagnostique rien.",
        ],
      },
    ],
  },
  {
    slug: "affordable-nutritious-meals",
    title: "Repas nutritifs avec un petit budget",
    summary: "Les bases bon marché qui portent les protéines et l'énergie.",
    readingMinutes: 5,
    updatedAt: "2026-10-16",
    sections: [
      {
        heading: "Les quatre chevaux bon marché",
        body: [
          "Le lait entier, l'avoine, les œufs et les haricots en conserve portent les protéines et l'énergie à peu de frais, et ils se gardent bien. Les pâtes sèches et le riz remplissent les trous.",
          "Les légumes surgelés sont aussi bons que les frais et ne tournent pas, donc rien se jette quand vous cuisez tard.",
        ],
      },
      {
        heading: "Cuire une fois, manger deux fois",
        body: [
          "Une marmite de ragoût ou un poulet crémeux fait deux dîners. Cuire une fois coûte moins de fuel, moins de temps et moins de déchets que cuire deux fois.",
          "Partager le deuxième dîner dans un bocal pendant que la marmite est chaude, pour qu'il soit prêt quand vous êtes fatigué.",
        ],
      },
      {
        heading: "Les additions discrètes",
        body: [
          "L'huile, le beurre, la crème et le beurre de cacahuète sont les calories les moins chères d'une cuisine. Quinze millilitres d'huile d'olive ajoutent environ 130 kilocalories à un bol.",
          "Les ajouter à la fin, hors du feu, pour que le goût reste clair et que la quantité reste visible.",
        ],
      },
    ],
  },
  {
    slug: "nutritious-smoothies",
    title: "Smoothies nutritifs faits à la maison",
    summary:
      "Comment faire un smoothie qui remplit, pas seulement qui adoucit.",
    readingMinutes: 5,
    updatedAt: "2026-10-21",
    sections: [
      {
        heading: "Trois parties, toujours",
        body: [
          "Un smoothie qui marche a un liquide, un glucide et une protéine. Le lait ou le yaourt pour le liquide, l'avoine ou la banane pour le glucide, le beurre de cacahuète, les noix ou un yaourt riche en protéines pour la protéine.",
          "Le jus de fruit seul est sucre et volume. Il remplit l'estomac avant d'ajouter beaucoup d'énergie.",
        ],
      },
      {
        heading: "Épais bat liquide",
        body: [
          "L'avoine et le yaourt rendent le smoothie épais, ce qui tient la satiété plus longtemps. Un smoothie liquide est facile à boire et facile à oublier.",
          "Mixer court, puis attendre deux minutes. L'avoine gonfle, et le verre paraît plus plein qu'il ne semblait.",
        ],
      },
      {
        heading: "Garder comme collation, pas comme quatrième repas",
        body: [
          "Le smoothie marche mieux à une heure fixe, entre deux repas, pour qu'il ne chasse pas le repas suivant.",
          "S'il remplace un repas, ajouter quelque chose de salé, comme une cuillère de beurre de cacahuète dans un smoothie de yaourt, pour que la protéine soit claire.",
        ],
      },
    ],
  },
];

export const guidesByLocale: Record<Locale, Guide[]> = { en, fr };

/** Same slugs in both languages, so locale switching keeps you on the guide. */
export const guideSlugs: string[] = en.map((guide) => guide.slug);

export function getGuides(locale: Locale): Guide[] {
  return guidesByLocale[locale];
}

export function getGuide(locale: Locale, slug: string): Guide | undefined {
  return guidesByLocale[locale].find((guide) => guide.slug === slug);
}
