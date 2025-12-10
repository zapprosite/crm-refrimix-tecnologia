import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { SavedQuote } from '@/types';

interface UseQuotesReturn {
    quotes: SavedQuote[];
    loading: boolean;
    saveQuote: (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => Promise<void>;
    deleteQuote: (id: string) => Promise<void>;
    fetchQuotes: () => Promise<void>;
}

export function useQuotes(): UseQuotesReturn {
    const [quotes, setQuotes] = useState<SavedQuote[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchQuotes = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setQuotes(data.map(q => ({
                    ...q.data,
                    id: q.id,
                    createdAt: q.created_at,
                    totalValue: q.total_value
                })));
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Erro ao carregar orçamentos.');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveQuote = useCallback(async (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('quotes').insert([{
                quote_number: quote.quoteNumber,
                client_name: quote.clientName,
                total_value: quote.totalValue,
                data: quote // Save full JSON structure
            }]).select();

            if (error) throw error;

            if (data) {
                const newQuote: SavedQuote = {
                    ...quote,
                    id: data[0].id,
                    createdAt: data[0].created_at,
                    totalValue: data[0].total_value
                };
                setQuotes(prev => [newQuote, ...prev]);
                toast.success('Orçamento salvo com sucesso!');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Erro ao salvar orçamento: ${message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteQuote = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('quotes').delete().eq('id', id);
            if (error) throw error;
            setQuotes(prev => prev.filter(q => q.id !== id));
            toast.success('Orçamento excluído.');
        } catch (error) {
            console.error('Error deleting quote:', error);
            toast.error('Erro ao excluir orçamento.');
        }
    }, []);

    return {
        quotes,
        loading,
        saveQuote,
        deleteQuote,
        fetchQuotes
    };
}
