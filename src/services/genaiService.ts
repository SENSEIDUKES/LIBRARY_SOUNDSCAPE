/**
 * GenAI Service
 *
 * This module encapsulates all interactions with the Google GenAI SDK.
 * It provides functions for generating song titles, cover art, and the actual audio tracks.
 *
 * Use Cases:
 * - Requesting a short, evocative title based on music prompts and lyrics.
 * - Generating square cover art images based on the song's atmosphere.
 * - Streaming audio generation from the Lyria models.
 */
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CONFIG } from '../config';
import { logFunctionCall, logGenAiCall } from '../utils/logger';


/**
 * Parses the raw text output from the model to separate lyrics from metadata.
 * @param text The raw text output from the model.
 * @returns An object containing the separated lyrics and metadata.
 */
export const parseModelOutput = (text: string): { lyrics: string, metadata: string } => {
  logFunctionCall('parseModelOutput', { textLength: text.length });
  const metaMarkers = /Caption:|Instruments:|Metadata:|Structure:|Description:|Mood:|mosic:|bpm:/i;
  const match = text.search(metaMarkers);
  if (match !== -1) return { lyrics: text.substring(0, match).trim(), metadata: text.substring(match).trim() };
  return { lyrics: text, metadata: '' };
};

/**
 * Generates a song title based on the prompt and lyrics.
 * @param musicPrompt The original prompt used to generate the music.
 * @param lyricContext A snippet of the generated lyrics.
 * @returns A promise that resolves to the generated title string.
 */
export const generateSongTitle = async (musicPrompt: string, lyricContext: string): Promise<string> => {
  logFunctionCall('generateSongTitle', { musicPrompt, lyricContextLength: lyricContext.length });
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Based on this music prompt: "${musicPrompt}" and these lyrics: "${lyricContext.substring(0, 500)}", generate a catchy, evocative, short song title (3 words max). Return ONLY the title string, no quotes or extra text.`;
    const response = await ai.models.generateContent({
      model: CONFIG.TEXT_MODEL,
      contents: prompt,
    });
    logGenAiCall(CONFIG.TEXT_MODEL, prompt, {}, response);
    return response.text?.trim() || "Untitled Track";
  } catch (err) {
    console.error("Failed to generate title:", err);
    return "Lyria Composition";
  }
};

/**
 * Generates cover art for the song.
 * @param musicPrompt The original prompt used to generate the music.
 * @param lyricContext A snippet of the generated lyrics.
 * @param title The generated title of the song.
 * @returns A promise that resolves to a base64 encoded image string, or null if generation fails.
 */
export const generateCoverArt = async (musicPrompt: string, lyricContext: string, title?: string): Promise<string | null> => {
  logFunctionCall('generateCoverArt', { musicPrompt, lyricContextLength: lyricContext.length, title });
  const imagePrompt = `A high-quality, professional square song cover for a music track titled "${title || 'Music'}". Atmosphere: ${musicPrompt}. Context: ${ lyricContext.substring(0, 200) }. Abstract, cinematic aesthetic. IMPORTANT: Ignore any mention of BPM or musical scale in the prompt; do NOT print any numbers, BPM, or scale text on the image.`;
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }
    const imgGenAi = new GoogleGenAI({ apiKey });
    const config = { imageConfig: { aspectRatio: "1:1" } };
    const contents = { parts: [{ text: imagePrompt }] };
    const imageResponse = await imgGenAi.models.generateContent({
      model: CONFIG.IMAGE_MODEL,
      contents,
      config
    });
    logGenAiCall(CONFIG.IMAGE_MODEL, contents, config, imageResponse);

    let base64Image = null;
    if (imageResponse.candidates?.[0]?.content?.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return base64Image;
  } catch (imgErr) {
    console.error("Visual synthesis skipped.", imgErr);
    return null;
  }
};
