import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { LeadsContent } from './LeadsContent';
import { LeadsSkeleton } from './LeadsSkeleton';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell currentPath="/leads">
      <Suspense fallback={<LeadsSkeleton />}>
        <LeadsContent initialParams={params} />
      </Suspense>
    </AppShell>
  );
}