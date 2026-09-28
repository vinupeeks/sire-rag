import { Plus, User, LogOut, ChevronLeft, ChevronRight, ChevronDown, Sun, Moon, Database, Search, ClipboardList, Check, Archive, Globe2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../../redux/reducers/dataReducers';
import { ROUTES } from '../../constants/routes';
import LogoWhite from '../../assets/logo.png';
import LogoDark from '../../assets/logo-white.png';

const Sidebar = ({
    collapsed,
    activeConversationId,
    conversations,
    onNewConversation,
    onSelectConversation,
    logoutFn,
    onToggle,
    actionButtonLabel = 'New chat',
    showConversations = true,
    showActionButton = true,
    sidebarSubtitle,
}) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const darkMode = useSelector((state) => state.data.darkMode);
    const user = useSelector((state) => state.auth.user);
    const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(true);
    const isChatRoute = location.pathname.startsWith(ROUTES.CHAT);
    const selectedSource = new URLSearchParams(location.search).get('source');

    const ToggleIcon = collapsed ? ChevronRight : ChevronLeft;

    const handleThemeToggle = () => {
        dispatch(toggleDarkMode());
    };

    const theme = {
        bg: darkMode ? 'bg-[#0e1b2c]' : 'bg-[#e9eff5]',
        // bg: darkMode ? 'bg-[#324057]' : 'bg-[#f4f7fa]',
        border: darkMode ? 'border-[#1c3149]' : 'border-[#23415f]',
        textPrimary: darkMode ? 'text-[#eaf1f8]' : 'text-slate-800',
        textSecondary: darkMode ? 'text-[#9db2c8]' : 'text-slate-500',
        textTimestamp: darkMode ? 'text-[#7c93ac]' : 'text-slate-400',

        // Active Chat Selection States
        activeItem: darkMode
            ? 'border-[#17395c] bg-[#17395c] text-[#eaf1f8] shadow-sm'
            : 'border-sky-200 bg-white text-slate-900 shadow-sm shadow-sky-100/40',
        inactiveItem: darkMode
            ? 'text-[#9db2c8] hover:bg-[#13243a] hover:text-[#eaf1f8]'
            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900',

        // Letter Avatar Badges
        avatarActive: darkMode ? 'bg-[#0f6fb8] text-white' : 'bg-sky-600 text-white',
        avatarInactive: darkMode ? 'bg-[#2d394d] text-slate-300' : 'bg-slate-200 text-slate-600',

        // Control Interfaces
        footerBg: darkMode ? 'bg-[#0e1b2c]' : 'bg-[#dae7f4]',
        cardBg: darkMode ? 'bg-[#13243a] border-[#1c3149]' : 'bg-white border-[#e2e8f0]',
        actionBtn: darkMode
            ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-md'
            : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm',

        logoutBtn: darkMode
            ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-md'
            : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm',

    };

    return (
        <div className={`flex h-[100vh] flex-col overflow-hidden font-sans transition-all duration-300 ease-in-out ${theme.bg} ${theme.textPrimary}`}>

            {/* Header Section */}
            <div className={`flex min-h-[3.75rem] flex-col border-b px-4 py-3 ${theme.border}`}>

                {/* Logo + Toggle */}
                <div className="flex items-center justify-between">
                    <div className="group w-full flex h-8 w-26 items-center justify-between rounded-2xl p-2 flex-shrink-0">
                        <img
                            src={darkMode ? LogoDark : LogoWhite}
                            alt="Solmarine"
                            className={`h-8 object-contain object-left ${collapsed ? 'w-15 hidden' : 'w-32'
                                }`}
                        />

                        <img
                            src="/small-icon.png"
                            alt="Solmarine"
                            className={`h-8 object-contain object-left  ${collapsed ? 'w-15 block group-hover:hidden' : 'hidden'
                                }`}
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className={`min-h-[2rem] min-w-[2rem] flex-shrink-0 rounded-lg ${darkMode
                                ? 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                                : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'
                                } ${collapsed && "hidden group-hover:flex"}`}
                        >
                            <ToggleIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* {!collapsed && ( */}
                    {/* )} */}
                </div>
            </div>

            {!collapsed && (
                <nav className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="shrink-0 border-b border-[#1c3149] px-3 py-3">
                        <p className={`px-3 pb-1 text-[15px] font-medium ${theme.textPrimary}`}>Operator comments</p>
                        {[
                            { label: 'Inspections', icon: ClipboardList, path: ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS, active: location.pathname.startsWith(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS) && !location.state?.fromHistory },
                            // { label: 'Submitted', icon: Check, path: ROUTES.OPERATOR_COMMENTS_SUBMITTED, active: location.pathname === ROUTES.OPERATOR_COMMENTS_SUBMITTED },
                            { label: 'Archived', icon: Archive, path: ROUTES.OPERATOR_COMMENTS_FROM_REPORT_HISTORY, active: location.pathname === ROUTES.OPERATOR_COMMENTS_FROM_REPORT_HISTORY || location.state?.fromHistory === true },
                        ].map(({ label, icon: Icon, path, active }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => navigate(path)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs ml-2 font-medium transition-colors ${active ? theme.activeItem : theme.inactiveItem}`}
                            >
                                <Icon className={`h-[17px] w-[17px] ${active ? (darkMode ? 'text-[#5bc0f5]' : 'text-sky-600') : (darkMode ? 'text-[#7c93ac]' : 'text-slate-500')}`} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col border-b border-[#1c3149] px-3 py-3">
                        <p className={`shrink-0 px-3 pb-1 text-[15px] font-medium ${theme.textPrimary}`}>Ask a question</p>
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.CHAT)}
                            className={`ml-2 flex w-full shrink-0 items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-colors ${isChatRoute ? theme.activeItem : theme.inactiveItem}`}
                        >
                            <Search className={`h-[17px] w-[17px] ${isChatRoute ? (darkMode ? 'text-[#5bc0f5]' : 'text-sky-600') : (darkMode ? 'text-[#7c93ac]' : 'text-slate-500')}`} />
                            SMS Search
                        </button>

                        {isChatRoute && showActionButton && (
                            <div className="mt-1 ml-2 px-1">
                                <button
                                    type="button"
                                    className={`flex h-7 w-full items-center justify-center rounded-lg px-2.5 text-xs font-medium ${theme.actionBtn}`}
                                    onClick={onNewConversation}
                                >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    {actionButtonLabel}
                                </button>
                            </div>
                        )}

                        {isChatRoute && showConversations && (
                            <div className="mt-1 ml-3 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
                                {conversations.map((conversation) => {
                                    const active = conversation.id === activeConversationId;
                                    return (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            onClick={() => onSelectConversation(conversation.id)}
                                            className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${active ? theme.activeItem : theme.inactiveItem}`}
                                        >
                                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ${active ? theme.avatarActive : theme.avatarInactive}`}>
                                                {conversation.title?.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[11px] font-medium leading-tight">{conversation.title}</span>
                                                <span className={`block truncate text-[9px] leading-3 ${theme.textTimestamp}`}>{conversation.updated}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-2 shrink-0">
                            <button
                                type="button"
                                aria-expanded={knowledgeBaseOpen}
                                aria-controls="knowledge-base-menu"
                                onClick={() => setKnowledgeBaseOpen((open) => !open)}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-[15px] font-medium ${theme.textPrimary} ${darkMode ? 'hover:text-[#eaf1f8]' : 'hover:text-slate-900'}`}
                            >
                                Knowledge base
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${knowledgeBaseOpen ? '' : '-rotate-90'}`} />
                            </button>
                            {knowledgeBaseOpen && (
                                <div id="knowledge-base-menu" className="mt-0.5 space-y-0.5">
                                    {[
                                        { label: 'Company Files', icon: Database, source: 'company-files' },
                                        { label: 'Common Files', icon: Globe2, source: 'common-files' },
                                    ].map(({ label, icon: Icon, source }) => {
                                        const active = location.pathname.startsWith(ROUTES.KNOWLEDGE_SOURCES)
                                            && (source === 'common-files' ? selectedSource === source : selectedSource !== 'common-files');
                                        return (
                                            <button
                                                key={source}
                                                type="button"
                                                onClick={() => navigate(`${ROUTES.KNOWLEDGE_SOURCES}?source=${source}`)}
                                                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs ml-2 font-medium transition-colors ${active ? theme.activeItem : theme.inactiveItem}`}
                                            >
                                                <Icon className={`h-[17px] w-[17px] ${active ? (darkMode ? 'text-[#5bc0f5]' : 'text-sky-600') : (darkMode ? 'text-[#7c93ac]' : 'text-slate-500')}`} />
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </nav>
            )}

            {/* Footer / Profile Information Block */}
            <div className={`border-t px-3 py-3 ${theme.border} ${theme.footerBg}`}>
                {!collapsed ? (
                    <div className={`flex items-center justify-between gap-2 rounded-xl p-1.5 border ${theme.cardBg}`}>
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${darkMode
                                    ? 'bg-[#324057] border-slate-600/50 text-slate-200'
                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                    }`}
                            >
                                <User className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[14px] font-semibold leading-tight">
                                    {user?.fullname}
                                </p>
                                <p
                                    className={`truncate text-[9px] leading-none mt-0.5 ${theme.textTimestamp}`}
                                >
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleThemeToggle}
                            className={`flex-shrink-0 h-7 w-7 rounded-lg ${darkMode
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            {/* <Settings className="h-3.5 w-3.5" /> */}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            aria-label="Expand sidebar to view account details"
                            title="Expand sidebar to view account details"
                            className={`h-9 w-9 rounded-xl border ${darkMode
                                ? 'border-[#1c3149] bg-[#13243a] text-slate-200 hover:bg-[#17395c]'
                                : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100'
                                }`}
                        >
                            {user?.fullname?.trim()
                                ? <span className="text-sm font-semibold">{user.fullname.trim().charAt(0).toUpperCase()}</span>
                                : <User className="h-4 w-4" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={logoutFn}
                            aria-label="Log out"
                            title="Log out"
                            className={`h-9 w-9 rounded-xl ${darkMode
                                ? 'text-slate-300 hover:bg-rose-500/10 hover:text-rose-300'
                                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                                }`}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {!collapsed && (
                    <Button
                        variant="default"
                        className={`mt-1.5 w-full py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${theme.logoutBtn}`}
                        onClick={logoutFn}
                    >
                        <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Logout</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Sidebar; 