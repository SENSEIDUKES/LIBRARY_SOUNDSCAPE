import React, { useRef, useState } from 'react';
import { Camera, X, Sparkles, Loader2 } from 'lucide-react';
import { LyricsOption } from '../../../types';
import { refineLyriaPrompt } from '../../services/genaiService';

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
  selectedImages: { data: string; mimeType: string; previewUrl: string }[];
  setSelectedImages: React.Dispatch<React.SetStateAction<{ data: string; mimeType: string; previewUrl: string }[]>>;
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
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files) as File[];

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1];
        setSelectedImages((prev) => [
          ...prev,
          {
            data: base64Data,
            mimeType: file.type,
            previewUrl: resultStr,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
          Vocals / Lyrics
        </label>
        <div className="grid grid-cols-3 gap-2 bg-slate-950/90 p-1.5 border border-slate-700/80 rounded-2xl">
          {(['Instrumental', 'Auto', 'Custom'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setLyricsOption(option)}
              aria-label={`Select ${option} lyrics option`}
              className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[36px] ${
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
            <span>Custom Lyrics</span>
            <span className="text-[10px] text-slate-400 normal-case font-medium">Lyria will attempt to sing these</span>
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
            placeholder="Describe your desired soundscape..."
            className="w-full h-28 bg-slate-950/90 border border-slate-700/90 rounded-2xl p-3.5 pr-28 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none resize-none custom-scrollbar font-medium shadow-inner"
          />
          <button
            type="button"
            onClick={handleRefine}
            disabled={isRefining || !prompt.trim()}
            className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900/95 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white rounded-full backdrop-blur-md transition-all shadow-md shadow-cyan-950/60 disabled:opacity-40 cursor-pointer flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider"
            aria-label="Refine prompt for Lyria with AI"
          >
            {isRefining ? (
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            ) : (
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            )}
            <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent font-extrabold">
              {isRefining ? "Refining..." : "AI Enhance"}
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
          Vocal Bias
        </label>
        <div className="grid grid-cols-3 gap-2 bg-slate-950/90 p-1.5 border border-slate-700/80 rounded-2xl">
          {(['Random', 'Male', 'Female'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setVoiceGender(gender)}
              aria-label={`Select ${gender} vocal bias`}
              className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[36px] ${
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

      <div>
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
          Visual Reference (Optional)
        </label>
        <div className="flex flex-wrap gap-2 items-center bg-slate-950/90 p-3 rounded-2xl border border-slate-700/80 min-h-[56px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-600 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white cursor-pointer transition-colors"
            aria-label="Upload visual reference image"
          >
            <Camera className="w-5 h-5 text-cyan-300" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          {selectedImages.map((img, index) => (
            <div
              key={index}
              className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-600 group"
            >
              <img
                src={img.previewUrl}
                className="w-full h-full object-cover"
                alt="Uploaded reference"
              />
              <button
                onClick={() => removeImage(index)}
                aria-label={`Remove reference image ${index + 1}`}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
