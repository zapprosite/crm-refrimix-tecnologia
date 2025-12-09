import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Collaborator } from '@/types';

interface UseCollaboratorsReturn {
    collaborators: Collaborator[];
    loading: boolean;
    addCollaborator: (collab: Omit<Collaborator, 'id' | 'active'>) => Promise<void>;
    updateCollaborator: (id: string, data: Partial<Collaborator>) => Promise<void>;
    deleteCollaborator: (id: string) => Promise<void>;
    fetchCollaborators: () => Promise<void>;
}

export function useCollaborators(): UseCollaboratorsReturn {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCollaborators = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collaborators')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            if (data) {
                setCollaborators(data);
            }
        } catch (error: any) {
            console.error('Error fetching collaborators:', error);
            toast.error('Erro ao carregar colaboradores.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addCollaborator = useCallback(async (collab: Omit<Collaborator, 'id' | 'active'>) => {
        try {
            const { data, error } = await supabase.from('collaborators').insert([{
                name: collab.name,
                role: collab.role,
                team: collab.team,
                phone: collab.phone,
                active: true
            }]).select();

            if (error) throw error;

            if (data) {
                setCollaborators(prev => [...prev, { ...data[0], active: true }]);
                toast.success('Colaborador adicionado!');
            }
        } catch (error: any) {
            toast.error(`Erro ao adicionar colaborador: ${error.message}`);
        }
    }, []);

    const updateCollaborator = useCallback(async (id: string, data: Partial<Collaborator>) => {
        try {
            const { error } = await supabase.from('collaborators').update(data).eq('id', id);
            if (error) throw error;
            setCollaborators(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
            toast.success('Colaborador atualizado!');
        } catch (error: any) {
            toast.error(`Erro ao atualizar colaborador: ${error.message}`);
        }
    }, []);

    const deleteCollaborator = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('collaborators').delete().eq('id', id);
            if (error) throw error;
            setCollaborators(prev => prev.filter(c => c.id !== id));
            toast.success('Colaborador removido!');
        } catch (error: any) {
            toast.error(`Erro ao remover colaborador: ${error.message}`);
        }
    }, []);

    return {
        collaborators,
        loading,
        addCollaborator,
        updateCollaborator,
        deleteCollaborator,
        fetchCollaborators
    };
}
