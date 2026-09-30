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
        bg: darkMode ? 'bg-[#0b1523]' : 'bg-[#e9eff5]',
        textPrimary: darkMode ? 'text-[#eaf1f8]' : 'text-slate-800',
        textSecondary: darkMode ? 'text-[#9db2c8]' : 'text-slate-500',
        border: darkMode ? 'border-[#1c3149]' : 'border-slate-200',
        badgeBg: darkMode ? 'bg-[#17395c] text-[#9db2c8] border-[#1c3149]' : 'bg-slate-100 text-slate-600 border-slate-200',
        inputBg: darkMode
            ? 'bg-[#0e1b2c] border-[#1c3149] text-slate-100 placeholder-[#7c93ac]'
            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
        itemCard: darkMode
            ? 'bg-[#13243a] border-[#1c3149] hover:bg-[#0e1b2c]'
            : 'bg-white border-slate-200 hover:bg-slate-50',
        avatarBg: darkMode ? 'bg-[#17395c]' : 'bg-slate-100 border border-slate-200',
        viewBtn: darkMode
            ? 'bg-transparent text-[#9db2c8] hover:bg-[#17395c] hover:text-slate-100'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        emptyStateBox: darkMode ? 'bg-[#273346]/10 border-slate-700/60' : 'bg-slate-50 border-slate-300 shadow-inner',
        modalContent: darkMode ? 'bg-[#1e2533] border border-slate-700/80 shadow-2xl' : 'bg-white border border-slate-200 shadow-2xl',
        modalHeader: darkMode ? 'border-slate-700/60' : 'border-slate-100',
    };

    return (
        <div className={`h-full min-h-0 flex flex-col overflow-hidden p-6 px-7 font-sans ${theme.bg}`}>
            <div className="mb-5 flex flex-shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>Common Files</h1>
                        <span
                            aria-label={`${files.length} common files`}
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.badgeBg}`}
                        >
                            {files.length}
                        </span>
                    </div>
                    <p className={`mt-1 max-w-[760px] text-[13px] leading-6 ${theme.textSecondary}`}>Industry rules and guidance that apply to every operator. The assistant reads these alongside your own Company Files.</p>
                </div>
                <div className="flex items-center gap-3">
                    {onUpload && (
                        <label className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0f6fb8] px-5 text-sm font-medium text-white transition-all hover:bg-[#0c5f9f] ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
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
                </div>
            </div>

            <div className="relative mb-6 flex flex-shrink-0 items-center">
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by document name..."
                    className={`h-10 w-full max-w-[360px] rounded-lg border pl-11 pr-4 text-[13px] focus:border-[#5bc0f5] focus:outline-none ${theme.inputBg}`}
                />
            </div>

            {filteredFiles.length === 0 ? (
                <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center ${theme.emptyStateBox}`}>
                    <FileText className="mb-3 h-12 w-12 text-slate-400 opacity-60" />
                    <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>No OCIMF files found</h3>
                    <p className={`mt-1 text-xs ${theme.textSecondary}`}>No files match the current search.</p>
                </div>
            ) : (
                <div className={`file-list-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border ${darkMode ? 'border-[#1c3149] bg-[#13243a]' : 'border-slate-200 bg-white'}`}>
                    {filteredFiles.map((file) => (
                        <div key={file.recordId || file.fileName} className={`flex min-h-[62px] items-center justify-between gap-4 border-b px-5 py-3 last:border-b-0 transition-colors ${theme.itemCard}`}>
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className={`flex h-8 flex-shrink-0 items-center justify-center rounded px-2 text-[10px] font-semibold text-[#5bc0f5] ${theme.avatarBg}`}>
                                    {String(file.fileName || 'Doc').split('.').pop()?.toUpperCase() || 'FILE'}
                                </div>
                                <p className={`truncate text-sm font-medium ${theme.textPrimary}`}>{file.fileName}</p>
                            </div>
                            <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPreviewUrl(`${BASEURL}/${file.filePath}`)}
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a4767] transition-all active:scale-95 ${theme.viewBtn}`}
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
