import { getRelevantTools } from './tools/registry';
import { executeTool } from './tools/executors';

// Configuration
const OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';
const MODEL = 'llama3.1:8b-instruct-q5_K_M';

export type Message = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    name?: string;
    tool_calls?: any[];
    tool_call_id?: string;
};

// Optimized system prompt for Llama3.1:8b (short, structured, with examples)
const SYSTEM_PROMPT_LLAMA = `Você é o Cérebro Refrimix, assistente de IA do CRM.

## Seu trabalho:
1. Entender o pedido do usuário
2. Escolher UMA ferramenta da lista
3. Executar e responder em português

## Regras:
- Responda em português, máximo 2 linhas
- Se não entender, pergunte
- Não invente dados

## Exemplos:
User: "Crie lead João Silva"
→ Tool: add_lead + Resposta: "Lead criado! ✅"

User: "Mostre tarefas pendentes"
→ Tool: list_tasks + Resposta: "3 tarefas pendentes: ..."

Data: ${new Date().toLocaleDateString('pt-BR')}
`;

// Internal ReAct Loop
export async function runAgent(history: Message[], userMessage: string, currentPath?: string): Promise<Message | null> {
    // 1. Prepare context window (sliding window of last 10 messages)
    const recentHistory = history.slice(-10);

    // 2. Get relevant tools based on context (max 7 for Llama3.1:8b)
    const relevantTools = getRelevantTools({ currentPath, userIntent: userMessage });

    // 3. Construct messages payload
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT_LLAMA },
        ...recentHistory,
        { role: 'user', content: userMessage }
    ];

    try {
        // 3. First LLM Call (Reasoning)
        console.log('[Agent] Calling Ollama...');
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                messages,
                tools: relevantTools, // Context-aware tool selection (max 7)
                stream: false,
                options: { temperature: 0.2 } // Low temp for precision
            })
        });

        if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
        const data = await response.json();
        const resultMsg = data.choices[0].message;

        // 4. Check for Tool Calls
        if (resultMsg.tool_calls && resultMsg.tool_calls.length > 0) {
            console.log('[Agent] Tool calls detected:', resultMsg.tool_calls.length);

            // Execute each tool
            for (const call of resultMsg.tool_calls) {
                const fnName = call.function.name;
                // Parse args robustly (sometimes Ollama sends strings inside strings)
                let args = call.function.arguments;
                if (typeof args === 'string') {
                    try { args = JSON.parse(args); } catch (e) { console.error('JSON Parse error', e); }
                }

                console.log(`[Agent] Executing ${fnName} with args:`, args);
                try {
                    // ACT: Execute tool
                    const result = await executeTool(fnName, args);

                    // SPECIAL CASE: Navigation returns immediately to UI
                    if (fnName === 'navigate') {
                        return { role: 'assistant', content: JSON.stringify(result) };
                    }

                    // Append tool result to history for next loop transparency
                    messages.push(resultMsg); // The assistant's "intention"
                    messages.push({
                        role: 'tool',
                        tool_call_id: call.id,
                        content: JSON.stringify(result)
                    });

                } catch (err: any) {
                    console.error(`[Agent] Tool error: ${err.message}`);
                    messages.push({
                        role: 'tool',
                        tool_call_id: call.id,
                        content: `Erro ao executar: ${err.message}`
                    });
                }
            }

            // 5. Second LLM Call (Observation & Formatting)
            // Now that context includes tool results, ask LLM to format response
            console.log('[Agent] Formatting final response...');
            const finalResp = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL,
                    messages, // Includes History + Tool Results
                    stream: false,
                    options: { temperature: 0.7 } // Higher temp for natural language
                })
            });

            const finalData = await finalResp.json();
            return finalData.choices[0].message;

        } else {
            // No tools called, just return text
            return resultMsg;
        }

    } catch (error) {
        console.error('Agent Engine failed:', error);
        return { role: 'assistant', content: '⚠️ Desculpe, meu cérebro desconectou temporariamente. Verifique se o Ollama está rodando.' };
    }
}

// Wrapper for compatibility with existing UI hooks
export async function sendMessageToAgent(message: string, context: any[] = []) {
    // Adapter to convert context to Message type if needed, or just pass empty
    // Ideally the UI should maintain history state, but for now we pass empty history 
    // or we can try to map the context if it matches.
    // Assuming context is simple [{role, content}]
    return runAgent(context as Message[], message);
}
