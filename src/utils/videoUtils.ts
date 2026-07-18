/**
 * Video Utilities
 *
 * This module handles the complex logic of rendering audio and cover art into a video file.
 * It uses the Web Audio API for spectrum analysis and the Canvas API for visual rendering.
 *
 * Use Cases:
 * - Exporting a generated song as a video file (WebM) for sharing on social media.
 * - Rendering dynamic audio spectrum visualizations.
 * - Overlaying synchronized lyrics on the video.
 */
import { SongResult } from '../../types';
import { parseTimedLyrics } from './lyricsUtils';
import { logFunctionCall } from './logger';
import { sanitizeFilename, getAutoExportName } from './helpers';

/**
 * Generates and downloads a video combining the song's audio, cover art, and optional lyrics.
 * @param result The song result object containing audio and image URLs.
 * @param withLyrics Whether to overlay synchronized lyrics on the video.
 * @param onProgress Callback function to report encoding progress (0-100).
 * @param onComplete Callback function executed when encoding finishes.
 */
export const handleDownloadVideo = async (
  result: SongResult,
  withLyrics: boolean,
  onProgress: (progress: number) => void,
  onComplete: () => void
) => {
  logFunctionCall('handleDownloadVideo', { resultId: result.id, withLyrics });
  if (!result.audioUrl || !result.coverImageUrl) {
    onComplete();
    return;
  }

  const audio = new Audio(result.audioUrl);
  audio.crossOrigin = "anonymous";
  await new Promise(resolve => {
    audio.onloadedmetadata = resolve;
    audio.onerror = resolve;
    setTimeout(resolve, 5000); // 5 seconds maximum wait fallback
  });

  const canvas = document.createElement('canvas');
  const canvasWidth = withLyrics ? 1920 : 1080;
  const canvasHeight = 1080;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    onComplete();
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = result.coverImageUrl;
  await new Promise(resolve => {
    img.onload = resolve;
    img.onerror = resolve;
    setTimeout(resolve, 5000); // 5 seconds maximum wait fallback
  });

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const dest = audioCtx.createMediaStreamDestination();
  source.connect(analyser);
  analyser.connect(dest);

  const stream = canvas.captureStream(30);
  const combined = new MediaStream([...stream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const recorder = new MediaRecorder(combined, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    const link = document.createElement('a');
    link.href = url;
    const baseName = getAutoExportName(result.originalPrompt, result.title, result.soundscapeConfig);
    const suffix = withLyrics ? 'lyrics' : 'spectrum';
    link.download = `${baseName}_${suffix}.webm`;
    link.click();
    onComplete();
  };

  const timedLyrics = withLyrics ? parseTimedLyrics(result.lyrics) : [];
  console.log('[Video Debug] withLyrics:', withLyrics);
  console.log('[Video Debug] timedLyrics length:', timedLyrics.length);
  if (withLyrics && timedLyrics.length === 0) {
    console.warn('[Video Debug] WARNING: withLyrics is true, but timedLyrics is empty. Lyrics will not be displayed.');
  }

  const workerCode = `
    let interval;
    self.onmessage = function(e) {
      if (e.data === 'start') {
        interval = setInterval(() => self.postMessage('tick'), 1000 / 30);
      } else if (e.data === 'stop') {
        clearInterval(interval);
      }
    };
  `;
  const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerUrl);

  let lastProgress = -1;

  recorder.start();
  audio.play().catch(err => {
    console.error("Audio playback failed:", err);
    worker.postMessage('stop');
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
    recorder.stop();
    audioCtx.close();
    onComplete();
  });

  const getWrappedLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  };

  const draw = () => {
    if (!ctx) return;

    // Clear and draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (withLyrics) {
      ctx.filter = 'blur(40px)';
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw cover image on the left (or center if no lyrics)
    ctx.drawImage(img, 0, 0, 1080, 1080);

    // Add a darker overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, 1080, 1080);

    // Get frequency data for spectrum
    analyser.getByteFrequencyData(dataArray);

    // Draw Spectrum Bars
    const barWidth = (1080 / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * 300;

      // Gradient for bars
      const gradient = ctx.createLinearGradient(0, 1080, 0, 1080 - barHeight);
      gradient.addColorStop(0, 'rgba(255, 45, 85, 0.8)');
      gradient.addColorStop(1, 'rgba(175, 82, 222, 0.8)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, 1080 - barHeight, barWidth - 2, barHeight);
      x += barWidth;
    }

    // Draw Lyrics if enabled
    if (withLyrics && timedLyrics.length > 0) {
      const currentTime = audio.currentTime;
      let currentLine = "";
      for (let i = timedLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= timedLyrics[i].time) {
          currentLine = timedLyrics[i].text;
          break;
        }
      }

      if (currentLine) {
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = 1920 - 1080 - 100; // 740px
        const lines = getWrappedLines(ctx, currentLine, maxWidth);
        const lineHeight = 80;
        const totalHeight = lines.length * lineHeight;
        let startY = 1080 / 2 - totalHeight / 2 + lineHeight / 2;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.fillStyle = 'white';

        const centerX = 1080 + (1920 - 1080) / 2;

        for (const line of lines) {
          ctx.strokeText(line, centerX, startY);
          ctx.fillText(line, centerX, startY);
          startY += lineHeight;
        }
      }
    }

    // Update progress
    if (audio.duration) {
      const currentProgress = Math.round((audio.currentTime / audio.duration) * 100);
      if (currentProgress !== lastProgress) {
        lastProgress = currentProgress;
        onProgress(currentProgress);
      }
    }

    if (audio.paused && audio.currentTime >= audio.duration) {
      worker.postMessage('stop');
      return;
    }
  };

  worker.onmessage = () => {
    draw();
  };

  worker.postMessage('start');
  audio.onended = () => { 
    worker.postMessage('stop');
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
    recorder.stop(); 
    audioCtx.close(); 
  };
};
