import React, { useState, useEffect, useRef } from 'react';
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
    FileText,
    Copy,
    Check,
    Plus
} from 'lucide-react';
import { useFetchMutation } from '../../../redux/services/operatorCommentsApi';

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


const ANALYSIS_LOADING_MESSAGES = [
    "Reviewing observation details...",
    "Cross-referencing regulatory frameworks...",
    "Mapping findings to SIRE 2.0 guidelines...",
    "Identifying systemic and immediate causes...",
    "Formulating targeted corrective measures...",
    "Developing preventative strategies...",
    "Consolidating final inspection report...",
];

// Upgraded ResultCard to include Copy-to-Clipboard functionality
const ResultCard = ({ title, icon, content, colorClass, darkMode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`rounded-xl border p-5 transition-all relative group ${darkMode ? 'border-slate-700/50 bg-[#111827] hover:border-slate-600/80' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
            <div className="mb-3 flex items-start justify-between">
                <div className={`flex items-center gap-2 ${colorClass}`}>
                    {icon}
                    <h3 className="font-semibold tracking-wide text-sm">{title}</h3>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className={`p-1.5 rounded-md transition-all ${darkMode
                        ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                        } ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{content}</p>
        </div>
    );
};

const InspectionComments = ({ darkMode }) => {
    const [submitComment, { isLoading: isApiLoading }] = useFetchMutation();

    const [isFormVisible, setIsFormVisible] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formData, setFormData] = useState({
        questionNo: '2.3.2',
        category: '',
        responseType: '',
        comment: '',
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [apiResponse, setApiResponse] = useState(null);

    // Loader State
    const [msgIndex, setMsgIndex] = useState(0);
    const [msgVisible, setMsgVisible] = useState(true);
    const msgIntervalRef = useRef(null);

    const startMessageRotation = () => {
        setMsgIndex(0);
        setMsgVisible(true);
        let current = 0;
        msgIntervalRef.current = setInterval(() => {
            if (current >= ANALYSIS_LOADING_MESSAGES.length - 1) {
                clearInterval(msgIntervalRef.current);
                msgIntervalRef.current = null;
                return;
            }
            setMsgVisible(false);
            setTimeout(() => {
                current += 1;
                setMsgIndex(current);
                setMsgVisible(true);
            }, 400);
        }, 2500);
    };

    const stopMessageRotation = () => {
        if (msgIntervalRef.current) {
            clearInterval(msgIntervalRef.current);
            msgIntervalRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopMessageRotation();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            if (field === 'category') {
                newData.responseType = '';
            }
            return newData;
        });
    };

    const handleReset = () => {
        setFormData({
            questionNo: '',
            category: '',
            responseType: '',
            comment: '',
        });
        setStatus({ type: '', message: '' });
        setApiResponse(null);
        setIsFormVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setApiResponse(null);
        setIsAnalyzing(true);
        startMessageRotation();

        try {

            const payload = {
                category: formData.category,
                comment: formData.comment,
                question_number: formData.questionNo,
                response_type: formData.responseType,
            };

            const response = await submitComment(payload).unwrap();

            setStatus({ type: 'success', message: 'Comment analyzed successfully!' });
            setApiResponse(response.data || response);
            setIsFormVisible(false);

        } catch (error) {
            console.error('Submission error:', error);
            setStatus({
                type: 'error',
                message: error?.data?.message || 'Failed to submit comment. Please try again.'
            });
        } finally {
            setIsAnalyzing(false);
            stopMessageRotation();
        }
    };

    const isLoadStateActive = isApiLoading || isAnalyzing;
    const inputClasses = `w-full rounded-lg border px-4 py-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all ${darkMode ? 'border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`;

    return (
        <div className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-[#111827]' : 'bg-slate-100'} relative`}>

            {/* 3D Cube Loader Modal */}
            {isLoadStateActive && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <style>{`
                        .cube-spinner {
                            width: 44px;
                            height: 44px;
                            animation: spinner-y0fdc1 2s infinite ease;
                            transform-style: preserve-3d;
                        }
                        .cube-spinner > div {
                            background-color: rgba(14, 165, 233, 0.15); /* Sky-500 tint */
                            height: 100%;
                            position: absolute;
                            width: 100%;
                            border: 2px solid #0ea5e9; /* Sky-500 */
                        }
                        .cube-spinner div:nth-of-type(1) { transform: translateZ(-22px) rotateY(180deg); }
                        .cube-spinner div:nth-of-type(2) { transform: rotateY(-270deg) translateX(50%); transform-origin: top right; }
                        .cube-spinner div:nth-of-type(3) { transform: rotateY(270deg) translateX(-50%); transform-origin: center left; }
                        .cube-spinner div:nth-of-type(4) { transform: rotateX(90deg) translateY(-50%); transform-origin: top center; }
                        .cube-spinner div:nth-of-type(5) { transform: rotateX(-90deg) translateY(50%); transform-origin: bottom center; }
                        .cube-spinner div:nth-of-type(6) { transform: translateZ(22px); }
                        
                        @keyframes spinner-y0fdc1 {
                            0%   { transform: rotate(45deg) rotateX(-25deg) rotateY(25deg); }
                            50%  { transform: rotate(45deg) rotateX(-385deg) rotateY(25deg); }
                            100% { transform: rotate(45deg) rotateX(-385deg) rotateY(385deg); }
                        }
                        @keyframes fadeMsg {
                            from { opacity: 0; transform: translateY(6px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                        .msg-fade {
                            animation: fadeMsg 0.4s ease forwards;
                        }
                    `}</style>

                    <div className={`rounded-2xl border px-12 py-10 flex flex-col items-center gap-5 shadow-2xl transition-colors ${darkMode ? 'bg-[#1a2233] border-slate-700/60 shadow-black/50' : 'bg-white border-slate-200'}`}>
                        {/* 3D Cube Spinner */}
                        <div className="cube-spinner">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>

                        <p className={`text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            Analyzing Comments
                        </p>

                        {/* Rotating message */}
                        <div style={{ minHeight: 20 }}>
                            {msgVisible && (
                                <p className={`text-xs text-center font-medium msg-fade ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                                    {ANALYSIS_LOADING_MESSAGES[msgIndex]}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`mx-auto max-w-5xl rounded-2xl border p-6 ${darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white'}`}>
                <div className={`flex items-center justify-between ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div>
                        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Operator Comments</h1>
                        <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Analyze your comments and generate a report</p>
                    </div>
                    {/* Only show the 'New Analysis' button when the form is hidden */}
                    {!isFormVisible && (
                        <button
                            onClick={handleReset}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${darkMode
                                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            <Plus className="h-4 w-4" /> New Analysis
                        </button>
                    )}
                </div>

                {/* Hide the form if data was returned successfully */}
                {isFormVisible && (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className={`text-xs font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Question No
                                </label>
                                <input
                                    type="text"
                                    value={formData.questionNo}
                                    onChange={(e) => handleInputChange('questionNo', e.target.value)}
                                    placeholder="e.g. 2.3.2"
                                    className={inputClasses}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={`text-xs font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">— select —</option>
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className={`text-xs font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Response Type
                                </label>
                                <select
                                    value={formData.responseType}
                                    onChange={(e) => handleInputChange('responseType', e.target.value)}
                                    disabled={!formData.category}
                                    className={`${inputClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <option value="">— select —</option>
                                    {formData.category && responseOptions[formData.category]?.map((opt, idx) => (
                                        <option key={idx} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-xs font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                Inspector Comment
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                placeholder="Enter detailed inspector comment here..."
                                rows={3}
                                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all ${darkMode ? 'border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoadStateActive}
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoadStateActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isLoadStateActive ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                    </form>
                )}

                {/* AI Analysis Results Section */}
                {apiResponse && (apiResponse.result || apiResponse.immediate_cause) && (
                    <div className={`mt-2 border-t pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className={`text-md font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {apiResponse.question_info?.title || apiResponse.question_number}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {(apiResponse.result?.observation || apiResponse.observation) && (
                                <div className="md:col-span-2">
                                    <ResultCard
                                        title="Observation"
                                        icon={<Eye className="h-4 w-4" />}
                                        content={apiResponse.result?.observation || apiResponse.observation}
                                        colorClass="text-sky-500"
                                        darkMode={darkMode}
                                    />
                                </div>
                            )}
                            <ResultCard
                                title="Immediate Cause"
                                icon={<AlertTriangle className="h-4 w-4" />}
                                content={apiResponse.result?.immediate_cause || apiResponse.immediate_cause}
                                colorClass="text-amber-500"
                                darkMode={darkMode}
                            />
                            <ResultCard
                                title="Root Cause"
                                icon={<Target className="h-4 w-4" />}
                                content={apiResponse.result?.root_cause || apiResponse.root_cause}
                                colorClass="text-rose-500"
                                darkMode={darkMode}
                            />
                            <ResultCard
                                title="Corrective Action"
                                icon={<Wrench className="h-4 w-4" />}
                                content={apiResponse.result?.corrective_action || apiResponse.corrective_action}
                                colorClass="text-emerald-500"
                                darkMode={darkMode}
                            />
                            <ResultCard
                                title="Preventative Action"
                                icon={<ShieldCheck className="h-4 w-4" />}
                                content={apiResponse.result?.preventative_action || apiResponse.preventative_action}
                                colorClass="text-indigo-500"
                                darkMode={darkMode}
                            />
                        </div>

                        {/* Sources Section */}
                        {apiResponse.sources && apiResponse.sources.length > 0 && (
                            <div className={`mt-6 rounded-xl border p-5 ${darkMode ? 'border-slate-700/60 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'}`}>
                                <h3 className={`mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <BookOpen className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                    Referenced Sources
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {apiResponse.sources.map((src, idx) => (
                                        <div key={idx} className={`rounded-lg border p-4 text-sm transition-colors ${darkMode ? 'border-slate-700/50 bg-[#1a2233] hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
                                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded bg-sky-500/10 px-2 py-1 font-medium text-sky-500 border border-sky-500/20">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {src.ref}
                                                </span>
                                            </div>
                                            <p className={`text-xs mb-2 truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>File: {src.filename}</p>
                                            <p className={`italic leading-relaxed text-xs border-l-2 pl-3 whitespace-pre-wrap ${darkMode ? 'text-slate-300 border-slate-600' : 'text-slate-700 border-slate-300'}`}>
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
    );
};

export default InspectionComments;