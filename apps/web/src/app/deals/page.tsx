import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { DealsContent } from './DealsContent';
import { DealsSkeleton } from './DealsSkeleton';

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; stage?: string; search?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell currentPath="/deals">
      <Suspense fallback={<DealsSkeleton />}>
        <DealsContent initialParams={params} />
      </Suspense>
    </AppShell>
  );
}