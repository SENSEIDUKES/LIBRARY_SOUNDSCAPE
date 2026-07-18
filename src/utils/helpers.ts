/**
 * General Helpers
 *
 * This module contains general utility functions used across the application.
 *
 * Use Cases:
 * - Selecting random items from arrays for prompt generation.
 */
import { logFunctionCall } from './logger';

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
 * Auto-names exports based on Mood, Scene and Intensity.
 * Follows layout: Mood_Scene_Intensity
 * Example: Adventure_DarkCave_Nightmare or Fighting_Tournament_Intense
 */
export const getAutoExportName = (
  originalPrompt: string | null,
  title: string | null,
  config?: HelperSoundscapeConfig
): string => {
  const textToAnalyze = `${originalPrompt || ''} ${title || ''} ${config?.mood || ''} ${config?.sceneAtmosphere || ''}`.toLowerCase();

  // 1. DETERMINE MOOD
  let mood = '';
  if (config?.mood) {
    mood = toPascalCase(config.mood);
  } else {
    if (textToAnalyze.includes('adventure') || textToAnalyze.includes('quest') || textToAnalyze.includes('travel') || textToAnalyze.includes('journey')) {
      mood = 'Adventure';
    } else if (textToAnalyze.includes('fight') || textToAnalyze.includes('combat') || textToAnalyze.includes('battle') || textToAnalyze.includes('duel') || textToAnalyze.includes('warrior') || textToAnalyze.includes('tournament')) {
      mood = 'Fighting';
    } else if (textToAnalyze.includes('sad') || textToAnalyze.includes('grief') || textToAnalyze.includes('sorrow') || textToAnalyze.includes('mourn') || textToAnalyze.includes('tragic') || textToAnalyze.includes('tribulation')) {
      mood = 'Sorrowful';
    } else if (textToAnalyze.includes('peace') || textToAnalyze.includes('calm') || textToAnalyze.includes('seren') || textToAnalyze.includes('meditat') || textToAnalyze.includes('tranquil') || textToAnalyze.includes('cultivat')) {
      mood = 'Serenity';
    } else if (textToAnalyze.includes('mystery') || textToAnalyze.includes('dark') || textToAnalyze.includes('hidden') || textToAnalyze.includes('secret') || textToAnalyze.includes('dread') || textToAnalyze.includes('fear') || textToAnalyze.includes('ghost')) {
      mood = 'Dread';
    } else if (textToAnalyze.includes('epic') || textToAnalyze.includes('triumph') || textToAnalyze.includes('glor') || textToAnalyze.includes('grand') || textToAnalyze.includes('victory') || textToAnalyze.includes('heroic')) {
      mood = 'Triumphant';
    } else if (textToAnalyze.includes('love') || textToAnalyze.includes('romance') || textToAnalyze.includes('passion') || textToAnalyze.includes('embrace')) {
      mood = 'Romance';
    } else {
      mood = 'Atmospheric';
    }
  }

  // 2. DETERMINE SCENE
  let scene = '';
  if (config?.sceneAtmosphere) {
    // clean up words like "setting" or "atmosphere" to make active scene names clean
    const cleanedScene = config.sceneAtmosphere
      .replace(/\b(setting|atmosphere|area|scene|environment)\b/gi, '')
      .trim();
    scene = toPascalCase(cleanedScene || 'Soundscape');
  } else {
    if (textToAnalyze.includes('cave') || textToAnalyze.includes('cavern') || textToAnalyze.includes('tunnel') || textToAnalyze.includes('underground')) {
      scene = 'DarkCave';
    } else if (textToAnalyze.includes('tournament') || textToAnalyze.includes('arena') || textToAnalyze.includes('ring') || textToAnalyze.includes('stage')) {
      scene = 'Tournament';
    } else if (textToAnalyze.includes('temple') || textToAnalyze.includes('shrine') || textToAnalyze.includes('hall') || textToAnalyze.includes('monastery')) {
      scene = 'AncientTemple';
    } else if (textToAnalyze.includes('mountain') || textToAnalyze.includes('peak') || textToAnalyze.includes('cliff') || textToAnalyze.includes('sect')) {
      scene = 'HighMountain';
    } else if (textToAnalyze.includes('battlefield') || textToAnalyze.includes('clash') || textToAnalyze.includes('army')) {
      scene = 'Battlefield';
    } else if (textToAnalyze.includes('forest') || textToAnalyze.includes('wood') || textToAnalyze.includes('tree') || textToAnalyze.includes('bamboo')) {
      scene = 'BambooForest';
    } else if (textToAnalyze.includes('courtyard') || textToAnalyze.includes('garden') || textToAnalyze.includes('pond')) {
      scene = 'AncientCourtyard';
    } else if (textToAnalyze.includes('city') || textToAnalyze.includes('town') || textToAnalyze.includes('market') || textToAnalyze.includes('street')) {
      scene = 'BustlingCity';
    } else if (textToAnalyze.includes('sea') || textToAnalyze.includes('ocean') || textToAnalyze.includes('water') || textToAnalyze.includes('river') || textToAnalyze.includes('lake') || textToAnalyze.includes('abyss')) {
      scene = 'DeepAbyss';
    } else {
      scene = 'EtherealRealm';
    }
  }

  // 3. DETERMINE INTENSITY
  let intensityVal = 0.5;
  if (config?.intensity !== undefined) {
    if (typeof config.intensity === 'number') {
      intensityVal = config.intensity;
    } else {
      const parsedFloat = parseFloat(config.intensity);
      if (!isNaN(parsedFloat)) intensityVal = parsedFloat;
    }
  } else {
    // try to parse "Intensity: 0.9" or "intensity: 0.1" from prompt
    const intensityMatch = textToAnalyze.match(/intensity:\s*([0-9.]+)/i);
    if (intensityMatch) {
      const parsedFloat = parseFloat(intensityMatch[1]);
      if (!isNaN(parsedFloat)) intensityVal = parsedFloat;
    } else {
      // try scanning words for heuristics
      if (textToAnalyze.includes('nightmare') || textToAnalyze.includes('apocalypse') || textToAnalyze.includes('frenzied') || textToAnalyze.includes('chaotic') || textToAnalyze.includes('cataclysm')) {
        intensityVal = 0.91;
      } else if (textToAnalyze.includes('intense') || textToAnalyze.includes('aggressive') || textToAnalyze.includes('furious') || textToAnalyze.includes('heavy') || textToAnalyze.includes('high intensity')) {
        intensityVal = 0.75;
      } else if (textToAnalyze.includes('peaceful') || textToAnalyze.includes('soft') || textToAnalyze.includes('gentle') || textToAnalyze.includes('low intensity') || textToAnalyze.includes('ambient')) {
        intensityVal = 0.15;
      }
    }
  }

  let intensity = 'Moderate';
  if (intensityVal > 0.82) {
    intensity = 'Nightmare';
  } else if (intensityVal > 0.6) {
    intensity = 'Intense';
  } else if (intensityVal < 0.35) {
    intensity = 'Tranquil';
  }

  // Compose export name safely using alphanumeric formatting with PascalCase title and unique random suffix
  const cleanTitle = title ? toPascalCase(title) : '';
  const baseName = cleanTitle 
    ? `${cleanTitle}_${mood}_${scene}_${intensity}` 
    : `${mood}_${scene}_${intensity}`;

  const uniqueTag = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, '0');
  return `${baseName}_${uniqueTag}`;
};

export interface ExtractedMetadata {
  key: string;
  tempo: string;
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

  // Context-aware Xianxia/Novel musical fallback engine
  if (!key) {
    const moodLower = (soundscapeConfig?.mood || '').toLowerCase();
    if (moodLower.includes('sad') || moodLower.includes('sorrow') || moodLower.includes('grief') || moodLower.includes('mourn') || moodLower.includes('tragic')) {
      key = 'D Minor';
    } else if (moodLower.includes('peace') || moodLower.includes('calm') || moodLower.includes('seren') || moodLower.includes('tranquil') || moodLower.includes('meditat')) {
      key = 'C Major';
    } else if (moodLower.includes('mystery') || moodLower.includes('tense') || moodLower.includes('dread') || moodLower.includes('dark')) {
      key = 'A Minor';
    } else if (moodLower.includes('epic') || moodLower.includes('triumph') || moodLower.includes('grand') || moodLower.includes('heroic')) {
      key = 'E Major';
    } else {
      key = 'G Minor'; // classic expressive pentatonic scale default for novel soundscapes
    }
  }

  if (!tempo) {
    const pacingLower = (soundscapeConfig?.pacing || '').toLowerCase();
    if (pacingLower.includes('slow')) {
      tempo = '72 BPM';
    } else if (pacingLower.includes('frenzied') || pacingLower.includes('frenzy')) {
      tempo = '145 BPM';
    } else if (pacingLower.includes('fast')) {
      tempo = '128 BPM';
    } else {
      tempo = '90 BPM'; // moderate pacing default
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



