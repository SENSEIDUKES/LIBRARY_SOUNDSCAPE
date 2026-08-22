<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# SEN Lyria Studio & Soundscape Vault

An East Asian traditional soundscape generator powered by Google Gemini and Lyria AI music synthesis.

## Features

- **Full-Stack Gemini & Lyria Engine**: Secure Express backend server proxying `@google/genai` API requests (`/api/gemini/lyria`, `/api/gemini/refine-prompt`, `/api/gemini/generate-title`), preventing client-side key exposure and providing reliable model streaming (`lyria-3-pro-preview`, `lyria-3-clip-preview`, `gemini-3.6-flash`).
- **Dynamic Song Title Randomization**: Contextual, culturally-tuned song title generation engine ensuring unique 2-3 word titles and preventing duplicate outputs. Includes a one-click title reroll button (`🎲`) on every track card.
- **Shortened Download Filenames**: Clean, compact download string formatting (`Title_X7B.mp3`) replacing long messy filenames for single MP3 downloads and batch ZIP exports.
- **Cultural Song Differentiation**: Automatic visual theme distinction with distinct color palettes:
  - 🟦 **Chinese**: Deep sapphire blue
  - 🟩 **Japanese**: Emerald green
  - 🟥 **Korean**: Crimson rose red
  - 🟪 **Western**: Mystical purple
- **Real Web Audio BPM Detector**: Onset energy peak analysis for generated audio tracks and uploaded MP3/WAV files, plus an interactive tap tempo engine.
- **Batch ZIP Export**: Select multiple favorite soundscapes in the Soundscape Vault and export them as a unified ZIP archive containing audio files, lyrics, and metadata summaries.
- **Chapter Text Parser & Prompt Builder**: Extract Xianxia, Wuxia, and traditional East Asian narrative themes into high-fidelity music prompts.
- **Playback Progress Bar & Scrubbing**: Lightweight interactive audio scrubber bar integrated into both the persistent floating player dock and individual soundscape cards. Includes touch/mouse drag scrubbing, hover timestamp preview tooltips, quick skip backward/forward controls (`-5s` / `+5s`), buffer progress tracking, and cultural theme matching.
- **Soundscape Vault & Continuous Audio Playback**: Local persistent storage with rehydrated audio playback, single-stream playback enforcement across DOM and Web Audio synthesizers, persistent playback controls in collapsed and expanded states, and unified favorites management.

## Run Locally

**Prerequisites:** Node.js v18+

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local`
3. Run dev server:
   `npm run dev`
4. Run test suite:
   `npm run test`

