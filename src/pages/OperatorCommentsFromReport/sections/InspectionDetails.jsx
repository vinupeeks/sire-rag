import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ClipboardList, Loader2, RefreshCw, ChevronDown, ChevronUp, Sparkles, X, ChevronLeft, ChevronRight, FileText, BookOpen, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInspectionDetailsMutation } from '../../../redux/services/inspectionsApi';
import { useGetAllFilesQuery } from '../../../redux/services/smsApi';
import { useFetchMutation } from '../../../redux/services/operatorCommentsApi';
import { ROUTES } from '../../../constants/routes';
import { BASEURL } from '../../../config/config';
import OperatorCommentsResultCard from '../components/OperatorCommentsResultCard';
import ReactMarkdown from "react-markdown";

const DetailValue = ({ darkMode, label, value }) => (
    <div>
        <dt className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {label}
        </dt>
        <dd className={`mt-1 text-sm leading-6 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {value || '--:--'}
        </dd>
    </div>
);

const MetadataBadge = ({ darkMode, label, value, accent = 'slate' }) => {
    const accentClasses = {
        amber: darkMode ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700',
        sky: darkMode ? 'border-sky-400/30 bg-sky-400/10 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700',
        slate: darkMode ? 'border-slate-600 bg-slate-800/70 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600',
    };

    return (
        <span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${accentClasses[accent]}`}>
            <span className="font-semibold uppercase tracking-wide opacity-70">{label}</span>
            <span className="truncate font-semibold">{value || 'N/A'}</span>
        </span>
    );
};

const ANALYSIS_LOADING_MESSAGES = [
    'Reviewing observation details...',
    'Cross-referencing regulatory frameworks...',
    'Mapping findings to SIRE 2.0 guidelines...',
    'Formulating targeted corrective measures...',
    'Consolidating final inspection report...',
    'Finalizing analysis (Estimated: 1–2 minutes)...',
];

const normalizeFilePath = (filePath) => String(filePath || '')
    .replace(/^[\\/]+/, '')
    .replace(/\\/g, '/')
    .toLowerCase();

const isEnabledFileFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';

const getSourceFileType = (source, files) => {
    const sourcePath = source?.source_details?.find((sourceDetail) => sourceDetail?.path)?.path;
    const normalizedSourcePath = normalizeFilePath(sourcePath);
    const matchedFile = files.find((file) => {
        const normalizedFilePath = normalizeFilePath(file?.file_path);
        return normalizedFilePath && (
            normalizedFilePath === normalizedSourcePath
            || normalizedSourcePath.endsWith(`/${normalizedFilePath}`)
        );
    });

    if (!matchedFile) return null;

    return isEnabledFileFlag(matchedFile.common) || isEnabledFileFlag(matchedFile.ocimf)
        ? 'Common file'
        : 'Company file';
};

const InlineOperatorComments = ({ details, darkMode, files = [], onCommentGenerated }) => {
    const [submitComment, { isLoading }] = useFetchMutation();
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [operatorFeedback, setOperatorFeedback] = useState('');
    const [generatedComment, setGeneratedComment] = useState(null);
    const [selectedCommentIndex, setSelectedCommentIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);
    const messageTimer = useRef(null);
    const observation = details.observation;
    const question = observation?.inspection_question?.question;
    const comments = details.comments || [];
    const displayedComments = generatedComment ? [generatedComment, ...comments] : comments;
    const comment = displayedComments[selectedCommentIndex];
    const isGenerating = isLoading || isRegenerating;
    const category = details.category ? details.category.charAt(0) + details.category.slice(1).toLowerCase() : '';
    const [isSourcesOpen, setIsSourcesOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const visibleSources = (comment?.sources || []).filter((source) => (
        !source?.snippet?.trim().toLowerCase().startsWith('i cannot find')
    ));

    const getSourcePreviewUrl = (source) => {
        const sourcePath = source?.source_details?.find((sourceDetail) => sourceDetail?.path)?.path;
        if (!sourcePath) return null;

        const normalizedPath = sourcePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
        return `${BASEURL.replace(/\/$/, '')}/${normalizedPath}`;
    };

    useEffect(() => {
        if (!isLoading) return undefined;
        setMessageIndex(0);
        messageTimer.current = setInterval(() => {
            setMessageIndex((current) => (current + 1) % ANALYSIS_LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(messageTimer.current);
    }, [isLoading]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        try {
            const response = await submitComment({
                category,
                comment: observation?.remark || '',
                question_number: question?.question_no || '',
                response_type: observation?.response || '',
                operator_feedback: operatorFeedback,
                findings_id: details.id,
            }).unwrap();
            const latestComment = response?.data || response;
            setGeneratedComment(latestComment);
            setSelectedCommentIndex(0);
            setOperatorFeedback('');
            onCommentGenerated?.(latestComment);
        } catch (error) {
            setErrorMessage(error?.data?.message || 'Failed to generate operator comments. Please try again.');
        }
    };

    if (comment) {
        return (
            <div className={`relative mt-6 border-t pt-6 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
                {/* Section Header & Pagination */}
                <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                        <h4 className={`text-sm font-semibold ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Draft Operator Comments</h4>
                        {comment.name && (
                            <p className={`mt-1 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {comment.name} {comment.date ? `• ${comment.date}` : ''}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {displayedComments?.length > 1 && (
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Versions</span>
                                <div className={`flex items-center gap-1 rounded-lg border p-1 ${darkMode ? 'border-slate-700/60 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                                    <button type="button" onClick={() => setSelectedCommentIndex((current) => Math.max(0, current - 1))} disabled={selectedCommentIndex === 0} aria-label="Latest operator comment" title="Latest operator comment" className={`rounded-md p-1 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-30`}><ChevronLeft className="h-4 w-4" /></button>
                                    <span className={`px-2 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedCommentIndex + 1} / {displayedComments.length}</span>
                                    <button type="button" onClick={() => setSelectedCommentIndex((current) => Math.min(displayedComments.length - 1, current + 1))} disabled={selectedCommentIndex === displayedComments.length - 1} aria-label="Previous generated operator comment" title="Previous generated operator comment" className={`rounded-md p-1 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-30`}><ChevronRight className="h-4 w-4" /></button>
                                </div>
                            </div>
                        )}
                        {generatedComment && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">Latest generated comment</span>}
                    </div>
                </div>

                {/* VIEW SECTION: The Generated Content */}
                <div className={`space-y-5 rounded-xl border p-5 ${darkMode ? 'border-slate-700/60 bg-slate-800/20' : 'border-slate-200 bg-white shadow-sm'}`}>

                    {/* Feedback Display */}
                    <div className={`rounded-lg border-l-4 px-4 py-3 ${darkMode ? 'border-sky-500/70 bg-slate-900/50' : 'border-sky-500 bg-sky-50/70'}`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>
                            Changes Requested
                        </p>
                        <p className={`mt-1 whitespace-pre-wrap break-words text-sm leading-6 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {comment?.operator_feedback || <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>No feedback provided.</span>}
                        </p>
                    </div>

                    {/* RCA Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <OperatorCommentsResultCard darkMode={darkMode} title="Immediate Cause" resultKey="immediateCause" content={comment.immediateCause || comment.immediate_cause} />
                        <OperatorCommentsResultCard darkMode={darkMode} title="Root Cause" resultKey="rootCause" content={comment.rootCause || comment.root_cause} />
                        <OperatorCommentsResultCard darkMode={darkMode} title="Corrective Action" resultKey="correctiveAction" content={comment.correctiveAction || comment.corrective_action} />
                        <OperatorCommentsResultCard darkMode={darkMode} title="Preventative Action" resultKey="preventativeAction" content={comment.preventativeAction || comment.preventative_action} />
                    </div>

                    {/* Sources List */}
                    {visibleSources.length > 0 && (
                        <div className={`rounded-xl border px-4 p-2 ${darkMode ? 'border-slate-700/60 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex items-center justify-between">
                                <h3 className={`flex items-center gap-2 text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <BookOpen className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                    Reference Sources ({visibleSources.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                                    aria-label="Toggle referenced sources"
                                    title={isSourcesOpen ? "Hide sources" : "View sources"}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${darkMode
                                            ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {/* Eye Icon SVG */}
                                    <svg className="h-4 w-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        {isSourcesOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        )}
                                    </svg>
                                    <span>{isSourcesOpen ? "Hide Sources" : "View Sources"}</span>
                                </button>
                            </div>

                            {isSourcesOpen && (
                                <div className="custom-scrollbar mt-3 max-h-[250px] space-y-3 overflow-y-auto border-t pr-2 pt-3 border-slate-200 dark:border-slate-700/60">
                                    {visibleSources.map((src, idx) => (
                                        <div key={idx} className={`rounded-lg border p-3.5 text-sm transition-colors ${darkMode ? 'border-slate-700/50 bg-[#1a2233] hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
                                            {(() => {
                                                const sourceType = getSourceFileType(src, files);

                                                return (
                                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                {getSourcePreviewUrl(src) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewUrl(getSourcePreviewUrl(src))}
                                                        title={`Open ${src.filename || 'source document'}`}
                                                        className="inline-flex max-w-full items-center gap-1.5 rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-left font-medium text-sky-500 transition-colors hover:border-sky-400/50 hover:bg-sky-500/20"
                                                    >
                                                        <FileText className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{src.filename || 'n/a'}</span>
                                                        {sourceType && <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceType === 'Common file'
                                                            ? (darkMode ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                                                            : (darkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-700')
                                                            }`}>{sourceType}</span>}
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex max-w-full items-center gap-1.5 rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-medium text-sky-500">
                                                        <FileText className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{src.filename || 'n/a'}</span>
                                                        {sourceType && <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceType === 'Common file'
                                                            ? (darkMode ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                                                            : (darkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-700')
                                                            }`}>{sourceType}</span>}
                                                    </span>
                                                )}
                                            </div>
                                                );
                                            })()}
                                            {/* <p className={`mb-2 truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>File: {src.filename}</p> */}
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="mb-2">{children}</p>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="mb-2 mt-3 font-semibold">{children}</h3>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-semibold">{children}</strong>
                                                    ),
                                                }}
                                            >
                                                {src.snippet}
                                            </ReactMarkdown>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {previewUrl && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6 md:p-10">
                            <div className={`relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${darkMode ? 'border-slate-700/80 bg-[#1e2533]' : 'border-slate-200 bg-white'}`}>
                                <div className={`flex items-center justify-between border-b px-5 py-3.5 ${darkMode ? 'border-slate-700/60' : 'border-slate-100'}`}>
                                    <span className={`flex items-center gap-2 text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                        <FileText className="h-4 w-4 text-sky-500" />
                                        Source Document Preview
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewUrl(null)}
                                        aria-label="Close source document preview"
                                        title="Close preview"
                                        className={`rounded-lg p-1.5 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="relative flex-1 bg-neutral-900/5">
                                    <iframe src={previewUrl} title="Source document viewer" className="h-full w-full border-0" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTION SECTION: Regenerate Form */}
                <div className={`relative mt-4 rounded-xl border p-5 ${darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200 bg-slate-50/80'}`}>

                    {isGenerating && (
                        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl p-6 text-center backdrop-blur-md ${darkMode ? 'bg-[#111827]/95' : 'bg-white/95'}`}>
                            <div className="cube-spinner h-10 w-10">
                                {Array.from({ length: 6 }, (_, index) => <div key={index} />)}
                            </div>
                            <div className="space-y-1">
                                <p className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                    Generating Operator Comments (~1–2 mins)
                                </p>
                                <p className={`text-xs font-medium animate-pulse ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                                    {ANALYSIS_LOADING_MESSAGES[messageIndex]}
                                </p>
                            </div>
                            <p className={`max-w-md text-xs leading-relaxed opacity-80 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                You can safely collapse this section, review other inspection questions, or work on other tasks while this processes in the background.
                            </p>
                        </div>
                    )}

                    <label htmlFor={`operator-feedback-${details.id}`} className={`mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Need changes? <span className="font-normal normal-case opacity-70">(Provide new feedback to regenerate)</span>
                    </label>
                    <span className="text-sm text-slate-400">
                        This is an optional section. If you have any specific comments on this observation, we can include that in the draft comments generated.
                    </span>
                    <textarea
                        id={`operator-feedback-${details.id}`}
                        value={operatorFeedback}
                        onChange={(event) => setOperatorFeedback(event.target.value)}
                        rows={3}
                        // placeholder="Add context, correct the timeline, or provide specific instructions..."
                        className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${darkMode ? 'border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || isRegenerating || !operatorFeedback.trim()}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Sparkles className="h-4 w-4" />
                            Regenerate comments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative mt-5 border-t pt-5 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
           
            {isGenerating && (
                <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl p-6 text-center backdrop-blur-md ${darkMode ? 'bg-[#111827]/95' : 'bg-white/95'}`}>
                    <div className="cube-spinner h-10 w-10">
                        {Array.from({ length: 6 }, (_, index) => <div key={index} />)}
                    </div>
                    <div className="space-y-1">
                        <p className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            Generating Operator Comments (~1–2 mins)
                        </p>
                        <p className={`text-xs font-medium animate-pulse ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                            {ANALYSIS_LOADING_MESSAGES[messageIndex]}
                        </p>
                    </div>
                    <p className={`max-w-md text-xs leading-relaxed opacity-80 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        You can safely collapse this section, review other inspection questions, or work on other tasks while this processes in the background.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                    <h4 className={`text-sm font-semibold ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Draft Operator Comments</h4>
                </div>
                <div>
                    <label htmlFor={`operator-feedback-${details.id}`} className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Operator feedback
                        <span className="font-normal opacity-70">(optional)</span>
                    </label><br />
                    <span className="text-sm text-slate-400">
                        This is an optional section. If you have any specific comments on this observation, we can include that in the draft comments generated.
                    </span>

                    <textarea id={`operator-feedback-${details.id}`} value={operatorFeedback} onChange={(event) => setOperatorFeedback(event.target.value)} rows={3} className={`mt-2 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${darkMode ? 'border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`} />
                </div>
                {errorMessage && <p className="text-sm text-rose-500">{errorMessage}</p>}
                <div className="flex justify-end">
                    <button type="submit" disabled={isGenerating} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"><Sparkles className="h-4 w-4" />Generate operator comments</button>
                </div>
            </form>
        </div>
    );
};

const OperatorCommentsModal = ({ details, darkMode, onClose }) => {
    const [submitComment, { isLoading }] = useFetchMutation();
    const [operatorFeedback, setOperatorFeedback] = useState('');
    const [apiResponse, setApiResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);
    const messageTimer = useRef(null);
    const observation = details.observation;
    const question = observation?.inspection_question?.question;
    const category = details.category ? details.category.charAt(0) + details.category.slice(1).toLowerCase() : '';

    useEffect(() => {
        if (!isLoading) return undefined;
        setMessageIndex(0);
        messageTimer.current = setInterval(() => {
            setMessageIndex((current) => (current + 1) % ANALYSIS_LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(messageTimer.current);
    }, [isLoading]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        try {
            const response = await submitComment({
                category,
                comment: observation?.remark || '',
                question_number: question?.question_no || '',
                response_type: observation?.response || '',
                operator_feedback: operatorFeedback,
                findings_id: details.id
            }).unwrap();
            setApiResponse(response.data);
        } catch (error) {
            setErrorMessage(error?.data?.message || 'Failed to generate operator comments. Please try again.');
        }
    };

    const result = apiResponse?.result || apiResponse;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
            <style>{`
                .cube-spinner { position: relative; transform-style: preserve-3d; animation: inspection-cube-spin 2s infinite ease; }
                .cube-spinner > div { position: absolute; inset: 0; background: rgba(14, 165, 233, 0.15); border: 2px solid #0ea5e9; }
                .cube-spinner div:nth-child(1) { transform: translateZ(-22px) rotateY(180deg); }
                .cube-spinner div:nth-child(2) { transform: rotateY(-270deg) translateX(50%); transform-origin: top right; }ṇ
                .cube-spinner div:nth-child(3) { transform: rotateY(270deg) translateX(-50%); transform-origin: center left; }
                .cube-spinner div:nth-child(4) { transform: rotateX(90deg) translateY(-50%); transform-origin: top center; }
                .cube-spinner div:nth-child(5) { transform: rotateX(-90deg) translateY(50%); transform-origin: bottom center; }
                .cube-spinner div:nth-child(6) { transform: translateZ(22px); }
                @keyframes inspection-cube-spin {
                    0% { transform: rotate(45deg) rotateX(-25deg) rotateY(25deg); }
                    50% { transform: rotate(45deg) rotateX(-385deg) rotateY(25deg); }
                    100% { transform: rotate(45deg) rotateX(-385deg) rotateY(385deg); }
                }
            `}</style>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 px-4">
                    <div className={`flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border px-10 py-9 shadow-2xl ${darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white'}`}>
                        <div className="cube-spinner h-11 w-11">
                            {Array.from({ length: 6 }, (_, index) => <div key={index} />)}
                        </div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Analyzing Comments</p>
                        <p className={`min-h-5 text-center text-xs ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>{ANALYSIS_LOADING_MESSAGES[messageIndex]}</p>
                    </div>
                </div>
            )}

            <div className={`max-h-full w-full max-w-5xl overflow-y-auto rounded-2xl border shadow-2xl ${darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white'}`}>
                <div className={`flex items-center justify-between border-b px-6 py-2 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Generate operator comments</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={isLoading} aria-label="Close" title="Close" className={`rounded-lg p-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-50`}><X className="h-5 w-5" /></button>
                </div>

                <div className="space-y-2 p-6">
                    {!apiResponse ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-700/60 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <DetailValue darkMode={darkMode} label="Category" value={category} />
                                    <DetailValue darkMode={darkMode} label="Response type" value={observation?.response} />
                                    <div className="sm:col-span-2">
                                        <DetailValue darkMode={darkMode} label="Inspector remark" value={observation?.remark} />
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <label htmlFor="operator-feedback" className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Operator feedback <span className="font-normal opacity-70">(optional)</span>
                                </label>
                                <textarea
                                    id="operator-feedback"
                                    value={operatorFeedback}
                                    onChange={(event) => setOperatorFeedback(event.target.value)}
                                    rows={4}
                                    placeholder="Your response to this observation. Disagree, correct the record, or what actually happened."
                                    className={`mt-2 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${darkMode ? 'border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
                                />
                            </div>

                            {errorMessage && <p className="text-sm text-center text-rose-500">{errorMessage}</p>}

                            {/* Replaced 'inline-flex w-full' with 'flex mx-auto w-[80%] sm:w-[50%] md:w-[30%]' to center it nicely across devices */}
                            <button
                                type="submit"
                                className="flex mx-auto w-[80%] sm:w-[50%] md:w-[30%] items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                            >
                                <Sparkles className="h-4 w-4" />
                                Generate comments
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-5">
                            <div className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>
                                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{result?.question_info?.title}</p>
                                <p className={`mt-1 mb-1 text-sm items-end ${darkMode ? 'text-white' : 'text-slate-500'}`}>{`${result.category} - ${result.response_type}`}</p>
                                Inspector Remark: {`${result.comment}`}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <OperatorCommentsResultCard darkMode={darkMode} title="Immediate Cause" resultKey="immediateCause" content={result?.immediate_cause || apiResponse?.immediate_cause} />
                                <OperatorCommentsResultCard darkMode={darkMode} title="Root Cause" resultKey="rootCause" content={result?.root_cause || apiResponse?.root_cause} />
                                <OperatorCommentsResultCard darkMode={darkMode} title="Corrective Action" resultKey="correctiveAction" content={result?.corrective_action || apiResponse?.corrective_action} />
                                <OperatorCommentsResultCard darkMode={darkMode} title="Preventative Action" resultKey="preventativeAction" content={result?.preventative_action || apiResponse?.preventative_action} />
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="block mx-auto w-[30%] rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InspectionAccordionItem = ({ details, darkMode, files, latestGeneratedComment, onCommentGenerated }) => {
    const [isOpen, setIsOpen] = useState(false);

    const observation = details.observation;
    const question = observation?.inspection_question?.question;
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
    const existingComments = Array.isArray(details.comments) ? details.comments : [];
    const operatorCommentCount = existingComments.length + (latestGeneratedComment ? 1 : 0);
    const hasGeneratedOperatorComment = operatorCommentCount > 0;

    // Format PIF string conditionally to avoid "undefined - undefined"
    const pifDetails = details.pif_no || details.pif_description
        ? `${details.pif_no || 'N/A'} - ${details.pif_description || 'N/A'}`
        : null;

    return (
        <article className={`rounded-xl border transition-all duration-200 ${darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white'}`}>
            {/* Accordion Header (Summary) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-start justify-between gap-4 p-5 text-left transition-colors sm:items-center ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} ${isOpen ? (darkMode ? 'rounded-t-xl bg-slate-800/30' : 'rounded-t-xl bg-slate-50') : 'rounded-xl'}`}
            >
                <div className="flex-1 pr-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <MetadataBadge darkMode={darkMode} label="" value={details.type} accent="amber" />
                        <MetadataBadge darkMode={darkMode} label="" value={question?.tag} accent="sky" />
                        <MetadataBadge darkMode={darkMode} label="" value={details.category} />
                    </div>
                    <h3 className={`text-sm font-semibold leading-relaxed line-clamp-2 sm:text-md ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {question?.question_no} - {question?.question ? question.question : (details.noc || 'Inspection item')}
                    </h3>
                </div>
                <div className="mt-1 flex shrink-0 items-center gap-2 sm:mt-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${hasGeneratedOperatorComment
                        ? (darkMode ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
                        : (darkMode ? 'border-slate-600 bg-slate-800/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500')}`}>
                        {hasGeneratedOperatorComment && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {operatorCommentCount} {operatorCommentCount === 1 ? 'Versions Generated' : 'Versions Generated'}
                    </span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>
            </button>

            {/* Accordion Body (Full Details) */}
            {isOpen && (
                <div className={`border-t p-5 sm:p-6 ${darkMode ? 'border-slate-700/60 bg-[#111827]/50' : 'border-slate-200 bg-white'}`}>
                    {/* Unified Details Block */}
                    <div className="rounded-lg bg-sky-500/5 p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className={`rounded-lg border px-4 py-3 ${darkMode ? 'border-sky-400/20 bg-slate-900/40' : 'border-sky-200/80 bg-white/80'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>NOC</p>
                                <p className={`mt-1 text-sm font-semibold leading-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{details.noc || '--:--'}</p>
                            </div>
                            <div className={`rounded-lg border px-4 py-3 ${darkMode ? 'border-sky-400/20 bg-slate-900/40' : 'border-sky-200/80 bg-white/80'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>SOC</p>
                                <p className={`mt-1 text-sm font-semibold leading-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{details.soc || '--:--'}</p>
                            </div>
                            <div className={`rounded-lg border px-4 py-3 ${darkMode ? 'border-sky-400/20 bg-slate-900/40' : 'border-sky-200/80 bg-white/80'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Response</p>
                                <p className={`mt-1 text-sm font-semibold leading-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{observation?.response || '--:--'}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={`mt-2 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
                            <div className={`mb-1 rounded-xl border p-4 ${darkMode ? 'border-sky-500/30 bg-sky-500/10' : 'border-sky-200 bg-sky-50/50'}`}>
                                <dt className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>
                                    Inspector Remark
                                </dt>
                                <dd className={`mt-2 text-sm font-medium leading-relaxed ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {observation?.remark || '--:--'}
                                </dd>
                            </div>

                            {pifDetails && (
                                <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${darkMode ? 'border-slate-700/60 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
                                    <dt className={`shrink-0 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        PIF:
                                    </dt>
                                    <dd className={`truncate text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                                        {pifDetails}
                                    </dd>
                                </div>
                            )}
                        </div>
                        <InlineOperatorComments
                            details={details}
                            darkMode={darkMode}
                            files={files || []}
                            onCommentGenerated={onCommentGenerated}
                        />
                    </div>
                </div>
            )}
        </article>
    );
};

const InspectionDetails = ({ darkMode, inspectionId }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [getDetails, { data: response, isLoading, isError }] = useGetInspectionDetailsMutation();
    const { data: allfiles } = useGetAllFilesQuery(user?.id, { skip: !user?.id });
    
    const [latestGeneratedComments, setLatestGeneratedComments] = useState({});
    const loadDetails = useCallback(async () => {
        const result = await getDetails(inspectionId);
        setLatestGeneratedComments({});
        return result;
    }, [getDetails, inspectionId]);

    const handleCommentGenerated = useCallback((detailsId, comment) => {
        setLatestGeneratedComments((current) => ({ ...current, [detailsId]: comment }));
    }, []);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    const inspection = response?.inspection || {};
    const rawItems = response?.data?.items || (response?.data ? [response.data] : []);
    const detailItems = [...rawItems].sort((a, b) => a.id - b.id);

    const panelClass = darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white';
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

    const formatDate = (value) => {
        if (!value) return 'Date unavailable';

        return new Intl.DateTimeFormat('en', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(`${value}T00:00:00`));
    };

    const formattedDate = formatDate(inspection?.inspection_date);

    return (
        <section className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-[#111827]' : 'bg-slate-100'}`}>
            <style>{`
                .cube-spinner { position: relative; transform-style: preserve-3d; animation: inspection-cube-spin 2s infinite ease; }
                .cube-spinner > div { position: absolute; inset: 0; background: rgba(14, 165, 233, 0.15); border: 2px solid #0ea5e9; }
                .cube-spinner div:nth-child(1) { transform: translateZ(-20px) rotateY(180deg); }
                .cube-spinner div:nth-child(2) { transform: rotateY(-270deg) translateX(50%); transform-origin: top right; }
                .cube-spinner div:nth-child(3) { transform: rotateY(270deg) translateX(-50%); transform-origin: center left; }
                .cube-spinner div:nth-child(4) { transform: rotateX(90deg) translateY(-50%); transform-origin: top center; }
                .cube-spinner div:nth-child(5) { transform: rotateX(-90deg) translateY(50%); transform-origin: bottom center; }
                .cube-spinner div:nth-child(6) { transform: translateZ(20px); }
                @keyframes inspection-cube-spin {
                    0% { transform: rotate(45deg) rotateX(-25deg) rotateY(25deg); }
                    50% { transform: rotate(45deg) rotateX(-385deg) rotateY(25deg); }
                    100% { transform: rotate(45deg) rotateX(-385deg) rotateY(385deg); }
                }
            `}</style>
            <div className={`mx-auto rounded-2xl border ${panelClass}`}>
                {/* Top Toolbar */}
                <div className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS)} aria-label="Back to inspections" title="Back to inspections" className={`rounded-lg p-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{inspection?.vessel?.name} - {formattedDate}</h1>
                            <p className={`mt-1 text-sm ${mutedTextClass}`}>IMO #{inspection?.vessel?.imo}</p>
                        </div>
                    </div>
                    <button type="button" onClick={loadDetails} disabled={isLoading} aria-label="Refresh inspection details" title="Refresh inspection details" className={`rounded-lg p-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-50`}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {isLoading && (
                        <div className={`flex min-h-48 flex-col items-center justify-center gap-3 ${mutedTextClass}`}>
                            <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                            <p className="text-sm">Loading inspection details...</p>
                        </div>
                    )}

                    {!isLoading && isError && (
                        <div className={`flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed ${darkMode ? 'border-rose-400/30 text-rose-300' : 'border-rose-200 text-rose-600'}`}>
                            <AlertCircle className="h-7 w-7" />
                            <p className="text-sm">Unable to load inspection details.</p>
                            <button type="button" onClick={loadDetails} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-400">
                                <RefreshCw className="h-4 w-4" />
                                Try again
                            </button>
                        </div>
                    )}

                    {!isLoading && !isError && detailItems.length > 0 && (
                        <div className="space-y-4">
                            {detailItems.map((details) => (
                                <InspectionAccordionItem
                                    key={details.id}
                                    details={details}
                                    darkMode={darkMode}
                                    files={allfiles?.data?.rows || []}
                                    latestGeneratedComment={latestGeneratedComments[details.id]}
                                    onCommentGenerated={(comment) => handleCommentGenerated(details.id, comment)}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && !isError && detailItems.length === 0 && (
                        <div className={`flex min-h-48 items-center justify-center text-sm ${mutedTextClass}`}>
                            No details found for this inspection.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default InspectionDetails;