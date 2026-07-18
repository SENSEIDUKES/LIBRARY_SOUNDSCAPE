import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseModelOutput, generateSongTitle, generateCoverArt } from '../src/services/genaiService';

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
          // Default text generation mock response
          return {
            text: 'Slaying Celestial Fiends'
          };
        }
      };
    },
    Modality: {},
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
      expect(title).toBe('Lyria Composition');
    } finally {
      process.env.API_KEY = originalApiKey;
    }
  });
});

describe('generateCoverArt', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test_key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should generate image successfully and return base64 data url', async () => {
    const art = await generateCoverArt('calm river at night', 'Gentle flowing waters and flutes', 'River Serenade');
    expect(art).toBe('data:image/jpeg;base64,fakebase64string');
  });

  it('should return null when API key is missing or generation fails', async () => {
    const originalApiKey = process.env.API_KEY;
    delete process.env.API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const art = await generateCoverArt('calm river', 'flowing water', 'River');
      expect(art).toBeNull();
    } finally {
      process.env.API_KEY = originalApiKey;
    }
  });
});
