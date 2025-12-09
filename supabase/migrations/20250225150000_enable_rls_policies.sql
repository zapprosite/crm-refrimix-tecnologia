-- Habilitar RLS nas tabelas (caso não esteja)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Criar Políticas Permissivas (DEV MODE - Permite tudo para todos)

-- Inventory Items
DROP POLICY IF EXISTS "Enable all access for inventory_items" ON inventory_items;
CREATE POLICY "Enable all access for inventory_items" ON inventory_items
FOR ALL USING (true) WITH CHECK (true);

-- Inventory Categories
DROP POLICY IF EXISTS "Enable all access for inventory_categories" ON inventory_categories;
CREATE POLICY "Enable all access for inventory_categories" ON inventory_categories
FOR ALL USING (true) WITH CHECK (true);

-- Inventory Movements
DROP POLICY IF EXISTS "Enable all access for inventory_movements" ON inventory_movements;
CREATE POLICY "Enable all access for inventory_movements" ON inventory_movements
FOR ALL USING (true) WITH CHECK (true);

-- Inventory Suppliers
DROP POLICY IF EXISTS "Enable all access for inventory_suppliers" ON inventory_suppliers;
CREATE POLICY "Enable all access for inventory_suppliers" ON inventory_suppliers
FOR ALL USING (true) WITH CHECK (true);

-- Quotes
DROP POLICY IF EXISTS "Enable all access for quotes" ON quotes;
CREATE POLICY "Enable all access for quotes" ON quotes
FOR ALL USING (true) WITH CHECK (true);
