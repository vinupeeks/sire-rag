import React, { useState } from 'react';
import {
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Eye,
    AlertTriangle,
    Target,
    Wrench,
    ShieldCheck,
    BookOpen,
    FileText
} from 'lucide-react';
import ToolTabs from '../../components/layout/ToolTabs';
import { useFetchMutation } from '../../redux/services/operatorCommentsApi';

const categoryOptions = ["Process", "Human", "Hardware"];

const responseOptions = {
    Process: [
        "As expected – procedure and/or document present",
        "Largely as expected - procedure and/or document present",
        "Not as expected – procedure and/or document deficient"
    ],
    Human: [
        "As Expected",
        "Largely as Expected",
        "Not as Expected"
    ],
    Hardware: [
        "Observable or detectable deficiency",
        "Slight superficial deterioration"
    ]
};

const ResultCard = ({ title, icon, content, colorClass }) => (
    <div className="rounded-xl border border-slate-700/50 bg-[#111827] p-5 transition-all hover:border-slate-600/80">
        <div className={`mb-3 flex items-center gap-2 ${colorClass}`}>
            {icon}
            <h3 className="font-semibold uppercase tracking-wide text-sm">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{content}</p>
    </div>
);

const OperatorCommentsPage = () => {
    // Replaced 'login' with a more descriptive name for the mutation function
    const [submitComment, { isLoading }] = useFetchMutation();

    const [formData, setFormData] = useState({
        questionNo: '2.3.2',
        category: '',
        responseType: '',
        comment: '',
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [apiResponse, setApiResponse] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            if (field === 'category') {
                newData.responseType = '';
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!formData.category || !formData.responseType || !formData.comment || !formData.questionNo) {
        //     setStatus({ type: 'error', message: 'Please fill in all fields.' });
        //     return;
        // }

        setStatus({ type: '', message: '' });
        setApiResponse(null);

        try {
            // Execute the mutation and unwrap the result to catch errors properly
            // const response = await submitComment({
            //     category: formData.category,
            //     comment: formData.comment,
            //     question_number: formData.questionNo,
            //     response_type: formData.responseType,
            // }).unwrap();

            const response = {
                "success": true,
                "message": "Operator comment analyzed and saved successfully.",
                "data": {
                    "id": 1,
                    "user_id": 1,
                    "question_number": "4.3.2",
                    "category": "Human",
                    "response_type": "Not as Expected",
                    "comment": "Were the engineer officers familiar with the company procedures defining machinery space operating mode and, where required to be attended, the machinery space team composition during the various stages of a voyage, and were records available to confirm the machinery space had been operated accordingly?",
                    "status": "True",
                    "error_log": null,
                    "immediate_cause": "During the inspection, it was noted that the engineer officers were not adequately familiar with the company procedures regarding the machinery space operating mode and team composition. This lack of familiarity was due to insufficient communication of the procedures to the engineering staff prior to the voyage.",
                    "root_cause": "The management system did not effectively ensure that the company procedures defining machinery space operating modes and team composition were communicated and understood by the engineering officers. This gap in the familiarisation process allowed the immediate cause to persist.",
                    "corrective_action": "The company procedures regarding machinery space operating modes and team composition were reviewed and communicated to all engineering officers aboard. The finding is now closed as the crew has been briefed and confirmed their understanding of the procedures.",
                    "preventative_action": "The company has implemented a mandatory familiarisation program for all engineering officers to ensure they are well-versed in the procedures regarding machinery space operations. Additionally, a verification step has been added to the passage planning process to confirm that all relevant procedures are communicated to the engineering team prior to each voyage. This observation is to be circulated to the fleet.",
                    "provider": "openai",
                    "question_bank_hit": true,
                    "confidence": 1,
                    "question_info": {
                        "title": "4.3.2. Were the engineer officers familiar with the company procedures defining machinery space operating mode and, where required to be attended, "
                    },
                    "assumptions": [],
                    "section_sources": [
                        {
                            "section": "Immediate Cause",
                            "source_refs": [
                                "Q-Source 1"
                            ],
                            "basis": "Q-Source 1 emphasizes the need for engineer officers to be familiar with company procedures, which was not met during the inspection."
                        },
                        {
                            "section": "Root Cause",
                            "source_refs": [
                                "Q-Source 1"
                            ],
                            "basis": "Q-Source 1 highlights the requirement for effective communication of procedures, indicating a systemic gap in the familiarisation process."
                        },
                        {
                            "section": "Corrective Action",
                            "source_refs": [
                                "Q-Source 1"
                            ],
                            "basis": "Q-Source 1 specifies the need for records confirming compliance, which was addressed by reviewing and communicating the procedures to the crew."
                        },
                        {
                            "section": "Preventative Action",
                            "source_refs": [
                                "Q-Source 1"
                            ],
                            "basis": "Q-Source 1 suggests implementing procedures for communication and familiarisation, which led to the establishment of a mandatory program for engineering officers."
                        }
                    ],
                    "sources": [
                        {
                            "stage": 1,
                            "ref": "Q-Source 1",
                            "filename": "questions.xlsx",
                            "score": 1,
                            "snippet": "QUESTION 4.3.2: Were the engineer officers familiar with the company procedures defining machinery space operating mode and, where required to be attended, the machinery space team composition during the various stages of a voyage, and were records\navailable to confirm the machinery space had been operated accordingly?\n\nSHORT TITLE: Machinery space team composition\n\nROVIQ SEQUENCE: Engine Control Room, Bridge\n\nOBJECTIVE:\nTo ensure that the machinery space is adequately manned or monitored at all stages of a voyage or operation.\n\nEXPECTED EVIDENCE:\n• The company procedure that defined the required machinery space status during all stages of a voyage, including while at anchor, considering traffic density, proximity to navigational hazards and the state of visibility.\n• The company procedure that defined the required machinery space team composition considering traffic density, proximity to navigational hazards and the state of visibility and, during other operations such drifting, “at sea” STS operations, Dynamically Positioned (DP) cargo operations or underway stores / personnel transfer operations.\n• Engine Room Log Book, Engine Room Daily Order Book and any other supporting machi"
                        }
                    ],
                    "updatedAt": "2026-08-13T07:26:24.813Z",
                    "createdAt": "2026-08-13T07:26:24.813Z"
                }
            }

            setStatus({ type: 'success', message: 'Comment analyzed successfully!' });

            setApiResponse(response.data || response);

        } catch (error) {
            console.error('Submission error:', error);
            setStatus({
                type: 'error',
                message: error?.data?.message || 'Failed to submit comment. Please try again.'
            });
        }
    };

    return (
        <div className="flex h-screen flex-col bg-[#0f172a] text-slate-100">
            <ToolTabs />

            <div className="flex-1 overflow-auto bg-[#111827] p-6">
                <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700/60 bg-[#1a2233] p-6 shadow-2xl shadow-slate-950/20">
                    <div className="mb-6 border-b border-slate-700/60 pb-4">
                        <h1 className="text-xl font-semibold text-white">Operator Comments</h1>
                        <p className="mt-1 text-sm text-slate-400">Submit your inspection comments and review AI analysis.</p>
                    </div>

                    {status.message && (
                        <div className={`mb-6 flex items-center gap-2 rounded-lg p-4 text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Question No
                                </label>
                                <input
                                    type="text"
                                    value={formData.questionNo}
                                    onChange={(e) => handleInputChange('questionNo', e.target.value)}
                                    placeholder="e.g. 2.3.2"
                                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
                                >
                                    <option value="">— select —</option>
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Response Type
                                </label>
                                <select
                                    value={formData.responseType}
                                    onChange={(e) => handleInputChange('responseType', e.target.value)}
                                    disabled={!formData.category}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">— select —</option>
                                    {formData.category && responseOptions[formData.category]?.map((opt, idx) => (
                                        <option key={idx} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                Inspector Comment
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                placeholder="Enter detailed inspector comment here..."
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isLoading ? 'Analyzing...' : 'Submit & Analyze'}
                            </button>
                        </div>
                    </form>

                    {/* AI Analysis Results Section */}
                    {apiResponse && (apiResponse.result || apiResponse.immediate_cause) && (
                        <div className="mt-10 border-t border-slate-700/60 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">AI Analysis Report</h2>
                                    <p className="text-sm text-slate-400">
                                        {apiResponse.question_info?.title || apiResponse.question_number}
                                    </p>
                                </div>
                                {/* confidence */}
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Adjusted accessors to support both the nested PHP result or flattened Node result */}
                                {(apiResponse.result?.observation || apiResponse.observation) && (
                                    <div className="md:col-span-2">
                                        <ResultCard
                                            title="Observation"
                                            icon={<Eye className="h-4 w-4" />}
                                            content={apiResponse.result?.observation || apiResponse.observation}
                                            colorClass="text-sky-400"
                                        />
                                    </div>
                                )}
                                <ResultCard
                                    title="Immediate Cause"
                                    icon={<AlertTriangle className="h-4 w-4" />}
                                    content={apiResponse.result?.immediate_cause || apiResponse.immediate_cause}
                                    colorClass="text-amber-400"
                                />
                                <ResultCard
                                    title="Root Cause"
                                    icon={<Target className="h-4 w-4" />}
                                    content={apiResponse.result?.root_cause || apiResponse.root_cause}
                                    colorClass="text-rose-400"
                                />
                                <ResultCard
                                    title="Corrective Action"
                                    icon={<Wrench className="h-4 w-4" />}
                                    content={apiResponse.result?.corrective_action || apiResponse.corrective_action}
                                    colorClass="text-emerald-400"
                                />
                                <ResultCard
                                    title="Preventative Action"
                                    icon={<ShieldCheck className="h-4 w-4" />}
                                    content={apiResponse.result?.preventative_action || apiResponse.preventative_action}
                                    colorClass="text-indigo-400"
                                />
                            </div>

                            {/* Sources Section */}
                            {apiResponse.sources && apiResponse.sources.length > 0 && (
                                <div className="mt-6 rounded-xl border border-slate-700/60 bg-[#0f172a] p-5">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                        <BookOpen className="h-4 w-4 text-slate-400" />
                                        Referenced Sources
                                    </h3>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {apiResponse.sources.map((src, idx) => (
                                            <div key={idx} className="rounded-lg border border-slate-700/50 bg-[#1a2233] p-4 text-sm transition-colors hover:border-slate-600">
                                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                    <span className="inline-flex items-center gap-1.5 rounded bg-sky-500/10 px-2 py-1 font-medium text-sky-400 border border-sky-500/20">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        {src.ref}
                                                    </span>
                                                    {/* <span className="text-xs font-medium text-slate-500">
                                                        Score
                                                    </span> */}
                                                </div>
                                                <p className="text-xs text-slate-400 mb-2 truncate">File: {src.filename}</p>
                                                {/* Added whitespace-pre-wrap here to render \n as line breaks */}
                                                <p className="text-slate-300 italic leading-relaxed text-xs border-l-2 border-slate-600 pl-3 whitespace-pre-wrap">
                                                    "{src.snippet}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperatorCommentsPage;