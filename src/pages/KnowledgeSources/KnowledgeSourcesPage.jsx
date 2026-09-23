import { useEffect, useState } from 'react';
import { Database, FileArchive } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import LayoutShell from '../../components/layout/LayoutShell';
import Sidebar from '../../components/layout/Sidebar';
import ToolTabs from '../../components/layout/ToolTabs';
import KnowledgeBaseView from '../../components/Files/KnowledgeBaseView';
import OcimfFilesView from '../../components/Files/OcimfFilesView';
import ConfirmationModal from '../../common/ConfirmationModal';
import { logout } from '../../redux/reducers/authReducers';
import {
    useDeletePdfMutation,
    useDeleteOcimfFileMutation,
    useGetOcimfFilesQuery,
    useGetPdfListQuery,
    useUploadPdfMutation,
} from '../../redux/services/smsApi';
import { ROUTES } from '../../constants/routes';

const KnowledgeSourcesPage = () => {
    const user = useSelector((state) => state.auth.user);
    const darkMode = useSelector((state) => state.data.darkMode);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [pdfSearch, setPdfSearch] = useState('');
    const activeSource = searchParams.get('source') === 'common-files'
        ? 'ocimf-files'
        : 'knowledge-sources';
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const [uploadPdfMutation, { isLoading: isUploading }] = useUploadPdfMutation();
    const [deletePdfMutation] = useDeletePdfMutation();
    const [deleteOcimfFileMutation] = useDeleteOcimfFileMutation();
    const { data: pdfResponse, refetch: refetchPdfs } = useGetPdfListQuery(user?.id);
    const pdfs = pdfResponse?.data || [];
    const { data: ocimfResponse, refetch: refetchOcimfFiles } = useGetOcimfFilesQuery(user?.id);
    const ocimfFiles = ocimfResponse?.data || [];

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.LOGIN);
        }
    }, [navigate, user]);

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

    const handleUploadOcimf = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user?.id);
        formData.append('chapter_number', 0);
        formData.append('common', 'true');

        try {
            const response = await uploadPdfMutation(formData).unwrap();
            if (response.status) {
                refetchOcimfFiles();
                toast.success('Common file uploaded', {
                    style: {
                        background: '#567aa7',
                        color: '#fff',
                        border: '1px solid #15803d',
                    },
                });
            }
        } catch (error) {
            console.error('Error uploading OCIMF file:', error);
            toast.error('Failed to upload common file', {
                style: {
                    background: '#7f1d1d',
                    color: '#fff',
                    border: '1px solid #b91c1c',
                },
            });
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
                    toast.success('Document deleted', {
                        style: {
                            background: '#567aa7',
                            color: '#fff',
                            border: '1px solid #15803d',
                        },
                    });
                } catch (error) {
                    console.error('Error deleting PDF:', error);
                } finally {
                    setConfirmConfig((previous) => ({ ...previous, isOpen: false }));
                }
            },
        });
    };

    const handleDeleteOcimfFile = (data) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Common File',
            message: `Are you sure you want to permanently delete "${data?.fileName}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deleteOcimfFileMutation({
                        user_id: Number(user?.id),
                        file_name: data?.fileName,
                    }).unwrap();
                    refetchOcimfFiles();
                    toast.success('Common file deleted', {
                        style: {
                            background: '#567aa7',
                            color: '#fff',
                            border: '1px solid #15803d',
                        },
                    });
                } catch (error) {
                    console.error('Error deleting common file:', error);
                } finally {
                    setConfirmConfig((previous) => ({ ...previous, isOpen: false }));
                }
            },
        });
    };

    const logoutFn = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Log Out',
            message: 'Are you sure you want to log out of your account?',
            onConfirm: () => {
                dispatch(logout());
                navigate(ROUTES.LOGIN);
                setConfirmConfig((previous) => ({ ...previous, isOpen: false }));
            },
        });
    };

    const menuItems = [
        {
            id: 'knowledge-sources',
            label: 'Company Files',
            icon: Database,
        },
        {
            id: 'ocimf-files',
            label: 'Common Files',
            icon: FileArchive,
        },
    ];
    const activeMenuItems = menuItems.map((item) => ({
        ...item,
        isActive: item.id === activeSource,
    }));

    return (
        <>
            <LayoutShell
                leftCollapsed={sidebarCollapsed}
                left={(
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        activeConversationId=""
                        conversations={[]}
                        onNewConversation={() => { }}
                        onSelectConversation={() => { }}
                        logoutFn={logoutFn}
                        onToggle={() => setSidebarCollapsed((previous) => !previous)}
                        menuItems={activeMenuItems}
                        showActionButton={false}
                        onMenuItemClick={(source) => {
                            setSearchParams({
                                source: source === 'ocimf-files' ? 'common-files' : 'company-files',
                            });
                        }}
                        showConversations={false}
                        sidebarTitle="Document Library"
                        sidebarSubtitle="SMS Search Library"
                    />
                )}
                main={(
                    <div className={`flex h-screen flex-col ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
                        <ToolTabs />
                        <div className="flex-1 overflow-hidden">
                            {activeSource === 'ocimf-files' ? (
                                <OcimfFilesView
                                    files={ocimfFiles}
                                    onUpload={handleUploadOcimf}
                                    onDelete={handleDeleteOcimfFile}
                                    isUploading={isUploading}
                                />
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
                )}
            />
            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                darkMode={darkMode}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig((previous) => ({ ...previous, isOpen: false }))}
            />
        </>
    );
};

export default KnowledgeSourcesPage;
