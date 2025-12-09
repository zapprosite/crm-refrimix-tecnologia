import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, DollarSign, Activity, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ef4444'];

export function Dashboard() {
  const { kpis, leads } = useApp();

  // Calcular dados dinâmicos para o gráfico de Origem
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    leads.forEach(lead => {
      const source = lead.source || 'Outros';
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.keys(sources).map(key => ({ name: key, value: sources[key] }));
  }, [leads]);

  // Calcular dados dinâmicos para o gráfico de Faturamento (Baseado em leads Fechados)
  const revenueData = useMemo(() => {
    const months: Record<string, number> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Inicializar meses atuais (últimos 6 meses para exemplo)
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = monthNames[d.getMonth()];
      months[key] = 0;
    }

    leads.filter(l => l.status === 'Fechado').forEach(lead => {
      const date = new Date(lead.date);
      const key = monthNames[date.getMonth()];
      if (months[key] !== undefined) {
        months[key] += (lead.value || 0);
      }
    });

    return Object.keys(months).map(key => ({ name: key, total: months[key] }));
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500">Visão geral de performance e métricas.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total acumulado de leads fechados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{kpis.newLeads}</div>
            <p className="text-xs text-muted-foreground">
              Total de leads ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Leads convertidos em vendas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Agendados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.scheduledServices}</div>
            <p className="text-xs text-muted-foreground">
              Total na agenda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Faturamento (Últimos 6 Meses)</CardTitle>
            <CardDescription>Receita baseada em leads com status "Fechado".</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Origem dos Leads</CardTitle>
            <CardDescription>Distribuição real por canal de aquisição.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
