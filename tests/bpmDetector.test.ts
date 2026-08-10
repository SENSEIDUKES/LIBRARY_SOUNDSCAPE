import { describe, it, expect } from 'vitest';
import { detectBpmFromAudioBuffer, detectKeyFromAudioBuffer } from '../src/utils/audioUtils';

describe('Real Web Audio BPM & Key Detector', () => {
  it('should detect BPM accurately from a synthesized audio buffer with rhythmic peaks', () => {
    const sampleRate = 44100;
    const durationSeconds = 10;
    const numFrames = sampleRate * durationSeconds;

    // Create a mock AudioBuffer with 120 BPM pulses (interval = 0.5 sec)
    const channelData = new Float32Array(numFrames);
    const bpm = 120;
    const intervalSamples = Math.floor(sampleRate * (60 / bpm));

    for (let frame = 0; frame < numFrames; frame += intervalSamples) {
      // Create a clean beat pulse burst matching window frame length
      for (let j = 0; j < 1024 && (frame + j) < numFrames; j++) {
        channelData[frame + j] = Math.sin(j * 0.05) * 0.9;
      }
    }

    const mockBuffer = {
      sampleRate,
      length: numFrames,
      duration: durationSeconds,
      numberOfChannels: 1,
      getChannelData: () => channelData,
    } as unknown as AudioBuffer;

    const result = detectBpmFromAudioBuffer(mockBuffer);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.bpm).toBeGreaterThanOrEqual(115);
      expect(result.bpm).toBeLessThanOrEqual(125);
      expect(result.confidence).toBeGreaterThan(0);
    }
  });

  it('should detect musical key from synthesized chord harmonics (A Minor chord A4+C5+E5)', () => {
    const sampleRate = 44100;
    const durationSeconds = 5;
    const numFrames = sampleRate * durationSeconds;
    const channelData = new Float32Array(numFrames);

    // Synthesize A Minor triad frequencies: A4 (440Hz), C5 (523.25Hz), E5 (659.25Hz)
    const fA = 440.00;
    const fC = 523.25;
    const fE = 659.25;

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      channelData[i] = (Math.sin(2 * Math.PI * fA * t) + Math.sin(2 * Math.PI * fC * t) + Math.sin(2 * Math.PI * fE * t)) / 3;
    }

    const mockBuffer = {
      sampleRate,
      length: numFrames,
      duration: durationSeconds,
      numberOfChannels: 1,
      getChannelData: () => channelData,
    } as unknown as AudioBuffer;

    const result = detectKeyFromAudioBuffer(mockBuffer);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.key).toContain('A');
      expect(result.confidence).toBeGreaterThan(0);
    }
  });

  it('should return null for silent or low-amplitude audio buffers', () => {
    const sampleRate = 44100;
    const channelData = new Float32Array(sampleRate * 5); // 5 sec silence

    const silentBuffer = {
      sampleRate,
      length: channelData.length,
      duration: 5,
      numberOfChannels: 1,
      getChannelData: () => channelData,
    } as unknown as AudioBuffer;

    expect(detectBpmFromAudioBuffer(silentBuffer)).toBeNull();
    expect(detectKeyFromAudioBuffer(silentBuffer)).toBeNull();
  });
});
