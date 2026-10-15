'use client';

import * as React from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline' | 'ai';
  shape?: 'circle' | 'square';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-xl',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

const statusColors = {
  online: 'bg-success border-surface',
  busy: 'bg-warning border-surface',
  offline: 'bg-text-muted border-surface',
  ai: 'bg-accent border-surface',
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', status, shape = 'circle', ...props }, ref) => {
    const showStatus = status && size !== 'xs';
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 overflow-hidden',
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : name ? (
          <div className="h-full w-full flex items-center justify-center bg-accent-light text-accent-text font-semibold">
            {getInitials(name)}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-surface-elevated text-text-muted">
            <svg className="h-1/2 w-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {showStatus && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2',
              statusColors[status!],
              statusSizes[size]
            )}
            aria-label={`${status} status`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ children, max = 5, size = 'md', className }: AvatarGroupProps) {
  const avatars = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)} aria-label={`${avatars.length} people`}>
      {visible.map((avatar, index) => (
        <div key={index} className="relative z-10">
          {React.cloneElement(avatar, { size })}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative z-0 flex items-center justify-center bg-surface-elevated text-text-muted font-medium border-2 border-surface',
            sizeClasses[size],
            shape === 'circle' ? 'rounded-full' : 'rounded-lg'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}