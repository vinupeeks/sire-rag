import { cn } from '../../utils/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-3xl border border-slate-300/70 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 sm:px-4 sm:py-3 sm:text-sm',
        className,
      )}
      {...props}
    />
  );
}
