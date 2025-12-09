import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Download, MoreHorizontal, DollarSign } from 'lucide-react';
import { LeadForm } from '@/components/forms/LeadForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  'Novo': 'default',
  'Em Atendimento': 'secondary',
  'Orçamento': 'outline',
  'Fechado': 'default',
};

export function Leads() {
  const { leads, addLead, updateLeadStatus, exportLeadsToCSV, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLead = async (data: any) => {
    await addLead({
      name: data.name,
      company: 'N/A',
      phone: data.phone,
      status: data.status,
      source: data.source || 'Google',
      email: data.email,
      document: data.document,
      address: data.address,
      city: data.city,
      state: data.state,
      value: data.value
    });
    setIsDialogOpen(false);
    toast.success('Lead cadastrado com sucesso!');
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await updateLeadStatus(id, newStatus);
    toast.success(`Status atualizado para ${newStatus}`);
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="p-8 text-center">Carregando dados...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Leads</h1>
          <p className="text-slate-500">Acompanhe seus potenciais clientes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportLeadsToCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Lead</DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente interessado.
                </DialogDescription>
              </DialogHeader>
              <LeadForm onSubmit={handleAddLead} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa/Tipo</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor Est.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>{formatMoney(lead.value || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[lead.status] || 'outline'}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Novo')}>Mover para Novo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Em Atendimento')}>Mover para Atendimento</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Orçamento')}>Mover para Orçamento</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Fechado')}>Marcar como Fechado</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)] overflow-x-auto pb-4">
            {['Novo', 'Em Atendimento', 'Orçamento', 'Fechado'].map((status) => (
              <div key={status} className="flex flex-col bg-slate-100/50 rounded-lg border border-slate-200 p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-slate-700">{status}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredLeads.filter(l => l.status === status).length}
                  </Badge>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {filteredLeads
                    .filter(lead => lead.status === status)
                    .map(lead => (
                      <div key={lead.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group relative">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-slate-900 truncate max-w-[120px]">{lead.name}</span>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Novo')}>Mover para Novo</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Em Atendimento')}>Mover para Atendimento</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Orçamento')}>Mover para Orçamento</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(lead.id, 'Fechado')}>Marcar como Fechado</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">{lead.company}</div>
                        <div className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatMoney(lead.value || 0)}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <span>{lead.phone}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
