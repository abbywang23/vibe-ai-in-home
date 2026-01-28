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

    // Check if this is a multimodal request (contains images)
    const hasImages = request.messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );

    // Use appropriate model based on content type
    const model = hasImages ? 'qwen3-vl-plus' : (request.model || this.config.defaultModel);

    // Add timeout for fetch requests (120 seconds for multimodal requests, 30 seconds for text)
    // Visual models can take longer to process images
    const timeout = hasImages ? 120000 : 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
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
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Qwen API error: ${response.status} - ${error}`);
      }

      const result = await response.json() as ChatCompletionResponse;
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Qwen API request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey && this.config.apiKey.startsWith('sk-');
  }
}