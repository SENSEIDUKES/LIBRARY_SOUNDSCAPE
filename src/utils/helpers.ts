/**
 * General Helpers
 *
 * This module contains general utility functions used across the application.
 *
 * Use Cases:
 * - Selecting random items from arrays for prompt generation.
 */
import { logFunctionCall } from './logger';
import { SongResult } from '../../types';

/**
 * Returns a random item from the provided array.
 * @param arr The array to select from.
 * @returns A random element from the array.
 */
export const getRandomItem = <T>(arr: T[]): T => {
  logFunctionCall('getRandomItem', { arrayLength: arr.length });
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Sanitizes a title string to be safe and clean for use as a filename in downloads/renders.
 * Removes non-alphanumeric characters, converts spaces to underscores, and lowercases.
 * Example: "Heavenly Tribulation - Thunder Drum" -> "heavenly_tribulation_thunder_drum"
 */
export const sanitizeFilename = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, '') // remove special characters
    .replace(/[\s-_]+/g, '_')     // replace spaces/dashes/underscores with single underscores
    .replace(/^_+|_+$/g, '');      // trim leading/trailing underscores
};

interface HelperSoundscapeConfig {
  mood?: string;
  sceneAtmosphere?: string;
  intensity?: number | string;
}

/**
 * Formats a single word into PascalCase (removing spaces, extra dashes, etc.)
 */
export const toPascalCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Auto-names exports using short, clean title identifiers to keep filenames brief and clean.
 * Limits overall filename length to prevent excessively long download names.
 * Example: "Heavenly Tribulation" -> "HeavenlyTribulation_X7B"
 */
export const getAutoExportName = (
  originalPrompt: string | null,
  title: string | null,
  config?: HelperSoundscapeConfig
): string => {
  const uniqueTag = Math.random().toString(36).substring(2, 5).toUpperCase().padEnd(3, '0');

  // If a specific song title exists, use a short formatted version of the title
  if (title && title.trim().length > 0) {
    const pascalTitle = toPascalCase(title);
    // Truncate title if it's overly long (max 22 characters for title portion)
    const truncatedTitle = pascalTitle.length > 22 ? pascalTitle.slice(0, 22) : pascalTitle;
    return `${truncatedTitle}_${uniqueTag}`;
  }

  // Fallback if no title is present: parse mood and scene from config / prompt
  const textToAnalyze = `${originalPrompt || ''} ${config?.mood || ''} ${config?.sceneAtmosphere || ''}`.toLowerCase();

  let mood = '';
  if (config?.mood) {
    mood = toPascalCase(config.mood);
  } else {
    if (textToAnalyze.includes('adventure') || textToAnalyze.includes('quest') || textToAnalyze.includes('journey')) {
      mood = 'Adventure';
    } else if (textToAnalyze.includes('fight') || textToAnalyze.includes('combat') || textToAnalyze.includes('battle') || textToAnalyze.includes('duel')) {
      mood = 'Fighting';
    } else if (textToAnalyze.includes('sad') || textToAnalyze.includes('grief') || textToAnalyze.includes('sorrow') || textToAnalyze.includes('tribulation')) {
      mood = 'Sorrowful';
    } else if (textToAnalyze.includes('peace') || textToAnalyze.includes('calm') || textToAnalyze.includes('seren') || textToAnalyze.includes('meditat')) {
      mood = 'Serenity';
    } else if (textToAnalyze.includes('epic') || textToAnalyze.includes('triumph') || textToAnalyze.includes('victory')) {
      mood = 'Triumphant';
    } else {
      mood = 'Atmospheric';
    }
  }

  let scene = '';
  if (config?.sceneAtmosphere) {
    const cleanedScene = config.sceneAtmosphere
      .replace(/\b(setting|atmosphere|area|scene|environment)\b/gi, '')
      .trim();
    scene = toPascalCase(cleanedScene || 'Realm');
  } else {
    if (textToAnalyze.includes('cave') || textToAnalyze.includes('cavern')) {
      scene = 'DarkCave';
    } else if (textToAnalyze.includes('temple') || textToAnalyze.includes('shrine')) {
      scene = 'Temple';
    } else if (textToAnalyze.includes('mountain') || textToAnalyze.includes('peak')) {
      scene = 'HighMountain';
    } else if (textToAnalyze.includes('forest') || textToAnalyze.includes('bamboo')) {
      scene = 'BambooForest';
    } else {
      scene = 'EtherealRealm';
    }
  }

  const shortMood = mood.slice(0, 10);
  const shortScene = scene.slice(0, 10);
  return `${shortMood}_${shortScene}_${uniqueTag}`;
};

export interface ExtractedMetadata {
  key: string | null;
  tempo: string | null;
  genres: string[];
}

/**
 * Dynamically extracts key, tempo (BPM), and genre tags from generated metadata text,
 * with context-aware musical fallbacks parsed from the soundscape's narrative coordinates.
 */
export const extractMetadata = (
  metadataText: string,
  soundscapeConfig?: {
    mood?: string;
    instrument?: string;
    pacing?: string;
  }
): ExtractedMetadata => {
  let key: string | null = null;
  let tempo: string | null = null;
  let genres: string[] = [];

  if (metadataText) {
    const keyMatch = metadataText.match(/(?:Key|Scale|Tonality):\s*([A-Ga-g]#?b?\s*(?:minor|major|m|min|maj|dorian|phrygian|lydian|mixolydian|aeolian|locrian|pentatonic)?\b)/i);
    if (keyMatch) key = keyMatch[1].trim();

    const tempoMatch = metadataText.match(/(?:BPM|Tempo|Pacing|Speed):\s*(\d+\s*(?:bpm)?\b)/i);
    if (tempoMatch) {
      tempo = tempoMatch[1].trim();
    } else {
      const generalTempoMatch = metadataText.match(/(?:BPM|Tempo|Pacing|Speed):\s*([a-z0-9\s-]+(?:\b|pacing|tempo))/i);
      if (generalTempoMatch) tempo = generalTempoMatch[1].trim();
    }

    const genreMatch = metadataText.match(/(?:Genre|Genres|Tags|Styles|Style):\s*([^\n]+)/i);
    if (genreMatch) {
      genres = genreMatch[1]
        .split(/[,/;|]/)
        .map(g => g.trim())
        .filter(g => g.length > 0 && g.toLowerCase() !== 'n/a');
    }
  }

  if (!tempo) {
    if (soundscapeConfig?.pacing) {
      tempo = soundscapeConfig.pacing;
    } else {
      tempo = null;
    }
  }

  if (genres.length === 0) {
    const defaultGenres = ['Soundscape'];
    if (soundscapeConfig?.mood) defaultGenres.push(toPascalCase(soundscapeConfig.mood));
    if (soundscapeConfig?.instrument) defaultGenres.push(toPascalCase(soundscapeConfig.instrument));
    genres = defaultGenres;
  }

  return { key, tempo, genres };
};

/**
 * Formats a shareable text card representation of a generated soundscape,
 * including key metadata, atmosphere parameters, narrative excerpt, and direct link.
 */
export const formatShareText = (
  result: SongResult,
  baseUrl?: string
): string => {
  const extMeta = extractMetadata(result.metadata, result.soundscapeConfig);
  const title = result.title || 'Celestial Soundscape';

  let shareUrl = '';
  if (baseUrl) {
    shareUrl = `${baseUrl.split('#')[0]}#soundscape-${result.id}`;
  } else if (typeof window !== 'undefined' && window.location) {
    shareUrl = `${window.location.origin}${window.location.pathname}#soundscape-${result.id}`;
  } else {
    shareUrl = `#soundscape-${result.id}`;
  }

  const metaParts = [];
  if (extMeta.key) metaParts.push(`Key: ${extMeta.key}`);
  if (extMeta.tempo) metaParts.push(`Tempo: ${extMeta.tempo}`);
  
  const lines: string[] = [
    `🎵 SEN Soundscape: ${title}`,
  ];
  if (metaParts.length > 0) {
    lines.push(`🎹 ${metaParts.join(' • ')}`);
  }

  if (extMeta.genres && extMeta.genres.length > 0) {
    lines.push(`🏷️ Genres: ${extMeta.genres.join(', ')}`);
  }

  if (result.soundscapeConfig) {
    const { mood, instrument, sceneAtmosphere } = result.soundscapeConfig;
    const atmosphereParts = [mood, instrument, sceneAtmosphere].filter(Boolean);
    if (atmosphereParts.length > 0) {
      lines.push(`✨ Atmosphere: ${atmosphereParts.join(' • ')}`);
    }
  }

  if (result.chapterText) {
    const trimmedChapter = result.chapterText.trim();
    const snippet = trimmedChapter.length > 120
      ? `${trimmedChapter.slice(0, 117)}...`
      : trimmedChapter;
    lines.push(`📜 Narrative: "${snippet}"`);
  }

  lines.push(`🔗 Listen: ${shareUrl}`);

  return lines.join('\n');
};

/**
 * Copies text to clipboard with standard navigator API and fallback.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  logFunctionCall('copyToClipboard', { textLength: text.length });
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export type SongCulture = 'Chinese' | 'Japanese' | 'Korean' | 'Western';

export interface CultureTheme {
  name: SongCulture;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  cardExpandedBorder: string;
  cardBg: string;
  cardExpandedBg: string;
  accentText: string;
  accentBg: string;
  playBtnBg: string;
  ring: string;
  tagClass: string;
  iconColor: string;
}

export const CULTURAL_THEMES: Record<SongCulture, CultureTheme> = {
  Chinese: {
    name: 'Chinese',
    badgeBg: 'bg-blue-950/90',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-400/60',
    cardBorder: 'border-blue-600/60',
    cardExpandedBorder: 'border-blue-400/90',
    cardBg: 'bg-slate-900/80 hover:bg-blue-950/30',
    cardExpandedBg: 'bg-slate-950/95',
    accentText: 'text-blue-300',
    accentBg: 'bg-blue-500/20',
    playBtnBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/50',
    ring: 'ring-blue-400/40',
    tagClass: 'bg-blue-950/80 border-blue-700/60 text-blue-300',
    iconColor: 'text-blue-400',
  },
  Japanese: {
    name: 'Japanese',
    badgeBg: 'bg-emerald-950/90',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-400/60',
    cardBorder: 'border-emerald-600/60',
    cardExpandedBorder: 'border-emerald-400/90',
    cardBg: 'bg-slate-900/80 hover:bg-emerald-950/30',
    cardExpandedBg: 'bg-slate-950/95',
    accentText: 'text-emerald-300',
    accentBg: 'bg-emerald-500/20',
    playBtnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50',
    ring: 'ring-emerald-400/40',
    tagClass: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
    iconColor: 'text-emerald-400',
  },
  Korean: {
    name: 'Korean',
    badgeBg: 'bg-rose-950/90',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-400/60',
    cardBorder: 'border-rose-600/60',
    cardExpandedBorder: 'border-rose-400/90',
    cardBg: 'bg-slate-900/80 hover:bg-rose-950/30',
    cardExpandedBg: 'bg-slate-950/95',
    accentText: 'text-rose-300',
    accentBg: 'bg-rose-500/20',
    playBtnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50',
    ring: 'ring-rose-400/40',
    tagClass: 'bg-rose-950/80 border-rose-700/60 text-rose-300',
    iconColor: 'text-rose-400',
  },
  Western: {
    name: 'Western',
    badgeBg: 'bg-purple-950/90',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/60',
    cardBorder: 'border-purple-600/60',
    cardExpandedBorder: 'border-purple-400/90',
    cardBg: 'bg-slate-900/80 hover:bg-purple-950/30',
    cardExpandedBg: 'bg-slate-950/95',
    accentText: 'text-purple-300',
    accentBg: 'bg-purple-500/20',
    playBtnBg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50',
    ring: 'ring-purple-400/40',
    tagClass: 'bg-purple-950/80 border-purple-700/60 text-purple-300',
    iconColor: 'text-purple-400',
  },
};

export const getCultureForSong = (
  soundscapeConfig?: { culture?: string; instrument?: string },
  promptText?: string | null,
  titleText?: string | null,
  tags?: string[]
): SongCulture => {
  if (soundscapeConfig?.culture) {
    const c = soundscapeConfig.culture;
    if (c === 'Chinese' || c === 'Japanese' || c === 'Korean' || c === 'Western') {
      return c as SongCulture;
    }
  }

  const combined = [
    soundscapeConfig?.culture || '',
    soundscapeConfig?.instrument || '',
    promptText || '',
    titleText || '',
    ...(tags || [])
  ].join(' ').toLowerCase();

  if (
    combined.includes('japanese') ||
    combined.includes('japan') ||
    combined.includes('shamisen') ||
    combined.includes('koto') ||
    combined.includes('taiko') ||
    combined.includes('shakuhachi') ||
    combined.includes('shinobue') ||
    combined.includes('biwa')
  ) {
    return 'Japanese';
  }
  if (
    combined.includes('korean') ||
    combined.includes('korea') ||
    combined.includes('gayageum') ||
    combined.includes('haegeum') ||
    combined.includes('daegeum') ||
    combined.includes('janggu') ||
    combined.includes('taepyeongso') ||
    combined.includes('ajaeng') ||
    combined.includes('kkwaenggwari')
  ) {
    return 'Korean';
  }
  if (
    combined.includes('western') ||
    combined.includes('harp') ||
    combined.includes('lute') ||
    combined.includes('organ') ||
    combined.includes('cello') ||
    combined.includes('french horn')
  ) {
    return 'Western';
  }

  return 'Chinese';
};




