import { describe, it, expect } from 'vitest';
import { songResultToTrack, exampleSongToTrack } from '../src/utils/seihouseAudioAdapter';
import { SongResult, ExampleSong } from '../types';

describe('@seihouse/audio-player Adapter & Integration', () => {
  it('converts SongResult to @seihouse/audio-player Track correctly', () => {
    const result: SongResult = {
      id: 'sr-101',
      title: 'Celestial Guzheng Waves',
      audioUrl: 'https://example.com/audio.mp3',
      coverImageUrl: 'https://example.com/cover.jpg',
      isExpanded: false,
      status: 'completed',
      logs: [],
      lyrics: '',
      metadata: '',
      fullPrompt: 'Chinese Guzheng soundscape',
      error: null,
      timestamp: new Date(),
      originalPrompt: 'Chinese Guzheng',
      originalLyricsOption: 'Instrumental',
      soundscapeConfig: {
        culture: 'Chinese',
        instrument: 'Guzheng',
        mood: 'Tranquil',
        pacing: 'Slow',
        mainTexture: 'Resonant',
        environmentalTexture: 'Breeze',
        sceneAtmosphere: 'Mountain Temple',
        emotionalDirection: 'Peaceful',
        endingDirection: 'Fade',
        vocals: 'Instrumental',
        intensity: 5,
      },
    };

    const track = songResultToTrack(result);

    expect(track.id).toBe('sr-101');
    expect(track.title).toBe('Celestial Guzheng Waves');
    expect(track.artist).toContain('Guzheng');
    expect(track.audioFile).toBe('https://example.com/audio.mp3');
    expect(track.artwork).toBe('https://example.com/cover.jpg');
    expect(track.albumTitle).toContain('Chinese Soundscape');
    expect(track.vaultCategory).toBe('master');
  });

  it('handles base64 audio and missing title in SongResult gracefully', () => {
    const result: SongResult = {
      id: 'sr-102',
      audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      audioUrl: null,
      coverImageUrl: null,
      title: null,
      lyrics: '',
      metadata: '',
      fullPrompt: null,
      error: null,
      timestamp: new Date(),
      originalPrompt: '',
      originalLyricsOption: 'Instrumental',
      logs: [],
      isExpanded: false,
      status: 'completed',
    };

    const track = songResultToTrack(result);

    expect(track.id).toBe('sr-102');
    expect(track.title).toBe('Celestial Soundscape');
    expect(track.audioFile).toContain('data:audio/wav;base64,');
    expect(track.artwork).toBeUndefined();
  });

  it('converts ExampleSong to Track with custom audioUrl', () => {
    const example: ExampleSong = {
      id: 'ex-1',
      title: 'Thunder Sword Resonance',
      artist: 'Grandmaster Yan',
      coverUrl: 'https://example.com/sword.jpg',
      prompt: 'Epic sword resonance with traditional flute',
      duration: '0:30',
      tags: ['Dizi', 'Tribulation', 'Heroic'],
    };

    const track = exampleSongToTrack(example, 'https://example.com/synth.wav');

    expect(track.id).toBe('ex-1');
    expect(track.title).toBe('Thunder Sword Resonance');
    expect(track.artist).toBe('Grandmaster Yan');
    expect(track.audioFile).toBe('https://example.com/synth.wav');
    expect(track.artwork).toBe('https://example.com/sword.jpg');
    expect(track.albumTitle).toBe('Dizi • Tribulation • Heroic');
    expect(track.vaultCategory).toBe('demo');
  });
});
