import React from 'react';
import { X, Cpu, Sliders, Zap, Sparkles, Key, RotateCcw, Check } from 'lucide-react';
import { AVAILABLE_MUSIC_MODELS, MusicModelOption } from '../config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  temperature: number;
  onTemperatureChange: (val: number) => void;
  sampleRate: '24kHz' | '48kHz';
  onSampleRateChange: (rate: '24kHz' | '48kHz') => void;
  totalTokens: number;
  estimatedCost: string;
  onResetTokens: () => void;
  onOpenApiKeySettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  temperature,
  onTemperatureChange,
  sampleRate,
  onSampleRateChange,
  totalTokens,
  estimatedCost,
  onResetTokens,
  onOpenApiKeySettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#090a15] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/25 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 id="settings-dialog-title" className="text-base font-extrabold text-white tracking-tight">
                Settings & Model Routing
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Route Gemini audio synthesis models & tune acoustic parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-600"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Section 1: Music Generation Models */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Music Model Routing
              </label>
              <span className="text-xs text-slate-300 font-mono font-semibold">
                Active: <span className="text-white font-extrabold">{selectedModel}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_MUSIC_MODELS.map((model: MusicModelOption) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => onSelectModel(model.id)}
                    aria-label={`Select ${model.name} music model`}
                    aria-pressed={isSelected}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 text-left w-full ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{model.name}</span>
                        {model.badge && (
                          <span
                            className={`px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase rounded-full border ${
                              model.badge === 'Pro'
                                ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50'
                                : model.badge === 'Fast'
                                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                                : 'bg-purple-500/30 text-purple-200 border-purple-400/50'
                            }`}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300 font-mono font-semibold">{model.latency}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                              : 'border-slate-500 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{model.description}</p>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-slate-700/60 font-semibold">
                      <span>Tagline: {model.tagline}</span>
                      <span className="text-cyan-300 font-bold">{model.fidelity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Synthesis Parameters */}
          <section className="space-y-4 pt-2 border-t border-slate-700/80">
            <label className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Synthesis Parameters
            </label>

            {/* Temperature / Creativity Slider */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-100">Acoustic Temperature / Creativity</span>
                <span className="font-mono text-cyan-300 font-extrabold bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-400/40">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                aria-label="Acoustic temperature and creativity slider"
                className="w-full h-2 bg-slate-800 border border-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-slate-300 font-mono font-medium">
                <span>Deterministic (0.2)</span>
                <span>Balanced (0.7)</span>
                <span>Experimental (1.0)</span>
              </div>
            </div>

            {/* Audio Sample Rate / Quality */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-100">Audio Sample Rate & Resolution</span>
                <span className="font-mono text-cyan-300 font-extrabold bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-400/40">{sampleRate}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSampleRateChange('24kHz')}
                  aria-label="Select 24kHz CD Quality sample rate"
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border min-h-[40px] ${
                    sampleRate === '24kHz'
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  24kHz CD Quality
                </button>
                <button
                  type="button"
                  onClick={() => onSampleRateChange('48kHz')}
                  aria-label="Select 48kHz Studio Spatial sample rate"
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border min-h-[40px] ${
                    sampleRate === '48kHz'
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  48kHz Studio Spatial
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Token Usage & Cost */}
          <section className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-white">
                  {totalTokens.toLocaleString()} tokens consumed
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Est. Session Cost: <span className="text-cyan-300 font-extrabold">${estimatedCost}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onResetTokens}
              aria-label="Reset session token counters"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-600 min-h-[36px]"
              title="Reset session token counters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" /> Reset
            </button>
          </section>

          {/* Section 4: API Keys */}
          <section className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-white">Gemini API Environment</div>
                <div className="text-xs text-slate-300 font-medium">Configure API keys in AI Studio settings</div>
              </div>
            </div>
            <button
              onClick={onOpenApiKeySettings}
              aria-label="Configure Gemini API keys"
              className="px-3.5 py-2 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/50 text-xs font-extrabold transition-all cursor-pointer min-h-[36px]"
            >
              Configure Keys
            </button>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-700/80 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            aria-label="Save settings and close dialog"
            className="px-6 py-2.5 rounded-full bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/60 text-xs font-extrabold transition-all cursor-pointer shadow-md min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
