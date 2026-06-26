import { io } from 'socket.io-client';

let socket = null;
let notificationCallback = null;

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

/**
 * Connect to the Socket.io server.
 * Uses cookies for auth (withCredentials), so no explicit token needed here.
 * The backend socket middleware reads the token from handshake.auth.
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('🔌 Socket connection error:', err.message);
  });

  // Listen for real-time notifications
  socket.on('notification:new', (notification) => {
    console.log('🔔 New notification:', notification);
    if (notificationCallback) {
      notificationCallback(notification);
    }
  });

  return socket;
};

/**
 * Disconnect from the Socket.io server.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    notificationCallback = null;
    console.log('🔌 Socket manually disconnected');
  }
};

/**
 * Register a callback for new notifications.
 * @param {Function} callback - Called with notification data
 */
export const onNotification = (callback) => {
  notificationCallback = callback;
};

/**
 * Get the current socket instance.
 */
export const getSocket = () => socket;

export default { connectSocket, disconnectSocket, onNotification, getSocket };
