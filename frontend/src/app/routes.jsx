import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/Landing/LandingPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import PatientDashboard from '../pages/Dashboard/PatientDashboard';
import PredictionForm from '../pages/DiseasePrediction/PredictionForm';
import PredictionResults from '../pages/DiseasePrediction/PredictionResults';
import DashboardLayout from '../layouts/DashboardLayout';
import AppointmentsPage from '../pages/Appointments/AppointmentsPage';
import RecommendationsPage from '../pages/Recommendations/RecommendationsPage';
import MedicalRecordsPage from '../pages/MedicalRecords/MedicalRecordsPage';
import DoctorDashboard from '../pages/Dashboard/DoctorDashboard';
import { useSelector } from 'react-redux';

const DashboardIndex = () => {
  const { user } = useSelector(state => state.auth);
  return user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />;
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
          { path: 'patients', element: <div className="p-8 text-slate-400">My Patients Module Coming Soon</div> },
        ],
      },
    ],
  },
]);
