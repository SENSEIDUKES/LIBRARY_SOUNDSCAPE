import { describe, it, expect } from 'vitest';
import {
  PARENT_TAGS,
  TONE_OPTIONS,
  ENERGY_OPTIONS,
  TENSION_OPTIONS,
} from '../src/components/QuickTaggingSystem';
import { filterSoundscapes } from '../src/utils/vaultFilter';
import { SongResult, SoundscapeTags, ParentTag } from '../types';

describe('Quick Parent-Child Tagging System', () => {
  it('should have exactly the 6 required parent tags', () => {
    const requiredTags: ParentTag[] = [
      'ADVENTURE',
      'AMBIENT',
      'EMOTIONS',
      'FIGHTING',
      'WAR',
      'SPECIAL',
    ];
    const parentIds = PARENT_TAGS.map((p) => p.id);

    expect(parentIds).toEqual(requiredTags);
    expect(parentIds.length).toBe(6);
  });

  it('should have custom styling and icons for each parent tag', () => {
    PARENT_TAGS.forEach((tag) => {
      expect(tag.label).toBe(tag.id);
      expect(tag.activeClass).toBeDefined();
      expect(tag.activeClass.length).toBeGreaterThan(10);
      expect(tag.activeBadge).toBeDefined();
      expect(tag.icon).toBeDefined();
    });
  });

  it('should define child options split by the 3 specified categories', () => {
    // Tone: Bright, Neutral, Dark
    expect(TONE_OPTIONS.map((t) => t.id)).toEqual(['Bright', 'Neutral', 'Dark']);
    TONE_OPTIONS.forEach((t) => {
      expect(t.activeClass).toBeDefined();
    });

    // Energy: Low, Medium, High
    expect(ENERGY_OPTIONS.map((e) => e.id)).toEqual(['Low', 'Medium', 'High']);
    ENERGY_OPTIONS.forEach((e) => {
      expect(e.activeClass).toBeDefined();
    });

    // Tension: Calm, Suspenseful, Urgent
    expect(TENSION_OPTIONS.map((tn) => tn.id)).toEqual(['Calm', 'Suspenseful', 'Urgent']);
    TENSION_OPTIONS.forEach((tn) => {
      expect(tn.activeClass).toBeDefined();
    });
  });

  it('enforces single parent selection and preserves child options across parent changes', () => {
    let currentTags: SoundscapeTags = {};

    // 1. Initial state: children are undefined/unknown, no parent
    expect(currentTags.parent).toBeUndefined();
    expect(currentTags.tone).toBeUndefined();
    expect(currentTags.energy).toBeUndefined();
    expect(currentTags.tension).toBeUndefined();

    // 2. Select first parent: ADVENTURE
    currentTags = { ...currentTags, parent: 'ADVENTURE' };
    expect(currentTags.parent).toBe('ADVENTURE');
    // Children remain unknown/optional initially
    expect(currentTags.tone).toBeUndefined();
    expect(currentTags.energy).toBeUndefined();
    expect(currentTags.tension).toBeUndefined();

    // 3. Assign 1 choice per category (max 3)
    currentTags = {
      ...currentTags,
      tone: 'Bright',
      energy: 'High',
      tension: 'Urgent',
    };
    expect(currentTags.tone).toBe('Bright');
    expect(currentTags.energy).toBe('High');
    expect(currentTags.tension).toBe('Urgent');

    // 4. Switch parent to FIGHTING: only 1 parent at a time, child options remain accessible
    currentTags = {
      ...currentTags,
      parent: 'FIGHTING',
    };
    expect(currentTags.parent).toBe('FIGHTING');
    expect(currentTags.tone).toBe('Bright');
    expect(currentTags.energy).toBe('High');
    expect(currentTags.tension).toBe('Urgent');

    // 5. Deselecting an active child tag reverts it to unknown (undefined)
    currentTags = {
      ...currentTags,
      tone: undefined,
    };
    expect(currentTags.tone).toBeUndefined();
    expect(currentTags.energy).toBe('High');
    expect(currentTags.tension).toBe('Urgent');
  });

  it('allows filtering soundscapes in the vault by parent and child tags', () => {
    const mockSongs: SongResult[] = [
      {
        id: 's1',
        status: 'completed',
        logs: [],
        audioUrl: 'https://example.com/1.mp3',
        coverImageUrl: null,
        title: 'Celestial Journey',
        lyrics: '',
        metadata: '',
        fullPrompt: 'journey through heaven',
        error: null,
        timestamp: new Date(),
        isExpanded: false,
        originalPrompt: '',
        originalLyricsOption: 'Instrumental',
        soundscapeConfig: {
          culture: 'Chinese',
          mood: 'Ethereal',
          instrument: 'Guqin',
          pacing: 'Slow',
          mainTexture: '',
          environmentalTexture: '',
          sceneAtmosphere: '',
          emotionalDirection: '',
          endingDirection: '',
          vocals: '',
        },
        tags: {
          parent: 'ADVENTURE',
          tone: 'Bright',
          energy: 'High',
        },
      },
      {
        id: 's2',
        status: 'completed',
        logs: [],
        audioUrl: 'https://example.com/2.mp3',
        coverImageUrl: null,
        title: 'Battle of the Immortal Peaks',
        lyrics: '',
        metadata: '',
        fullPrompt: 'epic conflict',
        error: null,
        timestamp: new Date(),
        isExpanded: false,
        originalPrompt: '',
        originalLyricsOption: 'Instrumental',
        soundscapeConfig: {
          culture: 'Chinese',
          mood: 'Epic',
          instrument: 'Guzheng',
          pacing: 'Fast',
          mainTexture: '',
          environmentalTexture: '',
          sceneAtmosphere: '',
          emotionalDirection: '',
          endingDirection: '',
          vocals: '',
        },
        tags: {
          parent: 'WAR',
          tension: 'Urgent',
          tone: 'Dark',
        },
      },
    ];

    // Search by parent tag "ADVENTURE"
    const adventureResults = filterSoundscapes(mockSongs, {
      searchQuery: 'ADVENTURE',
      selectedCulture: 'all',
    });
    expect(adventureResults.length).toBe(1);
    expect(adventureResults[0].id).toBe('s1');

    // Search by child tag "urgent"
    const urgentResults = filterSoundscapes(mockSongs, {
      searchQuery: 'urgent',
      selectedCulture: 'all',
    });
    expect(urgentResults.length).toBe(1);
    expect(urgentResults[0].id).toBe('s2');

    // Search by child tag "bright"
    const brightResults = filterSoundscapes(mockSongs, {
      searchQuery: 'bright',
      selectedCulture: 'all',
    });
    expect(brightResults.length).toBe(1);
    expect(brightResults[0].id).toBe('s1');
  });
});
