import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ChatArea from '../../components/chat/ChatArea';
import KnowledgeBaseView from '../../components/Files/KnowledgeBaseView';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/reducers/authReducers';
import { MessageSquare, FolderOpen } from 'lucide-react';
import { toast } from "sonner";
import {
    useGetPdfListQuery,
    useUploadPdfMutation,
    useDeletePdfMutation,
    useQueryChatMutation,
} from '../../redux/services/smsApi';
import ConfirmationModal from '../../common/ConfirmationModal';

const initialConversation = {
    id: 'conv-1',
    title: 'SMS conversation',
    description: 'Ask your AI assistant about uploaded documents.',
    updated: 'Now',
    messages: [],
};

const ChatPage = () => {
    const user = useSelector((state) => state.auth.user);
    const darkMode = useSelector((state) => state.data.darkMode);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('chat');

    const [uploadPdfMutation, { isLoading: isUploading }] = useUploadPdfMutation();
    const [deletePdfMutation] = useDeletePdfMutation();
    const [queryChatMutation] = useQueryChatMutation();
    const {
        data: pdfResponse,
        isLoading: isPdfLoading,
        refetch: refetchPdfs,
    } = useGetPdfListQuery(user?.id);

    const [conversations, setConversations] = useState([initialConversation]);
    const [activeConversationId, setActiveConversationId] = useState(initialConversation.id);
    const [conversationSearch, setConversationSearch] = useState('');
    const [pdfSearch, setPdfSearch] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const pdfs = pdfResponse?.data || [];

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [navigate]);

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0],
        [activeConversationId, conversations],
    );

    const filteredConversations = useMemo(() => {
        if (!conversationSearch) {
            return conversations;
        }
        return conversations.filter((conversation) =>
            conversation.title.toLowerCase().includes(conversationSearch.toLowerCase()),
        );
    }, [conversationSearch, conversations]);

    const handleNewConversation = () => {
        const conversation = {
            id: `conv-${Date.now()}`,
            title: 'New conversation',
            description: 'Type your first question to begin.',
            updated: 'Just now',
            messages: [],
        };
        setConversations((prev) => [conversation, ...prev]);
        setActiveConversationId(conversation.id);
        setActiveTab('chat'); // Auto routing back to chat view on setup
    };

    const handleSelectConversation = (conversationId) => {
        setActiveConversationId(conversationId);
        setActiveTab('chat'); // Route back to text context
    };

    const handleSendMessage = async (text) => {
        setIsChatLoading(true);

        // 💡 Regex to match greetings exactly like your backend does
        const greetingsRegex = /^(hi|hello|hey|hy|good\s*morning|good\s*afternoon|good\s*evening|helo|hii|hola)$/i;
        const currentCleanInput = text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

        // 1. Find all previous user messages that were NOT simple greetings
        const previousRealQuestions = activeConversation.messages.filter(m => {
            if (m.role !== 'user') return false;
            const cleanMsg = m.text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
            return !greetingsRegex.test(cleanMsg);
        });

        // 2. A title is needed ONLY if the current message is a real question AND no real questions were asked before
        const isCurrentMessageGreeting = greetingsRegex.test(currentCleanInput);
        const isFirstRealQuestion = !isCurrentMessageGreeting && previousRealQuestions.length === 0;

        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.id === activeConversationId
                    ? { ...conversation, messages: [...conversation.messages, { role: 'user', text }] }
                    : conversation,
            ),
        );

        try {
            const history = activeConversation.messages
                .filter((message) => message.role !== 'system')
                .slice(-6)
                .map((message) => ({ role: message.role, text: message.text }));

            const payload = {
                question: text,
                history,
                user_id: user?.id,
                conversation_id: activeConversationId,
                titleNeeded: isFirstRealQuestion
            };

            const response = await queryChatMutation(payload).unwrap();
            const answer = response?.data?.answer || 'Unable to generate a response.';
            const sources = response?.data?.sources || [];
            const newTitle = response?.data?.generatedTitle;

            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            title: newTitle ? newTitle : conversation.title,
                            messages: [...conversation.messages, { role: 'model', text: answer, sources }],
                        }
                        : conversation,
                ),
            );
        } catch (error) {
            console.error(error);
            // ... rest of your error state logging handlers
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleUploadPdf = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user?.id);
        formData.append('chapter_number', 0);

        try {
            const response = await uploadPdfMutation(formData).unwrap();
            if (response.status) {
                refetchPdfs();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePdf = (data) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Document',
            message: `Are you sure you want to permanently delete "${data?.fileName}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deletePdfMutation({
                        user_id: Number(user?.id),
                        file_name: data?.fileName,
                    }).unwrap();
                    refetchPdfs();
                    
                    toast.success("Document deleted", {
                        style: {
                            background: "#567aa7",
                            color: "#fff",
                            border: "1px solid #15803d",
                        },
                    });
                } catch (error) {
                    console.error('Error deleting PDF:', error);
                } finally {
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const logoutFn = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Log Out',
            message: 'Are you sure you want to log out of your account?',
            onConfirm: () => {
                dispatch(logout());
                navigate('/login');
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Main workspace renderer wrapping both navigation headers and page contents
    const mainWorkspaceContent = (
        <div className="flex flex-col h-screen w-full overflow-hidden">

            {/* Top Workspace View Navigation Bar */}
            <div className={`flex items-center justify-start border-b px-6 h-14 gap-3 flex-shrink-0 transition-colors duration-300 ${darkMode
                ? 'border-slate-700/40 bg-[#273346]/40'
                : 'border-slate-200 bg-slate-100'
                }`}>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'chat'
                        ? 'bg-[#0091ff] text-white shadow-sm shadow-[#0091ff]/20'
                        : darkMode
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                        }`}
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    SMS Chat
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'files'
                        ? 'bg-[#0091ff] text-white shadow-sm shadow-[#0091ff]/20'
                        : darkMode
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                        }`}
                >
                    <FolderOpen className="h-3.5 w-3.5" />
                    SMS Search library ({pdfs.length})
                </button>
            </div>

            {/* View Switching Controller Panel */}
            <div className="flex-1 overflow-hidden bg-[#161b26]">
                {activeTab === 'chat' ? (
                    <div className="flex h-full flex-col">
                        <ChatArea
                            conversation={activeConversation}
                            isLoading={isChatLoading}
                            onSend={handleSendMessage}
                        />
                    </div>
                ) : (
                    <KnowledgeBaseView
                        pdfs={pdfs}
                        searchTerm={pdfSearch}
                        onSearch={setPdfSearch}
                        onUpload={handleUploadPdf}
                        onDelete={handleDeletePdf}
                        isUploading={isUploading}
                    />
                )}
            </div>
        </div>
    );

    return (
        <>
            <LayoutShell
                leftCollapsed={sidebarCollapsed}
                left={
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        activeConversationId={activeConversationId}
                        conversations={filteredConversations}
                        searchTerm={conversationSearch}
                        onSearch={setConversationSearch}
                        onNewConversation={handleNewConversation}
                        onSelectConversation={handleSelectConversation}
                        logoutFn={logoutFn}
                        user={user}
                        onToggle={() => setSidebarCollapsed((prev) => !prev)}
                    />
                }
                main={mainWorkspaceContent}
            />

            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                darkMode={darkMode}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};

export default ChatPage;