import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { InventoryItem, InventoryCategory, InventoryMovement, Supplier } from '@/types';

interface UseInventoryReturn {
    inventoryItems: InventoryItem[];
    inventoryCategories: InventoryCategory[];
    inventoryMovements: InventoryMovement[];
    suppliers: Supplier[];
    loading: boolean;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
    updateInventoryStock: (itemId: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    fetchInventory: () => Promise<void>;
    kpis: {
        totalValue: number;
        lowStockCount: number;
    };
}

export function useInventory(): UseInventoryReturn {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
    const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch categories
            const { data: catData } = await supabase.from('inventory_categories').select('*');
            if (catData) setInventoryCategories(catData);

            // Fetch suppliers
            const { data: supData } = await supabase.from('inventory_suppliers').select('*');
            if (supData) setSuppliers(supData.map(s => ({
                id: s.id,
                name: s.name,
                cnpj: s.cnpj,
                email: s.email,
                phone: s.phone,
                leadTimeDays: s.lead_time_days
            })));

            // Fetch items with category join
            const { data: itemData } = await supabase.from('inventory_items').select('*, inventory_categories(name)');
            if (itemData) setInventoryItems(itemData.map(i => ({
                id: i.id,
                sku: i.sku,
                name: i.name,
                categoryId: i.category_id,
                categoryName: i.inventory_categories?.name,
                description: i.description,
                unitPrice: i.unit_price,
                quantity: i.quantity,
                minQuantity: i.min_quantity,
                location: i.location,
                mainSupplierId: i.main_supplier_id
            })));

            // Fetch movements with item join
            const { data: movData } = await supabase
                .from('inventory_movements')
                .select('*, inventory_items(name)')
                .order('created_at', { ascending: false });
            if (movData) setInventoryMovements(movData.map(m => ({
                id: m.id,
                itemId: m.item_id,
                itemName: m.inventory_items?.name,
                type: m.type,
                quantity: m.quantity,
                referenceType: m.reference_type,
                reason: m.reason,
                createdAt: m.created_at,
                userId: m.user_id
            })));
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Erro ao carregar estoque.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
        try {
            const { data, error } = await supabase.from('inventory_items').insert([{
                sku: item.sku,
                name: item.name,
                category_id: item.categoryId,
                description: item.description,
                unit_price: item.unitPrice,
                quantity: item.quantity,
                min_quantity: item.minQuantity,
                location: item.location,
                main_supplier_id: item.mainSupplierId
            }]).select('*, inventory_categories(name)');

            if (error) throw error;

            if (data) {
                setInventoryItems(prev => [...prev, {
                    id: data[0].id,
                    sku: data[0].sku,
                    name: data[0].name,
                    categoryId: data[0].category_id,
                    categoryName: data[0].inventory_categories?.name,
                    description: data[0].description,
                    unitPrice: data[0].unit_price,
                    quantity: data[0].quantity,
                    minQuantity: data[0].min_quantity,
                    location: data[0].location,
                    mainSupplierId: data[0].main_supplier_id
                }]);
                toast.success('Item adicionado ao estoque!');
            }
        } catch (error) {
            console.error('Error adding inventory item:', error);
            toast.error('Erro ao adicionar item. Verifique o SKU.');
        }
    }, []);

    const updateInventoryStock = useCallback(async (
        itemId: string,
        quantity: number,
        type: 'IN' | 'OUT' | 'ADJUSTMENT',
        reason: string
    ) => {
        try {
            // Create movement record
            const { error: movError } = await supabase.from('inventory_movements').insert([{
                item_id: itemId,
                type,
                quantity,
                reference_type: 'MANUAL',
                reason
            }]);

            if (movError) throw movError;

            // Calculate new quantity
            const currentItem = inventoryItems.find(i => i.id === itemId);
            if (!currentItem) return;

            let newQuantity = currentItem.quantity;
            if (type === 'IN') newQuantity += quantity;
            if (type === 'OUT') newQuantity -= quantity;
            if (type === 'ADJUSTMENT') newQuantity = quantity;

            // Update item quantity
            const { error: updateError } = await supabase
                .from('inventory_items')
                .update({ quantity: newQuantity })
                .eq('id', itemId);

            if (updateError) throw updateError;

            // Update local state
            setInventoryItems(prev => prev.map(i =>
                i.id === itemId ? { ...i, quantity: newQuantity } : i
            ));

            // Refresh movements
            const { data: movData } = await supabase
                .from('inventory_movements')
                .select('*, inventory_items(name)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (movData) {
                setInventoryMovements(movData.map(m => ({
                    id: m.id,
                    itemId: m.item_id,
                    itemName: m.inventory_items?.name,
                    type: m.type,
                    quantity: m.quantity,
                    referenceType: m.reference_type,
                    reason: m.reason,
                    createdAt: m.created_at,
                    userId: m.user_id
                })));
            }

            toast.success('Estoque atualizado!');
        } catch (error) {
            console.error('Error updating inventory:', error);
            toast.error('Erro ao atualizar estoque.');
        }
    }, [inventoryItems]);

    const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
        try {
            const { data, error } = await supabase.from('inventory_suppliers').insert([{
                name: supplier.name,
                cnpj: supplier.cnpj,
                email: supplier.email,
                phone: supplier.phone,
                lead_time_days: supplier.leadTimeDays
            }]).select();

            if (error) throw error;

            if (data) {
                setSuppliers(prev => [...prev, {
                    id: data[0].id,
                    name: data[0].name,
                    cnpj: data[0].cnpj,
                    email: data[0].email,
                    phone: data[0].phone,
                    leadTimeDays: data[0].lead_time_days
                }]);
                toast.success('Fornecedor cadastrado!');
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            toast.error('Erro ao cadastrar fornecedor.');
        }
    }, []);

    // KPIs calculados
    const totalValue = inventoryItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const lowStockCount = inventoryItems.filter(item => item.quantity <= item.minQuantity).length;

    return {
        inventoryItems,
        inventoryCategories,
        inventoryMovements,
        suppliers,
        loading,
        addInventoryItem,
        updateInventoryStock,
        addSupplier,
        fetchInventory,
        kpis: { totalValue, lowStockCount }
    };
}
