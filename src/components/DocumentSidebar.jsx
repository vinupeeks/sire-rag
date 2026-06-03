import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Layers, Hash, CheckCircle2, Upload, Loader2, RefreshCw } from 'lucide-react';

const DocumentSidebar = ({ activeChapter, setActiveChapter, userId, onUploadSuccess }) => {
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [chapterInput, setChapterInput] = useState('');

    const [selectedDocument, setSelectedDocument] = useState(null);

    const fetchUserPdfs = async () => {
        if (!userId) return;
        setIsLoadingList(true);
        try {
            const response = await axios.get(`http://localhost:3003/api/rag/user-pdfs`, {
                params: { user_id: Number(userId) }
            });
            if (response.data.status) {
                setUploadedDocuments(response.data.data);
                if (response.data.data.length > 0 && !activeChapter) {
                    setActiveChapter(response.data.data[0].chapterNumber);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user PDF list:", error);
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        fetchUserPdfs();
    }, [userId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!chapterInput.trim()) {
            alert("Please specify a Chapter Number before choosing a file.");
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', Number(userId));
        formData.append('chapter_number', Number(chapterInput));

        setIsUploading(true);

        try {
            const response = await axios.post('http://localhost:3003/api/rag/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status) {
                const newDoc = {
                    recordId: response.data.recordId,
                    fileName: file.name,
                    chapterNumber: Number(chapterInput),
                    chunksProcessed: response.data.chunksProcessed || 0,
                    status: "Indexed"
                };
                setUploadedDocuments((prev) => [newDoc, ...prev]);
                setActiveChapter(Number(chapterInput));
                setChapterInput('');
                if (onUploadSuccess) onUploadSuccess(newDoc);
            }
        } catch (error) {
            console.error("Upload failure:", error);
            alert(error.response?.data?.error || "Failed to process document upload.");
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    return (
        <div style={styles.sidebar}>
            {/* Title Header Block */}
            <div style={styles.header}>
                <div style={styles.flexBetween}>
                    <h2 style={styles.title}>SMS SEARCH</h2>
                    <button onClick={fetchUserPdfs} disabled={isLoadingList} style={styles.refreshBtn}>
                        <RefreshCw size={14} style={{ animation: isLoadingList ? 'spin 1.5s linear infinite' : 'none' }} />
                    </button>
                </div>
                <p style={styles.subtitle}>Active User Profile ID: <span style={styles.badge}>{userId}</span></p>
            </div>

            {/* Structured Minimalist Action Box */}
            <div style={styles.uploadCard}>
                <div style={styles.inputRow}>
                    <span style={styles.labelText}>Chapter Target:</span>
                    <input
                        type="number"
                        placeholder="e.g. 2"
                        min="1"
                        max="12"
                        value={chapterInput}
                        onChange={(e) => setChapterInput(e.target.value)}
                        disabled={isUploading}
                        style={styles.inputElement}
                    />
                </div>

                <label style={{
                    ...styles.submitActionLabel,
                    opacity: isUploading ? 0.6 : 1,
                    cursor: isUploading ? 'not-allowed' : 'pointer'
                }}>
                    {isUploading ? (
                        <div style={styles.centeredFlex}>
                            <Loader2 size={14} style={styles.spin} />
                            <span style={{ fontSize: '12px' }}>Ingesting Data Vectors...</span>
                        </div>
                    ) : (
                        <div style={styles.centeredFlex}>
                            <Upload size={14} style={{ marginRight: '6px' }} />
                            <span>Upload Document</span>
                        </div>
                    )}
                    <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} style={{ display: 'none' }} />
                </label>
            </div>

            <div
                onClick={() => setActiveChapter(null)}
                style={{
                    ...styles.documentItemCard,
                    borderColor: activeChapter === null ? '#2563eb' : '#e2e8f0',
                    backgroundColor: activeChapter === null ? '#eff6ff' : '#ffffff',
                }}
            >
                <div style={styles.cardMainTitleRow}>
                    <Layers size={15} color={activeChapter === null ? '#2563eb' : '#64748b'} />
                    <span style={styles.cardTextTitle}>
                        All Documents
                    </span>
                </div>
            </div>

            {/* Dynamic List Rendering Target Viewbox */}
            <div style={styles.scrollListArea}>
                {isLoadingList ? (
                    <div style={styles.emptyStateContainer}>
                        <Loader2 size={20} style={styles.spin} />
                        <p style={styles.emptyStateText}>Fetching manifest file array...</p>
                    </div>
                ) : uploadedDocuments.length === 0 ? (
                    <div style={styles.emptyStateContainer}>
                        <FileText size={28} color="#94a3b8" />
                        <p style={styles.emptyStateText}>No workspace data entries indexed for this profile structure setup.</p>
                    </div>
                ) : (
                    uploadedDocuments.map((doc) => {
                        const isActive = activeChapter === doc.chapterNumber;
                        return (
                            <div
                                key={doc.recordId}
                                onClick={() => !isUploading && setActiveChapter(doc.chapterNumber)}
                                style={{
                                    ...styles.documentItemCard,
                                    borderColor: isActive ? '#2563eb' : '#e2e8f0',
                                    backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                                }}
                            >
                                <div style={styles.cardMainTitleRow}>
                                    <FileText size={15} color={isActive ? '#2563eb' : '#64748b'} style={{ flexShrink: 0 }} />
                                    <span style={{ ...styles.cardTextTitle, color: isActive ? '#1e40af' : '#0f172a' }} title={doc.fileName}>
                                        {doc.fileName}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '20px 20px 14px 20px',
        borderBottom: '1px solid #e2e8f0',
    },
    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '16px',
        fontWeight: 700,
        color: '#0f172a',
        margin: 0,
    },
    refreshBtn: {
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        padding: '4px',
    },
    subtitle: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '6px',
        marginImg: 0,
    },
    badge: {
        fontWeight: 600,
        color: '#0f172a',
        backgroundColor: '#f1f5f9',
        padding: '1px 6px',
        borderRadius: '4px'
    },
    uploadCard: {
        margin: '16px 20px 10px 20px',
        padding: '14px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    inputRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    labelText: {
        fontSize: '12px',
        color: '#475569',
        fontWeight: 500,
    },
    inputElement: {
        width: '75px',
        padding: '5px 8px',
        borderRadius: '6px',
        border: '1px solid #000000',
        fontSize: '13px',
        textAlign: 'center',
        color: '#ffffff',
        outline: 'none'
    },
    submitActionLabel: {
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 500,
        textAlign: 'center',
    },
    centeredFlex: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollListArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '10px 20px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    emptyStateContainer: {
        margin: 'auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    },
    emptyStateText: {
        fontSize: '12.5px',
        color: '#64748b',
        margin: 0,
        maxWidth: '85%'
    },
    documentItemCard: {
        padding: '1px 14px',
        borderRadius: '8px',
        border: '1px solid',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.15s ease'
    },
    cardMainTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    cardTextTitle: {
        fontSize: '13.5px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    metaRowInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#64748b'
    },
    metaBadgeItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '3px'
    },
    successBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        color: '#059669',
        fontWeight: 600
    },
    spin: {
        animation: 'spin 1s linear infinite'
    }
};

export default DocumentSidebar;