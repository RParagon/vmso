
import React from 'react';
import { Client } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientCardProps {
  client: Client;
  onDelete?: (id: string) => void;
}

export const ClientCard = ({ client, onDelete }: ClientCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 border border-border hover:shadow-md animate-scale-in">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{client.fullName}</h3>
            <div className="text-sm text-muted-foreground">{client.document}</div>
          </div>
          <div className="flex gap-1.5">
            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
              <Link to={`/clients/${client.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
              <Link to={`/clients/edit/${client.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete && onDelete(client.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <div className="text-sm font-medium">Email:</div>
            <div className="text-sm">{client.email}</div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm font-medium">Telefone:</div>
            <div className="text-sm">{client.phone}</div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm font-medium">Endereço:</div>
            <div className="text-sm truncate">
              {client.address.street}, {client.address.number} - {client.address.city}/{client.address.state}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border">
          <Button variant="outline" asChild className="w-full gap-2">
            <Link to={`/orders/new?clientId=${client.id}`}>
              <ClipboardList className="h-4 w-4" />
              Nova Ordem de Serviço
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
