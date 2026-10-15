import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { DashboardContent } from './DashboardContent';
import { DashboardSkeleton } from './DashboardSkeleton';

export default async function DashboardPage() {
  return (
    <AppShell currentPath="/dashboard">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </AppShell>
  );
}