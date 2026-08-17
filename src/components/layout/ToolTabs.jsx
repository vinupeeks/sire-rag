import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquareText, Search } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const tabs = [
    {
        key: 'operator-comments',
        label: 'Operator Comments',
        path: ROUTES.OPERATOR_COMMENTS,
        icon: MessageSquareText,
    },
    {
        key: 'ai-search',
        label: 'SMS Search',
        path: ROUTES.CHAT,
        icon: Search,
    },
];

const ToolTabs = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Pull darkMode from Redux state
    const darkMode = useSelector((state) => state.data.darkMode);

    const activeTab = location.pathname === ROUTES.OPERATOR_COMMENTS ? 'operator-comments' : 'ai-search';

    return (
        <div
            role="tablist"
            className={`flex h-[60px] shrink-0 items-center justify-start gap-3 border-b px-6 transition-colors duration-200 ${darkMode
                    ? 'border-slate-700/50 bg-[#1a2233]' // Dark theme container
                    : 'border-slate-200 bg-white shadow-sm relative z-10' // Light theme container
                }`}
        >
            {tabs.map(({ key, label, path, icon: Icon }) => {
                const isActive = key === activeTab;

                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => navigate(path)}
                        className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isActive
                                ? 'bg-[#0091ff] text-white shadow-md shadow-[#0091ff]/25 scale-[1.02]' // Prominent active state
                                : darkMode
                                    ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100' // Dark inactive state
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' // Light inactive state
                            }`}
                    >
                        <Icon className={`h-4 w-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default ToolTabs;