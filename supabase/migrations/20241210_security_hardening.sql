-- SECURITY HARDENING MIGRATION
-- Date: 2024-12-10
-- Purpose: Implement Tenant Isolation by enforcing user_id ownership and RLS.

-- 1. Create Helper Function for Auto-Assigning User ID
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is already set, keep it. If null, use current auth.uid()
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add user_id column and Triggers to all Tenant Tables

-- Helper macro logic (applied manually per table for SQL compatibility)

-- TABLE: TASKS
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
DROP TRIGGER IF EXISTS on_task_created_set_user ON public.tasks;
CREATE TRIGGER on_task_created_set_user
BEFORE INSERT ON public.tasks
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: SCHEDULES
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
DROP TRIGGER IF EXISTS on_schedule_created_set_user ON public.schedules;
CREATE TRIGGER on_schedule_created_set_user
BEFORE INSERT ON public.schedules
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: TRANSACTIONS
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
DROP TRIGGER IF EXISTS on_transaction_created_set_user ON public.transactions;
CREATE TRIGGER on_transaction_created_set_user
BEFORE INSERT ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: QUOTES
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
DROP TRIGGER IF EXISTS on_quote_created_set_user ON public.quotes;
CREATE TRIGGER on_quote_created_set_user
BEFORE INSERT ON public.quotes
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: COLLABORATORS
ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON public.collaborators(user_id);
DROP TRIGGER IF EXISTS on_collaborator_created_set_user ON public.collaborators;
CREATE TRIGGER on_collaborator_created_set_user
BEFORE INSERT ON public.collaborators
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: INVENTORY_ITEMS
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON public.inventory_items(user_id);
DROP TRIGGER IF EXISTS on_inv_item_created_set_user ON public.inventory_items;
CREATE TRIGGER on_inv_item_created_set_user
BEFORE INSERT ON public.inventory_items
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: INVENTORY_MOVEMENTS
-- user_id already exists in schema but check it acts as owner
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id); 
-- Note: inventory_movements had user_id as "who did it", we can treat it as owner too or keep consistent. 
-- For simplicity, we assume the creator OWNS the record.
CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id ON public.inventory_movements(user_id);
DROP TRIGGER IF EXISTS on_inv_mov_created_set_user ON public.inventory_movements;
CREATE TRIGGER on_inv_mov_created_set_user
BEFORE INSERT ON public.inventory_movements
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: INVENTORY_CATEGORIES
ALTER TABLE public.inventory_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_user_id ON public.inventory_categories(user_id);
DROP TRIGGER IF EXISTS on_inv_cat_created_set_user ON public.inventory_categories;
CREATE TRIGGER on_inv_cat_created_set_user
BEFORE INSERT ON public.inventory_categories
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: INVENTORY_SUPPLIERS
ALTER TABLE public.inventory_suppliers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_user_id ON public.inventory_suppliers(user_id);
DROP TRIGGER IF EXISTS on_inv_sup_created_set_user ON public.inventory_suppliers;
CREATE TRIGGER on_inv_sup_created_set_user
BEFORE INSERT ON public.inventory_suppliers
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- TABLE: EQUIPMENTS (Already linked to leads, but adding direct ownership helps perf and clarity)
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_equipments_user_id ON public.equipments(user_id);
DROP TRIGGER IF EXISTS on_equipment_created_set_user ON public.equipments;
CREATE TRIGGER on_equipment_created_set_user
BEFORE INSERT ON public.equipments
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();


-- 3. ENABLE RLS and DROP Old Permissive Policies
-- (We recreate strict policies immediately to avoid lockout during migration if run transactionally)

-- Generic Policy Generator Logic (Manual expansion for safety)

-- TASKS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total tasks" ON public.tasks;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tasks;
CREATE POLICY "Users can manage own tasks" ON public.tasks
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- SCHEDULES
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total schedules" ON public.schedules;
CREATE POLICY "Users can manage own schedules" ON public.schedules
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- QUOTES
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total quotes" ON public.quotes;
DROP POLICY IF EXISTS "Enable all access for quotes" ON public.quotes;
DROP POLICY IF EXISTS "Enable all for quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- COLLABORATORS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total collaborators" ON public.collaborators;
CREATE POLICY "Users can manage own collaborators" ON public.collaborators
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- LEADS (Already had user_id, just hardening)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;
CREATE POLICY "Users can manage own leads" ON public.leads
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
-- Also add trigger to leads just in case
DROP TRIGGER IF EXISTS on_lead_created_set_user ON public.leads;
CREATE TRIGGER on_lead_created_set_user
BEFORE INSERT ON public.leads
FOR EACH ROW EXECUTE PROCEDURE public.set_user_id();

-- INVENTORY_ITEMS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Enable all access for inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_items;
CREATE POLICY "Users can manage own inventory items" ON public.inventory_items
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INVENTORY_MOVEMENTS
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Enable all access for inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_movements;
CREATE POLICY "Users can manage own inventory movements" ON public.inventory_movements
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INVENTORY_CATEGORIES
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for inventory_categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Enable all access for inventory_categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_categories;
-- Note: Categories might be shared system-wide (e.g. 'Air Conditioners'), but let's allow user custom ones. 
-- Hybrid approach: User sees their own OR global ones (user_id IS NULL)
CREATE POLICY "Users can read global and manage own categories" ON public.inventory_categories
    USING (user_id IS NULL OR auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INVENTORY_SUPPLIERS
ALTER TABLE public.inventory_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for inventory_suppliers" ON public.inventory_suppliers;
DROP POLICY IF EXISTS "Enable all access for inventory_suppliers" ON public.inventory_suppliers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_suppliers;
CREATE POLICY "Users can manage own suppliers" ON public.inventory_suppliers
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- EQUIPMENTS
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total equipments" ON public.equipments;
CREATE POLICY "Users can manage own equipments" ON public.equipments
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. USERS Table (Self-management)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total para autenticados" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
    USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
    WITH CHECK (auth.uid() = id);
-- Allow creating profile during signup (insert)
CREATE POLICY "Users can insert own profile" ON public.users
    WITH CHECK (auth.uid() = id);

