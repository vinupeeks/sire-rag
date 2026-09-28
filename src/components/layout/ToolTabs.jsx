import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2Icon, CircleHelp } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const ToolTabs = () => {
    const location = useLocation();
    const darkMode = useSelector((state) => state.data.darkMode);
    const user = useSelector((state) => state.auth.user);
    
    const section = location.pathname.startsWith(ROUTES.KNOWLEDGE_SOURCES)
        ? 'Knowledge base'
        : location.pathname.startsWith(ROUTES.CHAT)
            ? 'Ask a question'
            : 'Operator comments';
    const page = location.pathname.includes('/history')
        ? 'History'
        : location.pathname === ROUTES.OPERATOR_COMMENTS_SUBMITTED
            ? 'Submitted'
        : location.pathname.includes('/report-upload')
            ? 'Upload a report'
            : location.pathname.includes('/inspections/')
                ? 'Inspection details'
                : location.pathname.startsWith(ROUTES.KNOWLEDGE_SOURCES)
                    ? (new URLSearchParams(location.search).get('source') === 'common-files' ? 'Common Files' : 'Company Files')
                    : location.pathname.startsWith(ROUTES.CHAT)
                        ? 'SMS Search'
                        : 'Inspections';

    return (
        <div className={`flex h-[52px] shrink-0 items-center gap-2 border-b px-7 ${darkMode ? 'border-[#1c3149] bg-[#0b1523]' : 'border-slate-200 bg-white'}`}>
            <span className={`text-[13px] ${darkMode ? 'text-[#7c93ac]' : 'text-slate-500'}`}>{section}</span>
            <span className="text-[13px] text-[#4a6280]">/</span>
            <span className={`text-[13px] ${darkMode ? 'text-[#eaf1f8]' : 'text-slate-800'}`}>{page}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-sky-400 hover:text-sky-300">
                <Building2Icon className="h-4 w-4" />
                {user?.company_name || ''}
            </span>
            {/* <a href="mailto:support@solmarine.com" className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-sky-400 hover:text-sky-300">
                <CircleHelp className="h-4 w-4" />
                Help
            </a> */}
        </div>
    );
};

export default ToolTabs;