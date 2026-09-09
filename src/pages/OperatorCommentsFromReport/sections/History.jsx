import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    X,
    Copy,
    BookOpen,
    FileText
} from 'lucide-react';
import { useListMutation } from '../../../redux/services/operatorCommentsApi';

const History = ({ darkMode }) => {
    const initialFilters = {
        page: 0,
        size: 10,
        category: '',
        response_type: '',
        question_number: '',
        search: ''
    };

    const [filters, setFilters] = useState(initialFilters);
    const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);
    const [expandedId, setExpandedId] = useState(null);

    const [fetchList, { data: response, isLoading }] = useListMutation();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        fetchList(debouncedFilters);
    }, [debouncedFilters, fetchList]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'category' ? { response_type: '' } : {}),
            page: 0
        }));
        setExpandedId(null);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setExpandedId(null);
    };

    const handleCopy = async (text) => {
        if (!text || text === 'N/A') return;

        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const items = response?.data?.items || [];
    const totalItems = response?.data?.totalItems || 0;
    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / filters.size)
    );

    const displayPage = filters.page + 1;

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setFilters((prev) => ({
                ...prev,
                page: newPage
            }));
            setExpandedId(null);
        }
    };

    const hasActiveFilters =
        filters.search !== '' ||
        filters.category !== '' ||
        filters.response_type !== '' ||
        filters.question_number !== '';

    const getResponseTypeOptions = () => {
        switch (filters.category) {
            case 'Human':
                return [
                    'As Expected',
                    'Largely as Expected',
                    'Not as Expected'
                ];
            case 'Process':
                return [
                    'As expected - procedure and/or document present',
                    'Largely as expected - procedure and/or document present',
                    'Not as expected - procedure and/or document deficient'
                ];
            case 'Hardware':
                return [
                    'Observable or detectable deficiency',
                    'Slight superficial deterioration'
                ];
            default:
                return [];
        }
    };

    const responseOptions = getResponseTypeOptions();

    return (
        <div
            className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-[#111827]' : 'bg-slate-100'
                }`}
        >
            <div
                className={`mx-auto max-w-7xl rounded-2xl border p-6 ${darkMode
                    ? 'border-slate-700/60 bg-[#1a2233]'
                    : 'border-slate-200 bg-white'
                    }`}
            >
                <div className={`mb-6 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}
                >
                    <div>
                        <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Operator Comments History
                        </h1>
                        <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            View and filter your submitted operator comments
                        </p>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                        >
                            <X className="h-4 w-4" />
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <Search className={`absolute left-3 top-2.5 h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search comments..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className={`w-full rounded-lg border pl-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'border-slate-700 bg-[#111827] text-white'
                                : 'border-slate-300 bg-white text-slate-900'
                                }`}
                        />
                    </div>

                    {/* Question Number */}
                    <input
                        type="text"
                        name="question_number"
                        placeholder="VIQ No (e.g. 5.8.1)"
                        value={filters.question_number}
                        onChange={handleFilterChange}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                            ? 'border-slate-700 bg-[#111827] text-white'
                            : 'border-slate-300 bg-white text-slate-900'
                            }`}
                    />

                    {/* Category */}
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                            ? 'border-slate-700 bg-[#111827] text-white'
                            : 'border-slate-300 bg-white text-slate-900'
                            }`}
                    >
                        <option value="">All Categories</option>
                        <option value="Human">Human</option>
                        <option value="Process">Process</option>
                        <option value="Hardware">Hardware</option>
                    </select>

                    <select
                        name="response_type"
                        value={filters.response_type}
                        onChange={handleFilterChange}
                        disabled={!filters.category}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!filters.category
                            ? (darkMode ? 'bg-slate-800 border-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed')
                            : (darkMode ? 'border-slate-700 bg-[#111827] text-white' : 'border-slate-300 bg-white text-slate-900')
                            }`}
                    >
                        <option value="">— select —</option>
                        {responseOptions.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table & Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div
                        className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}
                    >
                        No results found for your filters.
                    </div>
                ) : (
                    <div className={`overflow-x-auto rounded-xl border ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    className={`text-sm tracking-wider ${darkMode
                                        ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/50'
                                        : 'bg-slate-50 text-slate-500 border-b border-slate-200'
                                        }`}
                                >
                                    <th className="p-4 font-semibold w-32">Vessel</th>
                                    <th className="p-4 font-semibold w-30">Inspection Date</th>
                                    <th className="p-4 font-semibold w-24">VIQ</th>
                                    <th className="p-4 font-semibold w-24">Category</th>
                                    <th className="p-4 font-semibold">Comment</th>
                                    <th className="p-4 font-semibold">Response</th>
                                    <th className="p-4 font-semibold w-40">Date</th>
                                    <th className="p-4 font-semibold w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const isExpanded = expandedId === item.id;

                                    return (
                                        <React.Fragment key={item.id}>
                                            {/* Main Row */}
                                            <tr
                                                onClick={() => toggleExpand(item.id)}
                                                className={`cursor-pointer transition-colors ${darkMode
                                                    ? 'border-b border-slate-700/50 hover:bg-slate-800/40'
                                                    : 'border-b border-slate-200 hover:bg-slate-50'
                                                    } ${isExpanded && (darkMode ? 'bg-slate-800/20' : 'bg-slate-50/50')}`}
                                            >

                                                {/* Vessel */}
                                                <td className={`p-4 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {item?.finding?.observation?.inspection_question?.inspection?.vessel?.name || 'N/A'}
                                                </td>

                                                {/* Inspection Date */}
                                                <td className={`p-4 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {item?.finding?.observation?.inspection_question?.inspection?.inspection_date
                                                        ? new Date(item.finding.observation.inspection_question.inspection.inspection_date)
                                                            .toLocaleDateString('en-GB')
                                                        : 'N/A'}
                                                </td>

                                                {/* VIQ */}
                                                <td className={`p-4 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {item.question_number || 'N/A'}
                                                </td>

                                                {/* Category */}
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${item.category === 'Human'
                                                            ? 'bg-sky-500/10 text-sky-500'
                                                            : item.category === 'Process'
                                                                ? 'bg-amber-500/10 text-amber-500'
                                                                : 'bg-rose-500/10 text-rose-500'
                                                            }`}
                                                    >
                                                        {item.category || 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Truncated Comment */}
                                                <td className="p-4">
                                                    <div className={`text-sm truncate max-w-[200px] md:max-w-md lg:max-w-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {item.comment || 'No comment provided.'}
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <div
                                                        className={`text-sm w-[150px] truncate whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-slate-600'
                                                            }`}
                                                        title={item.response_type || 'No response provided.'}
                                                    >
                                                        {item.response_type || 'No response provided.'}
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="p-4">
                                                    <div className={`text-sm flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>

                                                {/* Toggle Icon */}
                                                <td className="p-4 text-right pr-6">
                                                    <div className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 ml-auto" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 ml-auto" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded AI Details Row */}
                                            {isExpanded && (
                                                <tr className={`${darkMode ? 'bg-[#111827]' : 'bg-white'}`}>
                                                    <td colSpan="8" className={`p-0 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                                                        <div className="p-6">
                                                            {/* Extra metadata and Full Comment */}
                                                            <div className="flex flex-col mb-2 gap-4">
                                                                <div className="mb-2 flex items-center justify-between">
                                                                    <div>
                                                                        <h2 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>
                                                                            <p className={`mt-1 mb-1 text-sm items-end ${darkMode ? 'text-white' : 'text-slate-500'}`}>{`${item.question_info?.title}`}</p>
                                                                            <p className={`mt-1 mb-1 text-sm items-end ${darkMode ? 'text-white' : 'text-slate-500'}`}>{`${item.category} - ${item.response_type}`}</p>
                                                                            Inspector Remark: {`${item.comment}`}
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mb-3">
                                                                <span className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-500'}`}>
                                                                    Operator Comments
                                                                </span>
                                                            </div>

                                                            {/* AI Analysis Grid */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {[
                                                                    { label: 'Immediate Cause', value: item.immediate_cause, color: darkMode ? 'text-rose-400' : 'text-rose-600' },
                                                                    { label: 'Root Cause', value: item.root_cause, color: darkMode ? 'text-orange-400' : 'text-orange-600' },
                                                                    { label: 'Corrective Action', value: item.corrective_action, color: darkMode ? 'text-emerald-400' : 'text-emerald-600' },
                                                                    { label: 'Preventative Action', value: item.preventative_action, color: darkMode ? 'text-blue-400' : 'text-blue-600' }
                                                                ].map(({ label, value, color }) => (
                                                                    <div
                                                                        key={label}
                                                                        className={`p-4 rounded-lg border ${darkMode
                                                                            ? 'border-slate-700/50 bg-slate-800/20'
                                                                            : 'border-slate-100 bg-white'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h4
                                                                                className={`text-xs font-bold tracking-wider ${color}`}
                                                                            >
                                                                                {label}
                                                                            </h4>

                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCopy(value);
                                                                                }}
                                                                                title={`Copy ${label}`}
                                                                                className={`p-1.5 rounded-md transition-colors ${darkMode
                                                                                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                                                                    }`}
                                                                            >
                                                                                <Copy className="h-4 w-4" />
                                                                            </button>
                                                                        </div>

                                                                        <p
                                                                            className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'
                                                                                }`}
                                                                        >
                                                                            {value || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Sources Section */}
                                                            {item.sources && item.sources.length > 0 && (
                                                                <div className={`mt-6 rounded-xl border p-5 ${darkMode ? 'border-slate-700/60 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'}`}>
                                                                    <h3 className={`mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                                        <BookOpen className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                                                        Referenced Sources
                                                                    </h3>
                                                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                                                        {item.sources.map((src, idx) => (
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
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination (Only shows when pages > 1) */}
                {!isLoading && totalPages > 1 && (
                    <div
                        className={`mt-6 flex items-center justify-between border-t pt-4 ${darkMode ? 'border-slate-700/60' : 'border-slate-200'
                            }`}
                    >
                        <div
                            className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}
                        >
                            Showing page{' '}
                            <span className="font-medium">{displayPage}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>
                        </div>

                        <div className="flex gap-2">
                            {/* Previous */}
                            <button
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={filters.page === 0}
                                className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${filters.page === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : darkMode
                                        ? 'hover:bg-slate-800'
                                        : 'hover:bg-slate-50'
                                    } ${darkMode
                                        ? 'border-slate-700 text-slate-300'
                                        : 'border-slate-300 text-slate-700'
                                    }`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Next */}
                            <button
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={filters.page >= totalPages - 1}
                                className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${filters.page >= totalPages - 1
                                    ? 'opacity-50 cursor-not-allowed'
                                    : darkMode
                                        ? 'hover:bg-slate-800'
                                        : 'hover:bg-slate-50'
                                    } ${darkMode
                                        ? 'border-slate-700 text-slate-300'
                                        : 'border-slate-300 text-slate-700'
                                    }`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;