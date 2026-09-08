import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseModelOutput, generateSongTitle, generateCoverArt, generateLyriaAudio } from '../src/services/genaiService';

// Mock the GoogleGenAI SDK module
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: async ({ model }: { model: string }) => {
          if (model?.includes('image')) {
            return {
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: 'image/jpeg',
                          data: 'fakebase64string'
                        }
                      }
                    ]
                  }
                }
              ]
            };
          }
          if (model?.includes('lyria')) {
            return {
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: 'audio/wav',
                          data: 'fakeaudiobase64'
                        }
                      }
                    ]
                  }
                }
              ]
            };
          }
          // Default text generation mock response
          return {
            text: 'Slaying Celestial Fiends'
          };
        },
        generateContentStream: async function* () {
          yield {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'audio/wav',
                        data: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
                      }
                    },
                    {
                      text: '[Verse 1] Sound of distant rivers'
                    }
                  ]
                }
              }
            ]
          };
        }
      };
    },
    Modality: {
      AUDIO: 'AUDIO'
    },
    Type: {}
  };
});

describe('parseModelOutput', () => {
  it('should split raw output by metadata markers correctly', () => {
    const rawOutput = `
Verse 1
Walking the cloud-shrouded peak
Guqin in hand, seeking truth.

Instruments: Guqin, Xiao flute
Mood: Serene, contemplative
`;
    const result = parseModelOutput(rawOutput);
    expect(result.lyrics).toBe(`Verse 1\nWalking the cloud-shrouded peak\nGuqin in hand, seeking truth.`);
    expect(result.metadata).toContain('Instruments: Guqin, Xiao flute');
  });

  it('should return empty metadata if no markers match', () => {
    const rawOutput = 'Just pure lyrics text line 1\nline 2';
    const result = parseModelOutput(rawOutput);
    expect(result.lyrics).toBe(rawOutput);
    expect(result.metadata).toBe('');
  });
});

describe('generateSongTitle', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test_key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should return generated title from model successfully', async () => {
    const title = await generateSongTitle('epic fighting soundscape', 'Swords clash and thunder echoes');
    expect(title).toBe('Slaying Celestial Fiends');
  });

  it('should fallback gracefully when no API key is set', async () => {
    const originalApiKey = process.env.API_KEY;
    delete process.env.API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const title = await generateSongTitle('epic fighting soundscape', 'Swords clash and thunder echoes');
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('Lyria Composition');
    } finally {
      process.env.API_KEY = originalApiKey;
    }
  });
});

describe('generateCoverArt', () => {
  it('should return null as cover art generation is disabled for internal tool', async () => {
    const art = await generateCoverArt('calm river at night', 'Gentle flowing waters and flutes', 'River Serenade');
    expect(art).toBeNull();
  });
});

describe('generateLyriaAudio', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test_key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should stream audio and return base64 and lyrics with Lyria 3 Pro', async () => {
    const res = await generateLyriaAudio('Calm river at night with bamboo flutes', 'lyria-3-pro-preview');
    expect(res.base64).toBe('UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    expect(res.lyrics).toContain('Sound of distant rivers');
  });

  it('should stream audio with standard lyria-3-clip-preview and default CONFIG.MODEL_ID_FULL', async () => {
    const resClip = await generateLyriaAudio('Wuxia sword dance', 'lyria-3-clip-preview');
    expect(resClip.base64).toBe('UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');

    const resDefault = await generateLyriaAudio('Xianxia meditation');
    expect(resDefault.base64).toBe('UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
  });

  it('should support multimodal generation with image inputs', async () => {
    const mockImage = {
      data: 'fake_mountain_image_base64',
      mimeType: 'image/jpeg',
    };
    const res = await generateLyriaAudio(
      'Atmospheric mountain pass',
      'lyria-3-pro-preview',
      30,
      [mockImage]
    );
    expect(res.base64).toBe('UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
  });

  it('should fallback gracefully to acoustic synthesizer when API key is missing', async () => {
    delete process.env.API_KEY;
    delete process.env.GEMINI_API_KEY;
    const res = await generateLyriaAudio('test prompt');
    expect(res.audioUrl).toBeDefined();
    expect(res.base64).toBeDefined();
    expect(res.metadata).toContain('Acoustic Synthesizer: Active');
  });
});

