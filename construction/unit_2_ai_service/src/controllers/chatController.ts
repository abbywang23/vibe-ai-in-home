import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/ChatService';
import { ChatRequest, ChatResponse } from '../models/types';
import { ChatRequestSchema } from '../models/schemas';

export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * POST /api/ai/chat
   * Process chat message
   */
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request
      const validatedData = ChatRequestSchema.parse(req.body);
      const request: ChatRequest = validatedData as ChatRequest;

      // Process message
      const response: ChatResponse = await this.chatService.processMessage(request);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
