import { Navigate } from 'react-router-dom';
import MainLayout from 'layout/MainLayout';
import useAuth from 'hooks/useAuth';
import Loader from 'ui-component/Loader';

export default function AuthGuard() {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/pages/login" replace />;
  }

  return <MainLayout />;
}
