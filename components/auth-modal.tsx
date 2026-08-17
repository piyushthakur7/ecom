'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { ensureProfile } from '@/lib/services/auth.service';

type Step = 'sign-in' | 'complete-profile';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Called after successful login + profile completion */
  onSuccess?: () => void;
  /** Optional message to show above the sign-in button */
  message?: string;
};

export function AuthModal({ isOpen, onClose, onSuccess, message }: Props) {
  const { user, profile, signIn, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>('sign-in');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // When user signs in via Google and we detect them, move to step 2 if profile is incomplete
  useEffect(() => {
    if (!isOpen) return;
    if (user && !profile?.full_name) {
      // Pre-fill from Google profile
      setName(user.profile?.name ?? '');
      setStep('complete-profile');
    } else if (user && profile?.full_name) {
      // Profile already complete — just close/call success
      onSuccess?.();
      onClose();
    }
  }, [isOpen, user, profile, onSuccess, onClose]);

  const handleSaveProfile = useCallback(async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (phone && !/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number.'); return; }
    if (!user) return;
    setSaving(true);
    try {
      await ensureProfile(user, { full_name: name.trim(), phone: phone || null });
      await refreshProfile();
      onSuccess?.();
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, phone, user, refreshProfile, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)',
          zIndex: 1000, backdropFilter: 'blur(3px)',
        }}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          background: '#fff',
          borderRadius: 18,
          padding: '36px 32px',
          width: '92vw', maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
          animation: 'toastIn 0.25s ease',
        }}
      >
        {step === 'sign-in' ? (
          <>
            {/* Logo / Brand */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Saanshika Ethnics
              </div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                {message ?? 'Sign in to continue shopping'}
              </div>
            </div>

            {/* Google Sign In */}
            <button
              id="auth-modal-google-btn"
              onClick={signIn}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '14px 20px',
                background: '#fff',
                border: '1.5px solid #e0e0e0',
                borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
            >
              {/* Google G logo */}
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1L37.4 9.6C34 6.5 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5C35.3 45.5 44.5 36.3 44.5 25c0-1.7-.2-3.4-.9-5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1L37.4 9.6C34 6.5 29.3 4.5 24 4.5c-7.7 0-14.4 4.3-18.1 10.2z"/>
                <path fill="#4CAF50" d="M24 45.5c5.2 0 9.9-1.9 13.3-5L31.6 36c-2 1.4-4.7 2.3-7.6 2.3-5.3 0-9.6-3.5-11.3-8.3L6.2 35c3.6 6 10.4 10.5 17.8 10.5z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.5 5c3.8-3.5 6.4-8.6 6.4-14.5 0-1.7-.2-3.4-.9-5z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#aaa' }}>
              By continuing, you agree to our terms of service and privacy policy.
            </div>
          </>
        ) : (
          <>
            <div id="auth-modal-title" style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              Almost there!
            </div>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
              Tell us your name and phone number to get started.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field">
                <span className="form-label">Full name *</span>
                <input
                  id="auth-modal-name"
                  className="form-input"
                  placeholder="Gurleen Kaur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-field">
                <span className="form-label">Phone number (optional)</span>
                <input
                  id="auth-modal-phone"
                  className="form-input"
                  type="tel"
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#dc2626' }}>{error}</div>
            )}

            <button
              id="auth-modal-save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-primary btn-block btn-large"
              style={{ marginTop: 20, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Save & Continue →'}
            </button>
          </>
        )}

        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#aaa', fontSize: 22, lineHeight: 1, padding: 4,
          }}
        >×</button>
      </div>
    </>
  );
}
