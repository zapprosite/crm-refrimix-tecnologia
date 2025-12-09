import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { MapPin, User, Wrench, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

export function Schedule() {
  const { appointments, addAppointment } = useApp();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [newAppt, setNewAppt] = useState({ title: '', client: '', time: '', type: 'Instalação', address: '' });

  const handleAddAppointment = () => {
    if (!date || !newAppt.title || !newAppt.client) return;
    
    addAppointment({
      ...newAppt,
      date: date.toISOString(),
    });
    
    setIsDialogOpen(false);
    setNewAppt({ title: '', client: '', time: '', type: 'Instalação', address: '' });
    toast.success('Agendamento criado com sucesso!');
  };

  const filteredAppointments = appointments.filter(
    (appt) => date && new Date(appt.date).toDateString() === date.toDateString()
  );

  // Criar modificadores para o calendário (dias com agendamento)
  const appointmentDates = appointments.map(a => new Date(a.date));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agendamento Técnico</h1>
          <p className="text-slate-500">Gerencie instalações e manutenções.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agendar Serviço</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título do Serviço</Label>
                        <Input 
                            id="title" 
                            placeholder="Ex: Instalação AC Sala" 
                            value={newAppt.title}
                            onChange={(e) => setNewAppt({...newAppt, title: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client">Cliente</Label>
                        <Input 
                            id="client" 
                            placeholder="Nome do cliente"
                            value={newAppt.client}
                            onChange={(e) => setNewAppt({...newAppt, client: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="time">Horário</Label>
                            <Input 
                                id="time" 
                                type="time"
                                value={newAppt.time}
                                onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select 
                                value={newAppt.type} 
                                onValueChange={(val) => setNewAppt({...newAppt, type: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Instalação">Instalação</SelectItem>
                                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                                    <SelectItem value="Visita Técnica">Visita Técnica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input 
                            id="address" 
                            placeholder="Endereço do serviço"
                            value={newAppt.address}
                            onChange={(e) => setNewAppt({...newAppt, address: e.target.value})}
                        />
                    </div>
                </div>
                <Button onClick={handleAddAppointment}>Confirmar Agendamento</Button>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver a agenda.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-md border shadow"
              modifiers={{
                booked: appointmentDates
              }}
              modifiersStyles={{
                booked: { fontWeight: 'bold', textDecoration: 'underline', color: '#2563eb' }
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
                Agenda para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'Hoje'}
            </CardTitle>
            <CardDescription>
                {filteredAppointments.length} serviços agendados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    Nenhum agendamento para esta data.
                </div>
              ) : (
                filteredAppointments.map((appt) => (
                    <div key={appt.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Wrench className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">{appt.title}</h3>
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {appt.time}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" /> {appt.client}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {appt.address}
                                </span>
                            </div>
                            <div className="pt-2">
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {appt.type}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
