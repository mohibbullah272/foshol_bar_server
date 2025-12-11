import express from 'express';
import { createNotification, deleteNotification, getAdminNotifications, getLatestNotifications, getNotificationStats, getUserNotifications, markAsSeen } from './Notification.controller';
import { requireAdminOrApprovedInvestor, validateUserFromRequest } from '../../middlewares/validation.middleware';
import { requireAdmin } from '../../middlewares/auth';


const router = express.Router();

// Admin routes
router.post(
  '/',
  validateUserFromRequest as any,
  requireAdmin as any,
  createNotification
);

router.get(
  '/admin/all',
  validateUserFromRequest as any,
  requireAdmin as any,
  getAdminNotifications
);

router.delete(
  '/:id',
  validateUserFromRequest as any,
  requireAdmin as any,
  deleteNotification
);

router.get(
  '/stats',
  validateUserFromRequest as any,
  requireAdmin as any,
  getNotificationStats
);

// User routes
router.get(
  '/user/:userId',
  validateUserFromRequest as any,
  getUserNotifications
);

router.get(
  '/user/:userId/latest',
  validateUserFromRequest as any,
  getLatestNotifications
);

router.patch(
  '/:notificationId/seen',
  validateUserFromRequest as any,
  requireAdminOrApprovedInvestor as any,
  markAsSeen
);

export const NotificationRouter = router