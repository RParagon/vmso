
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { OrderCard } from '@/components/ui/OrderCard';
import { ClientCard } from '@/components/ui/ClientCard';
import { useQuery } from '@tanstack/react-query';
import { getClients } from '@/services/clientService';
import { getOrders } from '@/services/orderService';
import { OrderStatus } from '@/types';

const Index = () => {
  // Fetch clients data
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients(),
  });

  // Fetch orders data
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
  });

  // Statistics
  const totalClients = clients.length;
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => (order.status === 'open' || order.status === 'in_progress')).length;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/clients/new">Novo Cliente</Link>
            </Button>
            <Button asChild>
              <Link to="/orders/new">Nova Ordem de Serviço</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingClients ? "..." : totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {isLoadingClients ? "Carregando..." : (totalClients > 0 ? `${totalClients} cliente(s) cadastrado(s)` : 'Nenhum cliente cadastrado')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Ordens
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingOrders ? "..." : totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {isLoadingOrders ? "Carregando..." : (totalOrders > 0 ? `${totalOrders} ordem(ns) cadastrada(s)` : 'Nenhuma ordem cadastrada')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Ordens Concluídas
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingOrders ? "..." : completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {isLoadingOrders 
                  ? "Carregando..." 
                  : (completedOrders > 0 
                    ? `${Math.round((completedOrders / totalOrders) * 100)}% do total` 
                    : 'Nenhuma ordem concluída')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Ordens Pendentes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingOrders ? "..." : pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                {isLoadingOrders
                  ? "Carregando..."
                  : (pendingOrders > 0 
                    ? `${Math.round((pendingOrders / totalOrders) * 100)}% do total` 
                    : 'Nenhuma ordem pendente')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Clientes Recentes</h2>
              <Button variant="outline" asChild>
                <Link to="/clients">Ver Todos</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {isLoadingClients ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Carregando clientes...</p>
                  </CardContent>
                </Card>
              ) : clients.length > 0 ? (
                clients.slice(0, 2).map(client => (
                  <ClientCard key={client.id} client={client} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum cliente cadastrado
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Ordens Recentes</h2>
              <Button variant="outline" asChild>
                <Link to="/orders">Ver Todas</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {isLoadingOrders ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Carregando ordens...</p>
                  </CardContent>
                </Card>
              ) : orders.length > 0 ? (
                orders.slice(0, 2).map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhuma ordem de serviço cadastrada
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
