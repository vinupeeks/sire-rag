import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <Navigate to={ROUTES.OPERATOR_COMMENTS} replace /> : children;
};

export default PublicRoute;
