import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { ROUTES } from '../constants/routes';
import ChatPage from '../pages/Chat/ChatPage';
import LoginPage from '../pages/Login/LoginPage';

const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<PublicRoute> <LoginPage /> </PublicRoute>} />
    <Route path={ROUTES.CHAT} element={<ProtectedRoute> <ChatPage /> </ProtectedRoute>} />
    <Route path="*" element={<Navigate to={ROUTES.CHAT} replace />} />
  </Routes>
);

export default AppRoutes;
