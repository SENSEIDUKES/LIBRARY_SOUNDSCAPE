import React from 'react';
import { StickyBottomPlayer, useAudioSession } from '@seihouse/audio-player';
import { X } from 'lucide-react';

export interface PlayerBarProps {
  title?: string;
  artist?: string;
  coverUrl?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onClose?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ onClose }) => {
  const session = useAudioSession();

  // If no track is currently queued in @seihouse/audio-player, do not render
  if (!session.currentTrack) return null;

  const handleClose = () => {
    session.pause();
    session.clearQueue();
    if (onClose) onClose();
  };

  return (
    <div id="seihouse-app-audio-player" className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-300 pb-[env(safe-area-inset-bottom,0px)] bg-[rgba(14,16,34,0.96)]">
      <div className="relative w-full">
        {/* Quick Close / Dismiss affordance */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close audio player"
          title="Dismiss player"
          className="absolute right-3 -top-8 sm:-top-9 z-50 px-2.5 py-1 rounded-t-lg bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 border-b-0 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-lg backdrop-blur-md min-h-[32px] active:scale-95"
        >
          <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="hidden xs:inline">Close</span>
        </button>

        {/* Official @seihouse/audio-player StickyBottomPlayer */}
        <StickyBottomPlayer
          accentColor="#06b6d4"
          progressColor="#06b6d4"
          backgroundColor="rgba(14, 16, 34, 0.96)"
          textColor="#F8FAFC"
          trackColor="rgba(255, 255, 255, 0.2)"
          glowColor="rgba(6, 182, 212, 0.3)"
          fixed={false}
          showVolume={true}
          className="shadow-2xl border-t border-cyan-500/30 backdrop-blur-2xl"
        />
      </div>
    </div>
  );
};

