import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Support large audio base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy/Safe initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Wraps raw 16-bit PCM little-endian audio in a standard 44-byte WAV header.
 * Gemini TTS output is 24000Hz, 1 channel (mono), 16-bit PCM.
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  if (pcmBuffer.length >= 4 && pcmBuffer.toString("ascii", 0, 4) === "RIFF") {
    return pcmBuffer; // already a WAV
  }
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // "fmt " sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  header.writeUInt16LE(1, 20); // audio format (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // "data" sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", app: "رؤوف شروحات" });
});

// 2. TTS Generation with gemini-3.1-flash-tts-preview
app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = "Puck",
      characterName = "شخصية كرتونية",
      characterPrompt = "",
      language = "العربية",
      emotion = "مرح وحيوي",
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "يرجى كتابة نص ليتم تحويله إلى صوت" });
      return;
    }

    const ai = getAi();

    // Direct Gemini TTS model with performance instruction
    const promptDirective = `You are a master voice actor and character mimic.
Target Character/Voice: "${characterName}".
Vocal Character Directives: ${characterPrompt || "Expressive and distinctive caricature voice acting"}.
Target Language / Dialect: "${language}".
Tone & Emotion: "${emotion}".

Pronounce and perform the following speech precisely in the specified voice and character style:
"${text.trim()}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: promptDirective }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || "Puck",
            },
          },
        },
      },
    });

    const rawBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!rawBase64) {
      // Fallback: try direct text prompt if the character directive was too long
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text.trim() }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || "Puck" },
            },
          },
        },
      });

      const fallbackBase64 = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!fallbackBase64) {
        throw new Error("لم يتمكن نموذج توليد الصوت من إنشاء الصوت. يرجى المحاولة مرة أخرى.");
      }

      const pcmBuffer = Buffer.from(fallbackBase64, "base64");
      const wavBuffer = pcmToWav(pcmBuffer, 24000);
      const audioDataUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;

      res.json({
        success: true,
        audioDataUrl,
        characterName,
        language,
        baseVoice: voiceName,
      });
      return;
    }

    const pcmBuffer = Buffer.from(rawBase64, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, 24000);
    const audioDataUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;

    res.json({
      success: true,
      audioDataUrl,
      characterName,
      language,
      baseVoice: voiceName,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("TTS generation error:", err);
    res.status(500).json({
      error: err.message || "حدث خطأ أثناء معالجة وتوليد الصوت",
    });
  }
});

// 3. Audio File Voice Clone & Analysis
app.post("/api/clone-voice", async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = "audio/mp3", fileName = "voice_sample" } = req.body;

    if (!audioData) {
      res.status(400).json({ error: "لم يتم استلام أي ملف صوتي لتحليله واستنساخه" });
      return;
    }

    const ai = getAi();

    // Clean base64 if it has data url header
    const cleanBase64 = audioData.includes(",") ? audioData.split(",")[1] : audioData;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/mp3",
        data: cleanBase64,
      },
    };

    const promptText = `أنت خبير هندسة صوت واستنساخ طبقات الأصوات (Voice Cloning & Acoustic Profiling).
قم بتحليل هذا الملف الصوتي بدقة لاستخراج هوية الصوت ونبرته المميزة ومطابقته مع شخصيات كرتونية أو أصوات معلقين حقيقيين.
أجب بتنسيق JSON حصراً يحتوي على الحقول التالية:
1. characterArchetype: اسم الشخصية أو النمط الصوتي الأقرب (مثال: كرتون مرح، معلق وثائقي فخم، مذيع أخبار، يوتيوبر حماسي، محارب أنيمي، راوي قصص).
2. voiceNameSuggestion: اسم مقترح مميز للصوت المستنسخ بالعربية (مثال: "صوت كرتوني مشاغب", "معلق فخم مستنسخ", إلخ).
3. recommendedBaseVoice: اختر الأقرب إجبارياً من بين هذه الأسماء الخمسة فقط:
   - 'Puck' (للأصوات الكرتونية، الشبابية، العالية النبرة والمرحة)
   - 'Charon' (للأصوات العميقة، الرجولية، الوثائقية والفخمة)
   - 'Kore' (للأصوات النسائية الدافئة، الرقيقة والواضحة)
   - 'Fenrir' (للأصوات الحماسية، الإخبارية، القوية والموجهة)
   - 'Zephyr' (للأصوات الهادئة، المتزنة والذكية)
4. vocalTraits: كائن يحتوي على:
   - pitch: مستوى طبقة الصوت (عالية / متوسطة / عميقة جداً)
   - tone: نبرة الصوت (مرحة، درامية، رسمية، دافئة، أجشة)
   - energy: مستوى الطاقة (حماسي عالي، هادئ متزن، سريع)
   - texture: ملمس الصوت (ناعم، مبحوح، رنان، أنفي)
5. mimicryDirectives: توجيه دقيق ومفصل باللغتين العربية والإنجليزية يصف كيف يتقمص محرك الذكاء الاصطناعي هذا الصوت بدقة ونبرة تنفسه ومخارج حروفه.
6. transcription: تفريغ نصي دقيق لما قيل في هذا التسجيل الصوتي (إن وُجد).
7. suggestedPitchShift: رقم تقديري لتعديل النغمة بالنسبة المئوية بين -40 و +40.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [audioPart, { text: promptText }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characterArchetype: { type: Type.STRING },
            voiceNameSuggestion: { type: Type.STRING },
            recommendedBaseVoice: {
              type: Type.STRING,
              description: "Must be Puck, Charon, Kore, Fenrir, or Zephyr",
            },
            vocalTraits: {
              type: Type.OBJECT,
              properties: {
                pitch: { type: Type.STRING },
                tone: { type: Type.STRING },
                energy: { type: Type.STRING },
                texture: { type: Type.STRING },
              },
            },
            mimicryDirectives: { type: Type.STRING },
            transcription: { type: Type.STRING },
            suggestedPitchShift: { type: Type.NUMBER },
          },
          required: [
            "characterArchetype",
            "voiceNameSuggestion",
            "recommendedBaseVoice",
            "vocalTraits",
            "mimicryDirectives",
            "suggestedPitchShift",
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");

    // Validate base voice
    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    let baseVoice = parsedJson.recommendedBaseVoice;
    if (!validVoices.includes(baseVoice)) {
      baseVoice = "Puck";
    }

    res.json({
      success: true,
      fileName,
      characterArchetype: parsedJson.characterArchetype || "صوت مخصص",
      voiceNameSuggestion: parsedJson.voiceNameSuggestion || "صوت مستنسخ",
      recommendedBaseVoice: baseVoice,
      vocalTraits: parsedJson.vocalTraits || {
        pitch: "متوسطة",
        tone: "طبيعي",
        energy: "متزن",
        texture: "واضح",
      },
      mimicryDirectives: parsedJson.mimicryDirectives || "تحدث بنفس النبرة والإيقاع الصوتي للتسجيل",
      transcription: parsedJson.transcription || "",
      suggestedPitchShift: typeof parsedJson.suggestedPitchShift === "number" ? parsedJson.suggestedPitchShift : 0,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Voice cloning analysis error:", err);
    res.status(500).json({
      error: err.message || "حدث خطأ أثناء تحليل واستنساخ الملف الصوتي",
    });
  }
});

// 4. Translate text helper
app.post("/api/translate", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      res.status(400).json({ error: "النص واللغة المطلوبة إجبارية" });
      return;
    }

    const ai = getAi();
    const prompt = `Translate the following text accurately and naturally into "${targetLanguage}".
Ensure the tone is fluent and suitable for expressive voice acting and character narration.
Do not include any notes, explanations, or quotes. Output ONLY the translated text:

${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      translatedText: (response.text || "").trim(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || "فشلت الترجمة" });
  }
});

// Start Express server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
