
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/SearchBar';
import { ClientCard } from '@/components/ui/ClientCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Users } from 'lucide-react';
import { Client } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, deleteClient } from '@/services/clientService';
import { useToast } from '@/components/ui/use-toast';

const ClientList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [searchField, setSearchField] = useState('name');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchQuery, searchField],
    queryFn: () => getClients(searchQuery),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message || 'Ocorreu um erro ao excluir o cliente.',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = (query: string) => {
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id);
    }
  };

  const filterClientsByField = (client: Client, query: string) => {
    const normalizedQuery = query.toLowerCase();
    switch (searchField) {
      case 'name':
        return client.fullName.toLowerCase().includes(normalizedQuery);
      case 'email':
        return client.email.toLowerCase().includes(normalizedQuery);
      case 'document':
        return client.document.toLowerCase().includes(normalizedQuery);
      case 'phone':
        return client.phone.toLowerCase().includes(normalizedQuery);
      default:
        return client.fullName.toLowerCase().includes(normalizedQuery);
    }
  };

  const filteredClients = searchQuery 
    ? clients.filter(client => filterClientsByField(client, searchQuery))
    : clients;

  useEffect(() => {
    // Update search bar when URL parameters change
    const query = searchParams.get('search');
    if (query) {
      handleSearch(query);
    }
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          </div>
          <Button asChild>
            <Link to="/clients/new" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar clientes..." 
          />
          <Select
            value={searchField}
            onValueChange={setSearchField}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Buscar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="document">CPF/CNPJ</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={() => handleDelete(client.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Nenhum cliente encontrado para a busca realizada.'
                : 'Nenhum cliente cadastrado.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ClientList;
