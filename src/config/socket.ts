import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import prisma from "./db";
import { addMessage, getConversationById } from "../Conversation/chat.service";
import { UserRole } from "../types/conversation.types";
 // <-- adjust if needed

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    role: string;
    status: string;
  };
}

class SocketService {
  private io: Server;
  private activeUsers = new Map<number, string>(); // userId -> last socketId
  private userSockets = new Map<number, Set<string>>(); // userId -> all sockets

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000", "http://192.168.0.202:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    });

    this.setupEventHandlers();
  }

  // -------------------------
  // AUTHENTICATION
  // -------------------------
  private async authenticateSocket(
    socket: AuthenticatedSocket,
    userId: number
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      if (!user) {
        socket.emit("authentication_error", { message: "User not found" });
        return false;
      }

      socket.user = {
        id: user.id,
        role: user.role,
        status: user.status,
      };

      return true;
    } catch (err) {
      console.error("Authentication error:", err);
      socket.emit("authentication_error", { message: "Authentication failed" });
      return false;
    }
  }

  // -------------------------
  // SOCKET EVENT HANDLERS
  // -------------------------
  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`New socket: ${socket.id}`);

      // AUTH EVENT
      socket.on("authenticate", async (data: { userId: number }) => {
        const ok = await this.authenticateSocket(socket, data.userId);
        if (!ok || !socket.user) return;

        // Track socket
        this.activeUsers.set(socket.user.id, socket.id);

        if (!this.userSockets.has(socket.user.id)) {
          this.userSockets.set(socket.user.id, new Set());
        }
        this.userSockets.get(socket.user.id)!.add(socket.id);

        // Join personal room
        socket.join(`user_${socket.user.id}`);

        // Join all convos
        await this.joinUserConversationRooms(socket);

        socket.emit("authenticated", {
          userId: socket.user.id,
          role: socket.user.role,
        });

        console.log(`User authenticated: ${socket.user.id}`);

        this.notifyAdminUserStatus(socket.user.id, true);
      });

      // DISCONNECT
      socket.on("disconnect", () => {
        if (!socket.user) {
          console.log(`Unauthed socket left: ${socket.id}`);
          return;
        }

        const userSockets = this.userSockets.get(socket.user.id);
        if (userSockets) {
          userSockets.delete(socket.id);

          if (userSockets.size === 0) {
            this.userSockets.delete(socket.user.id);
            this.activeUsers.delete(socket.user.id);
            this.notifyAdminUserStatus(socket.user.id, false);
          }
        }

        console.log(
          `User disconnected ${socket.user.id}, remaining: ${
            userSockets?.size || 0
          }`
        );
      });

      socket.on("reconnect_attempt", () =>
        console.log(`Reconnecting: ${socket.id}`)
      );

      this.setupMessageHandlers(socket);
    });
  }

  // -------------------------
  // JOIN CONVERSATION ROOMS
  // -------------------------
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

      conversations.forEach((c) => {
        socket.join(`conversation_${c.id}`);
        console.log(`User ${socket.user?.id} joined conversation_${c.id}`);
      });
    } catch (err) {
      console.error("Join convos error:", err);
    }
  }

  // -------------------------
  // MESSAGE HANDLERS
  // -------------------------
  private setupMessageHandlers(socket: AuthenticatedSocket) {
    // SEND MESSAGE
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
          console.error("Message error:", err);
          socket.emit('operation_error', { message:"failed to send message" });

        }
      }
    );

    // JOIN CONVERSATION
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

        console.log(
          `User ${socket.user.id} joined conversation ${data.conversationId}`
        );
      }
    );

    // LEAVE CONVERSATION
    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
      socket.emit("conversation_left", { conversationId });
    });

    // TYPING EVENT
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

    // GET FULL CONVERSATION
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

    // USER ACTIVE PING
    socket.on("user_active", (userId: number) => {
      if (socket.user && socket.user.id === userId) {
        this.activeUsers.set(userId, socket.id);
        socket.emit("user_active_ack", { userId });
      }
    });
  }

  // -------------------------
  // NOTIFY ADMINS
  // -------------------------
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
      console.error("Admin notify error:", err);
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
      console.error("Admin new msg error:", err);
    }
  }

  // -------------------------
  // PUBLIC EMITTERS
  // -------------------------
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
