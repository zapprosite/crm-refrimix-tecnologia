import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  Fan,
  LogOut,
  FileText,
  Wrench,
  Wallet,
  ClipboardList,
  ShieldCheck,
  Package // Import Package icon
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads & Clientes', path: '/leads' },
  { icon: CalendarDays, label: 'Agendamentos', path: '/schedule' },
  { icon: ClipboardList, label: 'Tarefas & Equipe', path: '/tasks' },
  { icon: FileText, label: 'Orçamentos', path: '/quotes' },
  { icon: Wrench, label: 'Manutenção / PMOC', path: '/maintenance' },
  { icon: Package, label: 'Estoque', path: '/inventory' },
  { icon: Wallet, label: 'Financeiro', path: '/finance' },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-slate-900 dark:bg-slate-950 text-white fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center justify-between border-b border-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Fan className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Refrimix<br />Tecnologia</h1>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Link - Only visible to admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4",
              location.pathname === '/admin'
                ? "bg-blue-600 text-white"
                : "text-blue-300 hover:bg-blue-900/50 hover:text-white"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Gerenciar Usuários</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
