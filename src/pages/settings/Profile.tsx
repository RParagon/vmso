import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, updateProfile, uploadAvatar } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Usando camelCase para que updateProfile receba os valores esperados
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || ''
  });

  // Atualiza o formulário se o usuário for alterado
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive'
      });
      return;
    }
    try {
      setIsLoading(true);
      await uploadAvatar(file);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a foto de perfil.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Perfil</h1>
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.fullName?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                        Alterar foto
                      </div>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isLoading}
                      />
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
