'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useCMS } from '../context/CMSContext';
import { useAuth } from '../context/AuthContext';
import CMSManagerView from './CMSManagerView';

const emptySubscribe = () => () => {};

export default function AdminCMSModal() {
  const { isCMSOpen, setIsCMSOpen } = useCMS();
  const { isAuthenticated } = useAuth();

  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Strictly refuse mounting if not authenticated as the verified owner
  if (!mounted || !isCMSOpen || !isAuthenticated) return null;

  return createPortal(
    <div
      className="cms-modal-overlay"
      onClick={() => setIsCMSOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Admin CMS Modal"
    >
      <CMSManagerView isModal={true} onClose={() => setIsCMSOpen(false)} />
    </div>,
    document.body
  );
}

