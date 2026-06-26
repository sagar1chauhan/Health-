import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import notificationReducer from '../modules/notifications/store/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
});
