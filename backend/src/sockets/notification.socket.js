import { getIO } from './socket.js';
import Notification from '../models/Notification.js';

export const sendNotification = async (userId, notificationData) => {
  try {
    // 1. Save to DB
    const notification = await Notification.create({
      userId,
      ...notificationData
    });

    // 2. Emit via socket
    const io = getIO();
    io.to(userId.toString()).emit('notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
