import { BaseProvider } from './base';
import { Message } from '../types';

export class OllamaProvider extends BaseProvider {
    async sendMessage(messages: Message[], tools?: any[]): Promise<Message> {
        // Use OpenAI-compatible endpoint of Ollama
        const endpoint = (this.config.baseUrl || 'http://localhost:11434') + '/v1/chat/completions';

        const payload: any = {
            model: this.config.model, // e.g., 'llama3'
            messages: messages.map(m => ({
                role: m.role,
                content: m.content || '',
                tool_calls: m.tool_calls,
                name: m.name,
                tool_call_id: m.role === 'tool' ? (m as any).tool_call_id : undefined
            })),
            stream: false,
            temperature: this.config.temperature
        };

        if (tools && tools.length > 0) {
            // Ollama supports tools in OpenAI format now
            payload.tools = tools;
            payload.tool_choice = 'auto';
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Ollama API Error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        const choice = data.choices[0];
        const msg = choice.message;

        return {
            role: 'assistant',
            content: msg.content,
            tool_calls: msg.tool_calls
        };
    }
}
