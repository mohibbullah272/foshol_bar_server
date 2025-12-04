import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  title: string;
  content: string;
  image?: string;
  adminId: number;
  userIds: number[]; // If empty, send to all users
}

export interface NotificationStats {
  totalNotifications: number;
  totalSent: number;
  totalSeen: number;
  todayNotifications: number;
}

const createNotification = async (input: CreateNotificationInput) => {
  const { title, content, image, adminId, userIds } = input;

  // Create the notification
  const notification = await prisma.notification.create({
    data: {
      title,
      content,
      image,
      createdAt: new Date()
    }
  });

  // Determine which users to send to
  let targetUserIds: number[];
  
  if (userIds.length === 0) {
    // Send to all users (except admin)
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: adminId }
      },
      select: { id: true }
    });
    targetUserIds = allUsers.map(user => user.id);
  } else {
    // Send to specific users
    targetUserIds = userIds;
  }

  // Create delivery records for each user
  const deliveryPromises = targetUserIds.map(userId =>
    prisma.notificationDeliver.create({
      data: {
        userId,
        notificationId: notification.id,
        isSeen: false
      }
    })
  );

  await Promise.all(deliveryPromises);

  // Return notification with delivery count
  return {
    ...notification,
    sentTo: targetUserIds.length
  };
};
const getUserNotifications = async (userId: number, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notificationDeliver.findMany({
      where: {
        userId
      },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            content: true,
            image: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        notification: {
          createdAt: 'desc'
        }
      },
      skip,
      take: limit
    }),
    prisma.notificationDeliver.count({
      where: { userId }
    })
  ]);

  // Transform the data
  const formattedNotifications = notifications.map(delivery => ({
    id: delivery.notification.id,
    title: delivery.notification.title,
    content: delivery.notification.content,
    image: delivery.notification.image,
    createdAt: delivery.notification.createdAt,
    isSeen: delivery.isSeen,
    deliveryId: delivery.id
  }));

  return {
    notifications: formattedNotifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getLatestNotifications = async (userId: number, limit: number) => {
  const notifications = await prisma.notificationDeliver.findMany({
    where: {
      userId
    },
    include: {
      notification: {
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      notification: {
        createdAt: 'desc'
      }
    },
    take: limit
  });

  // Count unread notifications
  const unreadCount = await prisma.notificationDeliver.count({
    where: {
      userId,
      isSeen: false
    }
  });

  // Transform the data
  const formattedNotifications = notifications.map(delivery => ({
    id: delivery.notification.id,
    title: delivery.notification.title,
    content: delivery.notification.content,
    image: delivery.notification.image,
    createdAt: delivery.notification.createdAt,
    isSeen: delivery.isSeen,
    deliveryId: delivery.id
  }));

  return {
    notifications: formattedNotifications,
    unreadCount
  };
};

const getAdminNotifications = async (page: number, limit: number, search?: string) => {
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.NotificationWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {};

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereCondition,
      include: {
        NotificationDeliver: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            isSeen: true
          }
        },
        _count: {
          select: {
            NotificationDeliver: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.notification.count({
      where: whereCondition
    })
  ]);

  // Format the response
  const formattedNotifications = notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    content: notification.content,
    image: notification.image,
    createdAt: notification.createdAt,
    totalSent: notification._count.NotificationDeliver,
    deliveries: notification.NotificationDeliver.map(delivery => ({
      id: delivery.id,
      userId: delivery.user.id,
      userName: delivery.user.name,
      userEmail: delivery.user.email,
      isSeen: delivery.isSeen
    }))
  }));

  return {
    notifications: formattedNotifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const deleteNotification = async (notificationId: string) => {
  // Delete using transaction to maintain referential integrity
  const result = await prisma.$transaction([
    // First delete all delivery records
    prisma.notificationDeliver.deleteMany({
      where: { notificationId }
    }),
    // Then delete the notification
    prisma.notification.delete({
      where: { id: notificationId }
    })
  ]);

  return {
    deletedNotificationId: notificationId,
    deletedDeliveries: result[0].count
  };
};

const markAsSeen = async (notificationId: string, userId: number) => {
  const delivery = await prisma.notificationDeliver.findFirst({
    where: {
      notificationId,
      userId
    }
  });

  if (!delivery) {
    throw new Error('Notification not found for this user');
  }

  const updatedDelivery = await prisma.notificationDeliver.update({
    where: { id: delivery.id },
    data: { isSeen: true }
  });

  return {
    notificationId,
    userId,
    isSeen: updatedDelivery.isSeen
  };
};

 const getNotificationStats = async (adminId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalNotifications,
    totalDeliveries,
    seenDeliveries,
    todayNotifications
  ] = await Promise.all([
    prisma.notification.count(),
    prisma.notificationDeliver.count(),
    prisma.notificationDeliver.count({
      where: { isSeen: true }
    }),
    prisma.notification.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })
  ]);

  const stats: NotificationStats = {
    totalNotifications,
    totalSent: totalDeliveries,
    totalSeen: seenDeliveries,
    todayNotifications
  };

  return stats;
};

export const notificationService ={
    createNotification,
    getAdminNotifications,
    getUserNotifications,
    markAsSeen,
    getNotificationStats,
    deleteNotification,
    getLatestNotifications

}