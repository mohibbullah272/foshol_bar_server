import http, { Server } from "http";
import app from "./app";
import dotenv from "dotenv";
import prisma from "./config/db";
import SocketService from "./config/socket";

dotenv.config();

let server: Server | null = null;
let socketService: SocketService | null = null;
const PORT = process.env.PORT || 10000;

async function connectToDb() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
  } catch (error) {
    console.log(error,"❌ Database connection failed")
    process.exit(1)
  }
}

async function startServer() {
  try {
    await connectToDb()
    server = http.createServer(app);
    
    // Initialize Socket.io with the HTTP server
    socketService = new SocketService(server);
    
    // Make socket service available in Express app
    app.set('socketService', socketService);
    console.log('✅ Socket.io service initialized');
    
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📡 Socket.io available at ws://0.0.0.0:${PORT}`);
    });

    handleProcessEvents();
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
}


async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed.");
      
      // Close database connection
      await prisma.$disconnect();
      console.log("✅ Database connection closed.");
      
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}



// Export for use in other files
export const getSocketService = () => socketService;
export { server };
/**
 * Handle system signals and unexpected errors.
 */
function handleProcessEvents() {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
}

// Start the application
startServer();
