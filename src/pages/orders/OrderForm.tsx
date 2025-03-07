
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getClientById, getClients } from '@/services/clientService';
import { createOrder, getOrderById, updateOrder, generateOrderNumber } from '@/services/orderService';
import { OrderStatus } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OrderForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<{
    orderNumber: string;
    clientId: string;
    description: string;
    status: OrderStatus;
    openDate: string;
    expectedCompletionDate: string;
    completionDate?: string;
    observations?: string;
  }>({
    orderNumber: '',
    clientId: clientId || '',
    description: '',
    status: 'open',
    openDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    expectedCompletionDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    observations: '',
  });

  const [errors, setErrors] = useState<{
    orderNumber?: string;
    clientId?: string;
    description?: string;
    openDate?: string;
    expectedCompletionDate?: string;
  }>({});

  // Fetch order data if in edit mode
  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: isEditMode,
  });

  // Fetch clients for dropdown
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      return getClients();
    },
  });

  // Prefetch client data if clientId is provided
  const { data: selectedClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientById(clientId!),
    enabled: !!clientId,
  });

  // Generate order number when component mounts in create mode
  const { data: orderNumber, isLoading: isGeneratingOrderNumber } = useQuery({
    queryKey: ['generateOrderNumber'],
    queryFn: generateOrderNumber,
    enabled: !isEditMode && !formData.orderNumber,
  });

  // Set form data when order data is loaded
  useEffect(() => {
    if (orderData) {
      setFormData({
        orderNumber: orderData.orderNumber,
        clientId: orderData.clientId,
        description: orderData.description,
        status: orderData.status,
        openDate: orderData.openDate.substring(0, 16),
        expectedCompletionDate: orderData.expectedCompletionDate.substring(0, 16),
        completionDate: orderData.completionDate ? orderData.completionDate.substring(0, 16) : undefined,
        observations: orderData.observations || '',
      });
    }
  }, [orderData]);

  // Set order number when generated
  useEffect(() => {
    if (orderNumber && !isEditMode && !formData.orderNumber) {
      setFormData(prev => ({
        ...prev,
        orderNumber,
      }));
    }
  }, [orderNumber, isEditMode, formData.orderNumber]);

  // Create or update order mutation
  const mutation = useMutation({
    mutationFn: async (orderData: typeof formData) => {
      if (isEditMode) {
        return updateOrder(id!, orderData);
      } else {
        return createOrder(orderData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clientOrders'] });
      toast({
        title: isEditMode ? 'Ordem atualizada!' : 'Ordem criada!',
        description: isEditMode
          ? 'A ordem de serviço foi atualizada com sucesso.'
          : 'A ordem de serviço foi criada com sucesso.',
      });
      navigate('/orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro!',
        description: `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'criar'} a ordem de serviço. ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      orderNumber: !formData.orderNumber ? 'Número da ordem é obrigatório' : undefined,
      clientId: !formData.clientId ? 'Cliente é obrigatório' : undefined,
      description: !formData.description ? 'Descrição é obrigatória' : undefined,
      openDate: !formData.openDate ? 'Data de abertura é obrigatória' : undefined,
      expectedCompletionDate: !formData.expectedCompletionDate ? 'Data prevista de conclusão é obrigatória' : undefined,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Formulário inválido',
        description: 'Por favor, corrija os erros no formulário antes de enviar.',
        variant: 'destructive',
      });
      return;
    }
    
    mutation.mutate(formData);
  };

  if ((isLoadingOrder && isEditMode) || isGeneratingOrderNumber) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Carregando...</p>
        </div>
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
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h1>
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? `Editando OS #${formData.orderNumber}` : 'Informações da Ordem de Serviço'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Número da OS</Label>
                  <Input
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    readOnly={isEditMode} // Cannot change order number in edit mode
                    className={errors.orderNumber ? 'border-red-500' : ''}
                  />
                  {errors.orderNumber && (
                    <p className="text-sm text-red-500">{errors.orderNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => handleSelectChange('clientId', value)}
                    disabled={isLoadingClients}
                  >
                    <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.fullName} ({client.document})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId && (
                    <p className="text-sm text-red-500">{errors.clientId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openDate">Data de Abertura</Label>
                  <Input
                    id="openDate"
                    name="openDate"
                    type="datetime-local"
                    value={formData.openDate}
                    onChange={handleInputChange}
                    className={errors.openDate ? 'border-red-500' : ''}
                  />
                  {errors.openDate && (
                    <p className="text-sm text-red-500">{errors.openDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCompletionDate">Data Prevista de Conclusão</Label>
                  <Input
                    id="expectedCompletionDate"
                    name="expectedCompletionDate"
                    type="datetime-local"
                    value={formData.expectedCompletionDate}
                    onChange={handleInputChange}
                    className={errors.expectedCompletionDate ? 'border-red-500' : ''}
                  />
                  {errors.expectedCompletionDate && (
                    <p className="text-sm text-red-500">{errors.expectedCompletionDate}</p>
                  )}
                </div>

                {isEditMode && (
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">Data de Conclusão</Label>
                    <Input
                      id="completionDate"
                      name="completionDate"
                      type="datetime-local"
                      value={formData.completionDate || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {isEditMode && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value as OrderStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberta</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="canceled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Serviço</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={formData.observations || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Observações adicionais sobre o serviço (opcional)"
                />
              </div>

              {selectedClient && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Cliente selecionado</AlertTitle>
                  <AlertDescription>
                    {selectedClient.fullName} - {selectedClient.document}
                    <br />
                    {selectedClient.email} - {selectedClient.phone}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {mutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OrderForm;
