import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Pause, Download, Video, ChevronRight, Share2, Check, Heart, Trash2, Activity, Dices, Volume2, Pencil, X, Tag } from 'lucide-react';
import { useAudioSession, useAudioTime } from '@seihouse/audio-player';
import { SongResult, SoundscapeTags } from '../../types';
import { extractMetadata, formatShareText, copyToClipboard, getCultureForSong, CULTURAL_THEMES, formatDuration } from '../utils/helpers';
import { detectBpmFromAudio, detectKeyFromAudio } from '../utils/audioUtils';
import { songResultToTrack } from '../utils/seihouseAudioAdapter';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import QuickTaggingSystem from './QuickTaggingSystem';

interface SongResultCardProps {
  result: SongResult;
  isPlaying: boolean;
  isEncoding: boolean;
  onToggleExpand: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDownloadMP3: (result: SongResult) => void;
  onDownloadVideo?: (result: SongResult, withLyrics?: boolean) => void;
  onPlayStateChange: (id: string | null) => void;
  onShare?: (result: SongResult) => void;
  onDelete?: (id: string) => void;
  onRerollTitle?: (id: string) => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
  onUpdateTags?: (id: string, tags: SoundscapeTags) => void;
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
  onUpdateTitle,
  onUpdateTags,
  isSelected = false,
  onToggleSelect,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [realBpm, setRealBpm] = useState<number | null>(null);
  const [realKey, setRealKey] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(result.title || '');
  const [showExcerpt, setShowExcerpt] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isTaggingOpen, setIsTaggingOpen] = useState(true);
  const [localTags, setLocalTags] = useState<SoundscapeTags>(result.tags || {});

  useEffect(() => {
    if (result.tags) {
      setLocalTags(result.tags);
    }
  }, [result.tags]);

  const handleTagsChange = (newTags: SoundscapeTags) => {
    setLocalTags(newTags);
    if (onUpdateTags) {
      onUpdateTags(result.id, newTags);
    }
  };

  useEffect(() => {
    if (!isEditingTitle) {
      setCustomTitle(result.title || '');
    }
  }, [result.title, isEditingTitle]);

  const handleStartEditTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTitle(result.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    const trimmed = customTitle.trim();
    if (trimmed && onUpdateTitle) {
      onUpdateTitle(result.id, trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomTitle(result.title || '');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancelEditTitle();
    }
  };

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

  const session = useAudioSession();
  const audioTime = useAudioTime();
  const isThisActiveTrack = session.currentTrack?.id === result.id;
  const isCardPlaying = isThisActiveTrack && session.isPlaying;

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

  const handlePlayButtonClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isGenerating) return;
    if (!result.audioUrl && !result.audioBase64) return;

    if (isThisActiveTrack) {
      session.toggle();
    } else {
      session.playNow(songResultToTrack(result));
      if (onPlayStateChange) {
        onPlayStateChange(result.id);
      }
    }
  };

  return (
    <div
      id={`soundscape-${result.id}`}
      className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-200 border ${
        isExpanded
          ? `z-30 ${theme.cardExpandedBorder} ${theme.cardExpandedBg} shadow-2xl ring-1 ${theme.ring}`
          : isThisActiveTrack
          ? `z-20 ${theme.cardBorder} ${theme.cardBg} hover:border-slate-500 shadow-lg`
          : `z-0 ${theme.cardBorder} ${theme.cardBg} hover:border-slate-500`
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
        <div className="relative w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-600 bg-black/60 shadow-sm">
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
          {isCardPlaying && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex gap-0.5 items-center justify-center">
              <span className="eq-bar !h-2"></span>
              <span className="eq-bar !h-3"></span>
              <span className="eq-bar !h-2"></span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
            {isEditingTitle ? (
              <div
                className="flex items-center gap-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  maxLength={60}
                  aria-label="Custom song name"
                  className="bg-slate-900/90 text-white font-extrabold text-xs sm:text-sm px-2 py-0.5 rounded-lg border border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-300 w-32 xs:w-44 sm:w-52 shadow-inner"
                  placeholder="Enter custom song name..."
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  aria-label="Save song name"
                  title="Save song name"
                  className="p-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 cursor-pointer min-w-[22px] min-h-[22px] flex items-center justify-center transition-colors"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditTitle}
                  aria-label="Cancel renaming"
                  title="Cancel renaming"
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer min-w-[22px] min-h-[22px] flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <h4
                  className="font-extrabold text-xs sm:text-base text-white truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none hover:text-cyan-200 transition-colors"
                  title={!isGenerating && !isFailed && onUpdateTitle ? "Double click or click pencil to rename" : undefined}
                  onDoubleClick={!isGenerating && !isFailed && onUpdateTitle ? handleStartEditTitle : undefined}
                >
                  {isFailed
                    ? 'Generation Diverged'
                    : result.title || (isGenerating ? 'Synthesizing...' : 'Celestial Soundscape')}
                </h4>
                {onUpdateTitle && !isGenerating && !isFailed && (
                  <button
                    type="button"
                    onClick={handleStartEditTitle}
                    className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors border border-slate-700/60 cursor-pointer min-w-[20px] min-h-[20px] flex items-center justify-center"
                    title="Rename / custom name song"
                    aria-label="Rename / custom name song"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
            {onRerollTitle && !isGenerating && !isFailed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRerollTitle(result.id);
                }}
                className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors border border-slate-700/60 cursor-pointer min-w-[20px] min-h-[20px] flex items-center justify-center"
                title="Randomize / reroll song name"
                aria-label="Randomize / reroll song name"
              >
                <Dices className="w-3 h-3" />
              </button>
            )}
            <span className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold rounded-md shrink-0 uppercase tracking-tight shadow-xs border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
              {culture}
            </span>
            {localTags.parent && (
              <span className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-black rounded-md shrink-0 uppercase tracking-tight shadow-xs border ${
                localTags.parent === 'ADVENTURE'
                  ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                  : localTags.parent === 'AMBIENT'
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50'
                  : localTags.parent === 'EMOTIONS'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-400/50'
                  : localTags.parent === 'FIGHTING'
                  ? 'bg-orange-500/30 text-orange-200 border-orange-400/50'
                  : localTags.parent === 'WAR'
                  ? 'bg-red-500/30 text-red-200 border-red-400/50'
                  : 'bg-amber-500/30 text-amber-200 border-amber-400/50'
              }`}>
                🏷️ {localTags.parent}
              </span>
            )}
            {result.modelId && (
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold bg-slate-800/90 text-slate-300 border border-slate-600 rounded-md shrink-0 uppercase tracking-tight shadow-xs">
                {result.modelId.replace('-preview', '')}
              </span>
            )}
          </div>
          <div className={`text-[10px] sm:text-xs font-mono font-semibold tracking-wide mt-0.5 truncate flex items-center gap-1 sm:gap-1.5 flex-wrap ${theme.accentText}`}>
            {realKey ? (
              <span className="inline-flex items-center gap-1 bg-amber-950/80 px-1.5 py-0.5 rounded-md border border-amber-400/40 text-[9px] sm:text-[10px] text-amber-300 font-bold">
                🎹 {realKey}
              </span>
            ) : extMeta.key ? (
              <span>{extMeta.key}</span>
            ) : null}

            {(realKey || extMeta.key) && (realBpm || extMeta.tempo || isDetecting) && <span>•</span>}

            {realBpm ? (
              <span className="inline-flex items-center gap-1 bg-cyan-950/80 px-1.5 py-0.5 rounded-md border border-cyan-400/40 text-[9px] sm:text-[10px] text-cyan-300 font-bold">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                {realBpm} BPM
              </span>
            ) : extMeta.tempo ? (
              <span>{extMeta.tempo}</span>
            ) : isDetecting ? (
              <span className="text-slate-400 italic text-[10px]">Analyzing audio...</span>
            ) : result.soundscapeConfig?.pacing ? (
              <span className="text-slate-400 font-sans text-[10px] sm:text-[11px] font-semibold">{result.soundscapeConfig.pacing}</span>
            ) : null}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handleFavoriteClick}
            className={`w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
              result.isFavorite
                ? 'bg-rose-500/30 text-rose-300 border border-rose-400/60 shadow-sm shadow-rose-950/40'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-rose-400 border border-slate-600'
            }`}
            title={result.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={result.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                result.isFavorite ? 'fill-rose-400 text-rose-300 scale-105' : ''
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadMP3(result);
            }}
            className="hidden xs:flex w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full items-center justify-center transition-all cursor-pointer bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600"
            title="Download MP3 audio"
            aria-label="Download MP3 audio"
          >
            <Download className={`w-4 h-4 ${theme.accentText}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all cursor-pointer bg-slate-800/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 border border-slate-600 hover:border-rose-500/50"
            title="Delete soundscape"
            aria-label="Delete soundscape"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
          </button>

          <button
            onClick={handlePlayButtonClick}
            disabled={!result.audioUrl && !result.audioBase64 && !isGenerating}
            className={`w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCardPlaying
                ? `${theme.playBtnBg}`
                : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600'
            }`}
            aria-label={isCardPlaying ? 'Pause soundscape' : 'Play soundscape'}
          >
            {isCardPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
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
        <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-4 animate-in fade-in duration-200 relative z-10">
          {(result.audioUrl || result.audioBase64) && (
            <div className="space-y-3">
              {isThisActiveTrack ? (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-inner space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => session.toggle()}
                        aria-label={session.isPlaying ? 'Pause' : 'Play'}
                        className="w-9 h-9 rounded-full bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-200 flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-transform active:scale-95"
                      >
                        {session.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono text-cyan-300 font-bold block truncate">
                          Playing in @seihouse/audio-player
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDuration(audioTime.currentTime)} / {formatDuration(audioTime.duration || 30)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => session.toggleMute()}
                      aria-label={session.isMuted ? 'Unmute' : 'Mute'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors border border-slate-700"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${session.isMuted ? 'text-rose-400' : 'text-cyan-300'}`} />
                    </button>
                  </div>

                  {/* Scrubber slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={audioTime.duration || 30}
                      step={0.1}
                      value={audioTime.currentTime || 0}
                      onChange={(e) => session.seek(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      aria-label="Seek track"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={handlePlayButtonClick}
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-cyan-500/20 border border-slate-600 hover:border-cyan-400 text-white hover:text-cyan-300 flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-all active:scale-95"
                      aria-label="Play soundscape"
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate">
                        {result.title || 'Celestial Soundscape'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ready for playback in @seihouse/audio-player
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePlayButtonClick}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold shrink-0 cursor-pointer transition-all"
                  >
                    Play Now
                  </button>
                </div>
              )}

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
                  id={`tag-tab-${result.id}`}
                  type="button"
                  onClick={() => setIsTaggingOpen((prev) => !prev)}
                  aria-label={isTaggingOpen ? "Hide quick tagging system" : "Open quick tagging system"}
                  aria-expanded={isTaggingOpen}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] transition-all shadow-sm border ${
                    isTaggingOpen
                      ? 'bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-950/60 font-black'
                      : localTags.parent
                      ? 'bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-600'
                  }`}
                >
                  <Tag className={`w-3.5 h-3.5 shrink-0 ${isTaggingOpen || localTags.parent ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span className="truncate">
                    {localTags.parent ? `Tags: ${localTags.parent}` : 'Quick Tags'}
                  </span>
                  {localTags.parent && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-mono font-bold">
                      {[localTags.tone, localTags.energy, localTags.tension].filter(Boolean).length}/3
                    </span>
                  )}
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

              {/* Quick Parent-Child Tagging System */}
              {isTaggingOpen && (
                <QuickTaggingSystem
                  tags={localTags}
                  onChange={handleTagsChange}
                  onClose={() => setIsTaggingOpen(false)}
                />
              )}
            </div>
          )}

          {result.chapterText && (
            <div className="space-y-1.5 rounded-xl bg-slate-950/50 p-2.5 border border-slate-800 transition-all">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExcerpt(!showExcerpt);
                }}
                className="flex items-center justify-between w-full text-xs font-extrabold text-cyan-300 hover:text-cyan-200 uppercase tracking-wider px-1 py-0.5 rounded-md cursor-pointer transition-colors"
                aria-expanded={showExcerpt}
                aria-label={showExcerpt ? "Minimize excerpt narrative" : "Expand excerpt narrative"}
                title={showExcerpt ? "Minimize excerpt narrative" : "Expand excerpt narrative"}
              >
                <span className="flex items-center gap-1.5">
                  <span>Excerpt Narrative</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    ({showExcerpt ? 'Expanded' : 'Minimized'})
                  </span>
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform text-cyan-400 ${showExcerpt ? 'rotate-90' : ''}`} />
              </button>
              {showExcerpt && (
                <div className="bg-slate-950/90 p-3 rounded-lg text-xs font-serif italic text-slate-200 max-h-28 overflow-y-auto custom-scrollbar border border-slate-800 animate-in fade-in duration-150">
                  {result.chapterText}
                </div>
              )}
            </div>
          )}

          {result.logs && result.logs.length > 0 && (
            <div className="space-y-1.5 rounded-xl bg-slate-950/50 p-2.5 border border-slate-800 transition-all">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLogs(!showLogs);
                }}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider px-1 py-0.5 rounded-md cursor-pointer transition-colors"
                aria-expanded={showLogs}
                aria-label={showLogs ? "Minimize synthesis logs" : "Expand synthesis logs"}
                title={showLogs ? "Minimize synthesis logs" : "Expand synthesis logs"}
              >
                <span className="flex items-center gap-1.5">
                  <span>Synthesis Logs</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    ({result.logs.length} {result.logs.length === 1 ? 'entry' : 'entries'} • {showLogs ? 'Expanded' : 'Minimized'})
                  </span>
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform text-slate-400 ${showLogs ? 'rotate-90' : ''}`} />
              </button>
              {showLogs && (
                <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-cyan-300 max-h-28 overflow-y-auto custom-scrollbar space-y-1 border border-slate-800 animate-in fade-in duration-150">
                  {result.logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              )}
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
