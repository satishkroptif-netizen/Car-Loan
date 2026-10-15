'use client';

import * as React from 'react';
import { Card, CardContent, Table } from '@step-in-crm/ui';

export function LeadsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-surface-elevated rounded" />
          <div className="h-4 w-48 bg-surface-elevated rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-surface-elevated rounded-md" />
          <div className="h-10 w-32 bg-surface-elevated rounded-md" />
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="h-10 w-full bg-surface-elevated rounded-md" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-10 w-[150px] bg-surface-elevated rounded-md" />
            <div className="h-10 w-[150px] bg-surface-elevated rounded-md" />
            <div className="h-10 w-32 bg-surface-elevated rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card variant="default" padding="none">
        <Table
          columns={[
            { key: 'score', header: 'Score', width: '70px' },
            { key: 'name', header: 'Name / Company', minWidth: '250px' },
            { key: 'contact', header: 'Contact', width: '180px' },
            { key: 'source', header: 'Source', width: '120px' },
            { key: 'status', header: 'Status', width: '130px' },
            { key: 'assignedTo', header: 'Assignee', width: '130px' },
            { key: 'createdAt', header: 'Created', width: '120px' },
            { key: 'actions', header: '', width: '60px' },
          ]}
          data={Array.from({ length: 5 }).map((_, i) => ({ id: `skeleton-${i}` }))}
          keyExtractor={(row) => row.id}
          loading={true}
        />
      </Card>
    </div>
  );
}