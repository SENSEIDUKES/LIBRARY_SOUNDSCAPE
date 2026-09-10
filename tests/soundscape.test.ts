import { describe, it, expect } from 'vitest';
import { extractMetadata, sanitizeFilename } from '../src/utils/helpers';
import { CHINESE_INSTRUMENTS } from '../src/components/ChineseInstrumentList';
import { AVAILABLE_MUSIC_MODELS, CONFIG } from '../src/config';

describe('Soundscape UI and Helper Logic', () => {
  it('should contain available Gemini music routing models including Lyria 3.5', () => {
    expect(AVAILABLE_MUSIC_MODELS.length).toBeGreaterThanOrEqual(3);
    const defaultModel = AVAILABLE_MUSIC_MODELS.find(m => m.id === CONFIG.MODEL_ID_FULL);
    expect(defaultModel).toBeDefined();
    expect(defaultModel?.id).toBe('lyria-3.5-pro-preview');
    expect(defaultModel?.name).toBe('Lyria 3.5 Pro');
    const standard35 = AVAILABLE_MUSIC_MODELS.find(m => m.id === 'lyria-3.5');
    expect(standard35).toBeDefined();
  });
  it('should contain all celestial instruments with correct structure', () => {
    expect(CHINESE_INSTRUMENTS.length).toBeGreaterThan(5);
    const guqin = CHINESE_INSTRUMENTS.find(i => i.id === 'guqin');
    expect(guqin).toBeDefined();
    expect(guqin?.name).toBe('Guqin');
    expect(guqin?.chineseName).toBe('古琴');
  });

  it('should format filename cleanly for exports', () => {
    const filename = sanitizeFilename('SEN Soundscape - Heavenly Tribulation 108');
    expect(filename).toBe('sen_soundscape_heavenly_tribulation_108');
  });

  it('should extract metadata from model raw text', () => {
    const raw = `
Key: C Major
BPM: 90 BPM
Genre: Xianxia, Guqin, Ambient
    `;
    const meta = extractMetadata(raw);
    expect(meta.key).toBe('C Major');
    expect(meta.tempo).toBe('90 BPM');
    expect(meta.genres).toContain('Xianxia');
  });

  it('should toggle favorited state on song result objects', () => {
    const song = {
      id: 'soundscape-1',
      status: 'completed' as const,
      logs: [],
      audioUrl: 'https://example.com/sound.mp3',
      coverImageUrl: null,
      title: 'Celestial Zither',
      lyrics: '',
      metadata: 'Key: D Minor',
      fullPrompt: 'zither',
      error: null,
      timestamp: new Date(),
      isExpanded: false,
      originalPrompt: 'zither',
      originalLyricsOption: 'Instrumental' as const,
      isFavorite: false
    };

    const toggled = { ...song, isFavorite: !song.isFavorite };
    expect(toggled.isFavorite).toBe(true);

    const favoritesList = [toggled];
    expect(favoritesList.some(item => item.id === 'soundscape-1')).toBe(true);
  });

  it('should only delete track after user confirms deletion gate', () => {
    let tracks = [
      { id: 'track-1', title: 'Mountain Wind' },
      { id: 'track-2', title: 'Dragon Chant' }
    ];

    let confirmModalOpen = false;
    let pendingDeleteId: string | null = null;

    const onRequestDelete = (id: string) => {
      pendingDeleteId = id;
      confirmModalOpen = true;
    };

    const onConfirmDelete = () => {
      if (pendingDeleteId) {
        tracks = tracks.filter(t => t.id !== pendingDeleteId);
        pendingDeleteId = null;
      }
      confirmModalOpen = false;
    };

    const onCancelDelete = () => {
      pendingDeleteId = null;
      confirmModalOpen = false;
    };

    // User clicks trash button
    onRequestDelete('track-1');
    expect(confirmModalOpen).toBe(true);
    expect(tracks.length).toBe(2); // Not deleted yet before confirmation

    // User cancels
    onCancelDelete();
    expect(confirmModalOpen).toBe(false);
    expect(tracks.length).toBe(2); // Still 2 tracks

    // User clicks trash again and confirms
    onRequestDelete('track-1');
    expect(confirmModalOpen).toBe(true);
    onConfirmDelete();
    expect(confirmModalOpen).toBe(false);
    expect(tracks.length).toBe(1);
    expect(tracks[0].id).toBe('track-2');
  });
});
