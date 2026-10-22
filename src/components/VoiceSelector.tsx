import React, { useState } from 'react';
import { CARTOON_VOICES, REAL_VOICES } from '../data/presets';
import { VoicePreset, ClonedVoice, VoiceCategory } from '../types';
import { Search, Sparkles, User, Tv, Mic, CheckCircle2, Sliders } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voice: VoicePreset | ClonedVoice) => void;
  clonedVoices: ClonedVoice[];
  onOpenImportModal?: () => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onSelectVoice,
  clonedVoices,
  onOpenImportModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<VoiceCategory>('cartoon');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect voices based on category
  let currentList: (VoicePreset | ClonedVoice)[] = [];
  if (activeCategory === 'cartoon') {
    currentList = CARTOON_VOICES;
  } else if (activeCategory === 'real') {
    currentList = REAL_VOICES;
  } else {
    currentList = clonedVoices;
  }

  // Filter by search query
  const filteredList = currentList.filter((voice) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameAr = 'nameAr' in voice ? voice.nameAr : voice.name;
    const nameEn = 'nameEn' in voice ? voice.nameEn : '';
    const desc = 'descriptionAr' in voice ? voice.descriptionAr : voice.description;
    return (
      nameAr.toLowerCase().includes(q) ||
      nameEn.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Top Header & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            اختر صوت الشخصية المراد تقليده
          </h2>
          <p className="text-xs text-slate-400">
            أصوات كرتونية شهيرة، شخصيات ومعلقين حقيقيين، أو أصوات مستنسخة من ملفاتك
          </p>
        </div>

        {/* Category switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="category-cartoon-btn"
            onClick={() => setActiveCategory('cartoon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'cartoon'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>أصوات كرتون ({CARTOON_VOICES.length})</span>
          </button>

          <button
            id="category-real-btn"
            onClick={() => setActiveCategory('real')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'real'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>أشخاص حقيقيون ({REAL_VOICES.length})</span>
          </button>

          <button
            id="category-custom-btn"
            onClick={() => setActiveCategory('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>أصواتي المستنسخة ({clonedVoices.length})</span>
          </button>
        </div>
      </div>

      {/* Search Filter & Count */}
      <div className="pt-3 pb-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="search-voice-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم الشخصية (مثال: سبونج بوب، غوكو، وثائقي، أخبار...)"
            className="w-full pr-9 pl-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Voices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1 pb-1">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-10 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 p-6">
            <Mic className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            {activeCategory === 'custom' ? (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-1">
                  لا توجد أصوات مستنسخة بعد!
                </p>
                <p className="text-xs text-slate-400 mb-3 max-w-sm mx-auto">
                  يمكنك استيراد أي ملف صوتي MP3/WAV أو تسجيل صوتك ليقوم الذكاء الاصطناعي باستنساخ نبرته فوراً
                </p>
                {onOpenImportModal && (
                  <button
                    onClick={onOpenImportModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>استيراد ملف صوتي الآن</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                لم يتم العثور على شخصية مطابقة لبحثك "{searchQuery}"
              </p>
            )}
          </div>
        ) : (
          filteredList.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const name = 'nameAr' in voice ? voice.nameAr : voice.name;
            const desc = 'descriptionAr' in voice ? voice.descriptionAr : voice.description;
            const badge = 'badge' in voice ? voice.badge : 'مستنسخ مخصص';
            const avatar = voice.avatar || '🎙️';

            return (
              <div
                key={voice.id}
                id={`voice-card-${voice.id}`}
                onClick={() => onSelectVoice(voice)}
                className={`relative cursor-pointer p-3.5 rounded-xl border transition-all duration-200 text-right group ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/15 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 left-3 text-amber-400">
                    <CheckCircle2 className="w-5 h-5 fill-amber-400/20" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-11 h-11 text-2xl rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                    {avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-800 text-amber-400/90 border border-slate-700/60">
                        {badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate leading-snug">
                      {name}
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {desc}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    قاعدة: <span className="text-slate-300 font-semibold">{voice.baseVoice}</span>
                  </span>
                  {'defaultEmotion' in voice && (
                    <span className="text-amber-400/80 font-sans">
                      {voice.defaultEmotion}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
