import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

const ChatPanel = ({ userId, chapterNumber, activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userQuestion }, { role: 'loading' }]);
    setIsLoading(true);

    try {
      const chatHistoryPayload = messages
        .filter((message) => message.role !== 'loading')
        .slice(-6)
        .map((msg) => ({ role: msg.role, text: msg.text }));

      const payload = {
        question: userQuestion,
        history: chatHistoryPayload,
        user_id: Number(userId),
      };

      if (chapterNumber != null) {
        payload.chapter_number = Number(chapterNumber);
      }

      const response = await axios.post('http://localhost:3003/api/rag/query', payload);

      if (response.data.status && response.data.data) {
        setMessages((prev) => [
          ...prev.filter((message) => message.role !== 'loading'),
          {
            role: 'model',
            text: response.data.data.answer,
            sources: [...new Set(response.data.data.sources || [])],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev.filter((message) => message.role !== 'loading'),
          {
            role: 'model',
            text: 'Unable to fetch an answer right now. Please try again later.',
            isError: true,
          },
        ]);
      }
    } catch (error) {
      console.error('RAG Query Failed:', error);
      setMessages((prev) => [
        ...prev.filter((message) => message.role !== 'loading'),
        {
          role: 'model',
          text: 'Backend connection error. Verify your server is running and reachable.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-100 text-slate-900">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/90">Solmarine Assistant</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">AI Question Answering for shipping documents</h1>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
              {chapterNumber ? `Active chapter ${chapterNumber}` : 'Searching across all documents'}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Ask the AI anything about uploaded PDFs, cargo manifests, voyage plans, and maritime contracts. Relevant source references appear below each answer.
          </p>
        </div>

        <div className="flex-1 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 shadow-soft">
          <div className="h-full min-h-[420px] overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
            {messages.length === 0 && (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white/90 px-8 py-12 text-center text-slate-600">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-600/10 text-cyan-600 shadow-lg shadow-cyan-500/10">
                  <Bot className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Ask your shipping assistant</h2>
                <p className="mt-3 max-w-xl text-sm text-slate-600">
                  Upload cargo manifests, charter agreements, and vessel reports to get fast question answering with document sources.
                </p>
              </div>
            )}

            {messages.map((msg, index) => {
              if (msg.role === 'loading') {
                return (
                  <div key={index} className="mb-4 flex min-h-[80px] items-center gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Searching documents...</p>
                      <p className="mt-1 text-sm text-slate-500">Your assistant is finding the best answer from uploaded PDFs.</p>
                    </div>
                  </div>
                );
              }

              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-[28px] border px-5 py-4 shadow-sm ${
                    isUser
                      ? 'border-cyan-500/20 bg-cyan-600 text-white'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                        isUser ? 'bg-cyan-500/20 text-cyan-100' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <p className={`text-xs uppercase tracking-[0.2em] ${isUser ? 'text-cyan-100' : 'text-slate-500'}`}>
                        {isUser ? 'You' : 'Solmarine AI'}
                      </p>
                    </div>

                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-7">{msg.text}</p>
                    ) : (
                    <div className="max-w-none text-slate-900">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}

                    {!isUser && msg.sources?.length > 0 && (
                      <div className="mt-5 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-slate-200">
                        <p className="font-semibold text-slate-900">Sources</p>
                        <p className="mt-2 truncate">{msg.sources.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={isLoading}
                className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="w-full sm:w-auto" variant="primary">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Send
                    <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <p>Sources help you verify AI responses. Always cross-check important shipping details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
