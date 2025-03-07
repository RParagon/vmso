
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, User, MapPin, Mail, Phone, FileText, ClipboardList } from 'lucide-react';
import { OrderCard } from '@/components/ui/OrderCard';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientById, deleteClient } from '@/services/clientService';
import { getOrders } from '@/services/orderService';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });

  const { data: clientOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['clientOrders', id],
    queryFn: () => getOrders(undefined, id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      });
      navigate('/clients');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message || 'Ocorreu um erro ao excluir o cliente.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id!);
    }
  };

  if (isLoadingClient) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
          <h2 className="text-2xl font-bold">Cliente não encontrado</h2>
          <p className="text-muted-foreground">O cliente que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/clients">Voltar para Lista de Clientes</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do Cliente</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border border-border animate-fade-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{client.fullName}</CardTitle>
                    <CardDescription>{client.document}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/clients/edit/${client.id}`} className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDelete}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">CPF/CNPJ</p>
                      <p className="text-sm text-muted-foreground">{client.document}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Endereço</p>
                      <p className="text-sm text-muted-foreground">
                        {client.address.street}, {client.address.number}
                        {client.address.complement ? `, ${client.address.complement}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.address.neighborhood}, {client.address.city} - {client.address.state}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CEP: {client.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Ordens de Serviço</h2>
                <Button asChild>
                  <Link to={`/orders/new?clientId=${client.id}`} className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Nova Ordem
                  </Link>
                </Button>
              </div>
              {isLoadingOrders ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Carregando ordens de serviço...</p>
                  </CardContent>
                </Card>
              ) : clientOrders.length > 0 ? (
                <div className="space-y-4">
                  {clientOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Nenhuma ordem de serviço</h3>
                    <p className="text-muted-foreground mb-4">
                      Este cliente ainda não possui nenhuma ordem de serviço.
                    </p>
                    <Button asChild>
                      <Link to={`/orders/new?clientId=${client.id}`}>
                        Criar Ordem de Serviço
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <Card className="border border-border sticky top-20">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full justify-start">
                  <Link to={`/orders/new?clientId=${client.id}`} className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Nova Ordem de Serviço
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to={`/clients/edit/${client.id}`} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Editar Cliente
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Cliente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientDetail;
