'use client';

import * as React from 'react';
import { Sidebar } from '@step-in-crm/ui';
import { cn } from '@step-in-crm/ui';

interface AppShellProps {
  children: React.ReactNode;
  currentPath?: string;
}

export function AppShell({ children, currentPath = '' }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={currentPath}
      />
      <main
        className={cn(
          'transition-all duration-normal min-h-screen',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'
        )}
      >
        <div className="h-[64px] lg:hidden" aria-hidden="true" />
        <div className="p-4 lg:p-6 max-w-[1280px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}