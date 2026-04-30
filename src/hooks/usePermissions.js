import useAuth from './useAuth';

export default function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.role?.permissions || [];

  return {
    hasPermission: (permission) => !permission || permissions.includes(permission)
  };
}
