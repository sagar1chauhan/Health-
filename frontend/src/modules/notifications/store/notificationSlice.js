import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../app/api';

// Fetch all notifications from backend
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications');
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Mark single notification as read
export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${id}/read`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new real-time notification (from socket)
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    // Clear all notifications (on logout)
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark one as read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.items.find((n) => n._id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
