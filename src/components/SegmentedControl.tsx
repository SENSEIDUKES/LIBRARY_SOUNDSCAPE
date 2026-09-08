import React from 'react';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  const paddingMap = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-xs',
    lg: 'p-1 sm:p-1.5 text-xs sm:text-sm',
  };

  const buttonPaddingMap = {
    sm: 'px-2 py-1',
    md: 'px-3 sm:px-4 py-1.5 sm:py-2',
    lg: 'px-2 sm:px-4 md:px-5 py-2 sm:py-2.5',
  };

  return (
    <div
      className={`relative w-full overflow-hidden flex items-center bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-full select-none shadow-sm ${paddingMap[size]} ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            aria-label={`Switch view to ${option.label}`}
            onClick={() => onChange(option.id)}
            className={`relative flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-full font-bold transition-all duration-300 ease-out cursor-pointer min-h-[42px] sm:min-h-[44px] ${
              buttonPaddingMap[size]
            } ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/60 shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {option.icon && <span className="shrink-0 text-cyan-300">{option.icon}</span>}
            <span className="truncate whitespace-nowrap">{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-cyan-400/30 text-cyan-200 border border-cyan-400/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
