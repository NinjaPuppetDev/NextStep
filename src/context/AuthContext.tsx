'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export const OWNER_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL || 'raigoza.david.j@gmail.com'
).toLowerCase().trim();

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  authError: string | null;
  ownerEmail: string;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Validate if a user is the verified site owner
  const isUserOwner = useCallback((userObj: User | null): boolean => {
    if (!userObj || !userObj.email) return false;
    const email = userObj.email.toLowerCase().trim();
    return email === OWNER_EMAIL;
  }, []);

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userEmail = (currentUser.email || '').toLowerCase().trim();
        if (userEmail === OWNER_EMAIL) {
          setUser(currentUser);
          setAuthError(null);
        } else {
          // Strictly reject non-owner logins
          console.warn(`[AUTH REJECTED] Unauthorized user: ${userEmail}. Required: ${OWNER_EMAIL}`);
          await firebaseSignOut(auth);
          setUser(null);
          setAuthError(
            `Access Denied: Account (${currentUser.email}) is not authorized. NextStep Studio access is restricted to the verified site owner.`
          );
          if (pathname.startsWith('/admin') || pathname.startsWith('/cms')) {
            router.push('/');
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Google OAuth Login
  const loginWithGoogle = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    setAuthError(null);

    try {
      if (typeof window !== 'undefined') {
        await setPersistence(auth, browserLocalPersistence);
      }

      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      const userEmail = (loggedUser.email || '').toLowerCase().trim();

      if (userEmail !== OWNER_EMAIL) {
        await firebaseSignOut(auth);
        setUser(null);
        const errMsg = `Unauthorized Access: Account (${loggedUser.email}) does not have administrative clearance. Only ${OWNER_EMAIL} is authorized.`;
        setAuthError(errMsg);
        throw new Error(errMsg);
      }

      setUser(loggedUser);
      setAuthError(null);
      return loggedUser;
    } catch (err: unknown) {
      let message = 'Google authentication failed';
      if (err && typeof err === 'object') {
        const fbErr = err as { code?: string; message?: string };
        if (fbErr.code === 'auth/unauthorized-domain' || fbErr.message?.includes('unauthorized-domain')) {
          const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your current domain';
          message = `Firebase: auth/unauthorized-domain. The current domain (${currentHost}) must be added to Authorized Domains in your Firebase Authentication Console.`;
        } else if (fbErr.message) {
          message = fbErr.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      console.error('[AUTH ERROR]', err);
      setAuthError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout Handler
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAuthError(null);
      if (pathname.startsWith('/admin') || pathname.startsWith('/cms')) {
        router.push('/');
      }
    } catch (err) {
      console.error('[LOGOUT ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  const isAuthenticated = useMemo(() => {
    return !!user && isUserOwner(user);
  }, [user, isUserOwner]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isAdmin: isAuthenticated,
      isOwner: isAuthenticated,
      loading,
      authError,
      ownerEmail: OWNER_EMAIL,
      loginWithGoogle,
      logout,
      clearAuthError,
    }),
    [user, isAuthenticated, loading, authError, loginWithGoogle, logout, clearAuthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
