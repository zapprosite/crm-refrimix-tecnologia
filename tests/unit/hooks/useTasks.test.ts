import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '@/hooks/useTasks';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
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

describe('useTasks Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty tasks array and loading false', () => {
        const { result } = renderHook(() => useTasks());

        expect(result.current.tasks).toEqual([]);
        expect(result.current.loading).toBe(false);
    });

    it('should add a task and update state optimistically', async () => {
        const { supabase } = await import('@/lib/supabase');
        const mockTask = {
            title: 'Nova Tarefa',
            description: 'Descrição',
            date: '2025-12-09',
            startTime: '08:00',
            endTime: '10:00',
            collaboratorId: 'c1',
            type: 'Avulsa' as const,
            quoteId: undefined
        };

        const mockResponse = {
            data: [{ id: 'task-1', ...mockTask, status: 'Pendente' }],
            error: null
        };

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockResponse)
            })
        } as any);

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.addTask(mockTask);
        });

        await waitFor(() => {
            expect(result.current.tasks).toHaveLength(1);
            expect(result.current.tasks[0].title).toBe('Nova Tarefa');
            expect(result.current.tasks[0].status).toBe('Pendente');
        });
    });

    it('should update task status', async () => {
        const { supabase } = await import('@/lib/supabase');

        // Setup mock for update
        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [{ id: 'task-1', title: 'Test', status: 'Pendente' }],
                    error: null
                })
            }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        } as any);

        const { result } = renderHook(() => useTasks());

        // First add a task
        await act(async () => {
            await result.current.addTask({
                title: 'Test',
                description: '',
                date: '2025-12-09',
                startTime: '08:00',
                endTime: '10:00',
                collaboratorId: 'c1',
                type: 'Avulsa',
                quoteId: undefined
            });
        });

        // Then update its status
        await act(async () => {
            await result.current.updateTaskStatus('task-1', 'Concluído');
        });

        await waitFor(() => {
            expect(result.current.tasks[0].status).toBe('Concluído');
        });
    });

    it('should delete a task from state', async () => {
        const { supabase } = await import('@/lib/supabase');

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [{ id: 'task-1', title: 'Test', status: 'Pendente' }],
                    error: null
                })
            }),
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        } as any);

        const { result } = renderHook(() => useTasks());

        // Add a task first
        await act(async () => {
            await result.current.addTask({
                title: 'Test',
                description: '',
                date: '2025-12-09',
                startTime: '08:00',
                endTime: '10:00',
                collaboratorId: 'c1',
                type: 'Avulsa',
                quoteId: undefined
            });
        });

        expect(result.current.tasks).toHaveLength(1);

        // Delete the task
        await act(async () => {
            await result.current.deleteTask('task-1');
        });

        await waitFor(() => {
            expect(result.current.tasks).toHaveLength(0);
        });
    });
});
