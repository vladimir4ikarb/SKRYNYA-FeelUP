export const PRODUCT_CATEGORIES = [
  "Фольговані кулі",
  "Латексні кулі",
  "Bubbles",
  "Стрічки",
  "Декор / Наповнювачі",
  "Розхідники",
  "Обладнання",
  "Гелій",
  "Інше"
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

// Placeholder for future subcategories
export const SUB_CATEGORIES: Record<ParentCategory, string[]> = {
  "Фольговані кулі": ["Цифри", "Фігури", "Серця/Зірки", "З написами", "Персонажі", "Інші"],
  "Латексні кулі": [...LATEX_TYPES],
  "Bubbles": [],
  "Стрічки": [],
  "Декор / Наповнювачі": ["Конфеті", "Пір'я", "Гірлянди", "Наклейки"],
  "Розхідники": ["Грузики", "Палички", "Пакети", "Клей"],
  "Обладнання": ["Компресори", "Балони", "Редуктори", "Затискачі"],
  "Гелій": ["Балон 40л", "Балон 10л"],
  "Інше": []
};
