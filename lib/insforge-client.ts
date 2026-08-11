import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://59y4evms.ap-southeast.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_18f67acf6d7bb06889405d16b6e6d5e5';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
