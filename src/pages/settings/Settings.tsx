import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { notificationService } from '@/services/notificationService';

const Settings = () => {
  const { settings, updateTheme, updateLanguage, updateNotificationPreferences, toggleCompactView } = useUserSettings();
  const { user } = useUser();

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <Button variant="outline" asChild>
            <Link to="/profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Editar Perfil
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="theme">Modo escuro</Label>
                {settings.theme === 'dark' ? (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Ativado</span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Desativado</span>
                )}
              </div>
              <Switch
                id="theme"
                checked={settings.theme === 'dark'}
                onCheckedChange={(checked) => updateTheme(checked ? 'dark' : 'light')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compactView">Modo compacto</Label>
              <Switch
                id="compactView"
                checked={settings.compactView}
                onCheckedChange={toggleCompactView}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Idioma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Idioma do sistema</Label>
              <Select value={settings.language} onValueChange={updateLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="orderUpdates">Atualizações de ordens</Label>
              <Switch
                id="orderUpdates"
                checked={settings.notifications.orderUpdates}
                onCheckedChange={(checked) =>
                  updateNotificationPreferences({ orderUpdates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="deadlineReminders">Lembretes de prazos</Label>
              <Switch
                id="deadlineReminders"
                checked={settings.notifications.deadlineReminders}
                onCheckedChange={(checked) =>
                  updateNotificationPreferences({ deadlineReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="systemAnnouncements">Anúncios do sistema</Label>
              <Switch
                id="systemAnnouncements"
                checked={settings.notifications.systemAnnouncements}
                onCheckedChange={(checked) =>
                  updateNotificationPreferences({ systemAnnouncements: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Notificações por email</Label>
              <Switch
                id="emailNotifications"
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  updateNotificationPreferences({ emailNotifications: checked })
                }
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (user) {
                    notificationService.createTestNotifications(user.id);
                  }
                }}
              >
                Testar Notificações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;