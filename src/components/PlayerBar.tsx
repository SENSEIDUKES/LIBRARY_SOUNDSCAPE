import React from 'react';
import { Play, Pause, X, Music } from 'lucide-react';

interface PlayerBarProps {
  title: string;
  artist: string;
  coverUrl?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  title,
  artist,
  coverUrl,
  isPlaying,
  onTogglePlay,
  onClose,
}) => {
  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between bg-[#0e1022]/98 backdrop-blur-2xl border border-cyan-400/50 rounded-3xl p-2.5 sm:p-3.5 shadow-2xl shadow-cyan-950/60 ring-1 ring-white/15">
        {/* Artwork & Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-slate-600 bg-black/60">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400">
                <Music className="w-5 h-5" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex gap-0.5 items-center justify-center">
                <span className="eq-bar !h-2"></span>
                <span className="eq-bar !h-3"></span>
                <span className="eq-bar !h-2"></span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-extrabold text-white truncate leading-tight">
              {title}
            </h4>
            <p className="text-[11px] text-cyan-300 font-bold truncate mt-0.5">
              {artist}
            </p>
          </div>
        </div>

        {/* Player Action Buttons */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700 ml-2 shrink-0">
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/60 text-cyan-200 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-sm"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-800 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close player bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
