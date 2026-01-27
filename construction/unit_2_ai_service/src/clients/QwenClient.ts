import { AIClient, ChatCompletionRequest, ChatCompletionResponse, AIClientConfig } from './AIClient';

export class QwenClient extends AIClient {
  constructor(config?: Partial<AIClientConfig>) {
    const defaultConfig: AIClientConfig = {
      apiKey: process.env.DASHSCOPE_API_KEY || '',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      defaultModel: 'qwen-plus',
    };
    
    super({ ...defaultConfig, ...config });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('DashScope API key not configured');
    }

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || this.config.defaultModel,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
    }

    return await response.json() as ChatCompletionResponse;
  }

  isAvailable(): boolean {
    return !!this.config.apiKey && this.config.apiKey.startsWith('sk-');
  }
}