
import { supabase } from '@/lib/supabase';
import { ServiceOrder, OrderStatus, OrderHistoryItem } from '@/types';
import { getClientById } from './clientService';

export async function getOrders(status?: OrderStatus, clientId?: string) {
  let query = supabase
    .from('orders')
    .select('*');
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (clientId) {
    query = query.eq('clientId', clientId);
  }
  
  const { data, error } = await query.order('createdAt', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  const { data: historyData, error: historyError } = await supabase
    .from('orderHistory')
    .select('*')
    .in('orderId', data.map(order => order.id));
  
  if (historyError) {
    console.error('Error fetching order history:', historyError);
    throw historyError;
  }
  
  const clientIds = [...new Set(data.map(order => order.clientId))];
  const clients = await Promise.all(
    clientIds.map(id => getClientById(id))
  );
  
  const clientMap = clients.reduce((map, client) => {
    if (client) map[client.id] = client;
    return map;
  }, {} as Record<string, any>);
  
  const historyByOrder = historyData ? historyData.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = [];
    }
    acc[item.orderId].push({
      id: item.id,
      orderId: item.orderId,
      status: item.status as OrderStatus,
      description: item.description,
      timestamp: item.timestamp
    });
    return acc;
  }, {} as Record<string, OrderHistoryItem[]>) : {};
  
  return data.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    clientId: order.clientId,
    client: clientMap[order.clientId],
    description: order.description,
    status: order.status as OrderStatus,
    openDate: order.openDate,
    expectedCompletionDate: order.expectedCompletionDate,
    completionDate: order.completionDate || undefined,
    observations: order.observations || undefined,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    history: historyByOrder[order.id] || []
  }));
}

export async function getOrderById(id: string): Promise<ServiceOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
  
  if (!data) return null;
  
  const { data: historyData, error: historyError } = await supabase
    .from('orderHistory')
    .select('*')
    .eq('orderId', id)
    .order('timestamp', { ascending: true });
  
  if (historyError) {
    console.error('Error fetching order history:', historyError);
    throw historyError;
  }
  
  const client = await getClientById(data.clientId);
  
  return {
    id: data.id,
    orderNumber: data.orderNumber,
    clientId: data.clientId,
    client: client || undefined,
    description: data.description,
    status: data.status as OrderStatus,
    openDate: data.openDate,
    expectedCompletionDate: data.expectedCompletionDate,
    completionDate: data.completionDate || undefined,
    observations: data.observations || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    history: historyData.map(item => ({
      id: item.id,
      orderId: item.orderId,
      status: item.status as OrderStatus,
      description: item.description,
      timestamp: item.timestamp
    }))
  };
}

export async function createOrder(order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt' | 'history'>) {
  const now = new Date().toISOString();
  const { client, ...orderData } = order;
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      createdAt: now,
      updatedAt: now
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  const historyItem = {
    orderId: data.id,
    status: order.status,
    description: 'Ordem de serviço criada',
    timestamp: now
  };
  
  const { error: historyError } = await supabase
    .from('orderHistory')
    .insert(historyItem);
  
  if (historyError) {
    console.error('Error creating order history:', historyError);
    throw historyError;
  }
  
  return data.id;
}

export async function updateOrder(
  id: string, 
  order: Partial<Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt' | 'history'>>,
  historyDescription?: string
) {
  const now = new Date().toISOString();
  const { client, ...orderData } = order;
  
  const { error } = await supabase
    .from('orders')
    .update({
      ...orderData,
      updatedAt: now
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }
  
  if (order.status || historyDescription) {
    const historyItem = {
      orderId: id,
      status: order.status || (await getOrderById(id))?.status || 'open',
      description: historyDescription || 'Status atualizado',
      timestamp: now
    };
    
    const { error: historyError } = await supabase
      .from('orderHistory')
      .insert(historyItem);
    
    if (historyError) {
      console.error('Error creating order history:', historyError);
      throw historyError;
    }
  }
  
  return true;
}

export async function deleteOrder(id: string) {
  const { error: historyError } = await supabase
    .from('orderHistory')
    .delete()
    .eq('orderId', id);
  
  if (historyError) {
    console.error('Error deleting order history:', historyError);
    throw historyError;
  }
  
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
  
  return true;
}

export async function generateOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .like('orderNumber', `${currentYear}-%`);
  
  if (error) {
    console.error('Error getting order count:', error);
    throw error;
  }
  
  const orderCount = (count || 0) + 1;
  const sequentialNumber = orderCount.toString().padStart(3, '0');
  return `${currentYear}-${sequentialNumber}`;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  description: string
) {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      updatedAt: now,
      ...(status === 'completed' ? { completionDate: now } : {})
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  
  const historyItem = {
    orderId: id,
    status,
    description,
    timestamp: now
  };
  
  const { error: historyError } = await supabase
    .from('orderHistory')
    .insert(historyItem);
  
  if (historyError) {
    console.error('Error creating order history:', historyError);
    throw historyError;
  }
  
  return true;
}
