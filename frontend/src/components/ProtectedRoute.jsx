import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Usage:
 *   <ProtectedRoute><MyBookings /></ProtectedRoute>                     any logged-in user
 *   <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>  admins only
 */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Remember where the user was going, so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
