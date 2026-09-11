import React, { useRef, useImperativeHandle } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SongResult, SoundscapeTags } from '../../types';
import SongResultCard from './SongResultCard';

export interface VirtualizedSoundscapeListProps {
  items: SongResult[];
  favoriteIdsSet: Set<string>;
  isResultPlaying: string | null;
  encodingVideoId: string | null;
  toggleExpand: (id: string) => void;
  toggleFavorite: (id: string) => void;
  handleDownload: (result: SongResult) => void;
  onDownloadVideo: (result: SongResult, withLyrics?: boolean) => void;
  handlePlayStateChange: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onRerollTitle?: (id: string) => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
  onUpdateTags?: (id: string, tags: SoundscapeTags) => void;
  selectedFavoriteIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  isFavoriteTab?: boolean;
  className?: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export interface VirtualizedSoundscapeListHandle {
  scrollToTop: () => void;
  scrollToIndex: (index: number) => void;
}

export const VirtualizedSoundscapeList = React.forwardRef<
  VirtualizedSoundscapeListHandle,
  VirtualizedSoundscapeListProps
>(({
  items,
  favoriteIdsSet,
  isResultPlaying,
  encodingVideoId,
  toggleExpand,
  toggleFavorite,
  handleDownload,
  onDownloadVideo,
  handlePlayStateChange,
  onDelete,
  onRerollTitle,
  onUpdateTitle,
  onUpdateTags,
  selectedFavoriteIds,
  onToggleSelect,
  isFavoriteTab = false,
  className = '',
  scrollRef: externalScrollRef,
}, ref) => {
  const internalScrollRef = useRef<HTMLDivElement | null>(null);
  const activeScrollRef = externalScrollRef || internalScrollRef;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => activeScrollRef.current,
    estimateSize: () => 165,
    overscan: 4,
    gap: 14,
    useFlushSync: false,
    initialRect: { width: 800, height: 600 },
  });

  useImperativeHandle(
    ref,
    () => ({
      scrollToTop: () => {
        if (activeScrollRef.current) {
          activeScrollRef.current.scrollTop = 0;
        }
      },
      scrollToIndex: (index: number) => {
        virtualizer.scrollToIndex(index, { align: 'start' });
      },
    }),
    [virtualizer, activeScrollRef]
  );

  const virtualItems = virtualizer.getVirtualItems();

  // Fallback for headless environments or before DOM measurement where clientHeight might report 0
  const renderedItems =
    virtualItems.length > 0
      ? virtualItems
      : items.slice(0, 10).map((_, index) => ({
          index,
          start: index * (165 + 14),
          size: 165,
          key: items[index]?.id || index,
        }));

  return (
    <div
      ref={activeScrollRef}
      className={`flex-1 overflow-y-auto custom-scrollbar pr-1 relative min-h-0 ${className}`}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize() || renderedItems.length * (165 + 14)}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {renderedItems.map((virtualRow) => {
          const song = items[virtualRow.index];
          if (!song) return null;

          const isFav = isFavoriteTab || favoriteIdsSet.has(song.id);
          const isSelected = selectedFavoriteIds?.has(song.id) ?? false;
          const isElevated = Boolean(song.isExpanded || isResultPlaying === song.id);

          return (
            <div
              key={song.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                zIndex: isElevated ? 30 : 1,
              }}
            >
              <SongResultCard
                result={{ ...song, isFavorite: isFav }}
                isPlaying={isResultPlaying === song.id}
                isEncoding={encodingVideoId === song.id}
                onToggleExpand={toggleExpand}
                onToggleFavorite={toggleFavorite}
                onDownloadMP3={handleDownload}
                onDownloadVideo={onDownloadVideo}
                onPlayStateChange={handlePlayStateChange}
                onDelete={onDelete}
                onRerollTitle={onRerollTitle}
                onUpdateTitle={onUpdateTitle}
                onUpdateTags={onUpdateTags}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedSoundscapeList.displayName = 'VirtualizedSoundscapeList';

export default VirtualizedSoundscapeList;
