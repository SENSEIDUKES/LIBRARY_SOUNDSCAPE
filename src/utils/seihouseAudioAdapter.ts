import { Track } from '@seihouse/audio-player';
import { SongResult, ExampleSong } from '../../types';
import { getCultureForSong } from './helpers';

/**
 * Converts a SongResult into a Track compatible with @seihouse/audio-player.
 */
export const songResultToTrack = (result: SongResult): Track => {
  const audioUrl = result.audioUrl || (result.audioBase64 ? `data:audio/wav;base64,${result.audioBase64}` : '');
  const culture = getCultureForSong(
    result.soundscapeConfig,
    result.fullPrompt || result.originalPrompt,
    result.title
  );

  return {
    id: result.id,
    title: result.title || 'Celestial Soundscape',
    artist: result.soundscapeConfig?.instrument ? `${result.soundscapeConfig.instrument} • SEN` : 'SEN Formations',
    audioFile: audioUrl,
    artwork: result.coverImageUrl || undefined,
    albumTitle: culture ? `${culture} Soundscape` : 'Daoist Formation',
    vaultCategory: 'master',
  };
};

/**
 * Converts an ExampleSong into a Track compatible with @seihouse/audio-player.
 */
export const exampleSongToTrack = (song: ExampleSong, audioUrl?: string): Track => {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    audioFile: audioUrl || (song as any).audioUrl || '',
    artwork: song.coverUrl,
    albumTitle: song.tags.join(' • '),
    vaultCategory: 'demo',
  };
};
