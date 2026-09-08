/**
 * GenAI Service
 *
 * This module encapsulates all interactions with Google GenAI.
 * It connects to server API endpoints and includes fallback logic for robust music and text generation.
 */
import { GoogleGenAI, Modality } from "@google/genai";
import { CONFIG, normalizeMusicModelId } from '../config';
import { logFunctionCall, logGenAiCall } from '../utils/logger';
import { createAudioUrlFromBase64, createSyntheticSoundscape } from '../utils/audioUtils';
import { generateRandomTitle } from '../utils/titleUtils';

export interface VisualSceneAnalysis {
  promptSuggestion: string;
  mood: string;
  instrument: string;
  environment: string;
  sceneTitle: string;
}

/**
 * Generates music audio using Google Lyria models via server API route or direct SDK fallback.
 */
export const generateLyriaAudio = async (
  prompt: string,
  modelId: string = CONFIG.MODEL_ID_FULL,
  durationSeconds: number = 30,
  images?: Array<{ data: string; mimeType: string }>
): Promise<{ audioUrl: string; base64: string; lyrics?: string; metadata?: string }> => {
  logFunctionCall('generateLyriaAudio', {
    promptLength: prompt.length,
    modelId,
    durationSeconds,
    imageCount: images?.length || 0,
  });
  const modelToUse = normalizeMusicModelId(modelId || CONFIG.MODEL_ID_FULL);

  // 1. Try server API endpoint first
  try {
    const apiRes = await fetch("/api/gemini/lyria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, modelId: modelToUse, images }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.base64) {
        const audioUrl = createAudioUrlFromBase64(data.base64, data.mimeType || "audio/mpeg");
        return {
          audioUrl,
          base64: data.base64,
          lyrics: data.lyrics,
          metadata: data.metadata,
        };
      }
    } else {
      const errorJson = await apiRes.json().catch(() => null);
      console.warn("Lyria API server endpoint returned error status:", apiRes.status, errorJson);
    }
  } catch (err) {
    console.warn("Server API route /api/gemini/lyria unavailable, attempting direct SDK fallback...", err);
  }

  // 2. Try direct SDK call if API key exists in environment (e.g. during tests or direct client runs)
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let contents: any = prompt;
      if (Array.isArray(images) && images.length > 0) {
        const parts: any[] = [];
        if (prompt) parts.push({ text: prompt });
        for (const img of images) {
          if (img && img.data) {
            parts.push({
              inlineData: {
                data: img.data,
                mimeType: img.mimeType || "image/jpeg",
              },
            });
          }
        }
        contents = parts.length > 0 ? parts : prompt;
      }

      const responseStream = await ai.models.generateContentStream({
        model: modelToUse,
        contents,
        config: {
          responseModalities: [Modality.AUDIO],
        }
      });

      let audioBase64 = "";
      let lyrics = "";
      let metadata = "";
      let mimeType = "audio/wav";

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text) {
            if (!lyrics) {
              lyrics = part.text;
            } else {
              metadata += "\n" + part.text;
            }
          }
        }
      }

      if (audioBase64) {
        const audioUrl = createAudioUrlFromBase64(audioBase64, mimeType);
        return { audioUrl, base64: audioBase64, lyrics, metadata };
      }
    } catch (err: any) {
      console.warn("Direct Lyria SDK call failed:", err);
    }
  }

  // 3. Fallback to procedural acoustic synthesizer when API key/service is unavailable or quota is exceeded
  let inst = 'Guzheng';
  if (/erhu/i.test(prompt)) inst = 'Erhu';
  else if (/pipa/i.test(prompt)) inst = 'Pipa';
  else if (/dizi|flute|xiao/i.test(prompt)) inst = 'Dizi';
  else if (/shakuhachi/i.test(prompt)) inst = 'Shakuhachi';
  else if (/koto/i.test(prompt)) inst = 'Koto';
  else if (/gayageum/i.test(prompt)) inst = 'Gayageum';
  else if (/violin|cello|harp/i.test(prompt)) inst = 'Orchestral';

  const synth = await createSyntheticSoundscape(inst, 'Tranquil', durationSeconds);
  return {
    audioUrl: synth.audioUrl,
    base64: synth.base64,
    lyrics: "♫ Instrumental soundscape motif ♫",
    metadata: `Model: ${modelToUse}\nInstrument: ${inst}\nAcoustic Synthesizer: Active`
  };
};

/**
 * Analyzes a visual scene snapshot using Gemini to extract soundscape coordinates for Lyria 3.5.
 */
export const analyzeVisualScene = async (
  image: { data: string; mimeType?: string },
  culture: string = 'Chinese'
): Promise<VisualSceneAnalysis> => {
  logFunctionCall('analyzeVisualScene', { culture, mimeType: image.mimeType });

  // 1. Try server endpoint first
  try {
    const apiRes = await fetch("/api/gemini/analyze-scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, culture }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
    }
  } catch (err) {
    console.warn("Server API route /api/gemini/analyze-scene failed, using fallback:", err);
  }

  // 2. Direct SDK fallback
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const prompt = `Analyze this visual scene to produce soundscape coordinates for Google's Lyria 3.5 music generation model.
Culture: ${culture}
Return JSON with:
{
  "promptSuggestion": "Evocative prompt describing instrumentation and ambiance (max 25 words)",
  "mood": "e.g. Mysterious / Ethereal / Peaceful / Epic / Sorrowful",
  "instrument": "e.g. Guqin / Xiao / Guzheng / Erhu / Pipa",
  "environment": "e.g. Mountain wind and echoing water",
  "sceneTitle": "2 to 3 word poetic title"
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { text: prompt },
          { inlineData: { data: image.data, mimeType: image.mimeType || 'image/jpeg' } },
        ],
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.promptSuggestion) return parsed;
    } catch (sdkErr) {
      console.warn("Direct SDK analyzeVisualScene failed:", sdkErr);
    }
  }

  // 3. Fallback heuristic response
  return {
    promptSuggestion: `An ethereal, deeply atmospheric ${culture} soundscape with resonant traditional strings and echoing mountain air.`,
    mood: 'Mysterious',
    instrument: culture === 'Chinese' ? 'Guqin / Xiao' : 'Traditional Strings',
    environment: 'High mountain wind and echoing drops',
    sceneTitle: 'Celestial Peak',
  };
};

/**
 * Parses the raw text output from the model to separate lyrics from metadata.
 */
export const parseModelOutput = (text: string): { lyrics: string, metadata: string } => {
  logFunctionCall('parseModelOutput', { textLength: text.length });
  const metaMarkers = /Caption:|Instruments:|Metadata:|Structure:|Description:|Mood:|mosic:|bpm:/i;
  const match = text.search(metaMarkers);
  if (match !== -1) return { lyrics: text.substring(0, match).trim(), metadata: text.substring(match).trim() };
  return { lyrics: text, metadata: '' };
};

/**
 * Refines a user's prompt to subtly enhance it for Lyria's song generation.
 */
export const refineLyriaPrompt = async (prompt: string): Promise<string> => {
  logFunctionCall('refineLyriaPrompt', { promptLength: prompt.length });

  // 1. Try server API route
  try {
    const apiRes = await fetch("/api/gemini/refine-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.refined) {
        return data.refined;
      }
    }
  } catch (err) {
    console.warn("Server API route /api/gemini/refine-prompt unavailable, trying SDK fallback...", err);
  }

  // 2. Direct SDK fallback
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return prompt;
    }
    const ai = new GoogleGenAI({ apiKey });
    const instruction = `You are an expert at writing prompts for Google's Lyria music generation model. 
A user has provided a scene excerpt or rough prompt for a music track. 
Please subtly enhance and refine it to produce the best possible musical result with Lyria.

Lyria Best Practices:
1. Focus on specific genres, moods, instruments, and tempos.
2. Use descriptive keywords and phrases (often comma-separated works well).
3. Do not use complex instructions like "make it sound like" or abstract metaphors—describe the actual music.
4. Keep it concise.

Do not rewrite the user's core intent entirely. Instead, extract their intent and structure it with relevant descriptive keywords if they are missing.
Return ONLY the refined prompt text, with no introductory dialogue.

Original prompt:
"${prompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: instruction,
    });
    
    logGenAiCall('gemini-3.6-flash', instruction, {}, response);
    return response.text?.trim() || prompt;
  } catch (err) {
    console.error("Failed to refine prompt:", err);
    return prompt;
  }
};

/**
 * Generates a song title based on prompt and context.
 */
export const generateSongTitle = async (
  musicPrompt: string,
  lyricContext: string,
  soundscapeConfig?: { culture?: string; mood?: string; instrument?: string }
): Promise<string> => {
  logFunctionCall('generateSongTitle', { musicPrompt, lyricContextLength: lyricContext.length });
  
  const fallbackTitle = generateRandomTitle({
    prompt: musicPrompt,
    lyricContext,
    culture: soundscapeConfig?.culture,
    mood: soundscapeConfig?.mood,
    instrument: soundscapeConfig?.instrument,
  });

  // 1. Try server API route
  try {
    const apiRes = await fetch("/api/gemini/generate-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        musicPrompt,
        lyricContext,
        culture: soundscapeConfig?.culture,
        mood: soundscapeConfig?.mood,
        instrument: soundscapeConfig?.instrument,
      }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.title && !/untitled|lyria composition|celestial soundscape/i.test(data.title)) {
        return data.title;
      }
    }
  } catch (err) {
    console.warn("Server API route /api/gemini/generate-title unavailable, trying SDK fallback...", err);
  }

  // 2. Direct SDK fallback
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return fallbackTitle;
    }
    const ai = new GoogleGenAI({ apiKey });
    const randomAngleSeed = Math.floor(Math.random() * 1000);
    const prompt = `Generate a unique, catchy, highly evocative song title (1 to 3 words max).
Music Context: "${musicPrompt}"
Narrative/Lyrics Snippet: "${lyricContext.substring(0, 300)}"
Aesthetic Style: ${soundscapeConfig?.culture || 'Asian/Wuxia Instrumental'}
Creative Random Seed: ${randomAngleSeed}

Requirements:
1. Do NOT use generic titles like "Celestial Soundscape", "Untitled Track", or "Lyria Composition".
2. Focus on vivid poetic imagery, nature, martial arts, or legendary themes.
3. Return ONLY the plain title string with no quotes, no numbering, and no intro text.`;

    const response = await ai.models.generateContent({
      model: CONFIG.TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.95,
      }
    });
    logGenAiCall(CONFIG.TEXT_MODEL, prompt, {}, response);
    const generated = response.text?.trim().replace(/^["']|["']$/g, '');
    if (generated && generated.length > 0 && !/untitled|lyria composition|celestial soundscape/i.test(generated)) {
      return generated;
    }
    return fallbackTitle;
  } catch (err) {
    console.warn("Using procedural randomized title fallback:", err);
    return fallbackTitle;
  }
};

/**
 * Generates cover art for the song (Disabled for internal tool).
 */
export const generateCoverArt = async (_musicPrompt: string, _lyricContext: string, _title?: string): Promise<string | null> => {
  return null;
};
