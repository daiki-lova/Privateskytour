import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, CircleAlert, X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link', size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border border-transparent',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ghost: 'hover:bg-slate-100 text-slate-600',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent',
      link: 'text-indigo-600 hover:underline p-0 h-auto'
    };
    const sizes = {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 py-2 text-sm',
      lg: 'h-11 px-6 text-base',
      icon: 'h-9 w-9 p-2 flex items-center justify-center'
    };
    return (
      <button 
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 tracking-tight',
          variants[variant],
          sizes[size],
          className
        )} 
        {...props} 
      />
    );
  }
);

export const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'secondary' | 'vip' | 'black', className?: string }) => {
  const variants = {
    default: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    error: 'bg-red-50 text-red-700 border border-red-100',
    outline: 'border border-slate-200 text-slate-600 bg-transparent',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    vip: 'bg-indigo-600 text-white border border-indigo-700 shadow-sm',
    black: 'bg-slate-800 text-white border border-slate-900 shadow-sm'
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide', variants[variant], className)}>
      {children}
    </span>
  );
};

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] min-w-0', className)}>
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));

export const Label = ({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 mb-2 block tracking-tight", className)} {...props}>
    {children}
  </label>
);

export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm text-left">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b bg-slate-50/50 sticky top-0 z-10">
    {children}
  </thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
);

export const TableRow = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <tr className={cn("border-b border-slate-100 transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-50", className, onClick && "cursor-pointer")} onClick={onClick}>
    {children}
  </tr>
);

export const TableHead = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <th className={cn("h-10 px-4 text-left align-middle text-xs font-semibold text-slate-500 [&:has([role=checkbox])]:pr-0 tracking-wide bg-slate-50/50", className)}>
    {children}
  </th>
);

export const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm", className)}>
    {children}
  </td>
);

export const Modal = ({ isOpen, onClose, title, children, footer }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, footer?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-5 border",
      type === 'success' ? "bg-white text-slate-900 border-slate-200" : "bg-red-50 text-red-900 border-red-100"
    )}>
      {type === 'success' ? <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600" /></div> : <CircleAlert className="w-5 h-5 text-red-600" />}
      {message}
    </div>
  );
};
