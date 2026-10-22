import React from 'react';
import { Mic, Sparkles, Wand2, Volume2, Globe, FileAudio, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generate' | 'import' | 'history';
  setActiveTab: (tab: 'generate' | 'import' | 'history') => void;
  clonedCount: number;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  clonedCount,
  historyCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
              <Volume2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 ring-2 ring-slate-900"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  رؤوف شروحات
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-3 h-3" /> استنساخ الأصوات
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                استنساخ وتحويل النصوص لأصوات الكرتون والأشخاص الحقيقية مع دعم استيراد الملفات وكافة اللغات
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              id="tab-generate-btn"
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'generate'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>توليد الأصوات</span>
            </button>

            <button
              id="tab-import-btn"
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'import'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileAudio className="w-4 h-4" />
              <span>استيراد واستنساخ ملف</span>
              {clonedCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {clonedCount}
                </span>
              )}
            </button>

            <button
              id="tab-history-btn"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>الصوتيات المحفوظة</span>
              {historyCount > 0 && (
                <span className="bg-slate-700 text-slate-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Feature Highlights Bar */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/50 flex items-center justify-between overflow-x-auto text-[11px] text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-nowrap shrink-0">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              محرك: <strong className="text-amber-400">gemini-3.1-flash-tts-preview</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              قائمة جميع لغات ولهجات العالم
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              استنساخ ملفات حقيقية + كرتون
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-amber-400" />
              تنزيل WAV فائق الوضوح
            </span>
          </div>

          <div className="shrink-0 text-slate-400 font-mono text-[11px]">
            v2.0 • رؤوف شروحات
          </div>
        </div>

      </div>
    </header>
  );
};
