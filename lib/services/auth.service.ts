import { insforge } from '@/lib/insforge-client';
import type { InsforgeUser, Profile, SavedAddress } from '@/lib/types';

/** Get the currently logged-in user from InsForge (refreshes session via cookie). */
export async function getUser(): Promise<InsforgeUser | null> {
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) return null;
    return data.user as InsforgeUser;
  } catch {
    return null;
  }
}

/** Trigger Google OAuth redirect flow. */
export async function signInWithGoogle(): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  await insforge.auth.signInWithOAuth('google', {
    redirectTo: `${origin}/`,
    additionalParams: { prompt: 'select_account' },
  });
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  await insforge.auth.signOut();
}

/** Get user profile from profiles table by ID or Email fallback. */
export async function getProfile(userId: string, userEmail?: string): Promise<Profile | null> {
  try {
    // 1. Try fetching by user ID
    let { data, error } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Fallback: if not found by ID but email is provided, fetch by email and sync ID
    if ((error || !data) && userEmail) {
      const emailRes = await insforge.database
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (emailRes.data) {
        data = emailRes.data;
        const oldId = (data as Record<string, unknown>).id;
        if (oldId !== userId) {
          try {
            await insforge.database.from('profiles').update({ id: userId }).eq('email', userEmail);
            (data as Record<string, unknown>).id = userId;
          } catch { /* silent */ }
        }
      }
    }

    if (!data) return null;
    const raw = data as Record<string, unknown>;
    return {
      ...raw,
      addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
    } as Profile;
  } catch {
    return null;
  }
}

/**
 * Upsert a profile row. Called after OAuth login to create the profile
 * if it doesn't exist yet (Google returns name + avatar from its token).
 */
export async function ensureProfile(
  user: InsforgeUser,
  overrides?: Partial<Pick<Profile, 'full_name' | 'phone'>>
): Promise<Profile | null> {
  try {
    const existing = await getProfile(user.id, user.email);
    if (existing && !overrides) return existing;

    // Look up pre-seeded role by email (e.g. admin pre-seeded before first login)
    let preseededRole: 'user' | 'admin' = 'user';
    if (!existing) {
      try {
        const { data } = await insforge.database
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();
        if (data) preseededRole = ((data as Record<string, unknown>).role as 'user' | 'admin') ?? 'user';
      } catch { /* no pre-seeded row */ }
    }

    const payload: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      full_name: overrides?.full_name ?? existing?.full_name ?? user.profile?.name ?? null,
      avatar_url: existing?.avatar_url ?? user.profile?.avatar_url ?? null,
      phone: overrides?.phone ?? existing?.phone ?? null,
      addresses: existing?.addresses ?? [],
      role: existing?.role ?? preseededRole,
    };

    // Delete any pre-seeded row with a different UUID first (same email), then insert/update
    await insforge.database.from('profiles').delete().eq('email', user.email).neq('id', user.id);
    await insforge.database.from('profiles').upsert([payload]);
    return getProfile(user.id, user.email);
  } catch {
    return null;
  }
}

/** Update profile fields (name, phone, avatar_url). */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>
): Promise<boolean> {
  try {
    await insforge.database
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return true;
  } catch {
    return false;
  }
}

/** Replace the entire addresses array for a user. */
export async function updateAddresses(
  userId: string,
  addresses: SavedAddress[]
): Promise<boolean> {
  try {
    await insforge.database
      .from('profiles')
      .update({ addresses })
      .eq('id', userId);
    return true;
  } catch {
    return false;
  }
}
