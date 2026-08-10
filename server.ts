import express from "express";
import path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Helper to initialize GenAI SDK
  function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Lyria Music Generation Route
  app.post("/api/gemini/lyria", async (req, res) => {
    try {
      const { prompt, modelId = "lyria-3-pro-preview" } = req.body;
      const ai = getGenAI();

      const responseStream = await ai.models.generateContentStream({
        model: modelId,
        contents: prompt,
        config: {
          responseModalities: [Modality.AUDIO],
        },
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

      if (!audioBase64) {
        const directResponse = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            responseModalities: [Modality.AUDIO],
          },
        });
        const parts = directResponse.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              audioBase64 = part.inlineData.data;
              if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
            }
            if (part.text && !lyrics) {
              lyrics = part.text;
            }
          }
        }
      }

      if (audioBase64) {
        res.json({ success: true, base64: audioBase64, mimeType, lyrics, metadata });
      } else {
        res.status(500).json({ success: false, error: "No audio data returned from Lyria model." });
      }
    } catch (err: any) {
      console.error("Error in /api/gemini/lyria:", err);
      res.status(500).json({ success: false, error: err?.message || "Failed to generate Lyria audio." });
    }
  });

  // Prompt Refinement Route
  app.post("/api/gemini/refine-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getGenAI();
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
        model: "gemini-3.6-flash",
        contents: instruction,
      });

      res.json({ success: true, refined: response.text?.trim() || prompt });
    } catch (err: any) {
      console.error("Error in /api/gemini/refine-prompt:", err);
      res.status(500).json({ success: false, error: err?.message || "Failed to refine prompt" });
    }
  });

  // Song Title Generation Route
  app.post("/api/gemini/generate-title", async (req, res) => {
    try {
      const { musicPrompt, lyricContext, culture } = req.body;
      const ai = getGenAI();
      const randomAngleSeed = Math.floor(Math.random() * 1000);
      const prompt = `Generate a unique, catchy, highly evocative song title (1 to 3 words max).
Music Context: "${musicPrompt}"
Narrative/Lyrics Snippet: "${(lyricContext || "").substring(0, 300)}"
Aesthetic Style: ${culture || "Asian/Wuxia Instrumental"}
Creative Random Seed: ${randomAngleSeed}

Requirements:
1. Do NOT use generic titles like "Celestial Soundscape", "Untitled Track", or "Lyria Composition".
2. Focus on vivid poetic imagery, nature, martial arts, or legendary themes.
3. Return ONLY the plain title string with no quotes, no numbering, and no intro text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.95,
        },
      });

      const generated = response.text?.trim().replace(/^["']|["']$/g, "");
      res.json({ success: true, title: generated });
    } catch (err: any) {
      console.error("Error in /api/gemini/generate-title:", err);
      res.status(500).json({ success: false, error: err?.message || "Failed to generate title" });
    }
  });

  // Vite middleware for dev / static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
