/**
 * Title Utility Engine
 *
 * Provides contextual, randomized, culturally-tuned song title generation
 * to ensure maximum variety and prevent duplicate title outputs.
 */
import { getRandomItem } from './helpers';

export interface TitleGenOptions {
  prompt?: string | null;
  culture?: string;
  mood?: string;
  instrument?: string;
  lyricContext?: string;
}

const CULTURAL_WORD_BANKS: Record<string, { prefixes: string[]; nouns: string[]; suffixes: string[] }> = {
  Chinese: {
    prefixes: [
      'Heavenly', 'Celestial', 'Immortal', 'Jade', 'Crimson', 'Azure', 'Vermilion', 'Ethereal',
      'Thunder', 'Frost', 'Whispering', 'Ascendant', 'Floating', 'Golden', 'Verdant', 'Misty',
      'Infinite', 'Shadow', 'Silent', 'Lotus', 'Brocade', 'Sovereign', 'Abyssal', 'Solen',
      'Spirit', 'Dragon', 'Phoenix', 'Bamboo', 'Mountain', 'Emperor', 'Breeze', 'Serene'
    ],
    nouns: [
      'Tribulation', 'Sword', 'Phoenix', 'Dragon', 'Guzheng', 'Bamboo', 'Lotus', 'Realm',
      'Court', 'Cloud', 'Peak', 'Stream', 'Pass', 'Dynasty', 'Wind', 'Eclipse', 'Echo',
      'Guqin', 'Erhu', 'Pipa', 'Temple', 'Monastery', 'Shrine', 'Altar', 'Will', 'Sect',
      'Aura', 'Chant', 'Wisdom', 'Mirror', 'Tide', 'Flame'
    ],
    suffixes: [
      'Resonance', 'Symphony', 'Prelude', 'Requiem', 'Solitude', 'Meditation', 'Overture',
      'Elegy', 'Fantasia', 'Whispers', 'Harmony', 'Ascension', 'Flow', 'Path', 'Serenity',
      'Echoes', 'Melody', 'Dao', 'Vow', 'Grace', 'Chant', 'Trance'
    ]
  },
  Japanese: {
    prefixes: [
      'Sakura', 'Cherry', 'Crimson', 'Midnight', 'Shadow', 'Ronin', 'Zen', 'Autumn',
      'Silver', 'Frozen', 'Willow', 'Floating', 'Silent', 'Obsidian', 'Scarlet', 'Mystic',
      'Storm', 'Tempest', 'Rising', 'Moonlit', 'Twilight', 'Iron', 'Golden', 'Snow'
    ],
    nouns: [
      'Blossom', 'Katana', 'Shakuhachi', 'Koto', 'Moon', 'Shrine', 'Garden', 'Duel',
      'Breeze', 'Tide', 'Petal', 'Valley', 'Spirit', 'Path', 'Rain', 'Dawn', 'Blade',
      'Castle', 'Wave', 'Shamisen', 'Taiko', 'Honor', 'Bamboo', 'Grove'
    ],
    suffixes: [
      'Echoes', 'Harmony', 'Flow', 'Quietude', 'Overture', 'Symphony', 'Reflection',
      'Solitude', 'Grace', 'Drift', 'Resonance', 'Meditation', 'Shadows', 'Blossoms',
      'Whispers', 'Serenade', 'Rhythm'
    ]
  },
  Korean: {
    prefixes: [
      'Morning', 'Serene', 'Pearl', 'Jade', 'Pine', 'Royal', 'Dawn', 'Whispering',
      'Radiant', 'Heavenly', 'Moonlight', 'Crimson', 'Velvet', 'Golden', 'Emerald',
      'Soaring', 'Tranquil', 'Infinite', 'Soft', 'Pure', 'Crystal'
    ],
    nouns: [
      'Gayageum', 'Daegeum', 'Pavilion', 'Lotus', 'River', 'Palace', 'Breeze', 'Crane',
      'Court', 'Valley', 'Horizon', 'Dream', 'Stream', 'Garden', 'Song', 'Court',
      'Haegeum', 'Wind', 'Hills', 'Peak', 'Dew'
    ],
    suffixes: [
      'Harmony', 'Elegance', 'Cadence', 'Meditation', 'Whispers', 'Legacy', 'Nocturne',
      'Air', 'Interlude', 'Solitude', 'Rhapsody', 'Serenade', 'Resonance', 'Flow'
    ]
  },
  Western: {
    prefixes: [
      'Ancient', 'Eternal', 'Celestial', 'Obsidian', 'Crimson', 'Sovereign', 'Astral',
      'Golden', 'Velvet', 'Forgotten', 'Whisper', 'Majestic', 'Echoing', 'Silent',
      'Starlight', 'Wandering', 'Sylvan', 'Luminous', 'Verdant', 'Gilded'
    ],
    nouns: [
      'Symphony', 'Sanctuary', 'Citadel', 'Kingdom', 'Harbor', 'Ember', 'Nocturne',
      'Lute', 'Cello', 'Tempest', 'Echo', 'Horizon', 'Summit', 'Phantom', 'Cathedral',
      'Requiem', 'Haven', 'Voyage', 'Valor', 'Vale'
    ],
    suffixes: [
      'Rhapsody', 'Overture', 'Requiem', 'Harmony', 'Elegy', 'Voyage', 'Serenade',
      'Fantasia', 'Cadence', 'Anthem', 'Sonata', 'Ballad', 'Nocturne', 'Movement'
    ]
  }
};

const KEYWORD_TITLE_MAP: Array<{ regex: RegExp; words: string[] }> = [
  { regex: /tribulation|thunder|lightning/i, words: ['Thunder', 'Tribulation', 'Lightning', 'Storm'] },
  { regex: /sword|blade|duel|slash/i, words: ['Blade', 'Sword', 'Duel', 'Clash'] },
  { regex: /bamboo|forest|grove/i, words: ['Bamboo', 'Forest', 'Grove', 'Whisper'] },
  { regex: /cave|cavern|abyss|tunnel/i, words: ['Abyss', 'Cavern', 'Shadow', 'Echo'] },
  { regex: /rain|storm|water|river/i, words: ['Rain', 'Stream', 'River', 'Tide'] },
  { regex: /mountain|peak|cliff|sect/i, words: ['Mountain', 'Peak', 'Summit', 'Ridge'] },
  { regex: /temple|shrine|monastery|hall/i, words: ['Temple', 'Shrine', 'Sanctuary', 'Hall'] },
  { regex: /war|battle|fight|combat|army/i, words: ['Battle', 'War', 'Valor', 'Clash'] },
  { regex: /love|romance|embrace|heart/i, words: ['Heart', 'Embrace', 'Passion', 'Beloved'] },
  { regex: /grief|sorrow|tear|loss/i, words: ['Tears', 'Sorrow', 'Solitude', 'Elegy'] },
  { regex: /cherry|sakura|flower|blossom/i, words: ['Blossom', 'Sakura', 'Petal', 'Spring'] }
];

/**
 * Generates a creative, randomized song title based on culture, prompt keywords, and audio characteristics.
 */
export const generateRandomTitle = (options?: TitleGenOptions): string => {
  const culture = options?.culture && CULTURAL_WORD_BANKS[options.culture]
    ? options.culture
    : 'Chinese';
  const bank = CULTURAL_WORD_BANKS[culture] || CULTURAL_WORD_BANKS.Chinese;

  const combinedText = `${options?.prompt || ''} ${options?.lyricContext || ''} ${options?.mood || ''} ${options?.instrument || ''}`.toLowerCase();

  let matchedKeyword: string | null = null;
  for (const rule of KEYWORD_TITLE_MAP) {
    if (rule.regex.test(combinedText)) {
      matchedKeyword = getRandomItem(rule.words);
      break;
    }
  }

  const prefix = getRandomItem(bank.prefixes);
  const noun = matchedKeyword || getRandomItem(bank.nouns);
  const suffix = getRandomItem(bank.suffixes);

  // Randomize pattern structure (2 or 3 words) for natural poetic cadence
  const patternType = Math.floor(Math.random() * 3);

  let title = '';
  if (patternType === 0) {
    title = `${prefix} ${noun}`;
  } else if (patternType === 1) {
    title = `${noun} of ${suffix}`;
  } else {
    title = `${prefix} ${noun} ${suffix}`;
  }

  // Ensure title is short (max 3-4 words)
  const words = title.split(' ').slice(0, 3);
  return words.join(' ');
};

/**
 * Rerolls a title ensuring the newly generated title is different from the current title.
 */
export const rerollTitle = (currentTitle: string | null, options?: TitleGenOptions): string => {
  let attempts = 0;
  let newTitle = generateRandomTitle(options);
  while (newTitle.toLowerCase() === (currentTitle || '').toLowerCase() && attempts < 10) {
    newTitle = generateRandomTitle(options);
    attempts++;
  }
  return newTitle;
};
