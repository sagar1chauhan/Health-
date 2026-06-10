import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import api from './app/api';
import { setUser } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();

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

  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
