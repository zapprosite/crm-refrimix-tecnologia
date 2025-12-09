import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { WorkTask } from '@/types';

interface UseTasksReturn {
    tasks: WorkTask[];
    loading: boolean;
    addTask: (task: Omit<WorkTask, 'id' | 'status'>) => Promise<void>;
    updateTaskStatus: (id: string, status: WorkTask['status']) => Promise<void>;
    moveTask: (id: string, newDate: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    fetchTasks: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
    const [tasks, setTasks] = useState<WorkTask[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('due_date', { ascending: true });

            if (error) throw error;

            if (data) {
                setTasks(data.map(t => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    date: t.due_date,
                    startTime: t.start_time,
                    endTime: t.end_time,
                    collaboratorId: t.collaborator_name,
                    type: t.type as WorkTask['type'],
                    status: t.status as WorkTask['status'],
                    quoteId: t.quote_id
                })));
            }
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            toast.error('Erro ao carregar tarefas.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addTask = useCallback(async (task: Omit<WorkTask, 'id' | 'status'>) => {
        try {
            const { data, error } = await supabase.from('tasks').insert([{
                title: task.title,
                description: task.description,
                due_date: task.date,
                start_time: task.startTime,
                end_time: task.endTime,
                collaborator_name: task.collaboratorId,
                type: task.type,
                status: 'Pendente',
                quote_id: task.quoteId
            }]).select();

            if (error) throw error;

            if (data) {
                setTasks(prev => [...prev, { ...task, id: data[0].id, status: 'Pendente' }]);
                toast.success('Tarefa criada!');
            }
        } catch (error: any) {
            toast.error(`Erro ao criar tarefa: ${error.message}`);
        }
    }, []);

    const updateTaskStatus = useCallback(async (id: string, status: WorkTask['status']) => {
        try {
            const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
            toast.success('Status da tarefa atualizado!');
        } catch (error: any) {
            toast.error(`Erro ao atualizar tarefa: ${error.message}`);
        }
    }, []);

    const moveTask = useCallback(async (id: string, newDate: string) => {
        try {
            const { error } = await supabase.from('tasks').update({ due_date: newDate }).eq('id', id);
            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === id ? { ...t, date: newDate } : t));
            toast.success('Tarefa movida!');
        } catch (error: any) {
            toast.error(`Erro ao mover tarefa: ${error.message}`);
        }
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
            setTasks(prev => prev.filter(t => t.id !== id));
            toast.success('Tarefa excluída!');
        } catch (error: any) {
            toast.error(`Erro ao excluir tarefa: ${error.message}`);
        }
    }, []);

    return {
        tasks,
        loading,
        addTask,
        updateTaskStatus,
        moveTask,
        deleteTask,
        fetchTasks
    };
}
