
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/SearchBar';
import { OrderCard } from '@/components/ui/OrderCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, ClipboardList } from 'lucide-react';
import { OrderStatus } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, deleteOrder } from '@/services/orderService';
import { useToast } from '@/components/ui/use-toast';

const OrderList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', statusFilter, searchQuery],
    queryFn: () => getOrders(statusFilter !== 'all' ? statusFilter as OrderStatus : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Ordem excluída',
        description: 'A ordem de serviço foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir ordem',
        description: error.message || 'Ocorreu um erro ao excluir a ordem de serviço.',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = (query: string) => {
    if (query) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('search', query);
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('search');
        return newParams;
      });
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.client?.fullName && order.client.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : orders;

  // Update component when URL search parameters change
  useEffect(() => {
    const query = searchParams.get('search');
    if (query && query !== searchQuery) {
      // Only update if the URL parameter is different from current state
      // to avoid infinite loops
      handleSearch(query);
    }
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          </div>
          <Button asChild>
            <Link to="/orders/new" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Ordem
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar ordens..." 
          />
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Status:</span>
            <Select 
              value={statusFilter} 
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberta</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="canceled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando ordens de serviço...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={() => handleDelete(order.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Nenhuma ordem de serviço encontrada para a busca realizada.'
                : statusFilter !== 'all'
                  ? `Nenhuma ordem de serviço com status "${statusFilter}" encontrada.`
                  : 'Nenhuma ordem de serviço cadastrada.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderList;
