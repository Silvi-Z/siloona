import { Suspense, lazy, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Reveal from '../Reveal'
import '../home.css'
import { CARD_DESIGNS, WEB_DESIGNS } from '../designCatalog'
import { designTitle, designType } from '../designI18n'
import { formatAmount, useLang, useText } from '../i18n'
import portraitShot from '../invitations/wd-portrait/assets/catalog-thumb.webp'
import cherryShot from '../invitations/wd-cherry/assets/catalog-thumb.webp'
import planetShot from '../invitations/bd-planet/assets/catalog-thumb.webp'

// The «Անհատական դիզայն» request form, loaded only when opened. It opens
// for the #custom-design link, so any page can link straight to it.
const CustomRequestDialog = lazy(() => import('../custom/CustomRequestDialog'))
export const CUSTOM_HASH = '#custom-design'

// Home page — an editorial spread: asymmetric columns, hairlines instead
// of cards, ivory pages interrupted by burgundy, charcoal and pale-rose
// plates. Everything is scoped under .hm (see ../home.css). Texts are in
// TEXT below, one block per language.

/* ------------------------------------------------------------------
   To fill in (each one is hidden or replaced by a neutral wording
   until it's set):
   ------------------------------------------------------------------ */
// TODO: a screen recording of a real invitation (e.g. '/media/hero.mp4' in
// public/) and its first frame as a poster. Until then the hero shows the
// three phones below.
const HERO_VIDEO = null
const HERO_POSTER = null
// TODO: the lowest price of a custom design, in AMD (e.g. 40000). Until
// then the tier says the price is agreed from the idea.
const CUSTOM_FROM = null
// TODO: how long a custom design takes, per language (e.g. { hy: '5–7 աշխատանքային օր', ru: '5–7 рабочих дней', en: '5–7 working days' }).
const CUSTOM_TIME = null
// TODO: a photo for «Մեր մասին» (e.g. '/media/about.jpg' in public/).
const ABOUT_PHOTO = null
// Real reviews only, never invented: { name, event, text: { hy, ru, en } }.
// The «Կարծիքներ» section appears once there is one.
const REVIEWS = []
// The FAQ answer about invitation languages is true once invitations can be
// ordered in Russian and English (stage 2). Switch on then.
const INVITATION_LANGS_READY = false

// The hero's three phones, each showing one of our real invitations
// (its catalog screenshot) and opening its live preview. Order = paint
// order: back-right, left, front-centre.
const PHONES = [
  { pos: 'back', src: cherryShot, id: 'wd-cherry' },
  { pos: 'left', src: planetShot, id: 'bd-planet' },
  { pos: 'front', src: portraitShot, id: 'wd-portrait' },
]

// «Օրինակներ»: real designs from the catalog, in this order.
const EXAMPLE_IDS = ['wd-rouge', 'wd-mono', 'wd-calla', 'bd-dots', 'gp-balloons', 'bp-blue']

// «Առիթներ»: a catalog category is listed only while at least one design on
// sale belongs to it, so a new category shows up here with its first design.
// Order = the order of t.occasions; 'other' (the whole catalog) stays last.
const LIVE_CATEGORIES = new Set([...WEB_DESIGNS, ...CARD_DESIGNS].filter((d) => d.available !== false).map((d) => d.category))

// Lowest real price of each option across the designs on sale (prices.js).
const onSale = WEB_DESIGNS.filter((d) => d.available !== false)
const lowest = (opt) => {
  const all = onSale.map((d) => d.pricing?.[opt]).filter((v) => v != null)
  return all.length ? Math.min(...all) : null
}
// Prices differ by design: these are the lowest, always shown as «from».
export const DIY_FROM = lowest('diy')
export const ASSISTED_FROM = lowest('assisted')
export const amt = (v) => `${formatAmount(v)} ֏`

// Also read by the prices page (pages/Prices.jsx): tiers, benefits, FAQ.
export const TEXT = {
  hy: {
    eyebrow: 'Թվային հրավիրատոմսերի ատելիե',
    h1: ['Ամեն տոն', 'սկսվում է', 'հրավերից'],
    lede: 'Գեղեցիկ և անհատական թվային հրավիրատոմսեր ձեր կյանքի կարևոր պահերի համար։',
    view: 'Դիտել հրավիրատոմսերը',
    from: (p) => `սկսած ${p}`,
    customLink: 'Ստեղծել անհատական հրավեր',
    stageNote: 'Մեր հրավիրատոմսերից',
    phoneLabel: (t) => `Դիտել «${t}» հրավիրատոմսը`,
    videoLabel: 'Իրական հրավիրատոմսի տեսագրություն',

    occEyebrow: 'Առիթներ',
    occH: 'Յուրաքանչյուր կարևոր պահի համար',
    occasions: { wedding: 'Հարսանիք', birthday: 'Ծննդյան օր', baptism: 'Կնունք', genderReveal: 'Սեռի բացահայտում', corporate: 'Կորպորատիվ միջոցառում', other: 'Այլ միջոցառումներ' },

    exEyebrow: 'Օրինակներ',
    exH: 'Բացեք և տեսեք՝ ինչպես են դրանք աշխատում',
    exP: 'Սրանք մեր իրական հրավիրատոմսերն են՝ այնպիսին, ինչպիսին կտեսնեն ձեր հյուրերը։',
    exOpen: 'Բացել օրինակը',
    exAll: 'Բոլոր հրավիրատոմսերը',

    howEyebrow: 'Ինչպես է աշխատում',
    howH: 'Երեք քայլ մինչև ձեր հրավերը',
    howP: 'Ամեն ինչ անում եք կայքում՝ առանց հատուկ ծրագրերի և դիզայնի հմտությունների։',
    steps: [
      { title: 'Ընտրեք', text: 'Գտեք ձեր միջոցառմանը և ոճին համապատասխան հրավիրատոմսը։' },
      { title: 'Անհատականացրեք', text: 'Ավելացրեք անունները, ամսաթիվը, վայրը և ձեր նախընտրած մանրամասները։' },
      { title: 'Հրավիրեք', text: 'Ստացեք ձեր հրավիրատոմսի հղումը և կիսվեք այն հյուրերի հետ։' },
    ],
    timing: (custom) => (custom
      ? `Պատրաստի ձևանմուշը՝ վճարումից անմիջապես հետո, անհատական դիզայնը՝ ${custom}։`
      : 'Պատրաստի ձևանմուշը՝ վճարումից անմիջապես հետո։ Անհատական դիզայնի ժամկետը համաձայնեցնում ենք պատվերի ժամանակ։'),
    choose: 'Ընտրել հրավիրատոմս',

    prEyebrow: 'Գներ',
    allPrices: 'Բոլոր գները',
    prH: 'Ընտրեք ձեզ հարմար տարբերակը',
    prP: 'Յուրաքանչյուր տարբերակում ստանում եք հրավերի հղումը, որը կարող եք ուղարկել բոլոր հյուրերին։',
    customPrice: 'Գինը՝ ըստ գաղափարի',
    tiers: [
      {
        name: 'Պատրաստի ձևանմուշ',
        items: ['Ընտրում եք դիզայնը հավաքածուից', 'Անունները, ամսաթիվը, վայրը և տեքստը լրացնում եք ինքներդ՝ կայքում', 'Հղումը ստանում եք վճարումից անմիջապես հետո'],
        cta: 'Ընտրել ձևանմուշ',
      },
      {
        name: 'Հարմարեցված դիզայն',
        items: ['Ընտրում եք դիզայնը հավաքածուից', 'Մենք ենք պատրաստում հրավերը ձեր տվյալներով', 'Մանրամասները համաձայնեցնում ենք ձեզ հետ'],
        cta: 'Ընտրել դիզայն',
      },
      {
        name: 'Անհատական դիզայն',
        items: ['Նոր դիզայն՝ ստեղծված հատուկ ձեր միջոցառման համար', 'Կամ ձեր ընտրած դիզայնի փոփոխություն՝ գույներ, կառուցվածք, մանրամասներ', 'Գինն ու ժամկետը համաձայնեցնում ենք հայտից հետո'],
        cta: 'Ներկայացնել հայտ',
      },
    ],

    benEyebrow: 'Առավելություններ',
    benH: 'Ավելին, քան պարզապես հրավիրատոմս',
    leadTitle: 'Անհատականացված դիզայն',
    leadText: 'Ձեր անունները, ձեր խոսքերը և ձեր ոճը՝ մեկ ամբողջական հրավերում։',
    benefits: [
      { title: 'Հարմար խմբագրում', text: 'Տեքստն ու մանրամասները փոխում եք ինքներդ՝ անմիջապես կայքում։' },
      { title: 'Մեկ հղում բոլոր հյուրերին', text: 'Հրավերը հասնում է հյուրերին վայրկյանների ընթացքում՝ առանց տպագրության։' },
      { title: 'Կարևոր մանրամասները մեկ վայրում', text: 'Ամսաթիվը, ժամը և վայրը միշտ հյուրի ձեռքի տակ են։' },
      { title: 'Մասնակցության հաստատում', text: 'Հյուրերը պատասխանում են հենց հրավերից, իսկ դուք տեսնում եք ամբողջ ցուցակը։' },
    ],

    srvEyebrow: 'Ծառայություններ',
    srvH: 'Ձեր պատմությունը՝ յուրահատուկ ձևավորմամբ',
    srvP: 'Ստեղծում ենք հրավիրատոմսեր, որոնք արտահայտում են ձեր միջոցառման տրամադրությունն ու անհատականությունը։',
    services: [
      { mark: 'ա.', title: 'Թվային հրավիրատոմսեր', text: 'Պատրաստի դիզայններ, որոնք անհատականացնում և պատվիրում եք ինքներդ։', link: 'Դիտել հրավիրատոմսերը' },
      { mark: 'բ.', title: 'Անհատական դիզայն', text: 'Հարմարեցնում ենք ձեր ընտրած դիզայնը կամ ստեղծում ենք նորը՝ հատուկ ձեր միջոցառման համար։', link: 'Պատվիրել անհատական դիզայն' },
    ],

    aboutLabel: 'Մեր մասին',
    quote: 'Հրավերը պարզապես միջոցառման մասին տեղեկություն չէ։ Այն ձեր պատմության առաջին էջն է։',
    by: 'Siloona · թվային հրավիրատոմսերի ատելիե',
    personal: 'Siloona-ն իմ ատելիեն է։ Յուրաքանչյուր հրավեր ստեղծում եմ ինքս՝ առաջին էսքիզից մինչև վերջին մանրուքը, և նույն ուշադրությամբ եմ մոտենում թե՛ պատրաստի ձևանմուշին, թե՛ անհատական պատվերին։ Ինձ համար կարևոր է, որ ձեր հյուրերը հրավերը բացելիս զգան ձեր տոնի տրամադրությունը։',
    photoAlt: 'Siloona-ի հիմնադիրը',

    revEyebrow: 'Կարծիքներ',
    revH: 'Ինչ են ասում մեր հաճախորդները',

    faqEyebrow: 'Հարցեր',
    faqH: 'Հաճախակի տրվող հարցեր',
    faq: [
      { q: 'Որքա՞ն արժե հրավիրատոմսը', a: `Պատրաստի ձևանմուշը՝ սկսած ${amt(DIY_FROM)}․ այն լրացնում եք ինքներդ։ Եթե ուզում եք, որ մենք պատրաստենք հրավերը ձեր տվյալներով՝ սկսած ${amt(ASSISTED_FROM)}։ Անհատական դիզայնի գինը կախված է գաղափարից, և այն համաձայնեցնում ենք հայտից հետո։` },
      { q: 'Ինչպե՞ս վճարել', a: 'Վճարումը կատարվում է կայքում՝ բանկային քարտով (ArCa, Visa, Mastercard) կամ Idram-ով։ Անհատական դիզայնի դեպքում վճարման մանրամասները համաձայնեցնում ենք ձեզ հետ։' },
      { q: 'Կարո՞ղ եմ փոփոխել հրավերը ուղարկելուց հետո', a: 'Այո։ Գրեք մեզ, և մենք կթարմացնենք հրավերը։ Հղումը կմնա նույնը, ուստի հյուրերին նորից ուղարկել պետք չէ։' },
      { q: 'Որքա՞ն ժամանակ է հղումն ակտիվ', a: 'Հղումը ժամկետային սահմանափակում չունի․ այն գործում է թե՛ միջոցառումից առաջ, թե՛ դրանից հետո։' },
      { q: 'Կարո՞ղ եմ ավելացնել երաժշտություն, լուսանկարներ, քարտեզ', a: 'Քարտեզի հղումը կա բոլոր հրավերներում՝ հյուրը մեկ սեղմումով բացում է ճանապարհը։ Լուսանկարներ կարելի է ավելացնել այն դիզայններում, որոնք դրանք նախատեսում են։ Որոշ դիզայններ ունեն երաժշտություն, որը հյուրը միացնում է մեկ սեղմումով, իսկ մյուսներում այն կարող ենք քննարկել անհատական դիզայնի դեպքում։' },
      { q: 'Հրավերը կարո՞ղ է լինել անգլերեն կամ ռուսերեն', a: 'Այո։ Հրավերը կարող է լինել հայերեն, ռուսերեն կամ անգլերեն․ լեզուն ընտրում եք պատվերի ժամանակ։', langs: true },
      { q: 'Ինչպե՞ս պատվիրել թվային հրավիրատոմս', a: 'Ընտրեք հրավիրատոմսը հավաքածուից, լրացրեք ձեր միջոցառման տվյալները և ձևակերպեք պատվերը կայքում։' },
      { q: 'Կարո՞ղ եմ անհատականացնել հրավիրատոմսը', a: 'Այո։ Անունները, ամսաթիվը, վայրը և տեքստը փոխում եք ինքներդ։ Եթե ուզում եք ավելին, կարող եք պատվիրել ընտրած դիզայնի հարմարեցում կամ ամբողջովին նոր դիզայն։' },
      // Dashboard not shared yet — the answer's second sentence was:
      // «Բոլոր պատասխանները տեսնում եք ձեր անձնական վահանակում։»
      { q: 'Ինչպե՞ս են հյուրերը հաստատում մասնակցությունը', a: 'Հյուրը բացում է հրավերի հղումը և նշում իր պատասխանը։' },
      { q: 'Կարո՞ղ եմ հրավիրատոմսն ուղարկել WhatsApp-ով, Viber-ով կամ Telegram-ով', a: 'Այո։ Հրավիրատոմսը հղում է, ուստի կարող եք ուղարկել այն ցանկացած հավելվածով կամ հաղորդագրությամբ։' },
    ],

    ctaEyebrow: 'Սկսենք',
    ctaH: 'Ձեր պատմությունը սկսվում է այստեղ',
    ctaP: 'Ստեղծեք հրավիրատոմս, որը կարտահայտի ձեր կարևոր պահի յուրահատուկ տրամադրությունը։',
    ctaCustom: 'Անհատական դիզայն',
  },

  ru: {
    eyebrow: 'Ателье цифровых приглашений',
    h1: ['Каждый праздник', 'начинается', 'с приглашения'],
    lede: 'Красивые и персональные цифровые приглашения для важных моментов вашей жизни.',
    view: 'Смотреть приглашения',
    from: (p) => `от ${p}`,
    customLink: 'Создать индивидуальное приглашение',
    stageNote: 'Из наших приглашений',
    phoneLabel: (t) => `Открыть приглашение «${t}»`,
    videoLabel: 'Запись настоящего приглашения',

    occEyebrow: 'Поводы',
    occH: 'Для каждого важного момента',
    occasions: { wedding: 'Свадьба', birthday: 'День рождения', baptism: 'Крестины', genderReveal: 'Гендер-пати', corporate: 'Корпоратив', other: 'Другие события' },

    exEyebrow: 'Примеры',
    exH: 'Откройте и посмотрите, как они работают',
    exP: 'Это наши настоящие приглашения — такими их увидят ваши гости.',
    exOpen: 'Открыть пример',
    exAll: 'Все приглашения',

    howEyebrow: 'Как это работает',
    howH: 'Три шага до вашего приглашения',
    howP: 'Всё делается на сайте — без специальных программ и навыков дизайна.',
    steps: [
      { title: 'Выберите', text: 'Найдите приглашение, которое подходит вашему событию и стилю.' },
      { title: 'Персонализируйте', text: 'Добавьте имена, дату, место и детали, которые важны для вас.' },
      { title: 'Пригласите', text: 'Получите ссылку на приглашение и отправьте её гостям.' },
    ],
    timing: (custom) => (custom
      ? `Готовый шаблон — сразу после оплаты, индивидуальный дизайн — ${custom}.`
      : 'Готовый шаблон — сразу после оплаты. Срок индивидуального дизайна согласуем при заказе.'),
    choose: 'Выбрать приглашение',

    prEyebrow: 'Цены',
    allPrices: 'Все цены',
    prH: 'Выберите подходящий вариант',
    prP: 'В любом варианте вы получаете ссылку на приглашение, которую можно отправить всем гостям.',
    customPrice: 'Цена — по вашей идее',
    tiers: [
      {
        name: 'Готовый шаблон',
        items: ['Выбираете дизайн из коллекции', 'Имена, дату, место и текст заполняете сами — прямо на сайте', 'Ссылку получаете сразу после оплаты'],
        cta: 'Выбрать шаблон',
      },
      {
        name: 'Адаптированный дизайн',
        items: ['Выбираете дизайн из коллекции', 'Мы готовим приглашение по вашим данным', 'Детали согласуем с вами'],
        cta: 'Выбрать дизайн',
      },
      {
        name: 'Индивидуальный дизайн',
        items: ['Новый дизайн, созданный специально для вашего события', 'Или изменение выбранного дизайна — цвета, структура, детали', 'Цену и срок согласуем после заявки'],
        cta: 'Оставить заявку',
      },
    ],

    benEyebrow: 'Преимущества',
    benH: 'Больше, чем просто приглашение',
    leadTitle: 'Персональный дизайн',
    leadText: 'Ваши имена, ваши слова и ваш стиль — в одном цельном приглашении.',
    benefits: [
      { title: 'Удобное редактирование', text: 'Текст и детали вы меняете сами — прямо на сайте.' },
      { title: 'Одна ссылка для всех гостей', text: 'Приглашение доходит до гостей за секунды — без печати.' },
      { title: 'Все важные детали в одном месте', text: 'Дата, время и место всегда под рукой у гостя.' },
      { title: 'Подтверждение участия', text: 'Гости отвечают прямо в приглашении, а вы видите весь список.' },
    ],

    srvEyebrow: 'Услуги',
    srvH: 'Ваша история в особом оформлении',
    srvP: 'Мы создаём приглашения, которые передают настроение и характер вашего события.',
    services: [
      { mark: 'а.', title: 'Цифровые приглашения', text: 'Готовые дизайны, которые вы сами персонализируете и заказываете.', link: 'Смотреть приглашения' },
      { mark: 'б.', title: 'Индивидуальный дизайн', text: 'Адаптируем выбранный вами дизайн или создаём новый — специально для вашего события.', link: 'Заказать индивидуальный дизайн' },
    ],

    aboutLabel: 'О нас',
    quote: 'Приглашение — это не просто информация о событии. Это первая страница вашей истории.',
    by: 'Siloona · ателье цифровых приглашений',
    personal: 'Siloona — моё ателье. Каждое приглашение я создаю сама — от первого эскиза до последней детали — и с одинаковым вниманием отношусь и к готовому шаблону, и к индивидуальному заказу. Мне важно, чтобы ваши гости, открыв приглашение, почувствовали настроение вашего праздника.',
    photoAlt: 'Основательница Siloona',

    revEyebrow: 'Отзывы',
    revH: 'Что говорят наши клиенты',

    faqEyebrow: 'Вопросы',
    faqH: 'Частые вопросы',
    faq: [
      { q: 'Сколько стоит приглашение?', a: `Готовый шаблон — от ${amt(DIY_FROM)}, его вы заполняете сами. Если хотите, чтобы мы подготовили приглашение по вашим данным, — от ${amt(ASSISTED_FROM)}. Цена индивидуального дизайна зависит от идеи, её мы согласуем после заявки.` },
      { q: 'Как оплатить?', a: 'Оплата проходит на сайте — банковской картой (ArCa, Visa, Mastercard) или через Idram. Для индивидуального дизайна детали оплаты согласуем с вами.' },
      { q: 'Можно ли изменить приглашение после отправки?', a: 'Да. Напишите нам, и мы обновим приглашение. Ссылка останется прежней, поэтому отправлять её гостям заново не нужно.' },
      { q: 'Как долго действует ссылка?', a: 'У ссылки нет ограничения по сроку: она работает и до события, и после него.' },
      { q: 'Можно ли добавить музыку, фотографии, карту?', a: 'Ссылка на карту есть во всех приглашениях — гость открывает маршрут одним нажатием. Фотографии можно добавить в дизайнах, где они предусмотрены. В некоторых дизайнах есть музыка, которую гость включает одним нажатием, а для остальных её можно обсудить в индивидуальном дизайне.' },
      { q: 'Может ли приглашение быть на английском или русском?', a: 'Да. Приглашение может быть на армянском, русском или английском — язык вы выбираете при заказе.', langs: true },
      { q: 'Как заказать цифровое приглашение?', a: 'Выберите приглашение в коллекции, заполните данные вашего события и оформите заказ на сайте.' },
      { q: 'Можно ли персонализировать приглашение?', a: 'Да. Имена, дату, место и текст вы меняете сами. Если хочется большего, можно заказать адаптацию выбранного дизайна или полностью новый дизайн.' },
      { q: 'Как гости подтверждают участие?', a: 'Гость открывает ссылку на приглашение и отмечает свой ответ.' },
      { q: 'Можно ли отправить приглашение через WhatsApp, Viber или Telegram?', a: 'Да. Приглашение — это ссылка, поэтому её можно отправить в любом мессенджере или сообщении.' },
    ],

    ctaEyebrow: 'Начнём',
    ctaH: 'Ваша история начинается здесь',
    ctaP: 'Создайте приглашение, которое передаст особое настроение вашего важного момента.',
    ctaCustom: 'Индивидуальный дизайн',
  },

  en: {
    eyebrow: 'A digital invitation atelier',
    h1: ['Every celebration', 'begins', 'with an invitation'],
    lede: 'Beautiful, personal digital invitations for the important moments of your life.',
    view: 'View invitations',
    from: (p) => `from ${p}`,
    customLink: 'Create a custom invitation',
    stageNote: 'From our invitations',
    phoneLabel: (t) => `Open the “${t}” invitation`,
    videoLabel: 'A recording of a real invitation',

    occEyebrow: 'Occasions',
    occH: 'For every meaningful moment',
    occasions: { wedding: 'Wedding', birthday: 'Birthday', baptism: 'Christening', genderReveal: 'Gender reveal', corporate: 'Corporate event', other: 'Other events' },

    exEyebrow: 'Examples',
    exH: 'Open one and see how it works',
    exP: 'These are our real invitations — exactly as your guests will see them.',
    exOpen: 'Open the example',
    exAll: 'All invitations',

    howEyebrow: 'How it works',
    howH: 'Three steps to your invitation',
    howP: 'Everything happens on the site — no special software or design skills needed.',
    steps: [
      { title: 'Choose', text: 'Find the invitation that suits your event and your style.' },
      { title: 'Personalize', text: 'Add the names, date, venue and the details you want.' },
      { title: 'Invite', text: 'Get your invitation link and share it with your guests.' },
    ],
    timing: (custom) => (custom
      ? `A ready-made template is yours right after payment; a custom design takes ${custom}.`
      : 'A ready-made template is yours right after payment. For a custom design, we agree the timing when you order.'),
    choose: 'Choose an invitation',

    prEyebrow: 'Prices',
    allPrices: 'All prices',
    prH: 'Choose what suits you',
    prP: 'Every option includes the invitation link you can send to all your guests.',
    customPrice: 'Priced to your idea',
    tiers: [
      {
        name: 'Ready-made template',
        items: ['Pick a design from the collection', 'Fill in the names, date, venue and text yourself, right on the site', 'Get your link right after payment'],
        cta: 'Choose a template',
      },
      {
        name: 'Tailored design',
        items: ['Pick a design from the collection', 'We prepare the invitation with your details', 'We agree the details with you'],
        cta: 'Choose a design',
      },
      {
        name: 'Custom design',
        items: ['A new design created just for your event', 'Or changes to a design you choose — colours, layout, details', 'We agree the price and timing after your request'],
        cta: 'Send a request',
      },
    ],

    benEyebrow: 'Why Siloona',
    benH: 'More than just an invitation',
    leadTitle: 'A personal design',
    leadText: 'Your names, your words and your style, in one complete invitation.',
    benefits: [
      { title: 'Easy editing', text: 'You change the text and details yourself, right on the site.' },
      { title: 'One link for every guest', text: 'Your invitation reaches guests in seconds, with no printing.' },
      { title: 'Key details in one place', text: 'The date, time and venue are always at your guests’ fingertips.' },
      { title: 'Attendance confirmation', text: 'Guests reply right from the invitation, and you see the whole list.' },
    ],

    srvEyebrow: 'Services',
    srvH: 'Your story, uniquely designed',
    srvP: 'We create invitations that capture the mood and character of your event.',
    services: [
      { mark: 'a.', title: 'Digital invitations', text: 'Ready-made designs you personalize and order yourself.', link: 'View invitations' },
      { mark: 'b.', title: 'Custom design', text: 'We adapt the design you choose or create a new one just for your event.', link: 'Order a custom design' },
    ],

    aboutLabel: 'About',
    quote: 'An invitation is more than event details. It is the first page of your story.',
    by: 'Siloona · a digital invitation atelier',
    personal: 'Siloona is my atelier. I create every invitation myself, from the first sketch to the last detail, and give a ready-made template the same care as a custom order. What matters to me is that your guests feel the mood of your celebration the moment they open the invitation.',
    photoAlt: 'The founder of Siloona',

    revEyebrow: 'Reviews',
    revH: 'What our clients say',

    faqEyebrow: 'Questions',
    faqH: 'Frequently asked questions',
    faq: [
      { q: 'How much does an invitation cost?', a: `A ready-made template starts at ${amt(DIY_FROM)}, and you fill it in yourself. If you’d like us to prepare the invitation with your details, it starts at ${amt(ASSISTED_FROM)}. The price of a custom design depends on the idea; we agree it after your request.` },
      { q: 'How do I pay?', a: 'You pay on the site, by bank card (ArCa, Visa, Mastercard) or with Idram. For a custom design, we agree the payment details with you.' },
      { q: 'Can I change the invitation after sending it?', a: 'Yes. Write to us and we’ll update the invitation. The link stays the same, so there’s no need to send it to your guests again.' },
      { q: 'How long does the link stay active?', a: 'The link has no time limit: it works before the event and after it.' },
      { q: 'Can I add music, photos or a map?', a: 'Every invitation has a map link, so guests open directions with one tap. Photos can be added in the designs made for them. Some designs have music guests turn on with one tap; for the others, we can discuss it as a custom design.' },
      { q: 'Can the invitation be in English or Russian?', a: 'Yes. The invitation can be in Armenian, Russian or English — you choose the language when you order.', langs: true },
      { q: 'How do I order a digital invitation?', a: 'Choose an invitation from the collection, fill in your event details and place the order on the site.' },
      { q: 'Can I personalize the invitation?', a: 'Yes. You change the names, date, venue and text yourself. If you want more, you can order an adaptation of the chosen design or an entirely new design.' },
      { q: 'How do guests RSVP?', a: 'The guest opens the invitation link and marks their answer.' },
      { q: 'Can I send the invitation via WhatsApp, Viber or Telegram?', a: 'Yes. The invitation is a link, so you can send it through any app or message.' },
    ],

    ctaEyebrow: 'Let’s begin',
    ctaH: 'Your story starts here',
    ctaP: 'Create an invitation that captures the unique mood of your special moment.',
    ctaCustom: 'Custom design',
  },
}

/* Dashboard section — hidden: customers can't see their guests' answers
   yet (features.js CUSTOMER_DASHBOARD). Shortened to the one benefit it
   gives the invitation; to show it, add hy/ru/en texts to TEXT and put it
   back after «Առավելություններ».
const SAMPLE_GUESTS = [
  { name: 'Մարիամ Հակոբյան', n: '2 հոգի', st: 'yes', label: 'Կգա' },
  { name: 'Տիգրան Սարգսյան', n: '4 հոգի', st: 'yes', label: 'Կգա' },
  { name: 'Լիլիթ Պետրոսյան', n: '1 հոգի', st: 'wait', label: 'Սպասվում է' },
  { name: 'Արամ Գրիգորյան', n: '2 հոգի', st: 'no', label: 'Չի գա' },
  { name: 'Նարե Ավետիսյան', n: '3 հոգի', st: 'yes', label: 'Կգա' },
]

<section className="hm-section hm-dash hm-dark" id="rsvp" aria-labelledby="hm-dash-h">
  <div className="hm-wrap">
    <Reveal>
      <p className="hm-eyebrow">Մասնակցության հաստատում</p>
      <h2 className="hm-h2" id="hm-dash-h">Հյուրերի պատասխանները՝ մեկ էջում</h2>
      <p className="hm-dash-lede">Հյուրերը պատասխանում են հենց հրավերից, իսկ դուք մեկ էջում տեսնում եք, թե ով կգա, քանի հոգով, և ումից եք դեռ սպասում պատասխանի։</p>
      <ul className="hm-feat">
        <li>Հյուրերի ցուցակ</li>
        <li>Մասնակցության պատասխաններ</li>
      </ul>
    </Reveal>

    <Reveal className="hm-guest-sheet" role="img" aria-label="Օրինակ. 120 հյուրից 86-ը հաստատել է մասնակցությունը">
      <div className="hm-gs-top">
        <div>
          <p className="hm-serif">Անի և Դավիթ</p>
          <small>12 հունիսի 2027 · Երևան</small>
        </div>
        <span className="hm-sample">Օրինակ</span>
      </div>
      <div className="hm-gs-stats">
        <div><b>86</b><span>Կգա</span></div>
        <div><b>9</b><span>Չի գա</span></div>
        <div><b>25</b><span>Սպասվում է</span></div>
      </div>
      <div className="hm-gs-bar">
        <i style={{ width: '71.7%', background: 'var(--sage)' }} />
        <i style={{ width: '7.5%', background: 'var(--burgundy)' }} />
      </div>
      <ul className="hm-gs-list">
        {SAMPLE_GUESTS.map((g) => (
          <li key={g.name}><span>{g.name}</span><span className="n">{g.n}</span><span className={`hm-st ${g.st}`}>{g.label}</span></li>
        ))}
      </ul>
    </Reveal>
  </div>
</section>
*/

const byId = (id) => WEB_DESIGNS.find((d) => d.id === id && d.available !== false)

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  )
}

function Pomegranate(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M24 13c-8.5 0-14 6-14 14.5S16 42 24 42s14-6 14-14.5S32.5 13 24 13Z" />
      <path d="M20 13l-2-6 3.5 2.5L24 5l2.5 4.5L30 7l-2 6" />
      <path d="M24 20c-3.5 2-5 5-5 8.5M24 20c3.5 2 5 5 5 8.5" opacity=".6" />
    </svg>
  )
}

function Phone({ pos, src, id, t, lang, to }) {
  const d = byId(id)
  if (!d) return null
  return (
    <Link className={`hm-phone hm-phone--${pos}`} to={to(d.previewRoute)} aria-label={t.phoneLabel(designTitle(d, lang))}>
      <span className="hm-bezel">
        <span className="hm-screen">
          <img src={src} alt="" loading="eager" decoding="async" />
          <i className="hm-island" />
          <i className="hm-glare" />
        </span>
      </span>
    </Link>
  )
}

// One phone playing a recording of a real invitation (HERO_VIDEO). With
// reduced motion it holds still on the poster and offers controls.
function VideoPhone({ t }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <span className="hm-phone hm-phone--solo">
      <span className="hm-bezel">
        <span className="hm-screen">
          <video
            src={HERO_VIDEO}
            poster={HERO_POSTER || undefined}
            autoPlay={!reduce}
            controls={reduce}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={t.videoLabel}
          />
          <i className="hm-island" />
        </span>
      </span>
    </span>
  )
}

function HeroStage({ t, lang, to }) {
  return (
    <div className="hm-stage">
      <i className="hm-floor" aria-hidden="true" />
      <i className="hm-arch" aria-hidden="true" />
      <i className="hm-arch-line" aria-hidden="true" />
      <i className="hm-shadow" aria-hidden="true" />
      {HERO_VIDEO
        ? <VideoPhone t={t} />
        : PHONES.map((p) => <Phone key={p.pos} {...p} t={t} lang={lang} to={to} />)}
      <span className="hm-stage-note" aria-hidden="true">{t.stageNote}</span>
    </div>
  )
}

function Faq({ items }) {
  const listRef = useRef(null)
  // One answer open at a time.
  function onToggle(e) {
    if (!e.currentTarget.open) return
    listRef.current?.querySelectorAll('details').forEach((d) => { if (d !== e.currentTarget) d.open = false })
  }
  return (
    <div className="hm-faq-list" ref={listRef}>
      {items.map((f, i) => (
        <details key={f.q} open={i === 0} onToggle={onToggle}>
          <summary>{f.q} <i aria-hidden="true" /></summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, to } = useLang()
  const t = useText(TEXT)
  const customOpen = location.hash === CUSTOM_HASH
  const closeCustom = () => navigate({ pathname: location.pathname, search: location.search }, { replace: true })

  // /#prices, /#faq… (from the menu, also from other pages): go to that part.
  // Arriving from another page, the home page opens right there — a smooth
  // scroll from the top would first show the hero, as if the link had just
  // gone to the home page. Already on the home page, it scrolls smoothly.
  const arrived = useRef(false)
  useEffect(() => {
    const first = !arrived.current
    arrived.current = true
    const id = location.hash.slice(1)
    if (!id || location.hash === CUSTOM_HASH) return
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => el.scrollIntoView({ behavior: first || reduce ? 'auto' : 'smooth', block: 'start' }))
  }, [location.hash, location.key])

  const examples = EXAMPLE_IDS.map(byId).filter(Boolean)
  const tierPrices = [
    DIY_FROM != null ? t.from(amt(DIY_FROM)) : null,
    ASSISTED_FROM != null ? t.from(amt(ASSISTED_FROM)) : null,
    CUSTOM_FROM != null ? t.from(amt(CUSTOM_FROM)) : t.customPrice,
  ]
  const tierLinks = [to('/invitations'), to('/invitations'), CUSTOM_HASH]
  const faq = t.faq.filter((f) => !f.langs || INVITATION_LANGS_READY)
  const customTime = CUSTOM_TIME?.[lang] || null

  return (
    <main className="hm">
      {/* Hero */}
      <section className="hm-hero">
        <div className="hm-wrap">
          <div className="hm-hero-text">
            <p className="hm-eyebrow">{t.eyebrow}</p>
            <h1>{t.h1[0]} <span className="hm-nw">{t.h1[1]}</span> <em>{t.h1[2]}</em></h1>
            <div className="hm-lede">
              <p>{t.lede}</p>
            </div>
            <div className="hm-actions">
              <span className="hm-main-cta">
                <Link className="hm-btn hm-btn-solid" to={to('/invitations')}>{t.view} <Arrow /></Link>
                {DIY_FROM != null && <span className="hm-from">{t.from(amt(DIY_FROM))}</span>}
              </span>
              <a className="hm-link" href={CUSTOM_HASH}>{t.customLink}</a>
            </div>
          </div>
          <HeroStage t={t} lang={lang} to={to} />
        </div>
      </section>

      {/* Occasions */}
      <section className="hm-occasions" aria-labelledby="hm-occ-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">{t.occEyebrow}</p>
            <h2 id="hm-occ-h">{t.occH}</h2>
          </Reveal>
          <Reveal as="ul" className="hm-occ-list">
            {Object.entries(t.occasions).filter(([cat]) => cat === 'other' || LIVE_CATEGORIES.has(cat)).map(([cat, label]) => (
              <li key={cat}>
                <Link to={to(cat === 'other' ? '/invitations' : `/invitations?category=${cat}`)}>{label} <Arrow /></Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Examples — real designs from the catalog */}
      {examples.length > 0 && (
        <section className="hm-section hm-examples" id="examples" aria-labelledby="hm-ex-h">
          <div className="hm-wrap">
            <Reveal className="hm-sec-head">
              <div>
                <p className="hm-eyebrow">{t.exEyebrow}</p>
                <h2 className="hm-h2" id="hm-ex-h">{t.exH}</h2>
              </div>
              <p>{t.exP}</p>
            </Reveal>
            <Reveal as="ul" className="hm-ex-list">
              {examples.map((d) => {
                const title = designTitle(d, lang)
                return (
                  <li key={d.id}>
                    <Link className="hm-ex-shot" to={to(d.previewRoute)} tabIndex={-1} aria-hidden="true">
                      <img src={d.image} alt="" loading="lazy" decoding="async" />
                    </Link>
                    <p className="hm-ex-type">{designType(d, lang)}</p>
                    <h3>{title}</h3>
                    {d.pricing?.diy != null && <p className="hm-ex-price">{t.from(amt(d.pricing.diy))}</p>}
                    <Link className="hm-link" to={to(d.previewRoute)} aria-label={`${t.exOpen}: ${title}`}>{t.exOpen} <Arrow /></Link>
                  </li>
                )
              })}
            </Reveal>
            <p className="hm-steps-foot"><Link className="hm-link" to={to('/invitations')}>{t.exAll} <Arrow /></Link></p>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="hm-section hm-how" id="how" aria-labelledby="hm-how-h">
        <div className="hm-wrap">
          <Reveal className="hm-sec-head">
            <div>
              <p className="hm-eyebrow">{t.howEyebrow}</p>
              <h2 className="hm-h2" id="hm-how-h">{t.howH}</h2>
            </div>
            <p>{t.howP}</p>
          </Reveal>
          <Reveal as="ol" className="hm-steps">
            {t.steps.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </Reveal>
          <p className="hm-timing">{t.timing(customTime)}</p>
          <p className="hm-steps-foot"><Link className="hm-link" to={to('/invitations')}>{t.choose} <Arrow /></Link></p>
        </div>
      </section>

      {/* Prices */}
      <section className="hm-section hm-prices" id="prices" aria-labelledby="hm-pr-h">
        <div className="hm-wrap">
          <Reveal className="hm-sec-head">
            <div>
              <p className="hm-eyebrow">{t.prEyebrow}</p>
              <h2 className="hm-h2" id="hm-pr-h">{t.prH}</h2>
            </div>
            <p>{t.prP}</p>
          </Reveal>
          <Reveal as="ul" className="hm-tiers">
            {t.tiers.map((tier, i) => (
              <li key={tier.name}>
                <h3>{tier.name}</h3>
                {tierPrices[i] && <p className={`hm-tier-price${i === 2 && CUSTOM_FROM == null ? ' soft' : ''}`}>{tierPrices[i]}</p>}
                <ul>{tier.items.map((x) => <li key={x}>{x}</li>)}</ul>
                {tierLinks[i].startsWith('#')
                  ? <a className="hm-link" href={tierLinks[i]}>{tier.cta} <Arrow /></a>
                  : <Link className="hm-link" to={tierLinks[i]}>{tier.cta} <Arrow /></Link>}
              </li>
            ))}
          </Reveal>
          <p className="hm-prices-all"><Link className="hm-link" to={to('/prices')}>{t.allPrices} <Arrow /></Link></p>
        </div>
      </section>

      {/* Benefits */}
      <section className="hm-section hm-benefits" aria-labelledby="hm-ben-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">{t.benEyebrow}</p>
            <h2 className="hm-h2" id="hm-ben-h">{t.benH}</h2>
            <div className="hm-lead-benefit">
              <h3>{t.leadTitle}</h3>
              <p>{t.leadText}</p>
            </div>
          </Reveal>
          <Reveal as="ul" className="hm-benefit-grid">
            {t.benefits.map((b) => (
              <li key={b.title}><h3>{b.title}</h3><p>{b.text}</p></li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="hm-section" id="services" aria-labelledby="hm-srv-h">
        <div className="hm-wrap">
          <Reveal className="hm-atelier-head">
            <p className="hm-eyebrow">{t.srvEyebrow}</p>
            <h2 className="hm-h2" id="hm-srv-h">{t.srvH}</h2>
            <p>{t.srvP}</p>
          </Reveal>
          <Reveal className="hm-services">
            {t.services.map((s, i) => (
              <article className="hm-service" key={s.title}>
                <span className="hm-mark" aria-hidden="true">{s.mark}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {i === 0
                  ? <Link className="hm-link" to={to('/invitations')}>{s.link} <Arrow /></Link>
                  : <a className="hm-link" href={CUSTOM_HASH}>{s.link} <Arrow /></a>}
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Philosophy + a word from the founder */}
      <section className="hm-credo" id="about" aria-label={t.aboutLabel}>
        <div className="hm-wrap">
          <Pomegranate />
          <Reveal>
            <blockquote>{t.quote}</blockquote>
            <p className="hm-by">{t.by}</p>
          </Reveal>
          <Reveal className="hm-personal">
            {ABOUT_PHOTO && <img src={ABOUT_PHOTO} alt={t.photoAlt} loading="lazy" decoding="async" />}
            <p>{t.personal}</p>
          </Reveal>
        </div>
      </section>

      {/* Reviews — only real ones (REVIEWS); hidden while there are none */}
      {REVIEWS.length > 0 && (
        <section className="hm-section hm-reviews" id="reviews" aria-labelledby="hm-rev-h">
          <div className="hm-wrap">
            <Reveal>
              <p className="hm-eyebrow">{t.revEyebrow}</p>
              <h2 className="hm-h2" id="hm-rev-h">{t.revH}</h2>
            </Reveal>
            <Reveal as="ul" className="hm-rev-list">
              {REVIEWS.map((r) => (
                <li key={r.name}>
                  <blockquote>{r.text[lang] || r.text.hy}</blockquote>
                  <p className="hm-by">{r.name}{r.event ? ` · ${r.event}` : ''}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="hm-section hm-faq" id="faq" aria-labelledby="hm-faq-h">
        <div className="hm-wrap">
          <div>
            <p className="hm-eyebrow">{t.faqEyebrow}</p>
            <h2 className="hm-h2" id="hm-faq-h">{t.faqH}</h2>
          </div>
          <Faq key={lang} items={faq} />
        </div>
      </section>

      {/* Closing */}
      <section className="hm-section hm-closing hm-dark" aria-labelledby="hm-cta-h">
        <div className="hm-wrap">
          <div>
            <p className="hm-eyebrow">{t.ctaEyebrow}</p>
            <h2 id="hm-cta-h">{t.ctaH}</h2>
          </div>
          <div>
            <p>{t.ctaP}</p>
            <div className="hm-actions">
              <Link className="hm-btn hm-btn-solid" to={to('/invitations')}>{t.view} <Arrow /></Link>
              <a className="hm-btn hm-btn-line" href={CUSTOM_HASH}>{t.ctaCustom}</a>
            </div>
          </div>
        </div>
      </section>
      {customOpen && (
        <Suspense fallback={null}>
          <CustomRequestDialog onClose={closeCustom} />
        </Suspense>
      )}
    </main>
  )
}
