import React, { useEffect, useRef } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useSelector } from 'react-redux';

const ChatArea = ({ conversation, isLoading, onSend }) => {
    const messages = conversation?.messages || [];
    const messagesEndRef = useRef(null);

    const darkMode = useSelector((state) => state.data.darkMode);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const theme = {
        bg: darkMode ? 'bg-[#202938]' : 'bg-[#f4f7fa]',
        textPrimary: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSecondary: darkMode ? 'text-slate-300' : 'text-slate-500',
        border: darkMode ? 'border-slate-700/50' : 'border-[#e2e8f0]',

        // Sticky Header / Nav
        headerBg: darkMode ? 'bg-[#202938]/90 border-slate-700/50' : 'bg-[#f4f7fa]/90 border-[#e2e8f0]',
        titleText: darkMode ? 'text-slate-100' : 'text-slate-900',

        // Empty State Panels
        sparklesIcon: darkMode ? 'from-sky-500 to-sky-600 shadow-sky-900/30' : 'from-sky-600 to-sky-700 shadow-sky-100',

        // Input Wrapper panel background masking to completely block message scroll-under visibility
        inputDockBg: darkMode ? 'bg-[#202938]' : 'bg-[#f4f7fa]',

        // Consolidated Input Floating Panel
        inputContainer: darkMode
            ? 'border-slate-700/80 bg-[#273346] shadow-2xl shadow-slate-950/50 focus-within:border-sky-500/50'
            : 'border-slate-200 bg-white shadow-xl shadow-slate-200/50 focus-within:border-sky-400/50',

        // Status Indicators
        loaderBadge: darkMode
            ? 'border-sky-500/20 bg-sky-500/10 text-sky-400'
            : 'border-sky-100 bg-sky-50/80 text-sky-700'
    };

    const hasNoHistory = messages.length === 0;

    return (
        <div className={`flex h-full flex-col overflow-hidden relative transition-all duration-300 ease-in-out ${theme.bg} ${theme.textPrimary}`}>

            {/* Header / Document Status Area */}
            <div className={`sticky top-0 z-10 border-b backdrop-blur-md transition-colors duration-300 ${theme.headerBg}`}>
                <div className="mx-auto flex h-auto min-h-[3.5rem] max-w-full items-center justify-between gap-3 px-4 py-2 md:px-6 w-full">
                    <div className="flex w-full items-center gap-2.5 sm:gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className={`truncate text-xs font-bold sm:text-sm tracking-tight ${theme.titleText}`}>
                                {conversation?.title || 'SMS conversation'}
                            </h2>
                        </div>
                    </div>

                    {isLoading && (
                        <div className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-medium sm:px-3 sm:py-1.5 sm:text-xs transition-all ${theme.loaderBadge}`}>
                            <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">Loading...</span>
                            <span className="sm:hidden">Loading</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Messages / Viewport Framework */}
            <div className="flex-1 overflow-y-auto relative">
                <div className={`mx-auto flex w-full flex-col px-4 py-6 sm:px-6 md:px-8 ${hasNoHistory ? 'h-full justify-center items-center' : 'min-h-full'}`}>

                    {hasNoHistory ? (
                        /* Empty State Container */
                        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center project-empty-state-view">
                            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-all sm:h-20 sm:w-20 ${theme.sparklesIcon}`}>
                                <Sparkles className="h-7 w-7 sm:h-9 sm:w-9" />
                            </div>

                            <h2 className={`text-xl font-bold tracking-tight sm:text-3xl ${theme.titleText} mb-10`}>
                                What would you like to know from your SMS?
                            </h2>

                            {/* Main Input Field Area - Large centered panel display */}
                            <div className="w-full max-w-4xl mx-auto px-4">
                                <div className={`rounded-2xl border p-2.5 transition-all duration-300 ${theme.inputContainer}`}>
                                    <ChatInput
                                        disabled={isLoading}
                                        onSend={onSend}
                                        darkMode={darkMode}
                                        className="py-3 px-4 text-base"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Chat History List Frame View */
                        <div className="mx-auto w-full max-w-4xl space-y-6 pb-6">
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={`${message.role}-${index}`}
                                    message={message}
                                    darkMode={darkMode}
                                />
                            ))}

                            {isLoading && (() => {
                                const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.text?.trim().toLowerCase() || '';
                                const greetings = /^(hi|hello|hey|hy|good\s*morning|good\s*afternoon|good\s*evening|helo|hii|hola)$/;
                                const closures = /^(thank\s*you|thanks|thank\s*you\s*so\s*much|ty|bye|goodbye|awesome|perfect)$/;

                                if (!greetings.test(lastUserMessage) && !closures.test(lastUserMessage)) {
                                    return (
                                        <MessageBubble
                                            key="loader-bubble"
                                            message={{ role: 'assistant', text: '', isPlaceholderLoader: true }}
                                            darkMode={darkMode}
                                        />
                                    );
                                }
                                return null;
                            })()}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Masked Bottom Input Bar - Blocks chat bubbles from dropping down beneath input background borders */}
            {!hasNoHistory && (
                <div className={`sticky bottom-0 z-20 w-full pt-2 pb-6 px-4 transition-colors duration-300 ${theme.inputDockBg}`}>
                    <div className="mx-auto w-full max-w-4xl">
                        <div className={`rounded-2xl border p-2.5 transition-all duration-300 ${theme.inputContainer}`}>
                            <ChatInput
                                disabled={isLoading}
                                onSend={onSend}
                                darkMode={darkMode}
                                className="py-3 px-4 text-base"
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ChatArea;