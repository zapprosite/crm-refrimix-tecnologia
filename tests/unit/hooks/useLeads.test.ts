import { renderHook, act, waitFor } from '@testing-library/react';
import { useLeads } from '@/hooks/useLeads';
import { supabase } from '@/lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useLeads Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useLeads());

        expect(result.current.leads).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.kpis).toEqual({
            totalRevenue: 0,
            newLeads: 0,
            conversionRate: 0,
        });
    });

    it('should add a lead and update state', async () => {
        // Mock Auth Session
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'test-user' } } },
            error: null,
        });

        // Mock Insert Response
        const mockLead = {
            id: 'lead-1',
            name: 'Novo Lead',
            value: 5000,
            status: 'Novo',
            created_at: new Date().toISOString(),
        };

        // Override the global mock for specific 'leads' table call if needed, 
        // or rely on the chain. Here we assume global mock structure allows chaining.
        // We need to ensure insert().select() returns data.
        const insertMock = vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [mockLead], error: null }),
        });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'leads') {
                return {
                    insert: insertMock,
                    // Add other used methods to avoid crash
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                };
            }
            return { select: vi.fn() };
        });

        const { result } = renderHook(() => useLeads());

        await act(async () => {
            await result.current.addLead({
                name: 'Novo Lead',
                value: 5000,
                email: 'test@test.com',
                phone: '123'
            } as any);
        });

        expect(insertMock).toHaveBeenCalled();
        expect(result.current.leads).toHaveLength(1);
        expect(result.current.leads[0].name).toBe('Novo Lead');
        expect(result.current.kpis.newLeads).toBe(1);
    });

    it('should fetch leads and update state', async () => {
        const mockLeads = [
            { id: '1', name: 'Lead 1', value: 1000, status: 'Fechado', created_at: '2023-01-01' },
            { id: '2', name: 'Lead 2', value: 2000, status: 'Novo', created_at: '2023-01-02' }
        ];

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'leads') {
                return {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockLeads, error: null })
                };
            }
            return {};
        });

        const { result } = renderHook(() => useLeads());

        await act(async () => {
            await result.current.fetchLeads();
        });

        expect(result.current.leads).toHaveLength(2);
        expect(result.current.kpis.totalRevenue).toBe(1000); // 1000 (Fechado)
        expect(result.current.kpis.conversionRate).toBe(50.0); // 1/2
    });
});
