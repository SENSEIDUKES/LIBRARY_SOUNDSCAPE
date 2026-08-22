import { describe, it, expect, vi } from 'vitest';
import { formatAudioTime, seekAudio } from '../src/utils/audioUtils';

describe('formatAudioTime', () => {
  it('formats zero and small numbers correctly', () => {
    expect(formatAudioTime(0)).toBe('0:00');
    expect(formatAudioTime(5)).toBe('0:05');
    expect(formatAudioTime(9.8)).toBe('0:09');
  });

  it('formats standard minute and seconds durations correctly', () => {
    expect(formatAudioTime(60)).toBe('1:00');
    expect(formatAudioTime(65)).toBe('1:05');
    expect(formatAudioTime(125)).toBe('2:05');
    expect(formatAudioTime(215.7)).toBe('3:35');
  });

  it('formats long durations correctly', () => {
    expect(formatAudioTime(3605)).toBe('60:05');
  });

  it('handles negative, NaN, and invalid inputs gracefully', () => {
    expect(formatAudioTime(-10)).toBe('0:00');
    expect(formatAudioTime(NaN)).toBe('0:00');
    expect(formatAudioTime(Infinity)).toBe('0:00');
    expect(formatAudioTime(null as any)).toBe('0:00');
    expect(formatAudioTime(undefined as any)).toBe('0:00');
  });
});

describe('seekAudio', () => {
  it('seeks to target absolute time within [0, duration]', () => {
    const audio = {
      currentTime: 10,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const result = seekAudio(audio, 45);
    expect(audio.currentTime).toBe(45);
    expect(result).toBe(45);
  });

  it('clamps absolute seek to 0 if negative', () => {
    const audio = {
      currentTime: 10,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const result = seekAudio(audio, -5);
    expect(audio.currentTime).toBe(0);
    expect(result).toBe(0);
  });

  it('clamps absolute seek to duration if exceeding duration', () => {
    const audio = {
      currentTime: 10,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const result = seekAudio(audio, 150);
    expect(audio.currentTime).toBe(100);
    expect(result).toBe(100);
  });

  it('seeks by positive delta offset', () => {
    const audio = {
      currentTime: 20,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const result = seekAudio(audio, 5, true);
    expect(audio.currentTime).toBe(25);
    expect(result).toBe(25);
  });

  it('seeks by negative delta offset and clamps at 0', () => {
    const audio = {
      currentTime: 3,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const result = seekAudio(audio, -5, true);
    expect(audio.currentTime).toBe(0);
    expect(result).toBe(0);
  });

  it('handles null audio element safely without throwing', () => {
    expect(() => seekAudio(null, 10)).not.toThrow();
    expect(seekAudio(null, 10)).toBe(0);
  });
});
