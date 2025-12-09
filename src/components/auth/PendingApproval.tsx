import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, Mail } from 'lucide-react';

export function PendingApproval() {
    const { user, signOut, approvalStatus } = useAuth();

    if (approvalStatus === 'rejected') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold dark:text-white">Acesso Negado</CardTitle>
                        <CardDescription className="dark:text-slate-400">
                            Seu acesso ao CRM Refrimix foi negado pelo administrador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            <p>Email: {user?.email}</p>
                        </div>
                        <Button onClick={signOut} variant="outline" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair e tentar outro email
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold dark:text-white">Aguardando Aprovação</CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        Seu cadastro está sendo analisado pelo administrador.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                            Conectado como:
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {user?.email}
                        </p>
                        {user?.user_metadata?.full_name && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {user.user_metadata.full_name}
                            </p>
                        )}
                    </div>
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                        <p>Um email foi enviado ao administrador.</p>
                        <p>Você receberá acesso assim que for aprovado.</p>
                    </div>
                    <Button onClick={signOut} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
