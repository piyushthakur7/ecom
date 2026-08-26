import { createServerClient } from '@insforge/sdk/ssr';
import { INSFORGE_URL, INSFORGE_ANON_KEY } from '@/lib/insforge-client';

/**
 * Admin authorisation for API routes.
 *
 * The /admin page guards itself in the browser, which stops an ordinary
 * shopper *seeing* the dashboard but stops nobody from calling the routes
 * behind it. Anything that spends money or talks to a logistics provider has
 * to re-establish who is asking on the server, from the caller's own token —
 * never from a field in the request body.
 */

export type AdminAuth =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; reason: string };

function bearer(req: Request): string {
  const header = req.headers.get('authorization') ?? '';
  return /^bearer\s+/i.test(header) ? header.replace(/^bearer\s+/i, '').trim() : '';
}

export async function requireAdmin(req: Request): Promise<AdminAuth> {
  const token = bearer(req);
  if (!token) {
    return { ok: false, status: 401, reason: 'Sign in as an administrator to do this.' };
  }

  // A client bound to the caller's token: InsForge validates it for us, so a
  // forged or expired JWT fails here rather than being taken at face value.
  const asCaller = createServerClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
    accessToken: token,
  });

  try {
    const { data, error } = await asCaller.auth.getCurrentUser();
    const user = data?.user;
    if (error || !user?.id) {
      return { ok: false, status: 401, reason: 'Your session has expired. Sign in again.' };
    }

    // `.limit(1)` rather than `.single()`: a missing profile row is a plain
    // "not an admin", not an error worth a 500.
    const { data: rows, error: profileError } = await asCaller.database
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1);

    if (profileError) {
      console.error('Admin check could not read profile:', profileError.message);
      return { ok: false, status: 403, reason: 'Could not verify your account.' };
    }

    const role = (rows as Array<{ role?: string }> | null)?.[0]?.role;
    if (role !== 'admin') {
      return { ok: false, status: 403, reason: 'Administrator access required.' };
    }

    return { ok: true, userId: user.id };
  } catch (err) {
    console.error('Admin check threw:', err);
    return { ok: false, status: 401, reason: 'Could not verify your session.' };
  }
}
