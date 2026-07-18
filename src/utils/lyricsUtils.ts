/**
 * Lyrics Utilities
 *
 * This module provides functions for parsing and formatting song lyrics.
 * It handles extracting timing markers and cleaning lyrics for display.
 *
 * Use Cases:
 * - Displaying clean lyrics without raw timestamp tags.
 * - Parsing timed lyrics for synchronized video rendering or karaoke-style displays.
 */
import { logFunctionCall } from './logger';

/**
 * Cleans raw lyrics by removing timestamp markers for standard display.
 * @param text The raw lyrics text containing timestamps.
 * @returns The cleaned lyrics text.
 */
export const cleanLyricsForDisplay = (text: string): string => {
  logFunctionCall('cleanLyricsForDisplay', { textLength: text?.length });
  if (!text) return '';
  
  return text
    .split('\n')
    .filter(line => {
      const stripped = line.trim();
      if (!stripped) return false;
      if (stripped.startsWith('[[') && stripped.endsWith(']]')) return false;
      return true;
    })
    .map(line => {
      let cleaned = line;
      // Remove all bracketed tags at the start of the line (e.g., [Verse 1] [0.0:])
      while (cleaned.match(/^\[.*?\]\s*/)) {
        cleaned = cleaned.replace(/^\[.*?\]\s*/, '');
      }
      cleaned = cleaned.replace(/^\d+:\d{2}\s*-\s*/, '');
      return cleaned.trim();
    })
    .filter(line => line.length > 0)
    .join('\n');
};

/**
 * Parses raw lyrics into an array of timed text objects.
 * @param lyricsStr The raw lyrics text containing [mm:ss.ss] timestamps.
 * @returns An array of objects containing the time in seconds and the corresponding text.
 */
export const parseTimedLyrics = (lyricsStr: string): { time: number, text: string }[] => {
  logFunctionCall('parseTimedLyrics', { lyricsStrLength: lyricsStr?.length });
  console.log('[Lyrics Debug] Raw lyrics string:', lyricsStr);
  
  if (!lyricsStr) {
    console.log('[Lyrics Debug] Lyrics string is empty or undefined.');
    return [];
  }

  const lines = lyricsStr.split('\n');
  const parsed: { time: number, text: string }[] = [];
  
  let currentTime = -1;
  let currentText = "";

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith('[[') && line.endsWith(']]')) return; // Skip section markers like [[A0]]

    // 1. Try to match `[something] [m:ss] Text` or `m:ss - Text`
    let match = line.match(/^(?:\[.*?\]\s*)*\[?(\d+):(\d{2})\]?\s*(?:-\s*)?(.*)/);
    if (match) {
      if (currentTime !== -1 && currentText.trim()) {
        parsed.push({ time: currentTime, text: currentText.trim() });
      }
      currentTime = parseInt(match[1]) * 60 + parseInt(match[2]);
      currentText = match[3].trim();
      console.log(`[Lyrics Debug] Found timestamp (m:ss): -> ${currentTime}s | Text: "${currentText}"`);
      return;
    }

    // 2. Try to match `[ss.ss:] Text`, `[ss.ss] Text`, or `[ss.ss:ee.ee] Text`
    match = line.match(/^(?:\[.*?\]\s*)*\[(\d+\.?\d*)[^\]]*\]\s*(.*)/);
    if (match) {
      if (currentTime !== -1 && currentText.trim()) {
        parsed.push({ time: currentTime, text: currentText.trim() });
      }
      currentTime = parseFloat(match[1]);
      currentText = match[2].trim();
      console.log(`[Lyrics Debug] Found timestamp ([ss.ss]): -> ${currentTime}s | Text: "${currentText}"`);
      return;
    }

    // 3. Try to match `[:] Text` (missing time, use last time + 2s)
    match = line.match(/^(?:\[.*?\]\s*)*\[:\]\s*(.*)/);
    if (match) {
      if (currentTime !== -1 && currentText.trim()) {
        parsed.push({ time: currentTime, text: currentText.trim() });
      }
      if (currentTime !== -1) currentTime += 2; // Guess 2 seconds later
      currentText = match[1].trim();
      console.log(`[Lyrics Debug] Found timestamp ([:]): -> ${currentTime}s | Text: "${currentText}"`);
      return;
    }

    // 4. No timestamp found, append to current text
    if (currentTime !== -1) {
      currentText += (currentText ? "\n" : "") + line;
    }
  });

  if (currentTime !== -1 && currentText.trim()) {
    parsed.push({ time: currentTime, text: currentText.trim() });
  }

  console.log('[Lyrics Debug] Final parsed lyrics array:', parsed);
  return parsed.sort((a, b) => a.time - b.time);
};
