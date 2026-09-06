/**
 * Audio Utilities
 *
 * This module contains helper functions for processing and manipulating audio data,
 * as well as generating synthetic soundscapes via Web Audio API.
 */
import { logFunctionCall } from './logger';

/**
 * Creates a playable object URL from a base64 encoded audio string.
 * @param base64 The base64 encoded audio data.
 * @param mimeType The MIME type of the audio (e.g., 'audio/wav').
 * @returns A string representing the object URL, or an empty string if decoding fails.
 */
export const createAudioUrlFromBase64 = (base64: string, mimeType: string): string => {
  logFunctionCall('createAudioUrlFromBase64', { base64Length: base64.length, mimeType });
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Failed to decode audio base64:", e);
    return "";
  }
};

/**
 * Encodes an AudioBuffer into a PCM 16-bit WAV Blob.
 */
export const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

/**
 * Converts a Blob into a base64 encoded string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates a procedural ambient audio buffer using OfflineAudioContext.
 * Used as an instant acoustic synthesizer fallback when external AI model quotas or permissions are reached.
 */
export const createSyntheticSoundscape = async (
  instrumentName: string = 'Guzheng',
  mood: string = 'Tranquil',
  durationSeconds: number = 30
): Promise<{ audioUrl: string; base64: string }> => {
  logFunctionCall('createSyntheticSoundscape', { instrumentName, mood, durationSeconds });
  const sampleRate = 44100;
  const numFrames = sampleRate * durationSeconds;
  
  const OfflineCtx = (typeof window !== 'undefined' && (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)) || null;

  if (!OfflineCtx) {
    const silentWav = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    return { audioUrl: createAudioUrlFromBase64(silentWav, 'audio/wav'), base64: silentWav };
  }

  try {
    const ctx = new OfflineCtx(2, numFrames, sampleRate);

    // Pentatonic scale frequencies in Hz (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

    // Ambient Drone
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(130.81, 0); // C3
    droneGain.gain.setValueAtTime(0.08, 0);
    droneGain.gain.exponentialRampToValueAtTime(0.001, durationSeconds);
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start(0);

    // Harmonic pentatonic arpeggio notes
    const noteCount = Math.floor(durationSeconds * 2.5);
    const lowerInst = instrumentName.toLowerCase();

    for (let i = 0; i < noteCount; i++) {
      const startTime = (i * (durationSeconds / noteCount)) + (Math.random() * 0.25);
      if (startTime >= durationSeconds - 0.4) break;

      const freq = scale[Math.floor(Math.random() * scale.length)];
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      if (lowerInst.includes('erhu') || lowerInst.includes('violin') || lowerInst.includes('haegeum') || lowerInst.includes('kokyu')) {
        noteOsc.type = 'sawtooth';
      } else if (lowerInst.includes('dizi') || lowerInst.includes('shakuhachi') || lowerInst.includes('flute') || lowerInst.includes('xiao')) {
        noteOsc.type = 'sine';
      } else {
        noteOsc.type = 'triangle';
      }

      noteOsc.frequency.setValueAtTime(freq, startTime);
      const noteLength = 0.8 + Math.random() * 1.2;

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, Math.min(durationSeconds, startTime + noteLength));

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(startTime);
      noteOsc.stop(Math.min(durationSeconds, startTime + noteLength));
    }

    const renderedBuffer = await ctx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);
    const base64 = await blobToBase64(wavBlob);
    const audioUrl = URL.createObjectURL(wavBlob);

    return { audioUrl, base64 };
  } catch (err) {
    console.error('Failed to render synthetic soundscape:', err);
    const silentWav = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    return { audioUrl: createAudioUrlFromBase64(silentWav, 'audio/wav'), base64: silentWav };
  }
};

/**
 * Analyzes an AudioBuffer to detect real tempo (BPM) using Web Audio peak onset detection and interval histograms.
 */
export const detectBpmFromAudioBuffer = (buffer: AudioBuffer): { bpm: number; confidence: number } | null => {
  logFunctionCall('detectBpmFromAudioBuffer', { length: buffer.length, sampleRate: buffer.sampleRate });
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  if (!channelData || channelData.length === 0) return null;

  // Windowing for energy envelope calculation
  const windowSize = 1024;
  const hopSize = 512;
  const numWindows = Math.floor((channelData.length - windowSize) / hopSize);
  if (numWindows < 10) return null;

  const energyEnvelope: number[] = new Array(numWindows);
  for (let i = 0; i < numWindows; i++) {
    const start = i * hopSize;
    let sumSq = 0;
    for (let j = 0; j < windowSize; j++) {
      const val = channelData[start + j];
      sumSq += val * val;
    }
    energyEnvelope[i] = Math.sqrt(sumSq / windowSize);
  }

  // Calculate average energy
  const avgEnergy = energyEnvelope.reduce((acc, v) => acc + v, 0) / numWindows;
  if (avgEnergy < 0.0005) return null; // Silence threshold

  // Peak onset detection in energy envelope
  const peakIndices: number[] = [];
  const threshold = avgEnergy * 1.2;
  const minDistanceFrames = Math.floor((sampleRate / hopSize) * (60 / 220)); // Max 220 BPM

  for (let i = 1; i < numWindows - 1; i++) {
    const val = energyEnvelope[i];
    if (val > threshold && val > energyEnvelope[i - 1] && val >= energyEnvelope[i + 1]) {
      if (peakIndices.length === 0 || (i - peakIndices[peakIndices.length - 1]) >= minDistanceFrames) {
        peakIndices.push(i);
      }
    }
  }

  if (peakIndices.length < 3) return null;

  // Compute time intervals between peaks in seconds
  const intervalCounts: Record<number, number> = {};
  const frameToSec = hopSize / sampleRate;

  for (let i = 0; i < peakIndices.length; i++) {
    for (let j = i + 1; j < Math.min(i + 6, peakIndices.length); j++) {
      const intervalSec = (peakIndices[j] - peakIndices[i]) * frameToSec;
      if (intervalSec <= 0) continue;

      let candidateBpm = 60 / intervalSec;
      // Normalize candidate BPM to standard musical range 60-180 BPM
      while (candidateBpm < 60) candidateBpm *= 2;
      while (candidateBpm > 180) candidateBpm /= 2;

      // Adjacent peaks (j = i + 1) carry the strongest fundamental beat weight
      const weight = j === i + 1 ? 3 : j === i + 2 ? 1.5 : 0.5;

      const roundedBpm = Math.round(candidateBpm);
      if (roundedBpm >= 60 && roundedBpm <= 180) {
        intervalCounts[roundedBpm] = (intervalCounts[roundedBpm] || 0) + weight;
      }
    }
  }

  let maxCount = 0;
  let bestBpm = 0;
  let totalCandidates = 0;

  for (const [bpmStr, count] of Object.entries(intervalCounts)) {
    const bpm = Number(bpmStr);
    totalCandidates += count;
    if (count > maxCount) {
      maxCount = count;
      bestBpm = bpm;
    }
  }

  if (bestBpm === 0 || maxCount < 2) return null;

  // Smooth out with neighboring BPM counts
  let weightedSum = 0;
  let weightedWeight = 0;
  for (let b = bestBpm - 2; b <= bestBpm + 2; b++) {
    if (intervalCounts[b]) {
      weightedSum += b * intervalCounts[b];
      weightedWeight += intervalCounts[b];
    }
  }

  const finalBpm = weightedWeight > 0 ? Math.round(weightedSum / weightedWeight) : bestBpm;
  const confidence = Math.min(100, Math.round((maxCount / (totalCandidates || 1)) * 250));

  return { bpm: finalBpm, confidence };
};

/**
 * Convenience function to fetch, decode, and detect real BPM from an audio URL, Blob, or base64 data.
 */
export const detectBpmFromAudio = async (
  audioSource: string | Blob | ArrayBuffer
): Promise<{ bpm: number; confidence: number } | null> => {
  logFunctionCall('detectBpmFromAudio');
  try {
    const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) || null;
    if (!AudioCtx) return null;

    let arrayBuffer: ArrayBuffer;
    if (audioSource instanceof ArrayBuffer) {
      arrayBuffer = audioSource;
    } else if (audioSource instanceof Blob) {
      arrayBuffer = await audioSource.arrayBuffer();
    } else if (typeof audioSource === 'string') {
      if (audioSource.startsWith('data:audio') || audioSource.startsWith('blob:') || audioSource.startsWith('http')) {
        const response = await fetch(audioSource);
        arrayBuffer = await response.arrayBuffer();
      } else {
        // Base64 string without data header
        const binaryString = atob(audioSource);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      }
    } else {
      return null;
    }

    const tempCtx = new AudioCtx();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    const result = detectBpmFromAudioBuffer(audioBuffer);
    tempCtx.close().catch(() => {});
    return result;
  } catch (err) {
    console.warn("Failed to detect BPM from audio:", err);
    return null;
  }
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Krumhansl-Schmuckler Key Profile vectors
const KRUMHANSL_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KRUMHANSL_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 2.69, 3.34, 3.17, 3.12];

const pearsonCorrelation = (x: number[], y: number[]): number => {
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  const n = x.length;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (den === 0) return 0;
  return num / den;
};

/**
 * Detects real musical key (tonality) from an AudioBuffer using Chromagram Pitch Class Profiling (PCP)
 * and Pearson correlation with Krumhansl-Schmuckler harmonic key vectors.
 */
export const detectKeyFromAudioBuffer = (buffer: AudioBuffer): { key: string; confidence: number } | null => {
  logFunctionCall('detectKeyFromAudioBuffer', { length: buffer.length, sampleRate: buffer.sampleRate });
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  if (!channelData || channelData.length === 0) return null;

  // 12 pitch classes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  const pcp = new Float64Array(12);

  // We analyze MIDI notes 48 (C3, 130.81Hz) through 83 (B5, 987.77Hz)
  const midiNotes: { midi: number; pitchClass: number; freq: number }[] = [];
  for (let m = 48; m <= 83; m++) {
    midiNotes.push({
      midi: m,
      pitchClass: m % 12,
      freq: 440 * Math.pow(2, (m - 69) / 12),
    });
  }

  const windowSize = 2048;
  const hopSize = 1024;
  const numWindows = Math.floor((channelData.length - windowSize) / hopSize);
  if (numWindows < 5) return null;

  for (let w = 0; w < numWindows; w++) {
    const offset = w * hopSize;
    for (let i = 0; i < midiNotes.length; i++) {
      const note = midiNotes[i];
      const omega = (2 * Math.PI * note.freq) / sampleRate;
      const coeff = 2 * Math.cos(omega);
      let s0 = 0, s1 = 0, s2 = 0;

      for (let j = 0; j < windowSize; j++) {
        const x = channelData[offset + j];
        s0 = x + coeff * s1 - s2;
        s2 = s1;
        s1 = s0;
      }

      const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
      pcp[note.pitchClass] += power;
    }
  }

  let totalEnergy = 0;
  for (let i = 0; i < 12; i++) totalEnergy += pcp[i];
  if (totalEnergy < 1e-6) return null;

  const normalizedPcp = new Array(12);
  for (let i = 0; i < 12; i++) {
    normalizedPcp[i] = pcp[i] / totalEnergy;
  }

  let bestKey = '';
  let maxCorr = -2;

  for (let root = 0; root < 12; root++) {
    // Major profile match
    const majProfile = new Array(12);
    for (let i = 0; i < 12; i++) {
      majProfile[i] = KRUMHANSL_MAJOR[(i - root + 12) % 12];
    }
    const majCorr = pearsonCorrelation(normalizedPcp, majProfile);
    if (majCorr > maxCorr) {
      maxCorr = majCorr;
      bestKey = `${NOTE_NAMES[root]} Major`;
    }

    // Minor profile match
    const minProfile = new Array(12);
    for (let i = 0; i < 12; i++) {
      minProfile[i] = KRUMHANSL_MINOR[(i - root + 12) % 12];
    }
    const minCorr = pearsonCorrelation(normalizedPcp, minProfile);
    if (minCorr > maxCorr) {
      maxCorr = minCorr;
      bestKey = `${NOTE_NAMES[root]} Minor`;
    }
  }

  if (maxCorr <= 0) return null;

  const confidence = Math.min(100, Math.round(Math.max(0, maxCorr) * 100));
  return { key: bestKey, confidence };
};

/**
 * Convenience function to fetch, decode, and detect real musical key from audio source.
 */
export const detectKeyFromAudio = async (
  audioSource: string | Blob | ArrayBuffer
): Promise<{ key: string; confidence: number } | null> => {
  logFunctionCall('detectKeyFromAudio');
  try {
    const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) || null;
    if (!AudioCtx) return null;

    let arrayBuffer: ArrayBuffer;
    if (audioSource instanceof ArrayBuffer) {
      arrayBuffer = audioSource;
    } else if (audioSource instanceof Blob) {
      arrayBuffer = await audioSource.arrayBuffer();
    } else if (typeof audioSource === 'string') {
      if (audioSource.startsWith('data:audio') || audioSource.startsWith('blob:') || audioSource.startsWith('http')) {
        const response = await fetch(audioSource);
        arrayBuffer = await response.arrayBuffer();
      } else {
        const binaryString = atob(audioSource);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      }
    } else {
      return null;
    }

    const tempCtx = new AudioCtx();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    const result = detectKeyFromAudioBuffer(audioBuffer);
    tempCtx.close().catch(() => {});
    return result;
  } catch (err) {
    console.warn("Failed to detect Key from audio:", err);
    return null;
  }
};






