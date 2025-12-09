import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Upload, TrendingDown, Wallet, Building2, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Finance() {
  const { transactions, addTransaction, updateTransactionEntity, deleteTransaction, importTransactions, kpis } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CNPJ' | 'CPF'>('ALL');

  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Serviços',
    type: 'income',
    entity: 'CNPJ'
  });

  const handleAdd = async () => {
    if (!newTx.description || !newTx.amount) {
      toast.error('Preencha a descrição e o valor.');
      return;
    }
    const val = parseFloat(newTx.amount);
    if (isNaN(val)) {
      toast.error('Valor inválido.');
      return;
    }

    const success = await addTransaction({
      description: newTx.description,
      amount: newTx.type === 'expense' ? -Math.abs(val) : Math.abs(val),
      date: newTx.date,
      category: newTx.category,
      type: newTx.type as 'income' | 'expense',
      entity: newTx.entity as 'CNPJ' | 'CPF'
    });

    if (success) {
      setIsAddOpen(false);
      setNewTx({ ...newTx, description: '', amount: '' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        importTransactions(text);
      };
      reader.readAsText(file);
    }
  };

  const filteredTransactions = transactions.filter(t => filter === 'ALL' || t.entity === filter);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const chartData = [
    {
      name: 'CNPJ',
      Receitas: transactions.filter(t => t.entity === 'CNPJ' && t.amount > 0).reduce((a, b) => a + b.amount, 0),
      Despesas: Math.abs(transactions.filter(t => t.entity === 'CNPJ' && t.amount < 0).reduce((a, b) => a + b.amount, 0)),
    },
    {
      name: 'CPF',
      Receitas: transactions.filter(t => t.entity === 'CPF' && t.amount > 0).reduce((a, b) => a + b.amount, 0),
      Despesas: Math.abs(transactions.filter(t => t.entity === 'CPF' && t.amount < 0).reduce((a, b) => a + b.amount, 0)),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Fluxo de Caixa</h1>
          <p className="text-slate-500 dark:text-slate-400">Controle financeiro com separação de contas.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input type="file" id="ofx-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />
            <label htmlFor="ofx-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span><Upload className="mr-2 h-4 w-4" /> Importar Extrato (CSV)</span>
              </Button>
            </label>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><DollarSign className="mr-2 h-4 w-4" /> Novo Lançamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Transação</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input value={newTx.description} onChange={e => setNewTx({ ...newTx, description: e.target.value })} placeholder="Ex: Pagamento Aluguel" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <div className="relative">
                      <select
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none dark:bg-slate-950 dark:text-white"
                        value={newTx.type}
                        onChange={e => setNewTx({ ...newTx, type: e.target.value })}
                      >
                        <option value="income" className="dark:bg-slate-900">Receita (+)</option>
                        <option value="expense" className="dark:bg-slate-900">Despesa (-)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Conta (Entidade)</Label>
                    <div className="relative">
                      <select
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none dark:bg-slate-950 dark:text-white"
                        value={newTx.entity}
                        onChange={e => setNewTx({ ...newTx, entity: e.target.value })}
                      >
                        <option value="CNPJ" className="dark:bg-slate-900">Empresa (CNPJ)</option>
                        <option value="CPF" className="dark:bg-slate-900">Pessoal (CPF)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Saldo Geral</CardTitle>
            <Wallet className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.financial.balanceTotal)}</div>
            <p className="text-xs text-slate-400">Soma de todas as contas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Empresa (CNPJ)</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.financial.balanceCNPJ < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(kpis.financial.balanceCNPJ)}
            </div>
            <p className="text-xs text-muted-foreground">Caixa operacional</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pessoal (CPF)</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.financial.balanceCPF < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(kpis.financial.balanceCPF)}
            </div>
            <p className="text-xs text-muted-foreground">Retiradas e gastos pessoais</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Extrato de Lançamentos</CardTitle>
              <Tabs defaultValue="ALL" onValueChange={(v) => setFilter(v as 'ALL' | 'CNPJ' | 'CPF')}>
                <TabsList>
                  <TabsTrigger value="ALL">Tudo</TabsTrigger>
                  <TabsTrigger value="CNPJ">CNPJ</TabsTrigger>
                  <TabsTrigger value="CPF">CPF</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tx.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.entity === 'CNPJ' ? 'default' : 'secondary'}
                        className="cursor-pointer hover:opacity-80 select-none"
                        onClick={() => updateTransactionEntity(tx.id, tx.entity === 'CNPJ' ? 'CPF' : 'CNPJ')}
                      >
                        {tx.entity}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => deleteTransaction(tx.id)}>
                        <TrendingDown className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo</CardTitle>
            <CardDescription>Receitas vs Despesas por Entidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(val) => `R$${val / 1000}k`} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="Receitas" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-slate-500 text-center">
              Dica: Clique na etiqueta "CNPJ" ou "CPF" na tabela para reclassificar um lançamento importado.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
