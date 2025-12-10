
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Settings as SettingsIcon, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAgent } from '@/lib/ai/useAgent';
import { AIConfig, AIProviderType } from '@/lib/ai/types';

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Config from localStorage or Env (Ollama as default "Poor Dev" option)
  const [config, setLocalConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('crm_ai_config');
    if (saved) return JSON.parse(saved);

    // Default: Ollama local (grátis)
    return {
      provider: 'ollama' as const,
      model: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b-instruct-q5_K_M',
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
      apiKey: ''
    };
  });

  const { messages, input, setInput, isLoading, sendMessage, setConfig, registerToolAction } = useAgent(config);

  // Persist Config
  useEffect(() => {
    localStorage.setItem('crm_ai_config', JSON.stringify(config));
  }, [config]);

  // We should also persist messages, but let's handle that in useAgent or here.
  // Ideally useAgent handles it, but since messages are returned from there,
  // we can sync them here or modify useAgent. 
  // Let's modify useAgent to handle message persistence for better encapsulation.


  // Register Navigation Tool
  useEffect(() => {
    registerToolAction('navigate', async (args: { path: string }) => {
      navigate(args.path);
      return `Naveguei para ${args.path} com sucesso.`;
    });
  }, [navigate, registerToolAction]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  const saveSettings = () => {
    setConfig(config);
    setShowSettings(false);
  };

  if (!isOpen) {
    return (
      <Button
        data-testid="chatbot-trigger"
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
          <CardTitle className="text-sm font-medium">Cérebro Refrimix</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => setShowSettings(!showSettings)}>
            <SettingsIcon className="h-3 w-3" />
          </Button>
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
          <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 relative flex flex-col">
            {showSettings ? (
              <div className="p-4 space-y-4 bg-white h-full">
                <h3 className="font-bold text-sm">Configuração da IA</h3>

                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Select value={config.provider} onValueChange={(v: AIProviderType) => setLocalConfig({ ...config, provider: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="ollama">Ollama (Local)</SelectItem>
                      <SelectItem value="google">Google Gemini</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input value={config.model} onChange={e => setLocalConfig({ ...config, model: e.target.value })} placeholder="ex: gpt-3.5-turbo, llama3" />
                </div>

                <div className="space-y-2">
                  <Label>API Key (Opcional)</Label>
                  <Input type="password" value={config.apiKey || ''} onChange={e => setLocalConfig({ ...config, apiKey: e.target.value })} placeholder="sk-..." />
                </div>

                <div className="space-y-2">
                  <Label>Base URL (Ollama)</Label>
                  <Input value={config.baseUrl || ''} onChange={e => setLocalConfig({ ...config, baseUrl: e.target.value })} placeholder="http://localhost:11434" />
                </div>

                <Button onClick={saveSettings} className="w-full mt-4">
                  <Save className="w-4 h-4 mr-2" /> Salvar Configuração
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-2">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-500 text-sm mt-10">
                      <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>Olá! Eu controlo o CRM. <br /> Peça para navegar, criar leads ou ver dados.</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
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
                            : msg.role === 'tool'
                              ? "bg-slate-200 text-slate-600 font-mono text-xs p-2"
                              : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                        )}
                      >
                        {msg.role === 'tool' ? `[Tool: ${msg.name}] ${msg.content}` : msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
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
            )}

          </CardContent>
          {!showSettings && (
            <CardFooter className="p-3 bg-white border-t">
              <form onSubmit={handleSend} className="flex w-full gap-2">
                <Input
                  placeholder="Digite um comando..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 focus-visible:ring-blue-500"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}

