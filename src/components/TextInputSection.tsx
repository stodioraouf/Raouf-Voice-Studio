import React, { useState, useMemo } from 'react';
import { Globe, Languages, Sparkles, Wand2, RefreshCw, X } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { LanguageOption, VoicePreset, ClonedVoice } from '../types';

interface TextInputSectionProps {
  text: string;
  setText: (t: string) => void;
  selectedLanguage: LanguageOption;
  setSelectedLanguage: (lang: LanguageOption) => void;
  selectedEmotion: string;
  setSelectedEmotion: (emotion: string) => void;
  selectedVoice: VoicePreset | ClonedVoice;
  isTranslating: boolean;
  onTranslateText: (targetLangName: string) => void;
}

export const EMOTIONS = [
  { id: 'cheerful', label: 'مرح وفكاهي', emoji: '😄' },
  { id: 'heroic', label: 'حماسي وبطولي', emoji: '🔥' },
  { id: 'dramatic', label: 'درامي جاد', emoji: '🎭' },
  { id: 'calm', label: 'هادئ ومطمئن', emoji: '🌿' },
  { id: 'formal', label: 'رسمي وموقر', emoji: '🎙️' },
  { id: 'villain', label: 'شرير وساخر', emoji: '😈' },
  { id: 'curious', label: 'متسائل وغامض', emoji: '🧐' },
];

export const TextInputSection: React.FC<TextInputSectionProps> = ({
  text,
  setText,
  selectedLanguage,
  setSelectedLanguage,
  selectedEmotion,
  setSelectedEmotion,
  selectedVoice,
  isTranslating,
  onTranslateText,
}) => {
  const [langSearch, setLangSearch] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Filter languages
  const filteredLanguages = useMemo(() => {
    const q = langSearch.toLowerCase().trim();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.nameAr.toLowerCase().includes(q) ||
        l.nameNative.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const characterName = 'nameAr' in selectedVoice ? selectedVoice.nameAr : selectedVoice.name;
  const sampleAr = 'sampleTextAr' in selectedVoice ? selectedVoice.sampleTextAr : '';
  const sampleEn = 'sampleTextEn' in selectedVoice ? selectedVoice.sampleTextEn : '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header bar with Language selector and translation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            النص ولغة الإلقاء
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({text.length} حرف)
          </span>
        </div>

        {/* Searchable Language Selector Modal/Dropdown */}
        <div className="relative">
          <button
            type="button"
            id="btn-language-selector"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-amber-500/80 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-inner"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-base">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.nameAr}</span>
            <span className="text-slate-500 font-normal">▼</span>
          </button>

          {isLangDropdownOpen && (
            <div className="absolute left-0 sm:right-0 mt-2 w-72 sm:w-80 max-h-96 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  قائمة جميع لغات ولهجات العالم
                </span>
                <button
                  onClick={() => setIsLangDropdownOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search input in language dropdown */}
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="ابحث عن لغة (مثال: فرنسية، يابانية، مصرية...)"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 mb-2"
                autoFocus
              />

              <div className="overflow-y-auto max-h-64 space-y-1 pr-1">
                {filteredLanguages.map((lang) => {
                  const isCurrent = lang.code === selectedLanguage.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span className="text-right">{lang.nameAr}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lang.nameNative}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="speech-text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`اكتب هنا أي كلام ترغب في أن ينطقه ${characterName} بصوته المميز وبأي لغة...`}
          rows={4}
          className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-y leading-relaxed"
        />

        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            className="absolute top-3 left-3 text-slate-500 hover:text-slate-300 p-1 bg-slate-900 rounded-md"
            title="مسح النص"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action Bar: Translation & Sample Prompts */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Quick Translate Button */}
        <div className="flex items-center gap-2">
          {text.trim() && (
            <button
              type="button"
              id="btn-auto-translate"
              onClick={() => onTranslateText(selectedLanguage.nameAr)}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>جاري ترجمة النص إلى {selectedLanguage.nameAr}...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>ترجمة النص تلقائياً إلى ({selectedLanguage.nameNative})</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Sample text insertion */}
        {(sampleAr || sampleEn) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">جمل مقترحة:</span>
            {sampleAr && (
              <button
                type="button"
                onClick={() => setText(sampleAr)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] transition-colors"
              >
                جملة بالعربية
              </button>
            )}
            {sampleEn && (
              <button
                type="button"
                onClick={() => setText(sampleEn)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] transition-colors"
              >
                English Sample
              </button>
            )}
          </div>
        )}
      </div>

      {/* Emotion / Tone Selector Chips */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-xs text-slate-400 font-semibold block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          نبرة المشاعر وحالة الصوت:
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => {
            const isSelected = selectedEmotion === emotion.label;
            return (
              <button
                key={emotion.id}
                type="button"
                onClick={() => setSelectedEmotion(emotion.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{emotion.emoji}</span>
                <span>{emotion.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
