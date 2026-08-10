
export type LyricsOption = 'Auto' | 'Custom' | 'Instrumental';

export interface ExampleSong {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  prompt: string;
  duration: string;
  tags: string[];
}

export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

export interface SongResult {
  id: string;
  status: GenerationStatus;
  logs: string[];
  audioUrl: string | null;
  audioBase64?: string; // added to persist base64 data
  coverImageUrl: string | null;
  title: string | null;
  lyrics: string;
  metadata: string;
  fullPrompt: string | null;
  error: string | null;
  modelId?: string;
  timestamp: Date;
  isExpanded: boolean;
  isFavorite?: boolean;
  // Storage for retries
  originalPrompt: string;
  originalLyricsOption: LyricsOption;
  chapterText?: string;
  soundscapeConfig?: {
    culture?: string;
    mood: string;
    instrument: string;
    pacing: string;
    mainTexture: string;
    environmentalTexture: string;
    sceneAtmosphere: string;
    emotionalDirection: string;
    endingDirection: string;
    vocals: string;
    intensity?: number;
  };
}

export interface GenerationState {
  results: SongResult[];
}



