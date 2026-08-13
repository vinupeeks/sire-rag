import React, { useState } from 'react';
import {
    Clipboard,
    Clock,
    CheckSquare,
    MessageSquare as MessageIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ToolTabs from '../../components/layout/ToolTabs';
import ConfirmationModal from '../../common/ConfirmationModal';
import { logout } from '../../redux/reducers/authReducers';
import History from './sections/History';
import InspectionComments from './sections/InspectionComments';

const OperatorCommentsPage = () => {
    const user = useSelector((state) => state.auth.user);
    const darkMode = useSelector((state) => state.data.darkMode);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeMenuItemId, setActiveMenuItemId] = useState('inspection-comments');
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

    // Operator Comments sidebar menu items
    const operatorCommentsSidebarMenuItems = [
        {
            id: 'history',
            label: 'History',
            icon: MessageIcon,
            isActive: activeMenuItemId === 'history',
        },
    ];

    const handleOperatorCommentsMenuClick = (menuItemId) => {
        setActiveMenuItemId(menuItemId);
    };

    const handleNewComment = () => {
        setActiveMenuItemId('inspection-comments');
    };

    const renderSection = () => {
        switch (activeMenuItemId) {
            case 'inspection-comments':
                return <InspectionComments darkMode={darkMode} />;
            case 'history':
                return <History darkMode={darkMode} />;
            default:
                return <InspectionComments darkMode={darkMode} />;
        }
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
                        onNewConversation={handleNewComment}
                        onSelectConversation={() => { }}
                        logoutFn={logoutFn}
                        user={user}
                        onToggle={() => setSidebarCollapsed((prev) => !prev)}
                        menuItems={operatorCommentsSidebarMenuItems}
                        actionButtonLabel="New comment"
                        onMenuItemClick={handleOperatorCommentsMenuClick}
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