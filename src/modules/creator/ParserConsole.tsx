import React from 'react';
import { PromptBuilder, SoundscapeConfig } from '../../components/PromptBuilder';
import { VisualScenePicker, VisualImage } from '../../components/VisualScenePicker';

interface ParserConsoleProps {
  soundscapeConfig: SoundscapeConfig;
  setSoundscapeConfig: React.Dispatch<React.SetStateAction<SoundscapeConfig>>;
  isTranslating: boolean;
  setIsTranslating: (val: boolean) => void;
  chapterText: string;
  setChapterText: (text: string) => void;
  culture: string;
  setCulture: (c: string) => void;
  selectedImages?: VisualImage[];
  setSelectedImages?: React.Dispatch<React.SetStateAction<VisualImage[]>>;
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
  selectedImages,
  setSelectedImages,
}) => {
  return (
    <div className="space-y-4">
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

      {selectedImages && setSelectedImages && (
        <div className="pt-2 border-t border-slate-800/80">
          <VisualScenePicker
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            culture={culture}
            onApplySceneCoordinates={(coords) => {
              setSoundscapeConfig((prev) => ({
                ...prev,
                mood: coords.mood || prev.mood,
                instrument: coords.instrument || prev.instrument,
                environmentalTexture: coords.environment || prev.environmentalTexture,
                sceneAtmosphere: coords.promptText || prev.sceneAtmosphere,
              }));
            }}
          />
        </div>
      )}
    </div>
  );
};

