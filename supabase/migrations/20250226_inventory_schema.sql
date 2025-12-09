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
