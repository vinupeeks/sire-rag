import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, FileCheck2, FileUp, Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useExtractInspectionPdfMutation, useUploadInspectionPdfMutation } from '../../../redux/services/inspectionsApi';
import { ROUTES } from '../../../constants/routes';

const phaseCopy = {
    uploading: { title: 'Uploading report', description: 'Sending your PDF securely to the inspection workspace.' },
    extracting: { title: 'Generating inspection data', description: 'Reading the report and preparing its inspection items. This may take a moment.' },
};

const ReportUpload = ({ darkMode }) => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [phase, setPhase] = useState('idle');
    const [isDragging, setIsDragging] = useState(false);

    const [uploadInspectionPdf] = useUploadInspectionPdfMutation();
    const [extractInspectionPdf] = useExtractInspectionPdfMutation();

    const isProcessing = phase !== 'idle';
    const panelClass = darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white';
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

    // Extracted validation logic for both click-to-upload and drag-and-drop
    const processSelectedFile = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Please select a valid PDF report.');
            return;
        }
        setSelectedFile(file);
    };

    const handleFileChange = (event) => {
        processSelectedFile(event.target.files?.[0]);
        event.target.value = ''; // Reset input to allow selecting the same file again if needed
    };

    // Drag and Drop Handlers
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isProcessing) setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (isProcessing) return;

        const droppedFile = event.dataTransfer.files?.[0];
        processSelectedFile(droppedFile);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile || isProcessing) return;

        try {
            setPhase('uploading');
            const formData = new FormData();
            formData.append('file', selectedFile);
            const uploadResponse = await uploadInspectionPdf(formData).unwrap();
            const filename = uploadResponse?.file?.filename;

            if (!filename) throw new Error('The upload response did not include a filename.');

            setPhase('extracting');
            await extractInspectionPdf({
                filename,
                inspector_id: user?.inspector_id ?? 1,
                inspecting_company_id: user?.inspecting_company_id ?? 1,
            }).unwrap();

            toast.success('Report generated successfully.');
            navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS);
        } catch (error) {
            setPhase('idle');
            toast.error(error?.data?.message || error?.message || 'Unable to process the report. Please try again.');
        }
    };

    // Dynamic styling for the dropzone based on dragging state
    const dropzoneClass = isDragging
        ? (darkMode ? 'border-sky-500 bg-sky-900/20' : 'border-sky-500 bg-sky-50')
        : (darkMode ? 'border-slate-600 hover:border-sky-500 hover:bg-slate-900/40' : 'border-slate-300 hover:border-sky-500 hover:bg-sky-50/40');

    return (
        <section className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-[#111827]' : 'bg-slate-100'}`}>
            <div className={`mx-auto max-w-4xl rounded-2xl border ${panelClass}`}>
                <div className={`border-b px-6 py-5 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                            <FileUp className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Upload inspection report</h1>
                            <p className={`mt-1 text-sm ${mutedTextClass}`}>Upload a report to generate inspection items for review.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpload} className="space-y-6 p-6">
                    <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="sr-only" disabled={isProcessing} />

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        disabled={isProcessing}
                        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${dropzoneClass}`}
                    >
                        {selectedFile ? <FileCheck2 className="h-10 w-10 text-emerald-500" /> : <UploadCloud className={`h-10 w-10 ${isDragging ? 'text-sky-400 scale-110 transition-transform' : 'text-sky-500'}`} />}
                        <span className={`mt-4 text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {selectedFile ? selectedFile.name : (isDragging ? 'Drop report here' : 'Choose a report')}
                        </span>
                        <span className={`mt-2 text-xs ${mutedTextClass}`}>
                            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB selected` : 'Drag and drop or select a file'}
                        </span>
                    </button>

                    {isProcessing && (
                        <div className={`rounded-xl border p-5 ${darkMode ? 'border-sky-500/30 bg-sky-500/5' : 'border-sky-200 bg-sky-50'}`}>
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                                <div>
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{phaseCopy[phase].title}</p>
                                    <p className={`mt-1 text-xs ${mutedTextClass}`}>{phaseCopy[phase].description}</p>
                                </div>
                            </div>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-500/15">
                                <div className={`h-full rounded-full bg-sky-500 transition-all duration-700 ${phase === 'uploading' ? 'w-1/3' : 'w-4/5'}`} />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <div className={`flex items-center gap-2 ${phase === 'extracting' ? 'text-emerald-500' : 'text-sky-500'}`}>
                                    {phase === 'extracting' ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}Upload PDF
                                </div>
                                <div className={`flex items-center gap-2 ${phase === 'extracting' ? 'text-sky-500' : mutedTextClass}`}>
                                    {phase === 'extracting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4 rounded-full border" />}Generate report
                                </div>
                            </div>
                        </div>
                    )}

                    {!isProcessing && (
                        <div className={`flex items-start gap-3 rounded-lg p-3 text-xs ${darkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                            The report will be uploaded first, then processed before you are taken to the inspections list.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!selectedFile || isProcessing}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FileUp className="h-4 w-4" />
                        {isProcessing ? phaseCopy[phase].title : 'Upload and generate report'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ReportUpload;