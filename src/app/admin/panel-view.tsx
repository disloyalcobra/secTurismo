'use strict';
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/admin/login';
import Dashboard from '@/app/admin/dashboard';

interface PanelViewProps {
  isAuthenticated: boolean;
}

export default function PanelView({ isAuthenticated }: PanelViewProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleRefresh} />;
  }

  return <LoginForm onLoginSuccess={handleRefresh} />;
}
