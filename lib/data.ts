import { siteConfig } from './site';

type Photographer = readonly [name: string, href: string];

const by = {
  dollar:   ['Dollar Gill',          'https://unsplash.com/@dollargill']        as Photographer,
  ardy:     ['Ardy Arjun',           'https://unsplash.com/@ardyastic']          as Photographer,
  ikshana:  ['iKshana Productions',  'https://unsplash.com/@ikshanaproductions'] as Photographer,
  bulbul:   ['Bulbul Ahmed',         'https://unsplash.com/@bulbul252']          as Photographer,
  naganath: ['Naganath Chiluveru',   'https://unsplash.com/@naganath']           as Photographer,
  jainica:  ['Jainica Dhingra',      'https://unsplash.com/@jainica']            as Photographer,
  pranav:   ['Pranav Kumar Jain',    'https://unsplash.com/@peejayvisual']       as Photographer,
};

const u = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;

// ─── Hero ──────────────────────────────────────────────────────────────────
export const hero = {
  src: 'https://images.unsplash.com/photo-1743229995505-d6374996df1c?q=80&w=1400&auto=format&fit=crop',
  alt: 'Model in a festive kurta set',
  credit: 'Photo by Naseebo on Unsplash',
  creditHref: 'https://unsplash.com/@naseebo',
};

// ─── Stats ─────────────────────────────────────────────────────────────────
export const stats = [
  // { value: '₹500–1,500', label: 'Every piece' },
  { value: '160+',        label: 'Styles live' },
  { value: '48h',         label: 'Dispatch, Amritsar' },
];

// ─── Categories (7 required) ───────────────────────────────────────────────
export type Category = (typeof categories)[number];

export const categories = [
  {
    id: 'cat-1',
    name: 'Kurti',
    slug: 'kurti',
    count: '48 styles',
    src: u('photo-1610048869310-d889ff25c374'),
    alt: 'Kurti — category photo',
    credit: `Photo by ${by.bulbul[0]} on Unsplash`,
  },
  {
    id: 'cat-2',
    name: 'Tops',
    slug: 'tops',
    count: '22 styles',
    src: u('photo-1571908599407-cdb918ed83bf'),
    alt: 'Tops — category photo',
    credit: `Photo by ${by.dollar[0]} on Unsplash`,
  },
  {
    id: 'cat-3',
    name: 'Suits',
    slug: 'suits',
    count: '32 styles',
    src: u('photo-1503160865267-af4660ce7bf2'),
    alt: 'Suits — category photo',
    credit: `Photo by ${by.naganath[0]} on Unsplash`,
  },
  {
    id: 'cat-4',
    name: 'Unstitched Suits',
    slug: 'unstitched-suits',
    count: '19 styles',
    src: u('photo-1668371679302-a8ec781e876e'),
    alt: 'Unstitched Suits — category photo',
    credit: `Photo by ${by.ardy[0]} on Unsplash`,
  },
  {
    id: 'cat-5',
    name: 'Anarkali',
    slug: 'anarkali',
    count: '27 styles',
    src: u('photo-1745482036066-5d215ed6b910'),
    alt: 'Anarkali — category photo',
    credit: `Photo by ${by.ikshana[0]} on Unsplash`,
  },
  {
    id: 'cat-6',
    name: 'Dresses',
    slug: 'dresses',
    count: '18 styles',
    src: u('photo-1597983073750-16f5ded1321f'),
    alt: 'Dresses — category photo',
    credit: `Photo by ${by.dollar[0]} on Unsplash`,
  },
  {
    id: 'cat-7',
    name: 'Plazzo',
    slug: 'plazzo',
    count: '14 styles',
    src: u('photo-1717585679395-bbe39b5fb6bc'),
    alt: 'Plazzo — category photo',
    credit: `Photo by ${by.jainica[0]} on Unsplash`,
  },
] as const;

// ─── Products ──────────────────────────────────────────────────────────────
export type Product = (typeof products)[number];

export const products = [
  {
    id: 'prod-1',
    name: 'Block-print Mul Kurti — Brick',
    price: '₹849',
    was: '₹1,099',
    off: '20% off',
    showOff: siteConfig.showSaleBadges,
    category: 'kurti',
    rating: 4.7,
    reviewCount: 312,
    badge: 'Highly Purchased' as const,
    src: u('photo-1571908599407-cdb918ed83bf'),
    images: [
      u('photo-1571908599407-cdb918ed83bf'),
      u('photo-1610048869310-d889ff25c374'),
      u('photo-1756483509254-3cc48a5a15b2'),
      u('photo-1571908599538-7e1e6e92b064'),
    ],
    credit: `Photo by ${by.dollar[0]} on Unsplash`,
    description:
      'Hand block-printed on soft mul cotton. Slightly oversized silhouette with side slits — pairs equally well with leggings or sharara. Machine washable.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-2',
    name: 'Chanderi Co-ord Set — Rose',
    price: '₹1,399',
    was: '₹1,649',
    off: '15% off',
    showOff: siteConfig.showSaleBadges,
    category: 'suits',
    rating: 4.5,
    reviewCount: 187,
    badge: 'Trending' as const,
    src: u('photo-1668371679302-a8ec781e876e'),
    images: [
      u('photo-1668371679302-a8ec781e876e'),
      u('photo-1668371459824-094a960a227d'),
      u('photo-1597983073750-16f5ded1321f'),
      u('photo-1503160865267-af4660ce7bf2'),
    ],
    credit: `Photo by ${by.ardy[0]} on Unsplash`,
    description:
      'Luxurious chanderi fabric in a delicate rose hue. The co-ord set includes a straight-cut kurta and matching palazzo pants. Light, breathable, and festive.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'prod-3',
    name: 'Cotton Salwar Suit — Ivory',
    price: '₹1,299',
    was: null,
    off: null,
    showOff: false,
    category: 'suits',
    rating: 4.3,
    reviewCount: 94,
    badge: null,
    src: u('photo-1668371459824-094a960a227d'),
    images: [
      u('photo-1668371459824-094a960a227d'),
      u('photo-1668371679302-a8ec781e876e'),
      u('photo-1503160865267-af4660ce7bf2'),
    ],
    credit: `Photo by ${by.ardy[0]} on Unsplash`,
    description:
      'Pure cotton salwar suit in a pristine ivory shade. Includes kurta, salwar, and a complementary dupatta. Ideal for daily wear and casual occasions.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-4',
    name: 'Handloom Saree — Mustard',
    price: '₹1,499',
    was: '₹1,799',
    off: '15% off',
    showOff: siteConfig.showSaleBadges,
    category: 'dresses',
    rating: 4.8,
    reviewCount: 428,
    badge: 'Best Seller' as const,
    src: u('photo-1569810020669-aa9d38003ea7'),
    images: [
      u('photo-1569810020669-aa9d38003ea7'),
      u('photo-1745482036066-5d215ed6b910'),
      u('photo-1713296008556-29c7fae52234'),
    ],
    credit: `Photo by ${by.pranav[0]} on Unsplash`,
    description:
      'Authentic handloom saree in a vibrant mustard tone. Pure cotton weave with a self-embossed border. Comes with an unstitched blouse piece.',
    sizes: ['Free Size'],
  },
  {
    id: 'prod-5',
    name: 'A-line Anarkali — Indigo Dabu',
    price: '₹999',
    was: '₹1,199',
    off: '15% off',
    showOff: siteConfig.showSaleBadges,
    category: 'anarkali',
    rating: 4.6,
    reviewCount: 201,
    badge: 'Highly Purchased' as const,
    src: u('photo-1571908599538-7e1e6e92b064'),
    images: [
      u('photo-1571908599538-7e1e6e92b064'),
      u('photo-1571908599407-cdb918ed83bf'),
      u('photo-1610048869310-d889ff25c374'),
      u('photo-1756483509254-3cc48a5a15b2'),
    ],
    credit: `Photo by ${by.dollar[0]} on Unsplash`,
    description:
      'Graceful A-line Anarkali in hand-printed indigo dabu. Floor-length silhouette with a subtle flare — perfect for festive and wedding occasions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-6',
    name: 'Zari-edge Dupatta — Gold',
    price: '₹549',
    was: '₹699',
    off: '20% off',
    showOff: siteConfig.showSaleBadges,
    category: 'tops',
    rating: 4.4,
    reviewCount: 156,
    badge: null,
    src: u('photo-1713296008556-29c7fae52234'),
    images: [
      u('photo-1713296008556-29c7fae52234'),
      u('photo-1717585679395-bbe39b5fb6bc'),
      u('photo-1569810020669-aa9d38003ea7'),
    ],
    credit: `Photo by ${by.ardy[0]} on Unsplash`,
    description:
      'Sheer tissue dupatta finished with a traditional zari border. Adds an instant festive touch to any ethnic outfit.',
    sizes: ['Free Size'],
  },
  {
    id: 'prod-7',
    name: 'Straight Kurti — Kashish Grey',
    price: '₹749',
    was: null,
    off: null,
    showOff: false,
    category: 'kurti',
    rating: 4.2,
    reviewCount: 73,
    badge: 'New Arrival' as const,
    src: u('photo-1756483509254-3cc48a5a15b2'),
    images: [
      u('photo-1756483509254-3cc48a5a15b2'),
      u('photo-1610048869310-d889ff25c374'),
      u('photo-1571908599407-cdb918ed83bf'),
    ],
    credit: `Photo by ${by.ikshana[0]} on Unsplash`,
    description:
      'Versatile straight-cut kurti in a refined kashish grey. Subtle woven texture, side slits, and a mandarin collar. Great for office and casual wear.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-8',
    name: 'Sharara Co-ord — Pistachio',
    price: '₹1,449',
    was: '₹1,699',
    off: '15% off',
    showOff: siteConfig.showSaleBadges,
    category: 'plazzo',
    rating: 4.9,
    reviewCount: 534,
    badge: 'Best Seller' as const,
    src: u('photo-1597983073750-16f5ded1321f'),
    images: [
      u('photo-1597983073750-16f5ded1321f'),
      u('photo-1668371679302-a8ec781e876e'),
      u('photo-1717585679395-bbe39b5fb6bc'),
      u('photo-1503160865267-af4660ce7bf2'),
    ],
    credit: `Photo by ${by.dollar[0]} on Unsplash`,
    description:
      'Elegant sharara co-ord set in a refreshing pistachio green. The flared sharara paired with an embroidered short kurta creates a regal festive look.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
] as const;

// ─── Testimonials ──────────────────────────────────────────────────────────
export const testimonials = [
  { quote: 'The mul kurti is softer than anything I own. Wore it the day it arrived.', name: 'Gurleen K., Amritsar' },
  { quote: 'Ordered a co-ord for a haldi — the fit and colour were exactly as shown.', name: 'Meera S., Delhi' },
  { quote: 'Fast delivery, honest fabric, prices that make sense. My third order already.', name: 'Aditi R., Jaipur' },
];

// ─── Marquee ───────────────────────────────────────────────────────────────
export const marqueeItems = [
  'Free shipping over ₹999',
  "Festive \u202626 collection live",
  '7-day easy returns',
  'Made in Amritsar, India',
];
