// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <input
                className={`px-4 py-3 rounded-xl border transition-all outline-none
          ${error ? 'border-red-500' : 'border-slate-200 focus:border-orange-500'}
          bg-slate-50 focus:bg-white`}
                {...props}
            />
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
}