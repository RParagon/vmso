
import React from 'react';
import { ServiceOrder } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderCardProps {
  order: ServiceOrder;
  onDelete?: (id: string) => void;
}

export const OrderCard = ({ order, onDelete }: OrderCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 border border-border hover:shadow-md animate-scale-in">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">#{order.orderNumber}</h3>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {order.client?.fullName || "Cliente não encontrado"}
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
              <Link to={`/orders/${order.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
              <Link to={`/orders/edit/${order.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete && onDelete(order.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <span className="font-medium">Abertura:</span> {formatDate(order.openDate)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Conclusão prevista:</span> {formatDate(order.expectedCompletionDate)}
          </div>
          <div className="text-sm line-clamp-2">
            <span className="font-medium">Descrição:</span> {order.description}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border">
          <Button variant="outline" asChild className="w-full gap-2">
            <Link to={`/clients/${order.clientId}`}>
              <User className="h-4 w-4" />
              Ver Cliente
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
