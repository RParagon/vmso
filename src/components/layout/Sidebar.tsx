
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, ChevronRight, Users, ClipboardList, LayoutDashboard, 
  Settings, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarLink } from '@/types';

import { useUser } from '@/contexts/UserContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const links: SidebarLink[] = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Clientes', path: '/clients', icon: Users },
  { title: 'Ordens de Serviço', path: '/orders', icon: ClipboardList },
  { title: 'Configurações', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const { logout } = useUser();
  
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-sidebar/80 backdrop-blur-sm z-10 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground z-20 flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64 md:w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className={cn(
            "flex items-center gap-2 overflow-hidden transition-all duration-300",
            isOpen ? "opacity-100" : "opacity-0 md:opacity-0"
          )}>
            <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold">VM</span>
            </div>
            <h1 className="font-bold text-lg text-sidebar-foreground">Sistema OS</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path}
                  className={cn(
                    "flex items-center h-10 px-3 py-2 rounded-md transition-colors group",
                    location.pathname === link.path 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <link.icon className={cn(
                    "h-5 w-5 transition-all",
                    isOpen ? "mr-3" : "mx-auto"
                  )} />
                  <span className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                    isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:w-0"
                  )}>
                    {link.title}
                  </span>
                  {!isOpen && (
                    <div className={cn(
                      "absolute left-full ml-1 px-2 py-1 rounded bg-popover text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md text-sm hidden md:block"
                    )}>
                      {link.title}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-3 mt-auto">
          <button 
            onClick={logout}
            className={cn(
              "flex items-center w-full h-10 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              isOpen ? "" : "justify-center"
            )}
          >
            <LogOut className={cn("h-5 w-5", isOpen ? "mr-3" : "")} />
            <span className={cn(
              "transition-all duration-300",
              isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}>
              Sair
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
