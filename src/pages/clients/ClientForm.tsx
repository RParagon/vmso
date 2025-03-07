
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { createClient, getClientById, updateClient } from '@/services/clientService';

// Form schema using zod
const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  document: z.string().min(11, { message: 'CPF/CNPJ inválido' }),
  address: z.object({
    street: z.string().min(3, { message: 'Rua é obrigatória' }),
    number: z.string().min(1, { message: 'Número é obrigatório' }),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, { message: 'Bairro é obrigatório' }),
    city: z.string().min(2, { message: 'Cidade é obrigatória' }),
    state: z.string().min(2, { message: 'Estado é obrigatório' }),
    zipCode: z.string().min(8, { message: 'CEP inválido' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      document: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
  });

  // Load client data if in edit mode
  useEffect(() => {
    async function loadClient() {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const client = await getClientById(id);
          
          if (client) {
            form.reset({
              fullName: client.fullName,
              email: client.email,
              phone: client.phone,
              document: client.document,
              address: {
                street: client.address.street,
                number: client.address.number,
                complement: client.address.complement || '',
                neighborhood: client.address.neighborhood,
                city: client.address.city,
                state: client.address.state,
                zipCode: client.address.zipCode,
              },
            });
          }
        } catch (error) {
          console.error('Error loading client:', error);
          toast.error('Erro ao carregar cliente');
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadClient();
  }, [id, isEditMode, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        await updateClient(id, values);
      } else {
        await createClient(values);
      }
      
      toast.success(
        isEditMode ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!'
      );
      
      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
          </div>
        </div>
        
        <Card className="animate-fade-in border border-border">
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Editar informações do cliente' : 'Preencha os dados do cliente'}
            </CardTitle>
            <CardDescription>
              Os campos marcados com * são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ *</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border-t pt-4 border-border">
                  <h3 className="text-lg font-medium mb-4">Endereço</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua/Avenida *</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua/Avenida" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número *</FormLabel>
                            <FormControl>
                              <Input placeholder="Número" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address.complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Complemento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address.neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP *</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/clients')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : isEditMode ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClientForm;
