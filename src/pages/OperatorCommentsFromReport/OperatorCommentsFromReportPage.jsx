import React, { useState } from 'react';
import { ClipboardList, History as HistoryIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ToolTabs from '../../components/layout/ToolTabs';
import ConfirmationModal from '../../common/ConfirmationModal';
import { logout } from '../../redux/reducers/authReducers';
import { ROUTES } from '../../constants/routes';
import Inspections from './sections/Inspections';
import ReportUpload from './sections/ReportUpload';
import History from './sections/History';
import InspectionDetails from './sections/InspectionDetails';

const menuItems = [
    { id: 'inspections', label: 'Inspections', icon: ClipboardList, path: ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS },
    { id: 'history', label: 'History', icon: HistoryIcon, path: ROUTES.OPERATOR_COMMENTS_FROM_REPORT_HISTORY },
];

const OperatorCommentsFromReportPage = () => {
    const user = useSelector((state) => state.auth.user);
    const darkMode = useSelector((state) => state.data.darkMode);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const activeMenuItem = menuItems.find((item) => location.pathname === item.path) || menuItems[0];
    const isReportUploadPage = location.pathname === ROUTES.OPERATOR_COMMENTS_FROM_REPORT_UPLOAD;
    const inspectionDetailsMatch = location.pathname.match(/^\/operator-comments-from-report\/inspections\/(\d+)$/);

    const logoutFn = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Log Out',
            message: 'Are you sure you want to log out of your account?',
            onConfirm: () => {
                dispatch(logout());
                navigate(ROUTES.LOGIN);
                setConfirmConfig((previous) => ({ ...previous, isOpen: false }));
            },
        });
    };

    const renderSection = () => {
        if (inspectionDetailsMatch) {
            return <InspectionDetails darkMode={darkMode} inspectionId={inspectionDetailsMatch[1]} />;
        }

        if (isReportUploadPage) {
            return <ReportUpload darkMode={darkMode} />;
        }

        switch (activeMenuItem.id) {
            case 'history':
                return <History darkMode={darkMode} />;
            default:
                return <Inspections darkMode={darkMode} />;
        }
    };

    return (
        <>
            <LayoutShell
                leftCollapsed={sidebarCollapsed}
                left={(
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        activeConversationId=""
                        conversations={[]}
                        onNewConversation={() => navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_UPLOAD)}
                        onSelectConversation={() => { }}
                        logoutFn={logoutFn}
                        user={user}
                        onToggle={() => setSidebarCollapsed((previous) => !previous)}
                        menuItems={menuItems.map((item) => ({ ...item, isActive: item.id === activeMenuItem.id }))}
                        actionButtonLabel="New inspection"
                        onMenuItemClick={(menuItemId) => {
                            const item = menuItems.find((menuEntry) => menuEntry.id === menuItemId);
                            if (item) navigate(item.path);
                        }}
                        showConversations={false}
                        sidebarTitle="Comments from Report"
                        sidebarSubtitle="Assistant"
                    />
                )}
                main={(
                    <div className={`flex h-screen flex-col ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
                        <ToolTabs />
                        {renderSection()}
                    </div>
                )}
            />
            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                darkMode={darkMode}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig((previous) => ({ ...previous, isOpen: false }))}
            />
        </>
    );
};

export default OperatorCommentsFromReportPage;