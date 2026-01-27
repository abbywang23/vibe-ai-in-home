import { AIClient, ChatCompletionRequest, ChatCompletionResponse, AIClientConfig } from './AIClient';

export class OpenAIClient extends AIClient {
  constructor(config?: Partial<AIClientConfig>) {
    const defaultConfig: AIClientConfig = {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4',
    };
    
    super({ ...defaultConfig, ...config });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if this is a multimodal request (contains images)
    const hasImages = request.messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );

    // Use appropriate model based on content type
    const model = hasImages ? 'gpt-4o' : (request.model || this.config.defaultModel);

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return await response.json() as ChatCompletionResponse;
  }

  isAvailable(): boolean {
    return !!this.config.apiKey && this.config.apiKey.startsWith('sk-');
  }
}