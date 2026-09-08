import { useAudioSession } from '@seihouse/audio-player';
import { EXAMPLE_SONGS } from '../../constants';
import { SongResult } from '../../types';
import { createSyntheticSoundscape } from '../utils/audioUtils';
import { songResultToTrack, exampleSongToTrack } from '../utils/seihouseAudioAdapter';

export function useAudioPlayback() {
  const session = useAudioSession();

  // Active track statuses derived directly from the single @seihouse/audio-player session
  const isResultPlaying =
    session.isPlaying && session.currentTrack && session.currentTrack.vaultCategory !== 'demo'
      ? session.currentTrack.id || null
      : null;

  const activePresetPlaying =
    session.isPlaying && session.currentTrack && session.currentTrack.vaultCategory === 'demo'
      ? session.currentTrack.id || null
      : null;

  const handlePlayStateChange = (id: string | null) => {
    if (!id) {
      session.pause();
    }
  };

  const playSongResult = (result: SongResult) => {
    const audioUrl = result.audioUrl || (result.audioBase64 ? `data:audio/wav;base64,${result.audioBase64}` : '');
    if (!audioUrl) return;

    if (session.currentTrack?.id === result.id) {
      session.toggle();
    } else {
      const track = songResultToTrack(result);
      session.playNow(track);
    }
  };

  const togglePresetPlaying = async (songId: string) => {
    if (session.isPlaying && session.currentTrack?.id === songId) {
      session.toggle();
      return;
    }

    const song = EXAMPLE_SONGS.find((s) => s.id === songId);
    if (!song) return;

    let audioUrl = (song as any).audioUrl;
    if (!audioUrl) {
      try {
        const soundscape = await createSyntheticSoundscape(
          song.tags[0] || 'Guzheng',
          song.tags[1] || 'Tranquil',
          25
        );
        audioUrl = soundscape.audioUrl;
        (song as any).audioUrl = audioUrl;
      } catch (e) {
        console.warn('Fallback synthetic audio generation failed:', e);
      }
    }

    const track = exampleSongToTrack(song, audioUrl);
    session.playNow(track);
  };

  return {
    isResultPlaying,
    setIsResultPlaying: (id: string | null) => {
      if (!id) {
        session.pause();
      }
    },
    activePresetPlaying,
    handlePlayStateChange,
    togglePresetPlaying,
    playSongResult,
    session,
  };
}

