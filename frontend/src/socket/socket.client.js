import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '/');

let socket = null;

/**
 * Initialize and connect Socket.IO client with userId
 * @param {string} userId - Current authenticated user ID
 * @returns {import("socket.io-client").Socket}
 */
export const initializeSocket = (userId) => {
  if (socket) {
    if (socket.connected && socket.io?.opts?.query?.userId === userId) {
      return socket;
    }
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    query: {
      userId,
    },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected successfully:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
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
    if (socket.connected) {
      socket.emit('logout');
    }
    socket.disconnect();
    socket = null;
  }
};
