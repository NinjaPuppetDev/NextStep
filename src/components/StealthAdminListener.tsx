'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCMS } from '@/context/CMSContext';

export default function StealthAdminListener() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setIsCMSOpen } = useCMS();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stealth shortcut: Ctrl + Shift + A (or Cmd + Shift + A on macOS)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAuthenticated) {
          setIsCMSOpen(true);
        } else {
          router.push('/admin/login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, isAuthenticated, setIsCMSOpen]);

  return null;
}
