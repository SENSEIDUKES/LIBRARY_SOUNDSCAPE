import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Pause, Download, Video, ChevronRight, Share2, Check, Heart, Trash2, Activity, Dices } from 'lucide-react';
import { SongResult } from '../../types';
import { extractMetadata, formatShareText, copyToClipboard, getCultureForSong, CULTURAL_THEMES } from '../utils/helpers';
import { detectBpmFromAudio, detectKeyFromAudio } from '../utils/audioUtils';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface SongResultCardProps {
  result: SongResult;
  isPlaying: boolean;
  isEncoding: boolean;
  onToggleExpand: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDownloadMP3: (result: SongResult) => void;
  onDownloadVideo: (result: SongResult, withLyrics?: boolean) => void;
  onPlayStateChange: (id: string | null) => void;
  onShare?: (result: SongResult) => void;
  onDelete?: (id: string) => void;
  onRerollTitle?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const SongResultCard: React.FC<SongResultCardProps> = ({
  result,
  isPlaying,
  isEncoding,
  onToggleExpand,
  onToggleFavorite,
  onDownloadMP3,
  onDownloadVideo,
  onPlayStateChange,
  onShare,
  onDelete,
  onRerollTitle,
  isSelected = false,
  onToggleSelect,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [realBpm, setRealBpm] = useState<number | null>(null);
  const [realKey, setRealKey] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if ((result.audioUrl || result.audioBase64) && (!realBpm || !realKey) && !isDetecting) {
      setIsDetecting(true);
      const audioSource = result.audioBase64 || result.audioUrl || '';
      Promise.all([
        detectBpmFromAudio(audioSource),
        detectKeyFromAudio(audioSource),
      ])
        .then(([bpmRes, keyRes]) => {
          if (bpmRes?.bpm) setRealBpm(bpmRes.bpm);
          if (keyRes?.key) setRealKey(keyRes.key);
        })
        .catch(() => {})
        .finally(() => setIsDetecting(false));
    }
  }, [result.audioUrl, result.audioBase64]);
  const isExpanded = result.isExpanded;
  const isGenerating = result.status === 'generating';
  const isFailed = result.status === 'error';
  const extMeta = extractMetadata(result.metadata, result.soundscapeConfig);
  const culture = getCultureForSong(result.soundscapeConfig, result.fullPrompt || result.originalPrompt, result.title);
  const theme = CULTURAL_THEMES[culture];

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(result.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(result.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedText = formatShareText(result);
    const success = await copyToClipboard(formattedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (onShare) {
      onShare(result);
    }
  };

  const handlePlayButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;

    const audio = document.getElementById(`audio-${result.id}`) as HTMLAudioElement;
    if (audio) {
      if (audio.paused) {
        audio.play().catch(e => console.warn('Play interrupted:', e));
      } else {
        audio.pause();
      }
    }
  };

  return (
    <div
      id={`soundscape-${result.id}`}
      className={`rounded-3xl p-4 transition-all border ${
        isExpanded
          ? `${theme.cardExpandedBorder} ${theme.cardExpandedBg} shadow-2xl ring-1 ${theme.ring}`
          : `${theme.cardBorder} ${theme.cardBg} hover:border-slate-500`
      }`}
    >
      <div
        className="flex items-center gap-2 sm:gap-3.5 min-w-0 cursor-pointer"
        onClick={handlePlayButtonClick}
      >
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(result.id);
            }}
            aria-label={isSelected ? "Deselect soundscape" : "Select soundscape"}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer min-w-[24px] ${
              isSelected
                ? 'bg-rose-500 text-white border-rose-400 shadow-sm shadow-rose-950 ring-2 ring-rose-400/50'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border-slate-700'
            }`}
          >
            {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
          </button>
        )}

        {/* Artwork Cover */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-600 bg-black/60 shadow-sm">
          {result.coverImageUrl ? (
            <img
              src={result.coverImageUrl}
              className="w-full h-full object-cover"
              alt={result.title || 'Soundscape cover'}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${theme.iconColor}`}>
              <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 ${isGenerating ? 'animate-pulse' : ''}`} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h4 className="font-extrabold text-xs sm:text-base text-white truncate">
              {isFailed
                ? 'Generation Diverged'
                : result.title || (isGenerating ? 'Synthesizing...' : 'Celestial Soundscape')}
            </h4>
            {onRerollTitle && !isGenerating && !isFailed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRerollTitle(result.id);
                }}
                className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors border border-slate-700/60 cursor-pointer min-w-[22px] min-h-[22px] flex items-center justify-center"
                title="Randomize / reroll song name"
                aria-label="Randomize / reroll song name"
              >
                <Dices className="w-3 h-3" />
              </button>
            )}
            <span className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold rounded-md shrink-0 uppercase tracking-tight shadow-xs border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
              {culture}
            </span>
            {result.modelId && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold bg-slate-800/90 text-slate-300 border border-slate-600 rounded-md shrink-0 uppercase tracking-tight shadow-xs">
                {result.modelId.replace('-preview', '')}
              </span>
            )}
          </div>
          <div className={`text-[11px] sm:text-xs font-mono font-semibold tracking-wide mt-0.5 truncate flex items-center gap-1.5 flex-wrap ${theme.accentText}`}>
            {realKey ? (
              <span className="inline-flex items-center gap-1 bg-amber-950/80 px-1.5 py-0.5 rounded-md border border-amber-400/40 text-[10px] text-amber-300 font-bold">
                🎹 {realKey}
              </span>
            ) : extMeta.key ? (
              <span>{extMeta.key}</span>
            ) : null}

            {(realKey || extMeta.key) && (realBpm || extMeta.tempo || isDetecting) && <span>•</span>}

            {realBpm ? (
              <span className="inline-flex items-center gap-1 bg-cyan-950/80 px-1.5 py-0.5 rounded-md border border-cyan-400/40 text-[10px] text-cyan-300 font-bold">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                {realBpm} BPM
              </span>
            ) : extMeta.tempo ? (
              <span>{extMeta.tempo}</span>
            ) : isDetecting ? (
              <span className="text-slate-400 italic text-[10px]">Analyzing audio...</span>
            ) : result.soundscapeConfig?.pacing ? (
              <span className="text-slate-400 font-sans text-[11px] font-semibold">{result.soundscapeConfig.pacing}</span>
            ) : null}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handleFavoriteClick}
            className={`w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              result.isFavorite
                ? 'bg-rose-500/30 text-rose-300 border border-rose-400/60 shadow-sm shadow-rose-950/40'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-rose-400 border border-slate-600'
            }`}
            title={result.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={result.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                result.isFavorite ? 'fill-rose-400 text-rose-300 scale-105' : ''
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadMP3(result);
            }}
            className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600"
            title="Download MP3 audio"
            aria-label="Download MP3 audio"
          >
            <Download className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.accentText}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer bg-slate-800/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 border border-slate-600 hover:border-rose-500/50"
            title="Delete soundscape"
            aria-label="Delete soundscape"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
          </button>

          <button
            onClick={handlePlayButtonClick}
            disabled={!result.audioUrl && !isGenerating}
            className={`w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isPlaying
                ? `${theme.playBtnBg}`
                : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600'
            }`}
            aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(result.id);
            }}
            className="p-1 sm:p-2 text-slate-300 hover:text-white transition-transform cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            title={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <ChevronRight
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                isExpanded ? `rotate-90 ${theme.accentText}` : ''
              }`}
            />
          </button>
        </div>
      </div>


      {/* Expandable details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-4 animate-in fade-in duration-200">
          {result.audioUrl && (
            <div className="space-y-3">
              <audio
                id={`audio-${result.id}`}
                src={result.audioUrl}
                onPlay={() => onPlayStateChange(result.id)}
                onPause={() => onPlayStateChange(null)}
                onEnded={() => onPlayStateChange(null)}
                controls
                className="w-full h-10 rounded-xl"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => onDownloadMP3(result)}
                  aria-label="Download MP3 audio file"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] transition-all border border-slate-600 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="truncate">Download MP3</span>
                </button>

                <button
                  onClick={() => onDownloadVideo(result)}
                  aria-label="Render and export video with visual scroll"
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/50 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] transition-all shadow-sm"
                  disabled={isEncoding}
                >
                  <Video className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
                  <span className="truncate">Render Video</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] transition-all border ${
                    copied
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                  }`}
                  title="Copy formatted metadata summary & direct link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span className="truncate">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span className="truncate">Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {result.chapterText && (
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                Excerpt Narrative
              </span>
              <div className="bg-slate-950/90 p-3 rounded-xl text-xs font-serif italic text-slate-200 max-h-24 overflow-y-auto custom-scrollbar border border-slate-800">
                {result.chapterText}
              </div>
            </div>
          )}

          {result.logs && result.logs.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Synthesis Logs
              </span>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-cyan-300 max-h-24 overflow-y-auto custom-scrollbar space-y-1 border border-slate-800">
                {result.logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        track={result}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SongResultCard;
