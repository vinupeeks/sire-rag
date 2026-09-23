import { useMemo, useRef, useState } from 'react';
import { Eye, FileText, Search, Trash2, Upload, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { BASEURL } from '../../config/config';

const OcimfFilesView = ({ files = [], onUpload, onDelete, isUploading = false }) => {
    const darkMode = useSelector((state) => state.data.darkMode);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files;
        return files.filter((file) => file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [files, searchTerm]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file && onUpload) {
            onUpload(file);
        }
        event.target.value = '';
    };

    const theme = {
        bg: darkMode ? 'bg-[#161b26]' : 'bg-[#e9eff5]',
        textPrimary: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSecondary: darkMode ? 'text-slate-400' : 'text-slate-500',
        border: darkMode ? 'border-slate-700/50' : 'border-slate-200',
        inputBg: darkMode
            ? 'bg-[#1a222f] border-slate-700/60 text-slate-100 placeholder-slate-500'
            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
        itemCard: darkMode
            ? 'bg-[#273346]/60 border-slate-700/40 hover:border-slate-600'
            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300',
        avatarBg: darkMode ? 'bg-[#1a222f]' : 'bg-slate-100 border border-slate-200',
        viewBtn: darkMode
            ? 'bg-[#1a222f] text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        emptyStateBox: darkMode ? 'bg-[#273346]/10 border-slate-700/60' : 'bg-slate-50 border-slate-300 shadow-inner',
        modalContent: darkMode ? 'bg-[#1e2533] border border-slate-700/80 shadow-2xl' : 'bg-white border border-slate-200 shadow-2xl',
        modalHeader: darkMode ? 'border-slate-700/60' : 'border-slate-100',
    };

    return (
        <div className={`h-full flex flex-col overflow-y-auto p-6 px-5 font-sans ${theme.bg}`}>
            <div className={`mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${theme.border}`}>
                <div>
                    <h1 className={`text-xl font-bold tracking-wide ${theme.textPrimary}`}>Common Files</h1>
                    <p className={`mt-1 text-xs ${theme.textSecondary}`}>View reference documents available to your AI assistant.</p>
                </div>
                <div className="flex items-center gap-3">
                    {onUpload && (
                        <label className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0091ff] px-5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0077e6] ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                            {isUploading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    <span>Upload File</span>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                    )}
                    <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'border-slate-700/30 bg-[#273346] text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                        {files.length} files
                    </span>
                </div>
            </div>

            <div className="mb-6 relative flex items-center">
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search OCIMF files by filename..."
                    className={`h-11 w-full rounded-xl border pl-11 pr-4 focus:border-[#0091ff] focus:outline-none ${theme.inputBg}`}
                />
            </div>

            {filteredFiles.length === 0 ? (
                <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center ${theme.emptyStateBox}`}>
                    <FileText className="mb-3 h-12 w-12 text-slate-400 opacity-60" />
                    <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>No OCIMF files found</h3>
                    <p className={`mt-1 text-xs ${theme.textSecondary}`}>No files match the current search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredFiles.map((file) => (
                        <div key={file.recordId || file.fileName} className={`flex items-center justify-between rounded-xl border p-4 shadow-sm ${theme.itemCard}`}>
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-[#0091ff] ${theme.avatarBg}`}>
                                    {String(file.fileName || 'Doc').split('.').pop()?.toUpperCase() || 'FILE'}
                                </div>
                                <p className={`truncate text-sm font-medium ${theme.textPrimary}`}>{file.fileName}</p>
                            </div>
                            <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPreviewUrl(`${BASEURL}/${file.filePath}`)}
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${theme.viewBtn}`}
                                    title="View File"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                {onDelete && (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(file)}
                                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent transition-all active:scale-95 ${darkMode ? 'bg-[#1a222f] text-slate-400 hover:bg-rose-500/10 hover:text-rose-400' : 'bg-slate-50 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'}`}
                                        title="Delete File"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6 md:p-10">
                    <div className={`relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl ${theme.modalContent}`}>
                        <div className={`flex items-center justify-between border-b px-5 py-3.5 ${theme.modalHeader}`}>
                            <span className={`flex items-center gap-2 text-sm font-semibold tracking-wide ${theme.textPrimary}`}>
                                <FileText className="h-4 w-4 text-[#0091ff]" /> OCIMF File Preview
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreviewUrl(null)}
                                className={`rounded-lg p-1.5 ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative flex-1 bg-neutral-900/5">
                            <iframe src={previewUrl} title="OCIMF File Viewer" className="h-full w-full border-0 rounded-b-2xl" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OcimfFilesView;
