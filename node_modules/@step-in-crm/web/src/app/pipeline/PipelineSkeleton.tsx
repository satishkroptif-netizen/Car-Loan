'use client';

import * as React from 'react';
import { Card, CardContent, Table } from '@step-in-crm/ui';

export function PipelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-surface-elevated rounded" />
          <div className="h-4 w-56 bg-surface-elevated rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-surface-elevated rounded-md" />
          <div className="h-10 w-32 bg-surface-elevated rounded-md" />
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col min-w-[320px] max-w-[320px] bg-surface-elevated/50 rounded-xl border border-border">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-surface-elevated" />
                  <div className="h-5 w-24 bg-surface-elevated rounded" />
                  <div className="h-5 w-16 bg-surface-elevated rounded" />
                </div>
                <div className="text-right">
                  <div className="h-5 w-20 bg-surface-elevated rounded" />
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3 min-h-[400px]">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="bg-surface border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="h-5 w-40 bg-surface-elevated rounded flex-1" />
                      <div className="h-5 w-20 bg-surface-elevated rounded" />
                    </div>
                    <div className="h-8 w-24 bg-surface-elevated rounded mb-2" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-32 bg-surface-elevated rounded" />
                      <div className="h-3 w-28 bg-surface-elevated rounded" />
                      <div className="h-3 w-36 bg-surface-elevated rounded" />
                      <div className="h-3 w-40 bg-surface-elevated rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="h-10 w-full bg-surface-elevated rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}