import React, { useMemo, useRef, useState } from 'react';
import { Trash2, Upload, FileText, Search, Eye, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSelector } from 'react-redux'; // Hook to pull theme state
import { BASEURL } from '../../config/config';

const KnowledgeBaseView = ({
    pdfs,
    searchTerm,
    onSearch,
    onUpload,
    onDelete,
    isUploading,
}) => {
    const fileInputRef = useRef(null);
    // State to handle the current file previewing in the popup modal
    const [previewUrl, setPreviewUrl] = useState(null);

    // Pull the real-time darkMode state from your Redux store
    const darkMode = useSelector((state) => state.data.darkMode);

    const filteredPdfs = useMemo(() => {
        if (!searchTerm) return pdfs;
        return pdfs.filter((pdf) => pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [pdfs, searchTerm]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) onUpload(file);
    };

    // 🎨 Dynamic mid-tone dark vs glacier light theme configurations
    const theme = {
        bg: darkMode ? 'bg-[#161b26]' : 'bg-[#e9eff5]',
        textPrimary: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSecondary: darkMode ? 'text-slate-400' : 'text-slate-500',
        border: darkMode ? 'border-slate-700/50' : 'border-slate-200',

        // Input settings
        inputBg: darkMode ? 'bg-[#1a222f] border-slate-700/60 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
        badgeBg: darkMode ? 'bg-[#273346] text-slate-400 border-slate-700/30' : 'bg-slate-100 text-slate-600 border-slate-200',

        // Item grid components
        itemCard: darkMode ? 'bg-[#273346]/60 border-slate-700/40 hover:border-slate-600' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300',
        avatarBg: darkMode ? 'bg-[#1a222f]' : 'bg-slate-100 border border-slate-200',

        // Action settings
        viewBtn: darkMode ? 'bg-[#1a222f] text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        trashBtn: darkMode ? 'bg-[#1a222f] text-slate-400 hover:bg-rose-500/10 hover:text-rose-400' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
        emptyStateBox: darkMode ? 'bg-[#273346]/10 border-slate-700/60' : 'bg-slate-50 border-slate-300 shadow-inner',

        // Modal styling extensions
        modalOverlay: 'bg-black/60 backdrop-blur-sm',
        modalContent: darkMode ? 'bg-[#1e2533] border border-slate-700/80 shadow-2xl' : 'bg-white border border-slate-200 shadow-2xl',
        modalHeader: darkMode ? 'border-slate-700/60' : 'border-slate-100'
    };

    return (
        <div className={`h-full flex flex-col p-6 overflow-y-auto max-w-full mx-auto w-full font-sans px-5 transition-colors duration-300 ${theme.bg}`}>

            {/* Header Title Section */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 mb-6 ${theme.border}`}>
                <div>
                    <h1 className={`text-xl font-bold tracking-wide ${theme.textPrimary}`}>Knowledge Base Sources</h1>
                    <p className={`text-xs mt-1 ${theme.textSecondary}`}>
                        Manage documents used by your AI assistant.
                    </p>
                </div>

                {/* Main Upload Input Button Trigger */}
                <div>
                    <label className={`flex h-10 items-center justify-center gap-2 cursor-pointer rounded-xl bg-[#0091ff] hover:bg-[#0077e6] text-white font-semibold px-5 text-sm shadow-md transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isUploading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Uploading document...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                <span>Upload File</span>
                            </>
                        )}
                        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                    </label>
                </div>
            </div>

            {/* Layout Filters Utility Bar */}
            <div className="mb-6">
                <div className="relative flex items-center w-full group">
                    {/* Left Side: Search Icon */}
                    <div className="absolute left-4 z-20 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* The Search Input Field */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search documents by filename..."
                        className={`w-full pl-11 pr-44 h-11 rounded-xl border focus:border-[#0091ff] focus:outline-none transition-colors ${theme.inputBg}`}
                    />

                    {/* Right Side: Supports Badge */}
                    <span className={`absolute right-3.5 z-20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${theme.badgeBg}`}>
                        Supports: PDF, DOCX, TXT
                    </span>
                </div>
            </div>

            {/* Document Collection Listing Render Grid */}
            {filteredPdfs.length === 0 ? (
                <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 text-center transition-all ${theme.emptyStateBox}`}>
                    <FileText className="h-12 w-12 text-slate-400 mb-3 opacity-60" />
                    <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>No matching documents found</h3>
                    <p className={`text-xs mt-1 ${theme.textSecondary}`}>Try a different search term or upload a new document.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPdfs.map((pdf) => (
                        <div key={pdf.recordId} className={`flex items-center justify-between p-4 border rounded-xl transition-all shadow-sm ${theme.itemCard}`}>
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[#0091ff] text-xs font-bold ${theme.avatarBg}`}>
                                    {String(pdf.fileName || 'Doc').split('.').pop()?.toUpperCase() || 'PDF'}
                                </div>
                                <div className="min-w-0">
                                    <p className={`truncate text-sm font-medium ${theme.textPrimary}`}>{pdf.fileName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Updated view button: changed from <a> tag to standard button handling modal activation */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewUrl(`${BASEURL}/${pdf?.filePath}`)}
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${theme.viewBtn}`}
                                    title="View File"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>

                                {/* Your original trash button remains here */}
                                <button
                                    type="button"
                                    onClick={() => onDelete(pdf)}
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent transition-all active:scale-95 ${theme.trashBtn}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Document Preview Lightbox Modal Pop-Up */}
            {previewUrl && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 ${theme.modalOverlay}`}>
                    <div className={`relative flex flex-col w-full h-full max-w-5xl rounded-2xl overflow-hidden ${theme.modalContent}`}>

                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${theme.modalHeader}`}>
                            <span className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${theme.textPrimary}`}>
                                <FileText className="h-4 w-4 text-[#0091ff]" /> File Document Preview
                            </span>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className={`p-1.5 rounded-lg transition-colors duration-150 ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Embedded Frame Content Body */}
                        <div className="flex-1 bg-neutral-900/5 relative">
                            <iframe
                                src={previewUrl}
                                title="Knowledge Base Document Viewer"
                                className="w-full h-full border-0 rounded-b-2xl"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBaseView;
