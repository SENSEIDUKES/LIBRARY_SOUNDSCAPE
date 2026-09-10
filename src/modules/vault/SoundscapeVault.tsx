import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, Heart, ListMusic, CheckSquare, Square, Loader2, DownloadCloud, Search, X, SlidersHorizontal, Tag } from 'lucide-react';
import VirtualizedSoundscapeList from '../../components/VirtualizedSoundscapeList';
import { SongResult } from '../../../types';
import { createAndDownloadSoundscapesZip } from '../../utils/zipUtils';
import { filterSoundscapes, extractVaultQuickTags } from '../../utils/vaultFilter';

interface SoundscapeVaultProps {
  activeArchiveTab: 'my-music' | 'favorites';
  setActiveArchiveTab: (tab: 'my-music' | 'favorites') => void;
  genResults: SongResult[];
  favoriteResults: SongResult[];
  isResultPlaying: string | null;
  encodingVideoId: string | null;
  toggleExpand: (id: string) => void;
  toggleFavorite: (id: string) => void;
  handleDownload: (result: SongResult) => void;
  onDownloadVideo: (result: SongResult, withLyrics?: boolean) => void;
  handlePlayStateChange: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onRerollTitle?: (id: string) => void;
}

const CULTURES: { id: string; label: string; activeClass: string }[] = [
  { id: 'all', label: 'All Cultures', activeClass: 'bg-slate-700 text-white border-slate-500' },
  { id: 'Chinese', label: 'Chinese', activeClass: 'bg-blue-600/30 text-blue-200 border-blue-400/70 shadow-sm shadow-blue-950' },
  { id: 'Japanese', label: 'Japanese', activeClass: 'bg-emerald-600/30 text-emerald-200 border-emerald-400/70 shadow-sm shadow-emerald-950' },
  { id: 'Korean', label: 'Korean', activeClass: 'bg-rose-600/30 text-rose-200 border-rose-400/70 shadow-sm shadow-rose-950' },
  { id: 'Western', label: 'Western', activeClass: 'bg-purple-600/30 text-purple-200 border-purple-400/70 shadow-sm shadow-purple-950' },
];

export const SoundscapeVault: React.FC<SoundscapeVaultProps> = ({
  activeArchiveTab,
  setActiveArchiveTab,
  genResults,
  favoriteResults,
  isResultPlaying,
  encodingVideoId,
  toggleExpand,
  toggleFavorite,
  handleDownload,
  onDownloadVideo,
  handlePlayStateChange,
  onDelete,
  onRerollTitle,
}) => {
  const myMusicContainerRef = useRef<HTMLDivElement>(null);

  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<Set<string>>(new Set());
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCulture, setSelectedCulture] = useState('all');

  const currentTabPool = activeArchiveTab === 'my-music' ? genResults : favoriteResults;

  // Filtered soundscapes based on active tab and search/filter inputs
  const filteredMyMusic = useMemo(() => {
    return filterSoundscapes(genResults, {
      searchQuery,
      selectedCulture,
    });
  }, [genResults, searchQuery, selectedCulture]);

  const filteredFavorites = useMemo(() => {
    return filterSoundscapes(favoriteResults, {
      searchQuery,
      selectedCulture,
    });
  }, [favoriteResults, searchQuery, selectedCulture]);

  const activeFilteredList = activeArchiveTab === 'my-music' ? filteredMyMusic : filteredFavorites;

  // Memoize Set of favorite IDs to provide O(1) lookups during iteration (eliminates O(N^2) complexity)
  const favoriteIdsSet = useMemo(
    () => new Set(favoriteResults.map((f) => f.id)),
    [favoriteResults]
  );

  const lowerSearchQuery = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);

  // Dynamic tags from current tab items for fast clicking
  const quickTags = useMemo(() => {
    return extractVaultQuickTags(currentTabPool);
  }, [currentTabPool]);

  const isFilterActive = searchQuery.trim().length > 0 || selectedCulture !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCulture('all');
  };

  const handleTagClick = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerSearchQuery.includes(lowerTag)) {
      // If already in query, remove or clear
      const regex = new RegExp(`\\b${tag}\\b`, 'gi');
      const updated = searchQuery.replace(regex, '').replace(/\s+/g, ' ').trim();
      setSearchQuery(updated);
    } else {
      setSearchQuery((prev) => (prev.trim() ? `${prev.trim()} ${tag}` : tag));
    }
  };

  // Auto-clean selected IDs when favorites list changes
  useEffect(() => {
    setSelectedFavoriteIds((prev) => {
      const next = new Set<string>();
      const currentFavIds = new Set(favoriteResults.map((f) => f.id));
      prev.forEach((id) => {
        if (currentFavIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [favoriteResults]);

  const toggleSelectFavorite = (id: string) => {
    setSelectedFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFavorites = () => {
    const visibleIds = filteredFavorites.map((f) => f.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedFavoriteIds.has(id));

    if (allVisibleSelected) {
      setSelectedFavoriteIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedFavoriteIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleDownloadSelectedZip = async () => {
    if (isZipping) return;

    // Filter target songs: if specific items selected, download those within visible/all favorites, else download filtered favorites
    const targetSongs = selectedFavoriteIds.size > 0
      ? favoriteResults.filter((f) => selectedFavoriteIds.has(f.id))
      : filteredFavorites;

    if (targetSongs.length === 0) return;

    setIsZipping(true);
    setZipProgress(`Preparing ${targetSongs.length} item(s)...`);

    try {
      await createAndDownloadSoundscapesZip(
        targetSongs,
        `Favorite_Soundscapes_${new Date().toISOString().slice(0, 10)}.zip`,
        (progress) => {
          setZipProgress(`Zipping ${progress.current}/${progress.total}: ${progress.currentSongTitle}`);
        }
      );
    } catch (err) {
      console.error('Failed to create ZIP package:', err);
    } finally {
      setIsZipping(false);
      setZipProgress('');
    }
  };

  const allVisibleFavoritesSelected =
    filteredFavorites.length > 0 &&
    filteredFavorites.every((f) => selectedFavoriteIds.has(f.id));
  const selectedCount = selectedFavoriteIds.size;

  return (
    <div className="bg-[#0a0c1a]/95 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 backdrop-blur-2xl min-h-[500px] flex flex-col">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-row items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
        <h2 className="font-extrabold text-sm sm:text-base md:text-lg text-white tracking-wide flex items-center gap-1.5 sm:gap-2 min-w-0">
          <ListMusic className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">Soundscape Vault</span>
        </h2>

        <div className="flex bg-slate-950 p-1 rounded-full border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveArchiveTab('my-music')}
            aria-label="View my generated soundscapes"
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[30px] sm:min-h-[32px] ${
              activeArchiveTab === 'my-music'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            My Music
            {genResults.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveArchiveTab('favorites')}
            aria-label="View favorite soundscapes"
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[30px] sm:min-h-[32px] ${
              activeArchiveTab === 'favorites'
                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/60 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-3 h-3 ${favoriteResults.length > 0 ? 'fill-rose-400 text-rose-300' : ''}`} />
            Favorites
            {favoriteResults.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/40 text-rose-200 rounded-full border border-rose-400/40 font-mono font-black">
                {favoriteResults.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search and Quick Filters Bar (Rendered whenever there are soundscapes in either tab) */}
      {(genResults.length > 0 || favoriteResults.length > 0) && (
        <div className="space-y-2.5 bg-slate-950/70 p-3 sm:p-3.5 rounded-2xl border border-slate-800">
          {/* Main Search Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              <Search className="w-4 h-4 text-cyan-400" />
            </div>
            <input
              id="vault-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mood, instrument, culture, title, or tags..."
              aria-label="Search soundscape tracks"
              className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Culture Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Culture:
            </span>
            {CULTURES.map((c) => {
              const isSelected = selectedCulture === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCulture(c.id)}
                  aria-label={`Filter by ${c.label}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border cursor-pointer min-h-[30px] ${
                    isSelected
                      ? c.activeClass
                      : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Quick Tag Suggestion Chips (if available) */}
          {(quickTags.instruments.length > 0 || quickTags.moods.length > 0) && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-1 border-t border-slate-800/80">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                <Tag className="w-2.5 h-2.5 text-cyan-400" /> Quick Tags:
              </span>
              {quickTags.instruments.map((inst) => {
                const isActive = lowerSearchQuery.includes(inst.toLowerCase());
                return (
                  <button
                    key={`tag-inst-${inst}`}
                    type="button"
                    onClick={() => handleTagClick(inst)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-300 hover:text-cyan-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    🎵 {inst}
                  </button>
                );
              })}
              {quickTags.moods.map((m) => {
                const isActive = lowerSearchQuery.includes(m.toLowerCase());
                return (
                  <button
                    key={`tag-mood-${m}`}
                    type="button"
                    onClick={() => handleTagClick(m)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400 font-bold'
                        : 'bg-slate-900 text-slate-300 hover:text-rose-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ✨ {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Filter Status & Reset button */}
          {isFilterActive && (
            <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-300 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <span>Showing</span>
                <span className="font-bold text-cyan-300">{activeFilteredList.length}</span>
                <span>of</span>
                <span className="font-bold text-white">{currentTabPool.length}</span>
                <span>tracks</span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-rose-200 hover:underline cursor-pointer min-h-[24px]"
              >
                <X className="w-3 h-3" /> Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: My Music */}
      {activeArchiveTab === 'my-music' && (
        <div className="flex-1 flex flex-col min-h-0">
          {genResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-16 border border-dashed border-white/10 rounded-3xl bg-black/20 flex-1">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                Vault Empty
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mt-2 leading-relaxed">
                Extract chapter coordinates or use manual mode to evoke your first soundscape.
              </p>
            </div>
          ) : filteredMyMusic.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-12 border border-dashed border-slate-700/80 rounded-3xl bg-black/20 flex-1 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-200">
                No matching soundscapes found
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                No tracks match &ldquo;{searchQuery || selectedCulture}&rdquo;. Try another mood, instrument, or clear your filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <VirtualizedSoundscapeList
              items={filteredMyMusic}
              favoriteIdsSet={favoriteIdsSet}
              isResultPlaying={isResultPlaying}
              encodingVideoId={encodingVideoId}
              toggleExpand={toggleExpand}
              toggleFavorite={toggleFavorite}
              handleDownload={handleDownload}
              onDownloadVideo={onDownloadVideo}
              handlePlayStateChange={handlePlayStateChange}
              onDelete={onDelete}
              onRerollTitle={onRerollTitle}
              scrollRef={myMusicContainerRef}
            />
          )}
        </div>
      )}

      {/* Tab: Favorites */}
      {activeArchiveTab === 'favorites' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {favoriteResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-16 border border-dashed border-white/10 rounded-3xl bg-black/20 flex-1">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                No Favorites Yet
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mt-2 leading-relaxed">
                Click the heart icon on any soundscape in &ldquo;My Music&rdquo; to pin it to your persistent favorites tab.
              </p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-12 border border-dashed border-rose-900/40 rounded-3xl bg-black/20 flex-1 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-200">
                No favorite soundscapes match
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                No favorite tracks match &ldquo;{searchQuery || selectedCulture}&rdquo;. Try another mood, instrument, or clear your filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <>
              {/* Batch Actions Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-950/80 border border-rose-900/40 rounded-2xl shrink-0">
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSelectAllFavorites}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-extrabold border border-slate-700 transition-all cursor-pointer min-h-[42px] sm:min-h-[36px]"
                  >
                    {allVisibleFavoritesSelected ? (
                      <CheckSquare className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    {allVisibleFavoritesSelected ? 'Deselect All' : 'Select All'}
                  </button>

                  <span className="text-[11px] sm:text-xs font-mono text-rose-300 font-bold px-2 py-1 bg-rose-950/60 rounded-lg border border-rose-900/50 truncate">
                    {selectedCount > 0
                      ? `${selectedCount}/${favoriteResults.length} selected`
                      : `All (${filteredFavorites.length})`}
                  </span>
                </div>

                <button
                  onClick={handleDownloadSelectedZip}
                  disabled={isZipping || filteredFavorites.length === 0}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[42px] sm:min-h-[36px] shadow-md ${
                    isZipping
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-rose-950/60 active:scale-95'
                  }`}
                  title="Download selected soundscapes as a single ZIP archive"
                >
                  {isZipping ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-300 shrink-0" />
                  ) : (
                    <DownloadCloud className="w-4 h-4 text-rose-100 shrink-0" />
                  )}
                  <span className="truncate">
                    {isZipping
                      ? zipProgress || 'Creating ZIP...'
                      : selectedCount > 0
                      ? `Download ZIP (${selectedCount})`
                      : `Download All as ZIP (${filteredFavorites.length})`}
                  </span>
                </button>
              </div>

              {/* List of Filtered Favorites (Virtualized) */}
              <VirtualizedSoundscapeList
                items={filteredFavorites}
                favoriteIdsSet={favoriteIdsSet}
                isResultPlaying={isResultPlaying}
                encodingVideoId={encodingVideoId}
                toggleExpand={toggleExpand}
                toggleFavorite={toggleFavorite}
                handleDownload={handleDownload}
                onDownloadVideo={onDownloadVideo}
                handlePlayStateChange={handlePlayStateChange}
                onDelete={onDelete}
                onRerollTitle={onRerollTitle}
                selectedFavoriteIds={selectedFavoriteIds}
                onToggleSelect={toggleSelectFavorite}
                isFavoriteTab={true}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SoundscapeVault;


