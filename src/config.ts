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
    id: "lyria-3.5-pro-preview",
    name: "Lyria 3.5 Pro",
    tagline: "Flagship High-Fidelity Cinematic Soundscape Engine",
    description: "Google DeepMind's flagship Lyria 3.5 music generation model with advanced structural coherence, deep spatial acoustic resolution, and extended track duration.",
    latency: "Standard (~2.2s)",
    fidelity: "24-bit / 48kHz Stereo",
    badge: "Pro 3.5",
    recommended: true,
  },
  {
    id: "lyria-3.5",
    name: "Lyria 3.5",
    tagline: "Next-Gen Full-Length Song & Multimodal Synthesis",
    description: "Optimized for full-length structural songs, multimodal image-to-music generation, and expressive traditional/modern instrumentation.",
    latency: "Balanced (~1.8s)",
    fidelity: "24-bit / 44.1kHz Stereo",
    badge: "v3.5",
    recommended: false,
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
  MODEL_ID_FULL: "lyria-3.5-pro-preview",
  IMAGE_MODEL: "gemini-3.1-flash-lite-image",
  TEXT_MODEL: "gemini-3.6-flash",
  IS_MAINTENANCE_MODE: false,
};

