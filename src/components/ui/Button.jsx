import { cn } from '../../lib/utils';

export function Button({ variant = 'primary', size = 'default', className, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/60 disabled:pointer-events-none disabled:opacity-50 active:scale-95';
  const variants = {
    primary: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:bg-cyan-600',
    secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 active:bg-slate-800',
    ghost: 'bg-transparent text-slate-200 hover:bg-slate-800/90 active:bg-slate-800',
    accent: 'bg-slate-900 text-cyan-300 hover:bg-slate-800 active:bg-slate-900',
  };
  const sizes = {
    default: 'h-10 px-4 text-xs sm:h-11 sm:px-4 sm:text-sm min-h-[2.5rem] touch-target',
    sm: 'h-9 px-3 text-xs sm:h-10 sm:px-3 sm:text-sm min-h-[2rem]',
    icon: 'h-9 w-9 p-0 sm:h-10 sm:w-10 min-h-[2.25rem] min-w-[2.25rem]',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
