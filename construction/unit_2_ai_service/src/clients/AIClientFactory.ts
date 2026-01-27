import { AIClient } from './AIClient';
import { OpenAIClient } from './OpenAIClient';
import { QwenClient } from './QwenClient';

export enum AIProvider {
  OPENAI = 'openai',
  QWEN = 'qwen',
  MOCK = 'mock'
}

export class AIClientFactory {
  private static clients: Map<AIProvider, AIClient> = new Map();

  static getClient(provider: AIProvider): AIClient | null {
    if (this.clients.has(provider)) {
      return this.clients.get(provider)!;
    }

    let client: AIClient | null = null;

    switch (provider) {
      case AIProvider.OPENAI:
        client = new OpenAIClient();
        break;
      case AIProvider.QWEN:
        client = new QwenClient();
        break;
      default:
        return null;
    }

    if (client && client.isAvailable()) {
      this.clients.set(provider, client);
      return client;
    }

    return null;
  }

  static getAvailableClient(): AIClient | null {
    // 优先级：Qwen > OpenAI
    const providers = [AIProvider.QWEN, AIProvider.OPENAI];
    
    for (const provider of providers) {
      const client = this.getClient(provider);
      if (client) {
        console.log(`Using AI provider: ${provider}`);
        return client;
      }
    }

    console.log('No AI providers available, using mock implementation');
    return null;
  }

  static listAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];
    
    if (this.getClient(AIProvider.QWEN)) {
      available.push(AIProvider.QWEN);
    }
    
    if (this.getClient(AIProvider.OPENAI)) {
      available.push(AIProvider.OPENAI);
    }

    return available;
  }
}