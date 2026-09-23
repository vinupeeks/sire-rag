import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ToolTabs from '../../components/layout/ToolTabs';
import ChatArea from '../../components/chat/ChatArea';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/reducers/authReducers';
import { MessageSquare } from 'lucide-react';
import {
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

    const [queryChatMutation] = useQueryChatMutation();

    const [conversations, setConversations] = useState([initialConversation]);
    const [activeConversationId, setActiveConversationId] = useState(initialConversation.id);
    const [conversationSearch, setConversationSearch] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

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

    // SMS Search only contains conversation navigation.
    const smsSidebarMenuItems = [
        {
            id: 'chat',
            label: 'SMS Chat',
            icon: MessageSquare,
            isActive: activeTab === 'chat',
        },
    ];

    const handleSmsMenuClick = (menuItemId) => {
        setActiveTab(menuItemId);
    };

    // Main workspace renderer wrapping both navigation headers and page contents
    const mainWorkspaceContent = (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <ToolTabs />

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
                ) : null}
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
                        menuItems={smsSidebarMenuItems}
                        actionButtonLabel="New chat"
                        onMenuItemClick={handleSmsMenuClick}
                        showConversations={true}
                        sidebarTitle="SMS Search"
                        sidebarSubtitle="AI Search"
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