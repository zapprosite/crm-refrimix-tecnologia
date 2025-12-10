import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollaborators } from '@/hooks/useCollaborators';

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

describe('useCollaborators Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty collaborators array', () => {
        const { result } = renderHook(() => useCollaborators());

        expect(result.current.collaborators).toEqual([]);
        expect(result.current.loading).toBe(false);
    });

    it('should add a collaborator and update state', async () => {
        const { supabase } = await import('@/lib/supabase');
        const mockCollab = {
            name: 'João Técnico',
            role: 'Técnico',
            team: 'Instalações',
            phone: '11999998888'
        };

        const mockResponse = {
            data: [{ id: 'collab-1', ...mockCollab, active: true }],
            error: null
        };

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockResponse)
            })
        } as any);

        const { result } = renderHook(() => useCollaborators());

        await act(async () => {
            await result.current.addCollaborator(mockCollab);
        });

        await waitFor(() => {
            expect(result.current.collaborators).toHaveLength(1);
            expect(result.current.collaborators[0].name).toBe('João Técnico');
            expect(result.current.collaborators[0].active).toBe(true);
        });
    });

    it('should update a collaborator', async () => {
        const { supabase } = await import('@/lib/supabase');

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [{ id: 'collab-1', name: 'João', role: 'Técnico', team: '', phone: '', active: true }],
                    error: null
                })
            }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        } as any);

        const { result } = renderHook(() => useCollaborators());

        await act(async () => {
            await result.current.addCollaborator({ name: 'João', role: 'Técnico', team: '', phone: '' });
        });

        await act(async () => {
            await result.current.updateCollaborator('collab-1', { role: 'Supervisor' });
        });

        await waitFor(() => {
            expect(result.current.collaborators[0].role).toBe('Supervisor');
        });
    });

    it('should delete a collaborator', async () => {
        const { supabase } = await import('@/lib/supabase');

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [{ id: 'collab-1', name: 'Test', role: 'Test', team: '', phone: '', active: true }],
                    error: null
                })
            }),
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        } as any);

        const { result } = renderHook(() => useCollaborators());

        await act(async () => {
            await result.current.addCollaborator({ name: 'Test', role: 'Test', team: '', phone: '' });
        });

        expect(result.current.collaborators).toHaveLength(1);

        await act(async () => {
            await result.current.deleteCollaborator('collab-1');
        });

        await waitFor(() => {
            expect(result.current.collaborators).toHaveLength(0);
        });
    });
});
