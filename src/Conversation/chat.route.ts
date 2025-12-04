import { Router } from 'express';
import {
  handleCreateConversation,
  handleAddMessage,
  handleGetAllConversations,
  handleGetConversationById,
  handleGetConversationByUserId,
  handleGetUserConversations,
  getSocketStatus,
  emitToUser,
  emitToConversation,
  checkUserOnlineStatus
} from './chat.controller';
import {
  validateUserFromRequest,
  requireAdmin,
  requireApprovedInvestor,
  requireAdminOrApprovedInvestor
} from '../middlewares/validation.middleware';

const router = Router();


// Socket status (Admin only)
router.get(
  '/socket/status',
  validateUserFromRequest as any,
  requireAdmin as any,
  getSocketStatus as any
);

// Emit to specific user (Admin only)
router.post(
  '/socket/emit/user',
  validateUserFromRequest as any,
  requireAdmin as any,
  emitToUser as any
);

// Emit to conversation (Admin or conversation participant)
router.post(
  '/socket/emit/conversation',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  emitToConversation as any
);

// Check if user is online
router.get(
  '/socket/user/:userId/status',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  checkUserOnlineStatus as any
);


// Investor creates conversation (requires user data in body)
router.post(
  '/conversations',
  validateUserFromRequest as any,
  requireApprovedInvestor as any,
  handleCreateConversation as any
);

// Add message to conversation
router.post(
  '/messages',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  handleAddMessage as any
);

// Admin gets all conversations
router.get(
  '/conversations',
  validateUserFromRequest as any,
  requireAdmin as any,
  handleGetAllConversations as any
);

// Get conversation by ID
router.get(
  '/conversations/:convoId',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  handleGetConversationById as any
);

// Get conversation by user ID
router.get(
  '/conversations/user/:userId',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  handleGetConversationByUserId as any
);

// Get user's conversations (with optional userId query param for admin)
router.get(
  '/user/conversations',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  handleGetUserConversations as any
);

export const chatRoute = router