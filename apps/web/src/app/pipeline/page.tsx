import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { PipelineContent } from './PipelineContent';
import { PipelineSkeleton } from './PipelineSkeleton';

export default async function PipelinePage() {
  return (
    <AppShell currentPath="/pipeline">
      <Suspense fallback={<PipelineSkeleton />}>
        <PipelineContent />
      </Suspense>
    </AppShell>
  );
}