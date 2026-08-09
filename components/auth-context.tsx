'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { InsforgeUser, Profile } from '@/lib/types';
import { getUser, signInWithGoogle, signOut as serviceSignOut, ensureProfile, getProfile } from '@/lib/services/auth.service';

// ─── Context shape ──────────────────────────────────────────────────────────
type AuthValue = {
  user: InsforgeUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  /** Trigger Google OAuth redirect */
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-fetch profile from DB (call after saving profile changes) */
  refreshProfile: () => Promise<void>;
  /** Update profile in context without re-fetching */
  patchProfile: (partial: Partial<Profile>) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InsforgeUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const u = await getUser();
      setUser(u);
      if (u) {
        let p = await getProfile(u.id, u.email);
        if (!p) {
          p = await ensureProfile(u);
        }
        setProfile(p);
      } else {
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: check for OAuth callback (insforge_code in URL), then load user
  useEffect(() => {
    // InsForge SDK automatically processes the code param on getCurrentUser()
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await serviceSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id, user.email);
    setProfile(p);
  }, [user]);

  const patchProfile = useCallback((partial: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const isAdmin = profile?.role === 'admin';

  const value = useMemo(
    () => ({ user, profile, isAdmin, isLoading, signIn, signOut, refreshProfile, patchProfile }),
    [user, profile, isAdmin, isLoading, signIn, signOut, refreshProfile, patchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
