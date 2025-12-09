import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

interface UseTransactionsReturn {
    transactions: Transaction[];
    loading: boolean;
    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<boolean>;
    updateTransactionEntity: (id: string, entity: 'CNPJ' | 'CPF') => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    importTransactions: (csvText: string) => void;
    fetchTransactions: () => Promise<void>;
    kpis: {
        balanceTotal: number;
        balanceCNPJ: number;
        balanceCPF: number;
    };
}

export function useTransactions(): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('transaction_date', { ascending: false });

            if (error) throw error;

            if (data) {
                setTransactions(data.map(t => ({
                    id: t.id,
                    date: t.transaction_date,
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.category,
                    entity: t.entity
                })));
            }
        } catch (error: any) {
            console.error('Error fetching transactions:', error);
            toast.error('Erro ao carregar transações.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id'>): Promise<boolean> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Você precisa estar autenticado para adicionar transações.');
                return false;
            }

            const { data, error } = await supabase.from('transactions').insert([{
                description: txData.description,
                amount: txData.amount,
                transaction_date: txData.date,
                category: txData.category,
                type: txData.type,
                entity: txData.entity
            }]).select();

            if (error) throw error;

            if (data && data.length > 0) {
                setTransactions(prev => [{
                    id: data[0].id,
                    date: data[0].transaction_date,
                    description: data[0].description,
                    amount: data[0].amount,
                    type: data[0].type,
                    category: data[0].category,
                    entity: data[0].entity
                }, ...prev]);
                toast.success('Transação adicionada!');
                return true;
            } else {
                throw new Error('Nenhum dado retornado. Verifique permissões.');
            }
        } catch (error: any) {
            console.error('Error adding transaction:', error);
            toast.error(`Erro ao adicionar transação: ${error.message}`);
            return false;
        }
    }, []);

    const updateTransactionEntity = useCallback(async (id: string, entity: 'CNPJ' | 'CPF') => {
        try {
            const { error } = await supabase.from('transactions').update({ entity }).eq('id', id);
            if (error) throw error;
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, entity } : t));
            toast.success(`Entidade alterada para ${entity}!`);
        } catch (error: any) {
            toast.error(`Erro ao atualizar entidade: ${error.message}`);
        }
    }, []);

    const deleteTransaction = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) throw error;
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast.success('Transação excluída!');
        } catch (error: any) {
            toast.error(`Erro ao excluir transação: ${error.message}`);
        }
    }, []);

    const importTransactions = useCallback((csvText: string) => {
        try {
            const lines = csvText.split('\n').filter(l => l.trim());
            if (lines.length < 2) {
                toast.error('CSV vazio ou inválido');
                return;
            }
            const imported: Omit<Transaction, 'id'>[] = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(';');
                if (cols.length >= 3) {
                    const amount = parseFloat(cols[1].replace(',', '.').replace(/[^\d.-]/g, ''));
                    imported.push({
                        date: cols[0] || new Date().toISOString().split('T')[0],
                        description: cols[2] || 'Importado',
                        amount: isNaN(amount) ? 0 : amount,
                        type: amount < 0 ? 'expense' : 'income',
                        category: 'Importação',
                        entity: 'CNPJ'
                    });
                }
            }
            imported.forEach(tx => addTransaction(tx));
            toast.success(`${imported.length} transações importadas!`);
        } catch {
            toast.error('Erro ao importar CSV');
        }
    }, [addTransaction]);

    // KPIs calculados
    const balanceTotal = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const balanceCNPJ = transactions.filter(t => t.entity === 'CNPJ').reduce((acc, curr) => acc + curr.amount, 0);
    const balanceCPF = transactions.filter(t => t.entity === 'CPF').reduce((acc, curr) => acc + curr.amount, 0);

    return {
        transactions,
        loading,
        addTransaction,
        updateTransactionEntity,
        deleteTransaction,
        importTransactions,
        fetchTransactions,
        kpis: { balanceTotal, balanceCNPJ, balanceCPF }
    };
}
