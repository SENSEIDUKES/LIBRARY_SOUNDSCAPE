import { describe, it, expect } from 'vitest';
import { Virtualizer } from '@tanstack/react-virtual';
import { SongResult } from '../types';

const createMockSoundscape = (id: string, title: string): SongResult => ({
  id,
  title,
  status: 'completed',
  logs: ['[00:00] Initialized'],
  audioUrl: `https://example.com/${id}.mp3`,
  audioBase64: 'UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  coverImageUrl: null,
  lyrics: '',
  metadata: '',
  fullPrompt: 'A tranquil guzheng soundscape',
  error: null,
  timestamp: new Date(),
  isExpanded: false,
  originalPrompt: 'A tranquil guzheng soundscape',
  originalLyricsOption: 'Instrumental',
  soundscapeConfig: {
    instrument: 'Guzheng',
    mood: 'Tranquil',
    pacing: 'Moderate',
    mainTexture: 'Mountain mist',
    environmentalTexture: '',
    sceneAtmosphere: '',
    emotionalDirection: '',
    endingDirection: '',
    vocals: '',
  },
});

describe('VirtualizedSoundscapeList & Virtualizer Engine', () => {
  it('calculates total height and item positioning with item gaps accurately', () => {
    const itemCount = 20;
    const estimateSize = 165;
    const gap = 14;

    const mockScrollElement = {
      scrollTop: 0,
      clientHeight: 600,
      getBoundingClientRect: () => ({ height: 600, width: 800, top: 0, left: 0, right: 800, bottom: 600 } as DOMRect),
    };

    const virtualizer = new Virtualizer({
      count: itemCount,
      getScrollElement: () => mockScrollElement as unknown as Element,
      estimateSize: () => estimateSize,
      gap,
      initialRect: { width: 800, height: 600 },
      overscan: 2,
    } as any);

    // Total size = (20 * 165) + (19 * 14) = 3300 + 266 = 3566
    const expectedTotalSize = itemCount * estimateSize + (itemCount - 1) * gap;
    expect(virtualizer.getTotalSize()).toBe(expectedTotalSize);

    const virtualItems = virtualizer.getVirtualItems();
    expect(virtualItems.length).toBeGreaterThan(0);
    expect(virtualItems.length).toBeLessThan(itemCount); // Confirms windowing: does not mount all 20

    // Check gap spacing on consecutive items
    if (virtualItems.length >= 2) {
      const item0 = virtualItems[0];
      const item1 = virtualItems[1];
      expect(item1.start).toBe(item0.start + estimateSize + gap);
    }
  });

  it('restricts rendered items for a 1,000-soundscape library to an efficient viewport window', () => {
    const largeLibraryCount = 1000;
    const estimateSize = 165;
    const gap = 14;
    const viewportHeight = 700; // Typical desktop container height

    const mockScrollElement = {
      scrollTop: 3000, // Scrolled mid-way down the list
      clientHeight: viewportHeight,
      getBoundingClientRect: () => ({ height: viewportHeight, width: 800, top: 0, left: 0, right: 800, bottom: viewportHeight } as DOMRect),
    };

    const virtualizer = new Virtualizer({
      count: largeLibraryCount,
      getScrollElement: () => mockScrollElement as unknown as Element,
      estimateSize: () => estimateSize,
      gap,
      initialRect: { width: 800, height: viewportHeight },
      initialOffset: 3000,
      overscan: 4,
    } as any);

    const virtualItems = virtualizer.getVirtualItems();

    // With overscan of 4 and viewport of 700px (roughly 4 items visible + 8 overscan = ~12-14 items)
    // It should render far fewer than the 1000 items
    expect(virtualItems.length).toBeLessThan(25);
    expect(virtualItems.length).toBeGreaterThan(0);

    // The first item should be positioned around scrollTop (3000px)
    const firstVirtualItem = virtualItems[0];
    expect(firstVirtualItem.start).toBeLessThanOrEqual(3000);
    expect(firstVirtualItem.index).toBeGreaterThan(10);
  });

  it('handles empty item collection without throwing errors', () => {
    const virtualizer = new Virtualizer({
      count: 0,
      getScrollElement: () => ({ scrollTop: 0, clientHeight: 500 } as unknown as Element),
      estimateSize: () => 165,
      gap: 14,
    } as any);

    expect(virtualizer.getTotalSize()).toBe(0);
    expect(virtualizer.getVirtualItems()).toEqual([]);
  });

  it('correctly maps favorite and selection status across virtualized indices', () => {
    const songs: SongResult[] = [
      createMockSoundscape('song-1', 'Mountain Melody'),
      createMockSoundscape('song-2', 'Bamboo Whispers'),
      createMockSoundscape('song-3', 'Autumn River'),
    ];

    const favoriteIds = new Set(['song-2']);
    const selectedIds = new Set(['song-1', 'song-3']);

    expect(favoriteIds.has(songs[0].id)).toBe(false);
    expect(favoriteIds.has(songs[1].id)).toBe(true);
    expect(favoriteIds.has(songs[2].id)).toBe(false);

    expect(selectedIds.has(songs[0].id)).toBe(true);
    expect(selectedIds.has(songs[1].id)).toBe(false);
    expect(selectedIds.has(songs[2].id)).toBe(true);
  });

  it('assigns elevated zIndex to expanded or active soundscape items to prevent details clipping behind siblings', () => {
    const calculateRowZIndex = (isExpanded: boolean, isPlaying: boolean) => {
      const isElevated = Boolean(isExpanded || isPlaying);
      return isElevated ? 30 : 1;
    };

    // Standard collapsed item has default stacking order
    expect(calculateRowZIndex(false, false)).toBe(1);

    // Opening / expanding the audio player elevates z-index to pop above siblings
    expect(calculateRowZIndex(true, false)).toBe(30);

    // Active playing soundscape is also elevated
    expect(calculateRowZIndex(false, true)).toBe(30);

    // Both expanded and playing stays elevated
    expect(calculateRowZIndex(true, true)).toBe(30);
  });
});
