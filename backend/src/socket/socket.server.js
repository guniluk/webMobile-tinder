import { Server } from "socket.io";

let io;

// Map to store connected users: { [userId]: socketId }
const userSocketMap = {};

/**
 * Get socket ID for a given user ID
 * @param {string} userId
 * @returns {string | undefined}
 */
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

/**
 * Get Socket.IO instance
 * @returns {Server}
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized!");
  }
  return io;
};

/**
 * Initialize Socket.IO with HTTP Server
 * @param {import("http").Server} httpServer
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL || true
          : ["http://localhost:5173", "http://localhost:3000", process.env.DEVELOPMENT_URL].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(
      `⚡ Socket connected: ${socket.id} (User ID: ${userId || "Anonymous"})`,
    );

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    // Broadcast current online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle incoming custom events if needed
    socket.on("sendMessage", (data) => {
      const { receiverId, message } = data;
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    });

    // Handle typing status
    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          senderId: userId,
          isTyping,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(
        `❌ Socket disconnected: ${socket.id} (User ID: ${userId || "Anonymous"})`,
      );
      if (
        userId &&
        userId !== "undefined" &&
        userSocketMap[userId] === socket.id
      ) {
        delete userSocketMap[userId];
      }
      // Broadcast updated online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};
