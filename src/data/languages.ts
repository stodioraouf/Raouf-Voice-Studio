import { LanguageOption } from '../types';

export const LANGUAGES: LanguageOption[] = [
  // اللغات الأكثر طلباً وشيوعاً
  { code: 'ar-SA', nameAr: 'العربية (السعودية / الخليجية)', nameNative: 'العربية (السعودية)', flag: '🇸🇦', popular: true },
  { code: 'ar-EG', nameAr: 'العربية (اللهجة المصرية)', nameNative: 'العربية (مصر)', flag: '🇪🇬', popular: true },
  { code: 'ar-DZ', nameAr: 'العربية (اللهجة الجزائرية)', nameNative: 'العربية (الجزائر)', flag: '🇩🇿', popular: true },
  { code: 'ar-MA', nameAr: 'العربية (اللهجة المغربية)', nameNative: 'العربية (المغرب)', flag: '🇲🇦', popular: true },
  { code: 'ar-IQ', nameAr: 'العربية (اللهجة العراقية)', nameNative: 'العربية (العراق)', flag: '🇮🇶', popular: true },
  { code: 'ar-SY', nameAr: 'العربية (اللهجة الشامية / السورية)', nameNative: 'العربية (بلاد الشام)', flag: '🇸🇾', popular: true },
  { code: 'ar-TN', nameAr: 'العربية (اللهجة التونسية)', nameNative: 'العربية (تونس)', flag: '🇹🇳', popular: true },
  { code: 'ar-MSA', nameAr: 'العربية (الفصحى الحديثة)', nameNative: 'العربية الفصحى', flag: '🌐', popular: true },
  
  // اللغات العالمية الكبرى
  { code: 'en-US', nameAr: 'الإنجليزية (الأمريكية)', nameNative: 'English (US)', flag: '🇺🇸', popular: true },
  { code: 'en-GB', nameAr: 'الإنجليزية (البريطانية)', nameNative: 'English (UK)', flag: '🇬🇧', popular: true },
  { code: 'fr-FR', nameAr: 'الفرنسية', nameNative: 'Français', flag: '🇫🇷', popular: true },
  { code: 'es-ES', nameAr: 'الإسبانية', nameNative: 'Español', flag: '🇪🇸', popular: true },
  { code: 'de-DE', nameAr: 'الألمانية', nameNative: 'Deutsch', flag: '🇩🇪', popular: true },
  { code: 'tr-TR', nameAr: 'التركية', nameNative: 'Türkçe', flag: '🇹🇷', popular: true },
  { code: 'ja-JP', nameAr: 'اليابانية (أنيمي وتلفاز)', nameNative: '日本語', flag: '🇯🇵', popular: true },
  { code: 'ko-KR', nameAr: 'الكورية (دراما وكيبوب)', nameNative: '한국어', flag: '🇰🇷', popular: true },
  { code: 'zh-CN', nameAr: 'الصينية (الماندرين)', nameNative: '中文 (简体)', flag: '🇨🇳', popular: true },
  { code: 'ru-RU', nameAr: 'الروسية', nameNative: 'Русский', flag: '🇷🇺', popular: true },
  { code: 'it-IT', nameAr: 'الإيطالية', nameNative: 'Italiano', flag: '🇮🇹', popular: true },
  { code: 'pt-BR', nameAr: 'البرتغالية (البرازيلية)', nameNative: 'Português (Brasil)', flag: '🇧🇷', popular: true },
  { code: 'hi-IN', nameAr: 'الهندية (بوليوود)', nameNative: 'हिन्दी', flag: '🇮🇳', popular: true },
  { code: 'ur-PK', nameAr: 'الأردية', nameNative: 'اردو', flag: '🇵🇰', popular: true },
  { code: 'fa-IR', nameAr: 'الفارسية', nameNative: 'فارسی', flag: '🇮🇷', popular: true },
  { code: 'id-ID', nameAr: 'الإندونيسية', nameNative: 'Bahasa Indonesia', flag: '🇮🇩', popular: true },
  
  // لغات عالمية إضافية تغطي كافة أرجاء المعمورة
  { code: 'nl-NL', nameAr: 'الهولندية', nameNative: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl-PL', nameAr: 'البولندية', nameNative: 'Polski', flag: '🇵🇱' },
  { code: 'sv-SE', nameAr: 'السويدية', nameNative: 'Svenska', flag: '🇸🇪' },
  { code: 'el-GR', nameAr: 'اليونانية', nameNative: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ro-RO', nameAr: 'الرومانية', nameNative: 'Română', flag: '🇷🇴' },
  { code: 'hu-HU', nameAr: 'الهنغارية (المجرية)', nameNative: 'Magyar', flag: '🇭🇺' },
  { code: 'cs-CZ', nameAr: 'التشيكية', nameNative: 'Čeština', flag: '🇨🇿' },
  { code: 'uk-UA', nameAr: 'الأوكرانية', nameNative: 'Українська', flag: '🇺🇦' },
  { code: 'vi-VN', nameAr: 'الفيتنامية', nameNative: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th-TH', nameAr: 'التايلاندية', nameNative: 'ไทย', flag: '🇹🇭' },
  { code: 'ms-MY', nameAr: 'الماليزية', nameNative: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'bn-BD', nameAr: 'البنغالية', nameNative: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta-IN', nameAr: 'التاميلية', nameNative: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', nameAr: 'التيلوغو', nameNative: 'తెలుగు', flag: '🇮🇳' },
  { code: 'sw-KE', nameAr: 'السواحيلية', nameNative: 'Kiswahili', flag: '🇰🇪' },
  { code: 'he-IL', nameAr: 'العبرية', nameNative: 'עברית', flag: '🇮🇱' },
  { code: 'da-DK', nameAr: 'الدنماركية', nameNative: 'Dansk', flag: '🇩🇰' },
  { code: 'fi-FI', nameAr: 'الفنلندية', nameNative: 'Suomi', flag: '🇫🇮' },
  { code: 'no-NO', nameAr: 'النرويجية', nameNative: 'Norsk', flag: '🇳🇴' },
  { code: 'tl-PH', nameAr: 'الفلبينية (تاغالوغ)', nameNative: 'Filipino', flag: '🇵🇭' }
];
