import { useState, useRef, useEffect } from 'react';
import { pauseAllOtherAudio, enforceSingleAudioPlayback } from '../services/audioManager';

export function useAudioPlayback() {
  const [isResultPlaying, setIsResultPlaying] = useState<string | null>(null);
  const [activePresetPlaying, setActivePresetPlaying] = useState<string | null>(null);
  const synthRef = useRef<{ stop: () => void } | null>(null);

  // Global listener: Guarantee only one audio source plays across DOM audio elements and Web Audio synths
  useEffect(() => {
    const handleGlobalPlay = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      if (target && target.tagName === 'AUDIO') {
        pauseAllOtherAudio(target);

        if (synthRef.current) {
          synthRef.current.stop();
          synthRef.current = null;
        }
        setActivePresetPlaying(null);

        const match = target.id?.match(/^audio-(.+)$/);
        if (match) {
          setIsResultPlaying(match[1]);
        }
      }
    };

    document.addEventListener('play', handleGlobalPlay, true);
    return () => {
      document.removeEventListener('play', handleGlobalPlay, true);
    };
  }, []);

  const handlePlayStateChange = (id: string | null) => {
    if (id) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      setActivePresetPlaying(null);
      enforceSingleAudioPlayback(`audio-${id}`);
      setIsResultPlaying(id);
    } else {
      setIsResultPlaying((current) => {
        const playingAudio = Array.from(document.querySelectorAll<HTMLAudioElement>('audio')).find(
          (a) => !a.paused
        );
        if (playingAudio) {
          const match = playingAudio.id.match(/^audio-(.+)$/);
          return match ? match[1] : current;
        }
        return null;
      });
    }
  };

  const togglePresetPlaying = (songId: string) => {
    if (activePresetPlaying === songId) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      setActivePresetPlaying(null);
      return;
    }

    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }

    // Stop all HTML5 audio elements on the page and clear result playing state
    pauseAllOtherAudio(null);
    setIsResultPlaying(null);

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (songId === '1') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 2);
    } else if (songId === '2') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, audioCtx.currentTime + 1.5);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(260, audioCtx.currentTime + 3);
    }

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    synthRef.current = {
      stop: () => {
        try {
          osc.stop();
          audioCtx.close();
        } catch (err) {}
      },
    };

    setActivePresetPlaying(songId);
    setTimeout(() => {
      setActivePresetPlaying((curr) => (curr === songId ? null : curr));
    }, 4000);
  };

  return {
    isResultPlaying,
    setIsResultPlaying,
    activePresetPlaying,
    handlePlayStateChange,
    togglePresetPlaying
  };
}
