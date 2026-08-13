import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
        label: 'SMS Chat',
        path: ROUTES.CHAT,
        icon: Search,
    },
];

const ToolTabs = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const activeTab = location.pathname === ROUTES.OPERATOR_COMMENTS ? 'operator-comments' : 'ai-search';

    return (
        <div className="flex h-14 shrink-0 items-center justify-start gap-3 border-b border-slate-700/40 bg-[#1d2736] px-6">
            {tabs.map(({ key, label, path, icon: Icon }) => {
                const isActive = key === activeTab;

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => navigate(path)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${isActive
                                ? 'bg-[#0091ff] text-white shadow-sm shadow-[#0091ff]/20'
                                : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-100'
                            }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default ToolTabs;