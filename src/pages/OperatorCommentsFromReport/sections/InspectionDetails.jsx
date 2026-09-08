import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ClipboardList, Loader2, RefreshCw, ChevronDown, ChevronUp, Sparkles, X, ChevronLeft, ChevronRight, FileText, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetInspectionDetailsMutation } from '../../../redux/services/inspectionsApi';
import { useFetchMutation } from '../../../redux/services/operatorCommentsApi';
import { ROUTES } from '../../../constants/routes';
import OperatorCommentsResultCard from '../components/OperatorCommentsResultCard';

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
];

const InlineOperatorComments = ({ details, darkMode }) => {
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
    const existingComment = comments[selectedCommentIndex];
    const comment = generatedComment || existingComment;
    const isGenerating = isLoading || isRegenerating;
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
                findings_id: details.id,
            }).unwrap();
            setGeneratedComment(response?.data || response);
            setOperatorFeedback('');
        } catch (error) {
            setErrorMessage(error?.data?.message || 'Failed to generate operator comments. Please try again.');
        }
    };

    if (comment) {
        return (
            <div className={`relative mt-6 border-t pt-6 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
                {/* Section Header & Pagination */}
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h4 className={`text-sm font-semibold ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Operator Comments</h4>
                        {comment.name && (
                            <p className={`mt-1 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {comment.name} {comment.date ? `• ${comment.date}` : ''}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!generatedComment && comments.length > 1 && (
                            <div className={`flex items-center gap-1 rounded-lg border p-1 ${darkMode ? 'border-slate-700/60 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                                <button type="button" onClick={() => setSelectedCommentIndex((current) => Math.max(0, current - 1))} disabled={selectedCommentIndex === 0} aria-label="Latest operator comment" title="Latest operator comment" className={`rounded-md p-1 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-30`}><ChevronLeft className="h-4 w-4" /></button>
                                <span className={`px-2 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedCommentIndex + 1} / {comments.length}</span>
                                <button type="button" onClick={() => setSelectedCommentIndex((current) => Math.min(comments.length - 1, current + 1))} disabled={selectedCommentIndex === comments.length - 1} aria-label="Previous generated operator comment" title="Previous generated operator comment" className={`rounded-md p-1 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} disabled:opacity-30`}><ChevronRight className="h-4 w-4" /></button>
                            </div>
                        )}
                        {generatedComment && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">Latest generated</span>}
                    </div>
                </div>

                {/* VIEW SECTION: The Generated Content */}
                <div className={`space-y-5 rounded-xl border p-5 ${darkMode ? 'border-slate-700/60 bg-slate-800/20' : 'border-slate-200 bg-white shadow-sm'}`}>

                    {/* Feedback Display */}
                    <div className={`rounded-lg border-l-4 px-4 py-3 ${darkMode ? 'border-sky-500/70 bg-slate-900/50' : 'border-sky-500 bg-sky-50/70'}`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>
                            Operator feedback
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
                    {comment?.sources && comment?.sources.length > 0 && (
                        <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-700/60 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'}`}>
                            <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <BookOpen className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                Referenced Sources
                            </h3>
                            <div className="custom-scrollbar max-h-[250px] space-y-3 overflow-y-auto pr-2">
                                {comment?.sources.map((src, idx) => (
                                    <div key={idx} className={`rounded-lg border p-3.5 text-sm transition-colors ${darkMode ? 'border-slate-700/50 bg-[#1a2233] hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
                                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-medium text-sky-500">
                                                <FileText className="h-3.5 w-3.5" />
                                                {src.ref}
                                            </span>
                                        </div>
                                        <p className={`mb-2 truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>File: {src.filename}</p>
                                        <p className={`whitespace-pre-wrap border-l-2 pl-3 text-xs leading-relaxed italic ${darkMode ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700'}`}>
                                            "{src.snippet}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTION SECTION: Regenerate Form */}
                <div className={`relative mt-4 rounded-xl border p-5 ${darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200 bg-slate-50/80'}`}>
                    {isGenerating && (
                        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl backdrop-blur-sm ${darkMode ? 'bg-[#111827]/90' : 'bg-white/90'}`}>
                            <div className="cube-spinner h-10 w-10">
                                {Array.from({ length: 6 }, (_, index) => <div key={index} />)}
                            </div>
                            <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Operator comments will be displayed once the generation process is complete.</p>
                        </div>
                    )}
                    <label htmlFor={`operator-feedback-${details.id}`} className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Need changes? <span className="font-normal normal-case opacity-70">(Provide new feedback to regenerate)</span>
                    </label>
                    <textarea
                        id={`operator-feedback-${details.id}`}
                        value={operatorFeedback}
                        onChange={(event) => setOperatorFeedback(event.target.value)}
                        rows={3}
                        placeholder="Add context, correct the timeline, or provide specific instructions..."
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
                <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg backdrop-blur-sm ${darkMode ? 'bg-[#111827]/90' : 'bg-white/90'}`}>
                    <div className="cube-spinner h-10 w-10">
                        {Array.from({ length: 6 }, (_, index) => <div key={index} />)}
                    </div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Operator comments will be displayed once the generation process is complete.</p>
                    {/* <p className={`text-xs ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>{ANALYSIS_LOADING_MESSAGES[messageIndex]}</p> */}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                    <h4 className={`text-sm font-semibold ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>Operator Comments</h4>
                    <p className={`mt-1 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No operator comments generated.</p>
                </div>
                <div>
                    <label htmlFor={`operator-feedback-${details.id}`} className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Operator feedback <span className="font-normal opacity-70">(optional)</span></label>
                    <textarea id={`operator-feedback-${details.id}`} value={operatorFeedback} onChange={(event) => setOperatorFeedback(event.target.value)} rows={3} placeholder="Your response to this observation..." className={`mt-2 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${darkMode ? 'border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`} />
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
            // const response = {
            //     "success": true,
            //     "message": "Operator comment analyzed and saved successfully.",
            //     "data": {
            //         "id": 18,
            //         "user_id": 7,
            //         "question_number": "10.4.2",
            //         "category": "Hardware",
            //         "response_type": "Observable or detectable deficiency",
            //         "comment": "The last lube oil analysis for mooring winch 3 indicated a critical (red) status due to low viscosity. The laboratory requested the vessel to confirm the oil type on the label. The vessel had sent a new sample ashore for analysis.",
            //         "status": "True",
            //         "error_log": null,
            //         "immediate_cause": "The most recent lube oil analysis for mooring winch 3 returned a critical (red) status for low viscosity, and the laboratory requested confirmation of the oil type recorded on the tank/container label. The vessel had already drawn and sent ashore a new sample for further analysis at the time of inspection.",
            //         "root_cause": "The critical status has not yet been resolved because the laboratory's request to confirm the labelled oil type has not been closed out, leaving the possibility that an incorrect grade or type of oil is in use in mooring winch 3 unconfirmed. This is a verification gap in the vessel's response to an off-spec analysis result rather than a failure of the sampling programme itself, which had detected and flagged the anomaly as intended.",
            //         "corrective_action": "The Chief Engineer will confirm the oil type and grade shown on the mooring winch 3 gearcase label against the company's approved lubricant list and will advise the laboratory accordingly to support their assessment of the low viscosity result. A new sample has been sent ashore for analysis, and the Technical Superintendent will review the outcome once the laboratory report is received before determining whether the oil requires changing over.",
            //         "preventative_action": "The observation will be shared with the internal auditors for verification during the vessel's internal audit and inspections, with particular attention to the timeliness of follow-up action on critical (red) oil analysis results. The Technical Superintendent will verify closure of the mooring winch 3 oil analysis anomaly, including confirmation of oil type and any subsequent laboratory findings, during the next ship visit or superintendent review. Should the confirmed oil type or condition require a change of lubricant, this will be actioned and recorded through the planned maintenance system.",
            //         "provider": "claude",
            //         "question_bank_hit": true,
            //         "confidence": 0.55,
            //         "question_info": {
            //             "title": "10.4.2. Did the vessel operator subscribe to a lube oil and hydraulic oil analysis program and was a procedure in place to act on the results and tr"
            //         },
            //         "assumptions": [
            //             "That the mooring winch 3 gearcase carries a label identifying the oil type, allowing the Chief Engineer to check it against records.",
            //             "That the change of lubricant, if required, has not yet occurred and remains contingent on laboratory confirmation.",
            //             "That no interim restriction on winch use was applied; none is evidenced in the observation."
            //         ],
            //         "section_sources": [
            //             {
            //                 "section": "Immediate Cause",
            //                 "source_refs": [
            //                     "Q-Source 2"
            //                 ],
            //                 "basis": "Q-Source 2 defines critical/warning status follow-up as expected evidence, confirming the red status and lab query are the relevant facts."
            //             },
            //             {
            //                 "section": "Root Cause",
            //                 "source_refs": [
            //                     "Rule-Source 7",
            //                     "Q-Source 2"
            //                 ],
            //                 "basis": "Rule-Source 7 states off-spec oil consumption is not permitted until confirmed with the office, showing the confirmation step is the pending control."
            //             },
            //             {
            //                 "section": "Corrective Action",
            //                 "source_refs": [
            //                     "Rule-Source 7",
            //                     "Rule-Source 5"
            //                 ],
            //                 "basis": "Rule-Source 7 and 5 describe confirming oil type/grade and TS-led anomaly investigation as the required company steps following a critical result."
            //             },
            //             {
            //                 "section": "Preventative Action",
            //                 "source_refs": [
            //                     "Rule-Source 5",
            //                     "Rule-Source 8"
            //                 ],
            //                 "basis": "Rule-Source 5 and 8 assign TS oversight of grade verification and remedial action on a 3-monthly analysis cycle, grounding the verification loop."
            //             }
            //         ],
            //         "sources": [
            //             {
            //                 "stage": 1,
            //                 "ref": "Q-Source 1",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "I cannot find this information in the documents.\n\n> **Context Summary:** Provided context covers SMM manuals, filing structure, and contingency references, but contains no SIRE 2.0 question 10.4.2 details.\n\n### Requirement Reference (Partial)\n* **SIRE 2.0 Q10.4.2 text** not present in context.\n* **Expected evidence criteria** not documented here.\n* **Hardware/human/process scope** unavailable in sources.\n\n### Available Related References\n* **Investigation evidence process** detailed in SMM Ch.8.\n* **PMS/critical equipment records** logged in Company ERP.\n* **Class/survey certificates** held as hardcopy + class website.\n\n### Source Indexes\n`SMM/01` | `COM` | `SIRE 2.0 (not present)`"
            //             },
            //             {
            //                 "stage": 1,
            //                 "ref": "Q-Source 2",
            //                 "filename": "questions.xlsx",
            //                 "role": "question_library",
            //                 "role_label": "SIRE 2.0 question library",
            //                 "supports": [
            //                     "Immediate Cause",
            //                     "Root Cause",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 1,
            //                 "snippet": "QUESTION 10.4.2: Did the vessel operator subscribe to a lube oil and hydraulic oil analysis program and was a procedure in place to act on the results and trends identified by the analysis?\n\nSHORT TITLE: Lube oil and hydraulic oil analysis program\n\nROVIQ SEQUENCE: Chief Engineer's Office\n\nOBJECTIVE:\nTo ensure that the quality of lube oils and hydraulic oils is monitored, and action taken when necessary to avoid machinery damage.\n\nEXPECTED EVIDENCE:\n• The lubricating and hydraulic oil analysis programme information documenting the oils subject to analysis.\n• The lubricating and hydraulic oil analysis records for the previous two cycles of analysis.\n• Where analysis had resulted in a “critical” (red) or “warning” (amber) status, any follow up communications\nfrom shore-based management.\n• Maintenance records to demonstrate that the recommended or instructed actions had been taken to correct\nany “critical” or “warning” status.\n\nGROUNDS FOR NEGATIVE OBSERVATION:\n• The vessel did not have a programme for the routine sampling and analysis of lubricating and hydraulic oils.\n• The accompanying officer was unfamiliar with the company procedure for managing the lubricating and\nhydraulic oil a"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 1",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "I cannot find this information in the documents.\n\n> **Context Summary:** Context lists lube oil analysis filing and reference forms but lacks SIRE 2.0 Q10.4.2 text, scope, or expected evidence criteria.\n\n### Requirement Reference (Partial)\n* **SIRE 2.0 Q10.4.2 text** not present in context.\n* **Expected evidence criteria** not documented here.\n* **Hardware/human/process split** unavailable in sources.\n\n### Related Lube Oil Data (Context)\n* **LUB Oil Analysis reports** filed (File No 8).\n* **Lubricant report** referenced as TEC01.\n* **Lub Oil Chart** maintained onboard.\n* **Fuel/Lubs analysis** stored in Company ERP.\n\n### Source Indexes\n`SMM/02` | `COM/11` | `SIRE 2.0 (not present)`"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 2",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "I cannot find this information in the documents.\n\n> **Context Summary:** Context references lube oil analysis reporting forms and MARPOL records but lacks specific statutory rules on mooring winch lube oil critical viscosity status.\n\n### Search Findings\n* **No statutory rule** on winch lube viscosity found.\n* **Critical red status handling** not documented in context.\n* **Oil type label confirmation** procedure absent here.\n\n### Available Related References\n* **Lub Oil Analysis reports** filed (File No 8, TEC01).\n* **Lubricant report TEC01** logged with analysis records.\n* **Lubrication of Machinery** cited SMM 4.2.14.\n* **Oil sample documentation** retained onboard (SMM Ch.4).\n\n### Source Indexes\n`SMM/04` | `SMM/02` | `SOLAS / MARPOL (not present)`"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 3",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "I cannot find this information in the documents.\n\n> **Context Summary:** Context details company lube oil sampling and analysis procedures but lacks specific OCIMF/ISGOTT guidance on mooring winch critical viscosity status.\n\n### Search Findings\n* **No OCIMF/ISGOTT text** on winch lube viscosity found.\n* **Critical status recommended practice** absent from context.\n* **Label/type confirmation guidance** not in industry sources here.\n\n### Related Company Procedure (Context)\n* **Quarterly LO sampling** required for all machinery in use.\n* **Designated laboratory** specified by Company.\n* **Sampling per lab instructions** using provided sample bottles.\n* **Landing report TEC/36** filled for landed samples.\n* **Analysis reports** electronically transmitted to ship.\n* **LO Analysis reports filed** under File No 8 (TEC01).\n\n### Source Indexes\n`ISGOTT` | `OCIMF (not present)` | `SMM/04`"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 4",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "I cannot find this information in the documents.\n\n> **Context Summary:** Context covers lube oil analysis filing and inventory management, but contains no TMSA KPI or best practice element mapping for mooring winch lube status.\n\n### Search Findings\n* **No TMSA KPI content** located in context.\n* **Best practice element** not defined here.\n* **Mooring winch lube analysis** unmatched to element.\n\n### Available Related References\n* **Lub Oil analysis filed** in ERP (Document Management).\n* **Fuel/Lub/Boiler Water** records under vessel documents.\n* **PMS/critical equipment** running hours in ERP (PMS).\n\n### Source Indexes\n`COM/11` | `TMSA (not present)`"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 5",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "> **Context Summary:** Company procedures define Chief Engineer and Technical Superintendent responsibilities for lube oil sampling, analysis, and anomaly investigation.\n\n### Sampling & Analysis Procedure\n* **Quarterly LO sampling** of all machinery in use.\n* **Designated laboratory** specified by Company.\n* **C/E ensures sampling** per lab instructions, provided bottles.\n* **Transport via couriers** landed with agents' instructions.\n* **Landing report TEC/36** completed for landed samples.\n* **Reports transmitted electronically** to the ship.\n\n### Responsibilities & Anomaly Action\n* **TS verifies correct grades** of oils used on vessels.\n* **TS investigates anomalies** in routine analysis reports.\n* **Particle analysis attention** flags abnormal wear/malfunction.\n* **Analysis at 3-monthly intervals** monitored by TS.\n* **Remedial action taken** as necessary by TS.\n\n### Recording & Filing\n* **LO Analysis reports filed** (File No 8, TEC01).\n* **Fuel/Lub analysis stored** in Company ERP.\n* **Lub Oil Chart maintained** onboard and in office.\n\n### Source Indexes\n`SMM/04` | `COM/04` | `COM/11`"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 6",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "> **Context Summary:** Company incident investigation defines a three-tier cause hierarchy applicable to hardware failures, with structured corrective/preventive action.\n\n### Cause Hierarchy (Hardware Focus)\n* **Immediate/Direct Cause** Use of defective machinery.\n* **Direct cause examples** Failure to follow rules, poor housekeeping.\n* **Basic/Underlying Cause** Inadequate maintenance or worn equipment.\n* **Management Control Failure** Inadequate PMS or procedures.\n* **Ask WHY repeatedly** Reach root/basic cause.\n\n### Machinery Failure Investigation\n* **Check maintenance period** for the machine.\n* **Confirm last overhaul** and verify record exists.\n* **Collect machinery manuals** and engineering drawings.\n* **Review PMS schedules** and maintenance records.\n* **Check warning signs** on failed machinery.\n* **Assess fatigue** as contributing factor.\n\n### Corrective / Preventive Action\n* **Determine action** identifying true root cause.\n* **Investigate all incidents** including near misses.\n* **Circulate Fleet alerts** tracked until implemented.\n* **Report includes timescale** for close-out.\n* **Recommend recurrence prevention** measures.\n\n### Source Indexes\n`SMM/01 Ch.8` | `Section "
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 7",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "> **Context Summary:** Company procedures define lube oil sampling, off-spec handling, and corrective steps applicable to critical analysis results.\n\n### Immediate Correction Steps\n* **Confirm oil type** on tank/label as lab requested.\n* **Redraw fresh sample** per lab instructions, correct bottles.\n* **Send sample ashore** via courier with agent instructions.\n* **Complete landing report** TEC/36 for landed samples.\n\n### Off-Spec / Critical Handling\n* **Consumption not permitted** if analysis indicates off-spec.\n* **Change over fluid** only after confirming with office.\n* **Isolate affected system** to prevent contamination.\n* **Maintain detailed records** of movement and machinery issues.\n\n### Verification & Follow-up\n* **Investigate anomalies** flagged in routine analysis (TS duty).\n* **Take remedial action** per particle/wear trend analysis.\n* **Transmit corrected report** electronically back to ship.\n\n### Source Indexes\n`SMM/04` | `COM/04` | `TEC/36`"
            //             },
            //             {
            //                 "stage": 2,
            //                 "ref": "Rule-Source 8",
            //                 "filename": "SMS knowledge base (unattributed)",
            //                 "role": "company_ims",
            //                 "role_label": "Operator's own IMS / SMS procedure",
            //                 "supports": [
            //                     "Root Cause",
            //                     "Corrective Action",
            //                     "Preventative Action"
            //                 ],
            //                 "score": 0.5,
            //                 "all_sources": [],
            //                 "snippet": "> **Context Summary:** Company procedures define quarterly lube oil sampling, laboratory analysis, and PMS-based verification for machinery in use.\n\n### PMS & Sampling Task\n* **Quarterly LO sampling** for all machinery in use.\n* **Sample per lab instructions** using provided bottles.\n* **Draw samples correctly** into laboratory sample bottles.\n* **Transport via courier** landed with clear forwarding instructions.\n* **Landing report TEC/36** completed for landed samples.\n\n### Analysis Verification & Follow-up\n* **Analysis reports transmitted** electronically to ship.\n* **Investigate anomalies** indicated in routine analysis reports.\n* **Particle analysis attention** trends indicate abnormal wear.\n* **3-monthly interval** analysis monitored by TS.\n* **Remedial action taken** for any indicated abnormality.\n\n### Records & Filing\n* **LO Analysis reports filed** File No 8 (TEC01).\n* **Lub Oil chart maintained** onboard and in office.\n* **Correct grade verification** TS confirms grades used.\n\n### Source Indexes\n`SMM/04` | `COM/04` | `SMM/02`"
            //             }
            //         ],
            //         "updatedAt": "2026-09-07T07:35:50.392Z",
            //         "createdAt": "2026-09-07T07:35:50.392Z"
            //     }
            // }
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

const InspectionAccordionItem = ({ details, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const observation = details.observation;
    const question = observation?.inspection_question?.question;
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

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
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:mt-0 ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </button>

            {/* Accordion Body (Full Details) */}
            {isOpen && (
                <div className={`border-t p-5 sm:p-6 ${darkMode ? 'border-slate-700/60 bg-[#111827]/50' : 'border-slate-200 bg-white'}`}>
                    {/* Unified Details Block */}
                    <div className="rounded-lg bg-sky-500/5 p-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className={`rounded-lg border px-4 py-3 ${darkMode ? 'border-sky-400/20 bg-slate-900/40' : 'border-sky-200/80 bg-white/80'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>NOC</p>
                                <p className={`mt-1 text-sm font-semibold leading-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{details.noc || '--:--'}</p>
                            </div>
                            <div className={`rounded-lg border px-4 py-3 ${darkMode ? 'border-sky-400/20 bg-slate-900/40' : 'border-sky-200/80 bg-white/80'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>SOC</p>
                                <p className={`mt-1 text-sm font-semibold leading-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{details.soc || '--:--'}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={`mt-5 border-t pt-5 ${darkMode ? 'border-slate-700/50' : 'border-slate-200/80'}`}>
                            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                                <DetailValue darkMode={darkMode} label="Response" value={observation?.response} />
                                <DetailValue darkMode={darkMode} label="Remark" value={observation?.remark} />
                                {pifDetails && (
                                    <DetailValue darkMode={darkMode} label="PIF Details" value={pifDetails} />
                                )}
                            </dl>
                        </div>
                        <InlineOperatorComments details={details} darkMode={darkMode} />
                    </div>
                </div>
            )}
        </article>
    );
};

const InspectionDetails = ({ darkMode, inspectionId }) => {
    const navigate = useNavigate();
    const [getDetails, { data: response, isLoading, isError }] = useGetInspectionDetailsMutation();
    const loadDetails = useCallback(() => getDetails(inspectionId), [getDetails, inspectionId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    const detailItems = response?.data?.items || (response?.data ? [response.data] : []);
    const inspection = response?.inspection || {};

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