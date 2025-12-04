import { RequestHandler, Response } from "express";
import { AuthRequest } from "../../middlewares/validation.middleware";
import sendResponse from "../../shared/sendResponse";
import { notificationService } from "./Notification.service";
import { catchAsyncAuth } from "../../shared/catchAsycnAuth";


// Create notification (Admin only)
export const createNotification = catchAsyncAuth(async (req: AuthRequest, res: Response) => {
  const { title, content, image, userIds } = req.body;
  const adminId = req.user?.id;

  if (!adminId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Authentication required",
      data: null
    });
  }

  const result = await notificationService.createNotification({
    title,
    content,
    image,
    adminId,
    userIds: userIds || []
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Notification created and sent successfully",
    data: result
  });
});

// Get user notifications
export const getUserNotifications = catchAsyncAuth(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { page = "1", limit = "10" } = req.query;
  
  const result = await notificationService.getUserNotifications(
    userId,
    parseInt(page as string),
    parseInt(limit as string)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User notifications retrieved successfully",
    data: result
  });
});

// Get latest notifications for user
export const getLatestNotifications = catchAsyncAuth(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const limit = parseInt(req.query.limit as string) || 5;
  
  const result = await notificationService.getLatestNotifications(userId, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Latest notifications retrieved successfully",
    data: result
  });
});

// Get all notifications for admin dashboard
export const getAdminNotifications = catchAsyncAuth(async (req: AuthRequest, res: Response) => {
  const { page = "1", limit = "10", search } = req.query;
  
  const result = await notificationService.getAdminNotifications(
    parseInt(page as string),
    parseInt(limit as string),
    search as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin notifications retrieved successfully",
    data: result
  });
});

// Delete notification (Admin only)
export const deleteNotification = catchAsyncAuth(async (req: AuthRequest, res: Response) => {
  const notificationId = req.params.id;

  const result = await notificationService.deleteNotification(notificationId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification deleted successfully",
    data: result
  });
}) as RequestHandler;

// Mark notification as seen
export const markAsSeen = catchAsyncAuth(async (req: AuthRequest, res: Response) => {
  const notificationId = req.params.notificationId;
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Authentication required",
      data: null
    });
  }

  const result = await notificationService.markAsSeen(notificationId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as seen",
    data: result
  });
});

// Get notification statistics
export const getNotificationStats = catchAsyncAuth(async(req:AuthRequest,res:Response) => {
  const adminId = req.user?.id;

  if (!adminId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Authentication required",
      data: null
    });
  }

  const result = await notificationService.getNotificationStats(adminId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification statistics retrieved successfully",
    data: result
  });
});