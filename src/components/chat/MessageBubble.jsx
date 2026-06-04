import ReactMarkdown from 'react-markdown';
import { Bot, User, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const MessageBubble = ({ message }) => {
    if (!message) return null;

    const isUser = message?.role === 'user';
    const AI_LOADING_PHASES = [
        "Fetching data from your document structure...",
        "Analyzing semantics and key matching nodes...",
        "Monitoring data extractions...",
        "Formulating source-backed answer segments...",
        "Polishing response structure..."
    ];

    // Create a distinct, unique array of sources using a Set container
    const uniqueSources = message?.sources ? Array.from(new Set(message.sources)) : [];
    const [loadingIndex, setLoadingIndex] = useState(0);

    useEffect(() => {
        if (!message?.isPlaceholderLoader) return;

        const interval = setInterval(() => {
            setLoadingIndex((prevIndex) =>
                prevIndex < AI_LOADING_PHASES.length - 1 ? prevIndex + 1 : prevIndex
            );
        }, 500);

        return () => clearInterval(interval);
    }, [message?.isPlaceholderLoader]);


    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div
                className={`rounded-[20px] border px-4 py-3 shadow-md transition-all duration-200 ${isUser
                    ? 'max-w-[70%] border-cyan-600 bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-cyan-100/50'
                    : 'max-w-[85%] border-slate-800 bg-slate-900 text-slate-100 shadow-slate-200/50'
                    }`}
            >
                <div className="mb-2.5 flex items-center gap-2.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isUser ? 'bg-white/10 text-white' : 'bg-cyan-500 text-slate-950'
                        }`}>
                        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isUser ? 'text-cyan-100' : 'text-cyan-400'}`}>
                        {isUser ? 'You' : 'AI Assistant'}
                    </p>
                </div>


                <div className="text-sm leading-relaxed">
                    {isUser ? (
                        <p className="whitespace-pre-wrap text-cyan-50/95 font-medium">{message?.text || ''}</p>
                    ) : message?.isPlaceholderLoader ? (
                        /* ✅ Dynamic animated loader UI view */
                        <div className="flex items-center gap-3 text-slate-400 py-1 italic font-medium">
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-400 shrink-0" />
                            <span className="animate-pulse tracking-wide text-xs">
                                {AI_LOADING_PHASES[loadingIndex]}
                            </span>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-slate-200 prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:text-slate-100">
                            <ReactMarkdown>{message?.text || ''}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {!isUser && !message?.isPlaceholderLoader && uniqueSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                                <FileText className="h-3 w-3 text-cyan-400" />
                                <span>Sources</span>
                            </div>
                            {uniqueSources.map((source, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs font-medium text-cyan-400 hover:bg-slate-700 transition cursor-pointer shadow-sm"
                                >
                                    {source}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;