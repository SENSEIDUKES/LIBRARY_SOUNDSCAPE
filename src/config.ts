/**
 * Configuration Module
 *
 * This file centralizes all configurable items for the Lyria Studio application.
 * It includes model identifiers for different generation tasks (music, text, image)
 * and application-level flags like maintenance mode.
 *
 * Use Cases:
 * - Changing the underlying GenAI models without hunting through component code.
 * - Toggling application-wide states (e.g., maintenance).
 */

export interface MusicModelOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  latency: string;
  fidelity: string;
  badge?: string;
  recommended?: boolean;
}

export const AVAILABLE_MUSIC_MODELS: MusicModelOption[] = [
  {
    id: "lyria-3-pro-preview",
    name: "Lyria 3 Pro",
    tagline: "Flagship High-Fidelity Cinematic Soundscape Engine",
    description: "Google DeepMind's flagship Lyria 3 Pro music generation model with advanced structural coherence, deep spatial acoustic resolution, and full track duration.",
    latency: "Standard (~2.2s)",
    fidelity: "24-bit / 48kHz Stereo",
    badge: "Pro",
    recommended: true,
  },
  {
    id: "lyria-3-clip-preview",
    name: "Lyria 3 Clip",
    tagline: "Low-Latency Rapid Prototype",
    description: "Optimized for short music clips up to 30 seconds, instant soundscape feedback, and rapid previewing.",
    latency: "Fast (~1.0s)",
    fidelity: "16-bit / 44.1kHz",
    badge: "Clip",
    recommended: false,
  },
];

export const CONFIG = {
  MODEL_ID_FULL: "lyria-3-pro-preview",
  IMAGE_MODEL: "gemini-3.1-flash-lite-image",
  TEXT_MODEL: "gemini-3.6-flash",
  IS_MAINTENANCE_MODE: false,
};

/**
 * Normalizes legacy or arbitrary model IDs to supported Google Lyria model identifiers.
 */
export function normalizeMusicModelId(modelId?: string): string {
  if (!modelId) return CONFIG.MODEL_ID_FULL;
  const trimmed = modelId.trim();
  if (trimmed.includes("clip")) {
    return "lyria-3-clip-preview";
  }
  return "lyria-3-pro-preview";
}

