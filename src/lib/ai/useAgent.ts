import { useState, useEffect, useCallback } from 'react';
import { Message, sendMessageToAgent } from './agent';
import { AIConfig } from './types';

export function useAgent(initialConfig: AIConfig) {
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('crm_ai_messages');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<AIConfig>(initialConfig);
    const [clientTools, setClientTools] = useState<Record<string, Function>>({});

    // Persist messages
    useEffect(() => {
        localStorage.setItem('crm_ai_messages', JSON.stringify(messages));
    }, [messages]);

    // Simple registry for client-side side effects (like navigation)
    const registerToolAction = useCallback((name: string, fn: Function) => {
        setClientTools(prev => {
            // Avoid update if same - actually function equality is hard, just overwrite
            return { ...prev, [name]: fn };
        });
    }, []); // We should use useCallback, but for now let's just make it stable or ignore dep in consumer. 
    // Actually, let's just use useCallback properly.

    /* 
       Wait, I need to import useCallback.
       Let's replace the whole file content block to be safe or just the imports and the function.
    */

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: Message = { role: 'user', content };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Call the new Agent implementation
            const response = await sendMessageToAgent(content, [...messages, userMsg]);

            if (response && response.content) {
                // Check for Navigation Instruction (JSON)
                try {
                    const parsed = JSON.parse(response.content);
                    if (parsed.action === 'navigate' && clientTools['navigate']) {
                        await clientTools['navigate']({ path: parsed.path });
                        // Replace the JSON content with a friendly message
                        response.content = `Navegando para ${parsed.path}...`;
                    }
                } catch (e) {
                    // Not JSON, ignore
                }
            }

            if (response) {
                setMessages(prev => [...prev, response]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar mensagem.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        sendMessage,
        setConfig,
        config,
        registerToolAction
    };
}
