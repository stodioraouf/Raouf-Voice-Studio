import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { TextInputSection } from './components/TextInputSection';
import { VoiceCustomizer } from './components/VoiceCustomizer';
import { AudioPlayerSection } from './components/AudioPlayerSection';
import { AudioImporter } from './components/AudioImporter';
import { HistoryList } from './components/HistoryList';
import { CARTOON_VOICES } from './data/presets';
import { LANGUAGES } from './data/languages';
import { VoicePreset, ClonedVoice, LanguageOption, GeneratedAudioItem } from './types';
import { Sparkles, Loader2, Volume2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'import' | 'history'>('generate');

  // Selected Voice
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset | ClonedVoice>(CARTOON_VOICES[0]);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>(() => {
    try {
      const saved = localStorage.getItem('raouf_cloned_voices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Text & Speech options
  const [text, setText] = useState<string>(CARTOON_VOICES[0].sampleTextAr);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('مرح وفكاهي');

  // Customizer options
  const [pitch, setPitch] = useState<number>(CARTOON_VOICES[0].pitchShift);
  const [speed, setSpeed] = useState<number>(CARTOON_VOICES[0].speed);
  const [effect, setEffect] = useState<'none' | 'helium' | 'deep' | 'radio' | 'reverb'>(
    CARTOON_VOICES[0].effect || 'none'
  );

  // Active generated audio & History
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [history, setHistory] = useState<GeneratedAudioItem[]>(() => {
    try {
      const saved = localStorage.getItem('raouf_audio_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Loading & error states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync cloned voices to local storage
  useEffect(() => {
    try {
      localStorage.setItem('raouf_cloned_voices', JSON.stringify(clonedVoices));
    } catch (e) {
      console.error('Failed to save cloned voices:', e);
    }
  }, [clonedVoices]);

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('raouf_audio_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save audio history:', e);
    }
  }, [history]);

  // When selected voice changes, update default parameters and sample text if user hasn't typed custom
  const handleSelectVoice = (voice: VoicePreset | ClonedVoice) => {
    setSelectedVoice(voice);
    setPitch(voice.pitchShift || 0);
    setSpeed(voice.speed || 1.0);
    if ('effect' in voice && voice.effect) {
      setEffect(voice.effect);
    } else {
      setEffect('none');
    }
    if ('defaultEmotion' in voice && voice.defaultEmotion) {
      setSelectedEmotion(voice.defaultEmotion);
    }
    if ('sampleTextAr' in voice && voice.sampleTextAr) {
      setText(voice.sampleTextAr);
    }
  };

  // Reset current voice parameters to defaults
  const handleResetVoiceParams = () => {
    setPitch(selectedVoice.pitchShift || 0);
    setSpeed(selectedVoice.speed || 1.0);
    if ('effect' in selectedVoice && selectedVoice.effect) {
      setEffect(selectedVoice.effect);
    } else {
      setEffect('none');
    }
  };

  // Callback when a new voice is cloned from imported file
  const handleVoiceCloned = (newClonedVoice: ClonedVoice) => {
    setClonedVoices((prev) => [newClonedVoice, ...prev]);
    setSelectedVoice(newClonedVoice);
    setPitch(newClonedVoice.pitchShift);
    setSpeed(newClonedVoice.speed);
    if (newClonedVoice.transcription) {
      setText(newClonedVoice.transcription);
    }
    setActiveTab('generate');
  };

  // Auto translate text
  const handleTranslateText = async (targetLangName: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetLangName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشلت عملية الترجمة');
      }
      setText(data.translatedText);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'حدث خطأ أثناء الترجمة');
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate TTS
  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setErrorMessage('يرجى كتابة نص ليقوم الذكاء الاصطناعي بنطقه');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const characterName = 'nameAr' in selectedVoice ? selectedVoice.nameAr : selectedVoice.name;
      const characterPrompt =
        'systemPromptDirective' in selectedVoice
          ? selectedVoice.systemPromptDirective
          : selectedVoice.directives;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceName: selectedVoice.baseVoice,
          characterName,
          characterPrompt,
          language: selectedLanguage.nameAr,
          emotion: selectedEmotion,
          speed,
          pitch,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشلت عملية توليد الصوت');
      }

      const newAudioItem: GeneratedAudioItem = {
        id: `audio-${Date.now()}`,
        text: text.trim(),
        voiceName: selectedVoice.baseVoice,
        characterName,
        category: selectedVoice.category,
        language: selectedLanguage.nameAr,
        audioDataUrl: data.audioDataUrl,
        createdAt: Date.now(),
        settings: {
          pitch,
          speed,
          effect,
          emotion: selectedEmotion,
        },
      };

      setCurrentAudio(newAudioItem);
      setHistory((prev) => [newAudioItem, ...prev.slice(0, 49)]); // keep last 50
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error generating audio:', error);
      setErrorMessage(error.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي لتوليد الصوت');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCharacterName = 'nameAr' in selectedVoice ? selectedVoice.nameAr : selectedVoice.name;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clonedCount={clonedVoices.length}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-red-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 text-xs px-2 py-1 bg-red-500/10 rounded-lg"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* TAB 1: GENERATE VOICE */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* Voice Catalog Selector */}
            <VoiceSelector
              selectedVoiceId={selectedVoice.id}
              onSelectVoice={handleSelectVoice}
              clonedVoices={clonedVoices}
              onOpenImportModal={() => setActiveTab('import')}
            />

            {/* Two-column generation area: Input + Customizer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Desktop: 7 cols): Text Input & Language */}
              <div className="lg:col-span-7 space-y-6">
                <TextInputSection
                  text={text}
                  setText={setText}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  selectedEmotion={selectedEmotion}
                  setSelectedEmotion={setSelectedEmotion}
                  selectedVoice={selectedVoice}
                  isTranslating={isTranslating}
                  onTranslateText={handleTranslateText}
                />

                {/* Primary Call-to-Action: Generate Speech */}
                <button
                  type="button"
                  id="btn-generate-speech"
                  onClick={handleGenerateTTS}
                  disabled={isGenerating || !text.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                      <span>جاري توليد ونسخ صوت ({currentCharacterName}) عبر Gemini TTS...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
                      <span>
                        توليد ونطق الصوت الآن بصوت ({currentCharacterName})
                      </span>
                      <Sparkles className="w-5 h-5 text-slate-950/80" />
                    </>
                  )}
                </button>
              </div>

              {/* Right Column (Desktop: 5 cols): Voice Customizer & Effects */}
              <div className="lg:col-span-5 space-y-6">
                <VoiceCustomizer
                  pitch={pitch}
                  setPitch={setPitch}
                  speed={speed}
                  setSpeed={setSpeed}
                  effect={effect}
                  setEffect={setEffect}
                  onReset={handleResetVoiceParams}
                />
              </div>
            </div>

            {/* Active Audio Player Section when audio exists */}
            {currentAudio && (
              <div className="pt-2">
                <AudioPlayerSection
                  currentAudio={currentAudio}
                  pitch={pitch}
                  speed={speed}
                  effect={effect}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IMPORT & CLONE AUDIO FILE */}
        {activeTab === 'import' && (
          <div className="max-w-4xl mx-auto">
            <AudioImporter
              onVoiceCloned={handleVoiceCloned}
              onClose={() => setActiveTab('generate')}
            />
          </div>
        )}

        {/* TAB 3: SAVED AUDIOS HISTORY */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <HistoryList
              history={history}
              onPlayItem={(item) => {
                setCurrentAudio(item);
                setActiveTab('generate');
              }}
              onClearHistory={() => setHistory([])}
              onDeleteItem={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-slate-200">رؤوف شروحات</span>
            <span>•</span>
            <span>استنساخ الأصوات الكرتونية والحقيقية بالذكاء الاصطناعي</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Model: gemini-3.1-flash-tts-preview</span>
            <span>•</span>
            <span>تصدير WAV عالي الدقة</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
