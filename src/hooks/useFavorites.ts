import React, { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import { SongResult, GenerationState } from '../../types';
import { createAudioUrlFromBase64 } from '../utils/audioUtils';

export function useFavorites(genResults: SongResult[]) {
  const [favoriteResults, setFavoriteResults] = useState<SongResult[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    localforage.getItem<SongResult[]>('sen_favorite_soundscapes').then((saved) => {
      if (saved && Array.isArray(saved)) {
        const rehydrated = saved.map(r => {
          const item = { ...r, isExpanded: false };
          if (r.audioBase64 && (!r.audioUrl || String(r.audioUrl).startsWith('blob:'))) {
             return { ...item, audioUrl: createAudioUrlFromBase64(r.audioBase64, 'audio/wav') };
          }
          return item;
        });
        setFavoriteResults(rehydrated);
      }
      isInitialized.current = true;
    }).catch(err => {
      console.error('Failed to load favorites from localforage', err);
      isInitialized.current = true;
    });
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      localforage.setItem('sen_favorite_soundscapes', favoriteResults).catch(err => {
        console.error('Failed to sync favorites to localforage:', err);
      });
    }
  }, [favoriteResults]);

  // Keep favoriteResults in sync when genResults updates (e.g. status/audio/logs change)
  useEffect(() => {
    if (favoriteResults.length > 0 && genResults.length > 0) {
      setFavoriteResults((prev) =>
        prev.map((fav) => {
          const updated = genResults.find((r) => r.id === fav.id);
          return updated ? { ...updated, isFavorite: true } : fav;
        })
      );
    }
  }, [genResults]);

  const toggleFavorite = (id: string, setGen: React.Dispatch<React.SetStateAction<GenerationState>>) => {
    const isFav = favoriteResults.some((r) => r.id === id);

    if (isFav) {
      setFavoriteResults((prev) => prev.filter((r) => r.id !== id));
    } else {
      const targetItem =
        genResults.find((r) => r.id === id) || favoriteResults.find((r) => r.id === id);
      if (targetItem) {
        setFavoriteResults((prev) => [...prev, { ...targetItem, isFavorite: true }]);
      }
    }

    setGen((prev) => ({
      ...prev,
      results: prev.results.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      ),
    }));
  };

  const removeFavorite = (id: string) => {
    setFavoriteResults((prev) => prev.filter((r) => r.id !== id));
  };

  return { favoriteResults, toggleFavorite, removeFavorite };
}
