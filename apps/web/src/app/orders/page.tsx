import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { OrdersContent } from './OrdersContent';
import { OrdersSkeleton } from './OrdersSkeleton';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell currentPath="/orders">
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent initialParams={params} />
      </Suspense>
    </AppShell>
  );
}