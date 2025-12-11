import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import prisma from "./db";
import { addMessage, getConversationById } from "../Conversation/chat.service";
import { UserRole } from "../types/conversation.types";

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    role: string;
    status: string;
  };
}

class SocketService {
  private io: Server;
  private activeUsers = new Map<number, string>();
  private userSockets = new Map<number, Set<string>>();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000", "http://192.168.0.202:3000","https://fosholbari.com","https://fosholbari-client-v0-2-rft1.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    });

    // ✅ ENHANCED: Better middleware with detailed logging
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const handshakeUserId = socket.handshake.auth?.userId;
        
        if (!handshakeUserId) {
          console.warn(`⚠️ Socket ${socket.id} connected without userId in handshake`);
          return next(); // Allow connection but require authenticate event
        }

        console.log(`🔐 Authenticating socket ${socket.id} with userId: ${handshakeUserId}`);
        const ok = await this.authenticateSocket(socket, handshakeUserId);
        
        if (!ok) {
          console.error(`❌ Authentication failed for socket ${socket.id}`);
          return next(new Error("Auth failed"));
        }

        console.log(`✅ Handshake auth successful for user ${handshakeUserId}`);
        next();
      } catch (err) {
        console.error("💥 Handshake auth error:", err);
        next(new Error("Authentication error"));
      }
    });

    this.setupEventHandlers();
  }

  private async authenticateSocket(
    socket: AuthenticatedSocket,
    userId: number
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      if (!user) {
        console.error(`❌ User ${userId} not found in database`);
        socket.emit("authentication_error", { message: "User not found" });
        return false;
      }

      socket.user = {
        id: user.id,
        role: user.role,
        status: user.status,
      };

      console.log(`✅ User ${user.id} authenticated successfully`);
      return true;
    } catch (err) {
      console.error("💥 Authentication error:", err);
      socket.emit("authentication_error", { message: "Authentication failed" });
      return false;
    }
  }

  private setupEventHandlers() {
    this.io.on("connection", async (socket: AuthenticatedSocket) => {
      console.log(`🔌 New socket connected: ${socket.id}`);

      // ✅ If already authenticated via handshake, complete setup
      if (socket.user) {
        console.log(`⚡ User ${socket.user.id} already authenticated via handshake`);
        await this.completeAuthentication(socket);
      }

      // AUTH EVENT (for clients that don't send handshake auth)
      socket.on("authenticate", async (data: { userId: number }) => {
        console.log(`🔐 Received authenticate event from socket ${socket.id}`);
        
        if (socket.user) {
          console.log(`ℹ️ Socket ${socket.id} already authenticated, skipping`);
          return;
        }

        const ok = await this.authenticateSocket(socket, data.userId);
        if (!ok || !socket.user) return;

        await this.completeAuthentication(socket);
      });

      // DISCONNECT
      socket.on("disconnect", (reason) => {
        if (!socket.user) {
          console.log(`🔴 Unauthed socket ${socket.id} disconnected: ${reason}`);
          return;
        }

        const userSockets = this.userSockets.get(socket.user.id);
        if (userSockets) {
          userSockets.delete(socket.id);

          if (userSockets.size === 0) {
            this.userSockets.delete(socket.user.id);
            this.activeUsers.delete(socket.user.id);
            this.notifyAdminUserStatus(socket.user.id, false);
            console.log(`🔴 User ${socket.user.id} fully disconnected`);
          } else {
            console.log(`🔴 User ${socket.user.id} disconnected one socket, ${userSockets.size} remaining`);
          }
        }
      });

      socket.on("reconnect_attempt", () =>
        console.log(`🔄 Reconnecting: ${socket.id}`)
      );

      this.setupMessageHandlers(socket);
    });
  }

  // ✅ NEW: Separate method for completing authentication setup
  private async completeAuthentication(socket: AuthenticatedSocket) {
    if (!socket.user) return;

    try {
      // Track socket
      this.activeUsers.set(socket.user.id, socket.id);

      if (!this.userSockets.has(socket.user.id)) {
        this.userSockets.set(socket.user.id, new Set());
      }
      this.userSockets.get(socket.user.id)!.add(socket.id);

      // Join personal room
      socket.join(`user_${socket.user.id}`);
      console.log(`👤 User ${socket.user.id} joined personal room`);

      // Join all convos
      await this.joinUserConversationRooms(socket);

      socket.emit("authenticated", {
        userId: socket.user.id,
        role: socket.user.role,
      });

      console.log(`✅ User ${socket.user.id} fully authenticated and setup complete`);

      this.notifyAdminUserStatus(socket.user.id, true);
    } catch (err) {
      console.error(`💥 Error completing authentication for user ${socket.user.id}:`, err);
      socket.emit("operation_error", { message: "Setup failed" });
    }
  }

  private async joinUserConversationRooms(socket: AuthenticatedSocket) {
    if (!socket.user) return;

    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { userId: socket.user.id },
            ...(socket.user.role === "ADMIN" ? [{}] : []),
          ],
        },
      });

      console.log(`📚 User ${socket.user.id} joining ${conversations.length} conversations`);

      conversations.forEach((c) => {
        socket.join(`conversation_${c.id}`);
        console.log(`  ✓ User ${socket.user?.id} joined conversation_${c.id}`);
      });
    } catch (err) {
      console.error(`💥 Error joining conversations for user ${socket.user.id}:`, err);
      throw err; // Propagate error to trigger operation_error emission
    }
  }

  private setupMessageHandlers(socket: AuthenticatedSocket) {
    socket.on(
      "send_message",
      async (data: { conversationId: number; text: string; userId: number }) => {
        try {
          if (!socket.user) {
            socket.emit("authentication_error", { message: "Not authenticated" });
            return;
          }

          const result = await addMessage(
            data.conversationId,
            data.text,
            socket.user.id,
            socket.user.role as UserRole
          );

          if (!result.success) {
            socket.emit('operation_error', { message: "something went wrong"  });
            return;
          }

          const messageWithUser = {
            ...result.data,
            sender: {
              id: socket.user.id,
              role: socket.user.role,
            },
          };

          this.io
            .to(`conversation_${data.conversationId}`)
            .emit("new_message", {
              message: messageWithUser,
              conversationId: data.conversationId,
            });

          if (socket.user.role === "INVESTOR") {
            this.notifyAdminNewMessage(messageWithUser, data.conversationId);
          }
        } catch (err) {
          console.error("💥 Message error:", err);
          socket.emit('operation_error', { message:"failed to send message" });
        }
      }
    );

    socket.on(
      "join_conversation",
      async (data: { conversationId: number; userId: number }) => {
        if (!socket.user) {
          socket.emit("authentication_error", { message: "Not authenticated" });
          return;
        }

        socket.join(`conversation_${data.conversationId}`);
        socket.emit("conversation_joined", {
          conversationId: data.conversationId,
          userId: socket.user.id,
        });

        console.log(`➕ User ${socket.user.id} joined conversation ${data.conversationId}`);
      }
    );

    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
      socket.emit("conversation_left", { conversationId });
    });

    socket.on(
      "typing",
      (data: { conversationId: number; isTyping: boolean; userId: number }) => {
        if (!socket.user) return;

        socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
          userId: socket.user.id,
          conversationId: data.conversationId,
          isTyping: data.isTyping,
          userRole: socket.user.role,
        });
      }
    );

    socket.on(
      "get_conversation",
      async (data: { conversationId: number; userId: number }) => {
        try {
          if (!socket.user) {
            socket.emit("authentication_error", { message: "Not authenticated" });
            return;
          }

          const result = await getConversationById(
            data.conversationId,
            socket.user.id,
            socket.user.role as UserRole
          );

          if (result.success) {
            socket.emit("conversation_data", {
              conversationId: data.conversationId,
              data: result.data,
            });
          } else {
            socket.emit('operation_error', { message: result.error });
          }
        } catch (err) {
          socket.emit('operation_error', { message: "failed to get conversation" });
        }
      }
    );

    socket.on("user_active", (userId: number) => {
      if (socket.user && socket.user.id === userId) {
        this.activeUsers.set(userId, socket.id);
        socket.emit("user_active_ack", { userId });
      }
    });
  }

  private async notifyAdminUserStatus(userId: number, isOnline: boolean) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
      });

      admins.forEach((a) => {
        this.emitToUser(a.id, "user_status_change", {
          userId,
          isOnline,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.error("💥 Admin notify error:", err);
    }
  }

  private async notifyAdminNewMessage(message: any, conversationId: number) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
      });

      admins.forEach((a) => {
        this.emitToUser(a.id, "new_investor_message", {
          message,
          conversationId,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.error("💥 Admin new msg error:", err);
    }
  }

  public emitToUser(userId: number, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.forEach((id) => this.io.to(id).emit(event, data));
  }

  public emitToConversation(conversationId: number, event: string, data: any) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  public emitToRole(role: string, event: string, data: any) {
    this.io.emit(event, { ...data, targetRole: role });
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public isUserOnline(userId: number) {
    return (
      this.userSockets.has(userId) &&
      this.userSockets.get(userId)!.size > 0
    );
  }

  public getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  public getIO() {
    return this.io;
  }
}

export default SocketService;