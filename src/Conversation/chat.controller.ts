import { Response } from 'express';
import { AuthRequest } from '../middlewares/validation.middleware';
import { addMessage, createConversation, getAllConversations, getConversationById, getConversationByUserId, getUserConversations } from './chat.service';
import SocketService from '../config/socket';






export const getSocketStatus = (req: AuthRequest, res: Response) => {
  try {
    const socketService = req.app.get('socketService') as SocketService;
    
    if (!socketService) {
      return res.status(200).json({
        success: true,
        data: {
          socketEnabled: false,
          message: 'Socket service not initialized'
        }
      });
    }

    const onlineUsers = socketService.getOnlineUsers();
    
    res.status(200).json({
      success: true,
      data: {
        socketEnabled: true,
        onlineUsers: onlineUsers.length,
        totalConnections: onlineUsers.reduce((total, userId) => {
          const sockets = (socketService as any).userSockets?.get(userId);
          return total + (sockets?.size || 0);
        }, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get socket status'
    });
  }
};

export const emitToUser = (req: AuthRequest, res: Response) => {
  try {
    const { userId, event, data } = req.body;
    const socketService = req.app.get('socketService') as SocketService;
    
    if (!socketService) {
      return res.status(400).json({
        success: false,
        error: 'Socket service not available'
      });
    }

    socketService.emitToUser(Number(userId), event, data);
    
    res.status(200).json({
      success: true,
      message: `Event '${event}' sent to user ${userId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to emit event'
    });
  }
};

export const emitToConversation = (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, event, data } = req.body;
    const socketService = req.app.get('socketService') as SocketService;
    
    if (!socketService) {
      return res.status(400).json({
        success: false,
        error: 'Socket service not available'
      });
    }

    socketService.emitToConversation(Number(conversationId), event, data);
    
    res.status(200).json({
      success: true,
      message: `Event '${event}' sent to conversation ${conversationId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to emit event'
    });
  }
};

export const checkUserOnlineStatus = (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const socketService = req.app.get('socketService') as SocketService;
    
    if (!socketService) {
      return res.status(200).json({
        success: true,
        data: { isOnline: false, message: 'Socket service not available' }
      });
    }

    const isOnline = socketService.isUserOnline(Number(userId));
    
    res.status(200).json({
      success: true,
      data: { isOnline }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check user status'
    });
  }
};








// Create a new conversation (Investor only)
export const handleCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    const { id, role, status } = req.user;
    const result = await createConversation(id, role, status);

    if (!result.success) {
      const statusCode = result.error!.includes('Only investors') || 
                         result.error!.includes('approved investors') ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Add message to conversation
export const handleAddMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    const { id: userId, role } = req.user;
    const { convoId, text } = req.body;

    // Validate input
    if (!convoId || !text) {
      return res.status(400).json({
        success: false,
        error: 'convoId and text are required'
      });
    }

    const convoIdNum = parseInt(convoId.toString(), 10);
    if (isNaN(convoIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid convoId format'
      });
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text must be a non-empty string'
      });
    }

    const result = await addMessage(convoIdNum, text.trim(), userId, role);

    if (!result.success) {
     
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get all conversations (Admin only)
export const handleGetAllConversations = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAllConversations();
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get conversation by ID
// In your backend controller
export const handleGetConversationById = async (req: AuthRequest, res: Response) => {

  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    const { id: userId, role } = req.user;
    const { convoId } = req.params;

    const convoIdNum = parseInt(convoId, 10);
    if (isNaN(convoIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID'
      });
    }

    const result = await getConversationById(convoIdNum, userId, role);
    
    // Add logging to see what's being returned
    // console.log('Backend returning conversation:', {
    //   success: result.success,
    //   hasData: !!result.data,
    //   hasMessages: result.data?.messages ? 'YES' : 'NO',
    //   messageCount: result.data?.messages?.length || 0,
    //   messages: result.data?.messages
    // });
 

    if (!result.success) {
      const statusCode = result?.error!.includes('Access denied') ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get conversation by user ID
export const handleGetConversationByUserId = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    const { id: requestingUserId, role } = req.user;
    const { userId } = req.params;

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const result = await getConversationByUserId(userIdNum, requestingUserId, role);

    if (!result.success) {
      const statusCode = result.error!.includes('Access denied') ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get conversation by user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get user's conversations
export const handleGetUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    const { id: requestingUserId, role } = req.user;
    const userId = req.query.userId ? parseInt(req.query.userId.toString(), 10) : requestingUserId;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const result = await getUserConversations(userId, requestingUserId, role);

    if (!result.success) {
      const statusCode = result.error!.includes('only view your own') ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};