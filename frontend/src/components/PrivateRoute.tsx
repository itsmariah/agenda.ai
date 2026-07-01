import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface Props {
  allowedRoles?: ('ADMIN' | 'EMPLOYEE' | 'CLIENT')[];
}

export default function PrivateRoute({ allowedRoles }: Props) {
  const { user, token } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'CLIENT' ? '/client' : '/admin'} replace />;
  }

  return <Outlet />;
}
