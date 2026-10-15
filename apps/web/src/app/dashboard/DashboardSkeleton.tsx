'use client';

import * as React from 'react';
import { Card, CardContent, Badge, Avatar } from '@step-in-crm/ui';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-surface-elevated rounded" />
          <div className="h-4 w-64 bg-surface-elevated rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-surface-elevated rounded-md" />
          <div className="h-10 w-32 bg-surface-elevated rounded-md" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="kpi" padding="md">
            <CardContent className="flex items-start justify-between">
              <div>
                <div className="h-4 w-32 bg-surface-elevated rounded" />
                <div className="h-8 w-24 bg-surface-elevated rounded mt-2" />
                <div className="h-4 w-20 bg-surface-elevated rounded mt-2" />
              </div>
              <div className="h-12 w-12 rounded-lg bg-surface-elevated" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Funnel + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="default" padding="lg">
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={i === 5 ? '' : 'pb-4'}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-surface-elevated" />
                    <div className="h-4 w-24 bg-surface-elevated rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-16 bg-surface-elevated rounded" />
                    <div className="h-3 w-20 bg-surface-elevated rounded mt-1" />
                  </div>
                </div>
                <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-surface-elevated rounded-full" style={{ width: `${20 * i}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
          <CardContent className="pt-4">
            <div className="h-10 w-full bg-surface-elevated rounded-md" />
          </CardContent>
        </Card>

        <Card variant="default" padding="lg">
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-surface-elevated" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-48 bg-surface-elevated rounded" />
                  <div className="h-3 w-32 bg-surface-elevated rounded mt-1" />
                </div>
                <div className="h-3 w-16 bg-surface-elevated rounded shrink-0" />
              </div>
            ))}
          </CardContent>
          <CardContent className="pt-4">
            <div className="h-10 w-full bg-surface-elevated rounded-md" />
          </CardContent>
        </Card>

        <Card variant="default" padding="lg">
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-surface-elevated" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-32 bg-surface-elevated rounded" />
                    <div className="h-5 w-20 bg-surface-elevated rounded" />
                  </div>
                  <div className="h-3 w-24 bg-surface-elevated rounded mt-1" />
                </div>
                <div className="text-right">
                  <div className="h-5 w-16 bg-surface-elevated rounded" />
                  <div className="h-3 w-16 bg-surface-elevated rounded mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
          <CardContent className="pt-4">
            <div className="h-10 w-full bg-surface-elevated rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}