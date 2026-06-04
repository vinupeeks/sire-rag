const LayoutShell = ({ left, main, right, leftCollapsed = false, rightCollapsed = false }) => {
  const leftWidthClass = leftCollapsed ? 'md:w-[88px] lg:w-[88px]' : 'md:w-[280px] lg:w-[320px]';
  const rightWidthClass = rightCollapsed ? 'lg:w-[58px] xl:w-[58px]' : 'lg:w-[290px] xl:w-[330px]';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Mobile/Tablet: vertical stack, Desktop: horizontal */}
      <div className="flex h-full min-h-screen flex-col md:flex-row">
        {/* Left Sidebar - Hidden on mobile, visible on tablet+ */}
        <div className={`hidden h-full overflow-y-auto md:flex md:flex-col ${leftWidthClass} transition-all duration-300 ease-in-out`}>
          {left}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {main}
        </div>
        
        {/* Right Sidebar - Hidden on mobile and tablet, visible on desktop+ */}
        <div className={`hidden h-full overflow-y-auto lg:flex lg:flex-col ${rightWidthClass} transition-all duration-300 ease-in-out border-l border-slate-200`}>
          {right}
        </div>
      </div>
    </div>
  );
};

export default LayoutShell;
