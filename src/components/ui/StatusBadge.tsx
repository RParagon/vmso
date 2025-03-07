
import React from 'react';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    open: {
      label: 'Aberta',
      color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
      icon: Clock
    },
    in_progress: {
      label: 'Em Andamento',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
      icon: PlayCircle
    },
    completed: {
      label: 'Concluída',
      color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
      icon: CheckCircle2
    },
    canceled: {
      label: 'Cancelada',
      color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
      icon: XCircle
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 py-1 px-2 font-normal', config.color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
