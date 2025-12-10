/*
  # Schema Inicial CRM ClimaTech
  
  Criação da estrutura completa do banco de dados para o CRM de climatização.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
  
  ## Estrutura:
  1. Extensões (uuid-ossp)
  2. Enums (Status, Tipos, Categorias)
   3. Tabelas Core (users, leads, schedules, tasks, financial, etc.) com user_id
   4. RLS (Row Level Security) estrito (Tenant Isolation)
   5. Triggers para updated_at e set_user_id
*/

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'operator');
CREATE TYPE lead_source AS ENUM ('Google', 'SEO', 'Indicação', 'Instagram', 'Telefone', 'Website', 'Outros', 'Chatbot', 'Importação');
CREATE TYPE lead_status AS ENUM ('Novo', 'Em Atendimento', 'Orçamento', 'Fechado', 'Falha', 'Inativo');
CREATE TYPE schedule_service_type AS ENUM ('Instalação', 'Manutenção', 'Diagnóstico', 'Reparo', 'Limpeza', 'Visita Técnica');
CREATE TYPE schedule_status AS ENUM ('Agendado', 'Confirmado', 'Em Andamento', 'Concluído', 'Cancelado');
CREATE TYPE task_status AS ENUM ('Pendente', 'Em Progresso', 'Concluído', 'Bloqueado', 'Arquivado');
CREATE TYPE task_priority AS ENUM ('Baixa', 'Média', 'Alta', 'Crítica');
CREATE TYPE budget_status AS ENUM ('Rascunho', 'Enviado', 'Aprovado', 'Rejeitado', 'Expirado', 'Faturado');
CREATE TYPE equipment_type AS ENUM ('Split', 'Janela', 'Portátil', 'Cassette', 'Piso Teto', 'VRF', 'Chiller', 'Multi-Split');
CREATE TYPE maintenance_frequency AS ENUM ('Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE entity_document_type AS ENUM ('CPF', 'CNPJ');

-- 3. Tabelas

-- Tabela de Perfis de Usuário (Espelho do auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    role user_role DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    company VARCHAR DEFAULT 'N/A',
    email VARCHAR,
    phone VARCHAR,
    document VARCHAR, -- CPF/CNPJ
    address VARCHAR,
    city VARCHAR,
    state VARCHAR(2),
    source lead_source DEFAULT 'Google',
    status lead_status DEFAULT 'Novo',
    value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id) -- Dono do lead
);

-- Agendamentos
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    client_name VARCHAR NOT NULL, -- Desnormalizado para facilitar, ou poderia ser FK
    lead_id UUID REFERENCES public.leads(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    service_type schedule_service_type DEFAULT 'Instalação',
    address VARCHAR,
    status schedule_status DEFAULT 'Agendado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarefas (Kanban)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    due_date DATE,
    start_time TIME,
    end_time TIME,
    collaborator_name VARCHAR, -- Simplificado para esta versão
    status task_status DEFAULT 'Pendente',
    priority task_priority DEFAULT 'Média',
    type VARCHAR DEFAULT 'Avulsa',
    quote_id UUID, -- FK opcional para orçamentos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipamentos (Manutenção)
CREATE TABLE public.equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    brand VARCHAR,
    model VARCHAR,
    serial VARCHAR,
    btu VARCHAR,
    type equipment_type DEFAULT 'Split',
    install_date DATE,
    frequency maintenance_frequency DEFAULT 'Mensal',
    next_maintenance DATE,
    qr_code_id VARCHAR UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financeiro
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    category VARCHAR DEFAULT 'Serviços',
    type transaction_type NOT NULL,
    entity entity_document_type DEFAULT 'CNPJ',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orçamentos Salvos
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR NOT NULL,
    client_name VARCHAR NOT NULL,
    total_value DECIMAL(10,2) NOT NULL,
    data JSONB NOT NULL, -- Armazena todo o objeto do orçamento para recriar o PDF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colaboradores (Equipe)
CREATE TABLE public.collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    team VARCHAR,
    phone VARCHAR,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Segurança (RLS)
-- Habilitando RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Políticas Estritas (Tenant Isolation)
-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.users USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users WITH CHECK (auth.uid() = id);

-- Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own leads" ON public.leads USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_lead_created_set_user BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Schedules
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own schedules" ON public.schedules USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_schedule_created_set_user BEFORE INSERT ON public.schedules FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks" ON public.tasks USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_task_created_set_user BEFORE INSERT ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Equipments
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own equipments" ON public.equipments USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_equipment_created_set_user BEFORE INSERT ON public.equipments FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.transactions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_transaction_created_set_user BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own quotes" ON public.quotes USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_quote_created_set_user BEFORE INSERT ON public.quotes FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Collaborators
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own collaborators" ON public.collaborators USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_collaborator_created_set_user BEFORE INSERT ON public.collaborators FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Trigger para criar perfil público ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Habilitar extensão de UUID
create extension if not exists "uuid-ossp";

-- --- TABELA DE ORÇAMENTOS (Document Store) ---
create table if not exists quotes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  quote_number text,
  client_name text,
  total_value numeric,
  data jsonb -- Armazena o JSON completo do orçamento para o PDF
);

-- --- TABELAS DE ESTOQUE ---
create table if not exists inventory_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null
);

create table if not exists inventory_suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  cnpj text,
  email text,
  phone text,
  lead_time_days integer
);

create table if not exists inventory_items (
  id uuid default uuid_generate_v4() primary key,
  sku text unique not null,
  name text not null,
  category_id uuid references inventory_categories(id),
  description text,
  unit_price numeric default 0,
  quantity integer default 0,
  min_quantity integer default 5,
  location text,
  main_supplier_id uuid references inventory_suppliers(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists inventory_movements (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references inventory_items(id),
  type text not null, -- IN, OUT, ADJUSTMENT
  quantity integer not null,
  reference_type text,
  reason text,
  user_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- --- POLICIES RLS (Permissivas para DEV) ---

-- Quotes
alter table quotes enable row level security;
drop policy if exists "Enable all for quotes" on quotes;
create policy "Enable all for quotes" on quotes for all using (true) with check (true);

-- Inventory
alter table inventory_categories enable row level security;
drop policy if exists "Enable all for inventory_categories" on inventory_categories;
create policy "Enable all for inventory_categories" on inventory_categories for all using (true) with check (true);

alter table inventory_suppliers enable row level security;
drop policy if exists "Enable all for inventory_suppliers" on inventory_suppliers;
create policy "Enable all for inventory_suppliers" on inventory_suppliers for all using (true) with check (true);

alter table inventory_items enable row level security;
drop policy if exists "Enable all for inventory_items" on inventory_items;
create policy "Enable all for inventory_items" on inventory_items for all using (true) with check (true);

alter table inventory_movements enable row level security;
drop policy if exists "Enable all for inventory_movements" on inventory_movements;
create policy "Enable all for inventory_movements" on inventory_movements for all using (true) with check (true);

-- Leads (Garantir acesso para Health Check)
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table leads enable row level security;
drop policy if exists "Enable all for leads" on leads;
create policy "Enable all for leads" on leads for all using (true) with check (true);
-- Habilitar RLS nas tabelas (caso não esteja)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Criar Políticas Permissivas (DEV MODE - Permite tudo para todos)

-- Inventory Items
DROP POLICY IF EXISTS "Enable all access for inventory_items" ON inventory_items;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE POLICY "Users can manage own inventory items" ON inventory_items
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_inv_item_created_set_user BEFORE INSERT ON inventory_items FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Inventory Categories
DROP POLICY IF EXISTS "Enable all access for inventory_categories" ON inventory_categories;
ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE POLICY "Users can read global and manage own categories" ON inventory_categories
USING (user_id IS NULL OR auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_inv_cat_created_set_user BEFORE INSERT ON inventory_categories FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Inventory Movements
DROP POLICY IF EXISTS "Enable all access for inventory_movements" ON inventory_movements;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE POLICY "Users can manage own inventory movements" ON inventory_movements
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_inv_mov_created_set_user BEFORE INSERT ON inventory_movements FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Inventory Suppliers
DROP POLICY IF EXISTS "Enable all access for inventory_suppliers" ON inventory_suppliers;
ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE POLICY "Users can manage own suppliers" ON inventory_suppliers
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER on_inv_sup_created_set_user BEFORE INSERT ON inventory_suppliers FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- Quotes
DROP POLICY IF EXISTS "Enable all access for quotes" ON quotes;
CREATE POLICY "Enable all access for quotes" ON quotes
FOR ALL USING (true) WITH CHECK (true);
-- Migration: Inventory Management Module
-- Description: Tables for items, stock, suppliers, movements and orders.

-- 1. Categories (Categorias de Produtos)
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial categories
INSERT INTO inventory_categories (name, description) VALUES
('Compressores', 'Compressores rotativos, scroll e recíprocos'),
('Gás Refrigerante', 'Fluidos refrigerantes R22, R410A, R32'),
('Elétrica', 'Capacitores, cabos, disjuntores, contatores'),
('Tubulação', 'Tubos de cobre, isolamentos, fitas'),
('Ferramentas', 'Ferramental técnico de uso diário'),
('Peças Plásticas', 'Carenagens, aletas, drenos')
ON CONFLICT (name) DO NOTHING;

-- 2. Suppliers (Fornecedores)
CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  cnpj VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  lead_time_days INTEGER DEFAULT 3,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inventory Items (Itens do Estoque)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  category_id UUID REFERENCES inventory_categories(id),
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2), -- Opcional, caso venda peças avulsas
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 5, -- Ponto de pedido
  location VARCHAR, -- Prateleira A1, Galpão, Carro 01
  main_supplier_id UUID REFERENCES inventory_suppliers(id),
  image_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inventory Movements (Histórico de Movimentações)
CREATE TYPE movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES inventory_items(id) NOT NULL,
  type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id UUID, -- Pode ser ID de Tarefa, Orçamento ou Pedido
  reference_type VARCHAR, -- 'TASK', 'QUOTE', 'ORDER', 'MANUAL'
  reason TEXT,
  user_id UUID REFERENCES auth.users(id), -- Quem fez a movimentação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Purchase Orders (Pedidos de Compra)
CREATE TYPE order_status AS ENUM ('DRAFT', 'PENDING', 'RECEIVED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS inventory_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR UNIQUE NOT NULL, -- Purchase Order Number
  supplier_id UUID REFERENCES inventory_suppliers(id) NOT NULL,
  status order_status DEFAULT 'DRAFT',
  total_amount DECIMAL(10,2) DEFAULT 0,
  expected_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES inventory_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Indexes for performance
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(created_at DESC);

-- RLS Policies (Basic: Authenticated users can do everything)
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON inventory_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON inventory_suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON inventory_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON inventory_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON inventory_order_items FOR ALL USING (auth.role() = 'authenticated');
