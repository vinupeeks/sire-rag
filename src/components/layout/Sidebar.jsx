import { Plus, Settings, User, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

const Sidebar = ({
    collapsed,
    activeConversationId,
    conversations,
    onNewConversation,
    onSelectConversation,
    onLogout,
    user,
    onToggle,
}) => {
    return (
        <div className="flex h-[100vh] flex-col overflow-hidden bg-slate-950 text-slate-100">
            <div className="flex min-h-[3.5rem] items-center justify-between gap-2 border-b border-slate-800/80 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3">
                <div className="group relative flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 flex-shrink-0 sm:h-9 sm:w-9">
                        
                    </div>

                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold leading-tight sm:text-sm">SMS</p>
                            <p className="truncate text-[10px] text-slate-400 leading-tight sm:text-xs">AI Search</p>
                        </div>
                    )}

                    {collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className="absolute left-0 top-0 h-9 w-9 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-slate-900/90 sm:h-11 sm:w-11"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {!collapsed && (
                    <Button variant="ghost" size="icon" onClick={onToggle} className="flex-shrink-0 min-h-[2rem] min-w-[2rem]">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {!collapsed ? (
                <div className="space-y-2 px-2 py-2">
                    <Button variant="primary" className="w-full py-2 text-xs sm:text-sm" onClick={onNewConversation}>
                        <Plus className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">New chat</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                    <Button variant="ghost" size="icon" onClick={onNewConversation} className="min-h-[2.25rem] min-w-[2.25rem]">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 py-2">
                <div className="space-y-2">
                    {conversations.map((conversation) => {
                        const active = conversation.id === activeConversationId;
                        return (
                            <button
                                key={conversation.id}
                                type="button"
                                onClick={() => onSelectConversation(conversation.id)}
                                className={`flex w-full min-h-[2.5rem] items-center gap-2 rounded-2xl border px-2 py-1.5 text-left text-xs transition duration-200 ${active
                                    ? 'border-cyan-400 bg-slate-900 text-slate-100'
                                    : 'border-transparent bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 text-[10px] font-semibold">
                                    {conversation.title?.charAt(0).toUpperCase()}
                                </div>
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium leading-tight">{conversation.title}</p>
                                        <p className="truncate text-[10px] text-slate-500 leading-tight">{conversation.updated}</p>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-800/80 px-2 py-2">
                {!collapsed ? (
                    <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-900/80 p-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold leading-tight">{user?.name}</p>
                                <p className="truncate text-[10px] text-slate-500 leading-tight">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="flex-shrink-0 min-h-[1.75rem] min-w-[1.75rem]">
                            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <Button variant="ghost" size="icon" className="min-h-[2.25rem] min-w-[2.25rem]">
                            <User className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onLogout} className="min-h-[2.25rem] min-w-[2.25rem]">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                {!collapsed && (
                    <Button variant="secondary" className="mt-2 w-full py-2 text-xs sm:text-sm" onClick={onLogout}>
                        <LogOut className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Logout</span>
                        <span className="sm:hidden">Sign out</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
