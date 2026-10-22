import React, { useState, useRef } from 'react';
import { UploadCloud, Mic, Square, Play, Pause, Loader2, Sparkles, Check, AlertCircle, FileAudio, RotateCcw } from 'lucide-react';
import { fileToBase64, blobToBase64 } from '../utils/audioEffects';
import { ClonedVoice, CloneVoiceAnalysisResponse, BaseGeminiVoice } from '../types';

interface AudioImporterProps {
  onVoiceCloned: (clonedVoice: ClonedVoice) => void;
  onClose?: () => void;
}

export const AudioImporter: React.FC<AudioImporterProps> = ({
  onVoiceCloned,
  onClose,
}) => {
  const [audioSource, setAudioSource] = useState<{
    file?: File;
    blob?: Blob;
    url: string;
    name: string;
    size: string;
    mimeType: string;
  } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CloneVoiceAnalysisResponse | null>(null);
  const [customVoiceName, setCustomVoiceName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file select
  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    setAnalysisResult(null);
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|webm|flac)$/i)) {
      setErrorMsg('يرجى اختيار ملف صوتي مدعوم مثل MP3, WAV, M4A, OGG, WEBM');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('حجم الملف كبير جداً، يرجى اختيار مقطع صوتي أقل من 25 ميغابايت');
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioSource({
      file,
      url,
      name: file.name,
      size: `${sizeMb} MB`,
      mimeType: file.type || 'audio/mp3',
    });
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Microphone recording
  const startRecording = async () => {
    setErrorMsg(null);
    setAnalysisResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const sizeKb = (blob.size / 1024).toFixed(1);

        setAudioSource({
          blob,
          url,
          name: `تسجيل_صوتي_${new Date().toLocaleTimeString('ar-SA')}.webm`,
          size: `${sizeKb} KB`,
          mimeType,
        });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setErrorMsg('تعذر الوصول إلى الميكروفون. يرجى منح إذن الميكروفون في المتصفح أو رفع ملف صوتي بدلاً من ذلك.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Analyze and Clone Voice
  const handleAnalyzeAndClone = async () => {
    if (!audioSource) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      let base64 = '';
      if (audioSource.file) {
        base64 = await fileToBase64(audioSource.file);
      } else if (audioSource.blob) {
        base64 = await blobToBase64(audioSource.blob);
      }

      const res = await fetch('/api/clone-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64,
          mimeType: audioSource.mimeType,
          fileName: audioSource.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تحليل الصوت');
      }

      setAnalysisResult(data);
      setCustomVoiceName(data.voiceNameSuggestion || 'صوت مستنسخ جديد');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Voice clone failed:', error);
      setErrorMsg(error.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي لتحليل الصوت.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save the voice and activate it
  const handleSaveAndUse = () => {
    if (!analysisResult) return;

    const newClonedVoice: ClonedVoice = {
      id: `cloned-${Date.now()}`,
      name: customVoiceName.trim() || analysisResult.voiceNameSuggestion || 'صوت مستنسخ',
      category: 'custom',
      avatar: '🧬',
      originalFileName: audioSource?.name,
      description: `${analysisResult.characterArchetype} • نبرة ${analysisResult.vocalTraits.tone} • طبقة ${analysisResult.vocalTraits.pitch}`,
      baseVoice: analysisResult.recommendedBaseVoice as BaseGeminiVoice,
      pitchShift: analysisResult.suggestedPitchShift || 0,
      speed: 1.0,
      directives: analysisResult.mimicryDirectives,
      transcription: analysisResult.transcription,
      createdAt: Date.now(),
      audioSampleData: audioSource?.url,
    };

    onVoiceCloned(newClonedVoice);
    if (onClose) onClose();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <FileAudio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              استيراد ملف صوتي واستنساخ النبرة
            </h2>
            <p className="text-xs text-slate-400">
              ارفع ملف صوتي لشخص حقيقي أو شخصية كرتونية ليتم نسخ هويته الصوتية فوراً
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone & Mic Record Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Drag & Drop */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm,.flac"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-all">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              اسحب وأفلت الملف الصوتي هنا
            </p>
            <p className="text-xs text-slate-500 mt-1">
              أو انقر لتصفح ملفات جهازك (MP3, WAV, M4A, OGG)
            </p>
          </div>
        </div>

        {/* Live Mic Recording */}
        <div className="border border-slate-800 bg-slate-950/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-14 h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition-all hover:scale-105"
                title="بدء التسجيل بالميكروفون"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30"
                title="إيقاف التسجيل"
              >
                <Square className="w-6 h-6" />
              </button>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-200">
              {isRecording ? 'جاري التسجيل الصوتي الآن...' : 'أو سجّل صوتك مباشرة'}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {isRecording ? (
                <span className="text-red-400 font-bold flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  مدة التسجيل: {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, '0')}
                </span>
              ) : (
                'تحدث بجملة واحدة بصوتك أو قلد شخصية لمدة 5-15 ثانية'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Audio Preview Card */}
      {audioSource && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioPreviewRef.current) {
                  if (isPlayingPreview) {
                    audioPreviewRef.current.pause();
                    setIsPlayingPreview(false);
                  } else {
                    audioPreviewRef.current.play();
                    setIsPlayingPreview(true);
                  }
                }
              }}
              className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 hover:brightness-110 shadow-md shadow-amber-500/20"
            >
              {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">
                {audioSource.name}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                الحجم: {audioSource.size}
              </p>
            </div>
            <audio
              ref={audioPreviewRef}
              src={audioSource.url}
              onEnded={() => setIsPlayingPreview(false)}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAudioSource(null);
                setAnalysisResult(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 border border-slate-800 rounded-lg hover:bg-slate-800/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء الملف</span>
            </button>

            {!analysisResult && (
              <button
                type="button"
                id="btn-analyze-voice"
                onClick={handleAnalyzeAndClone}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تحليل واستنساخ البصمة الصوتية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تحليل واستنساخ نبرة الصوت</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Analysis & Extracted Characteristics Result */}
      {analysisResult && (
        <div className="bg-gradient-to-b from-amber-500/10 to-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Check className="w-5 h-5" />
              <span className="font-bold text-sm">تم استخراج البصمة الصوتية بنجاح!</span>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
              القاعدة الموصى بها: {analysisResult.recommendedBaseVoice}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">النمط والشخصية الأقرب:</span>
              <strong className="text-white font-bold">{analysisResult.characterArchetype}</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">طبقة الصوت (Pitch):</span>
              <strong className="text-amber-400 font-bold">{analysisResult.vocalTraits.pitch}</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">النبرة والمزاج:</span>
              <strong className="text-slate-200 font-bold">{analysisResult.vocalTraits.tone}</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">مستوى الطاقة والملمس:</span>
              <strong className="text-slate-200 font-bold">
                {analysisResult.vocalTraits.energy} • {analysisResult.vocalTraits.texture}
              </strong>
            </div>
          </div>

          {analysisResult.transcription && (
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                تفريغ ما قيل في المقطع الصوتي:
              </span>
              <p className="text-xs text-slate-300 italic bg-slate-950 p-2 rounded-lg border border-slate-800">
                "{analysisResult.transcription}"
              </p>
            </div>
          )}

          {/* Edit Name & Confirm */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                اسم الصوت المستنسخ في مكتبتك:
              </label>
              <input
                type="text"
                value={customVoiceName}
                onChange={(e) => setCustomVoiceName(e.target.value)}
                placeholder="أدخل اسماً مميزاً لهذا الصوت"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:self-end w-full sm:w-auto">
              <button
                type="button"
                id="btn-save-cloned-voice"
                onClick={handleSaveAndUse}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>حفظ الصوت والبدء في التحدث به فوراً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
