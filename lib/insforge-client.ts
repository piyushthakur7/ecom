import { createClient } from '@insforge/sdk';

/**
 * Shared connection details.
 *
 * Exported because the server-side admin guard builds its own client against
 * the caller's bearer token (see `lib/server/require-admin.ts`) and must not
 * drift from the URL/key the browser client uses.
 */
export const INSFORGE_URL =
  process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://59y4evms.ap-southeast.insforge.app';
export const INSFORGE_ANON_KEY =
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_18f67acf6d7bb06889405d16b6e6d5e5';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

/**
 * The caller's current access token, refreshed if it is close to expiry.
 *
 * Browser-only: the SDK keeps the session in memory, so this returns null on
 * the server. Used to authenticate calls to our own privileged API routes.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await insforge.getHttpClient().getValidAccessToken();
  } catch {
    return null;
  }
}
