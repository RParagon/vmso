import React, { useCallback } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdvancedSearchBar } from '@/components/ui/AdvancedSearchBar';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { UserProfileDropdown } from '@/components/ui/UserProfileDropdown';

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Navbar = ({ toggleSidebar, sidebarOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extraímos o filtro e query atuais dos parâmetros da URL
  const currentFilter = searchParams.get('filter') || '';
  const currentQuery = searchParams.get('search') || '';

  const buildSearchUrl = useCallback((basePath: string, query: string, filter?: string) => {
    const params = new URLSearchParams();
    params.set('search', encodeURIComponent(query.trim()));
    if (filter) params.set('filter', filter);
    return `${basePath}?${params.toString()}`;
  }, []);

  const handleSearch = useCallback((query: string, filter?: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      // Se não houver query, limpa os parâmetros
      navigate(window.location.pathname);
      return;
    }
    // Se filter não for definido, usa o filtro atual da URL
    const effectiveFilter = filter || currentFilter;

    let targetPath = '/';
    if (effectiveFilter === 'clients' || window.location.pathname.includes('/clients')) {
      targetPath = '/clients';
    } else if (effectiveFilter === 'orders' || window.location.pathname.includes('/orders')) {
      targetPath = '/orders';
    }
    navigate(buildSearchUrl(targetPath, trimmedQuery, effectiveFilter || undefined));
  }, [buildSearchUrl, currentFilter, navigate]);

  return (
    <header className="bg-sidebar border-b border-sidebar-border h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center rounded-md hover:bg-sidebar-accent active:scale-95 transition-transform"
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AdvancedSearchBar 
          onSearch={handleSearch} 
          placeholder="Buscar..."
          filters={[
            { field: 'orders', label: 'Ordens' },
            { field: 'clients', label: 'Clientes' },
          ]}
          initialFilter={currentFilter}
          className="w-[200px] md:w-[300px]"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Navbar;
