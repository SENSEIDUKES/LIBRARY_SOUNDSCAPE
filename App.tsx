import React, { useState } from 'react';
import { Sparkles, Wand2, ListMusic } from 'lucide-react';
import { LyricsOption, SongResult, SoundscapeTags } from './types';
import { CONFIG } from './src/config';
import { getAutoExportName, getRandomItem } from './src/utils/helpers';
import { handleDownloadVideo } from './src/utils/videoUtils';

import { Header } from './src/components/Header';
import { SegmentedControl } from './src/components/SegmentedControl';
import { PlayerBar } from './src/components/PlayerBar';
import { ChineseInstrumentList, ChineseInstrument, getInstrumentsForCulture } from './src/components/ChineseInstrumentList';
import DaoInsightQuote from './src/components/DaoInsightQuote';
import { SettingsModal } from './src/components/SettingsModal';
import { BpmDetectorModal } from './src/components/BpmDetectorModal';
import { SoundscapeConfig } from './src/components/PromptBuilder';

// Hooks
import { useFavorites } from './src/hooks/useFavorites';
import { useAudioPlayback } from './src/hooks/useAudioPlayback';
import { useSoundscapeGenerator } from './src/hooks/useSoundscapeGenerator';

// Modules
import { ParserConsole } from './src/modules/creator/ParserConsole';
import { ManualConsole } from './src/modules/creator/ManualConsole';
import { SoundscapeVault } from './src/modules/vault/SoundscapeVault';

const DAO_INSIGHTS = [
  'The high mountain whispers to the quiet flute, and the Dao answers in silence.',
  'Cultivating soundscapes across three thousand mortal worlds.',
  'A single tone of the Guqin can disperse the clouds of Heavenly Tribulation.',
  'Music is the resonance of the universe, the path to ascension.',
  'When the heart is still, the wind in the bamboo becomes a symphony.',
  'A warm, slow-simmered bowl of sweet congee on a snowy mountain pass.',
  'True harmony resides in the formless space between notes.',
  'The wind from the East carries the sound of ancient zithers, clearing the mind.',
  'Qi flows where the focus goes; let the rhythm lead your immortal path.',
];

const App: React.FC = () => {
  const [daoInsight] = useState(() => getRandomItem(DAO_INSIGHTS));
  
  // App state
  const [prompt, setPrompt] = useState(
    'An intensely atmospheric chinese soundscape during a dangerous Heavenly Tribulation. Crashing thunder, aggressive drums, intense Erhu.'
  );
  const [, setIsPromptManual] = useState(true);
  const [lyricsOption, setLyricsOption] = useState<LyricsOption>('Instrumental');
  const [customLyrics, setCustomLyrics] = useState('');
  const [encodingVideoId, setEncodingVideoId] = useState<string | null>(null);
  const [, setEncodingProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<
    { data: string; mimeType: string; previewUrl: string }[]
  >([]);

  // Mobile View Navigation State
  const [mobileMainTab, setMobileMainTab] = useState<'create' | 'library'>('create');
  const [activeInputTab, setActiveInputTab] = useState<'novel' | 'simple'>('simple');
  const [activeArchiveTab, setActiveArchiveTab] = useState<'my-music' | 'favorites'>('my-music');
  const [voiceGender, setVoiceGender] = useState<'Random' | 'Male' | 'Female'>('Random');

  // Token Tracking State
  const [totalInputTokens, setTotalInputTokens] = useState(() =>
    parseInt(localStorage.getItem('lyria_input_tokens') || '0', 10)
  );
  const [totalOutputTokens, setTotalOutputTokens] = useState(() =>
    parseInt(localStorage.getItem('lyria_output_tokens') || '0', 10)
  );

  React.useEffect(() => {
    localStorage.setItem('lyria_input_tokens', totalInputTokens.toString());
  }, [totalInputTokens]);

  React.useEffect(() => {
    localStorage.setItem('lyria_output_tokens', totalOutputTokens.toString());
  }, [totalOutputTokens]);

  const estimatedCost = (
    (totalInputTokens * 2.0) / 1000000 +
    (totalOutputTokens * 5.0) / 1000000
  ).toFixed(4);

  const handleResetTokens = () => {
    setTotalInputTokens(0);
    setTotalOutputTokens(0);
  };

  // Model Routing & Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBpmDetectorOpen, setIsBpmDetectorOpen] = useState(false);
  const [selectedMusicModel, setSelectedMusicModel] = useState<string>(() => {
    const saved = localStorage.getItem('sen_music_model');
    if (!saved || saved === 'lyria-3-pro-preview') {
      return CONFIG.MODEL_ID_FULL;
    }
    return saved;
  });
  const [temperature, setTemperature] = useState<number>(() => {
    const saved = localStorage.getItem('sen_temperature');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [sampleRate, setSampleRate] = useState<'24kHz' | '48kHz'>(() => {
    const saved = localStorage.getItem('sen_sample_rate');
    return saved === '48kHz' ? '48kHz' : '24kHz';
  });

  React.useEffect(() => {
    localStorage.setItem('sen_music_model', selectedMusicModel);
  }, [selectedMusicModel]);

  React.useEffect(() => {
    localStorage.setItem('sen_temperature', temperature.toString());
  }, [temperature]);

  React.useEffect(() => {
    localStorage.setItem('sen_sample_rate', sampleRate);
  }, [sampleRate]);

  // Helper Mode States
  const [culture, setCulture] = useState('Chinese');
  const [isTranslating, setIsTranslating] = useState(false);
  const [chapterText, setChapterText] = useState('');
  const [soundscapeConfig, setSoundscapeConfig] = useState<SoundscapeConfig>({
    culture: 'Chinese',
    mood: 'sorrowful',
    instrument: 'Erhu',
    pacing: 'slow pacing',
    mainTexture: 'emotional bowed melodies',
    environmentalTexture: 'ambient rain noises',
    sceneAtmosphere: 'abandoned courtyard',
    emotionalDirection: 'deep grief and longing',
    endingDirection: 'soft tragic ending',
    vocals: 'no lyrics, no spoken words',
    intensity: 0.5,
  });

  // Custom Hooks
  const { gen, setGen, toggleExpand, deleteResult, handleGenerate: handleGenerateCore, rerollTrackTitle, updateTrackTitle, updateTrackTags } = useSoundscapeGenerator();
  const { favoriteResults, toggleFavorite, removeFavorite, updateFavoriteTitle, updateFavoriteTags } = useFavorites(gen.results);
  const {
    isResultPlaying,
    setIsResultPlaying,
    activePresetPlaying,
    handlePlayStateChange,
    togglePresetPlaying
  } = useAudioPlayback();

  const handleUpdateTrackTitle = (id: string, newTitle: string) => {
    updateTrackTitle(id, newTitle);
    updateFavoriteTitle(id, newTitle);
  };

  const handleUpdateTrackTags = (id: string, tags: SoundscapeTags) => {
    updateTrackTags(id, tags);
    updateFavoriteTags(id, tags);
  };

  const handleDeleteResult = (id: string) => {
    deleteResult(id);
    removeFavorite(id);
    if (isResultPlaying === id) {
      setIsResultPlaying(null);
    }
  };

  const handleSelectKey = () => {
    const win = window as any;
    if (win.aistudio?.openSettings) {
      win.aistudio.openSettings();
    } else {
      alert('Settings can be configured in your environment settings menu.');
    }
  };

  const handleCultureChange = (newCulture: string) => {
    setCulture(newCulture);
    const instruments = getInstrumentsForCulture(newCulture);
    const lowerCurrentInst = soundscapeConfig.instrument.toLowerCase();
    const currentMatches = instruments.some(
      (inst) => inst.name.toLowerCase() === lowerCurrentInst
    );
    if (!currentMatches && instruments.length > 0) {
      const defaultInst = instruments[0];
      setSoundscapeConfig((prev) => ({
        ...prev,
        culture: newCulture,
        instrument: defaultInst.name,
        mood: defaultInst.mood,
      }));
      setPrompt(
        `An immersive traditional ${newCulture} soundscape featuring the elegant tones of ${defaultInst.name}, evoking a mood of ${defaultInst.mood}.`
      );
    } else {
      setSoundscapeConfig((prev) => ({
        ...prev,
        culture: newCulture,
      }));
    }
  };

  const handleSelectInstrument = (inst: ChineseInstrument) => {
    setSoundscapeConfig((prev) => ({
      ...prev,
      instrument: inst.name,
      mood: inst.mood,
    }));

    const updatedPrompt = `An immersive traditional ${culture} soundscape featuring the elegant tones of ${inst.name}, evoking a mood of ${inst.mood}.`;
    setPrompt(updatedPrompt);
    setIsPromptManual(false);
  };

  const handleGenerateClick = () => {
    const baseManualPrompt = prompt.trim() || 'Atmospheric soundscape resonant with the visual scene snapshot';
    let finalPrompt = activeInputTab === 'novel'
      ? `[Chapter Soundscape] Mood: ${soundscapeConfig.mood}. Style: ${culture}. Primary Instrument: ${soundscapeConfig.instrument}. Pacing: ${soundscapeConfig.pacing}. Main Texture: ${soundscapeConfig.mainTexture}. Env Noise: ${soundscapeConfig.environmentalTexture}. Atmosphere: ${soundscapeConfig.sceneAtmosphere}. Ending: ${soundscapeConfig.endingDirection}. Vocals: ${soundscapeConfig.vocals}.`
      : `[Manual Soundscape] ${baseManualPrompt} | Style: ${culture}, Pacing: ${soundscapeConfig.pacing}, Intensity: ${soundscapeConfig.intensity ?? 0.5}${soundscapeConfig.instrument ? `, Instrument: ${soundscapeConfig.instrument}` : ''}`;
      
    if (selectedImages.length > 0) {
      finalPrompt += ` | Multimodal Scene Visual Anchor: Synchronized with uploaded scene visual imagery (${selectedImages.length} image reference).`;
    }

    if (activeInputTab === 'simple' && lyricsOption === 'Custom' && customLyrics.trim()) {
      finalPrompt += `\n\nLyrics to include:\n"${customLyrics.trim()}"`;
    }

    handleGenerateCore({
      prompt: finalPrompt,
      lyricsOption,
      selectedMusicModel,
      culture,
      soundscapeConfig,
      activeInputTab,
      chapterText,
      selectedImages,
      onStart: () => {
        setActiveArchiveTab('my-music');
        setMobileMainTab('library');
      },
      onSuccess: (inputTokens, outputTokens) => {
        setTotalInputTokens((prev) => prev + inputTokens);
        setTotalOutputTokens((prev) => prev + outputTokens);
      },
      onError: () => {}
    });
  };

  const handleDownload = (result: SongResult) => {
    if (!result.audioUrl) return;
    const exportName = getAutoExportName(
      result.fullPrompt || result.originalPrompt,
      result.title,
      result.soundscapeConfig
    );

    const a = document.createElement('a');
    a.href = result.audioUrl;
    a.download = `${exportName}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#05060e] text-gray-100 font-sans pb-28 sm:pb-24 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] overflow-x-clip">
      <Header
        totalTokens={totalInputTokens + totalOutputTokens}
        estimatedCost={estimatedCost}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBpmDetector={() => setIsBpmDetectorOpen(true)}
      />

      <section className="py-5 sm:py-8 px-3 sm:px-6 text-center bg-radial-gradient relative overflow-hidden select-none">
        <div className="mb-3 sm:mb-4 px-2.5 sm:px-4 py-1.5 bg-cyan-950/70 border border-cyan-400/50 rounded-full w-full max-w-xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-md shadow-md overflow-hidden">
          <span className="text-[10px] sm:text-xs font-extrabold tracking-wider sm:tracking-widest text-cyan-300 uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> DAO INSIGHT
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
          <DaoInsightQuote quote={daoInsight} />
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-displaySc drop-shadow-md px-2">
          SEN Soundscapes
        </h1>
        <p className="text-[10px] xs:text-xs sm:text-sm text-cyan-300 mt-1 sm:mt-2 font-bold tracking-wider sm:tracking-widest uppercase px-2 leading-relaxed break-words">
          Expanded Novels • Celestial Immersive Audio Companion
        </p>
      </section>

      <div className="lg:hidden px-4 mb-6 max-w-md mx-auto w-full">
        <SegmentedControl
          options={[
            { id: 'create', label: 'Create', icon: <Wand2 className="w-3.5 h-3.5" /> },
            {
              id: 'library',
              label: 'Library',
              icon: <ListMusic className="w-3.5 h-3.5" />,
              badge: gen.results.length > 0 ? gen.results.length : undefined,
            },
          ]}
          value={mobileMainTab}
          onChange={setMobileMainTab}
          size="lg"
        />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div
          className={`lg:col-span-6 xl:col-span-5 space-y-5 sm:space-y-6 ${
            mobileMainTab === 'library' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div>
            <ChineseInstrumentList
              activeInstrument={soundscapeConfig.instrument}
              culture={culture}
              onSelectInstrument={handleSelectInstrument}
              onCultureChange={handleCultureChange}
            />
          </div>

          <div className="bg-[#0a0c1a]/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <h2 className="font-extrabold text-sm sm:text-base md:text-lg text-white tracking-wide flex items-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-0">
                <Wand2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Generate Soundscape</span>
              </h2>

              <div className="flex bg-slate-950 p-1 rounded-full border border-slate-700 shrink-0">
                <button
                  onClick={() => setActiveInputTab('novel')}
                  aria-label="Switch to Chapter Parser mode"
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer min-h-[30px] sm:min-h-[32px] ${
                    activeInputTab === 'novel'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Parser
                </button>
                <button
                  onClick={() => setActiveInputTab('simple')}
                  aria-label="Switch to Manual input mode"
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer min-h-[30px] sm:min-h-[32px] ${
                    activeInputTab === 'simple'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {activeInputTab === 'novel' && (
              <ParserConsole
                soundscapeConfig={soundscapeConfig}
                setSoundscapeConfig={setSoundscapeConfig}
                isTranslating={isTranslating}
                setIsTranslating={setIsTranslating}
                chapterText={chapterText}
                setChapterText={setChapterText}
                culture={culture}
                setCulture={handleCultureChange}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
              />
            )}

            {activeInputTab === 'simple' && (
              <ManualConsole
                lyricsOption={lyricsOption}
                setLyricsOption={setLyricsOption}
                customLyrics={customLyrics}
                setCustomLyrics={setCustomLyrics}
                prompt={prompt}
                setPrompt={setPrompt}
                setIsPromptManual={setIsPromptManual}
                voiceGender={voiceGender}
                setVoiceGender={setVoiceGender}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                culture={culture}
                onApplySceneCoordinates={(coords) => {
                  setSoundscapeConfig((prev) => ({
                    ...prev,
                    mood: coords.mood || prev.mood,
                    instrument: coords.instrument || prev.instrument,
                    environmentalTexture: coords.environment || prev.environmentalTexture,
                  }));
                }}
              />
            )}

            <button
              onClick={handleGenerateClick}
              disabled={
                (!prompt.trim() && selectedImages.length === 0 && (activeInputTab === 'simple' || !chapterText.trim())) ||
                CONFIG.IS_MAINTENANCE_MODE
              }
              aria-label="Generate Soundscape audio track"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-950/50 transition-all cursor-pointer min-h-[48px] active:scale-[0.98] disabled:opacity-40 border border-cyan-300/30"
            >
              Generate Soundscape
            </button>
          </div>
        </div>

        <div
          className={`lg:col-span-6 xl:col-span-7 space-y-6 ${
            mobileMainTab === 'library'
              ? 'block'
              : 'hidden lg:block'
          }`}
        >
          <SoundscapeVault
            activeArchiveTab={activeArchiveTab}
            setActiveArchiveTab={setActiveArchiveTab}
            genResults={gen.results}
            favoriteResults={favoriteResults}
            isResultPlaying={isResultPlaying}
            encodingVideoId={encodingVideoId}
            toggleExpand={toggleExpand}
            toggleFavorite={(id) => toggleFavorite(id, setGen)}
            handleDownload={handleDownload}
            onDownloadVideo={onDownloadVideo}
            handlePlayStateChange={handlePlayStateChange}
            onDelete={handleDeleteResult}
            onRerollTitle={rerollTrackTitle}
            onUpdateTitle={handleUpdateTrackTitle}
            onUpdateTags={handleUpdateTrackTags}
          />
        </div>
      </main>

      <PlayerBar />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedMusicModel}
        onSelectModel={setSelectedMusicModel}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        sampleRate={sampleRate}
        onSampleRateChange={setSampleRate}
        totalTokens={totalInputTokens + totalOutputTokens}
        estimatedCost={estimatedCost}
        onResetTokens={handleResetTokens}
        onOpenApiKeySettings={handleSelectKey}
      />

      <BpmDetectorModal
        isOpen={isBpmDetectorOpen}
        onClose={() => setIsBpmDetectorOpen(false)}
        tracks={gen.results}
        activeTrackId={isResultPlaying}
      />
    </div>
  );
};

export default App;
