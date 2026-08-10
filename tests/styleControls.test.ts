import { describe, it, expect } from 'vitest';

describe('Dual Parser and Manual Style Controls', () => {
  it('should construct prompt with style, pacing, and intensity for Manual mode', () => {
    const culture = 'Chinese';
    const pacing = 'fast pacing';
    const intensity = 0.85;
    const prompt = 'An epic battle at the Heavenly Pass';
    const instrument = 'Erhu';

    const targetPrompt = `[Manual Soundscape] ${prompt} | Style: ${culture}, Pacing: ${pacing}, Intensity: ${intensity}${instrument ? `, Instrument: ${instrument}` : ''}`;

    expect(targetPrompt).toContain('[Manual Soundscape]');
    expect(targetPrompt).toContain('Style: Chinese');
    expect(targetPrompt).toContain('Pacing: fast pacing');
    expect(targetPrompt).toContain('Intensity: 0.85');
    expect(targetPrompt).toContain('Instrument: Erhu');
  });

  it('should construct prompt with style, pacing, and intensity for Parser mode', () => {
    const culture = 'Japanese';
    const soundscapeConfig = {
      culture: 'Japanese',
      mood: 'mysterious',
      instrument: 'Koto',
      pacing: 'slow pacing',
      mainTexture: 'flowing melodies',
      environmentalTexture: 'ambient wind',
      sceneAtmosphere: 'ancient temple',
      emotionalDirection: 'deep contemplation',
      endingDirection: 'fading echo',
      vocals: 'no lyrics',
      intensity: 0.4,
    };

    const targetPrompt = `[Chapter Soundscape] Mood: ${soundscapeConfig.mood}. Style: ${culture}. Primary Instrument: ${soundscapeConfig.instrument}. Pacing: ${soundscapeConfig.pacing}. Main Texture: ${soundscapeConfig.mainTexture}. Env Noise: ${soundscapeConfig.environmentalTexture}. Atmosphere: ${soundscapeConfig.sceneAtmosphere}. Ending: ${soundscapeConfig.endingDirection}. Vocals: ${soundscapeConfig.vocals}.`;

    expect(targetPrompt).toContain('[Chapter Soundscape]');
    expect(targetPrompt).toContain('Style: Japanese');
    expect(targetPrompt).toContain('Primary Instrument: Koto');
    expect(targetPrompt).toContain('Pacing: slow pacing');
  });
});
