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

export const CONFIG = {
  MODEL_ID_FULL: "lyria-3-pro-preview",
  IMAGE_MODEL: "gemini-2.5-flash-image",
  TEXT_MODEL: "gemini-3-flash-preview",
  IS_MAINTENANCE_MODE: false,
};
