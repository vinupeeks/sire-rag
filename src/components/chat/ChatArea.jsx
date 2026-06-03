import { Loader2, Sparkles, FileText } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatArea = ({ conversation, isLoading, onSend }) => {
    const messages = conversation?.messages || [];

    return (
        <div className="flex h-full flex-col bg-[#c8d8e4] text-slate-800">

            <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-auto min-h-14 max-w-full flex-col gap-2 items-start justify-between px-3 py-2 sm:px-4 sm:py-3 md:flex-row md:items-center md:px-6 lg:max-w-full w-full">
                    <div className="flex w-full items-center gap-2 sm:gap-3">
                        <div className="relative h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500 sm:h-2.5 sm:w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-xs font-semibold text-slate-900 sm:text-sm tracking-tight">
                                {conversation?.title || 'Workspace conversation'}
                            </h2>

                            <p className="truncate text-[10px] text-cyan-600 font-bold tracking-wider uppercase sm:text-xs">
                                DEEP-DATA DOCUMENT ASSISTANT
                            </p>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-2.5 py-1 text-[10px] font-medium text-cyan-700 sm:px-3 sm:py-1.5 sm:text-xs">
                            <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin text-cyan-500 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">Pinging...</span>
                            <span className="sm:hidden">Loading</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto flex min-h-full w-full flex-col py-4 px-4 sm:px-6 md:px-8 lg:max-w-full">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-2xl px-4 text-center">
                                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-100 sm:mb-6 sm:h-16 sm:w-16">
                                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
                                </div>

                                <h2 className="text-lg font-bold text-slate-900 tracking-tight sm:text-2xl">
                                    Ask questions about your documents
                                </h2>

                                <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-md mx-auto sm:mt-3 sm:text-sm">
                                    Upload PDFs and get instant answers, summaries, explanations, and source-backed responses.
                                </p>

                                <div className="mt-6 flex flex-col gap-2 justify-center items-center sm:flex-row sm:flex-wrap sm:gap-2.5">
                                    {[
                                        'Summarize this PDF',
                                        'Explain this chapter',
                                        'Find key procedures',
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-50/40 hover:text-cyan-700 active:scale-[0.98] shadow-sm"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-200/80 px-3.5 py-2 text-xs font-medium text-slate-600">
                                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Upload a PDF to get started</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto w-full max-w-full space-y-6">
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={`${message.role}-${index}`}
                                    message={message}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200/60 bg-[#c8d8e4] backdrop-blur-md">
                <div className="mx-auto w-full flex-shrink-0 px-4 py-3 md:px-8 lg:max-w-full">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xl shadow-slate-200/30 focus-within:border-cyan-400/50 transition-all duration-300">
                        <ChatInput
                            disabled={isLoading}
                            onSend={onSend}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;