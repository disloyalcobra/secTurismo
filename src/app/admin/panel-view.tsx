'use strict';
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/admin/login';
import Dashboard from '@/app/admin/dashboard';

interface PanelViewProps {
  isAuthenticated: boolean;
  username?: string | null;
}

export default function PanelView({ isAuthenticated, username = null }: PanelViewProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleRefresh} username={username} />;
  }

  return <LoginForm onLoginSuccess={handleRefresh} />;
}
