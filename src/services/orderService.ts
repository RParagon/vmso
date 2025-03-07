
import { supabase } from '@/lib/supabase';
import { ServiceOrder, OrderStatus, OrderHistoryItem } from '@/types';
import { getClientById } from './clientService';
import { notificationService } from './notificationService';

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
  
  // Create notification for new order
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await notificationService.createOrderUpdateNotification({
        userId: user.id,
        orderNumber: order.orderNumber,
        status: order.status,
        clientName: client?.name || 'Cliente'
      });
      
      // If the order has an expected completion date, check if it's soon
      if (order.expectedCompletionDate) {
        const daysUntilDeadline = Math.ceil(
          (new Date(order.expectedCompletionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDeadline <= 2) {
          await notificationService.createDeadlineReminderNotification({
            userId: user.id,
            orderNumber: order.orderNumber,
            clientName: client?.name || 'Cliente',
            daysRemaining: daysUntilDeadline,
            expectedDate: order.expectedCompletionDate
          });
        }
      }
    }
  } catch (notificationError) {
    console.error('Error creating notification:', notificationError);
    // Don't throw the error as it's not critical to the order creation process
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
  
  // Get the current order before updating
  const currentOrder = await getOrderById(id);
  if (!currentOrder) {
    throw new Error('Order not found');
  }
  
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
  
  let statusChanged = false;
  let newStatus = currentOrder.status;
  
  if (order.status || historyDescription) {
    newStatus = order.status || currentOrder.status;
    statusChanged = order.status !== undefined && order.status !== currentOrder.status;
    
    const historyItem = {
      orderId: id,
      status: newStatus,
      description: historyDescription || (statusChanged ? 'Status atualizado' : 'Ordem atualizada'),
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
  
  // Create notification for order update
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // If status changed, create a status update notification
      if (statusChanged) {
        await notificationService.createOrderUpdateNotification({
          userId: user.id,
          orderNumber: currentOrder.orderNumber,
          status: newStatus,
          clientName: currentOrder.client?.name || 'Cliente'
        });
      }
      
      // Check for deadline reminders if expected completion date was updated or is approaching
      const expectedDate = order.expectedCompletionDate || currentOrder.expectedCompletionDate;
      if (expectedDate) {
        const daysUntilDeadline = Math.ceil(
          (new Date(expectedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        // Create deadline reminder if the deadline is within 2 days and order is not completed
        if (daysUntilDeadline <= 2 && newStatus !== 'completed') {
          await notificationService.createDeadlineReminderNotification({
            userId: user.id,
            orderNumber: currentOrder.orderNumber,
            clientName: currentOrder.client?.name || 'Cliente',
            daysRemaining: daysUntilDeadline,
            expectedDate
          });
        }
      }
    }
  } catch (notificationError) {
    console.error('Error creating notification:', notificationError);
    // Don't throw the error as it's not critical to the order update process
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
  
  // Get the order and client details before updating
  const order = await getOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }

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

  // Create notification for order status update
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await notificationService.createOrderUpdateNotification({
        userId: user.id,
        orderNumber: order.orderNumber,
        status,
        clientName: order.client?.name || 'Cliente'
      });

      // If the order is approaching its deadline (2 days or less)
      if (order.expectedCompletionDate) {
        const daysUntilDeadline = Math.ceil(
          (new Date(order.expectedCompletionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDeadline <= 2 && status !== 'completed') {
          await notificationService.createDeadlineReminderNotification({
            userId: user.id,
            orderNumber: order.orderNumber,
            clientName: order.client?.name || 'Cliente',
            daysRemaining: daysUntilDeadline,
            expectedDate: order.expectedCompletionDate
          });
        }
      }
    }
  } catch (notificationError) {
    console.error('Error creating notification:', notificationError);
    // Don't throw the error as it's not critical to the order update process
  }
  
  return true;
}
