import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Theme = 'light' | 'dark';
type Language = 'pt-BR' | 'en';

interface NotificationPreferences {
  orderUpdates: boolean;
  deadlineReminders: boolean;
  systemAnnouncements: boolean;
  emailNotifications: boolean;
}

export interface UserSettings {
  theme: Theme;
  language: Language;
  notifications: NotificationPreferences;
  searchHistory: string[];
  compactView: boolean;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  toggleCompactView: () => void;
  addSearchTerm: (term: string) => void;
  clearSearchHistory: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'pt-BR',
  notifications: {
    orderUpdates: true,
    deadlineReminders: true,
    systemAnnouncements: true,
    emailNotifications: true,
  },
  searchHistory: [],
  compactView: false,
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    loadUserSettings();
  }, []);

  // Atualiza a classe do documento para dark/light mode
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);
  }, [settings.theme]);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Se nenhum registro for retornado, criamos as configurações padrão
        if (error.code === 'PGRST116') { // Nenhuma linha retornada
          await saveSettings(defaultSettings);
        } else {
          throw error;
        }
      } else if (data) {
        // Atualiza o estado com as configurações salvas (mesclando com as defaults)
        setSettings({
          ...defaultSettings,
          ...data.settings,
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use onConflict para atualizar o registro existente com base em user_id
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            settings: newSettings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data.settings);
      }
    } catch (error: any) {
      console.error('Error saving user settings:', error.message);
      throw error;
    }
  };

  const updateTheme = (theme: Theme) => {
    setSettings(prev => {
      const newSettings = { ...prev, theme };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const updateLanguage = (language: Language) => {
    setSettings(prev => {
      const newSettings = { ...prev, language };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const updateNotificationPreferences = (preferences: Partial<NotificationPreferences>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        notifications: { ...prev.notifications, ...preferences },
      };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const toggleCompactView = () => {
    setSettings(prev => {
      const newSettings = { ...prev, compactView: !prev.compactView };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const addSearchTerm = (term: string) => {
    setSettings(prev => {
      const newHistory = [term, ...prev.searchHistory.filter(t => t !== term)].slice(0, 10);
      const newSettings = { ...prev, searchHistory: newHistory };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const clearSearchHistory = () => {
    setSettings(prev => {
      const newSettings = { ...prev, searchHistory: [] };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        updateTheme,
        updateLanguage,
        updateNotificationPreferences,
        toggleCompactView,
        addSearchTerm,
        clearSearchHistory,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}
