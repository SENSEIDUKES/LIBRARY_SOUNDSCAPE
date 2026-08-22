import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { formatAudioTime } from '../utils/audioUtils';

export interface AudioScrubberProps {
  id?: string;
  currentTime: number;
  duration: number;
  onSeek: (targetTime: number) => void;
  onSeekDelta?: (deltaSeconds: number) => void;
  bufferedPercent?: number;
  culture?: 'Chinese' | 'Japanese' | 'Korean' | 'Western' | string;
  showTimeLabels?: boolean;
  showSkipButtons?: boolean;
  skipSeconds?: number;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AudioScrubber: React.FC<AudioScrubberProps> = ({
  id,
  currentTime,
  duration,
  onSeek,
  onSeekDelta,
  bufferedPercent = 0,
  culture = 'Chinese',
  showTimeLabels = true,
  showSkipButtons = false,
  skipSeconds = 5,
  compact = false,
  className = '',
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const effectiveDuration = duration > 0 ? duration : 0;
  const displayTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progressPercent = effectiveDuration > 0
    ? Math.min(100, Math.max(0, (displayTime / effectiveDuration) * 100))
    : 0;

  // Theme color styling based on culture
  const getAccentGradient = () => {
    switch (culture) {
      case 'Japanese':
        return 'from-emerald-400 to-teal-500';
      case 'Korean':
        return 'from-rose-400 to-red-500';
      case 'Western':
        return 'from-purple-400 to-indigo-500';
      case 'Chinese':
      default:
        return 'from-cyan-400 to-blue-500';
    }
  };

  const getThumbBorder = () => {
    switch (culture) {
      case 'Japanese':
        return 'border-emerald-300 ring-emerald-400/40';
      case 'Korean':
        return 'border-rose-300 ring-rose-400/40';
      case 'Western':
        return 'border-purple-300 ring-purple-400/40';
      case 'Chinese':
      default:
        return 'border-cyan-300 ring-cyan-400/40';
    }
  };

  const getAccentText = () => {
    switch (culture) {
      case 'Japanese':
        return 'text-emerald-300';
      case 'Korean':
        return 'text-rose-300';
      case 'Western':
        return 'text-purple-300';
      case 'Chinese':
      default:
        return 'text-cyan-300';
    }
  };

  const getTimeFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current || effectiveDuration <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const fraction = Math.max(0, Math.min(1, clickX / rect.width));
      return fraction * effectiveDuration;
    },
    [effectiveDuration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || effectiveDuration <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newTime = getTimeFromPointer(e.clientX);
    setDragTime(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || effectiveDuration <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));

    setHoverPosition(clickX);
    setHoverTime(fraction * effectiveDuration);

    if (isDragging) {
      setDragTime(fraction * effectiveDuration);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      setIsDragging(false);
      if (dragTime !== null) {
        onSeek(dragTime);
        setDragTime(null);
      }
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverTime(null);
      setHoverPosition(null);
    }
  };

  const handleSkip = (delta: number) => {
    if (disabled || effectiveDuration <= 0) return;
    if (onSeekDelta) {
      onSeekDelta(delta);
    } else {
      const target = Math.max(0, Math.min(effectiveDuration, currentTime + delta));
      onSeek(target);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || effectiveDuration <= 0) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSkip(-skipSeconds);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleSkip(skipSeconds);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeek(effectiveDuration);
    }
  };

  return (
    <div
      id={id}
      className={`flex flex-col select-none ${className}`}
      role="region"
      aria-label="Audio scrubber and playback controls"
    >
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {showSkipButtons && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip(-skipSeconds);
            }}
            disabled={disabled || effectiveDuration <= 0}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center border border-slate-700 disabled:opacity-30"
            title={`Skip backward ${skipSeconds}s`}
            aria-label={`Skip backward ${skipSeconds} seconds`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono font-bold ml-0.5">-{skipSeconds}</span>
          </button>
        )}

        {/* Scrubber Track Area */}
        <div className="relative flex-1 flex items-center py-2 group cursor-pointer">
          {/* Hover Time Tooltip */}
          {hoverTime !== null && hoverPosition !== null && !disabled && (
            <div
              className="absolute -top-6 -translate-x-1/2 bg-slate-900/95 border border-slate-700 text-white font-mono text-[10px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-30 transition-opacity"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatAudioTime(hoverTime)}
            </div>
          )}

          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            className={`relative w-full rounded-full overflow-visible transition-all ${
              compact ? 'h-1.5 group-hover:h-2' : 'h-2 group-hover:h-2.5'
            } bg-slate-800/90 border border-slate-700/60 shadow-inner`}
          >
            {/* Buffered progress track */}
            {bufferedPercent > 0 && (
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full bg-slate-700/50 transition-all duration-300"
                style={{ width: `${Math.min(100, bufferedPercent)}%` }}
              />
            )}

            {/* Active played progress fill */}
            <div
              className={`absolute top-0 left-0 bottom-0 rounded-full bg-gradient-to-r ${getAccentGradient()} shadow-xs shadow-cyan-950 transition-[width] duration-75`}
              style={{ width: `${progressPercent}%` }}
            />

            {/* Scrubber thumb handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-2 ${getThumbBorder()} shadow-md transition-transform ring-2 group-hover:scale-110 active:scale-125 ${
                isDragging ? 'scale-125 ring-4' : 'opacity-90 group-hover:opacity-100'
              }`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Accessible hidden range input for keyboard / screen-reader accessibility */}
          <input
            type="range"
            min={0}
            max={effectiveDuration || 100}
            step={0.1}
            value={displayTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            onKeyDown={handleKeyDown}
            disabled={disabled || effectiveDuration <= 0}
            aria-label="Seek playback position"
            aria-valuemin={0}
            aria-valuemax={effectiveDuration}
            aria-valuenow={displayTime}
            aria-valuetext={`${formatAudioTime(displayTime)} of ${formatAudioTime(effectiveDuration)}`}
            className="sr-only"
          />
        </div>

        {showSkipButtons && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip(skipSeconds);
            }}
            disabled={disabled || effectiveDuration <= 0}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center border border-slate-700 disabled:opacity-30"
            title={`Skip forward ${skipSeconds}s`}
            aria-label={`Skip forward ${skipSeconds} seconds`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono font-bold ml-0.5">+{skipSeconds}</span>
          </button>
        )}
      </div>

      {showTimeLabels && (
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 px-0.5 mt-0.5">
          <span className={getAccentText()}>{formatAudioTime(displayTime)}</span>
          <span className="text-slate-500">{formatAudioTime(effectiveDuration)}</span>
        </div>
      )}
    </div>
  );
};

export default AudioScrubber;
