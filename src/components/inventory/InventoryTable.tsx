import { useState } from 'react';
import { useApp, InventoryItem } from '@/context/AppContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function InventoryTable() {
  const { inventoryItems, inventoryCategories, updateInventoryStock } = useApp();
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [movementModal, setMovementModal] = useState<{ itemId: string, type: 'IN' | 'OUT' } | null>(null);
  const [moveQty, setMoveQty] = useState('1');
  const [moveReason, setMoveReason] = useState('');

  const filteredItems = inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase()) || item.sku.toLowerCase().includes(filter.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
  });

  const handleMovement = async () => {
      if(movementModal && moveQty) {
          await updateInventoryStock(movementModal.itemId, parseInt(moveQty), movementModal.type, moveReason || 'Movimentação Manual');
          setMovementModal(null);
          setMoveQty('1');
          setMoveReason('');
      }
  };

  const getStatusColor = (item: InventoryItem) => {
      if (item.quantity === 0) return "destructive";
      if (item.quantity <= item.minQuantity) return "secondary"; // Yellowish usually, using secondary for now or custom class
      return "default"; // Green/Primary
  };

  const getStatusText = (item: InventoryItem) => {
      if (item.quantity === 0) return "Esgotado";
      if (item.quantity <= item.minQuantity) return "Baixo Estoque";
      return "Em Estoque";
  };

  return (
    <div className="space-y-4">
        <div className="flex gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por SKU ou Nome..." 
                    className="pl-8" 
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Todas Categorias</SelectItem>
                    {inventoryCategories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-center">Estoque</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredItems.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                            <TableCell>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.location}</div>
                            </TableCell>
                            <TableCell>{item.categoryName}</TableCell>
                            <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={getStatusColor(item) as any}>
                                    {getStatusText(item)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => setMovementModal({ itemId: item.id, type: 'IN' })}>
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setMovementModal({ itemId: item.id, type: 'OUT' })}>
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {filteredItems.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                Nenhum item encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

        <Dialog open={!!movementModal} onOpenChange={() => setMovementModal(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{movementModal?.type === 'IN' ? 'Entrada de Estoque' : 'Saída de Estoque'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Quantidade</Label>
                        <Input type="number" min="1" value={moveQty} onChange={e => setMoveQty(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Motivo / Referência</Label>
                        <Input placeholder="Ex: Compra NF 123 ou Uso na Tarefa X" value={moveReason} onChange={e => setMoveReason(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleMovement}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
