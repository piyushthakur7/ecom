const baseUrl = 'https://4ksq7vpf.ap-southeast.insforge.app';
const anonKey = 'ik_db887a6aa1ac0b2a2c4eb6eaf359a0bf';

const localImages = [
  '/images/products/kaftan-sharara-1.jpg',
  '/images/products/kaftan-sharara-2.jpg',
  '/images/products/kaftan-sharara-3.jpg',
  '/images/products/kaftan-sharara-4.jpg',
  '/images/products/kaftan-sharara-5.jpg',
];

(async () => {
  console.log('Updating images for prod-226 in DB to local static assets...');
  const res = await fetch(`${baseUrl}/api/database/records/products?id=eq.prod-226`, {
    method: 'PATCH',
    headers: {
      'HTTP_X_API_KEY': anonKey,
      'x-api-key': anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: localImages,
    }),
  }).catch(() => {});
  if (res) console.log('STATUS:', res.status);
})();
