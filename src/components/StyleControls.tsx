import React from 'react';
import { Sliders } from 'lucide-react';

export interface StyleControlsProps {
  culture?: string;
  onCultureChange?: (culture: string) => void;
  pacing: string;
  onPacingChange: (pacing: string) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  className?: string;
  showTitle?: boolean;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  pacing,
  onPacingChange,
  intensity,
  onIntensityChange,
  className = '',
  showTitle = false,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Acoustic & Pacing Parameters
          </label>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-sm shadow-inner transition-all hover:border-slate-600">
        {/* Pacing */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
            Pacing
          </label>
          <select
            className="w-full bg-[#0d0e1e] text-white font-medium border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer transition-all min-h-[40px] hover:border-slate-500"
            value={pacing}
            onChange={(e) => onPacingChange(e.target.value)}
            aria-label="Select Pacing speed"
          >
            <option value="slow pacing">Slow & Suspenseful</option>
            <option value="moderate pacing">Moderate / Steady</option>
            <option value="fast pacing">Fast-Paced</option>
            <option value="frenzied pacing">Frenzied / Chaotic</option>
          </select>
        </div>

        {/* Intensity */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
            <span>Intensity</span>
            <span className="text-cyan-300 font-mono text-xs bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-400/40 font-bold">
              {intensity.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={intensity}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            aria-label="Adjust intensity level"
            className="w-full accent-cyan-400 mt-2 cursor-pointer h-2 bg-slate-800 border border-slate-700 rounded-lg transition-all"
          />
        </div>
      </div>
    </div>
  );
};
