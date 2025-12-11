import { PrismaClient, Prisma } from '@prisma/client';
import { UserRole, UserStatus } from '../types/conversation.types';
import { getSocketService } from '../server';

const prisma = new PrismaClient();



// =========== VALIDATION FUNCTIONS ===========
export const validateUser = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Error validating user' };
  }
};

export const validateInvestorPermissions = (user: any) => {
  if (user.role !== 'INVESTOR') {
    return { success: false, error: 'Only investors can create conversations' };
  }
  
  
  return { success: true };
};

export const checkConversationAccess = async (convoId: number, userId: number, userRole: UserRole) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: convoId },
      include: { user: true }
    });
    
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }
    
    // Admin can access any conversation
    if (userRole === 'ADMIN') {
      return { success: true, data: conversation };
    }
    
    // Investor can only access their own conversation
    if (conversation.userId !== userId) {
      return { success: false, error: 'Access denied to this conversation' };
    }
    
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: 'Error checking conversation access' };
  }
};

// =========== CONVERSATION FUNCTIONS ===========
export const createConversation = async (userId: number, userRole: UserRole, userStatus: UserStatus) => {
  try {
    // Validate investor permissions
    if (userRole !== 'INVESTOR') {
      return { success: false, error: 'Only investors can create conversations' };
    }
    
 

    // Check for existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: { userId }
    });
    
    if (existingConversation) {
      return { 
        success: true, 
        data: existingConversation,
        message: 'Existing conversation found'
      };
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role:true
          }
        }
      }
    });

    return { success: true, data: conversation };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'Failed to create conversation' };
  }
};

// =========== MESSAGE FUNCTIONS ===========
export const addMessage = async (convoId: number, text: string, userId: number, userRole: UserRole) => {
  try {
    // Check conversation access
    const accessCheck = await checkConversationAccess(convoId, userId, userRole);
    if (!accessCheck.success) {
      return accessCheck;
    }

    const checkUserRole = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Create message
    const message = await prisma.message.create({
      data: { 
        convoId, 
        Text: text,
        senderRole: checkUserRole?.role! 
      },
      include: {
        convo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Get socket service and emit event
    const socketService = getSocketService();
    if (socketService) {
      // Enhanced message data with user info
      const messageWithUser = {
        ...message,
        sender: {
          id: userId,
          role: userRole,
          name: checkUserRole?.name
        }
      };
      
      socketService.emitToConversation(convoId, 'new_message', {
        message: messageWithUser,
        conversationId: convoId,
        timestamp: new Date().toISOString()
      });
      
      // If investor sent message, notify admins
      if (userRole === 'INVESTOR') {
        socketService.emitToRole('ADMIN', 'new_investor_message', {
          message: messageWithUser,
          conversationId: convoId
        });
      }
    }
  

    return { success: true, data: message };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'Failed to add message' };
  }
};

// Add a new function to handle conversation creation with socket events
export const createConversationWithSocket = async (userId: number, userRole: UserRole, userStatus: UserStatus) => {
  try {
    const result = await createConversation(userId, userRole, userStatus);
    
    if (result.success && result.data) {
      const socketService = getSocketService();
      if (socketService) {
        // Notify user that conversation was created
        socketService.emitToUser(userId, 'conversation_created', {
          conversation: result.data
        });
        
        // Notify admins about new conversation
        if (userRole === 'INVESTOR') {
          socketService.emitToRole('ADMIN', 'new_conversation', {
            conversation: result.data,
            investorId: userId
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in createConversationWithSocket:', error);
    return { success: false, error: 'Failed to create conversation' };
  }
};
// =========== FETCH FUNCTIONS ===========
export const getAllConversations = async () => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true
          }
        },
        Message: {
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      },
    
    });

    return { success: true, data: conversations };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'Failed to fetch conversations' };
  }
};

export const getConversationById = async (convoId: number, userId: number, userRole: UserRole) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: convoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true
          }
        },
        Message: { // This should match your Prisma model name
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedConversation = conversation ? {
      ...conversation,
      messages: conversation.Message || [] // Rename Message to messages
    } : null;

    if (!transformedConversation) {
      return { success: false, error: 'Conversation not found' };
    }

    return { success: true, data: transformedConversation };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, error: 'Failed to fetch conversation' };
  }
};


export const getUserConversations = async (userId: number, requestingUserId: number, requestingUserRole: UserRole) => {
  try {
    // Admin can view any user's conversations, users can only view their own
    if (requestingUserRole !== 'ADMIN' && userId !== requestingUserId) {
      return { 
        success: false, 
        error: 'You can only view your own conversations' 
      };
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        Message: {
          orderBy: { createdAt: 'asc' }
        }
      },
 
    });

    return { success: true, data: conversations };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'Failed to fetch user conversations' };
  }
};

export const getConversationByUserId = async (userId: number, requestingUserId: number, requestingUserRole: UserRole) => {
  try {
    // Only admin or the user themselves can access
    if (requestingUserRole !== 'ADMIN' && userId !== requestingUserId) {
      return { 
        success: false, 
        error: 'Access denied to this conversation' 
      };
    }

    const conversation = await prisma.conversation.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role:true
          }
        },
    
      }
    });

    if (!conversation) {
      return { 
        success: false, 
        error: 'No conversation found for this user' 
      };
    }

    return { success: true, data: conversation };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'Failed to fetch conversation' };
  }
};

export const closePrismaConnection = async () => {
  await prisma.$disconnect();
};

// Export all functions
export const conversationService = {
  createConversation,
  addMessage,
  getAllConversations,
  getConversationById,
  getUserConversations,
  getConversationByUserId,
  closePrismaConnection
};