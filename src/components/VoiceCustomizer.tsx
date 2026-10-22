import React from 'react';
import { Sliders, Gauge, Music, Sparkles, RotateCcw } from 'lucide-react';

interface VoiceCustomizerProps {
  pitch: number;
  setPitch: (val: number) => void;
  speed: number;
  setSpeed: (val: number) => void;
  effect: 'none' | 'helium' | 'deep' | 'radio' | 'reverb';
  setEffect: (eff: 'none' | 'helium' | 'deep' | 'radio' | 'reverb') => void;
  onReset: () => void;
}

export const VoiceCustomizer: React.FC<VoiceCustomizerProps> = ({
  pitch,
  setPitch,
  speed,
  setSpeed,
  effect,
  setEffect,
  onReset,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            تخصيص طبقة الصوت والمؤثرات الصوتية
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          title="استعادة الإعدادات الافتراضية للشخصية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الأصل</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pitch Slider */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-purple-400" />
              طبقة الصوت (Pitch):
            </span>
            <span className="font-mono text-amber-400">
              {pitch > 0 ? `+${pitch}% (كرتوني حاد)` : pitch < 0 ? `${pitch}% (جهوري عميق)` : 'طبيعي (0%)'}
            </span>
          </div>

          <input
            type="range"
            id="pitch-slider"
            min="-40"
            max="40"
            step="5"
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-40% (عميق جداً)</span>
            <span>0% (أصلي)</span>
            <span>+40% (طفولي/فالستو)</span>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              سرعة الإلقاء (Speed):
            </span>
            <span className="font-mono text-amber-400">
              {speed}x
            </span>
          </div>

          <input
            type="range"
            id="speed-slider"
            min="0.6"
            max="1.8"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.6x (بطيء وهادئ)</span>
            <span>1.0x (طبيعي)</span>
            <span>1.8x (حماسي وسريع)</span>
          </div>
        </div>
      </div>

      {/* Audio Effects Selector */}
      <div className="pt-2 border-t border-slate-800/60">
        <label className="text-xs text-slate-400 font-semibold block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          مؤثرات صوتية هوليوودية وإضافية:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'none', label: 'بدون مؤثر', desc: 'نقي وأصلي', icon: '🎧' },
            { id: 'helium', label: 'هيليوم كرتوني', desc: 'صوت مضحك حاد', icon: '🎈' },
            { id: 'deep', label: 'سينما عميق', desc: 'تريلر جهوري فخم', icon: '🎬' },
            { id: 'reverb', label: 'صدى المكان', desc: 'قاعة واسعة', icon: '🏛️' },
            { id: 'radio', label: 'راديو ولاسلكي', desc: 'مخابرة هاتفية', icon: '📻' },
          ].map((eff) => {
            const isSelected = effect === eff.id;
            return (
              <button
                key={eff.id}
                type="button"
                onClick={() => setEffect(eff.id as 'none' | 'helium' | 'deep' | 'radio' | 'reverb')}
                className={`p-2.5 rounded-xl text-right transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-base mb-1">{eff.icon}</div>
                <div className="text-xs font-bold truncate">{eff.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{eff.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
