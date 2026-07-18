import { describe, it, expect } from 'vitest';
import {
  getRandomItem,
  sanitizeFilename,
  toPascalCase,
  getAutoExportName,
  extractMetadata
} from '../src/utils/helpers';

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
  it('should use fallback mood and scene if not in config', () => {
    const result = getAutoExportName('epic adventure in high mountain', 'Ancient Melody');
    expect(result).toContain('AncientMelody_Adventure_HighMountain_');
  });

  it('should parse intensity from prompt', () => {
    const result = getAutoExportName('intense fight with heavy scale', 'Showdown');
    expect(result).toContain('Showdown_Fighting_EtherealRealm_Intense_');
  });

  it('should use explicit config when provided', () => {
    const result = getAutoExportName(null, 'Custom', {
      mood: 'Sorrowful',
      sceneAtmosphere: 'ancient temple setting',
      intensity: 0.95
    });
    expect(result).toContain('Custom_Sorrowful_AncientTemple_Nightmare_');
  });

  it('should handle empty parameters gracefully', () => {
    const result = getAutoExportName(null, null);
    expect(result).toContain('Atmospheric_EtherealRealm_Moderate_');
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

  it('should use fallback key and tempo when parsing fails', () => {
    const result = extractMetadata('Some random description text without key and bpm', {
      mood: 'sad',
      pacing: 'frenzied'
    });
    expect(result.key).toBe('D Minor');
    expect(result.tempo).toBe('145 BPM');
    expect(result.genres).toContain('Soundscape');
  });

  it('should handle empty parameters gracefully', () => {
    const result = extractMetadata('');
    expect(result.key).toBe('G Minor');
    expect(result.tempo).toBe('90 BPM');
    expect(result.genres).toEqual(['Soundscape']);
  });
});
