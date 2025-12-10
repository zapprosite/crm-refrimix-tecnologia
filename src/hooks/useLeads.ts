import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Lead } from '@/types';

interface UseLeadsReturn {
    leads: Lead[];
    loading: boolean;
    addLead: (lead: Omit<Lead, 'id' | 'date'>) => Promise<void>;
    updateLeadStatus: (id: string, status: string) => Promise<void>;
    updateLeadStatusByName: (name: string, status: string) => Promise<boolean>;
    fetchLeads: () => Promise<void>;
    exportLeadsToCSV: () => void;
    kpis: {
        totalRevenue: number;
        newLeads: number;
        conversionRate: number;
    };
}

export function useLeads(): UseLeadsReturn {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setLeads(data.map(l => ({ ...l, date: l.created_at })));
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Erro ao carregar leads, tente novamente.');
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'date'>) => {
        try {
            console.log('addLead called with:', leadData);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Você precisa estar autenticado.');
                return;
            }

            const { data, error } = await supabase.from('leads').insert([{
                name: leadData.name,
                company: leadData.company,
                email: leadData.email,
                phone: leadData.phone,
                document: leadData.document,
                address: leadData.address,
                number: leadData.number,
                city: leadData.city,
                state: leadData.state,
                zip: leadData.zip,
                value: leadData.value,
                source: leadData.source,
                status: leadData.status || 'Novo',
                user_id: session.user.id
            }]).select();

            console.log('Supabase insert response:', { data, error });

            if (error) throw error;

            if (data) {
                setLeads(prev => [{ ...data[0], date: data[0].created_at }, ...prev]);
                toast.success('Lead adicionado!');
            }
        } catch (error: any) {
            toast.error(`Erro ao adicionar lead: ${error.message}`);
        }
    }, []);

    const updateLeadStatus = useCallback(async (id: string, status: string) => {
        try {
            const { error } = await supabase.from('leads').update({ status }).eq('id', id);
            if (error) throw error;
            setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: status as Lead['status'] } : lead));
            toast.success(`Status atualizado para ${status}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Erro ao atualizar status: ${message}`);
        }
    }, []);

    const updateLeadStatusByName = useCallback(async (name: string, status: string): Promise<boolean> => {
        const lead = leads.find(l => l.name.toLowerCase() === name.toLowerCase());
        if (lead) {
            await updateLeadStatus(lead.id, status);
            return true;
        }
        return false;
    }, [leads, updateLeadStatus]);

    const exportLeadsToCSV = useCallback(() => {
        if (leads.length === 0) {
            toast.error('Nenhum lead para exportar.');
            return;
        }

        const headers = ['Nome', 'Empresa', 'Telefone', 'Email', 'Status', 'Origem', 'Data', 'Valor'];
        const csvRows = [headers.join(';')];

        leads.forEach(lead => {
            const row = [
                lead.name,
                lead.company,
                lead.phone,
                lead.email || '',
                lead.status,
                lead.source,
                lead.date,
                String(lead.value || 0)
            ].map(val => `"${val}"`);
            csvRows.push(row.join(';'));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Leads exportados com sucesso!');
    }, [leads]);

    // KPIs calculados
    const totalRevenue = leads.filter(l => l.status === 'Fechado').reduce((acc, curr) => acc + (curr.value || 0), 0);
    const newLeads = leads.length;
    const conversionRate = leads.length > 0
        ? Number(((leads.filter(l => l.status === 'Fechado').length / leads.length) * 100).toFixed(1))
        : 0;

    return {
        leads,
        loading,
        addLead,
        updateLeadStatus,
        updateLeadStatusByName,
        fetchLeads,
        exportLeadsToCSV,
        kpis: { totalRevenue, newLeads, conversionRate }
    };
}
