
import { supabase } from '@/lib/supabase';
import { Client, Address } from '@/types';

export async function getClients(search?: string) {
  let query = supabase
    .from('clients')
    .select('*');
  
  if (search) {
    query = query.or(`fullName.ilike.%${search}%,email.ilike.%${search}%,document.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
  
  // Transform data to match our Client interface
  return data.map(client => ({
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    phone: client.phone,
    document: client.document,
    address: {
      street: client.street,
      number: client.number,
      complement: client.complement || undefined,
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode
    },
    createdAt: client.createdAt,
    updatedAt: client.updatedAt
  }));
}

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Transform data to match our Client interface
  return {
    id: data.id,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    document: data.document,
    address: {
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  
  // Destructure to match our database schema
  const { address, ...clientData } = client;
  
  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...clientData,
      ...address,
      createdAt: now,
      updatedAt: now
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }
  
  return data.id;
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) {
  const now = new Date().toISOString();
  
  // Destructure to match our database schema
  const { address, ...clientData } = client;
  
  const updateData = {
    ...clientData,
    ...(address && address),
    updatedAt: now
  };
  
  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  
  return true;
}

export async function deleteClient(id: string) {
  // First check if there are any orders for this client
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('clientId', id);
  
  if (orders && orders.length > 0) {
    throw new Error('Cannot delete client with active orders');
  }
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
  
  return true;
}
