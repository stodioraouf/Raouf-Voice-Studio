import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, Check, Share2, Sparkles, Sliders } from 'lucide-react';
import { AudioEngine, triggerAudioDownload } from '../utils/audioEffects';
import { GeneratedAudioItem } from '../types';

interface AudioPlayerSectionProps {
  currentAudio: GeneratedAudioItem;
  pitch: number;
  speed: number;
  effect: 'none' | 'helium' | 'deep' | 'radio' | 'reverb';
}

export const AudioPlayerSection: React.FC<AudioPlayerSectionProps> = ({
  currentAudio,
  pitch,
  speed,
  effect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const engineRef = useRef<AudioEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize engine and load current audio
  useEffect(() => {
    const engine = new AudioEngine();
    engineRef.current = engine;

    engine.loadAudioFromUrl(currentAudio.audioDataUrl).then((buf) => {
      setDuration(buf.duration);
      setCurrentTime(0);
    }).catch((err) => {
      console.error('Failed to load audio buffer:', err);
    });

    return () => {
      engine.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentAudio.id, currentAudio.audioDataUrl]);

  // Audio visualizer drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw background center line
      ctx.beginPath();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      const bars = 48;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        let barHeight = 6;
        if (isPlaying) {
          // Dynamic simulated frequencies
          const freq1 = Math.sin((i / bars) * Math.PI * 4 + phase) * 0.5 + 0.5;
          const freq2 = Math.cos((i / bars) * Math.PI * 2 - phase * 1.5) * 0.5 + 0.5;
          barHeight = (freq1 * 0.6 + freq2 * 0.4) * (height * 0.75) + 6;
        } else {
          // Idle gentle waveform
          barHeight = Math.sin((i / bars) * Math.PI) * 16 + 4;
        }

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(0.5, '#ea580c');
          gradient.addColorStop(1, '#ef4444');
        } else {
          gradient.addColorStop(0, '#475569');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += 0.08;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Update timer while playing
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      startTimeRef.current = Date.now() - currentTime * 1000;
      interval = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const adjustedDuration = duration / (speed || 1.0);
        if (elapsed >= adjustedDuration) {
          setIsPlaying(false);
          setCurrentTime(adjustedDuration);
        } else {
          setCurrentTime(elapsed);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, speed]);

  const handlePlayToggle = () => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
    } else {
      let offset = currentTime;
      if (currentTime >= duration / (speed || 1.0) - 0.1) {
        offset = 0;
        setCurrentTime(0);
      }

      engineRef.current.play({
        speed,
        pitchPercent: pitch,
        effect,
        volume,
        offset,
        onEnded: () => {
          setIsPlaying(false);
          setCurrentTime(duration / (speed || 1.0));
        },
      });
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (!engineRef.current) return;
    engineRef.current.stop();
    setCurrentTime(0);
    engineRef.current.play({
      speed,
      pitchPercent: pitch,
      effect,
      volume,
      offset: 0,
      onEnded: () => {
        setIsPlaying(false);
      },
    });
    setIsPlaying(true);
  };

  const handleDownload = () => {
    const cleanName = (currentAudio.characterName || 'صوت')
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0600-\u06FF]/gi, '');
    const fileName = `رؤوف_شروحات_${cleanName}_${Date.now()}.wav`;

    triggerAudioDownload(currentAudio.audioDataUrl, fileName);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentAudio.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveDuration = duration / (speed || 1.0);

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ring-1 ring-amber-500/20">
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Track info bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 shrink-0">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {currentAudio.characterName}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentAudio.language}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
              "{currentAudio.text}"
            </p>
          </div>
        </div>

        {/* Primary Download Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-download-audio"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-102 active:scale-98"
            title="تحميل ملف الصوت بجودة عالية WAV"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>تم التحميل بنجاح!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>تحميل ملف الصوت (WAV)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors"
            title="نسخ النص"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="py-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={64}
          className="w-full h-16 rounded-xl bg-slate-950/80 border border-slate-800/80"
        />
      </div>

      {/* Time & Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1.5 text-amber-400/90">
            <Sparkles className="w-3 h-3" />
            {formatTime(effectiveDuration || 0)}
          </span>
        </div>

        <div className="relative w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all"
            style={{
              width: `${effectiveDuration ? Math.min(100, (currentTime / effectiveDuration) * 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="mt-5 pt-3 flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause & Replay */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-play-pause"
            onClick={handlePlayToggle}
            className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 flex items-center justify-center font-bold shadow-xl shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-slate-950" />
            ) : (
              <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-all"
            title="إعادة التشغيل من البداية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live modifiers indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            السرعة: <strong className="text-white">{speed}x</strong>
          </span>
          <span>•</span>
          <span>
            طبقة: <strong className="text-white">{pitch > 0 ? `+${pitch}%` : `${pitch}%`}</strong>
          </span>
          {effect !== 'none' && (
            <>
              <span>•</span>
              <span className="text-amber-400 font-sans font-bold">
                مؤثر: {effect}
              </span>
            </>
          )}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            title="مستوى الصوت"
          />
        </div>
      </div>
    </div>
  );
};
