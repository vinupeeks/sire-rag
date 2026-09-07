import { useState } from 'react';
import { AlertTriangle, Check, Copy, Eye, ShieldCheck, Target, Wrench } from 'lucide-react';

const resultIcons = {
    observation: { icon: Eye, colorClass: 'text-sky-500' },
    immediateCause: { icon: AlertTriangle, colorClass: 'text-amber-500' },
    rootCause: { icon: Target, colorClass: 'text-rose-500' },
    correctiveAction: { icon: Wrench, colorClass: 'text-emerald-500' },
    preventativeAction: { icon: ShieldCheck, colorClass: 'text-indigo-500' },
};

const OperatorCommentsResultCard = ({ darkMode, title, resultKey, content }) => {
    const [copied, setCopied] = useState(false);
    const resultStyle = resultIcons[resultKey] || resultIcons.observation;
    const Icon = resultStyle.icon;

    const handleCopy = async () => {
        if (!content) return;

        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy operator comment:', error);
        }
    };

    return (
        <div className={`group relative rounded-xl border p-5 transition-all ${darkMode ? 'border-slate-700/50 bg-[#111827] hover:border-slate-600/80' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'}`}>
            <div className="mb-1 flex items-start justify-between gap-3">
                <div className={`flex items-center gap-2 ${resultStyle.colorClass}`}>
                    <Icon className="h-4 w-4" />
                    <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    title={`Copy ${title.toLowerCase()}`}
                    aria-label={`Copy ${title.toLowerCase()}`}
                    className={`rounded-md p-1.5 transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'} ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
            <p className={`whitespace-pre-wrap text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{content || '--:--'}</p>
        </div>
    );
};

export default OperatorCommentsResultCard;