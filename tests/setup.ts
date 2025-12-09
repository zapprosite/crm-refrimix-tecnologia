import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global Supabase Mock
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(), // Helpful for mocks
        })),
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            signInWithPassword: vi.fn(),
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } }
            })),
        },
        storage: {
            from: vi.fn(() => ({
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.url/img.png' } })),
            })),
        }
    }
}));

// Mock ResizeObserver (often needed for UI components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
