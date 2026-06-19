import React from 'react';

const ConfirmationModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    darkMode = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className={`w-full max-w-md p-6 rounded-xl border shadow-2xl transition-all duration-200 ${darkMode
                ? 'bg-[#1e2533] border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
                }`}>
                <h3 className="text-base font-bold tracking-wide mb-2">
                    {title}
                </h3>

                <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    {message}
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${darkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-900/20 rounded-lg transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;