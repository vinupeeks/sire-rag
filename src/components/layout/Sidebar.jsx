import React, { useState } from 'react';
import { Plus, Settings, User, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../../redux/reducers/dataReducers';
import Logo from '../../assets/logo.png';

const Sidebar = ({
    collapsed,
    activeConversationId,
    conversations,
    onNewConversation,
    onSelectConversation,
    logoutFn,
    onToggle,
    menuItems = [],
    actionButtonLabel = 'New chat',
    onMenuItemClick = () => { },
    showConversations = true,
}) => {
    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.data.darkMode);
    const user = useSelector((state) => state.auth.user);

    const handleThemeToggle = () => {
        dispatch(toggleDarkMode());
    };

    const theme = {
        bg: darkMode ? 'bg-[#324057]' : 'bg-[#e9eff5]',
        // bg: darkMode ? 'bg-[#324057]' : 'bg-[#f4f7fa]',
        border: darkMode ? 'border-slate-700/50' : 'border-[#e2e8f0]',
        textPrimary: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSecondary: darkMode ? 'text-slate-300' : 'text-slate-500',
        textTimestamp: darkMode ? 'text-slate-400' : 'text-slate-400',

        // Active Chat Selection States
        activeItem: darkMode
            ? 'border-sky-500/40 bg-[#2d394d] text-slate-100 shadow-sm'
            : 'border-sky-200 bg-white text-slate-900 shadow-sm shadow-sky-100/40',
        inactiveItem: darkMode
            ? 'text-slate-300 hover:bg-[#273346] hover:text-slate-100'
            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900',

        // Letter Avatar Badges
        avatarActive: darkMode ? 'bg-sky-500 text-white' : 'bg-sky-600 text-white',
        avatarInactive: darkMode ? 'bg-[#2d394d] text-slate-300' : 'bg-slate-200 text-slate-600',

        // Control Interfaces
        footerBg: darkMode ? 'bg-[#445c85]' : 'bg-[#e9eff5]/90',
        cardBg: darkMode ? 'bg-[#273346] border-slate-700/50' : 'bg-white border-[#e2e8f0]',
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
            <div className={`flex min-h-[3.5rem] items-center justify-between gap-2 border-b px-2 py-2 sm:gap-3 sm:px-1 ${theme.border}`}>
                <div className="group relative flex items-center gap-2 sm:gap-2">

                    <div className="flex h-7 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-300 shadow-lg p-2 flex-shrink-0">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold uppercase tracking-wider leading-tight">SMS Search</p>
                            <p className={`truncate text-[10px] font-semibold tracking-wide leading-none mt-0.5 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>AI Search</p>
                        </div>
                    )}

                    {collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className={`absolute left-0 top-0 h-9 w-9 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:h-11 sm:w-11 ${darkMode ? 'bg-slate-700/90 text-slate-200' : 'bg-white/90 text-slate-700 shadow-xs border border-slate-200'
                                }`}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {!collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className={`flex-shrink-0 min-h-[2rem] min-w-[2rem] rounded-lg ${darkMode ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                            }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Context-Specific Menu Items */}
            {menuItems.length > 0 && !collapsed && (
                <div className="px-2 py-2 border-b space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onMenuItemClick(item.id)}
                            className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                                item.isActive
                                    ? `bg-[#0091ff] text-white shadow-sm shadow-[#0091ff]/20`
                                    : darkMode
                                        ? 'text-slate-300 hover:bg-[#273346] hover:text-slate-100'
                                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                        >
                            {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* New Chat Action Layer */}
            {!collapsed ? (
                <div className="px-3 py-3">
                    <Button
                        variant="default"
                        className={`w-full py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${theme.actionBtn}`}
                        onClick={onNewConversation}
                    >
                        <Plus className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{actionButtonLabel}</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNewConversation}
                        className={`min-h-[2.25rem] min-w-[2.25rem] rounded-xl ${theme.actionBtn}`}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Chat List Stream */}
            {showConversations && (
                <div className="flex-1 overflow-y-auto px-2 py-1">
                    <div className="space-y-1">
                        {conversations.map((conversation) => {
                            const active = conversation.id === activeConversationId;
                            return (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() => onSelectConversation(conversation.id)}
                                    className={`flex w-full min-h-[2.75rem] items-center gap-3 rounded-xl border relative px-3 py-2 text-left text-xs transition-all duration-200 group ${active ? theme.activeItem : theme.inactiveItem
                                        } ${collapsed ? 'justify-center px-0' : ''}`}
                                >
                                    {/* Left Active Bar Indicator */}
                                    {active && !collapsed && (
                                        <div className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-md ${darkMode ? 'bg-sky-400' : 'bg-sky-500'}`} />
                                    )}

                                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold border transition-colors ${active ? `${theme.avatarActive}` : `${theme.avatarInactive} ${darkMode ? 'border-slate-600/50' : 'border-slate-300/40'}`
                                        }`}>
                                        {conversation.title?.charAt(0).toUpperCase()}
                                    </div>

                                    {!collapsed && (
                                        <div className="min-w-0 flex-1 pl-0.5">
                                            <p className={`truncate text-xs font-medium leading-normal ${active ? 'font-bold' : ''}`}>
                                                {conversation.title}
                                            </p>
                                            <p className={`truncate text-[10px] mt-0.5 ${theme.textTimestamp}`}>{conversation.updated}</p>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {!showConversations && (
                <div className="flex-1 overflow-y-auto px-2 py-1" />
            )}

            {/* Footer / Profile Information Block */}
            <div className={`border-t rounded-t-[24px] px-2 py-2 ${theme.border} ${theme.footerBg}`}>
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
                                <p className="truncate text-[11px] font-semibold leading-tight">
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
                    <div className="flex flex-col items-center gap-1 py-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-5 w-9 rounded-xl ${darkMode
                                ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 shadow-xs'
                                }`}
                        >
                            <User className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="default"
                            size="icon"
                            onClick={logoutFn}
                            className={`h-5 w-9 rounded-xl ${theme.logoutBtn}`}
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