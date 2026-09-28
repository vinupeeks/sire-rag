import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ToolTabs from '../../components/layout/ToolTabs';
import ConfirmationModal from '../../common/ConfirmationModal';
import { logout } from '../../redux/reducers/authReducers';
import { ROUTES } from '../../constants/routes';
import History from './sections/History';
import InspectionComments from './sections/InspectionComments';

const OperatorCommentsPage = () => {
    const user = useSelector((state) => state.auth.user);
    const darkMode = useSelector((state) => state.data.darkMode);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const isSubmittedRoute = location.pathname === ROUTES.OPERATOR_COMMENTS_SUBMITTED;
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const logoutFn = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Log Out',
            message: 'Are you sure you want to log out of your account?',
            onConfirm: () => {
                dispatch(logout());
                navigate('/login');
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const renderSection = () => {
        return isSubmittedRoute
            ? <History darkMode={darkMode} />
            : <InspectionComments darkMode={darkMode} />;
    };

    // Main content area
    const mainContentArea = (
        <div className={`flex h-screen flex-col ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ToolTabs />
            {renderSection()}
        </div>
    );

    return (
        <>
            <LayoutShell
                leftCollapsed={sidebarCollapsed}
                left={
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        activeConversationId=""
                        conversations={[]}
                        onNewConversation={() => { }}
                        onSelectConversation={() => { }}
                        logoutFn={logoutFn}
                        user={user}
                        onToggle={() => setSidebarCollapsed((prev) => !prev)}
                        showActionButton={false}
                        showConversations={false}
                        sidebarTitle="Operator Comments"
                        sidebarSubtitle="Assistant"
                    />
                }
                main={mainContentArea}
            />

            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                darkMode={darkMode}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};

export default OperatorCommentsPage;