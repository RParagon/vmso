-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- Profiles table (snake_case)
--------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Coluna adicionada para controle de criação
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'user', 'technician')) DEFAULT 'user',
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--------------------------------------------------
-- User settings table (snake_case)
--------------------------------------------------
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

--------------------------------------------------
-- Habilita RLS para profiles e user_settings
--------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Políticas de RLS para user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

--------------------------------------------------
-- Clients table (mantém camelCase conforme o código)
--------------------------------------------------
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fullName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  document TEXT NOT NULL, -- CPF or CNPJ
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipCode TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para buscas rápidas em clients
CREATE INDEX idx_clients_fullname ON clients(fullName);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_document ON clients(document);
CREATE INDEX idx_clients_phone ON clients(phone);

--------------------------------------------------
-- Orders table (mantém camelCase)
--------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orderNumber TEXT NOT NULL UNIQUE,
  clientId UUID NOT NULL REFERENCES clients(id),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'canceled')),
  openDate TIMESTAMP WITH TIME ZONE NOT NULL,
  expectedCompletionDate TIMESTAMP WITH TIME ZONE NOT NULL,
  completionDate TIMESTAMP WITH TIME ZONE,
  observations TEXT,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para buscas rápidas em orders
CREATE INDEX idx_orders_clientid ON orders(clientId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_dates ON orders(openDate, expectedCompletionDate);

--------------------------------------------------
-- OrderHistory table (usando aspas para preservar camelCase)
--------------------------------------------------
CREATE TABLE "orderHistory" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orderId UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'canceled')),
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para busca rápida em orderHistory
CREATE INDEX idx_orderhistory_orderid ON "orderHistory"(orderId);

--------------------------------------------------
-- Notifications table (snake_case)
--------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('order_update', 'deadline_reminder', 'system_announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data JSONB
);

-- Índice para buscas rápidas em notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

--------------------------------------------------
-- Habilita RLS para clients, orders, orderHistory e notifications
--------------------------------------------------
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orderHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para clients
CREATE POLICY "Allow all operations for authenticated users on clients" 
  ON clients FOR ALL 
  TO authenticated
  USING (true);

-- Políticas de RLS para orders
CREATE POLICY "Allow all operations for authenticated users on orders" 
  ON orders FOR ALL 
  TO authenticated
  USING (true);

-- Políticas de RLS para orderHistory
CREATE POLICY "Allow all operations for authenticated users on orderHistory" 
  ON "orderHistory" FOR ALL 
  TO authenticated
  USING (true);

-- Políticas de RLS para notifications
CREATE POLICY "Allow all operations for authenticated users on notifications" 
  ON notifications FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

--------------------------------------------------
-- Função e Triggers para atualização do campo updatedAt
--------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
