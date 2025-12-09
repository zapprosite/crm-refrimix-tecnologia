import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Sou o assistente Refrimix Tecnologia. Posso ajudar com leads, agendamentos, orçamentos, PMOC, Financeiro e Tarefas!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const { kpis, addLead, exportLeadsToCSV } = useApp();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const processCommand = async (text: string) => {
    const lowerText = text.toLowerCase();
    let response = "Desculpe, não entendi. Tente comandos como 'Ir para financeiro', 'Novo orçamento' ou 'Resumo'.";

    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // --- NAVEGAÇÃO ---
    if (lowerText.includes('ir para') || lowerText.includes('navegar') || lowerText.includes('abrir')) {
      if (lowerText.includes('dashboard') || lowerText.includes('início')) {
        navigate('/');
        response = "Navegando para o Dashboard.";
      } else if (lowerText.includes('lead') || lowerText.includes('cliente')) {
        navigate('/leads');
        response = "Abrindo a gestão de Leads e Clientes.";
      } else if (lowerText.includes('agenda') || lowerText.includes('agendamento')) {
        navigate('/schedule');
        response = "Mostrando sua Agenda de serviços.";
      } else if (lowerText.includes('tarefa') || lowerText.includes('equipe')) {
        navigate('/tasks');
        response = "Abrindo o quadro de Tarefas e Equipes.";
      } else if (lowerText.includes('orçamento') || lowerText.includes('proposta')) {
        navigate('/quotes');
        response = "Abrindo o Gerador de Orçamentos.";
      } else if (lowerText.includes('manutenção') || lowerText.includes('pmoc')) {
        navigate('/maintenance');
        response = "Acessando módulo de Manutenção e PMOC.";
      } else if (lowerText.includes('financeiro') || lowerText.includes('caixa') || lowerText.includes('banco')) {
        navigate('/finance');
        response = "Abrindo o módulo Financeiro.";
      }
    }
    
    // --- CONSULTAS ---
    else if (lowerText.includes('quantos leads') || lowerText.includes('total de leads')) {
      response = `Atualmente temos ${kpis.newLeads} leads cadastrados.`;
    } else if (lowerText.includes('faturamento') || lowerText.includes('receita')) {
      response = `O faturamento total (leads fechados) é de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalRevenue)}.`;
    } else if (lowerText.includes('saldo') || lowerText.includes('caixa')) {
      response = `Saldo Geral: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.financial.balanceTotal)}. (CNPJ: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.financial.balanceCNPJ)} | CPF: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.financial.balanceCPF)})`;
    } else if (lowerText.includes('resumo') || lowerText.includes('hoje')) {
      response = `Resumo: ${kpis.newLeads} leads ativos, ${kpis.scheduledServices} serviços agendados. Saldo em caixa: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.financial.balanceTotal)}.`;
    }

    // --- AÇÕES GERAIS ---
    else if (lowerText.includes('novo orçamento')) {
        navigate('/quotes');
        response = "Vou te levar para a tela de criação de orçamentos.";
    }
    else if (lowerText.includes('nova tarefa')) {
        navigate('/tasks');
        response = "Vou te levar para o quadro de tarefas para você adicionar uma nova.";
    }
    else if (lowerText.includes('exportar') && lowerText.includes('csv')) {
      exportLeadsToCSV();
      response = "Iniciando o download do arquivo CSV com a lista de leads.";
    }
    else if (lowerText.includes('limpar conversa')) {
        setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Conversa limpa. Como posso ajudar agora?' }]);
        setIsTyping(false);
        return;
    }

    // --- AÇÕES: NOVO LEAD ---
    else if (lowerText.startsWith('novo lead') || lowerText.startsWith('adicionar lead')) {
      const name = text.replace(/novo lead|adicionar lead/gi, '').trim();
      if (name.length > 2) {
        addLead({
          name: name,
          company: 'Via Chatbot',
          phone: '(00) 00000-0000',
          status: 'Novo',
          source: 'Chatbot',
          email: 'pendente@email.com',
          document: '000.000.000-00',
          value: 0
        });
        response = `Lead "${name}" criado! Acesse a aba de Leads para completar o cadastro.`;
        navigate('/leads');
      } else {
        response = "Para adicionar, diga 'Novo lead [Nome do Cliente]'.";
      }
    }

    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: response }]);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setInput('');
    
    processCommand(userMsg);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 z-50 animate-in zoom-in duration-300"
      >
        <Bot className="h-8 w-8 text-white" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed right-6 z-50 shadow-2xl flex flex-col transition-all duration-300 ease-in-out border-blue-100",
      isMinimized ? "bottom-6 w-72 h-14 overflow-hidden" : "bottom-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh]"
    )}>
      <CardHeader className={cn("bg-slate-900 text-white p-3 flex flex-row items-center justify-between space-y-0", isMinimized && "h-full")}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
          <div className="bg-blue-500 p-1.5 rounded-full">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-sm font-medium">Assistente Refrimix Tecnologia</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white hover:bg-red-500/20" onClick={() => setIsOpen(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-4 overflow-hidden bg-slate-50 relative">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 pb-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[85%] text-sm shadow-sm",
                        msg.role === 'user' 
                          ? "bg-blue-600 text-white rounded-br-none" 
                          : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-3 bg-white border-t">
            <form onSubmit={handleSend} className="flex w-full gap-2">
              <Input 
                placeholder="Digite um comando..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 focus-visible:ring-blue-500"
              />
              <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
