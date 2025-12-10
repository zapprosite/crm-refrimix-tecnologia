import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Plus, Truck } from 'lucide-react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export function Inventory() {
    const { kpis, inventoryCategories, suppliers, addInventoryItem, addSupplier, inventoryMovements } = useApp();
    const [newItemOpen, setNewItemOpen] = useState(false);
    const [newSupplierOpen, setNewSupplierOpen] = useState(false);

    // Form States
    const [newItem, setNewItem] = useState({
        sku: '', name: '', categoryId: '', description: '', unitPrice: '', quantity: '', minQuantity: '', location: '', mainSupplierId: ''
    });
    const [newSup, setNewSup] = useState({ name: '', cnpj: '', email: '', phone: '', leadTimeDays: '' });

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.sku) return;
        await addInventoryItem({
            sku: newItem.sku, name: newItem.name, categoryId: newItem.categoryId, description: newItem.description,
            unitPrice: Number(newItem.unitPrice), quantity: Number(newItem.quantity), minQuantity: Number(newItem.minQuantity),
            location: newItem.location, mainSupplierId: newItem.mainSupplierId || undefined
        });
        setNewItemOpen(false);
        setNewItem({ sku: '', name: '', categoryId: '', description: '', unitPrice: '', quantity: '', minQuantity: '', location: '', mainSupplierId: '' });
    };

    const handleAddSupplier = async () => {
        if (!newSup.name) return;
        await addSupplier({
            name: newSup.name, cnpj: newSup.cnpj, email: newSup.email, phone: newSup.phone, leadTimeDays: Number(newSup.leadTimeDays)
        });
        setNewSupplierOpen(false);
        setNewSup({ name: '', cnpj: '', email: '', phone: '', leadTimeDays: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Estoque</h1>
                    <p className="text-slate-500">Controle de materiais, peças e compras.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={newSupplierOpen} onOpenChange={setNewSupplierOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Truck className="mr-2 h-4 w-4" /> Novo Fornecedor</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Cadastrar Fornecedor</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>Nome</Label><Input value={newSup.name} onChange={e => setNewSup({ ...newSup, name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>CNPJ</Label><Input value={newSup.cnpj} onChange={e => setNewSup({ ...newSup, cnpj: e.target.value })} /></div>
                                    <div className="grid gap-2"><Label>Lead Time (Dias)</Label><Input type="number" value={newSup.leadTimeDays} onChange={e => setNewSup({ ...newSup, leadTimeDays: e.target.value })} /></div>
                                </div>
                                <div className="grid gap-2"><Label>Email</Label><Input value={newSup.email} onChange={e => setNewSup({ ...newSup, email: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Telefone</Label><Input value={newSup.phone} onChange={e => setNewSup({ ...newSup, phone: e.target.value })} /></div>
                            </div>
                            <DialogFooter><Button onClick={handleAddSupplier}>Salvar</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Novo Item</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader><DialogTitle>Cadastrar Item no Estoque</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>SKU (Código)</Label><Input data-testid="inventory-sku-input" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} /></div>
                                    <div className="grid gap-2"><Label>Nome do Item</Label><Input data-testid="inventory-name-input" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Categoria</Label>
                                        <Select value={newItem.categoryId} onValueChange={v => setNewItem({ ...newItem, categoryId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>{inventoryCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Fornecedor Principal</Label>
                                        <Select value={newItem.mainSupplierId} onValueChange={v => setNewItem({ ...newItem, mainSupplierId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2"><Label>Preço Unit. (R$)</Label><Input type="number" value={newItem.unitPrice} onChange={e => setNewItem({ ...newItem, unitPrice: e.target.value })} /></div>
                                    <div className="grid gap-2"><Label>Qtd Inicial</Label><Input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} /></div>
                                    <div className="grid gap-2"><Label>Qtd Mínima (Alerta)</Label><Input type="number" value={newItem.minQuantity} onChange={e => setNewItem({ ...newItem, minQuantity: e.target.value })} /></div>
                                </div>
                                <div className="grid gap-2"><Label>Localização</Label><Input placeholder="Ex: Prateleira B2" value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} /></div>
                            </div>
                            <DialogFooter><Button data-testid="inventory-save-button" onClick={handleAddItem}>Cadastrar Item</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.inventory.totalValue)}</div>
                        <p className="text-xs text-muted-foreground">Total de ativos armazenados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{kpis.inventory.lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">Abaixo do estoque mínimo</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Movimentações (Mês)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryMovements.length}</div>
                        <p className="text-xs text-muted-foreground">Entradas e saídas recentes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Abertos</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Aguardando entrega</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList>
                    <TabsTrigger value="inventory">Inventário</TabsTrigger>
                    <TabsTrigger value="movements">Movimentações</TabsTrigger>
                    <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-4">
                    <InventoryTable />
                </TabsContent>

                <TabsContent value="movements" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Histórico de Movimentações</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Qtd</TableHead>
                                        <TableHead>Motivo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventoryMovements.map(mov => (
                                        <TableRow key={mov.id}>
                                            <TableCell>{format(new Date(mov.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                                            <TableCell className="font-medium">{mov.itemName}</TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${mov.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {mov.type === 'IN' ? 'ENTRADA' : 'SAÍDA'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{mov.quantity}</TableCell>
                                            <TableCell className="text-muted-foreground">{mov.reason}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suppliers" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Base de Fornecedores</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>CNPJ</TableHead>
                                        <TableHead>Contato</TableHead>
                                        <TableHead>Lead Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers.map(sup => (
                                        <TableRow key={sup.id}>
                                            <TableCell className="font-medium">{sup.name}</TableCell>
                                            <TableCell>{sup.cnpj}</TableCell>
                                            <TableCell>
                                                <div>{sup.email}</div>
                                                <div className="text-xs text-muted-foreground">{sup.phone}</div>
                                            </TableCell>
                                            <TableCell>{sup.leadTimeDays} dias</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
