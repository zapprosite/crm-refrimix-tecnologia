-- =====================================================
-- FIX: Finance Transactions RLS
-- Execute this if you see "Erro ao salvar: Nenhum dado retornado"
-- =====================================================

-- 1. Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Create simplified policies for authenticated users
-- (Allows any logged-in user to manage transactions)

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.transactions;

CREATE POLICY "Enable all access for authenticated users" ON public.transactions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Verify permissions (Optional check)
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
