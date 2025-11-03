import React from 'react';

type BadgeProps = {
  variant?: 'default' | 'live';
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const base = 'badge';
  const mod = variant === 'live' ? 'badge-live' : '';
  return <span className={`${base} ${mod} ${className}`.trim()}>{children}</span>;
}