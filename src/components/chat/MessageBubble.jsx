import ReactMarkdown from 'react-markdown';
import { Bot, User, FileText, Loader2, X, Copy } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react'; // Added useMemo hook helper
import remarkGfm from 'remark-gfm';
import { BASEURL } from '../../config/config';

const MessageBubble = ({ message, isDarkMode = true }) => {
    if (!message) return null;

    const isUser = message?.role === 'user';
    const AI_LOADING_PHASES = [
        "Fetching data from your document structure...",
        "Analyzing semantics and key matching nodes...",
        "Monitoring data extractions...",
        "Formulating source-backed answer segments...",
        "Polishing response structure..."
    ];

    // ─── UPDATE 1: FILTER UNIQUE ITEMS BY OBJECT KEY (fileName) ───
    const uniqueSources = useMemo(() => {
        if (!message?.sources) return [];
        const seen = new Set();
        return message.sources.filter(source => {
            // Support both object shapes just in case a fallback string is passed
            const name = typeof source === 'object' ? source?.fileName : source;
            if (!name || seen.has(name)) return false;
            seen.add(name);
            return true;
        });
    }, [message?.sources]);

    const [loadingIndex, setLoadingIndex] = useState(0);
    const [activeSourceUrl, setActiveSourceUrl] = useState(null);

    useEffect(() => {
        if (!message?.isPlaceholderLoader) return;

        const interval = setInterval(() => {
            setLoadingIndex((prevIndex) =>
                prevIndex < AI_LOADING_PHASES.length - 1 ? prevIndex + 1 : prevIndex
            );
        }, 500);

        return () => clearInterval(interval);
    }, [message?.isPlaceholderLoader]);

    const theme = {
        bubbleStyle: isUser
            ? isDarkMode
                ? 'border-sky-600 bg-gradient-to-br from-sky-600 to-sky-700 text-white shadow-lg shadow-sky-950/20 max-w-[75%]'
                : 'border-sky-500 bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-200/50 max-w-[75%]'
            : isDarkMode
                ? 'border-slate-700/50 bg-[#273346] text-slate-100 shadow-xl shadow-slate-950/20 max-w-[85%]'
                : 'border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-200/40 max-w-[85%]',

        badgeBg: isUser
            ? 'bg-white/10 text-white'
            : isDarkMode ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-sky-100 text-sky-700',

        badgeText: isUser
            ? 'text-sky-100/80'
            : isDarkMode ? 'text-sky-400' : 'text-sky-600',

        bodyText: isUser
            ? 'text-white/95'
            : isDarkMode ? 'text-slate-200' : 'text-slate-700',

        proseMode: isDarkMode ? 'prose-invert prose-p:text-slate-200' : 'prose-slate prose-p:text-slate-700',

        sourceDivider: isDarkMode ? 'border-slate-700/50' : 'border-slate-100',
        sourceTag: isDarkMode
            ? 'bg-[#1a222f] border-slate-700 text-sky-400 hover:bg-slate-800'
            : 'bg-slate-100 border-slate-200 text-sky-700 hover:bg-slate-200/60',

        modalOverlay: 'bg-black/60 backdrop-blur-sm',
        modalContent: isDarkMode ? 'bg-[#1e2533] border border-slate-700/80 shadow-2xl' : 'bg-white border border-slate-200 shadow-2xl',
        modalHeader: isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
    };

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`rounded-2xl border px-4 py-3.5 transition-all duration-200 ${theme.bubbleStyle}`}>

                {/* Meta Header */}
                <div className="mb-2.5 flex items-center justify-between">

                    <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${theme.badgeBg}`}>
                            {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.badgeText}`}>
                            {isUser ? 'You' : 'SMS-Search Assistant'}
                        </p>
                    </div>

                    {!isUser && !message?.isPlaceholderLoader && message?.sources[0] != 'System Assistant' && (
                        <button
                            onClick={() => navigator.clipboard.writeText(message?.text)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy response"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    )}

                </div>

                {/* Main Text Markdown Node */}
                <div className="text-xs sm:text-sm leading-relaxed">
                    {isUser ? (
                        <p className={`whitespace-pre-wrap font-medium tracking-wide ${theme.bodyText}`}>
                            {message?.text || ''}
                        </p>
                    ) : message?.isPlaceholderLoader ? (
                        <div className={`flex items-center gap-3 py-1 italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Loader2 className={`h-4 w-4 animate-spin shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                            <span className="animate-pulse tracking-wide text-xs">
                                {AI_LOADING_PHASES[loadingIndex]}
                            </span>
                        </div>
                    ) : (
                        <div className={`prose prose-sm max-w-none max-w-full tracking-wide transition-colors prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:text-slate-100 ${theme.proseMode}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message?.text || ''}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Document Sources Indicator Panel */}
                {!isUser && !message?.isPlaceholderLoader && uniqueSources.length > 0 && (
                    <div className={`mt-3 pt-2.5 border-t transition-colors ${theme.sourceDivider}`}>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mr-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                <FileText className={`h-3 w-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                                <span>Sources</span>
                            </div>

                            {/* ─── UPDATE 2: READ properties FROM OBJECT ENTRY ─── */}
                            {uniqueSources.map((source, idx) => {
                                const isObj = typeof source === 'object';
                                const fileName = isObj ? source.fileName : source;
                                const rawPath = isObj ? source.filePath : `files/sms/${source}`;
                                const normalizedPath = rawPath?.replace(/\\/g, '/');

                                // Check if the source is from the system assistant
                                const isSystemSource = fileName === "System Assistant";

                                return (
                                    <span
                                        key={idx}
                                        onClick={() => {
                                            console.log(`${BASEURL}/${normalizedPath}`);
                                            if (isSystemSource) return;
                                            setActiveSourceUrl(`${BASEURL}/${normalizedPath}`);
                                        }}
                                        // Dynamically strip the cursor pointer if clicking is disabled
                                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold transition shadow-xs ${isSystemSource ? 'cursor-default opacity-80' : 'cursor-pointer'
                                            } ${theme.sourceTag}`}
                                    >
                                        {fileName}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Document Preview Lightbox Modal Pop-Up */}
            {activeSourceUrl && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 ${theme.modalOverlay}`}>
                    <div className={`relative flex flex-col w-full h-full max-w-5xl rounded-2xl overflow-hidden ${theme.modalContent}`}>

                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${theme.modalHeader}`}>
                            <span className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                <FileText className="h-4 w-4 text-sky-500" /> Source Document Preview
                            </span>
                            <button
                                onClick={() => setActiveSourceUrl(null)}
                                className={`p-1.5 rounded-lg transition-colors duration-150 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Embedded Frame Content Body */}
                        <div className="flex-1 bg-neutral-900/5 relative">
                            <iframe
                                src={activeSourceUrl}
                                title="Knowledge Base Source Document Viewer"
                                className="w-full h-full border-0 rounded-b-2xl"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;