import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role, Status } from '@prisma/client';
import { UserRole, UserStatus } from '../types/conversation.types';

const prisma = new PrismaClient();

// Define the user type
interface RequestUser {
  id: number;
  role: UserRole;
  status: UserStatus;
}

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: RequestUser;
}

// Helper to convert Prisma enums to our types
const convertPrismaRole = (role: Role): UserRole => {
  return role as UserRole;
};

const convertPrismaStatus = (status: Status): UserStatus => {
  return status as UserStatus;
};

// Middleware to validate user from request body/query
export const validateUserFromRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
  

    // Check for user data in body or query
    const userId = req.body?.userId || req.query?.userId;
    const userRole = req.body?.userRole || req.query?.userRole;
    const userStatus = req.body?.userStatus || req.query?.userStatus;



    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required in request body or query',
        debug: {
          body: req.body,
          query: req.query
        }
      });
    }
    // Convert to number
    const id = parseInt(userId.toString(), 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    // If role and status provided in request, validate them
    if (userRole && userStatus) {
      const role = userRole.toString() as UserRole;
      const status = userStatus.toString() as UserStatus;
      
      // Validate role
      if (!['ADMIN', 'INVESTOR'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user role. Must be ADMIN or INVESTOR'
        });
      }

      // Validate status
      if (!['PENDING', 'APPROVED', 'BLOCKED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user status. Must be PENDING, APPROVED, or BLOCKED'
        });
      }

      req.user = {
        id,
        role,
        status
      };
      return next();
    }

    // Otherwise fetch from database
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = {
      id: user.id,
      role: convertPrismaRole(user.role),
      status: convertPrismaStatus(user.status)
    };
    
    next();
  } catch (error) {
    console.error('User validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error validating user'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Middleware to check if user is approved investor
export const requireApprovedInvestor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User authentication required'
    });
  }

  if (req.user.role !== 'INVESTOR') {
    return res.status(403).json({
      success: false,
      error: 'Investor access required'
    });
  }


  next();
};

// Middleware to allow both admin and approved investor
export const requireAdminOrApprovedInvestor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User authentication required'
    });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role === 'INVESTOR' && req.user.status === 'APPROVED') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. Admin or approved investor required'
  });
};