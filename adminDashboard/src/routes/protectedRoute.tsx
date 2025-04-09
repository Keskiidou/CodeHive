import { Navigate } from 'react-router-dom';

// Simulated auth check – replace this with your real auth context or localStorage
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && user?.user_type === 'ADMIN';
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/auth/login" />;
};

export default ProtectedRoute;
