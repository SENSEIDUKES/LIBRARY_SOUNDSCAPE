import JSZip from 'jszip';
import { SongResult } from '../../types';
import { getAutoExportName, extractMetadata } from './helpers';

export interface ZipDownloadProgress {
  current: number;
  total: number;
  currentSongTitle: string;
}

/**
 * Converts a song result's audioUrl or base64 audio into a Blob
 */
export const fetchAudioBlob = async (song: SongResult): Promise<Blob | Uint8Array | null> => {
  if (song.audioUrl) {
    try {
      const response = await fetch(song.audioUrl);
      if (response.ok) {
        return await response.blob();
      }
    } catch (e) {
      console.warn('Failed to fetch blob from audioUrl, falling back to base64 if available', e);
    }
  }
  if (song.audioBase64) {
    try {
      const byteCharacters = atob(song.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      return new Uint8Array(byteNumbers);
    } catch (e) {
      console.error('Failed to parse base64 audio:', e);
    }
  }
  return null;
};

/**
 * Packs selected soundscapes into a single ZIP file and triggers browser download
 */
export const createAndDownloadSoundscapesZip = async (
  songs: SongResult[],
  zipFilename?: string,
  onProgress?: (progress: ZipDownloadProgress) => void
): Promise<boolean> => {
  if (!songs || songs.length === 0) return false;

  const zip = new JSZip();
  const audioFolder = zip.folder('audio');

  // Summary metadata file
  const metadataList = songs.map((s) => {
    const meta = extractMetadata(s.metadata, s.soundscapeConfig);
    return {
      id: s.id,
      title: s.title || 'Untitled Soundscape',
      key: meta.key,
      tempo: meta.tempo,
      genres: meta.genres,
      culture: s.soundscapeConfig?.culture || 'Chinese',
      prompt: s.fullPrompt || s.originalPrompt,
      lyrics: s.lyrics || '',
      created: s.timestamp ? new Date(s.timestamp).toISOString() : ''
    };
  });

  zip.file('soundscapes_metadata.json', JSON.stringify(metadataList, null, 2));

  let index = 0;
  for (const song of songs) {
    index++;
    if (onProgress) {
      onProgress({
        current: index,
        total: songs.length,
        currentSongTitle: song.title || `Soundscape #${index}`
      });
    }

    const audioData = await fetchAudioBlob(song);
    if (audioData) {
      const cleanName = getAutoExportName(
        song.fullPrompt || song.originalPrompt,
        song.title || 'Soundscape',
        song.soundscapeConfig
      );
      const ext = (audioData instanceof Blob && audioData.type.includes('mpeg')) ? 'mp3' : 'wav';
      const fileIndexStr = index.toString().padStart(2, '0');
      const filename = `${fileIndexStr}_${cleanName}.${ext}`;

      if (audioFolder) {
        audioFolder.file(filename, audioData);

        if (song.lyrics && song.lyrics.trim().length > 0) {
          const lyricsFilename = `${fileIndexStr}_${cleanName}_lyrics.txt`;
          audioFolder.file(lyricsFilename, song.lyrics);
        }
      } else {
        zip.file(filename, audioData);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });

  if (typeof document !== 'undefined') {
    const downloadUrl = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = zipFilename || `Favorite_Soundscapes_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
  }

  return true;
};
