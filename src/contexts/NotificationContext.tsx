import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useUser } from './UserContext';
import { useUserSettings } from './UserSettingsContext';

type NotificationType = 'order_update' | 'deadline_reminder' | 'system_announcement';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUser();
  const { settings } = useUserSettings();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Load initial notifications
    loadNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newNotification = payload.new as Notification;
        if (settings.notifications[getNotificationPreferenceKey(newNotification.type)]) {
          setNotifications(prev => [newNotification, ...prev]);
          showNotificationToast(newNotification);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const updatedNotification = payload.new as Notification;
        if (settings.notifications[getNotificationPreferenceKey(updatedNotification.type)]) {
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === updatedNotification.id ? updatedNotification : notification
            )
          );
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const deletedNotification = payload.old as Notification;
        setNotifications(prev =>
          prev.filter(notification => notification.id !== deletedNotification.id)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, settings.notifications]);
  
  // Reload notifications when notification preferences change
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [settings.notifications, user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter notifications based on user preferences
      const filteredNotifications = (data || []).filter(notification => 
        settings.notifications[getNotificationPreferenceKey(notification.type)]
      );
      
      setNotifications(filteredNotifications);
    } catch (error: any) {
      console.error('Error loading notifications:', error.message);
    }
  };

  const getNotificationPreferenceKey = (type: NotificationType): keyof typeof settings.notifications => {
    switch (type) {
      case 'order_update':
        return 'orderUpdates';
      case 'deadline_reminder':
        return 'deadlineReminders';
      case 'system_announcement':
        return 'systemAnnouncements';
      default:
        return 'systemAnnouncements';
    }
  };

  const showNotificationToast = (notification: Notification) => {
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000, // Show for 5 seconds
    });
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a notificação como lida.',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas as notificações como lidas.',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a notificação.',
        variant: 'destructive',
      });
    }
  };

  const clearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram excluídas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir as notificações.',
        variant: 'destructive',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}