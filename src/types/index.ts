
// Client related types
export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  document: string; // CPF or CNPJ
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Service Order related types
export type OrderStatus = 'open' | 'in_progress' | 'completed' | 'canceled';

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  client?: Client;
  description: string;
  status: OrderStatus;
  openDate: string;
  expectedCompletionDate: string;
  completionDate?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  history: OrderHistoryItem[];
}

export interface OrderHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  description: string;
  timestamp: string;
}

// UI related types
export interface SidebarLink {
  title: string;
  path: string;
  icon: React.ElementType;
}

export interface SearchParams {
  query?: string;
  field?: 'name' | 'email' | 'document' | 'phone';
  limit?: number;
  offset?: number;
}

// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'user' | 'technician'
          phone: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'technician'
          phone?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'technician'
          phone?: string | null
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          fullName: string
          email: string
          phone: string
          document: string
          street: string
          number: string
          complement: string | null
          neighborhood: string
          city: string
          state: string
          zipCode: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          fullName: string
          email: string
          phone: string
          document: string
          street: string
          number: string
          complement?: string | null
          neighborhood: string
          city: string
          state: string
          zipCode: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          fullName?: string
          email?: string
          phone?: string
          document?: string
          street?: string
          number?: string
          complement?: string | null
          neighborhood?: string
          city?: string
          state?: string
          zipCode?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      orders: {
        Row: {
          id: string
          orderNumber: string
          clientId: string
          description: string
          status: string
          openDate: string
          expectedCompletionDate: string
          completionDate: string | null
          observations: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          orderNumber: string
          clientId: string
          description: string
          status: string
          openDate: string
          expectedCompletionDate: string
          completionDate?: string | null
          observations?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          orderNumber?: string
          clientId?: string
          description?: string
          status?: string
          openDate?: string
          expectedCompletionDate?: string
          completionDate?: string | null
          observations?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      orderHistory: {
        Row: {
          id: string
          orderId: string
          status: string
          description: string
          timestamp: string
        }
        Insert: {
          id?: string
          orderId: string
          status: string
          description: string
          timestamp?: string
        }
        Update: {
          id?: string
          orderId?: string
          status?: string
          description?: string
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
