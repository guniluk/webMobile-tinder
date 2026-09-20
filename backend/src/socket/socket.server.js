import { Server } from "socket.io";

let io;

// Map to store connected users: { [userId]: Set<socketId> }
const userSocketMap = {};

/**
 * Get all socket IDs for a given user ID
 * @param {string} userId
 * @returns {string[]}
 */
export const getReceiverSocketIds = (userId) => {
  if (!userId) return [];
  const sockets = userSocketMap[userId.toString()];
  return sockets ? Array.from(sockets) : [];
};

/**
 * Get a single socket ID for a given user ID (for backward compatibility)
 * @param {string} userId
 * @returns {string | undefined}
 */
export const getReceiverSocketId = (userId) => {
  const ids = getReceiverSocketIds(userId);
  return ids[0];
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
 * Clean up stale socket IDs and return array of truly online user IDs
 * @returns {string[]}
 */
export const cleanAndGetOnlineUsers = () => {
  if (!io) return [];
  const activeSockets = io.sockets.sockets; // Map<string, Socket> of active sockets
  const onlineUserIds = [];

  for (const [uid, socketSet] of Object.entries(userSocketMap)) {
    for (const socketId of Array.from(socketSet)) {
      if (!activeSockets.has(socketId)) {
        socketSet.delete(socketId);
      }
    }
    if (socketSet.size === 0) {
      delete userSocketMap[uid];
    } else {
      onlineUserIds.push(uid);
    }
  }

  return onlineUserIds;
};

/**
 * Remove user from online map and notify clients (can be called from logout controller)
 * @param {string} userId
 */
export const removeUserFromSocketMap = (userId) => {
  if (!userId) return;
  const uid = userId.toString();
  if (userSocketMap[uid]) {
    delete userSocketMap[uid];
  }
  if (io) {
    io.emit("getOnlineUsers", cleanAndGetOnlineUsers());
  }
};

/**
 * Initialize Socket.IO with HTTP Server
 * @param {import("http").Server} httpServer
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
    pingTimeout: 5000,
    pingInterval: 10000,
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(
      `⚡ Socket connected: ${socket.id} (User ID: ${userId || "Anonymous"})`,
    );

    if (userId && userId !== "undefined" && userId !== "null") {
      const uid = userId.toString();
      if (!userSocketMap[uid]) {
        userSocketMap[uid] = new Set();
      }
      userSocketMap[uid].add(socket.id);
      socket.join(uid); // Join user specific room
    }

    // Broadcast accurate online users after cleaning stale sockets
    io.emit("getOnlineUsers", cleanAndGetOnlineUsers());

    // Explicit logout from client
    socket.on("logout", () => {
      console.log(`🚪 Socket explicit logout: ${socket.id} (User ID: ${userId})`);
      if (userId && userId !== "undefined" && userId !== "null") {
        const uid = userId.toString();
        if (userSocketMap[uid]) {
          userSocketMap[uid].delete(socket.id);
          if (userSocketMap[uid].size === 0) {
            delete userSocketMap[uid];
          }
        }
      }
      socket.leave(userId ? userId.toString() : "");
      io.emit("getOnlineUsers", cleanAndGetOnlineUsers());
    });

    // Handle incoming custom events if needed
    socket.on("sendMessage", (data) => {
      const { receiverId, message } = data;
      if (receiverId) {
        io.to(receiverId.toString()).emit("newMessage", message);
      }
    });

    // Handle typing status
    socket.on("typing", ({ receiverId, isTyping }) => {
      if (receiverId) {
        io.to(receiverId.toString()).emit("userTyping", {
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
      if (userId && userId !== "undefined" && userId !== "null") {
        const uid = userId.toString();
        if (userSocketMap[uid]) {
          userSocketMap[uid].delete(socket.id);
          if (userSocketMap[uid].size === 0) {
            delete userSocketMap[uid];
          }
        }
      }
      // Broadcast updated online users
      io.emit("getOnlineUsers", cleanAndGetOnlineUsers());
    });
  });

  return io;
};
