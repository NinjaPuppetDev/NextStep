'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCMS } from '@/context/CMSContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  LogOut,
  Sliders,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { sound } from '@/utils/audio';
import { firebaseConfig } from '@/lib/firebase';

export default function AdminLoginPage() {
  const {
    user,
    isAuthenticated,
    loading,
    authError,
    ownerEmail,
    loginWithGoogle,
    logout,
    clearAuthError,
  } = useAuth();
  const { setIsCMSOpen } = useCMS();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = authError?.toLowerCase().includes('unauthorized-domain');
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const copyDomain = () => {
    if (typeof window !== 'undefined' && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      sound.playClick(800, 0.02);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    sound.playClick(700, 0.03);
    clearAuthError();
    setSigningIn(true);

    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        sound.playSuccess();
        // Redirect to /cms or open CMS modal
        router.push('/cms');
      }
    } catch {
      sound.playError();
    } finally {
      setSigningIn(false);
    }
  };

  const handleOpenCMS = () => {
    sound.playClick(650, 0.03);
    setIsCMSOpen(true);
    router.push('/cms');
  };

  const handleLogout = async () => {
    sound.playClick(500, 0.02);
    await logout();
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">
        {/* Top Security Status Header */}
        <div className="admin-security-badge">
          <div className="security-icon-wrap">
            {isAuthenticated ? (
              <ShieldCheck size={28} className="text-emerald-400" />
            ) : (
              <Lock size={26} className="text-lime-400" />
            )}
          </div>
          <div className="security-meta">
            <span className="security-tag">RESTRICTED SECURITY ZONE</span>
            <h1 className="security-title">NextStep Atelier CMS Gateway</h1>
          </div>
        </div>

        {/* Error / Unauthorized Warning Banner */}
        {authError && (
          <div className="admin-error-banner">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div className="error-copy flex-1">
              <strong>Authentication Rejected</strong>
              <p>{authError}</p>

              {isUnauthorizedDomain && (
                <div className="unauthorized-domain-guide mt-3 pt-3 border-t border-red-500/20">
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-1.5">
                    Quick Fix: Authorize Domain in Firebase
                  </span>
                  <p className="text-xs text-white/70 mb-2.5">
                    Firebase blocks OAuth popups until the current domain is registered in Authorized Domains.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <code className="bg-black/50 text-lime-400 px-2.5 py-1 rounded text-xs font-mono border border-lime-500/30 break-all">
                      {currentHostname || 'Loading domain...'}
                    </code>
                    <button
                      type="button"
                      onClick={copyDomain}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors"
                      title="Copy domain to clipboard"
                    >
                      {copiedDomain ? <Check size={13} className="text-lime-400" /> : <Copy size={13} />}
                      <span>{copiedDomain ? 'Copied' : 'Copy Domain'}</span>
                    </button>
                  </div>

                  <a
                    href={firebaseSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 underline font-medium"
                  >
                    <span>Open Firebase Auth Settings &rarr; Authorized Domains</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Body */}
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            <p>Verifying cryptographic cryptographic token...</p>
          </div>
        ) : isAuthenticated && user ? (
          <div className="admin-authenticated-panel">
            <div className="admin-profile-pill">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Owner'}
                  className="admin-avatar"
                />
              ) : (
                <div className="admin-avatar-placeholder">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="admin-profile-details">
                <span className="owner-verified-tag">
                  <Sparkles size={11} /> VERIFIED OWNER
                </span>
                <span className="admin-email-text">{user.email}</span>
              </div>
            </div>

            <div className="admin-action-stack">
              <button
                type="button"
                onClick={handleOpenCMS}
                className="admin-primary-btn"
              >
                <Sliders size={16} />
                <span>Launch Studio CMS Manager</span>
                <ArrowRight size={16} />
              </button>

              <Link
                href="/cms"
                className="admin-secondary-btn"
                onClick={() => sound.playClick(600, 0.02)}
              >
                <span>Go to Dedicated /cms View</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="admin-logout-btn"
              >
                <LogOut size={15} />
                <span>Sign Out Admin Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-login-prompt">
            <p className="admin-access-notice">
              This endpoint is strictly isolated for the NextStep site owner. All public
              interfaces are protected. Authentication requires Google OAuth matching:
            </p>

            <div className="owner-whitelist-box">
              <span className="whitelist-label">AUTHORIZED OWNER IDENTITY</span>
              <code className="whitelist-email">{ownerEmail}</code>
            </div>

            <div className="admin-action-stack">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="google-oauth-btn"
              >
                {signingIn ? (
                  <>
                    <div className="admin-spinner-sm" />
                    <span>Authorizing with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google (Owner Access)</span>
                  </>
                )}
              </button>

              <Link
                href="/"
                className="admin-back-link"
                onClick={() => sound.playClick(600, 0.02)}
              >
                ← Return to Storefront
              </Link>
            </div>
          </div>
        )}

        {/* Security Disclaimers */}
        <div className="admin-footer-meta">
          <div className="security-notice-item">
            <AlertCircle size={13} />
            <span>Non-owner attempts are automatically rejected and session terminated.</span>
          </div>
          <div className="stealth-hint">
            <span>Stealth shortcut: </span>
            <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
