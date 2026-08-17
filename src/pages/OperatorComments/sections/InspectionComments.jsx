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

            const response = {
    "success": true,
    "message": "Operator comment analyzed and saved successfully.",
    "data": {
        "id": 6,
        "user_id": 1,
        "question_number": "10.4.2",
        "category": "Hardware",
        "response_type": "Observable or detectable deficiency",
        "comment": "The last lube oil analysis for mooring winch 3 indicated a critical (red) status due to low viscosity. The laboratory requested the vessel to confirm the oil type on the label. The vessel had sent a new sample ashore for analysis.",
        "status": "True",
        "error_log": null,
        "immediate_cause": "The lube oil for mooring winch 3 was found to have a critical (red) status due to low viscosity during the last analysis. This condition went unnoticed as the oil type was not confirmed prior to sampling.",
        "root_cause": "The vessel's planned maintenance system (PMS) did not include a specific task for verifying the oil type and viscosity prior to sampling, which allowed the critical condition to persist without timely intervention.",
        "corrective_action": "The vessel confirmed the oil type and viscosity with the laboratory and sent a new sample ashore for analysis. This action has closed the specific finding regarding the lube oil analysis.",
        "preventative_action": "The PMS has been updated to include a task for verifying the oil type and viscosity of lube oils prior to sampling. Additionally, a training session was conducted with the engineering team to emphasize the importance of this verification step. This observation is to be circulated to the fleet.",
        "provider": "openai",
        "question_bank_hit": true,
        "confidence": 1,
        "question_info": {
            "title": "10.4.2. Did the vessel operator subscribe to a lube oil and hydraulic oil analysis program and was a procedure in place to act on the results and tr"
        },
        "assumptions": [],
        "section_sources": [
            {
                "section": "Immediate Cause",
                "source_refs": [
                    "Q-Source 1"
                ],
                "basis": "Q-Source 1 specifies that critical status findings must be addressed, indicating the immediate cause was the unverified oil type."
            },
            {
                "section": "Root Cause",
                "source_refs": [
                    "Q-Source 1",
                    "Rule-Source 1"
                ],
                "basis": "Q-Source 1 highlights the need for a procedure to act on analysis results, revealing a gap in the PMS regarding oil type verification."
            },
            {
                "section": "Corrective Action",
                "source_refs": [
                    "Q-Source 1"
                ],
                "basis": "Q-Source 1 outlines expected actions following critical analysis results, justifying the confirmation of oil type and resampling."
            },
            {
                "section": "Preventative Action",
                "source_refs": [
                    "Rule-Source 1",
                    "Rule-Source 2"
                ],
                "basis": "Rule-Source 1 emphasizes the need for a documented procedure, supporting the update to the PMS and training for the engineering team."
            }
        ],
        "sources": [
            {
                "stage": 1,
                "ref": "Q-Source 1",
                "filename": "questions.xlsx",
                "score": 1,
                "snippet": "QUESTION 10.4.2: Did the vessel operator subscribe to a lube oil and hydraulic oil analysis program and was a procedure in place to act on the results and trends identified by the analysis?\n\nSHORT TITLE: Lube oil and hydraulic oil analysis program\n\nROVIQ SEQUENCE: Chief Engineer's Office\n\nOBJECTIVE:\nTo ensure that the quality of lube oils and hydraulic oils is monitored, and action taken when necessary to avoid machinery damage.\n\nEXPECTED EVIDENCE:\n• The lubricating and hydraulic oil analysis programme information documenting the oils subject to analysis.\n• The lubricating and hydraulic oil analysis records for the previous two cycles of analysis.\n• Where analysis had resulted in a “critical” (red) or “warning” (amber) status, any follow up communications\nfrom shore-based management.\n• Maintenance records to demonstrate that the recommended or instructed actions had been taken to correct\nany “critical” or “warning” status.\n\nGROUNDS FOR NEGATIVE OBSERVATION:\n• The vessel did not have a programme for the routine sampling and analysis of lubricating and hydraulic oils.\n• The accompanying officer was unfamiliar with the company procedure for managing the lubricating and\nhydraulic oil a"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 1",
                "filename": "SIRE 2.0 Draft Inspection Report Validation - Best Practice - Version 1.0 (1).pdf",
                "score": 0.76,
                "snippet": "The document SIRE 2.0 Programme Introduction and Guidance – Version 1.0 section 3 – \r\nUsing the CVIQ and Inspection Editor application, provides definitive guidance on how an \r\ninspector is required to complete a CVIQ during an inspection.\r\nThe review should consider the observations and negative observations provided for each \r\nquestion and verify that:\r\n• The comment or negative comment:\r\n• Relates directly to a top-level question and its supporting guidance.\r\n• Includesrelevant details of the conditionsfound on the vessel, giving\r\nreaders a clear and meaningful description of the conditions and\r\nissues as witnessed at the time of inspection.\r\n• Relates correctly to the response category (response tool) in which it \r\nwas reported – i.e., a hardware issue being entered in the process or \r\nhuman category (response tool). \r\n• Refers to a crewmember as the observed person or by the acceptable \r\nabbreviation OP. \r\n• Does not include the rank, name or any other identifier of an observed \r\nperson.\r\n• Is objective, without opinions, speculation or subjectivity.\r\n• Does not offer recommendations or advice to rectify any of the negative \r\nobservations made in a report.\r\n• Does not refer to"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 2",
                "filename": "SIRE 2.0 Draft Inspection Report Validation - Best Practice - Version 1.0 (1).pdf",
                "score": 0.744,
                "snippet": "9 Objectivity\r\nThe SIRE 2.0 inspection editor is programmed to ensure that an inspector always provides \r\nthe required data input for each CVIQ question and its assigned response categories.\r\nAlthough the software can ensure that data inputs are made where required, there is no \r\nartificial intelligence to verify that the entries are accurate, logical, or appropriate to the \r\nquestion.\r\nAll chapter 2-10 and 12 SIRE 2.0 questions will be assigned one or more of the following \r\nresponse categories:\r\n• Hardware: Refers to vessel structure, machinery, outfitting, or equipment.\r\n• Process: Refers to vessel procedures or documented processes.\r\n• Human: Refers to the familiarity of vessel staff with a company procedure, written \r\nprocess or the use or operation of machinery or equipment.\r\nIt is important that a reviewer checks that the inspector has used the correct response \r\ncategory to classify a negative observation that they are reporting on.\r\nA hardware negative observation is reporting on a defect or deficiency relating to vessel\r\nstructure, machinery, outfitting, or equipment and not:\r\n• How familiar the crew are with the machinery or equipment. \r\n• The existence of a procedure to"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 3",
                "filename": "SIRE 2.0 - Negative Observation Module Explanation - Version 1.0.pdf",
                "score": 0.742,
                "snippet": "2 SIRE 2.0 – Negative Observation Module Explanation – Version 1.0\r\nIntroduction\r\nAny deficiency, defect or non-compliance identified during a SIRE 2.0 inspection must be recorded in the \r\nInspection Editor as a negative observation in the Negative Observation Module which is identified by this \r\nsymbol:\r\nFor example, consider the case where, when answering Qu. 5.2.10\r\n“Were the Master, officers and ratings familiar with the purpose and operation of the vessel’s deck foam \r\nsystem, including portable applicators, and was the system in good working order and available for \r\nimmediate use, with operating instructions displayed at the control station?”\r\nThe inspector observes that:\r\na) The isolating valves for the deck foam line are seized open.\r\nb) Although the deck foam system is included in the PMS, there are no inspection/maintenance tasks for the\r\nisolating valves.\r\nc) The accompanying officer does not know the location and purpose of the isolating valves.\r\nTo allow effective data mining of SIRE 2.0 inspection reports, this information must be recorded in a \r\nsystematic manner.\r\nSOC and NOC\r\nFirstly, what is being reported on must be identified. This is termed the Subject of Conc"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 4",
                "filename": "SIRE 2.0 Draft Inspection Report Validation - Best Practice - Version 1.0 (1).pdf",
                "score": 0.735,
                "snippet": "The process described above is not the same as what was known as ‘double dipping’ in 10 SIRE 2.0 Inspection Report Validation: Best Practice – Version 1.0\r\nthe original SIRE Programme. Each SIRE 2.0 top level question addresses the \r\nsafeguards or activities required to be in place to prevent the weakening or failure of a \r\nspecific barrier to prevent an undesirable event.\r\nCheck that the inspector has made careful distinctions between the reporting of the \r\ninitial “source” negative observation and any further negative observations recorded\r\nagainst other response categories under the same top-level question and against any \r\nother top-level question effected by the defect or deficiency.\r\nA simple example which would give rise to multiple negative observations against \r\nseveral top-level questions would be: \r\nAn oily water separator (OWS) had been out of service for some time, but no entry had \r\nbeen made in the oil record book (ORB), there was no record of an open defect report, \r\nthere was no company procedure to report defects and the accompanying officer was \r\nnot familiar with the ORB instructions for recording the defective OWS…\r\nEven though the question that specifically ad"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 5",
                "filename": "SIRE 2.0 - Negative Observation Module Explanation - Version 1.0.pdf",
                "score": 0.732,
                "snippet": "5 SIRE 2.0 – Negative Observation Module Explanation – Version 1.0\r\nProcess\r\nThe Process SOC would be identified as “4.1.1.3 Schedule of planned tasks/record of completed \r\nmaintenance”.\r\nThe Process NOC would be identified as (Procedure accuracy/correctness).\r\nThe supporting Negative Comment would be:\r\n“The deck foam fire-fighting system was included in the vessel’s PMS, but there was no task created for the \r\ninspection and maintenance of the deck foam line isolating valves.”"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 6",
                "filename": "SIRE 2.0 Draft Inspection Report Validation - Best Practice - Version 1.0 (1).pdf",
                "score": 0.729,
                "snippet": "While inconvenient, this will not diminish \r\nthe value of the inspection report unless the completely wrong vessel type is \r\nselected, which should be identified by the inspector as they complete the pre￾boarding phase of the Uniform Vessel Inspection Procedure. If such a circumstance \r\noccurs, the inspector must notify the submitting company, which can either arrange \r\nwith the vessel operator to cancel the existing booked inspection and request a \r\nnew inspection using the correct vessel type or cancel the inspection entirely.5 SIRE 2.0 Inspection Report Validation: Best Practice – Version 1.0\r\nWhere an inappropriate question is included in a CVIQ, the inspector will use the \r\n‘not answerable’ response to identify the reason why the question was included. \r\n4 Draft inspection report - general checks\r\nThe first step for a submitting company when reviewing a draft inspection report is \r\nto check that the information included on the front cover and in section 1 – Vessel, \r\nOperator and Inspection Particulars is populated and apparently correct. All \r\ninformation is populated automatically and is derived from the following: \r\n• A vessel’s HVPQ and PIQ. \r\n• A vessel’s SIRE registratio"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 7",
                "filename": "SIRE 2.0 - Negative Observation Module Explanation - Version 1.0.pdf",
                "score": 0.719,
                "snippet": "1 SIRE 2.0 – Negative Observation Module Explanation – Version 1.0\r\nThe SIRE 2.0 Negative Observation Module and the \r\nClassification of Subject of Concern (SOC) and Nature of \r\nConcern (NOC) \r\nIntroduction 2\r\nSOC and NOC 2\r\nHardware 4\r\nProcess 5\r\nHuman 6\r\nAnnex 1: Hardware – Standard Classification Coding 7\r\nAnnex 2: Process – TMSA-based classification coding 10\r\nAnnex 3: Human – Rank grouping 22\r\nAnnex 4: Standard photograph locations 23\r\nAnnex 5: Hardware – Standard cause analysis tree 25\r\nAnnex 6: Process – Standard cause analysis tree 26\r\nAnnex 7: Human – Performance Influencing Factors (PIF) 27\r\nAnnex 8: Photograph comparison – Standard cause analysis tree 28\r\nDocument Control\r\nDoc Version Date Change\r\n1.0 27 April 2022 Initial release"
            },
            {
                "stage": 2,
                "ref": "Rule-Source 8",
                "filename": "SIRE 2.0 Draft Inspection Report Validation - Best Practice - Version 1.0 (1).pdf",
                "score": 0.718,
                "snippet": "Inspectors will usually be able to report on any safety-related issues observed during an \r\ninspection using the guidance provided in the balance of the partially quoted section.\r\n11 Report detail level and report padding\r\nThere is a balance between the correct level of detail to describe conditionsfound on\r\nboard and ‘padding’ reports with excess wording.\r\nIf the report has excessive or repetitive comments, consider asking the inspector to \r\namend all the relevant comments before publishing.\r\nWhen it is found that comments and negative comments repeat the question or\r\nguidance and do not add value to the report, member companies must review the issue \r\nwith the inspector. The same inspector comment or negative comment must not be\r\nrepeated throughout a report.\r\n12 Reporting a defect or deficiency in more than \r\none response category or question\r\nThe document SIRE 2.0 Programme Introduction and Guidance – Version 1.0 section 3.4 - \r\nRecording negative observations in multiple observation modules within a single \r\nquestion and across more than one question states: \r\nThe SIRE 2.0 Question Library has been built on the principle of barrier management \r\nwith the purpose of identifying "
            }
        ],
        "updatedAt": "2026-08-17T05:23:57.231Z",
        "createdAt": "2026-08-17T05:23:57.231Z"
    }
}
            // const response = await submitComment(payload).unwrap();

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
                        <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Analyze your comments and generate insights</p>
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
                            <Plus className="h-4 w-4" /> New
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
                                Inspector Remark
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                placeholder="Enter detailed inspector remark here..."
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
                                {isLoadStateActive ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </form>
                )}

                {/* AI Analysis Results Section */}
                {apiResponse && (apiResponse.result || apiResponse.immediate_cause) && (
                    <div className={`mt-2 border-t pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>
                                    <p className={`mt-1 mb-1 text-sm items-end ${darkMode ? 'text-white' : 'text-slate-500'}`}>{`${apiResponse.question_info?.title}`}</p>
                                    <p className={`mt-1 mb-1 text-sm items-end ${darkMode ? 'text-white' : 'text-slate-500'}`}>{`${apiResponse.category} - ${apiResponse.response_type}`}</p>
                                    Remark: {`${apiResponse.comment}`}
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