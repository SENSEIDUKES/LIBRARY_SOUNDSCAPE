import React, { useRef, useState } from 'react';
import { Camera, X, Sparkles, Image as ImageIcon, Check, Loader2, UploadCloud } from 'lucide-react';
import { analyzeVisualScene, VisualSceneAnalysis } from '../services/genaiService';

export interface VisualImage {
  data: string;
  mimeType: string;
  previewUrl: string;
  name?: string;
}

export interface ScenePreset {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mood: string;
  instrument: string;
  environment: string;
  culture: string;
  svgDataUri: string;
}

export const SCENE_SNAPSHOT_PRESETS: ScenePreset[] = [
  {
    id: 'mystical-mountains',
    title: 'Mystical Peaks',
    subtitle: 'Misty Cliffs & Qi Ocean',
    description: 'Towering Xianxia mountain peaks shrouded in ethereal morning mist, ancient pine trees clinging to cliffs, cold crystalline river flowing below.',
    mood: 'Mysterious & Ethereal',
    instrument: 'Guqin / Xiao',
    environment: 'High mountain wind and echoing drops',
    culture: 'Chinese',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230b1026"/><stop offset="60%" stop-color="%231a294d"/><stop offset="100%" stop-color="%2338577a"/></linearGradient><linearGradient id="peak1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230e172e"/><stop offset="100%" stop-color="%23050814"/></linearGradient><linearGradient id="peak2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23223559"/><stop offset="100%" stop-color="%230c1424"/></linearGradient><linearGradient id="fog" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.35"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></linearGradient></defs><rect width="240" height="160" fill="url(%23sky)"/><circle cx="180" cy="45" r="22" fill="%23e8f4fc" opacity="0.85"/><polygon points="20,160 80,45 130,160" fill="url(%23peak2)"/><polygon points="90,160 160,25 220,160" fill="url(%23peak1)"/><polygon points="-10,160 40,85 90,160" fill="url(%23peak1)"/><ellipse cx="120" cy="115" rx="140" ry="25" fill="url(%23fog)"/><ellipse cx="70" cy="140" rx="90" ry="20" fill="url(%23fog)"/><path d="M140,80 Q145,70 155,75 T165,70" stroke="%2338bdf8" stroke-width="1.5" fill="none" opacity="0.6"/></svg>`,
  },
  {
    id: 'bamboo-sanctuary',
    title: 'Rainy Bamboo',
    subtitle: 'Quiet Droplets & Moss',
    description: 'Deep rain-washed jade bamboo grove with gentle rain droplets falling on mossy stone lanterns and winding stream.',
    mood: 'Peaceful & Meditative',
    instrument: 'Guzheng / Dizi',
    environment: 'Gentle rainfall through dense bamboo',
    culture: 'Chinese',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160"><defs><linearGradient id="bsky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23061715"/><stop offset="100%" stop-color="%2313382c"/></linearGradient></defs><rect width="240" height="160" fill="url(%23bsky)"/><line x1="30" y1="0" x2="30" y2="160" stroke="%2310b981" stroke-width="6" opacity="0.7"/><line x1="70" y1="0" x2="70" y2="160" stroke="%23059669" stroke-width="8" opacity="0.8"/><line x1="120" y1="0" x2="120" y2="160" stroke="%2334d399" stroke-width="5" opacity="0.6"/><line x1="170" y1="0" x2="170" y2="160" stroke="%23047857" stroke-width="9" opacity="0.85"/><line x1="210" y1="0" x2="210" y2="160" stroke="%2310b981" stroke-width="6" opacity="0.7"/><line x1="15" y1="10" x2="20" y2="35" stroke="%236ee7b7" stroke-width="1" opacity="0.5"/><line x1="85" y1="40" x2="90" y2="65" stroke="%236ee7b7" stroke-width="1" opacity="0.5"/><line x1="145" y1="20" x2="150" y2="45" stroke="%236ee7b7" stroke-width="1" opacity="0.5"/><line x1="190" y1="70" x2="195" y2="95" stroke="%236ee7b7" stroke-width="1" opacity="0.5"/></svg>`,
  },
  {
    id: 'thunder-tribulation',
    title: 'Thunder Pass',
    subtitle: 'Celestial Lightning Arc',
    description: 'Violent purple storm clouds crackling with heavenly lightning bolts over a dangerous martial peak during heavenly ascension.',
    mood: 'Epic & Tense',
    instrument: 'Suona / Tanggu War Drums',
    environment: 'Deafening thunder clatter and gale',
    culture: 'Chinese',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160"><defs><linearGradient id="tskylight" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231a0826"/><stop offset="70%" stop-color="%233b1154"/><stop offset="100%" stop-color="%23100319"/></linearGradient></defs><rect width="240" height="160" fill="url(%23tskylight)"/><polygon points="0,160 70,80 140,160" fill="%231e082b"/><polygon points="90,160 170,50 240,160" fill="%230a0210"/><path d="M120,0 L105,45 L130,50 L95,110 L115,112 L75,155" stroke="%23f472b6" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M120,0 L105,45 L130,50 L95,110 L115,112 L75,155" stroke="%23ffffff" stroke-width="1.2" fill="none" stroke-linejoin="round"/></svg>`,
  },
  {
    id: 'moonlit-lotus',
    title: 'Moonlit Lotus',
    subtitle: 'Tranquil Reflective Lake',
    description: 'Nocturnal celestial lake illuminated by a radiant full moon, blooming lotus blossoms floating peacefully with golden bioluminescence.',
    mood: 'Serene & Romantic',
    instrument: 'Erhu / Pipa',
    environment: 'Soft water ripples and night crickets',
    culture: 'Chinese',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160"><defs><linearGradient id="nlake" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23050b1a"/><stop offset="50%" stop-color="%230d1e3d"/><stop offset="100%" stop-color="%2308142a"/></linearGradient></defs><rect width="240" height="160" fill="url(%23nlake)"/><circle cx="190" cy="40" r="20" fill="%23fef08a" opacity="0.9"/><circle cx="190" cy="40" r="30" fill="%23fef08a" opacity="0.15"/><ellipse cx="190" cy="120" rx="25" ry="4" fill="%23fef08a" opacity="0.3"/><ellipse cx="60" cy="125" rx="22" ry="7" fill="%23065f46"/><circle cx="60" cy="118" r="6" fill="%23f43f5e"/><ellipse cx="140" cy="135" rx="28" ry="8" fill="%23047857"/><circle cx="140" cy="127" r="8" fill="%23fb7185"/></svg>`,
  },
  {
    id: 'snowy-pass',
    title: 'Snow Temple',
    subtitle: 'Frigid Mountain Gale',
    description: 'Vast glacial mountain plateau with heavy falling snow, howling blizzard winds, and an ancient solitary pagoda bell tower.',
    mood: 'Sorrowful & Vast',
    instrument: 'Shakuhachi / Erhu',
    environment: 'Howling blizzard and distant temple bell',
    culture: 'Chinese',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160"><defs><linearGradient id="snowsky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="60%" stop-color="%23475569"/><stop offset="100%" stop-color="%2394a3b8"/></linearGradient></defs><rect width="240" height="160" fill="url(%23snowsky)"/><polygon points="0,160 80,60 180,160" fill="%23cbd5e1"/><polygon points="70,160 160,40 240,160" fill="%23f8fafc"/><rect x="155" y="65" width="20" height="25" fill="%230f172a"/><polygon points="145,65 165,45 185,65" fill="%23b91c1c"/><circle cx="40" cy="30" r="2" fill="%23ffffff"/><circle cx="120" cy="50" r="2.5" fill="%23ffffff"/><circle cx="200" cy="35" r="1.8" fill="%23ffffff"/><circle cx="90" cy="90" r="2.2" fill="%23ffffff"/><circle cx="170" cy="110" r="2" fill="%23ffffff"/></svg>`,
  },
];

interface VisualScenePickerProps {
  selectedImages: VisualImage[];
  setSelectedImages: React.Dispatch<React.SetStateAction<VisualImage[]>>;
  onApplySceneCoordinates?: (coords: {
    promptText: string;
    mood: string;
    instrument: string;
    environment: string;
    culture?: string;
  }) => void;
  culture?: string;
}

export const VisualScenePicker: React.FC<VisualScenePickerProps> = ({
  selectedImages,
  setSelectedImages,
  onApplySceneCoordinates,
  culture = 'Chinese',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisualSceneAnalysis | null>(null);

  const handleFiles = (files: File[]) => {
    files.forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1];
        setSelectedImages((prev) => [
          ...prev,
          {
            data: base64Data,
            mimeType: file.type,
            previewUrl: resultStr,
            name: file.name,
          },
        ]);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    handleFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setAnalysisResult(null);
  };

  const handleSelectPreset = (preset: ScenePreset) => {
    // Extract base64 from svg data URI
    const svgContent = preset.svgDataUri.replace('data:image/svg+xml;utf8,', '');
    const base64Data = btoa(unescape(encodeURIComponent(svgContent)));
    const imageItem: VisualImage = {
      data: base64Data,
      mimeType: 'image/svg+xml',
      previewUrl: preset.svgDataUri,
      name: preset.title,
    };

    setSelectedImages([imageItem]);
    setAnalysisResult(null);

    if (onApplySceneCoordinates) {
      onApplySceneCoordinates({
        promptText: `${preset.title}: ${preset.description}`,
        mood: preset.mood,
        instrument: preset.instrument,
        environment: preset.environment,
        culture: preset.culture,
      });
    }
  };

  const handleAnalyzeActiveImage = async () => {
    if (selectedImages.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const activeImg = selectedImages[0];
      const analysis = await analyzeVisualScene(
        { data: activeImg.data, mimeType: activeImg.mimeType },
        culture
      );
      setAnalysisResult(analysis);
      if (onApplySceneCoordinates && analysis.promptSuggestion) {
        onApplySceneCoordinates({
          promptText: analysis.promptSuggestion,
          mood: analysis.mood,
          instrument: analysis.instrument,
          environment: analysis.environment,
          culture,
        });
      }
    } catch (err) {
      console.error('Failed to analyze scene:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Header with Multimodal Lyria 3.5 Indicator */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 truncate">
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Multimodal Scene Input (Lyria 3.5)</span>
        </label>
        <span className="text-[10px] text-cyan-400/90 font-mono font-bold bg-cyan-950/70 border border-cyan-400/40 px-2 py-0.5 rounded-md shrink-0">
          Image-to-Music
        </span>
      </div>

      {/* Preset Snapshot Carousel */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-300 font-semibold block">
          One-Tap Scene Snapshots
        </span>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {SCENE_SNAPSHOT_PRESETS.map((preset) => {
            const isSelected = selectedImages.some((img) => img.name === preset.title);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                aria-label={`Select ${preset.title} scene preset`}
                className={`group relative rounded-xl overflow-hidden border p-1.5 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/60'
                    : 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="h-11 w-full rounded-lg overflow-hidden relative bg-black/40 border border-slate-700/60">
                  <img
                    src={preset.svgDataUri}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  <div className="text-[11px] font-extrabold text-white truncate leading-tight">
                    {preset.title}
                  </div>
                  <div className="text-[9px] text-cyan-300/80 truncate font-mono">
                    {preset.instrument.split('/')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 min-h-[96px] ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-400/50 scale-[0.99]'
            : 'border-slate-700/90 bg-slate-950/70 hover:bg-slate-900/80 hover:border-slate-500'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload custom scene image via click or drag-and-drop"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-sm">
          {isDragging ? <UploadCloud className="w-5 h-5 animate-bounce" /> : <Camera className="w-5 h-5" />}
        </div>
        <div className="px-1 text-center">
          <p className="text-xs font-extrabold text-white tracking-tight break-words">
            Drop photo or tap to upload mystical mountains & chapter scenes
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5 break-words">
            PNG, JPG, or WEBP. Directs Lyria 3.5's acoustic timbre & ambient textures.
          </p>
        </div>
      </div>

      {/* Active Visual Anchor Thumbnails & Controls */}
      {selectedImages.length > 0 && (
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-2.5 shadow-md">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Active Visual Anchor ({selectedImages.length})
            </span>
            <button
              type="button"
              onClick={handleAnalyzeActiveImage}
              disabled={isAnalyzing}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40 shrink-0 min-h-[36px]"
              aria-label="Analyze active image with Gemini to auto-tune soundscape coordinates"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
              ) : (
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              )}
              <span>
                <span className="hidden xs:inline">{isAnalyzing ? 'Analyzing Scene...' : 'Auto-Tune from Image'}</span>
                <span className="xs:hidden">{isAnalyzing ? 'Analyzing...' : 'Auto-Tune'}</span>
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {selectedImages.map((img, index) => (
              <div
                key={index}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-600 bg-black/60 shadow group"
              >
                <img
                  src={img.previewUrl}
                  alt={img.name || `Scene reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  aria-label={`Remove image ${index + 1}`}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                {img.name && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 px-1 py-0.5 text-[9px] text-white truncate font-medium text-center">
                    {img.name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* If Scene Analysis was executed */}
          {analysisResult && (
            <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-400/40 text-xs space-y-1 animate-in fade-in">
              <div className="flex justify-between items-center text-cyan-200 font-extrabold text-[11px]">
                <span>Visual Atmosphere Detected:</span>
                <span className="font-mono text-cyan-300">{analysisResult.mood}</span>
              </div>
              <p className="text-[11px] text-slate-200 font-serif italic">
                "{analysisResult.promptSuggestion}"
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono pt-1 border-t border-cyan-800/50">
                <span>Inst: {analysisResult.instrument}</span>
                <span>Env: {analysisResult.environment}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
