'use client';

import * as React from 'react';
import { Card, CardContent, Table } from '@step-in-crm/ui';

export function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
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

      <Card variant="outlined" padding="md">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="h-10 w-full bg-surface-elevated rounded-md" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-10 w-[150px] bg-surface-elevated rounded-md" />
            <div className="h-10 w-32 bg-surface-elevated rounded-md" />
          </div>
        </CardContent>
      </Card>

      <Card variant="default" padding="none">
        <Table
          columns={[
            { key: 'orderNumber', header: 'Order #', width: '140px' },
            { key: 'customer', header: 'Customer', minWidth: '200px' },
            { key: 'status', header: 'Status', width: '130px' },
            { key: 'totalCents', header: 'Total', width: '130px' },
            { key: 'logisticsPartner', header: 'Logistics', width: '130px' },
            { key: 'trackingNumber', header: 'Tracking', width: '150px' },
            { key: 'expectedDate', header: 'Expected', width: '120px' },
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