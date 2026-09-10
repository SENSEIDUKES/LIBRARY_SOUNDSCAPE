import { SongResult } from '../../types';
import { extractMetadata, getCultureForSong } from './helpers';

export interface VaultFilterOptions {
  searchQuery?: string;
  selectedCulture?: string; // 'all' | 'Chinese' | 'Japanese' | 'Korean' | 'Western'
  selectedMood?: string;
  selectedInstrument?: string;
}

/**
 * Filters a list of soundscape results based on search query, culture, mood, instrument, and genre tags.
 */
export const filterSoundscapes = (
  songs: SongResult[],
  options: VaultFilterOptions
): SongResult[] => {
  const query = (options.searchQuery || '').trim().toLowerCase();
  const cultureFilter = options.selectedCulture && options.selectedCulture !== 'all'
    ? options.selectedCulture.toLowerCase()
    : null;
  const moodFilter = options.selectedMood && options.selectedMood !== 'all'
    ? options.selectedMood.toLowerCase()
    : null;
  const instrumentFilter = options.selectedInstrument && options.selectedInstrument !== 'all'
    ? options.selectedInstrument.toLowerCase()
    : null;

  if (!query && !cultureFilter && !moodFilter && !instrumentFilter) {
    return songs;
  }

  // Precompile query tokens and matchers once outside the iteration loop to avoid O(N * T) complexity
  const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];
  const tokenMatchers = queryTokens.map((token) => {
    if (token.length <= 2) {
      const regex = new RegExp(`\\b${token}\\b`, 'i');
      return (text: string) => regex.test(text);
    }
    return (text: string) => text.includes(token);
  });

  return songs.filter((song) => {
    const songCulture = getCultureForSong(
      song.soundscapeConfig,
      song.fullPrompt || song.originalPrompt,
      song.title
    );

    // Culture match check
    if (cultureFilter && songCulture.toLowerCase() !== cultureFilter) {
      return false;
    }

    // Mood match check
    if (moodFilter) {
      const songMood = song.soundscapeConfig?.mood?.toLowerCase() || '';
      if (!songMood.includes(moodFilter)) {
        return false;
      }
    }

    // Instrument match check
    if (instrumentFilter) {
      const songInstrument = song.soundscapeConfig?.instrument?.toLowerCase() || '';
      if (!songInstrument.includes(instrumentFilter)) {
        return false;
      }
    }

    // Query text match check across multiple fields
    if (query) {
      const title = (song.title || '').toLowerCase();
      const prompt = `${song.fullPrompt || ''} ${song.originalPrompt || ''}`.toLowerCase();
      const lyrics = (song.lyrics || '').toLowerCase();
      const chapter = (song.chapterText || '').toLowerCase();
      const model = (song.modelId || '').toLowerCase();

      const config = song.soundscapeConfig;
      const mood = (config?.mood || '').toLowerCase();
      const instrument = (config?.instrument || '').toLowerCase();
      const pacing = (config?.pacing || '').toLowerCase();
      const mainTexture = (config?.mainTexture || '').toLowerCase();
      const envTexture = (config?.environmentalTexture || '').toLowerCase();
      const atmosphere = (config?.sceneAtmosphere || '').toLowerCase();
      const emotionalDirection = (config?.emotionalDirection || '').toLowerCase();
      const endingDirection = (config?.endingDirection || '').toLowerCase();
      const vocals = (config?.vocals || '').toLowerCase();

      const extMeta = extractMetadata(song.metadata, song.soundscapeConfig);
      const metaGenres = (extMeta.genres || []).map((g) => g.toLowerCase()).join(' ');
      const metaKey = (extMeta.key || '').toLowerCase();
      const metaTempo = (extMeta.tempo || '').toLowerCase();
      const cultureStr = songCulture.toLowerCase();

      const combinedSearchText = [
        title,
        prompt,
        lyrics,
        chapter,
        model,
        mood,
        instrument,
        pacing,
        mainTexture,
        envTexture,
        atmosphere,
        emotionalDirection,
        endingDirection,
        vocals,
        metaGenres,
        metaKey,
        metaTempo,
        cultureStr,
      ].join(' ');

      // If exact phrase matches, include immediately
      if (combinedSearchText.includes(query)) {
        return true;
      }

      // Check token by token with precompiled matchers
      const matchesAllTokens = tokenMatchers.every((matcher) => matcher(combinedSearchText));

      if (!matchesAllTokens) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Extracts popular tags (cultures, instruments, moods) present in the active song list
 * to provide quick suggestion chips.
 */
export const extractVaultQuickTags = (songs: SongResult[]): {
  instruments: string[];
  moods: string[];
} => {
  const instrumentsSet = new Set<string>();
  const moodsSet = new Set<string>();

  songs.forEach((song) => {
    if (song.soundscapeConfig?.instrument) {
      instrumentsSet.add(song.soundscapeConfig.instrument);
    }
    if (song.soundscapeConfig?.mood) {
      moodsSet.add(song.soundscapeConfig.mood);
    }
  });

  return {
    instruments: Array.from(instrumentsSet).slice(0, 6),
    moods: Array.from(moodsSet).slice(0, 6),
  };
};
