/**
 * PromptBuilder Component
 *
 * This component provides a structured UI for users to build complex music prompts.
 * It allows adding multiple sections (e.g., Intro, Verse, Chorus) and selecting
 * attributes like mood, gender/genre, theme, BPM, and scale for each section.
 *
 * Use Cases:
 * - Assisting users who are unfamiliar with writing effective music generation prompts.
 * - Providing a quick way to experiment with different musical combinations.
 */
import React, { useState, useEffect } from 'react';
import { Icons } from '../../constants';

export interface SoundscapeConfig {
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
  onGeneratePrompt,
}) => {
  const [culture, setCulture] = useState('Chinese');
  const [pacing, setPacing] = useState('moderate pacing');
  const [intensity, setIntensity] = useState<number>(0.5);

  // Auto-sync top-level user inputs to config if desired, or just use them during parse
  useEffect(() => {
    setConfig(prev => ({ ...prev, pacing, intensity }));
  }, [pacing, intensity, setConfig]);

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
    }, 400); // Simulate local processing parsing delay
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-clarity font-sans uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-4 bg-portal inline-block rounded-sm"></span>
            Chapter Narrative Parser
          </h2>
          <p className="text-xs font-sans text-gray-400 mt-1">
            Input a novel excerpt below. Our local semantic heuristics will instantly map Chinese, Japanese, or Western mythological structures to active soundscape attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 p-4 border border-white/5 rounded-xl">
          <div>
            <label className="block text-[11px] font-sans text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Culture / Style</label>
            <select
              className="w-full glass-input p-2 font-sans text-xs focus:border-portal outline-none cursor-pointer"
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
            >
              <option value="Chinese">Chinese (Wuxia/Xianxia)</option>
              <option value="Japanese">Japanese Traditional</option>
              <option value="Western">Western Fantasy Epic</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-sans text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Pacing</label>
            <select
              className="w-full glass-input p-2 font-sans text-xs focus:border-portal outline-none cursor-pointer"
              value={pacing}
              onChange={(e) => {
                setPacing(e.target.value);
                setConfig(prev => ({ ...prev, pacing: e.target.value }));
              }}
            >
              <option value="slow pacing">Slow & Suspenseful</option>
              <option value="moderate pacing">Moderate / Steady</option>
              <option value="fast pacing">Fast-Paced</option>
              <option value="frenzied pacing">Frenzied / Chaotic</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-sans text-gray-400 uppercase tracking-wider mb-1 px-1 font-semibold flex justify-between">
              <span>Intensity</span>
              <span className="text-portal font-mono font-bold text-xs">{intensity.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-portal mt-2 cursor-pointer"
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            className="w-full h-28 glass-input p-3 text-xs font-serif text-gray-300 focus:border-portal/50 resize-none custom-scrollbar"
            placeholder="Paste your chapter excerpt or character prompt to extract narrative coordinates..."
            value={chapterText}
            onChange={(e) => setChapterText(e.target.value)}
          />
        </div>
        
        <button
          onClick={handleParse}
          disabled={isTranslating || !chapterText.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-950/40 text-cyan-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(4,172,255,0.06)]"
        >
          {isTranslating ? <Icons.Loading className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Icons.Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
          {isTranslating ? "Parsing Soundscape coordinates..." : "Extract Soundscape Coordinates"}
        </button>
      </div>

      <div className="pt-5 border-t border-white/5">
        <label className="block text-xs font-semibold font-sans text-gray-400 uppercase tracking-wider mb-3">Extracted Schema Parameters</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Mood</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.mood}
              onChange={(e) => setConfig({ ...config, mood: e.target.value })}
              placeholder="e.g. sorrowful"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Instrument</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.instrument}
              onChange={(e) => setConfig({ ...config, instrument: e.target.value })}
              placeholder="e.g. Erhu"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Pacing</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.pacing}
              onChange={(e) => setConfig({ ...config, pacing: e.target.value })}
              placeholder="e.g. slow pacing"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Main Texture</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.mainTexture}
              onChange={(e) => setConfig({ ...config, mainTexture: e.target.value })}
              placeholder="e.g. emotional bowed melodies"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Environmental Texture</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.environmentalTexture}
              onChange={(e) => setConfig({ ...config, environmentalTexture: e.target.value })}
              placeholder="e.g. ambient rain noises"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Scene Atmosphere</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.sceneAtmosphere}
              onChange={(e) => setConfig({ ...config, sceneAtmosphere: e.target.value })}
              placeholder="e.g. abandoned courtyard"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Emotional Direction</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.emotionalDirection}
              onChange={(e) => setConfig({ ...config, emotionalDirection: e.target.value })}
              placeholder="e.g. deep grief and longing"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Ending Direction</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.endingDirection}
              onChange={(e) => setConfig({ ...config, endingDirection: e.target.value })}
              placeholder="e.g. soft tragic ending"
            />
          </div>
          <div>
            <label className="block text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Vocals</label>
            <input
              type="text"
              className="w-full glass-input px-3 py-1.5 text-xs focus:border-portal/50 outline-none"
              value={config.vocals}
              onChange={(e) => setConfig({ ...config, vocals: e.target.value })}
              placeholder="e.g. no lyrics, no spoken words"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


