import { ChatRequest, ChatResponse } from '../models/types';
import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';

/**
 * Chat Service - Handles conversational AI interactions
 * Supports multiple AI providers: Qwen, OpenAI, and Mock fallback
 */
export class ChatService {
  /**
   * Process chat message and generate response
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    console.log(`Processing chat message: "${request.message}" (${request.language})`);

    try {
      // Try to get an available AI client
      const aiClient = AIClientFactory.getAvailableClient();
      
      if (aiClient) {
        // Use real AI
        const reply = await this.generateAIResponse(request, aiClient);
        return {
          success: true,
          reply,
          actions: [],
        };
      } else {
        // Fallback to mock response
        const reply = this.generateMockResponse(request.message, request.language);
        return {
          success: true,
          reply,
          actions: [],
        };
      }
    } catch (error) {
      console.error('AI service error, falling back to mock:', error);
      // Fallback to mock response on error
      const reply = this.generateMockResponse(request.message, request.language);
      return {
        success: true,
        reply,
        actions: [],
      };
    }
  }

  /**
   * Generate AI response using real AI client
   */
  private async generateAIResponse(request: ChatRequest, aiClient: any): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(request.language);
    const userMessage = this.buildUserMessage(request);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const response = await aiClient.chatCompletion({
      model: undefined, // Use default model
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(language: 'en' | 'zh'): string {
    if (language === 'zh') {
      return `你是Castlery家具店的专业家具顾问助手。你的任务是：
1. 帮助用户选择合适的家具
2. 提供专业的室内设计建议
3. 根据用户的房间类型、尺寸和预算推荐产品
4. 回答关于家具材质、尺寸、风格的问题
5. 保持友好、专业的语调

请用中文回复，并且要简洁明了。`;
    } else {
      return `You are a professional furniture consultant assistant for Castlery furniture store. Your tasks are:
1. Help users choose suitable furniture
2. Provide professional interior design advice
3. Recommend products based on user's room type, dimensions, and budget
4. Answer questions about furniture materials, dimensions, and styles
5. Maintain a friendly and professional tone

Please reply in English and keep responses concise and helpful.`;
    }
  }

  /**
   * Build user message with context
   */
  private buildUserMessage(request: ChatRequest): string {
    let message = request.message;

    // Add context if available
    if (request.context?.currentDesign) {
      const context = request.context.currentDesign;
      if (context.roomType) {
        message += `\n\nContext: I'm planning a ${context.roomType} room.`;
      }
    }

    return message;
  }

  /**
   * Generate mock AI response based on message keywords
   */
  private generateMockResponse(message: string, language: 'en' | 'zh'): string {
    const lowerMessage = message.toLowerCase();

    // English responses
    if (language === 'en') {
      if (lowerMessage.includes('sofa') || lowerMessage.includes('couch')) {
        return "I'd recommend a comfortable sectional sofa for your living room. It provides ample seating and creates a cozy atmosphere. Would you like me to show you some options?";
      }
      
      if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "I can help you find furniture within your budget. What's your target price range? I'll make sure to recommend pieces that fit your financial constraints.";
      }
      
      if (lowerMessage.includes('color') || lowerMessage.includes('style')) {
        return "Great question about style! I can recommend furniture in various colors and styles. Modern, contemporary, or classic - what aesthetic are you going for?";
      }
      
      if (lowerMessage.includes('small') || lowerMessage.includes('compact')) {
        return "For smaller spaces, I recommend space-efficient furniture. Consider multi-functional pieces and lighter colors to make the room feel more spacious.";
      }
      
      if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! I'm here to help you create the perfect room. Feel free to ask if you need any more suggestions!";
      }
      
      // Default response
      return "I understand you're looking for furniture recommendations. Could you tell me more about your preferences? For example, your budget, preferred style, or specific furniture types you're interested in?";
    }

    // Chinese responses
    if (language === 'zh') {
      if (lowerMessage.includes('沙发') || lowerMessage.includes('sofa')) {
        return "我建议为您的客厅选择一款舒适的组合沙发。它提供充足的座位空间，营造温馨的氛围。您想看看一些选项吗？";
      }
      
      if (lowerMessage.includes('预算') || lowerMessage.includes('价格') || lowerMessage.includes('budget')) {
        return "我可以帮您在预算范围内找到合适的家具。您的目标价格范围是多少？我会确保推荐符合您财务限制的产品。";
      }
      
      if (lowerMessage.includes('颜色') || lowerMessage.includes('风格') || lowerMessage.includes('style')) {
        return "关于风格的好问题！我可以推荐各种颜色和风格的家具。现代、当代还是经典风格 - 您想要什么样的美学效果？";
      }
      
      if (lowerMessage.includes('小') || lowerMessage.includes('紧凑') || lowerMessage.includes('small')) {
        return "对于较小的空间，我建议使用节省空间的家具。考虑多功能家具和浅色调，让房间感觉更宽敞。";
      }
      
      if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢') || lowerMessage.includes('thank')) {
        return "不客气！我在这里帮助您打造完美的房间。如果您需要更多建议，请随时询问！";
      }
      
      // Default response
      return "我理解您正在寻找家具推荐。您能告诉我更多关于您的偏好吗？例如，您的预算、喜欢的风格或您感兴趣的特定家具类型？";
    }

    return "I'm here to help with your furniture planning. How can I assist you today?";
  }
}
