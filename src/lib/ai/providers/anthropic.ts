import { BaseProvider } from './base';
import { Message } from '../types';

export class AnthropicProvider extends BaseProvider {
    async sendMessage(messages: Message[], tools?: any[]): Promise<Message> {
        const endpoint = 'https://api.anthropic.com/v1/messages';

        // Filter out system message to top level
        const systemMsg = messages.find(m => m.role === 'system');
        const conversation = messages.filter(m => m.role !== 'system');

        const payload: any = {
            model: this.config.model, // claude-3-5-sonnet-20240620
            max_tokens: this.config.maxTokens || 1024,
            system: systemMsg?.content,
            messages: conversation.map(m => {
                if (m.role === 'tool') {
                    // Anthropic Tool Result format
                    return {
                        role: 'user',
                        content: [
                            {
                                type: 'tool_result',
                                tool_use_id: (m as any).tool_call_id,
                                content: m.content
                            }
                        ]
                    };
                }
                if (m.role === 'assistant' && m.tool_calls) {
                    return {
                        role: 'assistant',
                        content: [
                            ...(m.content ? [{ type: 'text', text: m.content }] : []),
                            ...m.tool_calls.map(tc => ({
                                type: 'tool_use',
                                id: tc.id,
                                name: tc.function.name,
                                input: JSON.parse(tc.function.arguments)
                            }))
                        ]
                    };
                }
                return {
                    role: m.role,
                    content: m.content
                };
            }),
            temperature: this.config.temperature
        };

        if (tools && tools.length > 0) {
            payload.tools = tools.map(t => ({
                name: t.function.name,
                description: t.function.description,
                input_schema: t.function.parameters
            }));
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'x-api-key': this.config.apiKey!,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Anthropic API Error: ${res.status} - ${errText}`);
        }

        const data = await res.json();

        // Map response
        // Anthropic content is an array of types
        let contentStr = '';
        const toolCalls: any[] = [];

        for (const block of data.content) {
            if (block.type === 'text') {
                contentStr += block.text;
            } else if (block.type === 'tool_use') {
                toolCalls.push({
                    id: block.id,
                    type: 'function',
                    function: {
                        name: block.name,
                        arguments: JSON.stringify(block.input)
                    }
                });
            }
        }

        return {
            role: 'assistant',
            content: contentStr,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined
        };
    }
}
