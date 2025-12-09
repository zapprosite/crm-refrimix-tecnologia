import { useState } from 'react';
import { useApp, WorkTask } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Trash2, UserPlus, Calendar, Clock, Users, Briefcase, CheckCircle2, Circle, FileText } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Componentes DnD ---

// Coluna do Dia (Droppable)
function DroppableDay({ date, children }: { date: Date, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: date.toISOString(),
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full min-h-[500px] bg-slate-50 rounded-lg border border-slate-200"
        >
            <div className="p-3 border-b border-slate-200 bg-slate-100 rounded-t-lg text-center">
                <div className="font-bold text-slate-700 capitalize">{format(date, 'EEEE', { locale: ptBR })}</div>
                <div className="text-xs text-slate-500">{format(date, 'dd/MM')}</div>
            </div>
            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

// Card da Tarefa (Draggable)
function DraggableTask({ task, collaboratorName, onStatusChange, onDelete, hasQuote }: { task: WorkTask, collaboratorName: string, onStatusChange: () => void, onDelete: () => void, hasQuote: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
        'Pendente': 'secondary',
        'Em Progresso': 'default',
        'Concluído': 'success',
        'Cancelado': 'destructive'
    };

    // Badge customizada para sucesso
    const getBadgeVariant = (status: string) => {
        if (status === 'Concluído') return 'outline'; // Fallback visual
        return statusColors[status] || 'outline';
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-white p-3 rounded border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative cursor-grab active:cursor-grabbing ${task.status === 'Concluído' ? 'opacity-70' : ''}`}
        >
            <div className="flex justify-between items-start">
                <span className={`font-semibold text-sm text-slate-800 line-clamp-2 ${task.status === 'Concluído' ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                </span>
                <div onPointerDown={(e) => e.stopPropagation()}>
                    {task.status === 'Concluído' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <Circle className="h-4 w-4 text-slate-300 cursor-pointer hover:text-blue-500" onClick={onStatusChange} />
                    )}
                </div>
            </div>

            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {task.startTime} - {task.endTime}
            </div>

            <div className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                <Users className="h-3 w-3" /> {collaboratorName}
            </div>

            <div className="mt-2 flex justify-between items-center">
                <div className="flex gap-1">
                    <Badge variant={getBadgeVariant(task.status) as any} className={`text-[10px] px-1 h-5 ${task.status === 'Concluído' ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                        {task.status}
                    </Badge>
                    {hasQuote && (
                        <Badge variant="outline" className="text-[10px] px-1 h-5 bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-0.5">
                            <FileText className="h-3 w-3" /> Orç.
                        </Badge>
                    )}
                </div>

                <div onPointerDown={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600" onClick={onDelete}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function Tasks() {
    const { collaborators, tasks, quotes, addCollaborator, deleteCollaborator, addTask, updateTaskStatus, moveTask, deleteTask } = useApp();

    // States
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
    const [newCollab, setNewCollab] = useState({ name: '', role: '', team: '', phone: '' });
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [activeId, setActiveId] = useState<string | null>(null); // Para DragOverlay

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '10:00',
        collaboratorId: '',
        type: 'Avulsa',
        quoteId: 'none'
    });

    // Handlers
    const handleAddCollab = () => {
        if (!newCollab.name || !newCollab.role) return;
        addCollaborator(newCollab);
        setIsCollabModalOpen(false);
        setNewCollab({ name: '', role: '', team: '', phone: '' });
    };

    const handleAddTask = () => {
        if (!newTask.title || !newTask.collaboratorId) return;
        addTask({
            ...newTask,
            type: newTask.type as any,
            quoteId: newTask.quoteId === 'none' ? undefined : newTask.quoteId
        });
        setIsTaskModalOpen(false);
        setNewTask({ ...newTask, title: '', description: '', quoteId: 'none' });
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            // over.id é o ISOString da data da coluna
            const newDate = over.id as string;
            // Converter para YYYY-MM-DD
            const formattedDate = newDate.split('T')[0];

            moveTask(active.id as string, formattedDate);
        }
    };

    const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i));

    const getTasksForDay = (date: Date) => {
        return tasks.filter(t => isSameDay(parseISO(t.date), date)).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const getCollaboratorName = (id: string) => collaborators.find(c => c.id === id)?.name || 'Desconhecido';

    // Item ativo para overlay
    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tarefas & Equipes</h1>
                    <p className="text-slate-500">Organização operacional e gestão de colaboradores.</p>
                </div>
            </div>

            <Tabs defaultValue="board" className="w-full">
                <TabsList>
                    <TabsTrigger value="board"><Calendar className="mr-2 h-4 w-4" /> Quadro Semanal</TabsTrigger>
                    <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" /> Colaboradores</TabsTrigger>
                </TabsList>

                {/* --- ABA QUADRO SEMANAL (COM DND) --- */}
                <TabsContent value="board" className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>Anterior</Button>
                            <span className="font-medium text-lg min-w-[200px] text-center">
                                {format(currentWeekStart, "dd 'de' MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 5), "dd 'de' MMM", { locale: ptBR })}
                            </span>
                            <Button variant="outline" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>Próxima</Button>
                        </div>
                        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Nova Tarefa</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Agendar Tarefa</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Título</Label>
                                        <Input
                                            data-testid="task-title-input"
                                            value={newTask.title}
                                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                            placeholder="Ex: Instalação Cliente X"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Vincular Orçamento (Opcional)</Label>
                                        <Select value={newTask.quoteId} onValueChange={v => {
                                            const quote = quotes.find(q => q.id === v);
                                            setNewTask({
                                                ...newTask,
                                                quoteId: v,
                                                title: quote ? `Serviço: ${quote.clientName}` : newTask.title,
                                                description: quote ? `Orçamento #${quote.quoteNumber} - Total: R$${quote.totalValue}` : newTask.description
                                            });
                                        }}>
                                            <SelectTrigger><SelectValue placeholder="Selecione um orçamento..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Nenhum</SelectItem>
                                                {quotes.map(q => (
                                                    <SelectItem key={q.id} value={q.id}>#{q.quoteNumber} - {q.clientName} (R${q.totalValue})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Data</Label>
                                            <Input type="date" value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Tipo</Label>
                                            <Select value={newTask.type} onValueChange={v => setNewTask({ ...newTask, type: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Avulsa">Avulsa</SelectItem>
                                                    <SelectItem value="Orçamento">Orçamento</SelectItem>
                                                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                                                    <SelectItem value="Instalação">Instalação</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Início</Label>
                                            <Input type="time" value={newTask.startTime} onChange={e => setNewTask({ ...newTask, startTime: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Fim</Label>
                                            <Input type="time" value={newTask.endTime} onChange={e => setNewTask({ ...newTask, endTime: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Responsável</Label>
                                        <Select value={newTask.collaboratorId} onValueChange={v => setNewTask({ ...newTask, collaboratorId: v })}>
                                            <SelectTrigger data-testid="task-collab-trigger"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                            <SelectContent>
                                                {collaborators.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.role})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleAddTask} data-testid="task-save-button">Salvar Tarefa</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {weekDays.map((day) => (
                                <DroppableDay key={day.toISOString()} date={day}>
                                    {getTasksForDay(day).map(task => (
                                        <DraggableTask
                                            key={task.id}
                                            task={task}
                                            collaboratorName={getCollaboratorName(task.collaboratorId)}
                                            onStatusChange={() => updateTaskStatus(task.id, 'Concluído')}
                                            onDelete={() => deleteTask(task.id)}
                                            hasQuote={!!task.quoteId}
                                        />
                                    ))}
                                    {getTasksForDay(day).length === 0 && (
                                        <div className="text-center py-8 text-slate-300 text-xs">Livre</div>
                                    )}
                                </DroppableDay>
                            ))}
                        </div>

                        <DragOverlay>
                            {activeTask ? (
                                <div className="bg-white p-3 rounded border border-blue-300 shadow-xl opacity-90 rotate-2 w-[200px]">
                                    <div className="font-semibold text-sm text-slate-800">{activeTask.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">{activeTask.startTime} - {activeTask.endTime}</div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </TabsContent>

                {/* --- ABA COLABORADORES --- */}
                <TabsContent value="team" className="mt-6">
                    <div className="flex justify-end mb-4">
                        <Dialog open={isCollabModalOpen} onOpenChange={setIsCollabModalOpen}>
                            <DialogTrigger asChild>
                                <Button><UserPlus className="mr-2 h-4 w-4" /> Novo Colaborador</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Colaborador</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Nome Completo</Label>
                                        <Input value={newCollab.name} onChange={e => setNewCollab({ ...newCollab, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Cargo</Label>
                                            <Input value={newCollab.role} onChange={e => setNewCollab({ ...newCollab, role: e.target.value })} placeholder="Ex: Técnico" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Equipe</Label>
                                            <Input value={newCollab.team} onChange={e => setNewCollab({ ...newCollab, team: e.target.value })} placeholder="Ex: Instalação A" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Telefone</Label>
                                        <Input value={newCollab.phone} onChange={e => setNewCollab({ ...newCollab, phone: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleAddCollab}>Salvar</Button>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {collaborators.map(collab => (
                            <Card key={collab.id}>
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar>
                                        <AvatarFallback>{collab.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-base truncate">{collab.name}</CardTitle>
                                        <CardDescription className="truncate">{collab.role}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                            {collab.team}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            {collab.phone}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteCollaborator(collab.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Remover
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
