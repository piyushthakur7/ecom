import { siteConfig } from './site';

type Photographer = readonly [name: string, href: string];

const by = {
  dollar: ['Dollar Gill', 'https://unsplash.com/@dollargill'],
  ardy: ['Ardy Arjun', 'https://unsplash.com/@ardyastic'],
  ikshana: ['iKshana Productions', 'https://unsplash.com/@ikshanaproductions'],
  bulbul: ['Bulbul Ahmed', 'https://unsplash.com/@bulbul252'],
  naganath: ['Naganath Chiluveru', 'https://unsplash.com/@naganath'],
  jainica: ['Jainica Dhingra', 'https://unsplash.com/@jainica'],
  pranav: ['Pranav Kumar Jain', 'https://unsplash.com/@peejayvisual'],
} satisfies Record<string, Photographer>;

type PhotographerKey = keyof typeof by;

const u = (id: string) => `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;

const credited = <T extends { img: string; ph: PhotographerKey }>(o: T) => ({
  ...o,
  src: u(o.img),
  credit: `Photo by ${by[o.ph][0]} on Unsplash`,
  creditHref: by[o.ph][1],
});

export const hero = {
  src: 'https://images.unsplash.com/photo-1743229995505-d6374996df1c?q=80&w=1400&auto=format&fit=crop',
  alt: 'Model in a festive kurta set',
  credit: 'Photo by Naseebo on Unsplash',
  creditHref: 'https://unsplash.com/@naseebo',
};

export const stats = [
  { value: '₹500–1,500', label: 'Every piece' },
  { value: '160+', label: 'Styles live' },
  { value: '48h', label: 'Dispatch, Amritsar' },
];

export type Product = ReturnType<typeof buildProducts>[number];

function buildProducts() {
  return (
    [
      { name: 'Block-print mul kurti — brick', price: '₹849', was: '₹1,099', off: '20% off', img: 'photo-1571908599407-cdb918ed83bf', ph: 'dollar' },
      { name: 'Chanderi co-ord set — rose', price: '₹1,399', was: '₹1,649', off: '15% off', img: 'photo-1668371679302-a8ec781e876e', ph: 'ardy' },
      { name: 'Cotton salwar suit — ivory', price: '₹1,299', was: null, off: null, img: 'photo-1668371459824-094a960a227d', ph: 'ardy' },
      { name: 'Handloom saree — mustard', price: '₹1,499', was: '₹1,799', off: '15% off', img: 'photo-1569810020669-aa9d38003ea7', ph: 'pranav' },
      { name: 'A-line dress — indigo dabu', price: '₹999', was: '₹1,199', off: '15% off', img: 'photo-1571908599538-7e1e6e92b064', ph: 'dollar' },
      { name: 'Zari-edge dupatta — gold', price: '₹549', was: '₹699', off: '20% off', img: 'photo-1713296008556-29c7fae52234', ph: 'ardy' },
      { name: 'Straight kurti — kashish grey', price: '₹749', was: null, off: null, img: 'photo-1756483509254-3cc48a5a15b2', ph: 'ikshana' },
      { name: 'Sharara co-ord — pistachio', price: '₹1,449', was: '₹1,699', off: '15% off', img: 'photo-1597983073750-16f5ded1321f', ph: 'dollar' },
    ] as const
  ).map((p, i) => ({
    ...credited(p),
    id: `prod-${i + 1}`,
    showOff: Boolean(p.off && siteConfig.showSaleBadges),
  }));
}

export const products = buildProducts();

export type Category = (typeof categories)[number];

export const categories = (
  [
    { name: 'Kurtis', count: '48 styles', img: 'photo-1610048869310-d889ff25c374', ph: 'bulbul' },
    { name: 'Co-ord sets', count: '26 styles', img: 'photo-1571587289339-cb7da03fb5a6', ph: 'dollar' },
    { name: 'Suits & salwar', count: '32 styles', img: 'photo-1503160865267-af4660ce7bf2', ph: 'naganath' },
    { name: 'Sarees', count: '21 styles', img: 'photo-1745482036066-5d215ed6b910', ph: 'ikshana' },
    { name: 'Dresses', count: '18 styles', img: 'photo-1597983073750-16f5ded1321f', ph: 'dollar' },
    { name: 'Dupattas', count: '24 styles', img: 'photo-1717585679395-bbe39b5fb6bc', ph: 'jainica' },
  ] as const
).map((c, i) => ({ ...credited(c), id: `cat-${i + 1}`, alt: `${c.name} — category photo` }));

export const testimonials = [
  { quote: 'The mul kurti is softer than anything I own. Wore it the day it arrived.', name: 'Gurleen K., Amritsar' },
  { quote: 'Ordered a co-ord for a haldi — the fit and colour were exactly as shown.', name: 'Meera S., Delhi' },
  { quote: 'Fast delivery, honest fabric, prices that make sense. My third order already.', name: 'Aditi R., Jaipur' },
];

export const marqueeItems = [
  'Free shipping over ₹999',
  'Festive ’26 collection live',
  '7-day easy returns',
  'Made in Amritsar, India',
];
