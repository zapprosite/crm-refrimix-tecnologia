export interface Message {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: ToolCall[];
    name?: string; // For tool outputs
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}

export type AIProviderType = 'openai' | 'ollama' | 'google' | 'anthropic' | 'perplexity';

export interface AIConfig {
    provider: AIProviderType;
    model: string;
    baseUrl?: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
}
