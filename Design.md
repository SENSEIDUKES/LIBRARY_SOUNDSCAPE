# SEIHouse Immersive Soundscape Engine - Design Document

## Overview
The SEIHouse Immersive Soundscape Engine is a companion application designed for the SEIHouse Light Novels ecosystem. It empowers authors and readers to generate chapter-specific ambient audio, emotional musical tracks, and soundscapes using Google's GenAI models.

## Core Features

### 1. Chapter Parser & Narrative Synthesis
- **Description**: Users input chapter excerpts, and the engine's local semantic heuristics extract narrative coordinates (mood, environment, emotional intensity).
- **Use Cases**: Quickly generating an accurate soundscape corresponding directly to the text of a novel chapter without manual prompt engineering.
- **Implementation**: Uses `PromptBuilder.tsx` to parse text and map keywords to the `SoundscapeConfig`.

### 2. Immersive Audio Generation
- **Description**: Generates streaming background music and atmospheric sounds tailored to specific cultural aesthetics (e.g., Chinese Wuxia/Xianxia, Japanese Traditional, Western Fantasy).
- **Use Cases**: Seamlessly creating background tracks that synchronize with the emotional journey of the narrative.
- **Implementation**: Uses the `@google/genai` SDK to stream base64 audio directly based on the forged prompt.

### 3. Automatic Metadata & Entity Forgery
- **Description**: Generates appropriate titles and visual cover art for the generated soundscape using AI.
- **Implementation**: Generates a unified JSON metadata block, followed by an image generation pass for visual continuity.

### 4. Video & Scroll Export
- **Description**: Renders the generated audio along with its visual cover into a downloadable WebM video file, perfect for sharing chapter previews or social media teasers.

## Architecture & Brand Identity
- **Frontend**: React (Vite), Tailwind CSS.
- **Brand Palette**: Void (Black), Clarity (White), Human (Crimson), Portal (Turquoise).
- **Typography**: Alegreya (Emotional Headers), Rubik (UI/System), Noto Serif (Reading Viewport).
- **Integration**: Designed to output files and configurations compatible with the `SENSEIDUKES/Light-Novels` reader experience.
