import { Navigate } from 'react-router-dom';

import useAuth from 'hooks/useAuth';

export default function PermissionGuard({ permission, children }) {
  const { user } = useAuth();
  const userPermissions = user?.role?.permissions || [];

  if (!permission || userPermissions.includes(permission)) {
    return children;
  }

  return <Navigate to="/dashboard/default" replace />;
}
