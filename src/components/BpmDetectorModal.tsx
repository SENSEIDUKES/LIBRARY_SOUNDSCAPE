import React, { useState, useEffect, useRef } from 'react';
import { Activity, Disc, Upload, X, RefreshCw, Radio, Zap, Music } from 'lucide-react';
import { detectBpmFromAudio, detectKeyFromAudio } from '../utils/audioUtils';
import { SongResult } from '../../types';
import { useBottomSheetGesture } from '../hooks/useBottomSheetGesture';

interface BpmDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks?: SongResult[];
  activeTrackId?: string | null;
}

export const BpmDetectorModal: React.FC<BpmDetectorModalProps> = ({
  isOpen,
  onClose,
  tracks = [],
  activeTrackId,
}) => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'taptempo'>('analyzer');
  
  // Audio File Analysis State
  const [selectedTrackId, setSelectedTrackId] = useState<string>(activeTrackId || (tracks[0]?.id || ''));
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    bpm: number | null;
    bpmConfidence: number;
    key: string | null;
    keyConfidence: number;
  } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tap Tempo State
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapBpm, setTapBpm] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const pulseTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (activeTrackId) {
      setSelectedTrackId(activeTrackId);
    }
  }, [activeTrackId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { dragStyle, dragHandleProps } = useBottomSheetGesture({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  // Run real analysis on selected track or file
  const handleAnalyzeTrack = async (track: SongResult) => {
    if (!track.audioUrl && !track.audioBase64) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const source = track.audioBase64 || track.audioUrl || '';
      const [bpmRes, keyRes] = await Promise.all([
        detectBpmFromAudio(source),
        detectKeyFromAudio(source),
      ]);
      setAnalysisResult({
        bpm: bpmRes?.bpm || null,
        bpmConfidence: bpmRes?.confidence || 0,
        key: keyRes?.key || null,
        keyConfidence: keyRes?.confidence || 0,
      });
    } catch (err) {
      console.error('Failed to analyze track:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const [bpmRes, keyRes] = await Promise.all([
        detectBpmFromAudio(file),
        detectKeyFromAudio(file),
      ]);
      setAnalysisResult({
        bpm: bpmRes?.bpm || null,
        bpmConfidence: bpmRes?.confidence || 0,
        key: keyRes?.key || null,
        keyConfidence: keyRes?.confidence || 0,
      });
    } catch (err) {
      console.error('Failed to analyze uploaded audio file:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Tap tempo handler
  const handleTap = () => {
    const now = performance.now();
    
    // Trigger visual pulse animation
    setIsPulsing(true);
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = setTimeout(() => setIsPulsing(false), 120);

    setTapTimes((prev) => {
      // If last tap was more than 3 seconds ago, reset taps
      if (prev.length > 0 && now - prev[prev.length - 1] > 3000) {
        return [now];
      }
      const updated = [...prev, now].slice(-12); // keep last 12 taps

      if (updated.length >= 2) {
        const intervals = [];
        for (let i = 1; i < updated.length; i++) {
          intervals.push(updated[i] - updated[i - 1]);
        }
        const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgIntervalMs);
        setTapBpm(calculatedBpm);
      }
      return updated;
    });
  };

  const handleResetTap = () => {
    setTapTimes([]);
    setTapBpm(null);
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bpm-detector-dialog-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={dragStyle}
        className="relative w-full sm:max-w-lg bg-[#0d0f22] border-t sm:border border-slate-700/80 rounded-t-[28px] sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 text-white max-h-[88vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar animate-bottom-sheet sm:animate-none touch-pan-y"
      >
        {/* Mobile Drag Handle */}
        <div
          {...dragHandleProps}
          className="sm:hidden flex flex-col items-center justify-center -mt-2 pb-1.5 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-slate-500/80 hover:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div
          {...dragHandleProps}
          className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 touch-none select-none sm:touch-auto gap-2"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 id="bpm-detector-dialog-title" className="text-sm sm:text-base font-extrabold tracking-tight truncate">Real BPM Detector</h3>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">Web Audio peak energy analysis & tap tempo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close BPM detector modal"
            className="p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 cursor-pointer min-w-[32px] min-h-[32px] shrink-0 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[36px] ${
              activeTab === 'analyzer'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-cyan-400" />
            Audio Analyzer
          </button>
          <button
            onClick={() => setActiveTab('taptempo')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[36px] ${
              activeTab === 'taptempo'
                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            Tap Tempo Engine
          </button>
        </div>

        {/* Tab 1: Web Audio Analyzer */}
        {activeTab === 'analyzer' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Select Track from Vault */}
            {tracks.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Generated Soundscape
                </label>
                <div className="flex flex-col xs:flex-row gap-2">
                  <select
                    value={selectedTrackId}
                    onChange={(e) => {
                      setSelectedTrackId(e.target.value);
                      setUploadedFileName(null);
                      setAnalysisResult(null);
                    }}
                    className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 cursor-pointer min-h-[42px]"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title || 'Untitled Soundscape'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedTrack && handleAnalyzeTrack(selectedTrack)}
                    disabled={analyzing || !selectedTrack}
                    className="w-full xs:w-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5 min-h-[42px] shrink-0"
                  >
                    {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Analyze
                  </button>
                </div>
              </div>
            )}

            {/* File Upload Drop Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Or Upload Any Audio File (MP3 / WAV)
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 bg-slate-950/80 hover:bg-slate-900 border-2 border-dashed border-slate-700 hover:border-cyan-400/60 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-slate-300 transition-all cursor-pointer"
              >
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold">
                  {uploadedFileName ? uploadedFileName : 'Click to select or drop audio file'}
                </span>
                <span className="text-[10px] text-slate-500">Supports WAV, MP3, OGG, AAC</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
            </div>

            {/* Analysis Result Display */}
            {analyzing && (
              <div className="bg-slate-950/90 p-6 rounded-2xl border border-cyan-500/40 text-center space-y-2 animate-pulse">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                  Analyzing Audio Waveform, Tempo & Pitch Class Profiles...
                </p>
                <p className="text-[11px] text-slate-400">Performing Web Audio spectral peak extraction & chromagram harmonic analysis</p>
              </div>
            )}

            {analysisResult && !analyzing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in zoom-in-95 duration-150">
                {/* BPM Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-400/50 space-y-1.5 text-center shadow-lg">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    Real Detected Tempo
                  </div>
                  <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight flex items-center justify-center gap-1.5">
                    <span>{analysisResult.bpm ? analysisResult.bpm : 'N/A'}</span>
                    <span className="text-xs font-bold text-slate-400">BPM</span>
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-[10px] font-mono font-bold text-cyan-300">
                    Confidence: {analysisResult.bpmConfidence}%
                  </div>
                </div>

                {/* Key Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/50 space-y-1.5 text-center shadow-lg">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    <Music className="w-3 h-3 text-amber-400" />
                    Real Detected Key
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-300 tracking-tight flex items-center justify-center h-9">
                    <span>{analysisResult.key ? analysisResult.key : 'Undetected'}</span>
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-300">
                    Confidence: {analysisResult.keyConfidence}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Tap Tempo */}
        {activeTab === 'taptempo' && (
          <div className="space-y-4 text-center animate-in fade-in duration-150">
            <p className="text-xs text-slate-300 font-medium">
              Tap the button or press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono text-cyan-300">Spacebar</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono text-cyan-300">T</kbd> to the beat of any music track.
            </p>

            {/* Tap Display */}
            <div
              onClick={handleTap}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.code === 'Space' || e.code === 'KeyT') {
                  e.preventDefault();
                  handleTap();
                }
              }}
              className={`w-full py-10 rounded-3xl border-2 transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 outline-none ${
                isPulsing
                  ? 'bg-rose-500/30 border-rose-400 scale-[0.98] shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950/90 hover:bg-slate-900 border-slate-700 hover:border-rose-400/60'
              }`}
            >
              <div className="text-5xl font-black font-mono tracking-tight text-white">
                {tapBpm ? `${tapBpm}` : 'TAP'}
              </div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-rose-300">
                {tapBpm ? 'BPM' : 'Click or Press Space'}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {tapTimes.length > 0 ? `${tapTimes.length} Taps Recorded` : 'Ready to tap'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <button
                onClick={handleResetTap}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer font-medium"
              >
                Reset Taps
              </button>
              {tapBpm && (
                <div className="text-xs text-rose-300 font-bold font-mono">
                  Interval: {Math.round(60000 / tapBpm)}ms
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BpmDetectorModal;
