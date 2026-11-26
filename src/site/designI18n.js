// Catalog wording in Russian and English: design titles (the sample names,
// transliterated), event types and the catalog's category labels. Armenian
// stays in designCatalog.js itself. Plain data, no imports.

const TITLES = {
  'wd-beige': { ru: 'Микаэл и Татев', en: 'Mikayel & Tatev' },
  'wd-green': { ru: 'Наре и Арам', en: 'Nare & Aram' },
  'wd-garden': { ru: 'Наре и Арам', en: 'Nare & Aram' },
  'wd-velvet': { ru: 'Арман и Лилит', en: 'Arman & Lilit' },
  'wd-line': { ru: 'Эрик и Сона', en: 'Erik & Sona' },
  'wd-calla': { ru: 'Рубен и Элен', en: 'Ruben & Elen' },
  'wd-meadow': { ru: 'Арен и Нане', en: 'Aren & Nane' },
  'wd-mono': { ru: 'Лиана и Айк', en: 'Liana & Hayk' },
  'wd-rouge': { ru: 'Тигран и Ани', en: 'Tigran & Ani' },
  'wd-cherry': { ru: 'Ани и Давид', en: 'Ani & Davit' },
  'wd-portrait': { ru: 'Лилит и Арман', en: 'Lilit & Arman' },
  'wd-chateau': { ru: 'Давид и Мариам', en: 'Davit & Mariam' },
  'wd-noir': { ru: 'Ален и Милена', en: 'Alen & Milena' },
  'wd-noir-lite': { ru: 'Эдгар и Алиса', en: 'Edgar & Alisa' },
  'bd-animals': { ru: 'Наре 1 год', en: 'Nare turns 1' },
  'bd-planet': { ru: 'Арсену 5 лет', en: 'Arsen turns 5' },
  'bd-balloons': { ru: 'Леону 3 года', en: 'Leon turns 3' },
  'bd-stitch': { ru: 'Софи 2 года', en: 'Sofi turns 2' },
  'bd-cars': { ru: 'Марку 4 года', en: 'Mark turns 4' },
  'bd-build': { ru: 'Айку 2 года', en: 'Hayk turns 2' },
  'bd-castle': { ru: 'Элен 4 года', en: 'Elen turns 4' },
  'bd-dots': { ru: 'Соне 6 лет', en: 'Sona’s 6th birthday' },
  'gp-balloons': { ru: 'Мальчик или девочка?', en: 'Boy or girl?' },
  'gp-stork': { ru: 'Мальчик или девочка? · аист', en: 'Boy or girl? · stork' },
  'ce-garland': { ru: 'Рождественский вечер', en: 'Christmas evening' },
  'ce-pine': { ru: 'Новогодняя вечеринка', en: 'Holiday party' },
  'ce-truck': { ru: 'Маленькая новогодняя вечеринка', en: 'Merry little Christmas party' },
  'ce-toast': { ru: 'Тост за Деда Мороза', en: 'A toast to the Claus' },
  'ce-holly': { ru: 'Новогодний вечер компании', en: 'Company Christmas party' },
  'ce-groovy': { ru: 'Дзинь-дзинь и танцы', en: 'Jingle & mingle' },
  'ce-jingle': { ru: 'Звон и веселье', en: 'Jingle & Mingle · watercolour' },
  'ce-sparkle': { ru: 'Вечер бенгальских огней', en: 'An evening of sparklers' },
  'ce-cozy': { ru: 'Зимний праздник', en: 'A winter celebration' },
  'bp-blue': { ru: 'Крещение Самвела', en: 'Samvel’s christening' },
  'card-mouse': { ru: 'Эрику 1 год', en: 'Erik turns 1' },
}

const TYPES = {
  'Հարսանիք': { ru: 'Свадьба', en: 'Wedding' },
  'Ծննդյան տոն': { ru: 'День рождения', en: 'Birthday' },
  'Գենդերի բացահայտում': { ru: 'Гендер-пати', en: 'Gender reveal' },
  'Կորպորատիվ միջոցառում': { ru: 'Корпоратив', en: 'Corporate event' },
  'Մկրտություն': { ru: 'Крещение', en: 'Christening' },
}

export const CATEGORY_LABELS_I18N = {
  hy: { wedding: 'Հարսանեկան', baptism: 'Մկրտության', birthday: 'Ծննդյան', genderReveal: 'Սեռի բացահայտում', corporate: 'Կորպորատիվ' },
  ru: { wedding: 'Свадебные', baptism: 'Крещение', birthday: 'День рождения', genderReveal: 'Гендер-пати', corporate: 'Корпоративные' },
  en: { wedding: 'Wedding', baptism: 'Christening', birthday: 'Birthday', genderReveal: 'Gender reveal', corporate: 'Corporate' },
}

export function designTitle(design, lang) {
  return (lang !== 'hy' && TITLES[design.id]?.[lang]) || design.title
}
export function designType(design, lang) {
  return (lang !== 'hy' && TYPES[design.type]?.[lang]) || design.type
}
