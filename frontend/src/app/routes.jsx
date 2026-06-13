import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LandingPage from '../modules/landing/pages/LandingPage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import PatientDashboard from '../modules/dashboard/pages/PatientDashboard';
import PredictionForm from '../modules/disease-prediction/pages/PredictionForm';
import PredictionResults from '../modules/disease-prediction/pages/PredictionResults';
import DashboardLayout from '../shared/layouts/DashboardLayout';
import AppointmentsPage from '../modules/appointments/pages/AppointmentsPage';
import RecommendationsPage from '../modules/recommendations/pages/RecommendationsPage';
import MedicalRecordsPage from '../modules/medical-records/pages/MedicalRecordsPage';
import DoctorDashboard from '../modules/dashboard/pages/DoctorDashboard';
import ProfilePage from '../modules/profile/pages/ProfilePage';
import NotificationsPage from '../modules/notifications/pages/NotificationsPage';
import DoctorProfilePage from '../modules/profile/pages/DoctorProfilePage';
import MyPatientsPage from '../modules/patients/pages/MyPatientsPage';
import AdminDashboard from '../modules/dashboard/pages/AdminDashboard';
import TelemedicinePage from '../modules/telemedicine/pages/TelemedicinePage';
import WearablesPage from '../modules/wearables/pages/WearablesPage';
import SettingsPage from '../modules/settings/pages/SettingsPage';
import { useSelector } from 'react-redux';

const DashboardIndex = () => {
  const { user } = useSelector(state => state.auth);
  if (user?.role === 'admin') return <AdminDashboard />;
  return user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />;
};

const ProfileIndex = () => {
  const { user } = useSelector(state => state.auth);
  return user?.role === 'doctor' ? <DoctorProfilePage /> : <ProfilePage />;
};
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/auth',
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardIndex /> },
          { path: 'prediction', element: <PredictionForm /> },
          { path: 'prediction/results', element: <PredictionResults /> },
          { path: 'appointments', element: <AppointmentsPage /> },
          { path: 'recommendations', element: <RecommendationsPage /> },
          { path: 'records', element: <MedicalRecordsPage /> },
          { path: 'profile', element: <ProfileIndex /> },
          { path: 'patients', element: <MyPatientsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'telemedicine', element: <TelemedicinePage /> },
          { path: 'wearables', element: <WearablesPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
