import React from 'react';

export interface ChineseInstrument {
  id: string;
  name: string;
  chineseName: string;
  mood: string;
  description: string;
  bgGradient: string;
  iconSymbol: string;
}

export const CHINESE_INSTRUMENTS: ChineseInstrument[] = [
  {
    id: 'guqin',
    name: 'Guqin',
    chineseName: '古琴',
    mood: 'ancient wisdom, loneliness, cultivation, sacred reflection',
    description: 'Ancient plucked seven-string zither of the sages.',
    bgGradient: 'from-amber-500/10 to-orange-600/5',
    iconSymbol: '琴'
  },
  {
    id: 'xiao',
    name: 'Xiao',
    chineseName: '箫',
    mood: 'mist, grief, night travel, immortal atmosphere',
    description: 'Vertical bamboo flute with a soft, breathy, melancholic tone.',
    bgGradient: 'from-blue-500/10 to-teal-600/5',
    iconSymbol: '箫'
  },
  {
    id: 'dizi',
    name: 'Dizi',
    chineseName: '笛子',
    mood: 'motion, village life, wind, youthful adventure',
    description: 'Transverse bamboo flute with a bright, buzzing membrane.',
    bgGradient: 'from-emerald-500/10 to-green-600/5',
    iconSymbol: '笛'
  },
  {
    id: 'pipa',
    name: 'Pipa',
    chineseName: '琵琶',
    mood: 'battle tension, elegance, fast movement, duels',
    description: 'Four-string plucked lute with supreme speed and drama.',
    bgGradient: 'from-rose-500/10 to-red-600/5',
    iconSymbol: '琶'
  },
  {
    id: 'guzheng',
    name: 'Guzheng',
    chineseName: '古筝',
    mood: 'romance, fate, nobility, flowing emotion',
    description: 'Grand plucked zither with movable bridges, cascades like water.',
    bgGradient: 'from-purple-500/10 to-indigo-600/5',
    iconSymbol: '筝'
  },
  {
    id: 'erhu',
    name: 'Erhu',
    chineseName: '二胡',
    mood: 'sorrow, longing, tragic memory',
    description: 'Two-stringed bowed fiddle that sings with human-like sorrow.',
    bgGradient: 'from-red-500/10 to-pink-600/5',
    iconSymbol: '胡'
  },
  {
    id: 'sheng',
    name: 'Sheng',
    chineseName: '笙',
    mood: 'spiritual breath, heavenly/celestial atmosphere',
    description: 'Free-reed mouth organ creating ethereal, multi-phonic chords.',
    bgGradient: 'from-yellow-500/10 to-amber-600/5',
    iconSymbol: '笙'
  },
  {
    id: 'bianzhong',
    name: 'Bianzhong',
    chineseName: '编钟',
    mood: 'imperial, ritual, ancient ceremony, destiny',
    description: 'Chime bells that echo with royal power and historic weight.',
    bgGradient: 'from-slate-500/10 to-zinc-600/5',
    iconSymbol: '钟'
  },
  {
    id: 'suona',
    name: 'Suona',
    chineseName: '唢呐',
    mood: 'chaos, war, festival, danger, high intensity',
    description: 'Double-reed horn with a fierce, penetrating, wild high intensity.',
    bgGradient: 'from-orange-500/10 to-red-700/5',
    iconSymbol: '唢'
  },
  {
    id: 'yangqin',
    name: 'Yangqin',
    chineseName: '扬琴',
    mood: 'clever movement, schemes, market/tavern energy',
    description: 'Hammered dulcimer producing bright, shimmering cascades.',
    bgGradient: 'from-cyan-500/10 to-blue-600/5',
    iconSymbol: '琴'
  },
  {
    id: 'ruan',
    name: 'Ruan',
    chineseName: '阮',
    mood: 'grounded travel, warm folk, campfire, wandering hero',
    description: 'Round-bodied lute with a mellow, warm, acoustic folk timbre.',
    bgGradient: 'from-orange-400/10 to-amber-500/5',
    iconSymbol: '阮'
  },
  {
    id: 'tanggu',
    name: 'Drums / Tanggu',
    chineseName: '堂鼓',
    mood: 'martial force, armies, sect battles, tournament energy',
    description: 'Traditional ceremonial barrel drums with thunderous presence.',
    bgGradient: 'from-red-600/10 to-amber-800/5',
    iconSymbol: '鼓'
  }
];

interface ChineseInstrumentListProps {
  activeInstrument: string;
  onSelectInstrument: (instrument: ChineseInstrument) => void;
}

export const ChineseInstrumentList: React.FC<ChineseInstrumentListProps> = ({
  activeInstrument,
  onSelectInstrument,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="w-full bg-[#0a0c16]/60 border border-white/10 rounded-2xl p-4.5 space-y-3.5 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_6px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold font-mono">
            📯
          </span>
          <div>
            <h4 className="text-xs font-extrabold font-sans uppercase tracking-widest text-white leading-none">
              Celestial Instrument Tapestry
            </h4>
            <p className="text-[10px] text-gray-400 font-sans mt-1.5 leading-relaxed">
              Select a traditional instrument to weave its voice and intended mood into the prompt.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200 active:scale-95"
          title={isCollapsed ? "Expand Selector" : "Collapse Selector"}
        >
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {CHINESE_INSTRUMENTS.map((inst) => {
            const isActive = activeInstrument.toLowerCase() === inst.name.toLowerCase() || 
                             activeInstrument.toLowerCase().includes(inst.id);

            return (
              <button
                key={inst.id}
                onClick={() => {
                  onSelectInstrument(inst);
                  setIsCollapsed(true);
                }}
                className={`group relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-300 select-none cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-br from-[#061e33]/80 to-cyan-950/30 border-cyan-500/50 shadow-[0_4px_22px_rgba(4,172,255,0.22),inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-cyan-400/35 scale-[1.02]'
                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/12 hover:shadow-[0_4px_12px_rgba(255,255,255,0.02)]'
                }`}
              >
                {/* Background wash on active */}
                <div className={`absolute inset-0 bg-gradient-to-br ${inst.bgGradient} opacity-25 group-hover:opacity-35 transition-opacity`} />
                
                {/* Calligraphic background character character overlay */}
                <div className="absolute right-1.5 bottom-0 text-[3.5rem] font-sans font-black select-none pointer-events-none text-white/[0.015] group-hover:text-white/[0.035] transition-all leading-none duration-500">
                  {inst.iconSymbol}
                </div>

                <div className="relative z-10 w-full flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-sans font-extrabold text-gray-500 uppercase tracking-widest leading-none">
                      {inst.chineseName}
                    </span>
                    <span className="text-xs font-extrabold text-white tracking-wide mt-1 group-hover:text-cyan-300 transition-colors">
                      {inst.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mt-0.5" />
                  )}
                </div>

                <div className="relative z-10 mt-2">
                  <p className="text-[9px] text-gray-400 font-sans leading-relaxed line-clamp-2 italic group-hover:text-gray-300 transition-colors">
                    {inst.mood}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
