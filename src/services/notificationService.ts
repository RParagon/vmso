import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'order_update' | 'deadline_reminder' | 'system_announcement';

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  data?: Record<string, any>;
}

/**
 * Service for managing notifications in the system
 */
export const notificationService = {
  /**
   * Create a new notification
   */
  async createNotification(data: NotificationData) {
    try {
      const { error } = await supabase.from('notifications').insert({
        id: uuidv4(),
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        created_at: new Date().toISOString(),
        data: data.data || null
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error creating notification:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create an order update notification
   */
  async createOrderUpdateNotification({
    userId,
    orderNumber,
    status,
    clientName
  }: {
    userId: string;
    orderNumber: string;
    status: string;
    clientName: string;
  }) {
    const statusMap: Record<string, string> = {
      open: 'Aberta',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      canceled: 'Cancelada'
    };

    const title = `Atualização de Ordem de Serviço #${orderNumber}`;
    const message = `A ordem de serviço #${orderNumber} para ${clientName} foi atualizada para ${statusMap[status] || status}.`;

    return this.createNotification({
      userId,
      type: 'order_update',
      title,
      message,
      data: { orderNumber, status }
    });
  },

  /**
   * Create a deadline reminder notification
   */
  async createDeadlineReminderNotification({
    userId,
    orderNumber,
    clientName,
    daysRemaining,
    expectedDate
  }: {
    userId: string;
    orderNumber: string;
    clientName: string;
    daysRemaining: number;
    expectedDate: string;
  }) {
    const formattedDate = new Date(expectedDate).toLocaleDateString('pt-BR');
    const title = `Lembrete de Prazo: OS #${orderNumber}`;
    let message = '';
    
    if (daysRemaining === 0) {
      message = `A ordem de serviço #${orderNumber} para ${clientName} vence hoje (${formattedDate})!`;
    } else if (daysRemaining === 1) {
      message = `A ordem de serviço #${orderNumber} para ${clientName} vence amanhã (${formattedDate})!`;
    } else if (daysRemaining < 0) {
      message = `A ordem de serviço #${orderNumber} para ${clientName} está atrasada! Deveria ter sido concluída em ${formattedDate}.`;
    } else {
      message = `A ordem de serviço #${orderNumber} para ${clientName} vence em ${daysRemaining} dias (${formattedDate}).`;
    }

    return this.createNotification({
      userId,
      type: 'deadline_reminder',
      title,
      message,
      data: { orderNumber, daysRemaining, expectedDate }
    });
  },

  /**
   * Create a system announcement notification
   */
  async createSystemAnnouncementNotification({
    userId,
    title,
    message,
    data
  }: {
    userId: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    return this.createNotification({
      userId,
      type: 'system_announcement',
      title,
      message,
      data
    });
  },

  /**
   * Create a welcome notification for a new user
   */
  async createWelcomeNotification(userId: string) {
    try {
      // Create a welcome system announcement notification
      await this.createSystemAnnouncementNotification({
        userId,
        title: 'Bem-vindo ao Sistema OS',
        message: 'Bem-vindo ao Sistema de Ordens de Serviço. Você receberá notificações sobre atualizações de ordens de serviço, lembretes de prazos e anúncios do sistema.'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error creating welcome notification:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check for approaching deadlines and create notifications
   */
  async checkDeadlineReminders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'No authenticated user' };

      // Get all open and in-progress orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, clients(fullName)')
        .in('status', ['open', 'in_progress'])
        .not('expectedCompletionDate', 'is', null);

      if (error) throw error;

      const now = new Date();
      const notificationsCreated = [];

      // Check each order for approaching deadlines
      for (const order of orders || []) {
        const expectedDate = new Date(order.expectedCompletionDate);
        const daysUntilDeadline = Math.ceil(
          (expectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Create notifications for deadlines that are approaching or passed
        if (daysUntilDeadline <= 2) {
          await this.createDeadlineReminderNotification({
            userId: user.id,
            orderNumber: order.orderNumber,
            clientName: order.clients?.fullName || 'Cliente',
            daysRemaining: daysUntilDeadline,
            expectedDate: order.expectedCompletionDate
          });
          notificationsCreated.push(order.orderNumber);
        }
      }

      return { 
        success: true, 
        notificationsCreated,
        count: notificationsCreated.length
      };
    } catch (error: any) {
      console.error('Error checking deadline reminders:', error.message);
      return { success: false, error: error.message };
    }
  }
};