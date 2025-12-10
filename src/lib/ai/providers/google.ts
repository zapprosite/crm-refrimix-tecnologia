import { BaseProvider } from './base';
import { Message } from '../types';

export class GoogleProvider extends BaseProvider {
    async sendMessage(messages: Message[], tools?: any[]): Promise<Message> {
        // Simple Gemini API Implementation
        // Assuming using Gemini 1.5 Flash or Pro via Generative Language API
        const model = this.config.model || 'gemini-1.5-flash';
        const apiKey = this.config.apiKey;
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Convert messages to Gemini format
        // Gemini uses 'user' and 'model' roles. 'system' is separate or part of user.
        // And 'parts' structure.

        let systemInstruction = undefined;
        const contents = [];

        for (const m of messages) {
            if (m.role === 'system') {
                systemInstruction = { parts: [{ text: m.content }] };
            } else {
                const role = m.role === 'assistant' ? 'model' : 'user';
                // Handle tools later if needed, for now standard text
                // Tool use in raw Gemini API is more complex, for this MVP we might strip tools for Gemini
                // OR implement properly. Given the request is "Google treats SAAS", let's try to do it right?
                // Actually, for simplicity/robustness, if the 'tools' flow is too different, we might fallback to text-only instructions
                // But the user asked for tool control. 
                // Let's implement basic text wrapper for now, enabling Function Calling in raw REST is complex without the SDK.
                // However, the Agent Loop (AIManager) handles the execution. We just need the model to output JSON or specific format?
                // OR we accept that Google Provider might need the heavy SDK.
                // Decision: For this "Poor Dev" environ, let's try to use the OpenAI compatibility layer for Gemini if available?
                // Google offers an OpenAI compatible endpoint now? No, but Vercel SDK does.
                // Let's stick to the official REST API but mapping tools is tricky in one file.
                // We will assume for this Refactor 1.0 that Google Provider might be Text-Only or use a simplified tool prompt strategy
                // UNLESS we use the OpenAI-Client for Google which is becoming common.
                // Let's try standard Gemini REST payload structure.

                // Note: Gemini API requires 'parts' object.
                let parts: any[] = [];
                if (m.content) parts.push({ text: m.content });

                // Tool responses
                if (m.role === 'tool') {
                    // Gemini expects 'functionResponse'
                    parts = [{
                        functionResponse: {
                            name: m.name!,
                            response: { result: m.content } // expecting object
                        }
                    }];
                }

                if (m.tool_calls) {
                    parts = m.tool_calls.map(tc => ({
                        functionCall: {
                            name: tc.function.name,
                            args: JSON.parse(tc.function.arguments)
                        }
                    }));
                }

                contents.push({ role, parts });
            }
        }

        const payload: any = {
            contents,
            systemInstruction,
            generationConfig: {
                temperature: this.config.temperature
            }
        };

        if (tools && tools.length > 0) {
            payload.tools = [{
                functionDeclarations: tools.map(t => ({
                    name: t.function.name,
                    description: t.function.description,
                    parameters: t.function.parameters
                }))
            }];
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Google API Error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const content = candidate?.content;

        if (!content) throw new Error("No content from Gemini");

        // Map back to our format
        const textPart = content.parts?.find((p: any) => p.text);
        const functionCallParts = content.parts?.filter((p: any) => p.functionCall);

        const responseMsg: Message = {
            role: 'assistant',
            content: textPart?.text || '',
        };

        if (functionCallParts && functionCallParts.length > 0) {
            responseMsg.tool_calls = functionCallParts.map((p: any, idx: number) => ({
                id: `call_${Date.now()}_${idx}`, // Gemini doesn't return ID
                type: 'function',
                function: {
                    name: p.functionCall.name,
                    arguments: JSON.stringify(p.functionCall.args)
                }
            }));
        }

        return responseMsg;
    }
}
