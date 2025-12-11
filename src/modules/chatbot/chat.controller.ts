import { Request, Response } from 'express';
import { getAIIntroduction, processChat } from './chat.service';
import { ChatRequest } from '../../types/chatbot.types';


// Health check endpoint
export const healthCheck = (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: 'Foshol Mitra AI Chatbot',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
};

// Get AI introduction
export const getIntroduction = (_req: Request, res: Response): void => {
  try {
    const introduction = getAIIntroduction();
    
    res.json({
      success: true,
      data: {
        introduction,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate introduction'
    });
  }
};

// Process chat message
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body as ChatRequest;
    
    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message is required'
      });
      return;
    }
    
    const result = await processChat({ message, sessionId });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Something went wrong'
    });
  }
};

// Clear session (though we don't store messages, we can clear session ID if needed)
export const clearSession = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Session cleared. Each new conversation starts fresh! 🌱',
    timestamp: new Date().toISOString()
  });
};