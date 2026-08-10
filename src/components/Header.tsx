import React from 'react';
import { Sliders, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  totalTokens: number;
  estimatedCost: string;
  onOpenSettings: () => void;
  onOpenBpmDetector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalTokens,
  estimatedCost,
  onOpenSettings,
  onOpenBpmDetector,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070814]/90 backdrop-blur-2xl border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between select-none shadow-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-2xl overflow-hidden border border-slate-600 shadow-md transition-transform duration-300 hover:scale-105 shrink-0">
          <img
            src="https://pub-e482c2dbbb984c3c87ecdd8ae3a92183.r2.dev/LIBRARY/images/CELESTIAL%20LIBRARY%20ICON.jpg"
            alt="SEN Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-sm font-extrabold tracking-tight text-white leading-none">
            SEN Soundscapes
          </span>
          <span className="text-[11px] text-cyan-300 font-bold tracking-wide mt-0.5">
            Light Novel Companion
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Token Pill */}
        <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 rounded-full border border-slate-700 text-xs font-sans shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-200 font-medium">
            <span className="text-white font-extrabold">{totalTokens}</span> tok
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-extrabold">${estimatedCost}</span>
        </div>

        {/* BPM Detector Button */}
        {onOpenBpmDetector && (
          <button
            onClick={onOpenBpmDetector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-xs font-bold text-cyan-200 transition-all active:scale-95 cursor-pointer min-h-[36px] shadow-sm"
            aria-label="Open Real BPM Detector"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">BPM Detector</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer min-h-[36px] shadow-sm"
          aria-label="Open Settings"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
