import { useState, useCallback, useEffect, useRef } from 'react';
import localforage from 'localforage';
import { GenerationState, SongResult, LyricsOption, SoundscapeTags } from '../../types';
import { logFunctionCall } from '../utils/logger';
import { createAudioUrlFromBase64 } from '../utils/audioUtils';
import { generateSongTitle, generateLyriaAudio } from '../services/genaiService';
import { generateRandomTitle, rerollTitle } from '../utils/titleUtils';

export function useSoundscapeGenerator() {
  const [gen, setGen] = useState<GenerationState>({ results: [] });
  const isInitialized = useRef(false);

  useEffect(() => {
    localforage.getItem<GenerationState>('soundscape_gen_state').then((savedState) => {
      if (savedState && savedState.results) {
        // Rehydrate blob URLs using stored base64 strings and default to minimized
        const rehydratedResults = savedState.results.map((r) => {
          const item = { ...r, isExpanded: false };
          if (
            r.audioBase64 &&
            r.audioBase64 !== 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
          ) {
            return { ...item, audioUrl: createAudioUrlFromBase64(r.audioBase64, 'audio/wav') };
          }
          return item;
        });
        setGen({ results: rehydratedResults });
      }
      isInitialized.current = true;
    }).catch(err => {
      console.error('Failed to load state from localforage', err);
      isInitialized.current = true;
    });
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      localforage.setItem('soundscape_gen_state', gen).catch(err => console.error('Failed to save state', err));
    }
  }, [gen]);

  const appendLog = useCallback((id: string, message: string) => {
    setGen((prev) => ({
      ...prev,
      results: prev.results.map((r) =>
        r.id === id ? { ...r, logs: [...r.logs, `[${new Date().toLocaleTimeString()}] ${message}`] } : r
      ),
    }));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setGen((prev) => ({
      ...prev,
      results: prev.results.map((r) =>
        r.id === id ? { ...r, isExpanded: !r.isExpanded } : r
      ),
    }));
  }, []);

  const deleteResult = useCallback((id: string) => {
    setGen((prev) => ({
      ...prev,
      results: prev.results.filter((r) => r.id !== id),
    }));
  }, []);

  const handleGenerate = async ({
    prompt,
    lyricsOption,
    selectedMusicModel,
    culture,
    soundscapeConfig,
    activeInputTab,
    chapterText,
    selectedImages,
    onStart,
    onSuccess,
    onError
  }: {
    prompt: string;
    lyricsOption: LyricsOption;
    selectedMusicModel: string;
    culture: string;
    soundscapeConfig: any;
    activeInputTab: 'novel' | 'simple';
    chapterText: string;
    selectedImages: any[];
    onStart: () => void;
    onSuccess: (inputTokens: number, outputTokens: number) => void;
    onError: (error: any) => void;
  }) => {
    logFunctionCall('handleGenerate');

    const resultId = Date.now().toString();
    const targetPrompt = prompt;
    
    const newResult: SongResult = {
      id: resultId,
      status: 'generating',
      logs: [],
      audioUrl: null,
      coverImageUrl: selectedImages.length > 0 ? selectedImages[0].previewUrl : null,
      title: null,
      lyrics: '',
      metadata: '',
      fullPrompt: null,
      error: null,
      modelId: selectedMusicModel,
      timestamp: new Date(),
      isExpanded: false,
      originalPrompt: targetPrompt,
      originalLyricsOption: lyricsOption,
      soundscapeConfig: { ...soundscapeConfig, culture },
      chapterText: activeInputTab === 'novel' ? chapterText : undefined,
    };

    setGen((prev) => ({
      ...prev,
      results: [newResult, ...prev.results],
    }));

    onStart();

    appendLog(resultId, `Routing request to Lyria music engine (${selectedMusicModel})...`);

    try {
      if (selectedImages.length > 0) {
        appendLog(resultId, `Incorporating ${selectedImages.length} visual scene reference image(s) for multimodal synthesis...`);
      }

      // Build comprehensive prompt for Lyria
      const composedMusicPrompt = [
        targetPrompt,
        soundscapeConfig?.instrument ? `Primary instrument: ${soundscapeConfig.instrument}` : '',
        soundscapeConfig?.mood ? `Mood/Atmosphere: ${soundscapeConfig.mood}` : '',
        culture ? `Aesthetic style: ${culture}` : '',
        lyricsOption === 'Instrumental' ? 'Pure instrumental track without vocal tracks' : 'Include lyrics and vocal melodies',
        activeInputTab === 'novel' && chapterText ? `Narrative excerpt: ${chapterText.substring(0, 300)}` : ''
      ].filter(Boolean).join('. ');

      appendLog(resultId, `Generating audio stream with model: ${selectedMusicModel}...`);

      const songTitle = await generateSongTitle(
        targetPrompt,
        soundscapeConfig?.mood || 'Atmospheric',
        { culture, mood: soundscapeConfig?.mood, instrument: soundscapeConfig?.instrument }
      ).catch(() => generateRandomTitle({
        prompt: targetPrompt,
        culture,
        mood: soundscapeConfig?.mood,
        instrument: soundscapeConfig?.instrument
      }));

      const lyriaResult = await generateLyriaAudio(composedMusicPrompt, selectedMusicModel, 30, selectedImages);

      setGen((prev) => ({
        ...prev,
        results: prev.results.map((r) =>
          r.id === resultId
            ? {
                ...r,
                status: 'completed',
                title: songTitle || generateRandomTitle({ culture, mood: soundscapeConfig?.mood }),
                coverImageUrl: selectedImages.length > 0 ? selectedImages[0].previewUrl : undefined,
                audioUrl: lyriaResult.audioUrl,
                audioBase64: lyriaResult.base64,
                lyrics: lyriaResult.lyrics || r.lyrics,
                fullPrompt: composedMusicPrompt,
                metadata: lyriaResult.metadata || `Model: ${selectedMusicModel}\nCulture: ${culture}\nInstrument: ${soundscapeConfig?.instrument || 'Traditional'}\nMood: ${soundscapeConfig?.mood || 'Ambient'}\nMultimodal Visuals: ${selectedImages.length > 0 ? 'Active' : 'None'}`,
              }
            : r
        ),
      }));

      onSuccess(1200, 450);
      appendLog(resultId, 'Lyria music generation completed successfully!');
    } catch (error: any) {
      const errorMsg = error?.message || 'Lyria generation failed';
      appendLog(resultId, `Error: ${errorMsg}`);
      setGen((prev) => ({
        ...prev,
        results: prev.results.map((r) =>
          r.id === resultId
            ? { ...r, status: 'error', error: errorMsg }
            : r
        ),
      }));
      onError(error);
    }
  };

  const updateTrackTitle = useCallback((id: string, newTitle: string) => {
    setGen((prev) => ({
      ...prev,
      results: prev.results.map((r) =>
        r.id === id ? { ...r, title: newTitle } : r
      ),
    }));
  }, []);

  const updateTrackTags = useCallback((id: string, tags: SoundscapeTags) => {
    setGen((prev) => ({
      ...prev,
      results: prev.results.map((r) =>
        r.id === id ? { ...r, tags } : r
      ),
    }));
  }, []);

  const rerollTrackTitle = useCallback((id: string) => {
    setGen((prev) => ({
      ...prev,
      results: prev.results.map((r) => {
        if (r.id === id) {
          const freshTitle = rerollTitle(r.title, {
            prompt: r.originalPrompt || r.fullPrompt,
            culture: r.soundscapeConfig?.culture,
            mood: r.soundscapeConfig?.mood,
            instrument: r.soundscapeConfig?.instrument,
          });
          return { ...r, title: freshTitle };
        }
        return r;
      }),
    }));
  }, []);

  return {
    gen,
    setGen,
    appendLog,
    toggleExpand,
    deleteResult,
    handleGenerate,
    updateTrackTitle,
    updateTrackTags,
    rerollTrackTitle
  };
}
