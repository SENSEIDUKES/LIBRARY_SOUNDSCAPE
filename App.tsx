/**
 * Main Application Component for Lyria Studio
 * 
 * This component serves as the primary container for the Lyria Studio application.
 * It manages the global state for music generation, including user inputs (prompts,
 * duration, lyrics options, image uploads), the generation process, and the display
 * of generated results.
 * 
 * Key Features:
 * - Prompt building (manual or via the PromptBuilder helper)
 * - Image upload for visual prompting
 * - Integration with Google GenAI for audio generation
 * - Audio playback and video export functionality
 * - Display of generated lyrics and metadata (title, cover art)
 */
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { LyricsOption, GenerationState, SongResult } from './types';
import { Icons, PROMPT_HELPER_CONFIG, EXAMPLE_SONGS } from './constants';
import { CONFIG } from './src/config';
import { logFunctionCall } from './src/utils/logger';
import { createAudioUrlFromBase64 } from './src/utils/audioUtils';
import { cleanLyricsForDisplay } from './src/utils/lyricsUtils';
import { handleDownloadVideo } from './src/utils/videoUtils';
import { parseModelOutput, generateSongTitle, generateCoverArt } from './src/services/genaiService';
import { getRandomItem, sanitizeFilename, getAutoExportName, extractMetadata } from './src/utils/helpers';
import { PromptBuilder, SoundscapeConfig } from './src/components/PromptBuilder';
import { ChineseInstrumentList, ChineseInstrument } from './src/components/ChineseInstrumentList';

const DAO_INSIGHTS = [
  "The high mountain whispers to the quiet flute, and the Dao answers in silence.",
  "Cultivating soundscapes across three thousand mortal worlds.",
  "A single tone of the Guqin can disperse the clouds of Heavenly Tribulation.",
  "Music is the resonance of the universe, the path to ascension.",
  "When the heart is still, the wind in the bamboo becomes a symphony.",
  "A warm, slow-simmered bowl of sweet congee on a snowy mountain pass.",
  "True harmony resides in the formless space between notes.",
  "The wind from the East carries the sound of ancient zithers, clearing the mind.",
  "Qi flows where the focus goes; let the rhythm lead your immortal path."
];

const App: React.FC = () => {
  const [daoInsight] = useState(() => getRandomItem(DAO_INSIGHTS));
  const [prompt, setPrompt] = useState('An intensely atmospheric chinese soundscape during a dangerous Heavenly Tribulation. Crashing thunder, aggressive drums, intense Erhu.');
  const [isPromptManual, setIsPromptManual] = useState(true);
  const [lyricsOption, setLyricsOption] = useState<LyricsOption>('Instrumental');
  const [customLyrics, setCustomLyrics] = useState('');
  const [gen, setGen] = useState<GenerationState>({ results: [] });
  const [isResultPlaying, setIsResultPlaying] = useState<string | null>(null);
  const [encodingVideoId, setEncodingVideoId] = useState<string | null>(null);
  const [encodingProgress, setEncodingProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<{data: string, mimeType: string, previewUrl: string}[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);

  // Redesign Layout & Inputs states
  const [activeInputTab, setActiveInputTab] = useState<'simple' | 'novel'>('simple');

  const [activeArchiveTab, setActiveArchiveTab] = useState<'presets' | 'my-music'>('presets');
  const [voiceGender, setVoiceGender] = useState<'Random' | 'Male' | 'Female'>('Random');
  const [isPublic, setIsPublic] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Record<string, boolean>>({});
  const [exportWithLyrics, setExportWithLyrics] = useState<Record<string, boolean>>({});

  // Browser offline synthesizer states
  const [activePresetPlaying, setActivePresetPlaying] = useState<string | null>(null);
  const synthRef = useRef<{ stop: () => void } | null>(null);

  // Token Tracking State
  const [totalInputTokens, setTotalInputTokens] = useState(() => parseInt(localStorage.getItem('lyria_input_tokens') || '0', 10));
  const [totalOutputTokens, setTotalOutputTokens] = useState(() => parseInt(localStorage.getItem('lyria_output_tokens') || '0', 10));

  useEffect(() => {
    localStorage.setItem('lyria_input_tokens', totalInputTokens.toString());
  }, [totalInputTokens]);

  useEffect(() => {
    localStorage.setItem('lyria_output_tokens', totalOutputTokens.toString());
  }, [totalOutputTokens]);

  const estimatedCost = ((totalInputTokens * 2.0 / 1000000) + (totalOutputTokens * 5.0 / 1000000)).toFixed(4);

  // Helper Mode States
  const [isTranslating, setIsTranslating] = useState(false);
  const [chapterText, setChapterText] = useState('');
  const [soundscapeConfig, setSoundscapeConfig] = useState<SoundscapeConfig>({
    mood: 'sorrowful',
    instrument: 'Erhu',
    pacing: 'slow pacing',
    mainTexture: 'emotional bowed melodies',
    environmentalTexture: 'ambient rain noises',
    sceneAtmosphere: 'abandoned courtyard',
    emotionalDirection: 'deep grief and longing',
    endingDirection: 'soft tragic ending',
    vocals: 'no lyrics, no spoken words',
    intensity: 0.5
  });

  const handleSelectInstrument = (inst: ChineseInstrument) => {
    setSoundscapeConfig(prev => ({
      ...prev,
      instrument: inst.name,
      mood: inst.mood,
    }));

    // Generate highly evocative, atmospheric prompt reflecting instrument and mood
    const updatedPrompt = `An immersive traditional Chinese soundscape featuring the elegant tones of ${inst.name}, evoking a mood of ${inst.mood}.`;
    setPrompt(updatedPrompt);
    setIsPromptManual(false);
  };
  
  const consoleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const myMusicContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (promptTextareaRef.current) {
      promptTextareaRef.current.style.height = 'auto';
      promptTextareaRef.current.style.height = `${promptTextareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Sync Helper sections to Prompt (only in Novel mode)
  useEffect(() => {
    if (activeInputTab !== 'novel') return;

    const arr = [
      `${soundscapeConfig.mood.toLowerCase()} sounding ${soundscapeConfig.instrument} song`,
      `${soundscapeConfig.pacing.toLowerCase()} rhythm`,
      soundscapeConfig.mainTexture,
      soundscapeConfig.environmentalTexture !== 'none' ? soundscapeConfig.environmentalTexture : null,
      `${soundscapeConfig.sceneAtmosphere} atmosphere`,
      'immersive soundscape',
      soundscapeConfig.emotionalDirection,
      soundscapeConfig.endingDirection,
      soundscapeConfig.vocals
    ].filter(Boolean);
    
    const generated = `make me a ${arr.join(', ')}.`;
    setPrompt(generated);
    setIsPromptManual(false); // Helper sync is not "manual typing"
  }, [soundscapeConfig, activeInputTab]);

  useEffect(() => {
    Object.values(consoleRefs.current).forEach(el => {
      if (el) {
        (el as HTMLDivElement).scrollTop = (el as HTMLDivElement).scrollHeight;
      }
    });
  }, [gen.results]);

  // Scroll latest completed song into view if the user is in the 'my-music' tab
  const prevFirstSongStatusRef = useRef<string | null>(null);
  useEffect(() => {
    const firstSong = gen.results[0];
    if (!firstSong) {
      prevFirstSongStatusRef.current = null;
      return;
    }
    
    const prevStatus = prevFirstSongStatusRef.current;
    const currentStatus = firstSong.status;
    prevFirstSongStatusRef.current = currentStatus;
    
    if (currentStatus === 'completed' && prevStatus === 'generating' && activeArchiveTab === 'my-music') {
      setTimeout(() => {
        if (myMusicContainerRef.current) {
          myMusicContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [gen.results, activeArchiveTab]);

  // Clean play states on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit to 10 images total
    const remainingSlots = 10 - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImages(prev => [...prev, { data: base64, mimeType: file.type, previewUrl: URL.createObjectURL(file) }]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const updateResult = (id: string, updater: (prev: SongResult) => SongResult) => {
    setGen(prev => ({ results: prev.results.map(r => r.id === id ? updater(r) : r) }));
  };

  const addLog = (id: string, message: string) => {
    updateResult(id, prev => ({ ...prev, logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${message}`] }));
  };

  const toggleExpand = (id: string) => {
    setGen(prev => ({ results: prev.results.map(r => r.id === id ? { ...r, isExpanded: !r.isExpanded } : r) }));
  };

  const handleGenerateSongTitle = async (id: string, musicPrompt: string, lyricContext: string) => {
    addLog(id, "Decoding narrative architecture for title...");
    const title = await generateSongTitle(musicPrompt, lyricContext);
    updateResult(id, r => ({ ...r, title }));
    addLog(id, `Identity confirmed: "${title}"`);
    return title;
  };

  const handleGenerateCoverArt = async (id: string, musicPrompt: string, lyricContext: string, title?: string) => {
    addLog(id, "Synthesizing visual representation...");
    const base64Image = await generateCoverArt(musicPrompt, lyricContext, title);
    if (base64Image) {
      updateResult(id, r => ({ ...r, coverImageUrl: base64Image }));
      addLog(id, "Visual synthesis finalized.");
    } else {
      addLog(id, "Visual synthesis skipped.");
    }
  };

  // Preset browser synthesizer player for 100% offline traditional theme immersion
  const togglePresetPlaying = (presetId: string) => {
    // Stop generated playing
    if (isResultPlaying) {
      const activeAudio = document.getElementById(`audio-${isResultPlaying}`) as HTMLAudioElement;
      if (activeAudio) activeAudio.pause();
      setIsResultPlaying(null);
    }

    if (activePresetPlaying === presetId) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      setActivePresetPlaying(null);
    } else {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      const newSynth = playPresetSynth(presetId);
      if (newSynth) {
        synthRef.current = newSynth;
        setActivePresetPlaying(presetId);
      }
    }
  };

  const playPresetSynth = (presetId: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      
      const ctx = new AudioContextClass();
      const nodes: AudioNode[] = [];
      
      // Pad oscillator (Cosmic baseline)
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = 'triangle';
      padOsc.frequency.setValueAtTime(presetId === '1' ? 110 : presetId === '2' ? 146.83 : 130.81, ctx.currentTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      
      padOsc.connect(filter);
      filter.connect(padGain);
      padGain.connect(ctx.destination);
      
      padGain.gain.setValueAtTime(0.001, ctx.currentTime);
      padGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
      
      padOsc.start();
      nodes.push(padOsc, padGain, filter);
      
      // Wind/atmospheric noise layer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(550, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(8, ctx.currentTime);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);
      
      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start();
      
      nodes.push(noiseNode, noiseFilter, noiseGain);
      
      const windInt = setInterval(() => {
        if (ctx.state === 'closed') return;
        noiseFilter.frequency.linearRampToValueAtTime(320 + Math.random() * 500, ctx.currentTime + 2.5);
      }, 3500);
      
      // Guzheng pentatonic scale notes preset database
      let chordNotes = presetId === '1' ? [220, 261.63, 329.63, 392, 440] : presetId === '2' ? [293.66, 329.63, 392, 440, 587.33] : [261.63, 293.66, 329.63, 392, 523.25];
      const pluckChime = () => {
        if (ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filterNode = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        const pitch = chordNotes[Math.floor(Math.random() * chordNotes.length)];
        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
        
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(1400, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
        
        osc.connect(filterNode);
        filterNode.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        
        setTimeout(() => {
          try { osc.stop(); } catch(e){}
        }, 3000);
      };
      
      const pluckInt = setInterval(pluckChime, 1400);
      
      return {
        stop: () => {
          clearInterval(windInt);
          clearInterval(pluckInt);
          try {
            nodes.forEach((n: any) => { try { n.stop(); } catch(e){} });
            ctx.close();
          } catch(e){}
        }
      };
    } catch(e) {
      console.warn("Presets Synthesizer playback error:", e);
      return null;
    }
  };

  const handleGenerate = async (overrides?: { prompt: string, lyricsOption: LyricsOption, customLyrics?: string }) => {
    // If presets are playing, stop them
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
      setActivePresetPlaying(null);
    }

    const activePrompt = overrides?.prompt ?? prompt;
    const activeLyricsOption = overrides?.lyricsOption ?? lyricsOption;
    const activeCustomLyrics = overrides?.customLyrics ?? customLyrics;
    if (!activePrompt.trim() && selectedImages.length === 0) return;

    // Check for API key
    if ((window as any).aistudio?.hasSelectedApiKey) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if ((window as any).aistudio?.openSelectKey) {
          await (window as any).aistudio.openSelectKey();
        }
        return;
      }
    }

    setIsTriggering(true);
    setTimeout(() => setIsTriggering(false), 200);

    const activeModelId = CONFIG.MODEL_ID_FULL;
    const newId = Math.random().toString(36).substring(7);
    const newResult: SongResult = {
      id: newId, status: 'generating', logs: [], audioUrl: null, coverImageUrl: null, title: null, lyrics: '', metadata: '', fullPrompt: null, error: null, modelId: activeModelId, timestamp: new Date(), isExpanded: true,
      originalPrompt: activePrompt, originalLyricsOption: activeLyricsOption,
      chapterText: activeInputTab === 'novel' ? chapterText : undefined,
      soundscapeConfig: { ...soundscapeConfig }
    };
    setGen(prev => ({ results: [newResult, ...prev.results.map(r => ({ ...r, isExpanded: false }))] }));
    
    // Automatically swap the right pane list to "My Formations" queue so they see live compilation
    setActiveArchiveTab('my-music');

    const modelId = activeModelId;
    const modelDisplayName = 'Lyria Pro';
    addLog(newId, `Waking ${modelDisplayName} engine...`);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please enter your API key via the settings menu.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // Inject lyric properties based on simple/custom settings
      let lyricInstruction = activeLyricsOption === 'Instrumental' ? "IMPORTANT: This track MUST be strictly INSTRUMENTAL." : 
                          activeLyricsOption === 'Custom' ? `\nUse these exact lyrics (${voiceGender !== 'Random' ? `voiced by a ${voiceGender} vocal style` : ''}):\n ${activeCustomLyrics}` : `\nGenerate lyrics with precise [seconds:] timing markers. Vocal style: ${voiceGender !== 'Random' ? voiceGender : 'ambient vocal accompaniment'}.`;
      
      const contextPart = activePrompt.trim() ? `\nContext: "${activePrompt}".` : '';
      const metadataInstruction = `\nAt the very end of your textual output, ALWAYS append a metadata block starting with the header 'Metadata:' and containing Key, BPM (Tempo), and Genres (comma-separated list of short descriptors) in the following format:\nMetadata:\nKey: G minor\nBPM: 85\nGenres: Chinese Traditional, Ambient, Sorrowful`;
      const promptText = `Generate a full-length track.${contextPart} ${ lyricInstruction }.${metadataInstruction}`;
      
      updateResult(newId, r => ({ ...r, fullPrompt: promptText }));
      
      const contents: any = selectedImages.length > 0 ? { 
        parts: [
          { text: promptText }, 
          ...selectedImages.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }))
        ] 
      } : promptText;
      const responseStream = await ai.models.generateContentStream({ model: modelId, contents: contents, config: { responseModalities: [Modality.AUDIO] } });
      let audioAccumulator = ""; let textAccumulator = ""; let mimeType = "audio/wav"; let auxTriggered = false;
      let currentPartType = ''; let textPartsSeen = 0;
      let streamInputTokens = 0; let streamOutputTokens = 0;
      
      for await (const chunk of responseStream) {
        if (chunk.usageMetadata) {
          streamInputTokens = chunk.usageMetadata.promptTokenCount ?? streamInputTokens;
          streamOutputTokens = chunk.usageMetadata.candidatesTokenCount ?? streamOutputTokens;
        }
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) { 
            currentPartType = 'audio';
            if (!audioAccumulator && part.inlineData.mimeType) mimeType = part.inlineData.mimeType; 
            audioAccumulator += part.inlineData.data; 
          }
          if (part.text) {
            if (currentPartType !== 'text') { 
              textPartsSeen++; 
              currentPartType = 'text'; 
            }
            if (textPartsSeen === 1) {
              textAccumulator += part.text;
              const { lyrics, metadata } = parseModelOutput(textAccumulator);
              updateResult(newId, r => ({ ...r, lyrics, metadata }));
              if (!auxTriggered && textAccumulator.length > 50) { auxTriggered = true; handleGenerateSongTitle(newId, activePrompt, textAccumulator).then(t => handleGenerateCoverArt(newId, activePrompt, textAccumulator, t)); }
            }
          }
        }
      }
      
      if (!auxTriggered && audioAccumulator) {
        auxTriggered = true;
        handleGenerateSongTitle(newId, activePrompt, textAccumulator || "Instrumental atmospheric soundscape")
          .then(t => handleGenerateCoverArt(newId, activePrompt, textAccumulator || "Instrumental atmospheric soundscape", t));
      }
      
      setTotalInputTokens(prev => prev + streamInputTokens);
      setTotalOutputTokens(prev => prev + streamOutputTokens);
      
      console.log('[Raw Generated Lyrics]', textAccumulator);
      if (audioAccumulator) { updateResult(newId, r => ({ ...r, status: 'completed', audioUrl: createAudioUrlFromBase64(audioAccumulator, mimeType) })); addLog(newId, "Signal stabilized."); }
      else throw new Error("Zero audio bits captured.");
    } catch (err: any) { updateResult(newId, r => ({ ...r, status: 'error', error: err.message || "Synthesis interrupted." })); }
  };

  const handleDownload = (result: SongResult) => {
    if (!result.audioUrl) return;
    const cleanName = getAutoExportName(result.originalPrompt, result.title, result.soundscapeConfig);
    const link = document.createElement('a'); link.href = result.audioUrl; link.download = `${cleanName}.wav`; link.click();
  };

  const onDownloadVideo = async (result: SongResult, withLyrics: boolean = false) => {
    if (!result.audioUrl || !result.coverImageUrl || encodingVideoId) return;
    setEncodingVideoId(result.id);
    setEncodingProgress(0);

    await handleDownloadVideo(
      result,
      withLyrics,
      (progress) => setEncodingProgress(progress),
      () => {
        setEncodingVideoId(null);
        setEncodingProgress(0);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate(); };

  const toggleLike = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedSongs(prev => ({ ...prev, [songId]: !prev[songId] }));
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 overflow-x-hidden">
      {/* Glossy Header Bar */}
      <nav className="sticky top-0 z-50 bg-[#070919]/75 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6 justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/15 shadow-md group transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <img 
              src="https://pub-e482c2dbbb984c3c87ecdd8ae3a92183.r2.dev/LIBRARY/images/CELESTIAL%20LIBRARY%20ICON.jpg" 
              alt="Celestial Library Icon" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-sm font-black tracking-widest text-white leading-none">SEIHOUSE</span>
            <span className="text-[9px] text-portal uppercase tracking-widest font-semibold mt-1">Light Novel Soundscapes</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-[#0e122b] rounded-full font-sans text-[10px] text-portal uppercase tracking-wider border border-blue-500/20 flex gap-4 items-center">
            <span className="font-semibold text-gray-400" title={`Input Tokens: ${totalInputTokens}\nOutput Tokens: ${totalOutputTokens}`}>
              Tokens: <span className="text-portal">{totalInputTokens + totalOutputTokens}</span>
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-human font-bold">Est. ${estimatedCost}</span>
          </div>
          
          <button 
            onClick={handleSelectKey} 
            className="px-4 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-[10px] font-sans font-bold text-gray-300 uppercase tracking-widest transition-all"
          >
            Settings
          </button>
        </div>
      </nav>

      {/* Hero Header Presentation */}
      <header className="py-12 px-6 flex flex-col items-center justify-center text-center select-none bg-radial-gradient relative overflow-hidden">
        {/* Insights from the Dao banner (Celestial Library style) */}
        <div className="mb-6 px-5 py-2 bg-cyan-950/20 border border-cyan-500/20 rounded-full max-w-xl mx-auto flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(4,172,255,0.06)] backdrop-blur-md animate-in fade-in duration-700">
          <span className="text-[10px] font-sans font-extrabold tracking-widest text-cyan-400 uppercase flex items-center gap-1.5 shrink-0">
            ✨ INSIGHTS FROM THE DAO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/30 shrink-0" />
          <span className="text-[11px] font-serif italic text-gray-300 truncate max-w-[320px] sm:max-w-[400px]">
            "{daoInsight}"
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white font-displaySc uppercase text-shadow-sm">
          Chapter Soundscapes
        </h1>
        <p className="text-xs md:text-sm text-cyan-400 mt-2.5 max-w-lg leading-relaxed font-sans font-medium tracking-widest uppercase">
          SEIHouse Immersive Audio Engine • Light Novel Companion
        </p>
      </header>

      {/* Dual Panel Body Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Generate Music controls console */}
        <div id="generate_console" className="lg:col-span-6 xl:col-span-5 glass-panel rounded-[2rem] p-6 shadow-2xl space-y-6 flex flex-col relative overflow-hidden ring-1 ring-white/5">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-sans font-black text-xl text-white tracking-wide">
              Generate Music
            </h3>
            
            {/* Pill tabs mapping directly to Chat vs Simple vs Custom */}
            <div className="flex bg-black/45 rounded-full p-1 border border-white/5 w-fit shadow-md backdrop-blur-md">
              <button 
                onClick={() => setActiveInputTab('novel')}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeInputTab === 'novel' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(4,172,255,0.18)] scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent active:scale-95'
                }`}
              >
                Chapter Parser
              </button>
              <button 
                onClick={() => setActiveInputTab('simple')}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeInputTab === 'simple' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(4,172,255,0.18)] scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent active:scale-95'
                }`}
              >
                Manual
              </button>
            </div>
          </div>

          {/* Traditional Chinese Instrument Selector */}
          <ChineseInstrumentList 
            activeInstrument={soundscapeConfig.instrument} 
            onSelectInstrument={handleSelectInstrument} 
          />

          {/* Simple Tab Input Content */}
          {activeInputTab === 'simple' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Instrumental Toggle Switch */}
              <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded-2xl border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instrumental</h4>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Create a song without lyrics.</p>
                </div>
                <button
                  onClick={() => setLyricsOption(prev => prev === 'Instrumental' ? 'Auto' : 'Instrumental')}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer outline-none ${
                    lyricsOption === 'Instrumental' ? 'bg-portal' : 'bg-gray-800'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    lyricsOption === 'Instrumental' ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Prompt Text Description Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <span className="text-xs font-bold font-sans text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Song Description
                    <Icons.Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                  </span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setIsPromptManual(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Create your AI Music now..."
                  className="w-full h-32 glass-input p-4 text-xs font-serif leading-relaxed text-clarity focus:border-portal/50 resize-none custom-scrollbar"
                />
              </div>

              {/* Voice Gender Bias Selectors */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold font-sans text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  Voice Gender
                  <Icons.Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                </span>
                <div className="grid grid-cols-3 gap-2.5 bg-black/45 p-1 border border-white/5 rounded-xl">
                  {(['Random', 'Male', 'Female'] as const).map((genderOption) => (
                    <button
                      key={genderOption}
                      onClick={() => setVoiceGender(genderOption)}
                      className={`py-2 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${
                        voiceGender === genderOption 
                          ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/5' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {genderOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload for visual synthesis */}
              <div className="space-y-2">
                <span className="text-xs font-bold font-sans text-gray-400 uppercase tracking-widest ml-1">
                  Visual Blueprint (Optional)
                </span>
                <div className="flex flex-wrap gap-2 items-center bg-black/40 p-3.5 rounded-2xl border border-white/5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all flex items-center justify-center text-gray-400"
                  >
                    <Icons.Camera className="w-5 h-5" />
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
                    <div key={index} className="relative w-12 h-12 rounded-xl group overflow-hidden border border-white/20">
                      <img src={img.previewUrl} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Icons.X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {selectedImages.length === 0 && (
                    <span className="text-[10px] text-gray-500 font-sans ml-1">Upload reference scrolls/images to prompt visual motifs.</span>
                  )}
                </div>
              </div>

              {/* Publicly Display Toggle Switch */}
              <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded-2xl border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Publicly display my song</h4>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Share with community.</p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer outline-none ${
                    isPublic ? 'bg-portal' : 'bg-gray-800'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Removed Model selection */}
            </div>
          )}

          {/* Custom Novel Schema Tab Input Content */}
          {activeInputTab === 'novel' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <PromptBuilder
                config={soundscapeConfig}
                setConfig={setSoundscapeConfig}
                isTranslating={isTranslating}
                setIsTranslating={setIsTranslating}
                chapterText={chapterText}
                setChapterText={setChapterText}
                onGeneratePrompt={() => {}}
              />
              
              {/* Recaps and secondary option rows for Novel Schema mode */}
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-gray-400 uppercase tracking-wider ml-1">Acoustic Vocals</label>
                  <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl w-full">
                    {(['Instrumental', 'Auto', 'Custom'] as LyricsOption[]).map((opt) => (
                      <button 
                        key={opt} 
                        onClick={() => setLyricsOption(opt)} 
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          lyricsOption === opt ? 'bg-white text-black text-shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {lyricsOption === 'Custom' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-semibold font-sans uppercase tracking-widest text-portal ml-1">Custom Verse Lyrics</label>
                  <textarea
                    value={customLyrics}
                    onChange={(e) => setCustomLyrics(e.target.value)}
                    placeholder={`[0:00 - 0:15] Write your custom segment cues here...`}
                    className="w-full h-32 glass-input p-3 text-xs font-serif leading-relaxed text-clarity focus:border-portal/50 resize-none custom-scrollbar"
                  />
                </div>
              )}
            </div>
          )}

          {/* Active Model Identifier Info box */}
          <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 space-y-1.5 animate-in fade-in duration-300">
            <span className="text-[10px] font-sans font-semibold text-portal uppercase tracking-widest">
              Active Audio Engine Model
            </span>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Engine Profile:</span>
              <span className="text-white font-semibold">Lyria Pro (v2.0)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Target Model ID:</span>
              <span className="text-amber-400/90 font-bold">{CONFIG.MODEL_ID_FULL}</span>
            </div>
          </div>

          {/* Glowing Generate red button */}
          <div className="pt-2">
            <button 
              onClick={() => handleGenerate()} 
              disabled={(!prompt.trim() && selectedImages.length === 0) || CONFIG.IS_MAINTENANCE_MODE} 
              className={`w-full py-4 rounded-full text-sm font-sans uppercase font-black tracking-widest text-white transition-all glowing-primary ${
                ((!prompt.trim() && selectedImages.length === 0) || CONFIG.IS_MAINTENANCE_MODE)
                  ? 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed' 
                  : `bg-gradient-to-r from-human to-portal hover:brightness-110 active:scale-[0.98] cursor-pointer`
              }`}
            >
              Generate
            </button>
            <p className="text-center text-[10px] text-gray-500 font-sans mt-2.5">
              You have unlimited free generations. Playlists auto-saved locally.
            </p>
          </div>
        </div>

        {/* Right column: Play Lists track list */}
        <div className="lg:col-span-6 xl:col-span-7 glass-panel rounded-[2rem] p-6 shadow-2xl space-y-6 flex flex-col relative ring-1 ring-white/5 min-h-[600px]">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-sans font-black text-xl text-white tracking-wide">
              Play Lists
            </h3>
            
            {/* Gallery Popular vs My music toggle */}
            <div className="flex bg-black/45 rounded-full p-1 border border-white/5 w-fit shadow-md backdrop-blur-md">
              <button 
                onClick={() => setActiveArchiveTab('presets')}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeArchiveTab === 'presets' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(4,172,255,0.18)] scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent active:scale-95'
                }`}
              >
                Popular
              </button>
              <button 
                onClick={() => setActiveArchiveTab('my-music')}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 ${
                  activeArchiveTab === 'my-music' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(4,172,255,0.18)] scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent active:scale-95'
                }`}
              >
                My Music
                {gen.results.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block animate-pulse"></span>
                )}
              </button>
            </div>
          </div>

          {/* PRESENTS TAB: Curated traditional ambient presets played directly offline */}
          {activeArchiveTab === 'presets' && (
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 pr-1">
              {EXAMPLE_SONGS.map((song) => {
                const isPlaying = activePresetPlaying === song.id;
                
                return (
                  <div 
                    key={song.id} 
                    className={`rounded-2xl p-4 transition-all duration-300 border bg-white/[0.01] hover:bg-white/[0.03] ${
                      isPlaying 
                        ? 'border-portal/30 shadow-[0_0_20px_rgba(4,172,255,0.06)]' 
                        : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Song thumbnail art */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 group">
                        <img src={song.coverUrl} className="w-full h-full object-cover brightness-90 saturate-110" />
                        
                        {/* Audio equalizer animation overlay when active */}
                        {isPlaying && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex gap-0.5 items-center justify-center">
                            <span className="eq-bar"></span>
                            <span className="eq-bar"></span>
                            <span className="eq-bar"></span>
                            <span className="eq-bar font-bold"></span>
                          </div>
                        )}
                      </div>

                      {/* Title details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-bold text-sm text-white truncate leading-snug">
                          {song.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-sans tracking-wide mt-0.5 truncate uppercase">
                          {song.artist}
                        </p>
                        
                        {/* Stats counters identical to reference layout */}
                        <div className="flex items-center gap-3.5 text-[10px] font-sans font-semibold text-gray-400 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="text-portal">▶</span> {song.id === '1' ? '4.5K' : song.id === '2' ? '1.5K' : '4.7K'}
                          </span>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-red-400" onClick={(e) => toggleLike(song.id, e)}>
                            <span className={likedSongs[song.id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}>
                              {likedSongs[song.id] ? '♥' : '♡'}
                            </span>{' '}
                            {song.id === '1' ? '1.4K' : song.id === '2' ? '2.9K' : '2.0K'}
                          </span>
                        </div>
                      </div>

                      {/* Play State on the right */}
                      <button 
                        onClick={() => togglePresetPlaying(song.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isPlaying 
                            ? 'bg-blue-600/20 text-portal border border-blue-500/30' 
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:scale-105 hover:bg-white/10'
                        }`}
                      >
                        {isPlaying ? (
                          <Icons.Pause className="w-4 h-4" />
                        ) : (
                          <Icons.Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Simple tag indicators */}
                    <div className="flex items-center gap-2 mt-3.5 border-t border-white/5 pt-3.5 flex-wrap">
                      {song.tags.map((tg, i) => (
                        <span key={i} className="text-[9px] font-bold tracking-wider font-sans bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-full uppercase">
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MY MUSIC TAB: Render real live user generated formations */}
          {activeArchiveTab === 'my-music' && (
            <div ref={myMusicContainerRef} className="space-y-4 flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 pr-1">
              {gen.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 py-20 border border-dashed border-white/5 rounded-2xl bg-black/20 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-4 animate-bounce">
                    <Icons.Sparkles className="w-6 h-6 text-portal" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest font-sans">
                    Ascension Vault Empty
                  </h4>
                  <p className="text-xs text-gray-500 font-sans max-w-xs mt-2.5 leading-relaxed">
                    Set your chapter coordinates on the left and evoke your first soundscape formation. It will map instantly into physical resonance!
                  </p>
                </div>
              ) : (
                gen.results.map((result) => {
                  const isExpanded = result.isExpanded;
                  const isEncoding = encodingVideoId === result.id;
                  const isGenerating = result.status === 'generating';
                  const isFailed = result.status === 'error';
                  const isPlaying = isResultPlaying === result.id;
                  const extMeta = extractMetadata(result.metadata, result.soundscapeConfig);
                  
                  return (
                    <div 
                      key={result.id} 
                      className={`rounded-2xl p-4 transition-all duration-300 border bg-white/[0.01] hover:bg-white/[0.03] overflow-hidden ${
                        isExpanded 
                          ? 'border-portal/30 shadow-[0_0_24px_rgba(4,172,255,0.08)] bg-black/40' 
                          : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Artwork cover image */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          {result.coverImageUrl ? (
                            <img src={result.coverImageUrl} className="w-full h-full object-cover brightness-95" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900 border border-white/5">
                              <Icons.Sparkles className={`text-portal ${isGenerating ? 'w-6 h-6 animate-pulse' : 'w-5 h-5'}`} />
                            </div>
                          )}

                          {isEncoding && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                              <Icons.Loading className="w-5 h-5 text-portal animate-spin" />
                            </div>
                          )}

                          {isPlaying && (
                            <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 flex gap-0.5 items-center justify-center">
                              <span className="eq-bar !h-2"></span>
                              <span className="eq-bar !h-3"></span>
                              <span className="eq-bar !h-2"></span>
                            </div>
                          )}
                        </div>

                        {/* Text identities */}
                        <div className="flex-1 min-w-0" onClick={() => !isExpanded && toggleExpand(result.id)} style={{ cursor: isExpanded ? 'default' : 'pointer' }}>
                          <h4 className="font-sans font-bold text-sm text-white truncate leading-snug">
                            {isFailed ? 'Resonance Diverged' : (result.title || (isGenerating ? "Translating chapter..." : "Qi soundscape formation"))}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-sans tracking-wide mt-1.5 truncate uppercase">
                            {isGenerating ? (
                              <span className="flex items-center gap-1.5 text-amber-500 font-bold font-mono">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                </span>
                                BUILD: {result.modelId || CONFIG.MODEL_ID_FULL}
                              </span>
                            ) : (
                              <span>
                                Engine: <span className="text-portal font-black font-mono">{result.modelId || CONFIG.MODEL_ID_FULL}</span>
                              </span>
                            )}
                          </p>

                          {/* Stats and items */}
                          <div className="flex items-center gap-3.5 text-[10px] font-sans font-semibold text-gray-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="text-portal">▶</span> {result.status === 'completed' ? 'Live' : 'Synthesizing'}
                            </span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-red-400" onClick={(e) => toggleLike(result.id, e)}>
                              <span className={likedSongs[result.id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}>
                                {likedSongs[result.id] ? '♥' : '♡'}
                              </span>{' '}
                              {likedSongs[result.id] ? '1' : '0'}
                            </span>
                          </div>
                        </div>

                        {/* Action play controls */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              if (isGenerating) return;
                              // Stop any active presets synth
                              if (synthRef.current) {
                                synthRef.current.stop();
                                synthRef.current = null;
                                setActivePresetPlaying(null);
                              }

                              const audio = document.getElementById(`audio-${result.id}`) as HTMLAudioElement;
                              if (audio) {
                                audio.paused ? audio.play() : audio.pause();
                              }
                            }}
                            disabled={!result.audioUrl && !isGenerating}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isPlaying 
                                ? 'bg-blue-600/20 text-portal border border-blue-500/30' 
                                : 'bg-white/5 border border-white/10 text-gray-300 hover:scale-105 hover:bg-white/10 disabled:opacity-30'
                            }`}
                          >
                            {isGenerating ? (
                              <Icons.Loading className="w-4 h-4 animate-spin text-portal" />
                            ) : isPlaying ? (
                              <Icons.Pause className="w-4 h-4" />
                            ) : (
                              <Icons.Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>

                          <button 
                            onClick={() => toggleExpand(result.id)}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-transform ${isExpanded ? 'rotate-90 text-portal' : 'text-gray-500 hover:text-white'}`}
                          >
                            <Icons.ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Key, Tempo, and Genre Tags Strip */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/5 select-none text-[10px]">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mr-1">Resonance Matrix:</span>
                        <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest font-sans bg-human/15 border border-human/25 text-human px-2.5 py-0.5 rounded-md uppercase" title="Musical Key / Scale">
                          Key: {extMeta.key}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest font-sans bg-portal/15 border border-portal/25 text-portal px-2.5 py-0.5 rounded-md uppercase" title="Tempo / BPM">
                          {extMeta.tempo}
                        </span>
                        {extMeta.genres.map((genre, i) => (
                          <span key={i} className="text-[9px] font-bold tracking-wider font-sans bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-md uppercase">
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* Detail interactive expander section */}
                      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          
                          {/* Real-time raw audio element if stable */}
                          {result.audioUrl && (
                            <div className="space-y-4 border-t border-white/5 mt-4 pt-4">
                              <audio 
                                id={`audio-${result.id}`} 
                                onPlay={() => setIsResultPlaying(result.id)} 
                                onPause={() => setIsResultPlaying(null)} 
                                controls 
                                className="h-10 w-full rounded focus:outline-none focus:ring-0 select-none custom-scrollbar grayscale invert filter scale-95"
                              >
                                <source src={result.audioUrl} />
                              </audio>

                              {/* Action Download / Export Buttons */}
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3.5 text-center relative">
                                  <button 
                                    onClick={() => handleDownload(result)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-portal/20 bg-[#0e122b] hover:bg-[#152e5d]/30 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all text-shadow"
                                  >
                                    <Icons.Download className="w-3.5 h-3.5 text-portal" />
                                    Extract Master
                                  </button>
                                  
                                  {(() => {
                                    const hasLyrics = !!result.lyrics && result.originalLyricsOption !== 'Instrumental';
                                    const withLyrics = exportWithLyrics[result.id] !== false && hasLyrics;
                                    return (
                                      <button 
                                        onClick={() => onDownloadVideo(result, withLyrics)}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all ${
                                          encodingVideoId !== null && !isEncoding ? 'opacity-35 cursor-not-allowed' : ''
                                        } ${isEncoding ? 'opacity-30 cursor-wait' : ''}`}
                                        disabled={encodingVideoId !== null}
                                      >
                                        {isEncoding ? (
                                          <Icons.Loading className="w-3.5 h-3.5 animate-spin text-portal" />
                                        ) : (
                                          <Icons.Video className="w-3.5 h-3.5 text-human" />
                                        )}
                                        {isEncoding ? `Mapping ${Math.round(encodingProgress)}%` : 'Render Visual'}
                                      </button>
                                    );
                                  })()}
                                </div>

                                {(() => {
                                  const hasLyrics = !!result.lyrics && result.originalLyricsOption !== 'Instrumental';
                                  const withLyrics = exportWithLyrics[result.id] !== false && hasLyrics;
                                  return hasLyrics ? (
                                    <div className="flex items-center justify-center gap-2 py-1 select-none animate-in fade-in duration-300">
                                      <input 
                                        type="checkbox" 
                                        id={`lyrics-toggle-${result.id}`}
                                        checked={withLyrics}
                                        onChange={() => setExportWithLyrics(prev => ({ ...prev, [result.id]: !withLyrics }))}
                                        className="w-3.5 h-3.5 accent-portal rounded border-white/10 bg-black/45 cursor-pointer"
                                      />
                                      <label htmlFor={`lyrics-toggle-${result.id}`} className="cursor-pointer font-sans uppercase tracking-widest text-[9px] font-extrabold text-gray-400 hover:text-white transition-colors">
                                        Overlay Lyrics in Render
                                      </label>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Loading Status indicator */}
                          {!result.audioUrl && isGenerating && (
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                              <div className="h-1.5 w-full bg-[#0b0c16] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-portal to-indigo-500 animate-[loading_2s_infinite]"></div>
                              </div>
                              <p className="text-[9px] font-sans text-gray-500 uppercase tracking-widest text-center animate-pulse">
                                Merging acoustic arrays from Heavenly Web nodes...
                              </p>
                            </div>
                          )}

                          {/* Error block */}
                          {isFailed && result.error && (
                            <div className="mt-4 p-4 border border-red-500/20 bg-red-950/20 rounded-xl space-y-2 text-xs">
                              <span className="font-sans font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                ⚠️ Generation Failed
                              </span>
                              <p className="font-mono text-gray-300 leading-relaxed break-words">
                                {result.error}
                              </p>
                              {(result.error.toLowerCase().includes('api_key') || result.error.toLowerCase().includes('api key')) && (
                                <p className="text-[10px] text-gray-400 font-sans mt-1">
                                  Please ensure your Gemini API key is configured correctly in the settings.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Technical Logs / Information Panels */}
                          <div className="mt-5 space-y-4 border-t border-white/5 pt-4">
                            
                            {/* Full text prompt array */}
                            {(result.fullPrompt || result.originalPrompt) && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-sans font-bold text-portal uppercase tracking-widest">
                                  Compiled Formation Blueprint
                                </span>
                                <div className="bg-[#0b0c16]/80 p-4 border border-white/5 rounded-xl text-xs font-mono text-gray-400 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                  {result.fullPrompt || result.originalPrompt}
                                </div>
                              </div>
                            )}

                            {/* Narrative Interpretation Output */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-sans font-bold text-portal uppercase tracking-widest">
                                  {result.chapterText ? "Chapter Narrative Sequence" : "Narrative Matrix (Lyrics)"}
                                </span>
                                <div className="bg-[#0b0c16]/50 p-4 border border-white/5 rounded-xl h-[180px] overflow-y-auto text-[13px] text-gray-300 italic font-serif leading-relaxed custom-scrollbar whitespace-pre-wrap relative">
                                  {result.chapterText ? (
                                    <div className="font-serif leading-loose text-clarity/90" style={{ animation: isPlaying ? 'scrollText 30s linear infinite' : 'none' }}>
                                      {result.chapterText}
                                    </div>
                                  ) : result.lyrics ? cleanLyricsForDisplay(result.lyrics) : (isGenerating ? "Crystallizing chapter verse..." : "No vocals. Instrumental space-time resonance.")}
                                  {isPlaying && result.chapterText && (
                                     <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0b0c16]/50 via-transparent to-[#0b0c16]/50 z-10"></div>
                                  )}
                                </div>
                              </div>

                              {/* Compiler logging console */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-sans font-bold text-human uppercase tracking-widest">
                                  Qi compiler logging stream
                                </span>
                                <div 
                                  ref={el => { consoleRefs.current[result.id] = el; }}
                                  className="bg-[#05060d] p-4 border border-white/5 rounded-xl h-[180px] overflow-y-auto font-mono text-[10px] text-portal/90 space-y-1 shadow-inner custom-scrollbar"
                                >
                                  {result.logs.map((log, listIdx) => (
                                    <div key={listIdx} className="opacity-80 leading-relaxed font-semibold">
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* Redo Array Button */}
                            {(isFailed || result.audioUrl) && (
                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => handleGenerate({ prompt: result.originalPrompt, lyricsOption: result.originalLyricsOption })}
                                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-sans uppercase tracking-widest hover:bg-white/10 transition-all select-none cursor-pointer"
                                >
                                  <Icons.RefreshCw className="w-3.5 h-3.5" />
                                  Recast Formation
                                </button>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </main>

      {/* Styled animation keyframes and standard loading configurations */}
      <style>{`
        @keyframes loading { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(300%); } 
        }
        
        .bg-radial-gradient {
          background-image: radial-gradient(circle at 50% 0%, rgba(30, 27, 75, 0.4) 0%, transparent 60%);
        }
        
        .text-shadow {
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default App;