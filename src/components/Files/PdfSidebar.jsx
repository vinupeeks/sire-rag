import React, { useMemo, useRef, useState } from 'react';
import { Trash2, ChevronRight, ChevronLeft, Upload, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useDispatch, useSelector } from 'react-redux';

const PdfSidebar = ({
    pdfs,
    searchTerm,
    onSearch,
    onUpload,
    onDelete,
    isUploading,
    collapsed,
    onToggle,
}) => {
    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.data.darkMode);

    const handleThemeToggle = () => {
        dispatch(toggleDarkMode());
    };

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

    // Style Maps matching the mid-tone dark and glacier light theme configuration
    const theme = {
        bg: darkMode ? 'bg-[#324057]' : 'bg-[#e9eff5]/90',
        border: darkMode ? 'border-slate-700/50' : 'border-[#e2e8f0]',
        textPrimary: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSecondary: darkMode ? 'text-slate-300' : 'text-slate-500',
        textTimestamp: darkMode ? 'text-slate-400' : 'text-slate-400',

        // Input styling
        inputBg: darkMode ? 'bg-[#1a222f] border-slate-700/60 text-slate-100 placeholder-slate-500 focus:border-sky-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500',

        // Item list panels
        itemCard: darkMode
            ? 'border-slate-700/50 bg-[#273346] text-slate-100 hover:border-sky-500/40 shadow-sm'
            : 'border-slate-200 bg-white text-slate-900 shadow-sm shadow-sky-100/30 hover:border-sky-400',

        avatarBg: darkMode ? 'bg-[#1a222f] text-slate-300' : 'bg-slate-100 text-slate-600 border border-slate-200/60',

        // Upload Button controls
        uploadWrapper: darkMode ? 'bg-[#1a222f] border-slate-700/60' : 'bg-slate-200/40 border-slate-200',
        uploadBtn: darkMode
            ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-900/20'
            : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-600/10'
    };

    return (
        <div className={`flex h-[100vh] flex-col overflow-hidden font-sans transition-all duration-300 ease-in-out ${theme.bg} ${theme.textPrimary}`}>

            {/* Header Section */}
            <div
                className={`flex items-center justify-between border-b px-3 py-2 ${theme.border}`}
            >
                <div className="group relative flex items-center">

                    {!collapsed ? (
                        <>
                            {/* Collapse Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggle}
                                className={`flex-shrink-0 h-8 w-8 rounded-lg ${darkMode
                                    ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                                    }`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            {/* Upload Header Content */}
                            <div className="ml-2 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="truncate text-xs font-bold tracking-wider leading-tight">
                                        Knowledge Base
                                    </p>
                                    {/* File Count Badge */}
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${darkMode ? 'bg-[#1a222f] text-sky-400' : 'bg-white text-sky-600 border border-[#e2e8f0]'
                                        }`}>
                                        {pdfs.length} files
                                    </span>
                                </div>
                                <p className={`truncate text-[10px] font-semibold tracking-wide leading-none mt-0.5 ${theme.textSecondary}`}>
                                    Manage Sources
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Upload Icon */}
                            <div className="group relative flex items-center justify-center h-8 w-8">
                                <Upload
                                    className={`h-5 w-5 transition-opacity duration-200 group-hover:opacity-0 ${darkMode ? 'text-blue-600' : 'text-blue-600'
                                        }`}
                                />

                                {/* Show Open Sidebar Button on Hover */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggle}
                                    className={`absolute inset-0 h-8 w-8 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${darkMode
                                        ? 'text-slate-200 hover:bg-slate-700'
                                        : 'text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Actions & Controls Layer (Hidden when collapsed) */}
            {!collapsed && (
                <div className="space-y-2.5 px-3 py-3">
                    <Input
                        value={searchTerm}
                        onChange={(event) => onSearch(event.target.value)}
                        placeholder="Search Files..."
                        className={`text-xs sm:text-sm h-9 rounded-xl transition-all border ${theme.inputBg}`}
                    />
                    <div className={`rounded-xl border p-1.5 transition-all duration-300 ${theme.uploadWrapper}`}>
                        <label
                            className={`flex min-h-[2.25rem] cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${theme.uploadBtn} ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                        >
                            {/* Your original inner button code (Upload icon + Text) */}
                            <Upload className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Upload File</span>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    {/* Helper Hint Placement */}
                    <p className={`px-1 text-[10px] font-medium tracking-wide leading-none -mt-1 opacity-75 ${theme.textSecondary}`}>
                        Supported formats: <span className="font-bold">PDF, DOCX, TXT</span>
                    </p>
                </div>
            )}

            {isUploading && (
                <div
                    className={`mx-2 mb-2 rounded-xl border px-3 py-2 text-xs ${darkMode
                            ? 'border-sky-700 bg-sky-900/20 text-sky-300'
                            : 'border-sky-200 bg-sky-50 text-sky-700'
                        }`}
                >
                    Uploading document...
                </div>
            )}

            {/* File List Stream */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
                {filteredPdfs.length === 0 ? (
                    <div className={`mx-2 mt-4 rounded-xl border border-dashed p-4 text-center text-xs font-medium ${darkMode ? 'border-slate-700 bg-slate-800/40 text-slate-400' : 'border-slate-300 bg-slate-200/30 text-slate-500'
                        }`}>
                        No PDFs found.
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {filteredPdfs.map((pdf) => {
                            return (
                                <div
                                    key={pdf.recordId}
                                    className={`group flex min-h-[2.75rem] transition-all duration-200 border px-2.5 py-1.5 text-xs rounded-xl ${collapsed ? 'justify-center w-full' : 'items-center justify-between gap-3'
                                        } ${theme.itemCard}`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${theme.avatarBg}`}>
                                            {String(pdf.fileName || 'PDF').charAt(0).toUpperCase()}
                                        </div>
                                        {!collapsed && (
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium leading-normal">{pdf.fileName}</p>
                                            </div>
                                        )}
                                    </div>

                                    {!collapsed && (

                                        <button
                                            type="button"
                                            onClick={() => onDelete(pdf)}
                                            className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all active:scale-95 border ${darkMode
                                                ? 'bg-[#1a222f] border-transparent text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                                                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600'
                                                }`}
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