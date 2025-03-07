import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Edit, Trash2, AlertTriangle, User,
  Calendar, CalendarClock, CheckCircle, ClipboardList
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, deleteOrder, updateOrderStatus } from '@/services/orderService';
import { getClientById } from '@/services/clientService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderStatus } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: order, 
    isLoading: isLoadingOrder,
    isError: isOrderError,
    error: orderError
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
  });

  const { 
    data: client, 
    isLoading: isLoadingClient 
  } = useQuery({
    queryKey: ['client', order?.clientId],
    queryFn: () => getClientById(order!.clientId),
    enabled: !!order?.clientId,
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Ordem excluída!',
        description: 'A ordem de serviço foi excluída com sucesso.',
      });
      navigate('/orders');
    },
    onError: (error) => {
      toast({
        title: 'Erro!',
        description: `Ocorreu um erro ao excluir a ordem de serviço. ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, description }: { id: string; status: OrderStatus; description: string }) => 
      updateOrderStatus(id, status, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast({
        title: 'Status atualizado!',
        description: 'O status da ordem de serviço foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro!',
        description: `Ocorreu um erro ao atualizar o status da ordem. ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!order || newStatus === order.status) return;
    
    const descriptions = {
      open: 'Ordem de serviço aberta',
      in_progress: 'Ordem de serviço em andamento',
      completed: 'Ordem de serviço concluída',
      canceled: 'Ordem de serviço cancelada'
    };
    
    statusMutation.mutate({ 
      id: id!, 
      status: newStatus, 
      description: descriptions[newStatus] 
    });
  };

  const handleDeleteOrder = () => {
    deleteMutation.mutate(id!);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (isLoadingOrder || (order && isLoadingClient)) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Carregando informações...</p>
        </div>
      </MainLayout>
    );
  }

  if (isOrderError) {
    return (
      <MainLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar a ordem de serviço: {(orderError as Error).message}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Ordens
        </Button>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ordem de serviço não encontrada.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Ordens
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Ordem de Serviço #{order.orderNumber}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/orders/edit/${id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteOrder}>
                    {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Detalhes da Ordem</CardTitle>
                  <StatusBadge status={order.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Número da OS</h3>
                    <p className="text-lg">{order.orderNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                        disabled={statusMutation.isPending}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Alterar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Aberta</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="canceled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Data de Abertura</h3>
                      <p>{formatDate(order.openDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Previsão de Conclusão</h3>
                      <p>{formatDate(order.expectedCompletionDate)}</p>
                    </div>
                  </div>
                  {order.completionDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Data de Conclusão</h3>
                        <p>{formatDate(order.completionDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição do Serviço</h3>
                  <p className="whitespace-pre-line">{order.description}</p>
                </div>
                
                {order.observations && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
                    <p className="whitespace-pre-line">{order.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
                <CardDescription>Registro de alterações na ordem de serviço</CardDescription>
              </CardHeader>
              <CardContent>
                {order.history && order.history.length > 0 ? (
                  <div className="space-y-4">
                    {order.history.map((historyItem) => (
                      <div key={historyItem.id} className="flex items-start gap-3 pb-3 border-b border-border">
                        <StatusBadge status={historyItem.status} />
                        <div className="flex-1">
                          <p className="text-sm">{historyItem.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(historyItem.timestamp), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum histórico disponível</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{client.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{client.document}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Telefone:</span>
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Endereço</h4>
                      <p className="text-sm">
                        {client.address.street}, {client.address.number}
                        {client.address.complement && `, ${client.address.complement}`}
                      </p>
                      <p className="text-sm">
                        {client.address.neighborhood} - {client.address.city}/{client.address.state}
                      </p>
                      <p className="text-sm">{client.address.zipCode}</p>
                    </div>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/clients/${client.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        Ver Cliente
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Carregando informações do cliente...</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" onClick={() => navigate(`/orders/edit/${id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Ordem
                </Button>
                
                <Button className="w-full" variant="outline" 
                  onClick={() => navigate(`/orders/new?clientId=${order.clientId}`)}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Nova OS para este Cliente
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Ordem
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteOrder}>
                        {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetail;
