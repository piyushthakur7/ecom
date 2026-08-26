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

/**
 * Where the browser sends SDK calls.
 *
 * `next.config.mjs` rewrites the InsForge `/api/*` namespaces to `INSFORGE_URL`,
 * so in the browser we point the SDK at our own origin: the session cookie is
 * then set first-party instead of as a `SameSite=None` third-party cookie, and
 * same-origin requests skip the CORS preflight. On the server there is no
 * origin to be relative to, so those calls go straight to InsForge.
 */
const CLIENT_BASE_URL =
  typeof window === 'undefined' ? INSFORGE_URL : window.location.origin;

export const insforge = createClient({
  baseUrl: CLIENT_BASE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

/** Name of the readable companion to the HttpOnly refresh cookie. */
const CSRF_COOKIE = 'insforge_csrf_token';

/**
 * Whether this browser looks like it has a session to restore.
 *
 * The SDK holds the session in memory only, so on every fresh page load
 * `getCurrentUser()` falls through to `POST /api/auth/refresh`. For a signed-out
 * visitor that is a guaranteed 401 — a console error, a wasted round trip, and
 * a layout shift once the pending state resolves. The SDK pairs the HttpOnly
 * refresh cookie with a readable `insforge_csrf_token` (set when a session is
 * saved, cleared on sign-out) and refresh *requires* that token, so its absence
 * means the refresh could not have succeeded anyway.
 */
export function hasStoredSession(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((c) => c.trim().startsWith(`${CSRF_COOKIE}=`));
}

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
