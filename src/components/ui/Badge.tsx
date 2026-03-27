'use client';

import { HttpStatus } from '@/types';

interface BadgeProps
{
  status: HttpStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<HttpStatus, { label: string; classes: string }> = {
  [HttpStatus.OPERATIONAL]: {
    label: 'OPERATIONAL',
    classes: 'bg-aegis-accent/10 text-aegis-accent border-aegis-accent/20',
  },
  [HttpStatus.HIJACKED]: {
    label: 'HIJACKED',
    classes: 'bg-aegis-danger/10 text-aegis-danger border-aegis-danger/20',
  },
  [HttpStatus.DDOS]: {
    label: 'DDOS',
    classes: 'bg-aegis-warning/10 text-aegis-warning border-aegis-warning/20',
  },
  [HttpStatus.UNKNOWN]: {
    label: 'UNKNOWN',
    classes: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
};

export default function Badge({ status, size = 'sm' }: BadgeProps)
{
  const config = statusConfig[status];
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[9px]'
    : 'px-3 py-1 text-xs';
  return (
    <span
      className={`
        inline-flex items-center font-mono font-bold border
        tracking-wider ${config.classes} ${sizeClasses}
      `}
    >
      {config.label}
    </span>
  );
}
