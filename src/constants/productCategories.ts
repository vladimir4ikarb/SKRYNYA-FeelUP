export const PRODUCT_CATEGORIES = [
  "Фольговані кулі",
  "Латексні кулі",
  "Bubbles",
  "Стрічки",
  "Декор / Наповнювачі",
  "Розхідники",
  "Обладнання",
  "Гелій"
] as const;

export type ParentCategory = typeof PRODUCT_CATEGORIES[number];

export const FOIL_TYPES = [
  "Цифра",
  "Фігура",
  "Персонаж",
  "Напис",
  "3D / Обʼємна"
] as const;

export type FoilType = typeof FOIL_TYPES[number];
 
export const LATEX_TYPES = [
  "Круглі без малюнка",
  "З малюнком",
  "Серце",
  "ШДМ / Моделювання",
  "Лінколун",
  "Інше"
] as const;
 
export type LatexType = typeof LATEX_TYPES[number];
 
export const LATEX_SERIES = [
  "Пастель",
  "Металік",
  "Хром",
  "Кристал",
  "Макарон",
  "Неон",
  "Перламутр",
  "Рефлекс",
  "Інше"
] as const;
 
export type LatexSeries = typeof LATEX_SERIES[number];

export const FOIL_SHAPES = [
  "Серце",
  "Зірка",
  "Коло",
  "Квадрат",
  "Ромб",
  "Інше"
] as const;

export const INITIAL_PRODUCERS = [
  "Grabo",
  "Flexmetal",
  "Anagram",
  "Qualatex",
  "Kaleidoscope",
  "Gemar",
  "Belbal",
  "Sempertex",
  "Decoral",
  "Kalisan",
  "Китай",
  "Інше"
];

export const RIBBON_TYPES = [
  "Атласна",
  "Поліпропіленова",
  "Органза"
] as const;

export type RibbonType = typeof RIBBON_TYPES[number];

export const RIBBON_SERIES = [
  "Звичайна",
  "Металік",
  "Пастель"
] as const;

export const HELIUM_TYPES = [
  "10 л",
  "20 л",
  "40 л",
  "50 л",
  "Інше"
] as const;

export type HeliumType = typeof HELIUM_TYPES[number];

// Placeholder for future subcategories
export const SUB_CATEGORIES: Record<ParentCategory, string[]> = {
  "Фольговані кулі": ["Цифри", "Фігури", "Серця/Зірки", "З написами", "Персонажі", "Інші"],
  "Латексні кулі": [...LATEX_TYPES],
  "Bubbles": [],
  "Стрічки": [...RIBBON_TYPES],
  "Декор / Наповнювачі": ["Конфеті", "Пірʼя", "Пінопластові кульки", "Інше"],
  "Розхідники": [],
  "Обладнання": [],
  "Гелій": [...HELIUM_TYPES]
};
