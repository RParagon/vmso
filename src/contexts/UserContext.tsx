import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'technician';
  phone?: string;
  lastLogin?: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper para validar datas
const parseDate = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : dateStr;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar ou criar o perfil do usuário
  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Tenta buscar o perfil do usuário
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        // Se não existir, cria um perfil padrão
        if (!data) {
          const defaultProfile = {
            id: session.user.id,
            full_name: '',
            avatar_url: null,
            role: 'user',
            phone: null,
          };
          const { data: inserted, error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile)
            .select()
            .single();
          if (insertError) throw insertError;
          data = inserted;
        } else if (error) {
          throw error;
        }

        // Mapeia os dados do banco (snake_case) para o objeto do usuário (camelCase)
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: data.full_name || '',
          avatar: data.avatar_url,
          role: data.role || 'user',
          phone: data.phone,
          lastLogin: parseDate(session.user.last_sign_in_at),
        });
      }
    } catch (error: any) {
      console.error('Error fetching/creating user:', error.message);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar o perfil do usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser();
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Atualiza o perfil do usuário
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Nenhum usuário autenticado');
      // Mapeia os campos do frontend para os do banco (snake_case)
      const updates = {
        id: user.id,
        full_name: data.fullName !== undefined ? data.fullName : user.fullName,
        phone: data.phone !== undefined ? data.phone : user.phone,
        role: user.role, // Não permitimos alteração de role via frontend
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)
        .select()
        .single();

      if (error) throw error;

      setUser(prev => (prev ? { ...prev, ...data } : null));
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Faz upload do avatar e atualiza o campo avatar_url
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error('Nenhum usuário autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setUser(prev => (prev ? { ...prev, avatar: avatarUrl } : null));
      toast({
        title: 'Avatar atualizado',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
      return avatarUrl;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar avatar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer logout',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        updateProfile,
        uploadAvatar,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
