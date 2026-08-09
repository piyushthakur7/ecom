import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://4ksq7vpf.ap-southeast.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_db887a6aa1ac0b2a2c4eb6eaf359a0bf';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
