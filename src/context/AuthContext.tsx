import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | null;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    approvalStatus: ApprovalStatus;
    isAdmin: boolean;
    hasFullAccess: boolean;
    signInWithPassword: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    checkApprovalStatus: () => Promise<void>;
    updateUserStatus: (userId: string, status: 'approved' | 'rejected' | 'pending') => Promise<void>;
}

const ADMIN_EMAIL = 'zappro.ia@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasFullAccess, setHasFullAccess] = useState(false);

    // Helper to check if email is the super admin
    const isSuperAdmin = useCallback((email?: string | null) => {
        return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    }, []);

    const checkApprovalStatus = useCallback(async (currentUser: User | null) => {
        if (!currentUser || !currentUser.email) {
            setApprovalStatus(null);
            setIsAdmin(false);
            setHasFullAccess(false);
            return;
        }

        // Fast path for Super Admin
        if (isSuperAdmin(currentUser.email)) {
            setApprovalStatus('approved');
            setIsAdmin(true);
            setHasFullAccess(true);
            return;
        }

        try {
            // Optimized query: minimal fields, single row
            const { data, error } = await supabase
                .from('user_profiles')
                .select('approval_status')
                .eq('id', currentUser.id)
                .maybeSingle(); // Prevents 406 error if multiple rows (shouldn't happen but safer)

            if (error) throw error;

            if (!data) {
                // Profile doesn't exist, try to create it silently
                console.log('[Auth] Creating missing profile...');
                await supabase.from('user_profiles').insert({
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
                    avatar_url: currentUser.user_metadata?.avatar_url,
                    approval_status: 'pending'
                });

                setApprovalStatus('pending');
                setIsAdmin(false);
                setHasFullAccess(false);
                return;
            }

            const status = data.approval_status as ApprovalStatus;
            setApprovalStatus(status);
            setHasFullAccess(status === 'approved');
            setIsAdmin(false);

        } catch (error) {
            console.error('[Auth] Approval check failed:', error);
            // Fallback to safe state
            setApprovalStatus('pending');
            setHasFullAccess(false);
            setIsAdmin(false);
        }
    }, [isSuperAdmin]);

    // Initial Session Load
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    if (session?.user) {
                        setUser(session.user);
                        await checkApprovalStatus(session.user);
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('[Auth] Init error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                setLoading(true); // Show loading while checking approval
                await checkApprovalStatus(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [checkApprovalStatus]);

    const signInWithPassword = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success('Bem-vindo de volta!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer login');
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Erro ao iniciar login Google');
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setApprovalStatus(null);
            setIsAdmin(false);
            setHasFullAccess(false);
            toast.success('Desconectado com sucesso');
        } catch (error: any) {
            toast.error('Erro ao sair');
        }
    };

    const updateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'pending') => {
        if (!isAdmin) {
            toast.error('Permissão negada');
            return;
        }
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ approval_status: status })
                .eq('id', userId);
            if (error) throw error;
            toast.success('Status atualizado!');
        } catch (error) {
            toast.error('Erro ao atualizar status');
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            approvalStatus,
            isAdmin,
            hasFullAccess,
            signInWithPassword,
            signInWithGoogle,
            signOut,
            checkApprovalStatus: () => checkApprovalStatus(user),
            updateUserStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
