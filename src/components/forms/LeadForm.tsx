import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { maskCEP, maskCPF, maskPhone } from '@/lib/masks';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  document: z.string().min(11, 'CPF/CNPJ inválido'),
  cep: z.string().min(9, 'CEP inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  status: z.enum(['Novo', 'Em Atendimento', 'Orçamento', 'Fechado']),
  source: z.string().optional(),
  value: z.string().min(1, 'Valor é obrigatório'), // Tratado como string no input, convertido depois
});

type LeadFormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  onSubmit: (data: any) => void;
  initialData?: Partial<LeadFormValues>;
}

export function LeadForm({ onSubmit, initialData }: LeadFormProps) {
  const [loadingCep, setLoadingCep] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      document: initialData?.document || '',
      cep: initialData?.cep || '',
      address: initialData?.address || '',
      number: initialData?.number || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      status: initialData?.status as any || 'Novo',
      source: initialData?.source || 'Google',
      value: initialData?.value || '',
    },
  });

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          form.setValue('address', data.logradouro);
          form.setValue('city', data.localidade);
          form.setValue('state', data.uf);
          form.setFocus('number');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = (data: LeadFormValues) => {
    // Converte o valor string para number antes de enviar
    const cleanValue = parseFloat(data.value.replace(/[^0-9,.]/g, '').replace(',', '.'));
    onSubmit({ ...data, value: isNaN(cleanValue) ? 0 : cleanValue });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF / CNPJ</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="000.000.000-00" 
                    {...field} 
                    onChange={(e) => field.onChange(maskCPF(e.target.value))}
                    maxLength={18}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="joao@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp / Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field} 
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      placeholder="00000-000" 
                      {...field} 
                      onChange={(e) => field.onChange(maskCEP(e.target.value))}
                      onBlur={handleCepBlur}
                      maxLength={9}
                    />
                  </FormControl>
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, Avenida..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UF</FormLabel>
                <FormControl>
                  <Input placeholder="SP" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Valor Estimado (R$)</FormLabel>
                    <FormControl>
                    <Input placeholder="1500.00" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Inicial</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Novo">Novo</SelectItem>
                    <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
                    <SelectItem value="Orçamento">Orçamento</SelectItem>
                    <SelectItem value="Fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
           <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Google">Google Ads</SelectItem>
                    <SelectItem value="SEO">SEO / Orgânico</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">Salvar Lead</Button>
        </div>
      </form>
    </Form>
  );
}
