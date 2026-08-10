import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Heart, ListMusic, CheckSquare, Square, Loader2, DownloadCloud } from 'lucide-react';
import SongResultCard from '../../components/SongResultCard';
import { SongResult } from '../../../types';
import { createAndDownloadSoundscapesZip } from '../../utils/zipUtils';

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
    if (selectedFavoriteIds.size === favoriteResults.length) {
      setSelectedFavoriteIds(new Set());
    } else {
      setSelectedFavoriteIds(new Set(favoriteResults.map((f) => f.id)));
    }
  };

  const handleDownloadSelectedZip = async () => {
    if (isZipping) return;

    // If none selected, default to all favorites
    const targetSongs = selectedFavoriteIds.size > 0
      ? favoriteResults.filter((f) => selectedFavoriteIds.has(f.id))
      : favoriteResults;

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

  const allFavoritesSelected = favoriteResults.length > 0 && selectedFavoriteIds.size === favoriteResults.length;
  const selectedCount = selectedFavoriteIds.size;

  return (
    <div className="bg-[#0a0c1a]/95 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 backdrop-blur-2xl min-h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-700/80 pb-3.5">
        <h2 className="font-extrabold text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-cyan-400" />
          Soundscape Vault
        </h2>

        <div className="flex bg-slate-950 p-1 rounded-full border border-slate-700 max-w-full overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveArchiveTab('my-music')}
            aria-label="View my generated soundscapes"
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[32px] ${
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
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[32px] ${
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

      {activeArchiveTab === 'my-music' && (
        <div
          ref={myMusicContainerRef}
          className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1"
        >
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
          ) : (
            genResults.map((result) => {
              const isFav = favoriteResults.some((f) => f.id === result.id);
              return (
                <SongResultCard
                  key={result.id}
                  result={{ ...result, isFavorite: isFav }}
                  isPlaying={isResultPlaying === result.id}
                  isEncoding={encodingVideoId === result.id}
                  onToggleExpand={toggleExpand}
                  onToggleFavorite={toggleFavorite}
                  onDownloadMP3={handleDownload}
                  onDownloadVideo={onDownloadVideo}
                  onPlayStateChange={handlePlayStateChange}
                  onDelete={onDelete}
                  onRerollTitle={onRerollTitle}
                />
              );
            })
          )}
        </div>
      )}

      {activeArchiveTab === 'favorites' && (
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col">
          {favoriteResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-16 border border-dashed border-white/10 rounded-3xl bg-black/20 flex-1">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                No Favorites Yet
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mt-2 leading-relaxed">
                Click the heart icon on any soundscape in "My Music" to pin it to your persistent favorites tab.
              </p>
            </div>
          ) : (
            <>
              {/* Batch Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 border border-rose-900/40 rounded-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllFavorites}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-extrabold border border-slate-700 transition-all cursor-pointer min-h-[36px]"
                  >
                    {allFavoritesSelected ? (
                      <CheckSquare className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    {allFavoritesSelected ? 'Deselect All' : 'Select All'}
                  </button>

                  <span className="text-xs font-mono text-rose-300 font-bold px-2 py-1 bg-rose-950/60 rounded-lg border border-rose-900/50">
                    {selectedCount > 0 ? `${selectedCount} of ${favoriteResults.length} selected` : `All (${favoriteResults.length})`}
                  </span>
                </div>

                <button
                  onClick={handleDownloadSelectedZip}
                  disabled={isZipping || favoriteResults.length === 0}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[36px] shadow-md ${
                    isZipping
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-rose-950/60 active:scale-95'
                  }`}
                  title="Download selected soundscapes as a single ZIP archive"
                >
                  {isZipping ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
                  ) : (
                    <DownloadCloud className="w-4 h-4 text-rose-100" />
                  )}
                  <span>
                    {isZipping
                      ? zipProgress || 'Creating ZIP...'
                      : selectedCount > 0
                      ? `Download ZIP (${selectedCount})`
                      : `Download All as ZIP (${favoriteResults.length})`}
                  </span>
                </button>
              </div>

              {/* List of Favorites */}
              <div className="space-y-3 flex-1">
                {favoriteResults.map((result) => {
                  const isSelected = selectedFavoriteIds.has(result.id);
                  return (
                    <SongResultCard
                      key={result.id}
                      result={{ ...result, isFavorite: true }}
                      isPlaying={isResultPlaying === result.id}
                      isEncoding={encodingVideoId === result.id}
                      onToggleExpand={toggleExpand}
                      onToggleFavorite={toggleFavorite}
                      onDownloadMP3={handleDownload}
                      onDownloadVideo={onDownloadVideo}
                      onPlayStateChange={handlePlayStateChange}
                      onDelete={onDelete}
                      onRerollTitle={onRerollTitle}
                      isSelected={isSelected}
                      onToggleSelect={toggleSelectFavorite}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

