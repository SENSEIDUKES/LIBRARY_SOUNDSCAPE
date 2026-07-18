import { describe, it, expect } from 'vitest';
import { cleanLyricsForDisplay, parseTimedLyrics } from '../src/utils/lyricsUtils';

describe('cleanLyricsForDisplay', () => {
  it('should clean timestamp markers and sections', () => {
    const rawLyrics = `
[[Verse 1]]
[00:15] In the misty bamboo woods
[00:20] I hear the sound of the guqin
[00:25 - Instrumental Solo]
`;
    const cleaned = cleanLyricsForDisplay(rawLyrics);
    expect(cleaned).toBe('In the misty bamboo woods\nI hear the sound of the guqin');
  });

  it('should handle bracketed tags and trailing spaces', () => {
    const rawLyrics = `[Verse 1] [0.0:] Welcome to the arena\n[Chorus] [15.5] Feel the fire`;
    const cleaned = cleanLyricsForDisplay(rawLyrics);
    expect(cleaned).toBe('Welcome to the arena\nFeel the fire');
  });

  it('should return empty string for empty input', () => {
    expect(cleanLyricsForDisplay('')).toBe('');
    expect(cleanLyricsForDisplay(null as any)).toBe('');
  });
});

describe('parseTimedLyrics', () => {
  it('should parse [m:ss] format correctly', () => {
    const rawLyrics = `
[01:05] Slaying the celestial beast
[01:10] Ascending to the heavens
`;
    const parsed = parseTimedLyrics(rawLyrics);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ time: 65, text: 'Slaying the celestial beast' });
    expect(parsed[1]).toEqual({ time: 70, text: 'Ascending to the heavens' });
  });

  it('should parse [ss.ss] format correctly', () => {
    const rawLyrics = `
[15.50] Swords clash in the arena
[22.1] Thunder echoes
`;
    const parsed = parseTimedLyrics(rawLyrics);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ time: 15.5, text: 'Swords clash in the arena' });
    expect(parsed[1]).toEqual({ time: 22.1, text: 'Thunder echoes' });
  });

  it('should parse [:] format as a delta from previous timestamp', () => {
    const rawLyrics = `
[10.0] First line
[:] Next line after 2s
`;
    const parsed = parseTimedLyrics(rawLyrics);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ time: 10.0, text: 'First line' });
    expect(parsed[1]).toEqual({ time: 12.0, text: 'Next line after 2s' });
  });

  it('should append lines without timestamps to the current block', () => {
    const rawLyrics = `
[00:10] Line one
Line one continued
[00:15] Line two
`;
    const parsed = parseTimedLyrics(rawLyrics);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ time: 10, text: 'Line one\nLine one continued' });
    expect(parsed[1]).toEqual({ time: 15, text: 'Line two' });
  });

  it('should skip section markers like [[A0]]', () => {
    const rawLyrics = `
[[A0]]
[00:05] Hello world
`;
    const parsed = parseTimedLyrics(rawLyrics);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual({ time: 5, text: 'Hello world' });
  });

  it('should return empty list for empty/null input', () => {
    expect(parseTimedLyrics('')).toEqual([]);
    expect(parseTimedLyrics(null as any)).toEqual([]);
  });
});
