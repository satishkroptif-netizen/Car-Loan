'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-elevated text-text-muted border border-border',
      success: 'bg-success-light text-success-text',
      warning: 'bg-warning-light text-warning-text',
      danger: 'bg-danger-light text-danger-text',
      info: 'bg-info-light text-info-text',
      accent: 'bg-accent-light text-accent-text',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-semibold rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps {
  status: 'hot' | 'warm' | 'cold' | 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    hot: { variant: 'danger', label: 'Hot' },
    warm: { variant: 'warning', label: 'Warm' },
    cold: { variant: 'success', label: 'Cold' },
    new: { variant: 'accent', label: 'New' },
    contacted: { variant: 'info', label: 'Contacted' },
    qualified: { variant: 'success', label: 'Qualified' },
    unqualified: { variant: 'default', label: 'Unqualified' },
    lost: { variant: 'danger', label: 'Lost' },
  };

  const { variant, label } = config[status] || { variant: 'default', label: status };
  return <Badge variant={variant} size={size}>{label}</Badge>;
}

export interface StageBadgeProps {
  stage: 'qualify' | 'propose' | 'negotiate' | 'close_won' | 'close_lost';
  size?: 'sm' | 'md';
}

export function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    qualify: { variant: 'accent', label: 'Qualify' },
    propose: { variant: 'info', label: 'Propose' },
    negotiate: { variant: 'warning', label: 'Negotiate' },
    close_won: { variant: 'success', label: 'Won' },
    close_lost: { variant: 'danger', label: 'Lost' },
  };

  const { variant, label } = config[stage] || { variant: 'default', label: stage };
  return <Badge variant={variant} size={size}>{label}</Badge>;
}

export interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string; dot: boolean }> = {
    low: { variant: 'success', label: 'Low', dot: true },
    medium: { variant: 'info', label: 'Medium', dot: true },
    high: { variant: 'warning', label: 'High', dot: true },
    critical: { variant: 'danger', label: 'Critical', dot: true },
  };

  const { variant, label, dot } = config[priority] || { variant: 'default', label: priority, dot: false };
  return <Badge variant={variant} size={size} dot={dot}>{label}</Badge>;
}