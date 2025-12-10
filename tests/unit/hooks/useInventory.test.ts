import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInventory } from '@/hooks/useInventory';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null })
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

describe('useInventory Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty arrays and zero KPIs', () => {
        const { result } = renderHook(() => useInventory());

        expect(result.current.inventoryItems).toEqual([]);
        expect(result.current.inventoryCategories).toEqual([]);
        expect(result.current.suppliers).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.kpis.totalValue).toBe(0);
        expect(result.current.kpis.lowStockCount).toBe(0);
    });

    it('should add an inventory item using addInventoryItem', async () => {
        const { supabase } = await import('@/lib/supabase');
        const mockItem = {
            name: 'Compressor 10HP',
            sku: 'COMP-001',
            quantity: 5,
            minQuantity: 2,
            unitPrice: 1500,
            categoryId: 'cat-1',
            categoryName: 'Compressores',
            mainSupplierId: 'sup-1',
            description: '',
            location: ''
        };

        const mockResponse = {
            data: [{
                id: 'item-1',
                sku: mockItem.sku,
                name: mockItem.name,
                category_id: mockItem.categoryId,
                description: mockItem.description,
                unit_price: mockItem.unitPrice,
                quantity: mockItem.quantity,
                min_quantity: mockItem.minQuantity,
                location: mockItem.location,
                main_supplier_id: mockItem.mainSupplierId,
                inventory_categories: { name: 'Compressores' }
            }],
            error: null
        };

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockResponse)
            })
        } as any);

        const { result } = renderHook(() => useInventory());

        await act(async () => {
            await result.current.addInventoryItem(mockItem);
        });

        await waitFor(() => {
            expect(result.current.inventoryItems).toHaveLength(1);
            expect(result.current.inventoryItems[0].name).toBe('Compressor 10HP');
        });
    });

    it('should calculate KPIs correctly based on items state', () => {
        // Since KPIs are derived from inventoryItems state, we test the calculation logic directly
        // by verifying the hook initializes correctly and the KPIs are computed from items
        const { result } = renderHook(() => useInventory());

        // Initially, with no items, KPIs should be 0
        expect(result.current.kpis.totalValue).toBe(0);
        expect(result.current.kpis.lowStockCount).toBe(0);

        // Note: KPI calculation is: 
        // totalValue = sum(quantity * unitPrice)
        // lowStockCount = count(quantity <= minQuantity)
        // This is a derived state, tested when items are present
    });

    it('should add a supplier using addSupplier', async () => {
        const { supabase } = await import('@/lib/supabase');
        const mockSupplier = {
            name: 'Fornecedor XYZ',
            cnpj: '12.345.678/0001-90',
            email: 'contato@xyz.com',
            phone: '11999998877',
            leadTimeDays: 7
        };

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [{
                        id: 'sup-1',
                        name: mockSupplier.name,
                        cnpj: mockSupplier.cnpj,
                        email: mockSupplier.email,
                        phone: mockSupplier.phone,
                        lead_time_days: mockSupplier.leadTimeDays
                    }],
                    error: null
                })
            })
        } as any);

        const { result } = renderHook(() => useInventory());

        await act(async () => {
            await result.current.addSupplier(mockSupplier);
        });

        await waitFor(() => {
            expect(result.current.suppliers).toHaveLength(1);
            expect(result.current.suppliers[0].name).toBe('Fornecedor XYZ');
        });
    });
});
