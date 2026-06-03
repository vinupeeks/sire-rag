import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ChatArea from '../../components/chat/ChatArea';
import PdfSidebar from '../../components/pdf/PdfSidebar';
import { fetchPdfList, queryChat, uploadPdf } from '../../services/apiService';

const initialConversation = {
    id: 'conv-1',
    title: 'Workspace conversation',
    description: 'Ask your AI assistant about uploaded documents.',
    updated: 'Now',
    messages: [],
};

const ChatPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([initialConversation]);
    const [activeConversationId, setActiveConversationId] = useState(initialConversation.id);
    const [conversationSearch, setConversationSearch] = useState('');
    const [pdfSearch, setPdfSearch] = useState('');
    const [pdfs, setPdfs] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [pdfCollapsed, setPdfCollapsed] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const loadPdfs = async () => {
            setIsPdfLoading(true);
            try {
                const response = await fetchPdfList(54);
                if (response?.status && Array.isArray(response?.data)) {
                    setPdfs(response.data);
                    console.log('Fetched PDFs:', response.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsPdfLoading(false);
            }
        };

        loadPdfs();
    }, []);

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
    };

    const handleSelectConversation = (conversationId) => {
        setActiveConversationId(conversationId);
    };

    const handleSendMessage = async (text) => {
        setIsChatLoading(true);
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
                user_id: Number(54),
            };

            const response = await queryChat(payload);
            const answer = response?.data?.answer || 'Unable to generate a response.';
            const sources = response?.data?.sources || [];

            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: [...conversation.messages, { role: 'model', text: answer, sources }],
                        }
                        : conversation,
                ),
            );
        } catch (error) {
            console.error(error);
            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: [
                                ...conversation.messages,
                                {
                                    role: 'model',
                                    text: 'Unable to connect to the AI engine. Please try again later.',
                                    sources: [],
                                },
                            ],
                        }
                        : conversation,
                ),
            );
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleUploadPdf = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', Number(54));
        formData.append('chapter_number', 1);

        try {
            const response = await uploadPdf(formData);
            if (response.status) {
                setPdfs((prev) => [
                    {
                        recordId: response.recordId || `${Date.now()}-${file.name}`,
                        fileName: file.name,
                        chapterNumber: 1,
                        status: 'Indexed',
                    },
                    ...prev,
                ]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePdf = (recordId) => {
        setPdfs((prev) => prev.filter((pdf) => pdf.recordId !== recordId));
    };

    const main = (
        <div className="flex h-screen flex-col">
            <ChatArea conversation={activeConversation} isLoading={isChatLoading} onSend={handleSendMessage} />
        </div>
    );

    return (
        <LayoutShell
            leftCollapsed={sidebarCollapsed}
            rightCollapsed={pdfCollapsed}
            left={
                <Sidebar
                    collapsed={sidebarCollapsed}
                    activeConversationId={activeConversationId}
                    conversations={filteredConversations}
                    searchTerm={conversationSearch}
                    onSearch={setConversationSearch}
                    onNewConversation={handleNewConversation}
                    onSelectConversation={handleSelectConversation}
                    onLogout={() => {
                        logout();
                        navigate('/login');
                    }}
                    user={user}
                    onToggle={() => setSidebarCollapsed((prev) => !prev)}
                />
            }
            main={main}
            right={<PdfSidebar pdfs={pdfs} searchTerm={pdfSearch} onSearch={setPdfSearch} onUpload={handleUploadPdf} onDelete={handleDeletePdf} collapsed={pdfCollapsed} onToggle={() => setPdfCollapsed((prev) => !prev)} />}
        />
    );
};

export default ChatPage;
