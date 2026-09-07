import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { ROUTES } from '../constants/routes';
import ChatPage from '../pages/Chat/ChatPage';
import LoginPage from '../pages/Login/LoginPage';
import OperatorCommentsPage from '../pages/OperatorComments/OperatorCommentsPage';
import OperatorCommentsFromReportPage from '../pages/OperatorCommentsFromReport/OperatorCommentsFromReportPage';

const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<PublicRoute> <LoginPage /> </PublicRoute>} />
    <Route path={ROUTES.OPERATOR_COMMENTS} element={<ProtectedRoute> <OperatorCommentsPage /> </ProtectedRoute>} />
    <Route path={ROUTES.OPERATOR_COMMENTS_FROM_REPORT} element={<Navigate to={ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS} replace />} />
    <Route path={`${ROUTES.OPERATOR_COMMENTS_FROM_REPORT}/*`} element={<ProtectedRoute> <OperatorCommentsFromReportPage /> </ProtectedRoute>} />
    <Route path={ROUTES.CHAT} element={<ProtectedRoute> <ChatPage /> </ProtectedRoute>} />
    <Route path="*" element={<Navigate to={ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS} replace />} />
  </Routes>
);

export default AppRoutes;
