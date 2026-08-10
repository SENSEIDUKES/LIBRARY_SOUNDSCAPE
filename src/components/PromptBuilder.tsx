import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, SlidersHorizontal, Wand2 } from 'lucide-react';
import { StyleControls } from './StyleControls';
import { refineLyriaPrompt } from '../services/genaiService';

export interface SoundscapeConfig {
  culture?: string;
  mood: string;
  instrument: string;
  pacing: string;
  mainTexture: string;
  environmentalTexture: string;
  sceneAtmosphere: string;
  emotionalDirection: string;
  endingDirection: string;
  vocals: string;
  intensity?: number;
}

interface PromptBuilderProps {
  config: SoundscapeConfig;
  setConfig: React.Dispatch<React.SetStateAction<SoundscapeConfig>>;
  isTranslating: boolean;
  setIsTranslating: React.Dispatch<React.SetStateAction<boolean>>;
  chapterText: string;
  setChapterText: React.Dispatch<React.SetStateAction<string>>;
  onGeneratePrompt: () => void;
  culture?: string;
  setCulture?: (culture: string) => void;
  pacing?: string;
  setPacing?: (pacing: string) => void;
  intensity?: number;
  setIntensity?: (intensity: number) => void;
}

// Local word heuristic dictionaries
const KEYWORD_DICTIONARY = {
  mood: [
    { words: ['sad', 'grief', 'tear', 'cry', 'loss', 'sorrow', 'mourn', 'tragedy'], value: 'sorrowful', texture: 'emotional bowed melodies' },
    { words: ['blood', 'kill', 'fight', 'sword', 'blade', 'enemy', 'die', 'strike'], value: 'tense', texture: 'rapid striking rhythm' },
    { words: ['peace', 'calm', 'quiet', 'meditate', 'breeze', 'gentle', 'still', 'sun'], value: 'peaceful', texture: 'flowing melodies' },
    { words: ['win', 'victory', 'triumph', 'glory', 'cheer', 'success', 'overcome'], value: 'triumphant', texture: 'grand orchestral burst' },
    { words: ['mystery', 'dark', 'shadow', 'secret', 'hide', 'unknown', 'abyss'], value: 'mysterious', texture: 'dissonant atmospheric drones' },
    { words: ['epic', 'army', 'war', 'dragon', 'heaven', 'god', 'demon', 'king'], value: 'epic', texture: 'heavy driving percussions' },
  ],
  environment: [
    { words: ['rain', 'drop', 'pour', 'storm'], bg: 'ambient rain noises', scene: 'rainy outdoors' },
    { words: ['thunder', 'lightning', 'flash', 'boom'], bg: 'distant thunder', scene: 'stormy sky' },
    { words: ['courtyard', 'garden', 'flower', 'pond'], bg: 'chirping crickets', scene: 'ancient courtyard' },
    { words: ['cave', 'tunnel', 'underground', 'cavern'], bg: 'echoing drops', scene: 'dark cave' },
    { words: ['city', 'market', 'tavern', 'street'], bg: 'distant crowd murmurs', scene: 'bustling city' },
    { words: ['sect', 'hall', 'mountain', 'peak', 'pine'], bg: 'wind through pines', scene: 'high mountain sect' },
    { words: ['battlefield', 'corpse', 'blood', 'war'], bg: 'distant war drums and wind', scene: 'chaotic battlefield' },
  ],
  emotion: [
    { words: ['love', 'kiss', 'embrace', 'heart'], emotion: 'burning passion', ending: 'soft fading end' },
    { words: ['anger', 'rage', 'furious', 'hate'], emotion: 'furious wrath', ending: 'abrupt loud stop' },
    { words: ['loss', 'gone', 'never', 'alone', 'lonely'], emotion: 'deep grief and longing', ending: 'soft tragic ending' },
    { words: ['revenge', 'vengeance', 'pay', 'return', 'vow'], emotion: 'cold determination', ending: 'tense fading echo' },
    { words: ['hope', 'light', 'future', 'smile'], emotion: 'rising hopefulness', ending: 'warm resolving chord' }
  ]
};

function getInstrument(culture: string, mood: string, intensity: number): string {
  if (culture === 'Chinese') {
    if (intensity > 0.8 || mood === 'epic') return 'Suona / Tanggu Drums';
    if (mood === 'sorrowful') return 'Erhu';
    if (mood === 'peaceful' || mood === 'mysterious') return 'Guqin / Xiao';
    if (mood === 'tense') return 'Pipa';
    return 'Guzheng';
  } else if (culture === 'Japanese') {
    if (intensity > 0.8 || mood === 'epic') return 'Taiko Drums';
    if (mood === 'sorrowful') return 'Shakuhachi';
    if (mood === 'peaceful') return 'Koto';
    if (mood === 'tense') return 'Shamisen';
    return 'Koto';
  } else if (culture === 'Korean') {
    if (intensity > 0.8 || mood === 'epic') return 'Taepyeongso / Janggu';
    if (mood === 'sorrowful') return 'Haegeum / Ajaeng';
    if (mood === 'peaceful') return 'Gayageum / Danso';
    if (mood === 'tense') return 'Geomungo / Kkwaenggwari';
    return 'Gayageum';
  } else if (culture === 'Western') {
    if (intensity > 0.8 || mood === 'epic') return 'Full Orchestral Brass / Timpani';
    if (mood === 'sorrowful') return 'Cello / Violin';
    if (mood === 'peaceful') return 'Acoustic Guitar / Piano';
    if (mood === 'tense') return 'Staccato Strings';
    return 'Lute';
  }
  return 'Strings';
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  config,
  setConfig,
  isTranslating,
  setIsTranslating,
  chapterText,
  setChapterText,
  culture: propsCulture,
  setCulture: propsSetCulture,
  pacing: propsPacing,
  setPacing: propsSetPacing,
  intensity: propsIntensity,
  setIntensity: propsSetIntensity,
}) => {
  const [internalCulture, setInternalCulture] = useState('Chinese');
  const [internalPacing, setInternalPacing] = useState('moderate pacing');
  const [internalIntensity, setInternalIntensity] = useState<number>(0.5);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const culture = propsCulture ?? internalCulture;
  const setCulture = propsSetCulture ?? setInternalCulture;
  const pacing = propsPacing ?? internalPacing;
  const setPacing = propsSetPacing ?? setInternalPacing;
  const intensity = propsIntensity ?? internalIntensity;
  const setIntensity = propsSetIntensity ?? setInternalIntensity;

  useEffect(() => {
    setConfig(prev => ({ ...prev, pacing, intensity, culture }));
  }, [pacing, intensity, culture, setConfig]);

  const handleRefine = async () => {
    if (!chapterText.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineLyriaPrompt(chapterText);
      setChapterText(refined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleParse = () => {
    setIsTranslating(true);

    setTimeout(() => {
      const text = chapterText.toLowerCase();

      let matchedMood = 'neutral';
      let matchedTexture = 'balanced melodies';
      let maxMoodScore = 0;

      KEYWORD_DICTIONARY.mood.forEach(m => {
        const score = m.words.reduce((acc, word) => acc + (text.split(word).length - 1), 0);
        if (score > maxMoodScore) { maxMoodScore = score; matchedMood = m.value; matchedTexture = m.texture; }
      });

      let matchedEnv = 'ambient wind';
      let matchedScene = 'unspecified setting';
      let maxEnvScore = 0;

      KEYWORD_DICTIONARY.environment.forEach(e => {
        const score = e.words.reduce((acc, word) => acc + (text.split(word).length - 1), 0);
        if (score > maxEnvScore) { maxEnvScore = score; matchedEnv = e.bg; matchedScene = e.scene; }
      });

      let matchedEmotion = 'focused flow';
      let matchedEnding = 'gradual fade out';
      let maxEmoScore = 0;

      KEYWORD_DICTIONARY.emotion.forEach(e => {
        const score = e.words.reduce((acc, word) => acc + (text.split(word).length - 1), 0);
        if (score > maxEmoScore) { maxEmoScore = score; matchedEmotion = e.emotion; matchedEnding = e.ending; }
      });

      const instrument = getInstrument(culture, matchedMood, intensity);

      setConfig(prev => ({
        ...prev,
        culture: culture,
        mood: matchedMood,
        instrument: instrument,
        pacing: pacing,
        mainTexture: matchedTexture,
        environmentalTexture: matchedEnv,
        sceneAtmosphere: matchedScene,
        emotionalDirection: matchedEmotion,
        endingDirection: matchedEnding,
        vocals: 'no lyrics, no spoken words'
      }));

      setIsTranslating(false);
    }, 350);
  };

  return (
    <div className="w-full space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            Chapter Narrative Parser
          </h3>
          <span className="text-[11px] text-cyan-300 font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 shadow-sm">
            Auto-Semantic
          </span>
        </div>

        {/* Modular Style / Culture, Pacing, Intensity controls */}
        <StyleControls
          culture={culture}
          onCultureChange={setCulture}
          pacing={pacing}
          onPacingChange={(p) => {
            setPacing(p);
            setConfig(prev => ({ ...prev, pacing: p }));
          }}
          intensity={intensity}
          onIntensityChange={(i) => {
            setIntensity(i);
            setConfig(prev => ({ ...prev, intensity: i }));
          }}
        />

        {/* Textarea excerpt */}
        <div className="relative w-full group">
          <textarea
            className="w-full h-28 bg-slate-950/90 border border-slate-700/90 rounded-2xl p-3.5 pr-28 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-none custom-scrollbar outline-none font-medium shadow-inner"
            placeholder="Paste light novel excerpt or chapter scene description here to extract soundscape coordinates..."
            value={chapterText}
            onChange={(e) => setChapterText(e.target.value)}
          />
          <button
            type="button"
            onClick={handleRefine}
            disabled={isRefining || !chapterText.trim()}
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

        {/* Extract Button */}
        <button
          onClick={handleParse}
          disabled={isTranslating || !chapterText.trim()}
          aria-label="Extract Soundscape Coordinates from light novel excerpt"
          className="w-full py-3 bg-cyan-500/30 border border-cyan-400/60 hover:bg-cyan-500/40 text-cyan-200 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] active:scale-[0.98] shadow-md shadow-cyan-950/40"
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-300" />
          )}
          {isTranslating ? "Parsing Soundscape coordinates..." : "Extract Soundscape Coordinates"}
        </button>
      </div>

      {/* Advanced Parameters Toggle */}
      <div className="pt-3 border-t border-slate-700/80">
        <button
          onClick={() => setShowAdvancedParams(!showAdvancedParams)}
          aria-label={showAdvancedParams ? 'Hide extracted schema parameters' : 'View or edit extracted schema parameters'}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-200 hover:text-white py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            Extracted Schema Parameters
          </span>
          <span className="text-xs text-cyan-300 font-bold underline">
            {showAdvancedParams ? 'Hide Details' : 'View / Edit Parameters'}
          </span>
        </button>

        {showAdvancedParams && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Mood</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.mood}
                onChange={(e) => setConfig({ ...config, mood: e.target.value })}
                placeholder="e.g. sorrowful"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Instrument</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.instrument}
                onChange={(e) => setConfig({ ...config, instrument: e.target.value })}
                placeholder="e.g. Erhu"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Pacing</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.pacing}
                onChange={(e) => setConfig({ ...config, pacing: e.target.value })}
                placeholder="e.g. slow pacing"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Main Texture</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.mainTexture}
                onChange={(e) => setConfig({ ...config, mainTexture: e.target.value })}
                placeholder="e.g. emotional bowed melodies"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Env. Texture</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.environmentalTexture}
                onChange={(e) => setConfig({ ...config, environmentalTexture: e.target.value })}
                placeholder="e.g. ambient rain noises"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Scene Atmosphere</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.sceneAtmosphere}
                onChange={(e) => setConfig({ ...config, sceneAtmosphere: e.target.value })}
                placeholder="e.g. abandoned courtyard"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Emotional Direction</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.emotionalDirection}
                onChange={(e) => setConfig({ ...config, emotionalDirection: e.target.value })}
                placeholder="e.g. deep grief and longing"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Ending Direction</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.endingDirection}
                onChange={(e) => setConfig({ ...config, endingDirection: e.target.value })}
                placeholder="e.g. soft tragic ending"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Vocals</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-medium"
                value={config.vocals}
                onChange={(e) => setConfig({ ...config, vocals: e.target.value })}
                placeholder="e.g. no lyrics, no spoken words"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
