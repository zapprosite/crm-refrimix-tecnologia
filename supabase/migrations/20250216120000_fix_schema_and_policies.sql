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
