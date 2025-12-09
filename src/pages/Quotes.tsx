import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PDFViewer } from '@react-pdf/renderer';
import { QuoteDocument, QuoteData } from '@/components/quotes/QuoteDocument';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Upload, RefreshCcw, Save, Loader2 } from 'lucide-react';
import { useApp, SavedQuote } from '@/context/AppContext';
import { toast } from 'sonner';

// Schema de Validação
const quoteSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa obrigatório"),
  companyAddress: z.string().min(5, "Endereço da empresa obrigatório"),
  companyEmail: z.string().email("Email inválido"),
  companyPhone: z.string().min(8, "Telefone inválido"),
  
  clientName: z.string().min(2, "Nome do cliente obrigatório"),
  clientAddress: z.string().default(''),
  clientEmail: z.union([z.string().email("Email do cliente inválido"), z.literal('')]).default(''),
  
  quoteNumber: z.string().min(1, "Número obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  dueDate: z.string().min(1, "Validade obrigatória"),
  
  items: z.array(z.object({
    description: z.string().min(2, "Descrição obrigatória"),
    quantity: z.coerce.number().min(1, "Qtd mínima 1"),
    price: z.coerce.number().min(0, "Preço inválido")
  })).min(1, "Adicione pelo menos um item"),
  
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export function Quotes() {
  const { saveQuote } = useApp();
  const [logo, setLogo] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [pdfData, setPdfData] = useState<QuoteData | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as Resolver<QuoteFormValues>,
    defaultValues: {
      companyName: 'Refrimix Tecnologia',
      companyAddress: 'Av. Brasil, 1000 - São Paulo, SP',
      companyEmail: 'contato@refrimix.com.br',
      companyPhone: '(11) 99999-9999',
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      quoteNumber: String(Math.floor(Math.random() * 10000)),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: 'Instalação de Ar Condicionado 9000 BTUs', quantity: 1, price: 450 }],
      notes: 'Pagamento: 50% na aprovação e 50% na conclusão.\nGarantia de 90 dias sobre o serviço.',
    },
    mode: 'onChange' 
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // UseWatch para monitorar mudanças em tempo real
  const formData = useWatch<QuoteFormValues>({ control: form.control });

  // Effect para Debounce (atraso) na geração do PDF
  useEffect(() => {
    setIsPdfReady(false);
    const timer = setTimeout(() => {
      const currentValues = form.getValues();
      
      // Sanitização dos dados para o PDF
      const safeData: QuoteData = {
        ...currentValues,
        logo: logo,
        items: (currentValues.items || []).map((item) => ({
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0
        }))
      };
      
      setPdfData(safeData);
      setIsPdfReady(true);
    }, 800); // 800ms de espera após parar de digitar

    return () => clearTimeout(timer);
  }, [formData, logo]); 

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSystem = () => {
    form.handleSubmit((data: QuoteFormValues) => {
        const total = data.items.reduce(
          (acc: number, item: QuoteFormValues['items'][number]) =>
            acc + (Number(item.quantity) * Number(item.price)),
          0
        );

        const payload: Omit<SavedQuote, 'id' | 'createdAt'> = {
            ...data,
            clientAddress: data.clientAddress || '',
            logo: logo,
            totalValue: total,
            items: data.items.map((i: QuoteFormValues['items'][number]) => ({
              description: i.description,
              quantity: Number(i.quantity),
              price: Number(i.price),
            }))
        };

        saveQuote(payload);
    }, () => {
        toast.error("Verifique os campos obrigatórios.");
    })();
  };

  // Cálculo seguro do total para exibição na UI (instantâneo)
  const items = (formData?.items ?? []) as QuoteFormValues['items'];
  const currentTotal = items.reduce((acc: number, item: QuoteFormValues['items'][number]) => {
    const qty = Number(item?.quantity) || 0;
    const price = Number(item?.price) || 0;
    return acc + (qty * price);
  }, 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerador de Orçamentos</h1>
            <p className="text-slate-500">Crie propostas profissionais em PDF instantaneamente.</p>
        </div>
        <Button onClick={handleSaveSystem} className="bg-green-600 hover:bg-green-700">
            <Save className="mr-2 h-4 w-4" /> Salvar no Sistema
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
        {/* Lado Esquerdo: Formulário */}
        <div className="overflow-y-auto pr-2 pb-20">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Orçamento</CardTitle>
              <CardDescription>Preencha as informações para gerar o documento.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  
                  {/* Seção Empresa */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-blue-600 flex items-center gap-2">
                        1. Dados da Empresa & Logo
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50 relative group shrink-0">
                            {logo ? (
                                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <span className="text-xs text-slate-400 text-center p-1">Sem Logo</span>
                            )}
                            <Input 
                                type="file" 
                                accept="image/png, image/jpeg" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={handleLogoUpload}
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Nome da Empresa" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Telefone" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <FormField control={form.control} name="companyEmail" render={({ field }) => (<FormItem><FormControl><Input placeholder="Email" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="companyAddress" render={({ field }) => (<FormItem><FormControl><Input placeholder="Endereço" {...field} /></FormControl></FormItem>)} />
                    </div>
                  </div>

                  <Separator />

                  {/* Seção Cliente */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-blue-600">2. Dados do Cliente</h3>
                    <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Cliente</FormLabel>
                                <FormControl><Input placeholder="Ex: João da Silva" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="clientEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="cliente@email.com" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="clientAddress" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input placeholder="Rua X, 123" {...field} /></FormControl></FormItem>)} />
                    </div>
                  </div>

                  <Separator />

                  {/* Detalhes Orçamento */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-blue-600">3. Detalhes</h3>
                    <div className="grid grid-cols-3 gap-4">
                         <FormField control={form.control} name="quoteNumber" render={({ field }) => (<FormItem><FormLabel>Nº Orçamento</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                         <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Data Emissão</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                         <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Validade</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                    </div>
                  </div>

                  <Separator />

                  {/* Itens */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-blue-600">4. Itens do Serviço</h3>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => append({ description: '', quantity: 1, price: 0 })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                        </Button>
                    </div>
                    
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-start bg-slate-50 p-2 rounded-md border animate-in fade-in slide-in-from-top-2 duration-200">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl><Input placeholder="Descrição do serviço/produto" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem className="w-20">
                                            <FormControl><Input type="number" min="1" placeholder="Qtd" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem className="w-28">
                                            <FormControl><Input type="number" min="0" step="0.01" placeholder="R$" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-0.5"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="text-center py-4 text-sm text-slate-500 border border-dashed rounded-md">
                                Nenhum item adicionado. Clique em "Adicionar Item".
                            </div>
                        )}
                    </div>
                    
                    {/* Totais Calculados */}
                    <div className="flex justify-end pt-2">
                        <div className="bg-slate-100 p-3 rounded-lg text-right min-w-[200px]">
                            <p className="text-xs text-slate-500">Total Estimado</p>
                            <p className="text-xl font-bold text-blue-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal)}
                            </p>
                        </div>
                    </div>
                  </div>

                  <Separator />

                   <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observações / Termos</FormLabel>
                                <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />

                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Preview */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center text-white">
                <span className="font-medium flex items-center gap-2">
                    <RefreshCcw className={`h-4 w-4 ${!isPdfReady ? 'animate-spin' : ''}`} /> 
                    {isPdfReady ? 'Pré-visualização Pronta' : 'Atualizando PDF...'}
                </span>
                <span className="text-xs text-slate-400">A4 - PDF</span>
            </div>
            <div className="flex-1 bg-slate-500/50 relative">
                {isPdfReady && pdfData ? (
                     <PDFViewer className="w-full h-full border-none" showToolbar={true}>
                        <QuoteDocument data={pdfData} />
                    </PDFViewer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                        <p className="text-sm text-slate-300">Gerando documento...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
