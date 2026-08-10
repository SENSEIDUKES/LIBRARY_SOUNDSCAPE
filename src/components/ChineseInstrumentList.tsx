import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Music, LayoutGrid, List } from 'lucide-react';

export interface ChineseInstrument {
  id: string;
  name: string;
  chineseName: string;
  mood: string;
  description: string;
  bgGradient: string;
  iconSymbol: string;
}

export type Instrument = ChineseInstrument;

export const CHINESE_INSTRUMENTS: ChineseInstrument[] = [
  {
    id: 'guqin',
    name: 'Guqin',
    chineseName: '古琴',
    mood: 'ancient wisdom, loneliness, cultivation, sacred reflection',
    description: 'Ancient plucked seven-string zither of the sages.',
    bgGradient: 'from-amber-500/10 to-orange-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'xiao',
    name: 'Xiao',
    chineseName: '箫',
    mood: 'mist, grief, night travel, immortal atmosphere',
    description: 'Vertical bamboo flute with a soft, breathy, melancholic tone.',
    bgGradient: 'from-blue-500/10 to-teal-600/5',
    iconSymbol: '箫',
  },
  {
    id: 'dizi',
    name: 'Dizi',
    chineseName: '笛子',
    mood: 'motion, village life, wind, youthful adventure',
    description: 'Transverse bamboo flute with a bright, buzzing membrane.',
    bgGradient: 'from-emerald-500/10 to-green-600/5',
    iconSymbol: '笛',
  },
  {
    id: 'pipa',
    name: 'Pipa',
    chineseName: '琵琶',
    mood: 'battle tension, elegance, fast movement, duels',
    description: 'Four-string plucked lute with supreme speed and drama.',
    bgGradient: 'from-rose-500/10 to-red-600/5',
    iconSymbol: '琶',
  },
  {
    id: 'guzheng',
    name: 'Guzheng',
    chineseName: '古筝',
    mood: 'romance, fate, nobility, flowing emotion',
    description: 'Grand plucked zither with movable bridges, cascades like water.',
    bgGradient: 'from-purple-500/10 to-indigo-600/5',
    iconSymbol: '筝',
  },
  {
    id: 'erhu',
    name: 'Erhu',
    chineseName: '二胡',
    mood: 'sorrow, longing, tragic memory',
    description: 'Two-stringed bowed fiddle that sings with human-like sorrow.',
    bgGradient: 'from-red-500/10 to-pink-600/5',
    iconSymbol: '胡',
  },
  {
    id: 'sheng',
    name: 'Sheng',
    chineseName: '笙',
    mood: 'spiritual breath, heavenly/celestial atmosphere',
    description: 'Free-reed mouth organ creating ethereal, multi-phonic chords.',
    bgGradient: 'from-yellow-500/10 to-amber-600/5',
    iconSymbol: '笙',
  },
  {
    id: 'bianzhong',
    name: 'Bianzhong',
    chineseName: '编钟',
    mood: 'imperial, ritual, ancient ceremony, destiny',
    description: 'Chime bells that echo with royal power and historic weight.',
    bgGradient: 'from-slate-500/10 to-zinc-600/5',
    iconSymbol: '钟',
  },
  {
    id: 'suona',
    name: 'Suona',
    chineseName: '唢呐',
    mood: 'chaos, war, festival, danger, high intensity',
    description: 'Double-reed horn with a fierce, penetrating, wild high intensity.',
    bgGradient: 'from-orange-500/10 to-red-700/5',
    iconSymbol: '唢',
  },
  {
    id: 'yangqin',
    name: 'Yangqin',
    chineseName: '扬琴',
    mood: 'clever movement, schemes, market/tavern energy',
    description: 'Hammered dulcimer producing bright, shimmering cascades.',
    bgGradient: 'from-cyan-500/10 to-blue-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'ruan',
    name: 'Ruan',
    chineseName: '阮',
    mood: 'grounded travel, warm folk, campfire, wandering hero',
    description: 'Round-bodied lute with a mellow, warm, acoustic folk timbre.',
    bgGradient: 'from-orange-400/10 to-amber-500/5',
    iconSymbol: '阮',
  },
  {
    id: 'tanggu',
    name: 'Drums / Tanggu',
    chineseName: '堂鼓',
    mood: 'martial force, armies, sect battles, tournament energy',
    description: 'Traditional ceremonial barrel drums with thunderous presence.',
    bgGradient: 'from-red-600/10 to-amber-800/5',
    iconSymbol: '鼓',
  },
];

export const JAPANESE_INSTRUMENTS: ChineseInstrument[] = [
  {
    id: 'shakuhachi',
    name: 'Shakuhachi',
    chineseName: '尺八',
    mood: 'Wandering ronin, fog, stealth, inner void, cold wind',
    description: 'End-blown bamboo flute with a deep, breathy, meditative voice rooted in Zen Buddhism.',
    bgGradient: 'from-amber-500/10 to-stone-600/5',
    iconSymbol: '尺',
  },
  {
    id: 'koto',
    name: 'Koto',
    chineseName: '琴',
    mood: 'Imperial courts, cherry blossoms, quiet elegance, nobility',
    description: 'Thirteen-stringed plucked zither with movable bridges, known for graceful, cascading sweeps.',
    bgGradient: 'from-pink-500/10 to-rose-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'shamisen',
    name: 'Shamisen',
    chineseName: '三味線',
    mood: 'Kabuki drama, fast duels, Edo street markets, tense encounters',
    description: 'Three-stringed plucked lute with a sharp, percussive attack and buzzy resonance (sawari).',
    bgGradient: 'from-red-500/10 to-orange-600/5',
    iconSymbol: '線',
  },
  {
    id: 'taiko',
    name: 'Taiko',
    chineseName: '太鼓',
    mood: 'Feudal battles, siege warfare, demonic invasion, festival energy',
    description: 'Massive wooden barrel drums delivering thunderous, physical low-end reverberations.',
    bgGradient: 'from-red-600/10 to-amber-800/5',
    iconSymbol: '鼓',
  },
  {
    id: 'satsuma_biwa',
    name: 'Satsuma Biwa',
    chineseName: '薩摩琵琶',
    mood: 'Samurai tragedy, historic recountings, ancient clans, fatalistic destiny',
    description: 'Fretted wooden lute struck with a large wooden plectrum, producing dramatic percussive snaps.',
    bgGradient: 'from-purple-500/10 to-indigo-600/5',
    iconSymbol: '琵',
  },
  {
    id: 'shinobue',
    name: 'Shinobue',
    chineseName: '篠笛',
    mood: 'Rural villages, shrine festivals, youthful adventure, spring night',
    description: 'High-pitched transverse bamboo flute with a bright, sweet, folk-like clarity.',
    bgGradient: 'from-emerald-500/10 to-teal-600/5',
    iconSymbol: '笛',
  },
  {
    id: 'sho',
    name: 'Sho',
    chineseName: '笙',
    mood: 'Celestial light, shrine grounds, divine presence, timeless space',
    description: 'Sacred mouth organ made of 17 bamboo pipes creating serene, multi-note cluster chords.',
    bgGradient: 'from-yellow-500/10 to-amber-600/5',
    iconSymbol: '笙',
  },
  {
    id: 'hichiriki',
    name: 'Hichiriki',
    chineseName: '篳篥',
    mood: 'Gagaku court ceremony, otherworldly aura, spiritual pressure, ancient ritual',
    description: 'Short double-reed pipe with a piercing, nasal, intensely emotive tone.',
    bgGradient: 'from-orange-500/10 to-red-700/5',
    iconSymbol: '篥',
  },
  {
    id: 'tsuzumi',
    name: 'Tsuzumi',
    chineseName: '鼓',
    mood: 'Noh theater suspense, shadow movement, impending ambush, ritual tension',
    description: 'Hourglass-shaped hand drums producing sharp, cracking accents and pitch bends.',
    bgGradient: 'from-stone-500/10 to-zinc-600/5',
    iconSymbol: '鼓',
  },
  {
    id: 'kokyu',
    name: 'Kokyu',
    chineseName: '胡弓',
    mood: 'Bittersweet longing, tragic snowstorms, lost romance, lingering regret',
    description: 'Traditional bowed three-string fiddle with a haunting, fragile, mournful timbre.',
    bgGradient: 'from-blue-500/10 to-slate-600/5',
    iconSymbol: '弓',
  },
  {
    id: 'ryuteki',
    name: 'Ryuteki',
    chineseName: '龍笛',
    mood: 'Sky travel, mythical beasts, storm gods, celestial flight',
    description: 'Transverse bamboo flute ("dragon flute") with a soaring, sweeping, high-altitude register.',
    bgGradient: 'from-cyan-500/10 to-blue-600/5',
    iconSymbol: '龍',
  },
  {
    id: 'atarigane',
    name: 'Atarigane / Kane',
    chineseName: '鉦',
    mood: 'Shrine processions, exorcisms, sacred wards, village gatherings',
    description: 'Small hand-held brass gong struck with a bone mallet, producing a sharp metallic ring.',
    bgGradient: 'from-yellow-400/10 to-amber-500/5',
    iconSymbol: '鉦',
  },
];

export const KOREAN_INSTRUMENTS: ChineseInstrument[] = [
  {
    id: 'gayageum',
    name: 'Gayageum',
    chineseName: '가야금',
    mood: 'Royal court, spring rain, graceful romance, serene beauty',
    description: '12-string plucked zither with movable bridges, producing soft, expressive, elegant melodies.',
    bgGradient: 'from-pink-500/10 to-rose-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'geomungo',
    name: 'Geomungo',
    chineseName: '거문고',
    mood: 'Scholar solitude, mountain meditation, inner discipline, ancient philosophy',
    description: '6-string plucked zither struck with a bamboo stick (suldae), deep, resonant, and noble.',
    bgGradient: 'from-amber-500/10 to-stone-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'haegeum',
    name: 'Haegeum',
    chineseName: '해금',
    mood: 'Heartache, tragic departure, emotional sorrow, lingering memory',
    description: 'Two-stringed bowed vertical fiddle with a nasal, vocal-like expressive timbre.',
    bgGradient: 'from-red-500/10 to-pink-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'daegeum',
    name: 'Daegeum',
    chineseName: '대금',
    mood: 'Mist over mountains, pine forests, heroic journey, noble spirit',
    description: 'Large transverse bamboo flute with a buzzing membrane (cheong), soaring and dramatic.',
    bgGradient: 'from-emerald-500/10 to-teal-600/5',
    iconSymbol: '笛',
  },
  {
    id: 'piri',
    name: 'Piri',
    chineseName: '피리',
    mood: 'Court ceremonial, royal procession, intense focus, spiritual weight',
    description: 'Double-reed bamboo pipe with a bold, rich, penetrating tone used in Gukak rituals.',
    bgGradient: 'from-yellow-500/10 to-amber-600/5',
    iconSymbol: '笛',
  },
  {
    id: 'janggu',
    name: 'Janggu',
    chineseName: '장구',
    mood: 'Shamanic ritual, harvest festival, energetic folk dance, driving rhythm',
    description: 'Hourglass-shaped double-headed drum producing sharp high taps and deep thumping bass.',
    bgGradient: 'from-red-600/10 to-amber-800/5',
    iconSymbol: '鼓',
  },
  {
    id: 'danso',
    name: 'Danso',
    chineseName: '단소',
    mood: 'Countryside evening, quiet contemplation, peaceful spring, gentle breeze',
    description: 'Small end-blown bamboo flute with a clear, delicate, breathy high pitch.',
    bgGradient: 'from-blue-500/10 to-teal-600/5',
    iconSymbol: '笛',
  },
  {
    id: 'taepyeongso',
    name: 'Taepyeongso',
    chineseName: '태평소',
    mood: 'Grand victory, royal procession, festive celebration, martial energy',
    description: 'Conical wooden double-reed horn with a brass bell, loudly triumphant and wild.',
    bgGradient: 'from-orange-500/10 to-red-700/5',
    iconSymbol: '喇',
  },
  {
    id: 'ajaeng',
    name: 'Ajaeng',
    chineseName: '아쟁',
    mood: 'Dark drama, tragic fate, deep grief, storm warning',
    description: 'Bowed zither with thick silk strings played with a bowed wooden stick, creating deep mournful resonance.',
    bgGradient: 'from-purple-500/10 to-indigo-600/5',
    iconSymbol: '琴',
  },
  {
    id: 'kkwaenggwari',
    name: 'Kkwaenggwari',
    chineseName: '꽹과리',
    mood: 'Shamanic exorcism, village festival, sharp tension, communal energy',
    description: 'Small hand-held brass gong struck with a wooden mallet, piercing and rhythmically driving.',
    bgGradient: 'from-yellow-400/10 to-amber-500/5',
    iconSymbol: '鑼',
  },
  {
    id: 'buk',
    name: 'Buk',
    chineseName: '북',
    mood: 'Heroic march, battle rhythm, shamanic pulse, grounding force',
    description: 'Shallow barrel drum providing deep, pounding bass anchors in folk and court music.',
    bgGradient: 'from-stone-500/10 to-zinc-600/5',
    iconSymbol: '鼓',
  },
  {
    id: 'bak',
    name: 'Bak',
    chineseName: '박',
    mood: 'Court ritual start, sacred command, solemn transition, regal presence',
    description: 'Fan-shaped wooden clapper used to mark beginning and ending of ceremonial music.',
    bgGradient: 'from-slate-500/10 to-zinc-600/5',
    iconSymbol: '板',
  },
];

export const WESTERN_INSTRUMENTS: ChineseInstrument[] = [
  {
    id: 'harp',
    name: 'Harp',
    chineseName: 'Harp',
    mood: 'Enchanted forests, fairy tales, celestial grace, serene magic',
    description: 'Grand orchestral harp with sparkling plucked sweeps and magical arpeggios.',
    bgGradient: 'from-cyan-500/10 to-blue-600/5',
    iconSymbol: '𝄢',
  },
  {
    id: 'lute',
    name: 'Lute',
    chineseName: 'Lute',
    mood: 'Tavern celebrations, wandering minstrel, cozy hearth, rustic journey',
    description: 'Warm plucked Renaissance acoustic fretted lute.',
    bgGradient: 'from-amber-500/10 to-orange-600/5',
    iconSymbol: '🎸',
  },
  {
    id: 'pipe_organ',
    name: 'Pipe Organ',
    chineseName: 'Organ',
    mood: 'Gothic mystery, divine majesty, ancient cathedrals, dark destiny',
    description: 'Massive cathedral pipe organ creating sacred, powerful acoustics.',
    bgGradient: 'from-purple-500/10 to-indigo-600/5',
    iconSymbol: '🎹',
  },
  {
    id: 'french_horn',
    name: 'French Horn Section',
    chineseName: 'Horn',
    mood: 'Royal decrees, epic mountain passes, knightly triumph, battle readiness',
    description: 'Noble brass section delivering soaring hero themes.',
    bgGradient: 'from-yellow-500/10 to-amber-600/5',
    iconSymbol: '🎺',
  },
  {
    id: 'cello',
    name: 'Orchestral Cello',
    chineseName: 'Cello',
    mood: 'Tragic farewells, noble sorrow, quiet heroism, autumn night',
    description: 'Deep, rich bowed string solo singing with melancholic beauty.',
    bgGradient: 'from-red-500/10 to-rose-600/5',
    iconSymbol: '🎻',
  },
  {
    id: 'timpani',
    name: 'Timpani & War Drums',
    chineseName: 'Timpani',
    mood: 'Impending siege, dragon attack, march of armies, intense climax',
    description: 'Heavy orchestral percussion and brass for epic battle scenes.',
    bgGradient: 'from-red-600/10 to-amber-800/5',
    iconSymbol: '🥁',
  },
  {
    id: 'tin_whistle',
    name: 'Celtic Tin Whistle',
    chineseName: 'Whistle',
    mood: 'Emerald hills, youthful adventure, ocean voyage, cheerful tavern',
    description: 'Bright, airy high whistle full of folk charm.',
    bgGradient: 'from-emerald-500/10 to-teal-600/5',
    iconSymbol: '𝄢',
  },
  {
    id: 'hurdy_gurdy',
    name: 'Hurdy-Gurdy',
    chineseName: 'Gurdy',
    mood: 'Medieval market, sea voyages, mysterious alchemy, rogue encounters',
    description: 'Raucous drone-wheeled string instrument with ancient tavern energy.',
    bgGradient: 'from-orange-500/10 to-stone-600/5',
    iconSymbol: '🎻',
  },
];

export const CULTURAL_INSTRUMENTS_MAP: Record<string, ChineseInstrument[]> = {
  Chinese: CHINESE_INSTRUMENTS,
  Japanese: JAPANESE_INSTRUMENTS,
  Korean: KOREAN_INSTRUMENTS,
  Western: WESTERN_INSTRUMENTS,
};

export function getInstrumentsForCulture(culture: string): ChineseInstrument[] {
  return CULTURAL_INSTRUMENTS_MAP[culture] || CULTURAL_INSTRUMENTS_MAP['Chinese'] || CHINESE_INSTRUMENTS;
}

export interface ChineseInstrumentListProps {
  activeInstrument: string;
  culture?: string;
  onSelectInstrument: (instrument: ChineseInstrument) => void;
  onCultureChange?: (culture: string) => void;
}

const CULTURE_OPTIONS = [
  { id: 'Chinese', name: 'Chinese', shortName: 'Chinese', tag: 'Wuxia' },
  { id: 'Japanese', name: 'Japanese', shortName: 'Japanese', tag: 'Traditional' },
  { id: 'Korean', name: 'Korean', shortName: 'Korean', tag: 'Gukak' },
  { id: 'Western', name: 'Western', shortName: 'Western', tag: 'Epic' },
];

const CULTURE_INFO: Record<string, { title: string; subtitle: string; tag: string }> = {
  Chinese: {
    title: 'Celestial Chinese Instruments',
    subtitle: 'Select an instrument motif for soundscape generation.',
    tag: 'Chinese Wuxia',
  },
  Japanese: {
    title: 'Traditional Japanese Instruments',
    subtitle: 'Select an instrument motif for soundscape generation.',
    tag: 'Japanese Traditional',
  },
  Korean: {
    title: 'Traditional Korean Instruments (Gukak)',
    subtitle: 'Select an instrument motif for soundscape generation.',
    tag: 'Korean Traditional',
  },
  Western: {
    title: 'Epic Fantasy Instruments',
    subtitle: 'Select an instrument motif for soundscape generation.',
    tag: 'Western Epic',
  },
};

export const ChineseInstrumentList: React.FC<ChineseInstrumentListProps> = ({
  activeInstrument,
  culture = 'Chinese',
  onSelectInstrument,
  onCultureChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [viewDensity, setViewDensity] = useState<'standard' | 'compact'>('standard');
  const currentInstruments = getInstrumentsForCulture(culture);
  const info = CULTURE_INFO[culture] || CULTURE_INFO['Chinese'];

  const activeInst = currentInstruments.find(
    (inst) =>
      activeInstrument.toLowerCase() === inst.name.toLowerCase() ||
      activeInstrument.toLowerCase().includes(inst.id) ||
      inst.name.toLowerCase().includes(activeInstrument.toLowerCase())
  ) || currentInstruments[0];

  return (
    <div className="w-full bg-[#0a0c1a]/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-2xl space-y-2.5">
      {/* Culture Selector Bar on Instruments Panel */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-300 uppercase tracking-wider shrink-0">
          Culture Motif:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar no-scrollbar py-0.5">
          {CULTURE_OPTIONS.map((c) => {
            const isSelected = culture === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCultureChange?.(c.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/80 shadow-xs shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700/70 hover:bg-slate-800 hover:text-slate-200'
                }`}
                aria-label={`Switch culture to ${c.name}`}
              >
                {c.shortName}
                <span className="ml-1 text-[8px] opacity-75 font-normal hidden xs:inline">
                  ({c.tag})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-bold shrink-0 shadow-sm">
            <Music className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-white leading-none truncate">
                {info.title}
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 shrink-0 hidden md:inline-block">
                {info.tag}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-tight truncate">
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* Selected Instrument Pill & Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeInst && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/90 border border-cyan-400/50 text-cyan-200 text-[10px] sm:text-xs font-bold shrink-0 shadow-sm cursor-pointer hover:bg-cyan-900/80 transition-all max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={`Active: ${activeInst.name} (${activeInst.chineseName})`}
            >
              <span className="text-cyan-300 font-extrabold text-xs shrink-0">
                {activeInst.iconSymbol}
              </span>
              <span className="truncate">{activeInst.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0 hidden xs:inline-block" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] shrink-0 flex items-center justify-center border border-slate-700"
            title={isCollapsed ? 'Expand Selector' : 'Collapse Selector'}
            aria-label={isCollapsed ? 'Expand instrument list' : 'Collapse instrument list'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="pt-2 space-y-2 border-t border-slate-800/80 mt-2">
          {/* Density Control Toolbar */}
          <div className="flex items-center justify-between px-0.5 text-[10px] sm:text-xs text-slate-400 font-semibold">
            <span>{currentInstruments.length} Motifs</span>
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
              <button
                type="button"
                onClick={() => setViewDensity('standard')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  viewDensity === 'standard'
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Standard Card View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden xs:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewDensity('compact')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  viewDensity === 'compact'
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-3 h-3" />
                <span className="hidden xs:inline">Compact</span>
              </button>
            </div>
          </div>

          {/* Instrument Grid */}
          <div
            className={`grid gap-1.5 sm:gap-2 max-h-[220px] xs:max-h-[270px] sm:max-h-[320px] overflow-y-auto custom-scrollbar pr-0.5 ${
              viewDensity === 'compact'
                ? 'grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-2 xs:grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {currentInstruments.map((inst) => {
              const isActive =
                activeInstrument.toLowerCase() === inst.name.toLowerCase() ||
                activeInstrument.toLowerCase().includes(inst.id) ||
                inst.name.toLowerCase().includes(activeInstrument.toLowerCase());

              if (viewDensity === 'compact') {
                return (
                  <button
                    key={inst.id}
                    onClick={() => {
                      onSelectInstrument(inst);
                      setIsCollapsed(true);
                    }}
                    aria-label={`Select ${inst.name} (${inst.chineseName})`}
                    className={`group relative flex items-center justify-between p-2 rounded-xl border text-left transition-all duration-150 select-none cursor-pointer overflow-hidden min-h-[42px] active:scale-[0.98] ${
                      isActive
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-sm shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/80 border-slate-700/70 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${inst.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity`}
                    />
                    <div className="relative z-10 flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="text-cyan-300 font-extrabold text-xs shrink-0 w-5 text-center">
                        {inst.iconSymbol}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide truncate group-hover:text-cyan-200">
                          {inst.name}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-semibold text-cyan-300/90 truncate">
                          {inst.chineseName}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0 relative z-10" />
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={inst.id}
                  onClick={() => {
                    onSelectInstrument(inst);
                    setIsCollapsed(true);
                  }}
                  aria-label={`Select ${inst.name} (${inst.chineseName}) instrument motif`}
                  className={`group relative flex flex-col items-start p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 select-none cursor-pointer overflow-hidden min-h-[52px] sm:min-h-[66px] active:scale-[0.98] ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/70 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-500'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${inst.bgGradient} opacity-40 group-hover:opacity-60 transition-opacity`}
                  />

                  <div className="absolute right-1 -bottom-0.5 text-xl xs:text-2xl sm:text-3xl font-black select-none pointer-events-none text-white/[0.08] group-hover:text-white/[0.18] transition-all leading-none">
                    {inst.iconSymbol}
                  </div>

                  <div className="relative z-10 w-full flex items-start justify-between gap-1">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[8.5px] sm:text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider leading-none">
                        {inst.chineseName}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide truncate mt-0.5 group-hover:text-cyan-200">
                        {inst.name}
                      </span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse mt-0.5 shrink-0" />
                    )}
                  </div>

                  <p className="relative z-10 mt-0.5 text-[9.5px] sm:text-[11px] text-slate-300 font-sans leading-tight line-clamp-1 sm:line-clamp-2 italic font-medium">
                    {inst.mood}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


