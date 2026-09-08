import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { LyricsOption } from '../../../types';
import { refineLyriaPrompt } from '../../services/genaiService';
import { VisualScenePicker, VisualImage } from '../../components/VisualScenePicker';

interface ManualConsoleProps {
  lyricsOption: LyricsOption;
  setLyricsOption: React.Dispatch<React.SetStateAction<LyricsOption>>;
  customLyrics: string;
  setCustomLyrics: (l: string) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  setIsPromptManual: (v: boolean) => void;
  voiceGender: 'Random' | 'Male' | 'Female';
  setVoiceGender: (v: 'Random' | 'Male' | 'Female') => void;
  selectedImages: VisualImage[];
  setSelectedImages: React.Dispatch<React.SetStateAction<VisualImage[]>>;
  culture?: string;
  onApplySceneCoordinates?: (coords: {
    promptText: string;
    mood: string;
    instrument: string;
    environment: string;
    culture?: string;
  }) => void;
}

export const ManualConsole: React.FC<ManualConsoleProps> = ({
  lyricsOption,
  setLyricsOption,
  customLyrics,
  setCustomLyrics,
  prompt,
  setPrompt,
  setIsPromptManual,
  voiceGender,
  setVoiceGender,
  selectedImages,
  setSelectedImages,
  culture = 'Chinese',
  onApplySceneCoordinates,
}) => {
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!prompt.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineLyriaPrompt(prompt);
      setPrompt(refined);
      setIsPromptManual(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
          Vocals / Lyrics
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-950/90 p-1.5 border border-slate-700/80 rounded-2xl">
          {(['Instrumental', 'Auto', 'Custom'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setLyricsOption(option)}
              aria-label={`Select ${option} lyrics option`}
              className={`px-1 sm:px-2 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[42px] sm:min-h-[38px] truncate ${
                lyricsOption === option
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {lyricsOption === 'Custom' && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex justify-between items-center">
            <span className="shrink-0">Custom Lyrics</span>
            <span className="text-[10px] text-slate-400 normal-case font-medium truncate ml-2">Lyria will attempt to sing these</span>
          </label>
          <textarea
            value={customLyrics}
            onChange={(e) => setCustomLyrics(e.target.value)}
            placeholder="Enter your custom lyrics here..."
            className="w-full h-28 bg-slate-950/90 border border-slate-700/90 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none resize-none custom-scrollbar font-medium shadow-inner"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
          Soundscape Description
        </label>
        <div className="relative w-full group">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setIsPromptManual(true);
            }}
            placeholder="Describe your desired soundscape or select a visual scene snapshot below..."
            className="w-full h-28 bg-slate-950/90 border border-slate-700/90 rounded-2xl p-3.5 pr-20 xs:pr-24 sm:pr-28 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none resize-none custom-scrollbar font-medium shadow-inner"
          />
          <button
            type="button"
            onClick={handleRefine}
            disabled={isRefining || !prompt.trim()}
            className="absolute top-2.5 right-2.5 z-10 px-2 sm:px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900/95 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white rounded-full backdrop-blur-md transition-all shadow-md shadow-cyan-950/60 disabled:opacity-40 cursor-pointer flex items-center gap-1 sm:gap-1.5 text-[10px] font-extrabold uppercase tracking-wider"
            aria-label="Refine prompt for Lyria with AI"
          >
            {isRefining ? (
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
            ) : (
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
            )}
            <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent font-extrabold">
              <span className="hidden xs:inline">{isRefining ? "Refining..." : "AI Enhance"}</span>
              <span className="xs:hidden">{isRefining ? "..." : "Enhance"}</span>
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
          Vocal Bias
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-950/90 p-1.5 border border-slate-700/80 rounded-2xl">
          {(['Random', 'Male', 'Female'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setVoiceGender(gender)}
              aria-label={`Select ${gender} vocal bias`}
              className={`px-1 sm:px-2 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[42px] sm:min-h-[38px] truncate ${
                voiceGender === gender
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Lyria 3.5 Multimodal Visual Scene Input & Snapshot Picker */}
      <VisualScenePicker
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        culture={culture}
        onApplySceneCoordinates={(coords) => {
          setPrompt(coords.promptText);
          setIsPromptManual(true);
          if (onApplySceneCoordinates) {
            onApplySceneCoordinates(coords);
          }
        }}
      />
    </div>
  );
};
