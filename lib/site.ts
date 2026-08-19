/**
 * Site-level switches. These were editor props on the Claude Design canvas
 * (`showSaleBadges`, `showTestimonials`, `colourPhotos`) — here they are plain
 * constants you can flip without touching a component.
 */
export const siteConfig = {
  name: 'Saanshika Ethnics',
  tagline: 'Every thread, a celebration.',
  description:
    'Kurtis, co-ord sets, suits, sarees and dupattas in everyday fabrics — block prints, chanderi and handloom cotton, made in Amritsar.',
  email: 'saanshikaethnics@gmail.com',
  address: ['249, Block-D, Thakur ji Estate,', 'Muraadpura, F.G.C. Road,', 'Amritsar 143001, Punjab'],
  /** Phone in international format, digits only — wa.me needs it this way. */
  whatsapp: '919915839059',
  social: {
    // The ?igsh= token Instagram appends is share tracking, not part of the
    // profile URL, so it is dropped here.
    instagram: 'https://www.instagram.com/saanshikaethnics',
    facebook: 'https://www.facebook.com/share/14o5zX8zGYH/',
  },
  showSaleBadges: true,
  showTestimonials: true,
  colourPhotos: true,
} as const;

/** `''` when photos are in colour, the DS grayscale utility when they are not. */
export const photoClass = siteConfig.colourPhotos ? '' : 'grayscale';
