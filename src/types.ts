export type VoiceCategory = 'cartoon' | 'real' | 'custom';

export type BaseGeminiVoice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface VoicePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  category: VoiceCategory;
  avatar: string;
  badge: string;
  descriptionAr: string;
  descriptionEn: string;
  baseVoice: BaseGeminiVoice;
  pitchShift: number; // -50 to +50 percent
  speed: number; // 0.5 to 2.0
  defaultEmotion: string;
  systemPromptDirective: string;
  sampleTextAr: string;
  sampleTextEn: string;
  effect?: 'none' | 'helium' | 'deep' | 'radio' | 'reverb';
}

export interface ClonedVoice {
  id: string;
  name: string;
  category: 'custom';
  avatar: string;
  originalFileName?: string;
  description: string;
  baseVoice: BaseGeminiVoice;
  pitchShift: number;
  speed: number;
  directives: string;
  transcription?: string;
  createdAt: number;
  audioSampleData?: string; // base64
}

export interface LanguageOption {
  code: string;
  nameAr: string;
  nameNative: string;
  flag: string;
  popular?: boolean;
}

export interface GeneratedAudioItem {
  id: string;
  text: string;
  voiceName: string;
  characterName: string;
  category: VoiceCategory;
  language: string;
  audioDataUrl: string; // data:audio/wav;base64,...
  durationSeconds?: number;
  createdAt: number;
  settings: {
    pitch: number;
    speed: number;
    effect: string;
    emotion: string;
  };
}

export interface TTSRequestPayload {
  text: string;
  voiceName?: BaseGeminiVoice;
  characterName: string;
  characterPrompt?: string;
  language?: string;
  emotion?: string;
  speed?: number;
  pitch?: number;
}

export interface CloneVoiceAnalysisResponse {
  success: boolean;
  characterArchetype: string;
  voiceNameSuggestion: string;
  recommendedBaseVoice: BaseGeminiVoice;
  vocalTraits: {
    pitch: string;
    tone: string;
    energy: string;
    texture: string;
  };
  mimicryDirectives: string;
  transcription?: string;
  suggestedPitchShift: number;
  error?: string;
}
