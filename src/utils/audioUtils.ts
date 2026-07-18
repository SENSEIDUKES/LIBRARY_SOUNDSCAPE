/**
 * Audio Utilities
 *
 * This module contains helper functions for processing and manipulating audio data.
 *
 * Use Cases:
 * - Converting base64 encoded audio strings received from APIs into playable Blob URLs.
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
