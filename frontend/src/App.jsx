import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import api from './app/api';
import { setUser } from './modules/auth/store/authSlice';
import { addNotification, fetchNotifications } from './modules/notifications/store/notificationSlice';
import { connectSocket, disconnectSocket, onNotification } from './app/socketService';
import AIAssistantWidget from './modules/ai-assistant/components/AIAssistantWidget';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in on mount
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          dispatch(setUser(res.data.user));
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    fetchUser();
  }, [dispatch]);

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket (cookies handle auth, but we also pass token from cookie)
      connectSocket();

      // Fetch existing notifications
      dispatch(fetchNotifications());

      // Listen for real-time notifications
      onNotification((notification) => {
        dispatch(addNotification(notification));
        toast(notification.title, {
          icon: '🔔',
          style: {
            background: '#1E293B',
            color: '#E2E8F0',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          },
          duration: 4000,
        });
      });
    } else {
      disconnectSocket();
    }

    return () => {
      // Cleanup on unmount
    };
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
      <AIAssistantWidget />
    </>
  );
}

export default App;
