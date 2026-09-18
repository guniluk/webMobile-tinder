import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../constants/theme";

let socket = null;

/**
 * Initialize and connect Socket.IO client with userId
 * @param {string} userId - Current authenticated user ID
 * @returns {import("socket.io-client").Socket}
 */
export const initializeSocket = (userId) => {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  socket = io(SOCKET_BASE_URL, {
    query: {
      userId,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("⚡ Mobile Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.warn("❌ Mobile Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Mobile Socket disconnected:", reason);
  });

  return socket;
};

/**
 * Get current active Socket instance
 * @returns {import("socket.io-client").Socket | null}
 */
export const getSocket = () => socket;

/**
 * Disconnect and cleanup Socket connection
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
