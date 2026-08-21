'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CMSManagerView from '@/components/CMSManagerView';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

export default function CMSPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Automatic silent redirect to admin login
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="cms-page-container flex items-center justify-center min-h-screen">
        <div className="text-center py-20 text-white/60">
          <div className="admin-spinner mx-auto mb-4" />
          <p className="font-mono text-sm tracking-widest uppercase">Verifying Owner Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="cms-page-container flex items-center justify-center min-h-screen p-6">
        <div className="admin-login-card max-w-md w-full text-center">
          <div className="security-icon-wrap mx-auto mb-4 bg-red-500/10 border border-red-500/30 p-4 rounded-full w-fit">
            <Lock size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Studio Access</h2>
          <p className="text-sm text-white/60 mb-6">
            The Studio Media CMS is locked strictly to the verified site owner. Please authenticate with your authorized Google Account.
          </p>
          <Link
            href="/admin/login"
            className="admin-primary-btn w-full justify-center"
          >
            <span>Proceed to Admin Authentication</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-page-container">
      <div className="cms-page-wrapper">
        <CMSManagerView isModal={false} />
      </div>
    </div>
  );
}

