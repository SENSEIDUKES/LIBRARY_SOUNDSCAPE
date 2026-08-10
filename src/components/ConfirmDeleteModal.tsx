import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Sparkles } from 'lucide-react';
import { SongResult } from '../../types';
import { extractMetadata } from '../utils/helpers';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  track: SongResult | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  track,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  const extMeta = extractMetadata(track.metadata, track.soundscapeConfig);
  const trackTitle =
    track.title ||
    (track.status === 'error' ? 'Failed Generation' : 'Celestial Soundscape');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        className="relative w-full max-w-md bg-[#0a0c1a] border border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-gray-100 ring-1 ring-rose-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500" />

        {/* Header & Close Button */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/40">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3
                id="confirm-delete-title"
                className="text-lg sm:text-xl font-extrabold text-white tracking-wide"
              >
                Delete Soundscape?
              </h3>
              <p className="text-xs text-rose-300 font-semibold tracking-wide">
                Confirmation required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Preview Info Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-inner">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-black/60 flex items-center justify-center">
            {track.coverImageUrl ? (
              <img
                src={track.coverImageUrl}
                alt={trackTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-white truncate">
              {trackTitle}
            </h4>
            <p className="text-xs text-cyan-300 font-mono font-medium truncate mt-0.5">
              {extMeta.key} • {extMeta.tempo}
            </p>
            {track.soundscapeConfig?.instrument && (
              <p className="text-[11px] text-slate-400 font-sans truncate">
                Instrument: {track.soundscapeConfig.instrument}
              </p>
            )}
          </div>
        </div>

        {/* Warning Message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Are you sure you want to permanently delete this soundscape track from your vault? This action cannot be undone.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-extrabold border border-slate-600 transition-all cursor-pointer min-h-[44px] flex items-center justify-center active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-950/60 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2 border border-rose-400/30 active:scale-[0.98]"
            autoFocus
          >
            <Trash2 className="w-4 h-4" />
            Delete Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
