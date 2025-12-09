import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    text?: string;
    className?: string;
}

export function LoadingSpinner({ text = 'Carregando...', className = '' }: LoadingSpinnerProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {text && <p className="mt-2 text-sm text-muted-foreground animate-pulse">{text}</p>}
        </div>
    );
}

export function FullScreenLoading({ text = 'Iniciando sistema...' }: { text?: string }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg text-foreground">CRM Refrimix</h3>
                    <p className="text-sm text-muted-foreground">{text}</p>
                </div>
            </div>
        </div>
    );
}
