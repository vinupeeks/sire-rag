import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardList, Eye, FileText, Loader2, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInspectionDetailsMutation } from '../../../redux/services/inspectionsApi';
import { useGetAllFilesQuery } from '../../../redux/services/smsApi';
import { ROUTES } from '../../../constants/routes';
import { BASEURL } from '../../../config/config';
import OperatorCommentsResultCard from '../components/OperatorCommentsResultCard';
import ReactMarkdown from 'react-markdown';

const formatDate = (value) => {
    if (!value) return 'Date unavailable';

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
};

const normalizeFilePath = (filePath) => String(filePath || '')
    .replace(/^[\\/]+/, '')
    .replace(/\\/g, '/')
    .toLowerCase();

const isEnabledFileFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';

const SourceTypeBadge = ({ darkMode, source, files }) => {
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

    const sourceType = isEnabledFileFlag(matchedFile.common) || isEnabledFileFlag(matchedFile.ocimf)
        ? 'Common file'
        : 'Company file';

    return (
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceType === 'Common file'
            ? (darkMode ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
            : (darkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-700')
            }`}>
            {sourceType}
        </span>
    );
};

const MetadataBadge = ({ darkMode, value, accent = 'slate' }) => {
    const accentClasses = {
        amber: darkMode ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700',
        sky: darkMode ? 'border-sky-400/30 bg-sky-400/10 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700',
        slate: darkMode ? 'border-slate-600 bg-slate-800/70 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600',
    };

    return (
        <span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${accentClasses[accent]}`}>
            <span className="truncate font-semibold">{value || 'N/A'}</span>
        </span>
    );
};

const ArchivedInspectionItem = ({ details, darkMode, files = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCommentIndex, setSelectedCommentIndex] = useState(0);
    const [isSourcesOpen, setIsSourcesOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const observation = details.observation;
    const question = observation?.inspection_question?.question;
    const existingComments = Array.isArray(details.comments) ? details.comments : [];
    const comment = existingComments[selectedCommentIndex];
    const visibleSources = (comment?.sources || []).filter((source) => (
        !source?.snippet?.trim().toLowerCase().startsWith('i cannot find')
    ));

    const getSourcePreviewUrl = (source) => {
        const sourcePath = source?.source_details?.find((sourceDetail) => sourceDetail?.path)?.path;
        if (!sourcePath) return null;

        const normalizedPath = sourcePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
        return `${BASEURL.replace(/\/$/, '')}/${normalizedPath}`;
    };

    const showPreviousComment = () => setSelectedCommentIndex((current) => Math.max(0, current - 1));
    const showNextComment = () => setSelectedCommentIndex((current) => Math.min(existingComments.length - 1, current + 1));

    return (
        <article className={`rounded-xl border ${darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white'}`}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className={`flex w-full items-start justify-between gap-4 rounded-xl p-5 text-left transition-colors sm:items-center ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
            >
                <div className="flex-1 pr-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <MetadataBadge darkMode={darkMode} value={details.type || 'Inspection item'} accent="amber" />
                        <MetadataBadge darkMode={darkMode} value={question?.tag || 'Archived'} accent="sky" />
                        <MetadataBadge darkMode={darkMode} value={details.category} />
                    </div>
                    <h3 className={`line-clamp-2 text-sm font-semibold leading-relaxed sm:text-md ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {question?.question_no} - {question?.question || details.noc || 'Inspection item'}
                    </h3>
                </div>
                <div className="mt-1 flex shrink-0 items-center gap-2 sm:mt-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${existingComments.length > 0
                        ? (darkMode ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
                        : (darkMode ? 'border-slate-600 bg-slate-800/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500')}`}>
                        {existingComments.length > 0 && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {existingComments.length} {existingComments.length === 1 ? 'Version Generated' : 'Versions Generated'}
                    </span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className={`border-t p-5 sm:p-6 ${darkMode ? 'border-slate-700/60 bg-[#111827]/50' : 'border-slate-200 bg-white'}`}>
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

                        <div className={`mt-2 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
                            <div className={`mb-1 rounded-xl border p-4 ${darkMode ? 'border-sky-500/30 bg-sky-500/10' : 'border-sky-200 bg-sky-50/50'}`}>
                                <dt className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Inspector Remark</dt>
                                <dd className={`mt-2 text-sm font-medium leading-relaxed ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{observation?.remark || '--:--'}</dd>
                            </div>

                            {(details.pif_no || details.pif_description) && (
                                <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${darkMode ? 'border-slate-700/60 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
                                    <dt className={`shrink-0 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>PIF:</dt>
                                    <dd className={`truncate text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{`${details.pif_no || 'N/A'} - ${details.pif_description || 'N/A'}`}</dd>
                                </div>
                            )}
                        </div>
                    </div>

                    {comment ? (
                        <div className={`mt-5 border-t pt-5 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h4 className={`text-sm font-semibold ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Operator Comment</h4>
                                    <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{comment.name || `Comment ${selectedCommentIndex + 1}`}</p>
                                </div>
                                {existingComments.length > 1 && (
                                    <div className={`flex items-center gap-1 rounded-lg border p-1 ${darkMode ? 'border-slate-700/60 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                                        <button type="button" onClick={showPreviousComment} disabled={selectedCommentIndex === 0} aria-label="Previous operator comment" title="Previous operator comment" className={`rounded-md p-1 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-30`}><ChevronLeft className="h-4 w-4" /></button>
                                        <span className={`px-2 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedCommentIndex + 1} / {existingComments.length}</span>
                                        <button type="button" onClick={showNextComment} disabled={selectedCommentIndex === existingComments.length - 1} aria-label="Next operator comment" title="Next operator comment" className={`rounded-md p-1 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-30`}><ChevronRight className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <OperatorCommentsResultCard darkMode={darkMode} title="Immediate Cause" resultKey="immediateCause" content={comment.immediateCause || comment.immediate_cause} />
                                <OperatorCommentsResultCard darkMode={darkMode} title="Root Cause" resultKey="rootCause" content={comment.rootCause || comment.root_cause} />
                                <OperatorCommentsResultCard darkMode={darkMode} title="Corrective Action" resultKey="correctiveAction" content={comment.correctiveAction || comment.corrective_action} />
                                <OperatorCommentsResultCard darkMode={darkMode} title="Preventative Action" resultKey="preventativeAction" content={comment.preventativeAction || comment.preventative_action} />
                            </div>

                            {visibleSources.length > 0 && (
                                <div className={`mt-4 rounded-xl border px-4 p-2 ${darkMode ? 'border-slate-700/60 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className={`flex items-center gap-2 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <BookOpen className="h-4 w-4" />
                                            Reference Sources ({visibleSources.length})
                                        </h3>
                                        <button type="button" onClick={() => setIsSourcesOpen((current) => !current)} aria-label={isSourcesOpen ? 'Hide sources' : 'View sources'} title={isSourcesOpen ? 'Hide sources' : 'View sources'} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}>
                                            <Eye className="h-4 w-4" />
                                            <span>{isSourcesOpen ? 'Hide Sources' : 'View Sources'}</span>
                                        </button>
                                    </div>
                                    {isSourcesOpen && (
                                        <div className={`mt-3 space-y-3 border-t pt-3 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                                            {visibleSources.map((source, index) => (
                                                <div key={source.filename || source.ref || index} className={`rounded-lg border p-3.5 text-sm transition-colors ${darkMode ? 'border-slate-700/50 bg-[#1a2233] hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
                                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                        {getSourcePreviewUrl(source) ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewUrl(getSourcePreviewUrl(source))}
                                                                title={`Open ${source.filename || 'source document'}`}
                                                                className="inline-flex max-w-full items-center gap-1.5 rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-left font-medium text-sky-500 transition-colors hover:border-sky-400/50 hover:bg-sky-500/20"
                                                            >
                                                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{source.filename || source.ref || `Source ${index + 1}`}</span>
                                                                <SourceTypeBadge darkMode={darkMode} source={source} files={files} />
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex max-w-full items-center gap-1.5 rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-medium text-sky-500">
                                                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{source.filename || source.ref || `Source ${index + 1}`}</span>
                                                                <SourceTypeBadge darkMode={darkMode} source={source} files={files} />
                                                            </span>
                                                        )}
                                                    </div>
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
                                                        {source.snippet || '--:--'}
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
                    ) : (
                        <p className={`mt-5 border-t pt-5 text-sm ${darkMode ? 'border-slate-700/50 text-slate-400' : 'border-slate-200/80 text-slate-500'}`}>No operator comments are available for this inspection item.</p>
                    )}
                </div>
            )}
        </article>
    );
};

const ArchivedInspectionDetails = ({ darkMode, inspectionId }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [getDetails, { data: response, isLoading, isError }] = useGetInspectionDetailsMutation();
    const { data: allfiles } = useGetAllFilesQuery(user?.id, { skip: !user?.id });

    const loadDetails = useCallback(() => getDetails(inspectionId), [getDetails, inspectionId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    const inspection = response?.inspection || {};
    const rawItems = response?.data?.items || (response?.data ? [response.data] : []);
    const detailItems = [...rawItems].sort((a, b) => a.id - b.id);

    const panelClass = darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white';
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <section className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-[#111827]' : 'bg-slate-100'}`}>
            <div className={`mx-auto rounded-2xl border ${panelClass}`}>
                <div className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_HISTORY)} aria-label="Back to inspection history" title="Back to inspection history" className={`rounded-lg p-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{inspection?.vessel?.name || 'Archived inspection'} - {formatDate(inspection?.inspection_date)}</h1>
                            <p className={`mt-1 text-sm ${mutedTextClass}`}>Archived inspection details</p>
                        </div>
                    </div>
                    <button type="button" onClick={loadDetails} disabled={isLoading} aria-label="Refresh archived inspection details" title="Refresh archived inspection details" className={`rounded-lg p-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-50`}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading && <div className={`flex min-h-48 flex-col items-center justify-center gap-3 ${mutedTextClass}`}><Loader2 className="h-7 w-7 animate-spin text-sky-500" /><p className="text-sm">Loading archived inspection details...</p></div>}
                    {!isLoading && isError && <div className={`flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed ${darkMode ? 'border-rose-400/30 text-rose-300' : 'border-rose-200 text-rose-600'}`}><AlertCircle className="h-7 w-7" /><p className="text-sm">Unable to load archived inspection details.</p><button type="button" onClick={loadDetails} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-400"><RefreshCw className="h-4 w-4" />Try again</button></div>}
                    {!isLoading && !isError && detailItems.length > 0 && <div className="space-y-4">{detailItems.map((details) => <ArchivedInspectionItem key={details.id} details={details} darkMode={darkMode} files={allfiles?.data?.rows || []} />)}</div>}
                    {!isLoading && !isError && detailItems.length === 0 && <div className={`flex min-h-48 items-center justify-center text-sm ${mutedTextClass}`}>No details found for this inspection.</div>}
                </div>
            </div>
        </section>
    );
};

export default ArchivedInspectionDetails;
