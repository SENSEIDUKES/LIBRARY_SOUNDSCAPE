/**
 * Audio Manager Service
 *
 * Enforces single-playback constraint across HTML5 audio elements and Web Audio API synthesisers.
 */

import { logFunctionCall } from '../utils/logger';

/**
 * Pauses all HTML audio elements on the page except the specified target audio element.
 * @param targetAudio Optional audio element that should remain playing.
 */
export const pauseAllOtherAudio = (targetAudio?: HTMLAudioElement | null): void => {
  logFunctionCall('pauseAllOtherAudio');
  if (typeof document === 'undefined') return;

  const audioElements = document.querySelectorAll<HTMLAudioElement>('audio');
  audioElements.forEach((audio) => {
    if (audio !== targetAudio && !audio.paused) {
      try {
        audio.pause();
      } catch (err) {
        console.error('Error pausing audio element:', err);
      }
    }
  });
};

/**
 * Enforces that only the target audio ID remains unpaused among HTML audio elements.
 * @param targetAudioId ID string of the target audio element (e.g. "audio-123").
 */
export const enforceSingleAudioPlayback = (targetAudioId?: string): void => {
  logFunctionCall('enforceSingleAudioPlayback', { targetAudioId });
  if (typeof document === 'undefined') return;

  const audioElements = document.querySelectorAll<HTMLAudioElement>('audio');
  audioElements.forEach((audio) => {
    if (audio.id !== targetAudioId && !audio.paused) {
      try {
        audio.pause();
      } catch (err) {
        console.error('Error pausing audio element:', err);
      }
    }
  });
};
