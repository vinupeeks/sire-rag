import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
