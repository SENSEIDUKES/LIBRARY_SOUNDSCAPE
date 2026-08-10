import React from 'react';
import { PromptBuilder, SoundscapeConfig } from '../../components/PromptBuilder';

interface ParserConsoleProps {
  soundscapeConfig: SoundscapeConfig;
  setSoundscapeConfig: React.Dispatch<React.SetStateAction<SoundscapeConfig>>;
  isTranslating: boolean;
  setIsTranslating: (val: boolean) => void;
  chapterText: string;
  setChapterText: (text: string) => void;
  culture: string;
  setCulture: (c: string) => void;
}

export const ParserConsole: React.FC<ParserConsoleProps> = ({
  soundscapeConfig,
  setSoundscapeConfig,
  isTranslating,
  setIsTranslating,
  chapterText,
  setChapterText,
  culture,
  setCulture,
}) => {
  return (
    <PromptBuilder
      config={soundscapeConfig}
      setConfig={setSoundscapeConfig}
      isTranslating={isTranslating}
      setIsTranslating={setIsTranslating}
      chapterText={chapterText}
      setChapterText={setChapterText}
      onGeneratePrompt={() => {}}
      culture={culture}
      setCulture={setCulture}
      pacing={soundscapeConfig.pacing}
      setPacing={(p) => setSoundscapeConfig((prev) => ({ ...prev, pacing: p }))}
      intensity={soundscapeConfig.intensity ?? 0.5}
      setIntensity={(i) => setSoundscapeConfig((prev) => ({ ...prev, intensity: i }))}
    />
  );
};
