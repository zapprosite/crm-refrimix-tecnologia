import { Message, AIConfig } from '../types';

export interface AIProvider {
    sendMessage(messages: Message[], tools?: any[]): Promise<Message>;
    // streamMessage(messages: Message[], tools?: any[]): AsyncGenerator<string, Message>; // Future implementation
}

export abstract class BaseProvider implements AIProvider {
    protected config: AIConfig;

    constructor(config: AIConfig) {
        this.config = config;
    }

    abstract sendMessage(messages: Message[], tools?: any[]): Promise<Message>;
}
