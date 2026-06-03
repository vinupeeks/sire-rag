import { useMemo, useRef, useState } from 'react';
import { Trash2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const PdfSidebar = ({
    pdfs,
    searchTerm,
    onSearch,
    onUpload,
    onDelete,
    collapsed,
    onToggle,
}) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const filteredPdfs = useMemo(() => {
        if (!searchTerm) return pdfs;
        return pdfs.filter((pdf) => pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [pdfs, searchTerm]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        setSelectedFile(file);
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="flex h-[100vh] flex-col overflow-hidden bg-slate-950 text-slate-100">
            <div className="flex min-h-[3.5rem] items-center justify-between gap-2 border-b border-slate-800/80 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3">
                <div className="group relative flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 flex-shrink-0 sm:h-9 sm:w-9">
                        <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold leading-tight sm:text-sm">PDF Manager</p>
                            <p className="truncate text-[10px] text-slate-500 leading-tight sm:text-xs">Upload and review</p>
                        </div>
                    )}

                    {collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className="absolute left-0 top-0 h-9 w-9 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-slate-900/90 sm:h-11 sm:w-11"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {!collapsed && (
                    <Button variant="ghost" size="icon" onClick={onToggle} className="flex-shrink-0 min-h-[2rem] min-w-[2rem]">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {!collapsed && (
                <div className="space-y-2 px-2 py-2">
                    <Input
                        value={searchTerm}
                        onChange={(event) => onSearch(event.target.value)}
                        placeholder="Search PDFs"
                        className="text-xs sm:text-sm"
                    />
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-1.5 sm:p-2">
                        <label className="flex min-h-[2.25rem] cursor-pointer items-center justify-between gap-2 rounded-2xl bg-cyan-500/15 px-2 py-1.5 text-xs text-cyan-200 transition hover:bg-cyan-500/20 sm:py-2">
                            <span className="inline-flex items-center gap-2">
                                <Upload className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">Upload PDF</span>
                            </span>
                            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {filteredPdfs.length === 0 ? (
                    <div className="mx-2 mt-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/80 p-3 text-center text-xs text-slate-500 sm:p-4 sm:text-sm">
                        No PDFs found.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredPdfs.map((pdf) => {
                            const statusLabel = pdf.status || 'Unknown';
                            const chunkLabel = pdf.chunksProcessed != null ? `${pdf.chunksProcessed} chunks` : null;

                            return (
                                <div
                                    key={pdf.recordId}
                                    className={`group flex min-h-[2.5rem] ${collapsed ? 'justify-center' : 'items-center justify-between'} gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 px-2 py-1.5 text-xs transition hover:border-cyan-400 ${collapsed ? 'w-full' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 text-[10px] font-semibold">
                                            {String(pdf.fileName || 'PDF').charAt(0).toUpperCase()}
                                        </div>
                                        {!collapsed && (
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium leading-tight text-slate-100">{pdf.fileName}</p>
                                                <p className="truncate text-[10px] text-slate-500 leading-tight">
                                                    Ch {pdf.chapterNumber} � {statusLabel}
                                                </p>
                                                {chunkLabel && <p className="truncate text-[10px] text-slate-400 leading-tight">{chunkLabel}</p>}
                                            </div>
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <button
                                            type="button"
                                            onClick={() => onDelete(pdf.recordId)}
                                            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-rose-500 hover:text-white active:scale-95 min-h-[1.75rem] min-w-[1.75rem]"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfSidebar;
