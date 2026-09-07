import { useCallback, useEffect } from 'react';
import { AlertCircle, CalendarDays, ClipboardList, Loader2, RefreshCw, ChevronRight, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListInspectionsMutation } from '../../../redux/services/inspectionsApi';
import { ROUTES } from '../../../constants/routes';

const formatDate = (value) => {
    if (!value) return 'Date unavailable';

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
};

const getVesselLabel = (inspection) => inspection.vessel?.name || '--:--';

const Inspections = ({ darkMode }) => {
    const [listInspections, { data: response, isLoading, isError }] = useListInspectionsMutation();
    const navigate = useNavigate();

    const loadInspections = useCallback(() => {
        listInspections({ page: 0, size: 10 });
    }, [listInspections]);

    useEffect(() => {
        loadInspections();
    }, [loadInspections]);

    const inspections = response?.data?.items || [];
    const panelClass = darkMode ? 'border-slate-700/60 bg-[#1a2233]' : 'border-slate-200 bg-white';
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <section className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-[#111827]' : 'bg-slate-100'}`}>
            <div className={`mx-auto rounded-2xl border ${panelClass}`}>
                <div className={`flex items-center justify-between border-b px-6 py-5 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Inspections</h1>
                            <p className={`mt-1 text-sm ${mutedTextClass}`}>Select an inspection to create operator comments from its report.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_UPLOAD)}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                        >
                            <Upload className="h-4 w-4" />
                            Upload SIRE 2.0 report
                        </button>

                        <button
                            type="button"
                            onClick={loadInspections}
                            disabled={isLoading}
                            aria-label="Refresh inspections"
                            title="Refresh inspections"
                            className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading && (
                        <div className={`flex min-h-40 flex-col items-center justify-center gap-3 ${mutedTextClass}`}>
                            <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                            <p className="text-sm">Loading inspections...</p>
                        </div>
                    )}

                    {!isLoading && isError && (
                        <div className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed ${darkMode ? 'border-rose-400/30 text-rose-300' : 'border-rose-200 text-rose-600'}`}>
                            <AlertCircle className="h-7 w-7" />
                            <p className="text-sm">Unable to load inspections.</p>
                            <button type="button" onClick={loadInspections} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-400">
                                <RefreshCw className="h-4 w-4" />
                                Try again
                            </button>
                        </div>
                    )}

                    {!isLoading && !isError && inspections.length === 0 && (
                        <div className={`flex min-h-40 flex-col items-center justify-center gap-2 ${mutedTextClass}`}>
                            <ClipboardList className="h-8 w-8 opacity-60" />
                            <p className="text-sm">No inspections found.</p>
                        </div>
                    )}

                    {!isLoading && !isError && inspections.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60">
                            <div className={`grid grid-cols-[1fr_1fr_1fr_auto] gap-4 border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'border-slate-700/60 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                                <span>Vessel</span>
                                <span>Inspection date</span>
                                <span>Report</span>
                                <span className="sr-only">Action</span>
                            </div>
                            <div className={`divide-y ${darkMode ? 'divide-slate-700/60' : 'divide-slate-200'}`}>
                                {inspections.map((inspection) => (
                                    <button
                                        type="button"
                                        key={inspection.id}
                                        onClick={() => navigate(`${ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS}/${inspection.id}`)}
                                        className={`group grid w-full grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 px-4 py-4 text-left transition-colors ${darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className={`font-semibold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{getVesselLabel(inspection)}</span>
                                        <span className={`inline-flex items-center gap-2 text-xs ${mutedTextClass}`}><CalendarDays className="h-4 w-4" />{formatDate(inspection.inspection_date)}</span>
                                        <span className={`text-xs ${mutedTextClass}`}>{inspection.report_no}</span>
                                        <span className={`inline-flex items-center justify-end gap-1 text-xs font-semibold transition-colors ${darkMode ? 'text-sky-400 group-hover:text-sky-300' : 'text-sky-600 group-hover:text-sky-700'}`}>
                                            View details <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Inspections;