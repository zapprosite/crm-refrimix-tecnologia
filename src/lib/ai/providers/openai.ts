import { BaseProvider } from './base';
import { Message } from '../types';

export class OpenAIProvider extends BaseProvider {
    async sendMessage(messages: Message[], tools?: any[]): Promise<Message> {
        const endpoint = 'https://api.openai.com/v1/chat/completions';

        const payload: any = {
            model: this.config.model,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content || (m.role === 'assistant' ? null : ''), // OpenAI requirement
                tool_calls: m.tool_calls,
                name: m.name,
                tool_call_id: m.role === 'tool' ? (m as any).tool_call_id : undefined
            })),
            stream: false,
            temperature: this.config.temperature
        };

        if (tools && tools.length > 0) {
            payload.tools = tools;
            payload.tool_choice = 'auto';
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
        };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`OpenAI API Error: ${res.status} - ${errText}`);
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
