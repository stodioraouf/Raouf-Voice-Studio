import React from 'react';
import { Download, Play, Trash2, Clock, Volume2, Sparkles } from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { triggerAudioDownload } from '../utils/audioEffects';

interface HistoryListProps {
  history: GeneratedAudioItem[];
  onPlayItem: (item: GeneratedAudioItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayItem,
  onClearHistory,
  onDeleteItem,
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Volume2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200">
          سجل الصوتيات فارغ حالياً
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          كل مقطع صوتي تقوم بتوليده أو استنساخه سيظهر هنا لتتمكن من إعادة الاستماع إليه وتحميله في أي وقت!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            الصوتيات المولدة والمحفوظة ({history.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح السجل</span>
        </button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {history.map((item) => {
          const dateStr = new Date(item.createdAt).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onPlayItem(item)}
                  className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:brightness-110 shrink-0 shadow-md shadow-amber-500/20"
                  title="تشغيل هذا المقطع"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {item.characterName}
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.2 rounded border border-amber-500/20">
                      {item.language}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    "{item.text}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const cleanName = (item.characterName || 'صوت')
                      .replace(/\s+/g, '_')
                      .replace(/[^\w\u0600-\u06FF]/gi, '');
                    triggerAudioDownload(item.audioDataUrl, `رؤوف_شروحات_${cleanName}_${item.id}.wav`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700/80 rounded-lg text-xs font-bold transition-all shadow-sm hover:border-amber-500/40"
                  title="تحميل المقطع الصوتي"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="حذف من السجل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
