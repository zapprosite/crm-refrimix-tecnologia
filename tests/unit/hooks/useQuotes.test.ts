import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuotes } from '@/hooks/useQuotes';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
    }
}));

// Mock toast notifications
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('useQuotes Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty quotes array', () => {
        const { result } = renderHook(() => useQuotes());

        expect(result.current.quotes).toEqual([]);
        expect(result.current.loading).toBe(false);
    });

    it('should save a quote and update state', async () => {
        const { supabase } = await import('@/lib/supabase');
        const mockQuote = {
            quoteNumber: 'ORC-001',
            clientName: 'Cliente Teste',
            totalValue: 5000,
            items: [{ description: 'Serviço 1', value: 5000 }]
        };

        const mockResponse = {
            data: [{
                id: 'quote-1',
                quote_number: 'ORC-001',
                client_name: 'Cliente Teste',
                total_value: 5000,
                created_at: '2025-12-09T12:00:00Z',
                data: mockQuote
            }],
            error: null
        };

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockResponse)
            })
        } as any);

        const { result } = renderHook(() => useQuotes());

        await act(async () => {
            await result.current.saveQuote(mockQuote as any);
        });

        await waitFor(() => {
            expect(result.current.quotes).toHaveLength(1);
            expect(result.current.quotes[0].clientName).toBe('Cliente Teste');
        });
    });

    it('should delete a quote from state', async () => {
        const { supabase } = await import('@/lib/supabase');

        // First add a quote
        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [{
                        id: 'quote-1',
                        quote_number: 'ORC-001',
                        client_name: 'Test',
                        total_value: 1000,
                        created_at: '2025-12-09',
                        data: {}
                    }],
                    error: null
                })
            }),
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        } as any);

        const { result } = renderHook(() => useQuotes());

        await act(async () => {
            await result.current.saveQuote({
                quoteNumber: 'ORC-001',
                clientName: 'Test',
                totalValue: 1000
            } as any);
        });

        expect(result.current.quotes).toHaveLength(1);

        await act(async () => {
            await result.current.deleteQuote('quote-1');
        });

        await waitFor(() => {
            expect(result.current.quotes).toHaveLength(0);
        });
    });
});
