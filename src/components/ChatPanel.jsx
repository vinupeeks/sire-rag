import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Bot } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const ChatPanel = ({ userId, chapterNumber }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // useEffect(() => {
    //     setMessages([]);
    // }, [chapterNumber]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuestion = input.trim();
        setInput('');
        // setMessages((prev) => [...prev, { role: 'user', text: userQuestion }]);
        setMessages((prev) => [
            ...prev,
            { role: 'user', text: userQuestion },
            { role: 'loading' }
        ]);
        setIsLoading(true);

        try {
            const chatHistoryPayload = messages.slice(-6).map((msg) => ({
                role: msg.role,
                text: msg.text,
            }));

            let payload = {
                question: userQuestion,
                history: chatHistoryPayload,
                user_id: Number(userId)
            };

            if (chapterNumber != 0 && chapterNumber != null) {
                payload.chapter_number = Number(chapterNumber);
            }

            console.log('Submitting RAG Query with Payload:', payload);

            const response = await axios.post('http://localhost:3003/api/rag/query', payload);

            if (response.data.status && response.data.data) {
                setMessages((prev) => [
                    ...prev.filter(msg => msg.role !== 'loading'),
                    {
                        role: 'model',
                        text: response.data.data.answer,
                        sources: [...new Set(response.data.data.sources || [])],
                    },
                ]);
            }
        } catch (error) {
            console.error('RAG Query Failed:', error);
            setMessages((prev) => [
                ...prev.filter(msg => msg.role !== 'loading'),
                {
                    role: 'model',
                    text: 'Backend Connection Timeout Error. Verify localized ports.',
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.chatWrapper}>
            {/* Dynamic Header */}
            <div style={styles.chatHeader}>
                <h2 style={styles.headerTitle}></h2>
                <p style={styles.headerSubtitle}>
                    {/* Context Window Isolation: <span style={styles.badge}>Chapter Section {chapterNumber}</span> */}
                </p>
            </div>

            {/* Main Chat Stream Viewport Area */}
            <div style={styles.viewport}>
                {messages.length === 0 && (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIconContainer}>
                            <Bot size={28} color="#2563eb" />
                        </div>

                        <h3 style={styles.emptyTitle}>
                            How can I help you today?
                        </h3>

                        <p style={styles.emptyDesc}>
                            Ask a question to get started. Answers are generated from your uploaded documents.
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    msg?.role === 'loading' ? (
                        <div key={idx} style={styles.msgRow}>
                            <div style={styles.bubble}>
                                <div style={styles.loadingContainer}>
                                    <Loader2 size={18} className="spin" />
                                    <span>Searching documents...</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={idx}
                            style={{
                                ...styles.msgRow,
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div
                                style={{
                                    ...styles.bubble,
                                    backgroundColor: msg.role === 'user' ? '#2563eb' : '#ffffff',
                                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                                    borderRadius: msg.role === 'user'
                                        ? '14px 14px 4px 14px'
                                        : '4px 14px 14px 14px',
                                    border: msg.role === 'user'
                                        ? 'none'
                                        : '1px solid #e2e8f0'
                                }}
                            >
                                <div style={styles.bubbleText}>
                                    {msg.role === 'user'
                                        ? msg.text
                                        : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div
                                        style={{
                                            ...styles.sourcesBlock,
                                            borderTop:
                                                msg.role === 'user'
                                                    ? '1px solid rgba(255,255,255,0.15)'
                                                    : '1px solid #f1f5f9',
                                            color:
                                                msg.role === 'user'
                                                    ? 'rgba(255,255,255,0.8)'
                                                    : '#64748b'
                                        }}
                                    >
                                        <strong>Sources:</strong> {[...new Set(msg.sources)].join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Entry Box Frame */}
            <div style={styles.footerContainer}>
                <form onSubmit={handleSubmit} style={styles.formRow}>
                    <input
                        type="text"

                        
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask a question about your documents...`}
                        style={styles.inputBox}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} style={{
                        ...styles.sendBtn,
                        backgroundColor: (!input.trim() || isLoading) ? '#f1f5f9' : '#2563eb',
                        color: (!input.trim() || isLoading) ? '#94a3b8' : '#ffffff',
                    }}>
                        <Send size={14} />
                    </button>
                </form>
                <div style={styles.disclaimerContainer}>
                    <Bot size={14} />
                    <span>
                        AI Assistant can make mistakes. Consider checking important info.
                    </span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    chatWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
    },
    chatHeader: {
        padding: '20px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
    },
    headerTitle: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#0f172a',
        margin: 0,
    },
    headerSubtitle: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '4px',
        marginBottom: 0,
    },
    badge: {
        color: '#2563eb',
        fontWeight: 600,
        backgroundColor: '#eff6ff',
        padding: '1px 5px',
        borderRadius: '4px'
    },
    viewport: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    emptyState: {
        margin: 'auto',
        textAlign: 'center',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    emptyIconContainer: {
        padding: '12px',
        backgroundColor: '#eff6ff',
        borderRadius: '12px',
        marginBottom: '12px'
    },
    emptyTitle: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#0f172a',
        margin: '0 0 6px 0'
    },
    emptyDesc: {
        fontSize: '13px',
        color: '#64748b',
        margin: 0,
        lineHeight: '1.5'
    },
    msgRow: {
        display: 'flex',
        width: '100%',
    },

    loadingBubble: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 0'
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#64748b',
        animation: 'bounce 1.4s infinite ease-in-out'
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#64748b',
        fontSize: '13px',
    },

    bubble: {
        maxWidth: '80%',
        padding: '12px 16px',
        fontSize: '14px',
        lineHeight: '1.55',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    bubbleText: {
        wordBreak: 'break-word',
        textAlign: 'left',
    },
    sourcesBlock: {
        marginTop: '10px',
        paddingTop: '6px',
        fontSize: '11px',
        textAlign: 'left',
    },
    footerContainer: {
        padding: '5px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
    },
    formRow: {
        display: 'flex',
        gap: '10px',
    },
    inputBox: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
    },
    sendBtn: {
        padding: '0 16px',
        borderRadius: '8px',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disclaimerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '5px 5px',
        fontSize: '12px',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        lineHeight: '1.4',
    },
};

export default ChatPanel;