import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-800/90 bg-slate-950/90 shadow-soft backdrop-blur',
        className,
      )}
      {...props}
    />
  );
}
