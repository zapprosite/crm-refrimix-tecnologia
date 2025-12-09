import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    const isSuperAdmin = (email?: string | null) => email === ADMIN_EMAIL;

    const checkApprovalStatus = async () => {
        if (!user) {
            setApprovalStatus(null);
            setIsAdmin(false);
            setHasFullAccess(false);
            return;
        }

        // Super Admin is always approved and has full access
        if (isSuperAdmin(user.email)) {
            setApprovalStatus('approved');
            setIsAdmin(true);
            setHasFullAccess(true);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('approval_status')
                .eq('id', user.id)
                .single();

            if (error) {
                console.log('[AuthContext] No profile found, creating one...');
                // Create profile if doesn't exist
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        avatar_url: user.user_metadata?.avatar_url,
                        approval_status: 'pending'
                    });

                if (insertError) {
                    console.error('[AuthContext] Error creating profile:', insertError);
                }
                setApprovalStatus('pending');
                setIsAdmin(false);
                setHasFullAccess(false);
                return;
            }

            const status = data?.approval_status || 'pending';
            setApprovalStatus(status);

            // Check if user has full access (approved or admin role logic if implemented later)
            // For now, only Super Admin and Approved users have access
            setHasFullAccess(status === 'approved');
            setIsAdmin(false); // Only zappro.ia is admin for now

        } catch (error) {
            console.error('[AuthContext] Error checking approval:', error);
            setApprovalStatus('pending');
            setHasFullAccess(false);
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        console.log('[AuthContext] Initializing auth...');
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthContext] Initial session:', session?.user?.id ?? 'null');
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('[AuthContext] Auth state changed:', _event, session?.user?.id ?? 'null');
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Check approval status when user changes
    useEffect(() => {
        if (user) {
            checkApprovalStatus();
        } else {
            setApprovalStatus(null);
            setIsAdmin(false);
            setHasFullAccess(false);
        }
    }, [user]);

    const signInWithPassword = async (email: string, password: string) => {
        console.log('[AuthContext] Attempting login for:', email);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            console.log('[AuthContext] Setting user:', data.user?.id);
            setUser(data.user);
            toast.success('Login realizado com sucesso!');
        } catch (error: any) {
            console.error('[AuthContext] Login error:', error);
            toast.error(`Erro ao fazer login: ${error.message}`);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        console.log('[AuthContext] Attempting Google login...');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('[AuthContext] Google login error:', error);
            toast.error(`Erro ao fazer login com Google: ${error.message}`);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setApprovalStatus(null);
            setIsAdmin(false);
            setHasFullAccess(false);
            toast.success('Logout realizado com sucesso!');
        } catch (error: any) {
            console.error('Logout error:', error);
            toast.error(`Erro ao fazer logout: ${error.message}`);
            throw error;
        }
    };

    const updateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'pending') => {
        if (!isSuperAdmin(user?.email)) {
            toast.error('Apenas o administrador pode realizar esta ação.');
            return;
        }

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ approval_status: status })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Usuário ${status === 'approved' ? 'aprovado' : 'atualizado'} com sucesso!`);
        } catch (error: any) {
            console.error('Error updating user status:', error);
            toast.error(`Erro ao atualizar status: ${error.message}`);
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
            checkApprovalStatus,
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
