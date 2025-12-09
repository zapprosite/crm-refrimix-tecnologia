import { useState } from 'react';
import { useApp, Lead, Equipment } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, QrCode, Trash2, FileCheck, CalendarClock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format, addMonths, parseISO, isBefore } from 'date-fns';

export function Maintenance() {
  const { leads, equipments, addEquipment, deleteEquipment } = useApp();
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState<string | null>(null);

  const [newEq, setNewEq] = useState({
    name: '',
    brand: '',
    model: '',
    serial: '',
    btu: '',
    type: 'Split',
    installDate: new Date().toISOString().split('T')[0],
    frequency: 'Mensal',
  });

  const pmocLeads = leads.filter(l => l.document && (l.document.length > 14 || l.document.includes('/')));
  const residentialLeads = leads.filter(l => !l.document || (l.document.length <= 14 && !l.document.includes('/')));

  const handleAddEquipment = async () => {
    if (!selectedLeadId || !newEq.name) return;

    const frequency = newEq.frequency as Equipment['frequency'];
    let monthsToAdd = 1;
    if (frequency === 'Trimestral') monthsToAdd = 3;
    if (frequency === 'Semestral') monthsToAdd = 6;
    if (frequency === 'Anual') monthsToAdd = 12;

    const nextDate = addMonths(new Date(), monthsToAdd);

    await addEquipment({
      leadId: selectedLeadId,
      name: newEq.name,
      brand: newEq.brand,
      model: newEq.model,
      serial: newEq.serial,
      btu: newEq.btu,
      type: newEq.type as Equipment['type'],
      installDate: newEq.installDate,
      frequency: frequency,
      nextMaintenance: nextDate.toISOString().split('T')[0],
    });

    setIsAddModalOpen(false);
    setNewEq({
      name: '', brand: '', model: '', serial: '', btu: '', type: 'Split',
      installDate: new Date().toISOString().split('T')[0], frequency: 'Mensal'
    });
  };

  const getStatusColor = (dateStr: string) => {
    const today = new Date();
    const nextDate = parseISO(dateStr);
    if (isBefore(nextDate, today)) return "destructive";
    if (isBefore(nextDate, addMonths(today, 1))) return "secondary";
    return "default";
  };

  const getStatusText = (dateStr: string) => {
    const today = new Date();
    const nextDate = parseISO(dateStr);
    if (isBefore(nextDate, today)) return "Atrasado";
    if (isBefore(nextDate, addMonths(today, 1))) return "Próximo";
    return "Em dia";
  };

  const renderEquipmentList = (clientLeads: Lead[]) => {
    return (
      <div className="space-y-6">
        {clientLeads.map(lead => {
          const leadEquipments = equipments.filter(e => e.leadId === lead.id);
          if (leadEquipments.length === 0) return null;

          return (
            <Card key={lead.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{lead.name}</CardTitle>
                    <CardDescription>{lead.company !== 'N/A' ? lead.company : 'Cliente Particular'} • {lead.document || 'Sem documento'}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedLeadId(lead.id); setIsAddModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Eq.
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Equipamento</th>
                        <th className="px-4 py-3">Detalhes</th>
                        <th className="px-4 py-3">Frequência</th>
                        <th className="px-4 py-3">Próx. Manutenção</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leadEquipments.map(eq => (
                        <tr key={eq.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex flex-col">
                              <span>{eq.name}</span>
                              <span className="text-xs text-slate-400">{eq.qrCodeId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {eq.brand} {eq.model} • {eq.btu} BTUs
                            <div className="text-xs">{eq.type}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{eq.frequency}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-slate-400" />
                              {format(parseISO(eq.nextMaintenance), 'dd/MM/yyyy')}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={getStatusColor(eq.nextMaintenance)}>
                                {getStatusText(eq.nextMaintenance)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" onClick={() => setQrModalOpen(eq.id)}>
                                <QrCode className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteEquipment(eq.id)}>
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {clientLeads.every(l => equipments.filter(e => e.leadId === l.id).length === 0) && (
            <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                Nenhum contrato de manutenção ativo para esta categoria.
                <br />
                <Button variant="link" onClick={() => setIsAddModalOpen(true)}>Cadastrar primeiro equipamento</Button>
            </div>
        )}
      </div>
    );
  };

  const selectedEquipmentForQr = equipments.find(e => e.id === qrModalOpen);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manutenção & PMOC</h1>
          <p className="text-slate-500">Gestão de contratos, planos de manutenção e ativos.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Equipamento
        </Button>
      </div>

      <Tabs defaultValue="pmoc" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="pmoc" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" /> PMOC (Empresas)
          </TabsTrigger>
          <TabsTrigger value="residential" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Residencial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pmoc" className="mt-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-900 text-sm">Requisito Legal (Lei 13.589/2018)</h4>
                    <p className="text-sm text-blue-700">Empresas e edifícios públicos/coletivos são obrigados a manter um PMOC. A periodicidade padrão recomendada é mensal para verificação de limpeza e filtros.</p>
                </div>
            </div>
            {renderEquipmentList(pmocLeads)}
        </TabsContent>
        
        <TabsContent value="residential" className="mt-6">
             <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-green-900 text-sm">Planos Preventivos</h4>
                    <p className="text-sm text-green-700">Para clientes residenciais, recomenda-se limpeza profunda semestral ou anual para garantir a qualidade do ar e eficiência energética.</p>
                </div>
            </div>
            {renderEquipmentList(residentialLeads)}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Equipamento</DialogTitle>
            <DialogDescription>Adicione um ar-condicionado ao plano de manutenção.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Cliente / Contrato</Label>
              <Select onValueChange={setSelectedLeadId} value={selectedLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} {lead.company !== 'N/A' ? `(${lead.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Nome do Local/Equipamento</Label>
              <Input placeholder="Ex: Split Quarto Casal" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Marca</Label>
                    <Input placeholder="Ex: Samsung" value={newEq.brand} onChange={e => setNewEq({...newEq, brand: e.target.value})} />
                </div>
                <div className="grid gap-2">
                    <Label>Modelo</Label>
                    <Input placeholder="Ex: AR12" value={newEq.model} onChange={e => setNewEq({...newEq, model: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Nº Série</Label>
                    <Input placeholder="SN..." value={newEq.serial} onChange={e => setNewEq({...newEq, serial: e.target.value})} />
                </div>
                <div className="grid gap-2">
                    <Label>Capacidade (BTUs)</Label>
                    <Input placeholder="Ex: 12000" value={newEq.btu} onChange={e => setNewEq({...newEq, btu: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select onValueChange={v => setNewEq({...newEq, type: v})} value={newEq.type}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Split">Split Hi-Wall</SelectItem>
                            <SelectItem value="Cassette">Cassette</SelectItem>
                            <SelectItem value="Piso Teto">Piso Teto</SelectItem>
                            <SelectItem value="Janela">Janela</SelectItem>
                            <SelectItem value="VRF">VRF</SelectItem>
                            <SelectItem value="Multi-Split">Multi-Split</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Frequência</Label>
                    <Select onValueChange={v => setNewEq({...newEq, frequency: v})} value={newEq.frequency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mensal">Mensal (PMOC)</SelectItem>
                            <SelectItem value="Trimestral">Trimestral</SelectItem>
                            <SelectItem value="Semestral">Semestral</SelectItem>
                            <SelectItem value="Anual">Anual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddEquipment}>Salvar e Gerar QR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrModalOpen} onOpenChange={() => setQrModalOpen(null)}>
        <DialogContent className="sm:max-w-[400px] text-center">
            <DialogHeader>
                <DialogTitle>Etiqueta de Identificação</DialogTitle>
                <DialogDescription>Imprima e cole no equipamento para acesso rápido.</DialogDescription>
            </DialogHeader>
            
            {selectedEquipmentForQr && (
                <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none print:border-0">
                    <div className="border-4 border-black p-2 bg-white">
                        <QRCode 
                            value={JSON.stringify({ id: selectedEquipmentForQr.id, type: 'maintenance_check' })} 
                            size={180} 
                        />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg uppercase">{selectedEquipmentForQr.qrCodeId}</h3>
                        <p className="text-sm text-slate-500">{selectedEquipmentForQr.name}</p>
                        <p className="text-xs text-slate-400">{selectedEquipmentForQr.brand} - {selectedEquipmentForQr.btu} BTUs</p>
                    </div>
                </div>
            )}
            
            <Button className="w-full" onClick={() => window.print()}>
                <QrCode className="mr-2 h-4 w-4" /> Imprimir Etiqueta
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
