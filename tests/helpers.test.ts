import { describe, it, expect, vi } from 'vitest';
import {
  getRandomItem,
  sanitizeFilename,
  toPascalCase,
  getAutoExportName,
  extractMetadata,
  formatShareText,
  copyToClipboard
} from '../src/utils/helpers';
import { generateRandomTitle, rerollTitle } from '../src/utils/titleUtils';
import { SongResult } from '../types';

describe('getRandomItem', () => {
  it('should return a random item from the array', () => {
    const items = ['apple', 'banana', 'cherry'];
    const result = getRandomItem(items);
    expect(items).toContain(result);
  });
});

describe('sanitizeFilename', () => {
  it('should lower case and trim strings', () => {
    expect(sanitizeFilename('  My Cool Song!  ')).toBe('my_cool_song');
  });

  it('should handle special characters', () => {
    expect(sanitizeFilename('Heavenly Tribulation - Thunder Drum')).toBe('heavenly_tribulation_thunder_drum');
  });

  it('should clean multiple separators and trailing spaces', () => {
    expect(sanitizeFilename('__test---file__')).toBe('test_file');
  });
});

describe('toPascalCase', () => {
  it('should convert space-separated words to PascalCase', () => {
    expect(toPascalCase('bamboo forest setting')).toBe('BambooForestSetting');
  });

  it('should handle special characters and keep alphanumeric', () => {
    expect(toPascalCase('mystical_quest!')).toBe('MysticalQuest');
  });
});

describe('getAutoExportName', () => {
  it('should generate short title-based export name when title exists', () => {
    const result = getAutoExportName('epic adventure in high mountain', 'Ancient Melody');
    expect(result).toMatch(/^AncientMelody_[A-Z0-9]{3}$/);
    expect(result.length).toBeLessThan(25);
  });

  it('should truncate excessively long titles for export name', () => {
    const result = getAutoExportName('prompt', 'Very Super Long Extremely Atmospheric Heavenly Soundscape Title That Never Ends');
    expect(result.length).toBeLessThan(30);
  });

  it('should use explicit mood and scene fallback when title is missing', () => {
    const result = getAutoExportName(null, null, {
      mood: 'Sorrowful',
      sceneAtmosphere: 'ancient temple setting',
    });
    expect(result).toMatch(/^Sorrowful_AncientTem_[A-Z0-9]{3}$/);
    expect(result.length).toBeLessThan(25);
  });

  it('should handle empty parameters gracefully', () => {
    const result = getAutoExportName(null, null);
    expect(result).toMatch(/^Atmospheri_EtherealRe_[A-Z0-9]{3}$/);
  });
});

describe('generateRandomTitle & rerollTitle', () => {
  it('should generate short randomized titles for various cultures', () => {
    const title1 = generateRandomTitle({ culture: 'Chinese', mood: 'Tribulation' });
    const title2 = generateRandomTitle({ culture: 'Japanese', mood: 'Duel' });
    expect(title1).toBeTruthy();
    expect(title2).toBeTruthy();
    expect(title1.split(' ').length).toBeLessThanOrEqual(4);
  });

  it('should reroll a title to produce a new title', () => {
    const initialTitle = 'Celestial Lotus';
    const newTitle = rerollTitle(initialTitle, { culture: 'Chinese' });
    expect(typeof newTitle).toBe('string');
    expect(newTitle.length).toBeGreaterThan(0);
  });
});

describe('extractMetadata', () => {
  it('should extract correct Key, BPM, and Genres from standard output', () => {
    const rawText = `
Key: D Major
BPM: 120 bpm
Genre: Xianxia, Traditional, Guqin
`;
    const result = extractMetadata(rawText);
    expect(result.key).toBe('D Major');
    expect(result.tempo).toBe('120 bpm');
    expect(result.genres).toEqual(['Xianxia', 'Traditional', 'Guqin']);
  });

  it('should return null key and pacing when explicit Key and BPM are absent', () => {
    const result = extractMetadata('Some random description text without key and bpm', {
      mood: 'sad',
      pacing: 'frenzied pacing'
    });
    expect(result.key).toBeNull();
    expect(result.tempo).toBe('frenzied pacing');
    expect(result.genres).toContain('Soundscape');
  });

  it('should handle empty parameters gracefully without fake key or BPM labels', () => {
    const result = extractMetadata('');
    expect(result.key).toBeNull();
    expect(result.tempo).toBeNull();
    expect(result.genres).toEqual(['Soundscape']);
  });
});

describe('formatShareText', () => {
  const mockResult: SongResult = {
    id: 'test-123',
    status: 'completed',
    logs: [],
    audioUrl: 'https://example.com/audio.mp3',
    coverImageUrl: null,
    title: 'Thunder Dao Tribulation',
    lyrics: '',
    metadata: 'Key: D Minor\nBPM: 130 bpm\nGenre: Xianxia, Guqin',
    fullPrompt: 'epic music',
    error: null,
    timestamp: new Date(),
    isExpanded: false,
    originalPrompt: 'epic music',
    originalLyricsOption: 'Instrumental',
    chapterText: 'The cultivator raised his sword against the flashing lightning clouds.',
    soundscapeConfig: {
      mood: 'Fighting',
      instrument: 'Guqin',
      pacing: 'frenzied',
      mainTexture: 'Intense',
      environmentalTexture: 'Thunder',
      sceneAtmosphere: 'High Mountain',
      emotionalDirection: 'Tense',
      endingDirection: 'Fade',
      vocals: 'None'
    }
  };

  it('should format full metadata and share link correctly', () => {
    const text = formatShareText(mockResult, 'https://app.example.com');
    expect(text).toContain('🎵 SEN Soundscape: Thunder Dao Tribulation');
    expect(text).toContain('🎹 Key: D Minor • Tempo: 130 bpm');
    expect(text).toContain('🏷️ Genres: Xianxia, Guqin');
    expect(text).toContain('✨ Atmosphere: Fighting • Guqin • High Mountain');
    expect(text).toContain('📜 Narrative: "The cultivator raised his sword against the flashing lightning clouds."');
    expect(text).toContain('🔗 Listen: https://app.example.com#soundscape-test-123');
  });

  it('should truncate long narrative chapter text in snippet', () => {
    const longTextResult = {
      ...mockResult,
      chapterText: 'A'.repeat(200)
    };
    const text = formatShareText(longTextResult, 'https://app.example.com');
    expect(text).toContain('📜 Narrative: "' + 'A'.repeat(117) + '..."');
  });
});

describe('copyToClipboard', () => {
  it('should call navigator.clipboard.writeText when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    const success = await copyToClipboard('Hello World');
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('Hello World');
  });
});

