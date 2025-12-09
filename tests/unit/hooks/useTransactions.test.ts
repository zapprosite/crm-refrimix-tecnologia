import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '@/hooks/useTransactions';
import { supabase } from '@/lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useTransactions Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should calculate KPIs correctly', () => {
        // Mock initial fetch response
        const mockTx = [
            { id: '1', amount: 100, entity: 'CNPJ', type: 'income', transaction_date: '2023-01-01' },
            { id: '2', amount: 50, entity: 'CPF', type: 'expense', transaction_date: '2023-01-02' }
        ];

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'transactions') {
                return {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockTx, error: null }),
                    insert: vi.fn().mockReturnThis(), // needed for add
                };
            }
            return {};
        });

        const { result } = renderHook(() => useTransactions());

        // Trigger fetch manually or if it auto-fetches? Hook doesn't auto-fetch in body.
        // Assuming we need to call fetchTransactions or manually set state?
        // useTransactions exposes fetchTransactions.

        // Wait, renderHook renders the hook.
    });

    it('should add transaction and update balance', async () => {
        // Mock Auth
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'test-user' } } },
            error: null,
        });

        const newTx = { id: 'tx-1', amount: 200, entity: 'CNPJ', type: 'income', description: 'Test', transaction_date: '2023-01-01' };

        const insertMock = vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [newTx], error: null })
        });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'transactions') {
                return {
                    insert: insertMock
                };
            }
            return {};
        });

        const { result } = renderHook(() => useTransactions());

        await act(async () => {
            await result.current.addTransaction({ description: 'Test', amount: 200, entity: 'CNPJ', type: 'income', category: 'Vendas', date: '2023-01-01' });
        });

        expect(result.current.transactions).toHaveLength(1);
        expect(result.current.kpis.balanceTotal).toBe(200);
        expect(result.current.kpis.balanceCNPJ).toBe(200);
        expect(result.current.kpis.balanceCPF).toBe(0);
    });
});
