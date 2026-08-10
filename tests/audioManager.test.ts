import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pauseAllOtherAudio, enforceSingleAudioPlayback } from '../src/services/audioManager';

describe('audioManager', () => {
  let originalDocument: any;

  beforeEach(() => {
    originalDocument = (globalThis as any).document;
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
  });

  it('should pause all audio elements except the target element', () => {
    const audio1 = { id: 'audio-1', paused: false, pause: vi.fn() };
    const audio2 = { id: 'audio-2', paused: false, pause: vi.fn() };
    const audio3 = { id: 'audio-3', paused: false, pause: vi.fn() };

    (globalThis as any).document = {
      querySelectorAll: vi.fn().mockReturnValue([audio1, audio2, audio3]),
    };

    pauseAllOtherAudio(audio2 as unknown as HTMLAudioElement);

    expect(audio1.pause).toHaveBeenCalledTimes(1);
    expect(audio2.pause).not.toHaveBeenCalled();
    expect(audio3.pause).toHaveBeenCalledTimes(1);
  });

  it('should pause all audio elements when target is null', () => {
    const audio1 = { id: 'audio-1', paused: false, pause: vi.fn() };
    const audio2 = { id: 'audio-2', paused: false, pause: vi.fn() };

    (globalThis as any).document = {
      querySelectorAll: vi.fn().mockReturnValue([audio1, audio2]),
    };

    pauseAllOtherAudio(null);

    expect(audio1.pause).toHaveBeenCalledTimes(1);
    expect(audio2.pause).toHaveBeenCalledTimes(1);
  });

  it('should enforce single audio playback by target audio ID', () => {
    const audio1 = { id: 'audio-1', paused: false, pause: vi.fn() };
    const audio2 = { id: 'audio-2', paused: false, pause: vi.fn() };
    const audio3 = { id: 'audio-3', paused: false, pause: vi.fn() };

    (globalThis as any).document = {
      querySelectorAll: vi.fn().mockReturnValue([audio1, audio2, audio3]),
    };

    enforceSingleAudioPlayback('audio-3');

    expect(audio1.pause).toHaveBeenCalledTimes(1);
    expect(audio2.pause).toHaveBeenCalledTimes(1);
    expect(audio3.pause).not.toHaveBeenCalled();
  });
});
