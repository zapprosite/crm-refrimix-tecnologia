import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export function AdminUsers() {
    const { isAdmin, updateUserStatus } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const handleStatusChange = async (userId: string, status: 'approved' | 'rejected') => {
        try {
            await updateUserStatus(userId, status);
            // Refresh list locally
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, approval_status: status } : u));
        } catch (error) {
            // Error handled in context
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-red-500">Acesso restrito apenas para administradores.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciamento de Usuários</h1>
                    <p className="text-slate-500 dark:text-slate-400">Aprove ou rejeite o acesso de novos usuários.</p>
                </div>
                <Button onClick={fetchUsers} variant="outline" size="sm">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar Lista
                </Button>
            </div>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                    <CardDescription>Lista de todos os usuários que tentaram se cadastrar no sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border dark:border-slate-700">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-slate-700">
                                    <TableHead className="dark:text-slate-300">Usuário</TableHead>
                                    <TableHead className="dark:text-slate-300">Email</TableHead>
                                    <TableHead className="dark:text-slate-300">Status</TableHead>
                                    <TableHead className="dark:text-slate-300">Data Cadastro</TableHead>
                                    <TableHead className="text-right dark:text-slate-300">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                            Nenhum usuário encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="dark:border-slate-700">
                                            <TableCell className="font-medium dark:text-white">
                                                {user.full_name || 'Sem nome'}
                                            </TableCell>
                                            <TableCell className="dark:text-slate-300">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.approval_status === 'approved' ? 'default' :
                                                            user.approval_status === 'rejected' ? 'destructive' : 'secondary'
                                                    }
                                                    className={
                                                        user.approval_status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                                            user.approval_status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                                                                'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200'
                                                    }
                                                >
                                                    {user.approval_status === 'approved' ? 'Aprovado' :
                                                        user.approval_status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="dark:text-slate-300">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {user.email !== 'zappro.ia@gmail.com' && (
                                                    <>
                                                        {user.approval_status !== 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => handleStatusChange(user.id, 'approved')}
                                                                title="Aprovar Acesso"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {user.approval_status !== 'rejected' && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleStatusChange(user.id, 'rejected')}
                                                                title="Negar Acesso"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                                {user.email === 'zappro.ia@gmail.com' && (
                                                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                                                        <Shield className="h-3 w-3 mr-1" /> Admin
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
