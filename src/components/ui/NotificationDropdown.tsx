import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'deadline_reminder':
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'system_announcement':
        return <div className="h-2 w-2 rounded-full bg-purple-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Marcar todas como lidas
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => clearAll()}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Limpar todas
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex flex-col p-3 hover:bg-accent transition-colors",
                    !notification.read && "bg-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 self-end">
                    {formatNotificationDate(notification.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
              <p className="text-sm font-medium">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground mt-1">
                Você não tem notificações no momento.
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};