import React from 'react';
import {
  Compass,
  Wind,
  Heart,
  Swords,
  ShieldAlert,
  Sparkles,
  Check,
  Tag,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ParentTag, ToneTag, EnergyTag, TensionTag, SoundscapeTags } from '../../types';

export interface QuickTaggingSystemProps {
  tags?: SoundscapeTags;
  onChange: (tags: SoundscapeTags) => void;
  className?: string;
  onClose?: () => void;
}

export const PARENT_TAGS: {
  id: ParentTag;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  activeBadge: string;
}[] = [
  {
    id: 'ADVENTURE',
    label: 'ADVENTURE',
    icon: Compass,
    activeClass:
      'bg-emerald-500/25 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950/60 font-black',
    activeBadge: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40',
  },
  {
    id: 'AMBIENT',
    label: 'AMBIENT',
    icon: Wind,
    activeClass:
      'bg-cyan-500/25 text-cyan-200 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-950/60 font-black',
    activeBadge: 'bg-cyan-500/30 text-cyan-300 border-cyan-400/40',
  },
  {
    id: 'EMOTIONS',
    label: 'EMOTIONS',
    icon: Heart,
    activeClass:
      'bg-rose-500/25 text-rose-200 border-rose-400 ring-2 ring-rose-400/50 shadow-md shadow-rose-950/60 font-black',
    activeBadge: 'bg-rose-500/30 text-rose-300 border-rose-400/40',
  },
  {
    id: 'FIGHTING',
    label: 'FIGHTING',
    icon: Swords,
    activeClass:
      'bg-orange-500/25 text-orange-200 border-orange-400 ring-2 ring-orange-400/50 shadow-md shadow-orange-950/60 font-black',
    activeBadge: 'bg-orange-500/30 text-orange-300 border-orange-400/40',
  },
  {
    id: 'WAR',
    label: 'WAR',
    icon: ShieldAlert,
    activeClass:
      'bg-red-600/30 text-red-200 border-red-400 ring-2 ring-red-400/50 shadow-md shadow-red-950/60 font-black',
    activeBadge: 'bg-red-500/30 text-red-300 border-red-400/40',
  },
  {
    id: 'SPECIAL',
    label: 'SPECIAL',
    icon: Sparkles,
    activeClass:
      'bg-amber-500/25 text-amber-200 border-amber-400 ring-2 ring-amber-400/50 shadow-md shadow-amber-950/60 font-black',
    activeBadge: 'bg-amber-500/30 text-amber-300 border-amber-400/40',
  },
];

export const TONE_OPTIONS: { id: ToneTag; label: string; activeClass: string }[] = [
  {
    id: 'Bright',
    label: 'Bright',
    activeClass:
      'bg-amber-500/30 text-amber-200 border-amber-400 ring-2 ring-amber-400/40 shadow-sm shadow-amber-950 font-black',
  },
  {
    id: 'Neutral',
    label: 'Neutral',
    activeClass:
      'bg-slate-600/40 text-slate-100 border-slate-400 ring-2 ring-slate-400/40 shadow-sm shadow-slate-950 font-black',
  },
  {
    id: 'Dark',
    label: 'Dark',
    activeClass:
      'bg-indigo-900/50 text-indigo-200 border-indigo-400 ring-2 ring-indigo-400/40 shadow-sm shadow-indigo-950 font-black',
  },
];

export const ENERGY_OPTIONS: { id: EnergyTag; label: string; activeClass: string }[] = [
  {
    id: 'Low',
    label: 'Low',
    activeClass:
      'bg-teal-600/30 text-teal-200 border-teal-400 ring-2 ring-teal-400/40 shadow-sm shadow-teal-950 font-black',
  },
  {
    id: 'Medium',
    label: 'Medium',
    activeClass:
      'bg-blue-600/30 text-blue-200 border-blue-400 ring-2 ring-blue-400/40 shadow-sm shadow-blue-950 font-black',
  },
  {
    id: 'High',
    label: 'High',
    activeClass:
      'bg-orange-600/30 text-orange-200 border-orange-400 ring-2 ring-orange-400/40 shadow-sm shadow-orange-950 font-black',
  },
];

export const TENSION_OPTIONS: { id: TensionTag; label: string; activeClass: string }[] = [
  {
    id: 'Calm',
    label: 'Calm',
    activeClass:
      'bg-emerald-600/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm shadow-emerald-950 font-black',
  },
  {
    id: 'Suspenseful',
    label: 'Suspenseful',
    activeClass:
      'bg-purple-600/30 text-purple-200 border-purple-400 ring-2 ring-purple-400/40 shadow-sm shadow-purple-950 font-black',
  },
  {
    id: 'Urgent',
    label: 'Urgent',
    activeClass:
      'bg-rose-600/30 text-rose-200 border-rose-400 ring-2 ring-rose-400/40 shadow-sm shadow-rose-950 font-black',
  },
];

export const QuickTaggingSystem: React.FC<QuickTaggingSystemProps> = ({
  tags,
  onChange,
  className = '',
  onClose,
}) => {
  const currentTags: SoundscapeTags = tags || {};
  const currentParent = currentTags.parent;
  const currentTone = currentTags.tone;
  const currentEnergy = currentTags.energy;
  const currentTension = currentTags.tension;

  const hasParent = Boolean(currentParent);

  // Parent selection handler: only 1 parent tag at a time.
  const handleSelectParent = (parentId: ParentTag) => {
    if (currentParent === parentId) {
      // Toggle off parent (and clears tags if parent removed)
      onChange({
        parent: undefined,
        tone: undefined,
        energy: undefined,
        tension: undefined,
      });
    } else {
      // Switch parent tag; keep same child options available under all six parents
      onChange({
        ...currentTags,
        parent: parentId,
      });
    }
  };

  // Child selection handlers: 1 choice per row, 3 max, optional initially
  const handleSelectTone = (tone: ToneTag) => {
    if (!hasParent) return;
    const nextTone = currentTone === tone ? undefined : tone;
    onChange({
      ...currentTags,
      tone: nextTone,
    });
  };

  const handleSelectEnergy = (energy: EnergyTag) => {
    if (!hasParent) return;
    const nextEnergy = currentEnergy === energy ? undefined : energy;
    onChange({
      ...currentTags,
      energy: nextEnergy,
    });
  };

  const handleSelectTension = (tension: TensionTag) => {
    if (!hasParent) return;
    const nextTension = currentTension === tension ? undefined : tension;
    onChange({
      ...currentTags,
      tension: nextTension,
    });
  };

  const handleClearAll = () => {
    onChange({
      parent: undefined,
      tone: undefined,
      energy: undefined,
      tension: undefined,
    });
  };

  const activeParentObj = PARENT_TAGS.find((p) => p.id === currentParent);
  const selectedChildrenCount = [currentTone, currentEnergy, currentTension].filter(Boolean).length;

  return (
    <div
      id="quick-tagging-system"
      className={`rounded-2xl bg-slate-950/90 border border-slate-700/80 p-3.5 sm:p-4 shadow-xl space-y-3.5 ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-white tracking-wide flex items-center gap-1.5">
              <span>Quick Tagging System</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                Parent + Child
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              1 Parent required • 3 Child attributes maximum (Tone, Energy, Tension)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(hasParent || selectedChildrenCount > 0) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-mono text-slate-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
              title="Reset all tags"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tagging panel"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Parent Tags Section (REQUIRED: ADVENTURE, AMBIENT, EMOTIONS, FIGHTING, WAR, SPECIAL) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <span className="text-amber-400">*</span> Parent Tag (Choose 1)
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {currentParent ? (
              <span className="text-amber-300 font-bold">Selected: {currentParent}</span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 inline" /> Required
              </span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
          {PARENT_TAGS.map((parent) => {
            const isSelected = currentParent === parent.id;
            const Icon = parent.icon;
            return (
              <button
                key={parent.id}
                id={`parent-tag-${parent.id.toLowerCase()}`}
                type="button"
                onClick={() => handleSelectParent(parent.id)}
                aria-pressed={isSelected}
                aria-label={`Select ${parent.label} parent tag`}
                className={`py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] border text-center ${
                  isSelected
                    ? parent.activeClass
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'scale-110' : 'opacity-75'}`} />
                <span className="font-bold truncate">{parent.label}</span>
                {isSelected && <Check className="w-3 h-3 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Child Tags Section (Split by categories: Tone, Energy, Tension; max 1 choice per row; optional initially) */}
      <div
        className={`space-y-2.5 pt-2 border-t border-slate-800 transition-opacity ${
          hasParent ? 'opacity-100' : 'opacity-50'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">
              Child Tags (Max 3 • 1 per row)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {selectedChildrenCount}/3 selected
            </span>
          </div>
          {!hasParent && (
            <span className="text-[10px] text-amber-300/90 italic flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Select a parent tag first
            </span>
          )}
        </div>

        {/* Row 1: Tone (Bright · Neutral · Dark) */}
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-cyan-300 text-xs">Tone</span>
              <span className="text-[10px] text-slate-400 italic">
                The overall emotional coloring
              </span>
            </div>
            <span className="text-[10px] font-mono">
              {currentTone ? (
                <span className="text-cyan-200 font-bold">{currentTone}</span>
              ) : (
                <span className="text-slate-500">Unknown</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {TONE_OPTIONS.map((opt) => {
              const isSelected = currentTone === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`tone-tag-${opt.id.toLowerCase()}`}
                  type="button"
                  disabled={!hasParent}
                  onClick={() => handleSelectTone(opt.id)}
                  aria-pressed={isSelected}
                  aria-label={`Tone: ${opt.label}`}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 min-h-[34px] ${
                    !hasParent
                      ? 'cursor-not-allowed bg-slate-900/40 text-slate-600 border-slate-800'
                      : isSelected
                      ? opt.activeClass
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Energy (Low · Medium · High) */}
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-blue-300 text-xs">Energy</span>
              <span className="text-[10px] text-slate-400 italic">
                How much intensity the track brings
              </span>
            </div>
            <span className="text-[10px] font-mono">
              {currentEnergy ? (
                <span className="text-blue-200 font-bold">{currentEnergy}</span>
              ) : (
                <span className="text-slate-500">Unknown</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {ENERGY_OPTIONS.map((opt) => {
              const isSelected = currentEnergy === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`energy-tag-${opt.id.toLowerCase()}`}
                  type="button"
                  disabled={!hasParent}
                  onClick={() => handleSelectEnergy(opt.id)}
                  aria-pressed={isSelected}
                  aria-label={`Energy: ${opt.label}`}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 min-h-[34px] ${
                    !hasParent
                      ? 'cursor-not-allowed bg-slate-900/40 text-slate-600 border-slate-800'
                      : isSelected
                      ? opt.activeClass
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Tension (Calm · Suspenseful · Urgent) */}
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-rose-300 text-xs">Tension</span>
              <span className="text-[10px] text-slate-400 italic">
                How much anticipation or pressure it creates
              </span>
            </div>
            <span className="text-[10px] font-mono">
              {currentTension ? (
                <span className="text-rose-200 font-bold">{currentTension}</span>
              ) : (
                <span className="text-slate-500">Unknown</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {TENSION_OPTIONS.map((opt) => {
              const isSelected = currentTension === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`tension-tag-${opt.id.toLowerCase()}`}
                  type="button"
                  disabled={!hasParent}
                  onClick={() => handleSelectTension(opt.id)}
                  aria-pressed={isSelected}
                  aria-label={`Tension: ${opt.label}`}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 min-h-[34px] ${
                    !hasParent
                      ? 'cursor-not-allowed bg-slate-900/40 text-slate-600 border-slate-800'
                      : isSelected
                      ? opt.activeClass
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Applied Tags Summary Pill */}
      {hasParent && (
        <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Applied:
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-black border font-mono ${
                activeParentObj?.activeBadge || 'bg-amber-500/30 text-amber-200 border-amber-400'
              }`}
            >
              {currentParent}
            </span>
            {currentTone && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                Tone: {currentTone}
              </span>
            )}
            {currentEnergy && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40">
                Energy: {currentEnergy}
              </span>
            )}
            {currentTension && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                Tension: {currentTension}
              </span>
            )}
            {!currentTone && !currentEnergy && !currentTension && (
              <span className="text-[10px] text-slate-500 italic">
                (Children: Unknown / Optional)
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[3]" /> Saved
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickTaggingSystem;
