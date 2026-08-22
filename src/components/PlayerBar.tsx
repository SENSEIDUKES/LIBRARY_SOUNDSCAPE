import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, X, Music } from 'lucide-react';
import { AudioScrubber } from './AudioScrubber';
import { seekAudio } from '../utils/audioUtils';

interface PlayerBarProps {
  title: string;
  artist: string;
  coverUrl?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  audioId?: string;
  culture?: string;
  presetDuration?: number;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  title,
  artist,
  coverUrl,
  isPlaying,
  onTogglePlay,
  onClose,
  audioId,
  culture = 'Chinese',
  presetDuration,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(presetDuration || 0);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const presetTimerRef = useRef<number | null>(null);

  // Sync with actual HTML Audio element if audioId is provided
  useEffect(() => {
    if (!audioId || typeof document === 'undefined') {
      if (presetDuration) {
        setDuration(presetDuration);
      }
      return;
    }

    const audio = document.getElementById(audioId) as HTMLAudioElement | null;
    if (!audio) return;

    const updateTimes = () => {
      setCurrentTime(audio.currentTime);
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      // Calculate buffer percent
      if (audio.buffered.length > 0 && isFinite(audio.duration) && audio.duration > 0) {
        try {
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          setBufferedPercent((bufferedEnd / audio.duration) * 100);
        } catch (_) {}
      }
    };

    updateTimes();

    audio.addEventListener('timeupdate', updateTimes);
    audio.addEventListener('loadedmetadata', updateTimes);
    audio.addEventListener('durationchange', updateTimes);
    audio.addEventListener('progress', updateTimes);
    audio.addEventListener('ended', updateTimes);

    return () => {
      audio.removeEventListener('timeupdate', updateTimes);
      audio.removeEventListener('loadedmetadata', updateTimes);
      audio.removeEventListener('durationchange', updateTimes);
      audio.removeEventListener('progress', updateTimes);
      audio.removeEventListener('ended', updateTimes);
    };
  }, [audioId, presetDuration]);

  // Handle synthesized preset timer progress
  useEffect(() => {
    if (!audioId && presetDuration && isPlaying) {
      const startTime = Date.now();
      setCurrentTime(0);
      setDuration(presetDuration);

      presetTimerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= presetDuration) {
          setCurrentTime(presetDuration);
          if (presetTimerRef.current) {
            clearInterval(presetTimerRef.current);
            presetTimerRef.current = null;
          }
        } else {
          setCurrentTime(elapsed);
        }
      }, 50);

      return () => {
        if (presetTimerRef.current) {
          clearInterval(presetTimerRef.current);
          presetTimerRef.current = null;
        }
      };
    }
  }, [audioId, presetDuration, isPlaying]);

  const handleSeek = useCallback(
    (targetTime: number) => {
      if (audioId && typeof document !== 'undefined') {
        const audio = document.getElementById(audioId) as HTMLAudioElement | null;
        if (audio) {
          const newTime = seekAudio(audio, targetTime);
          setCurrentTime(newTime);
          return;
        }
      }
      setCurrentTime(targetTime);
    },
    [audioId]
  );

  const handleSeekDelta = useCallback(
    (delta: number) => {
      if (audioId && typeof document !== 'undefined') {
        const audio = document.getElementById(audioId) as HTMLAudioElement | null;
        if (audio) {
          const newTime = seekAudio(audio, delta, true);
          setCurrentTime(newTime);
          return;
        }
      }
      setDuration((prevDuration) => {
        const max = prevDuration || 0;
        setCurrentTime((prev) => Math.max(0, max > 0 ? Math.min(max, prev + delta) : prev + delta));
        return prevDuration;
      });
    },
    [audioId]
  );

  return (
    <div
      id="persistent-player-bar"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] md:w-[450px] z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#0b0e20]/98 backdrop-blur-2xl border border-cyan-400/50 rounded-3xl p-3 sm:p-3.5 shadow-2xl shadow-cyan-950/70 ring-1 ring-white/15 space-y-2">
        {/* Upper Track Info & Controls Row */}
        <div className="flex items-center justify-between gap-2.5 min-w-0">
          {/* Artwork & Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-slate-600 bg-black/60 shadow-sm">
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
              <h4 className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
                {title}
              </h4>
              <p className="text-[11px] text-cyan-300 font-bold truncate mt-0.5">
                {artist}
              </p>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-slate-700/80 ml-1 shrink-0">
            <button
              id="player-bar-toggle-play"
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md shadow-cyan-950/60 border border-cyan-300/40"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            <button
              id="player-bar-close-btn"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-800 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close persistent player bar"
              title="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lower Scrubber & Seeking Row */}
        <div className="pt-1 border-t border-slate-800/80">
          <AudioScrubber
            id="player-bar-scrubber"
            currentTime={currentTime}
            duration={duration}
            bufferedPercent={bufferedPercent}
            onSeek={handleSeek}
            onSeekDelta={handleSeekDelta}
            culture={culture}
            showSkipButtons={true}
            skipSeconds={5}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
