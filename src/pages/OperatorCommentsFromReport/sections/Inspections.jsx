import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Archive, CalendarDays, ClipboardList, Loader2, RefreshCw, ChevronRight, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useArchiveInspectionMutation, useListInspectionsMutation } from '../../../redux/services/inspectionsApi';
import { ROUTES } from '../../../constants/routes';
import ConfirmationModal from '../../../common/ConfirmationModal';
import { toast } from 'sonner';

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
    const [archiveInspection, { isLoading: isArchiving }] = useArchiveInspectionMutation();
    const navigate = useNavigate();
    const [inspectionToArchive, setInspectionToArchive] = useState(null);

    const loadInspections = useCallback(() => {
        listInspections({ page: 0, size: 10 });
    }, [listInspections]);

    const handleArchive = async (inspectionId) => {
        try {
            await archiveInspection({ id: inspectionId }).unwrap();
            toast.success('Inspection archived successfully. You can find it on the History page.');
            loadInspections();
        } catch (error) {
            toast.error(error?.data?.message || 'Unable to archive this inspection. Please try again.');
        }
    };

    const confirmArchive = async () => {
        if (!inspectionToArchive) return;

        const inspectionId = inspectionToArchive.id;
        setInspectionToArchive(null);
        await handleArchive(inspectionId);
    };

    useEffect(() => {
        loadInspections();
    }, [loadInspections]);

    const inspections = response?.data?.items || [];
    const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <>
            <section className={`flex-1 overflow-auto px-7 py-6 ${darkMode ? 'bg-[#0b1523]' : 'bg-slate-100'}`}>
                <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
                <div className="flex items-start justify-between gap-5">
                    <div>
                        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Inspections</h1>
                        <p className={`mt-1 text-[13px] ${mutedTextClass}`}>Pick an inspection to write operator comments on its findings.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_UPLOAD)}
                            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0f6fb8] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0c5f9f]"
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

                <div className={`grid gap-4 rounded-xl border px-5 py-4 md:grid-cols-2 xl:grid-cols-4 ${darkMode ? 'border-[#23415f] bg-[#13243a]' : 'border-slate-200 bg-white'}`}>
                    {[
                        'Upload the SIRE 2.0 report',
                        'Review the listed findings',
                        'Generate operator comments',
                        'Add a comment and draft again',
                    ].map((step, index) => (
                        <div key={step} className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? 'bg-[#0f6fb8] text-white' : 'bg-[#17395c] text-[#9db2c8]'}`}>
                                {index + 1}
                            </span>
                            <span className={`text-[13px] ${darkMode ? 'text-[#c9daea]' : 'text-slate-700'}`}>{step}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
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
                        <div className={`overflow-hidden rounded-xl border ${darkMode ? 'border-[#1c3149] bg-[#13243a]' : 'border-slate-200 bg-white'}`}>
                            <div className={`grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 border-b bg-[#23415f] px-5 py-3 text-xs font-medium ${darkMode ? 'border-[#1c3149] text-[#9db2c8]' : 'border-slate-200 text-slate-500'}`}>
                                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-300'}`}>Vessel</span>
                                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-300'}`}>Inspection date</span>
                                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-300'}`}>Report</span>
                                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-300'}`}>Actions</span>
                            </div>
                            <div className={`divide-y ${darkMode ? 'divide-slate-700/60' : 'divide-slate-200'}`}>
                                {inspections.map((inspection) => (
                                    <div
                                        key={inspection.id}
                                        className={`grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-4 px-5 py-4 transition-colors ${darkMode ? 'hover:bg-[#0e1b2c]' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className={`font-semibold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{getVesselLabel(inspection)}</span>
                                        <span className={`inline-flex items-center gap-2 text-xs ${mutedTextClass}`}><CalendarDays className="h-4 w-4" />{formatDate(inspection.inspection_date)}</span>
                                        <span className={`text-xs ${mutedTextClass}`}>{inspection.report_no}</span>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`${ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS}/${inspection.id}`)}
                                            className={`inline-flex items-center justify-end gap-1 text-xs font-semibold transition-colors ${darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'}`}
                                        >
                                            View Non Conformance <ChevronRight className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInspectionToArchive(inspection)}
                                            disabled={isArchiving}
                                            aria-label={`Archive inspection ${inspection.report_no || inspection.id}`}
                                            title="Archived items appear in History."
                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-amber-300' : 'border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600'}`}
                                        >
                                            <Archive className="h-4 w-4" />
                                            Archive
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </section>
            <ConfirmationModal
                isOpen={Boolean(inspectionToArchive)}
                title="Archive Inspection"
                message={`Are you sure you want to archive ${getVesselLabel(inspectionToArchive || {})}'s inspection?`}
                darkMode={darkMode}
                onConfirm={confirmArchive}
                onCancel={() => setInspectionToArchive(null)}
            />
        </>
    );
};

export default Inspections;