import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SCENE_SNAPSHOT_PRESETS } from '../src/components/VisualScenePicker';
import { analyzeVisualScene } from '../src/services/genaiService';

describe('SCENE_SNAPSHOT_PRESETS', () => {
  it('should contain all curated atmospheric scene presets with valid metadata', () => {
    expect(SCENE_SNAPSHOT_PRESETS.length).toBeGreaterThanOrEqual(5);

    const mountainPreset = SCENE_SNAPSHOT_PRESETS.find((p) => p.id === 'mystical-mountains');
    expect(mountainPreset).toBeDefined();
    expect(mountainPreset?.title).toBe('Mystical Peaks');
    expect(mountainPreset?.instrument).toContain('Guqin');
    expect(mountainPreset?.svgDataUri).toContain('data:image/svg+xml');

    SCENE_SNAPSHOT_PRESETS.forEach((preset) => {
      expect(preset.id).toBeTruthy();
      expect(preset.title).toBeTruthy();
      expect(preset.mood).toBeTruthy();
      expect(preset.instrument).toBeTruthy();
      expect(preset.environment).toBeTruthy();
      expect(preset.svgDataUri).toMatch(/^data:image\/svg\+xml/);
    });
  });
});

describe('analyzeVisualScene', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test_key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should fallback gracefully to heuristic scene coordinates when endpoint is unavailable', async () => {
    const analysis = await analyzeVisualScene(
      { data: 'mock_base64_data', mimeType: 'image/jpeg' },
      'Chinese'
    );
    expect(analysis).toBeDefined();
    expect(analysis.mood).toBeTruthy();
    expect(analysis.instrument).toBeTruthy();
    expect(analysis.sceneTitle).toBeTruthy();
    expect(analysis.promptSuggestion).toBeTruthy();
  });
});
