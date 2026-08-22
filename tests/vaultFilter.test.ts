import { describe, it, expect } from 'vitest';
import { filterSoundscapes, extractVaultQuickTags } from '../src/utils/vaultFilter';
import { SongResult } from '../types';

const sampleSongs: SongResult[] = [
  {
    id: 'song-1',
    status: 'completed',
    logs: [],
    audioUrl: 'https://example.com/erhu.mp3',
    coverImageUrl: null,
    title: 'Heavenly Tribulation Thunder',
    lyrics: '',
    metadata: 'Key: D Minor\nBPM: 90 BPM\nGenre: Xianxia, Erhu, Storm',
    fullPrompt: 'An intensely atmospheric Chinese soundscape with thunder and Erhu.',
    error: null,
    timestamp: new Date(),
    isExpanded: false,
    originalPrompt: 'Erhu thunder',
    originalLyricsOption: 'Instrumental',
    soundscapeConfig: {
      culture: 'Chinese',
      mood: 'intense',
      instrument: 'Erhu',
      pacing: 'fast pacing',
      mainTexture: 'bowed melodies',
      environmentalTexture: 'thunder rain',
      sceneAtmosphere: 'mountain peak',
      emotionalDirection: 'heroic',
      endingDirection: 'abrupt cut',
      vocals: 'none',
      intensity: 0.8,
    },
  },
  {
    id: 'song-2',
    status: 'completed',
    logs: [],
    audioUrl: 'https://example.com/guqin.mp3',
    coverImageUrl: null,
    title: 'Bamboo Forest Serenity',
    lyrics: '',
    metadata: 'Key: G Major\nBPM: 60 BPM\nGenre: Ambient, Guqin, Zen',
    fullPrompt: 'Calm and peaceful Guqin meditation in bamboo grove.',
    error: null,
    timestamp: new Date(),
    isExpanded: false,
    originalPrompt: 'Guqin zen',
    originalLyricsOption: 'Instrumental',
    soundscapeConfig: {
      culture: 'Chinese',
      mood: 'serene',
      instrument: 'Guqin',
      pacing: 'slow pacing',
      mainTexture: 'plucked strings',
      environmentalTexture: 'rustling leaves',
      sceneAtmosphere: 'bamboo grove',
      emotionalDirection: 'peaceful',
      endingDirection: 'fade out',
      vocals: 'none',
      intensity: 0.3,
    },
  },
  {
    id: 'song-3',
    status: 'completed',
    logs: [],
    audioUrl: 'https://example.com/koto.mp3',
    coverImageUrl: null,
    title: 'Cherry Blossom Rain',
    lyrics: '',
    metadata: 'Key: A Minor\nBPM: 75 BPM\nGenre: Traditional, Japanese, Koto',
    fullPrompt: 'Japanese spring soundscape with Koto and gentle raindrops.',
    error: null,
    timestamp: new Date(),
    isExpanded: false,
    originalPrompt: 'Koto blossom',
    originalLyricsOption: 'Instrumental',
    soundscapeConfig: {
      culture: 'Japanese',
      mood: 'melancholic',
      instrument: 'Koto',
      pacing: 'medium pacing',
      mainTexture: 'flowing arpeggios',
      environmentalTexture: 'rain drops',
      sceneAtmosphere: 'temple courtyard',
      emotionalDirection: 'nostalgic',
      endingDirection: 'soft resonance',
      vocals: 'none',
      intensity: 0.5,
    },
  },
  {
    id: 'song-4',
    status: 'completed',
    logs: [],
    audioUrl: 'https://example.com/gayageum.mp3',
    coverImageUrl: null,
    title: 'Morning Mist at Hanok',
    lyrics: '',
    metadata: 'Key: C Major\nBPM: 65 BPM\nGenre: Korean, Folk, Gayageum',
    fullPrompt: 'Traditional Korean palace morning with resonant Gayageum.',
    error: null,
    timestamp: new Date(),
    isExpanded: false,
    originalPrompt: 'Gayageum palace',
    originalLyricsOption: 'Instrumental',
    soundscapeConfig: {
      culture: 'Korean',
      mood: 'tranquil',
      instrument: 'Gayageum',
      pacing: 'slow pacing',
      mainTexture: 'vibrant vibrato',
      environmentalTexture: 'morning birds',
      sceneAtmosphere: 'hanok courtyard',
      emotionalDirection: 'reflective',
      endingDirection: 'lingering harmonic',
      vocals: 'none',
      intensity: 0.4,
    },
  },
];

describe('Soundscape Vault Quick Search and Filtering', () => {
  it('returns all tracks when search and filters are empty', () => {
    const results = filterSoundscapes(sampleSongs, {});
    expect(results.length).toBe(4);
  });

  it('filters tracks by mood keyword', () => {
    const results = filterSoundscapes(sampleSongs, { searchQuery: 'serene' });
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Bamboo Forest Serenity');
  });

  it('filters tracks by instrument name', () => {
    const erhuResults = filterSoundscapes(sampleSongs, { searchQuery: 'Erhu' });
    expect(erhuResults.length).toBe(1);
    expect(erhuResults[0].id).toBe('song-1');

    const kotoResults = filterSoundscapes(sampleSongs, { searchQuery: 'koto' });
    expect(kotoResults.length).toBe(1);
    expect(kotoResults[0].id).toBe('song-3');
  });

  it('filters tracks by culture selection', () => {
    const chineseResults = filterSoundscapes(sampleSongs, { selectedCulture: 'Chinese' });
    expect(chineseResults.length).toBe(2);

    const japaneseResults = filterSoundscapes(sampleSongs, { selectedCulture: 'Japanese' });
    expect(japaneseResults.length).toBe(1);
    expect(japaneseResults[0].title).toBe('Cherry Blossom Rain');

    const koreanResults = filterSoundscapes(sampleSongs, { selectedCulture: 'Korean' });
    expect(koreanResults.length).toBe(1);
    expect(koreanResults[0].title).toBe('Morning Mist at Hanok');
  });

  it('filters tracks by multi-token keywords (e.g. "thunder intense")', () => {
    const results = filterSoundscapes(sampleSongs, { searchQuery: 'thunder intense' });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('song-1');
  });

  it('filters tracks by extracted genre or key tags', () => {
    const zenResults = filterSoundscapes(sampleSongs, { searchQuery: 'zen' });
    expect(zenResults.length).toBe(1);
    expect(zenResults[0].id).toBe('song-2');

    const dMinorResults = filterSoundscapes(sampleSongs, { searchQuery: 'D Minor' });
    expect(dMinorResults.length).toBe(1);
    expect(dMinorResults[0].id).toBe('song-1');
  });

  it('returns empty array when no tracks match query', () => {
    const results = filterSoundscapes(sampleSongs, { searchQuery: 'nonexistent-synth-wave-xyz' });
    expect(results.length).toBe(0);
  });

  it('extracts unique quick tag chips from available tracks', () => {
    const { instruments, moods } = extractVaultQuickTags(sampleSongs);
    expect(instruments).toContain('Erhu');
    expect(instruments).toContain('Guqin');
    expect(instruments).toContain('Koto');
    expect(instruments).toContain('Gayageum');
    expect(moods).toContain('intense');
    expect(moods).toContain('serene');
  });
});
