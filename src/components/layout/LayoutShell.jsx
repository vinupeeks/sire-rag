
const LayoutShell = ({ left, main, leftCollapsed = false }) => {
  const leftWidthClass = leftCollapsed ? 'md:w-[76px] lg:w-[76px]' : 'md:w-[264px] lg:w-[264px]';

  return (
    <div className="h-screen min-h-screen bg-[#0b1523] text-[#eaf1f8]">
      <div className="flex h-full min-h-screen flex-col md:flex-row">

        {/* Left Sidebar */}
        <div className={`hidden h-full shrink-0 overflow-y-auto md:flex md:flex-col ${leftWidthClass} transition-all duration-300 ease-in-out`}>
          {left}
        </div>

        {/* Main Workspace (Dynamically handles Chat or Knowledge Base Tabs) */}
        <div className="flex min-w-0 flex-1 overflow-hidden flex-col bg-[#0b1523]">
          {main}
        </div>

      </div>
    </div>
  );
};

export default LayoutShell;