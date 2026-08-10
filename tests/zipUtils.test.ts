import { describe, it, expect, vi } from 'vitest';
import { fetchAudioBlob, createAndDownloadSoundscapesZip } from '../src/utils/zipUtils';
import { SongResult } from '../types';

describe('zipUtils', () => {
  const dummySong: SongResult = {
    id: 'fav-1',
    status: 'completed',
    logs: [],
    audioUrl: '',
    audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', // valid small base64 wav
    coverImageUrl: null,
    title: 'Jade Dragon Meditation',
    lyrics: 'Ode to the mountain breeze',
    metadata: 'Key: C Major\nBPM: 80 bpm',
    fullPrompt: 'calm bamboo flute and mountain stream',
    error: null,
    timestamp: new Date(),
    isExpanded: false,
    originalPrompt: 'calm bamboo flute',
    originalLyricsOption: 'Custom'
  };

  it('fetchAudioBlob converts base64 audio string to Uint8Array or Blob', async () => {
    const data = await fetchAudioBlob(dummySong);
    expect(data).not.toBeNull();
    const len = data instanceof Uint8Array ? data.length : data?.size;
    expect(len).toBeGreaterThan(0);
  });

  it('createAndDownloadSoundscapesZip returns false when no songs selected', async () => {
    const result = await createAndDownloadSoundscapesZip([]);
    expect(result).toBe(false);
  });

  it('createAndDownloadSoundscapesZip builds ZIP and triggers callback', async () => {
    if (typeof global.URL.createObjectURL !== 'function') {
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    }

    const progressFn = vi.fn();
    const success = await createAndDownloadSoundscapesZip([dummySong], 'TestFavorites.zip', progressFn);

    expect(success).toBe(true);
    expect(progressFn).toHaveBeenCalledWith({
      current: 1,
      total: 1,
      currentSongTitle: 'Jade Dragon Meditation'
    });
  });
});
