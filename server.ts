import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy initializer for GoogleGenAI
function getGenAIClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('کلید API جمینای تنظیم نشده است. لطفا کلید خود را در منوی "کلید API" بالای صفحه وارد کنید.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Tone descriptions map for prompt engineering
const TONE_PROMPTS: Record<string, string> = {
  cinematic: 'سینمایی و دراماتیک (لحن شیوا، حماسی و مناسب دوبله و فیلم‌های سینمایی فاخر)',
  conversational: 'عامیانه و گفتاری (زبان روزمره، صمیمی، روانی مکالمات خیابانی، اصطلاحات روز و ولاگ)',
  formal: 'رسمی، کتابی و دقیق (وفاداری کامل به واژگان با ادبیات معیار)',
  humorous: 'طنز و شوخ‌طبعانه (استفاده طبیعی و بدون سانسور از جوک‌ها، شوخی‌های بزرگسالانه، کنایه‌ها، متلک‌ها و اصطلاحات طنز متناسب با زبان و فرهنگ مقصد)',
  educational: 'آموزشی و علمی (رعایت ترمینولوژی تخصصی، صراحت و دقت مستندهای علمی)',
};

// Helper function to extract array of client API keys from headers or env
function getClientKeysFromHeader(req: express.Request): string[] {
  const multiKeysHeader = req.headers['x-gemini-api-keys'] as string;
  if (multiKeysHeader) {
    try {
      const parsed = JSON.parse(multiKeysHeader);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((k) => String(k).trim()).filter(Boolean);
      }
    } catch {
      const splitKeys = multiKeysHeader.split(',').map((k) => k.trim()).filter(Boolean);
      if (splitKeys.length > 0) return splitKeys;
    }
  }

  const singleKeyHeader = req.headers['x-gemini-api-key'] as string;
  if (singleKeyHeader && singleKeyHeader.trim()) {
    return [singleKeyHeader.trim()];
  }

  if (process.env.GEMINI_API_KEY) {
    return [process.env.GEMINI_API_KEY.trim()];
  }

  return [];
}

// Helper function to execute Gemini requests with multi-key rotation, model fallback, and rate-limit backoff
async function callGeminiWithRetryAndFallback(
  apiKeys: string[],
  generateParams: {
    contents: any;
    config?: any;
  }
) {
  const rawKeys = apiKeys.length > 0 ? apiKeys : [];
  const keysToTry: string[] = [];
  rawKeys.forEach((k) => {
    const trimmed = String(k || '').trim();
    if (trimmed && !keysToTry.includes(trimmed)) {
      keysToTry.push(trimmed);
    }
  });

  if (process.env.GEMINI_API_KEY) {
    const envKey = process.env.GEMINI_API_KEY.trim();
    if (envKey && !keysToTry.includes(envKey)) {
      keysToTry.push(envKey);
    }
  }

  if (keysToTry.length === 0) {
    throw new Error('کلید API جمینای تنظیم نشده است. لطفاً کلید API خود را وارد کنید.');
  }

  const models = ['gemini-3.6-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (let kIdx = 0; kIdx < keysToTry.length; kIdx++) {
    const currentKey = keysToTry[kIdx];
    if (!currentKey) continue;

    let ai: GoogleGenAI;
    try {
      ai = getGenAIClient(currentKey);
    } catch (e) {
      lastError = e;
      continue;
    }

    for (let mIdx = 0; mIdx < models.length; mIdx++) {
      const modelName = models[mIdx];
      let attempts = 0;
      const maxAttemptsPerModel = 2;

      while (attempts < maxAttemptsPerModel) {
        attempts++;
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: generateParams.contents,
            config: generateParams.config,
          });
          return response;
        } catch (err: any) {
          const msg = err?.message || String(err);
          const is404 = msg.includes('404') || msg.toLowerCase().includes('not found');

          if (!is404 || !lastError) {
            lastError = err;
          }

          const isRateLimit =
            msg.includes('429') ||
            msg.toLowerCase().includes('quota') ||
            msg.toLowerCase().includes('resource_exhausted');

          if (isRateLimit) {
            // 1. If we have more API keys, failover to the next key immediately
            if (kIdx < keysToTry.length - 1) {
              console.warn(`[Gemini Rate Limit] Key #${kIdx + 1} exhausted quota. Switching to Key #${kIdx + 2}...`);
              break; // exit model loop to try next key in outer loop
            }

            // 2. If we have more models to try, failover to the next model immediately
            if (mIdx < models.length - 1 && attempts >= 1) {
              console.warn(`[Gemini Rate Limit] Model ${modelName} rate limited. Falling back to ${models[mIdx + 1]}...`);
              break; // exit attempts loop to try next model in inner loop
            }

            // 3. Otherwise wait for requested retry duration or exponential backoff
            let delayMs = 5000;
            const match = msg.match(/retry in ([0-9.]+)s/i);
            if (match && match[1]) {
              const parsedSec = parseFloat(match[1]);
              if (!isNaN(parsedSec) && parsedSec > 0) {
                delayMs = Math.min(Math.ceil(parsedSec * 1000) + 1000, 65000);
              }
            }
            console.warn(`[Gemini Rate Limit] Model: ${modelName}, Key: #${kIdx + 1}, Attempt: ${attempts}/${maxAttemptsPerModel}. Waiting ${Math.round(delayMs / 1000)}s...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            // Non-rate-limit error (e.g. 404 or bad syntax), move to next model
            break;
          }
        }
      }
    }
  }

  throw lastError || new Error('خطا در ارتباط با هوش مصنوعی. لطفاً کلید API جمینای خود را در تنظیمات بررسی یا به‌روزرسانی کنید.');
}

// API Endpoint: Translate batch of subtitle items
app.post('/api/translate', async (req, res) => {
  try {
    const { items, sourceLanguage, targetLanguage, tone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'آیتمی برای ترجمه ارسال نشده است.' });
    }

    const apiKeys = getClientKeysFromHeader(req);
    const toneDescription = TONE_PROMPTS[tone] || TONE_PROMPTS.cinematic;

    const systemInstruction = `You are an expert subtitle translator and localization specialist.
Your primary job is to translate subtitle text blocks accurately, fluidly, and naturally into ${targetLanguage} while strictly respecting all constraints below:

1. TARGET TONE & UNCENSORED TRANSLATION:
   - Target Tone: ${toneDescription}.
   - UNCENSORED HUMOR & SLANG: When 'humorous' (طنز) or conversational tone is selected, translate comedy, jokes, adult humor, profanity, double entendres, street slang, and banter naturally into authentic target language equivalents without censoring, omitting, sanitizing, or softening any text. Translate all humor boldly and accurately for maximum comedic impact in ${targetLanguage}.
2. STRICT LINE PRESERVATION (NO OMMISSIONS):
   - You MUST translate every single input item provided in the array. Do NOT omit, combine, or skip any item IDs. Every item in input MUST have a matching object in the "translations" array.
3. STRICT TAG & FORMATTING PRESERVATION:
   - Preserve all HTML formatting tags such as <b>, <i>, <u>, <font color="...">, <br/> exactly as they are in the text.
   - Preserve all ASS/SSA subtitle override codes such as {\\pos(...)}, {\\c&H...}, {\\i1}, {\\b1}, etc.
   - Do NOT translate or remove formatting tags, symbols, or numbers inside brackets.
4. SEMANTIC CONTINUITY: Keep individual line meanings concise so subtitles stay readable within time boundaries.
5. JSON RESPONSE FORMAT: You MUST return a JSON object containing an array "translations" where each object has "id" (matching input ID) and "text" (translated string), plus "detectedSourceLanguage" (string describing detected input language).`;

    const promptText = `Translate the following ${items.length} subtitle lines to ${targetLanguage} (Source language: ${sourceLanguage || 'Auto-detect'}):\n` +
      JSON.stringify(items, null, 2);

    const response = await callGeminiWithRetryAndFallback(apiKeys, {
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSourceLanguage: {
              type: Type.STRING,
              description: 'The detected original language of the subtitles (e.g. English, French, Japanese)'
            },
            translations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  text: { type: Type.STRING }
                },
                required: ['id', 'text']
              }
            }
          },
          required: ['translations']
        }
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      return res.status(500).json({ error: 'خطا در قالب‌بندی پاسخ هوش مصنوعی.' });
    }

    return res.json(parsedData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error during translation';
    console.error('Translation error:', err);

    const isRateLimit = message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('resource_exhausted');
    const isAuthError = message.includes('401') || message.includes('403') || message.toLowerCase().includes('api_key') || message.toLowerCase().includes('unauthorized');

    if (isRateLimit) {
      return res.status(429).json({ error: 'Rate limit / Quota exceeded. Retrying automatically...', details: message });
    }
    if (isAuthError) {
      return res.status(401).json({ error: 'Invalid or unauthorized Gemini API key. Please check your BYOK configuration.', details: message });
    }

    return res.status(500).json({ error: message });
  }
});

// API Endpoint: Post-translation quality audit & verification pass (REQ_1)
app.post('/api/verify-translation', async (req, res) => {
  try {
    const { items, targetLanguage, tone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'آیتمی برای ارزیابی کیفیت ارسال نشده است.' });
    }

    const apiKeys = getClientKeysFromHeader(req);
    const toneDescription = TONE_PROMPTS[tone] || TONE_PROMPTS.cinematic;

    const systemInstruction = `You are a chief subtitle editor and QA auditor.
Your job is to perform a post-translation verification pass on translated subtitle lines into ${targetLanguage}.

AUDIT RULES:
1. LINE COUNT EQUALITY: You MUST return a translation object for EVERY input item ID provided. The output length MUST equal ${items.length}.
2. FIX UNTRANSLATED/MISSING LINES: If any line has empty translated text or remains untranslated in English/foreign words when it should be in ${targetLanguage}, translate it accurately.
3. REFINE NATURAL PHRASING: Polish literal or unnatural sentences into smooth, native, conversational phrasing matching the "${toneDescription}" tone.
4. TIMING & LENGTH: Keep line length concise so viewer reading speeds are respected.
5. JSON OUTPUT: Return a JSON object containing "reviewedItems": array of objects { "id": number, "translatedText": string }.`;

    const promptText = `Audit, verify and refine these ${items.length} translated subtitle lines into ${targetLanguage}:\n` +
      JSON.stringify(
        items.map((i: any) => ({
          id: i.id,
          originalText: i.originalText,
          translatedText: i.translatedText,
        })),
        null,
        2
      );

    const response = await callGeminiWithRetryAndFallback(apiKeys, {
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reviewedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  translatedText: { type: Type.STRING },
                },
                required: ['id', 'translatedText'],
              },
            },
          },
          required: ['reviewedItems'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    const reviewedItems = parsedData.reviewedItems || [];

    let refinedCount = 0;
    let untranslatedFixedCount = 0;

    reviewedItems.forEach((rev: any) => {
      const orig = items.find((i: any) => i.id === rev.id);
      if (orig) {
        if (!orig.translatedText.trim() && rev.translatedText.trim()) {
          untranslatedFixedCount++;
        } else if (orig.translatedText.trim() !== rev.translatedText.trim()) {
          refinedCount++;
        }
      }
    });

    return res.json({
      reviewedItems,
      lineCountMatch: reviewedItems.length === items.length,
      refinedCount,
      untranslatedFixedCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error during translation quality audit.';
    console.error('Verify translation error:', err);
    return res.status(500).json({ error: message });
  }
});

// API Endpoint: Detect source language of text sample
app.post('/api/detect-language', async (req, res) => {
  try {
    const { sampleText } = req.body;
    if (!sampleText || typeof sampleText !== 'string') {
      return res.status(400).json({ error: 'متن نمونه ارسال نشده است.' });
    }

    const apiKeys = getClientKeysFromHeader(req);
    const response = await callGeminiWithRetryAndFallback(apiKeys, {
      contents: `Identify the primary language of this subtitle snippet. Return a JSON object with keys "language" (English name e.g. "English", "French", "Japanese") and "languageFa" (Persian name e.g. "انگلیسی", "فرانسوی", "ژاپنی").\n\nSnippet:\n${sampleText.slice(0, 1000)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            languageFa: { type: Type.STRING }
          },
          required: ['language', 'languageFa']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در تشخیص زبان';
    return res.status(500).json({ error: message });
  }
});

// API Endpoint: Transcribe audio to SRT subtitles
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType, targetLanguage, highAccuracyMode } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'داده صوتی ارسال نشده است.' });
    }

    const apiKeys = getClientKeysFromHeader(req);

    const highAccuracyInstruction = highAccuracyMode
      ? `\nHIGH ACCURACY MULTI-PASS RE-EVALUATION MODE:
- Perform deep phonetic analysis on low-volume, fast-paced, background-noisy, or heavily accented dialogue.
- Cross-verify homophones, slang, technical jargon, and ambiguous vocal pronunciations against semantic context.
- Ensure strict accuracy for subtle speech pauses and spoken phrasing.`
      : '';

    const systemInstruction = `You are a world-class speech-to-text subtitle transcription AI.
Your task is to transcribe speech from the provided audio file into a clean, precise, professional SRT subtitle format.${highAccuracyInstruction}

CRITICAL INSTRUCTIONS:
1. TIMESTAMPS: Every block MUST have valid SRT timestamps formatted as "HH:MM:SS,mmm --> HH:MM:SS,mmm" (e.g., "00:00:01,250 --> 00:00:04,100").
2. ACCURACY & NATURAL BREAKS: Break subtitle lines naturally at natural speech pauses, clauses, or sentences. Avoid overly long subtitle blocks.
3. OUTPUT FORMAT: Return a JSON object with keys "srtText" (string containing full, valid SRT content) and "detectedLanguage" (string describing spoken language).`;

    const promptText = highAccuracyMode
      ? `[HIGH ACCURACY PHONETIC RE-EVALUATION] Transcribe the speech with meticulous attention to phonetic detail, accents, and context into SRT format. ${targetLanguage ? `Translate or write transcript in ${targetLanguage}.` : 'Keep transcript in original spoken language.'}`
      : `Transcribe the audio speech into precise SRT subtitle format. ${targetLanguage ? `Translate or write transcript in ${targetLanguage}.` : 'Keep transcript in original spoken language.'}`;

    const response = await callGeminiWithRetryAndFallback(apiKeys, {
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType || 'audio/wav',
          },
        },
        promptText,
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            srtText: { type: Type.STRING },
          },
          required: ['srtText'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error transcribing audio';
    console.error('Audio transcription error:', err);
    return res.status(500).json({ error: message });
  }
});

// Helper to parse and categorize Gemini API errors into user-friendly diagnostic messages
function parseGeminiDiagnosticError(err: any): string {
  if (!err) return 'ارتباط برقرار نشد: خطای نامشخص در سرویس هوش مصنوعی.';
  const msg = typeof err === 'string' ? err : err.message || String(err);
  const lowerMsg = msg.toLowerCase();

  if (
    lowerMsg.includes('429') ||
    lowerMsg.includes('quota') ||
    lowerMsg.includes('resource_exhausted') ||
    lowerMsg.includes('limit')
  ) {
    return 'محدودیت تعداد درخواست (Quota/Rate Limit): سهمیه مجاز این کلید به پایان رسیده است یا باید چند لحظه صبر کنید.';
  }

  if (
    lowerMsg.includes('401') ||
    lowerMsg.includes('403') ||
    lowerMsg.includes('api_key') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('invalid') ||
    lowerMsg.includes('permission_denied')
  ) {
    return 'کلید API خرابه یا نامعتبر است: کلید وارد شده اشتباه است، یا دسترسی آن از سوی گوگل مسدود گردیده.';
  }

  if (
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('enotfound') ||
    lowerMsg.includes('fetch failed') ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('timeout')
  ) {
    return 'ارتباط برقرار نشد: خطای شبکه یا عدم دسترسی به سرورهای گوگل.';
  }

  return `ارتباط برقرار نشد: ${msg}`;
}

// Helper to perform a fast, direct test on a single Gemini API key without retry delays
async function testSingleGeminiKey(keyStr: string): Promise<{ success: boolean; error?: string }> {
  const cleanKey = String(keyStr || '').trim();
  if (!cleanKey) {
    return { success: false, error: 'کلید API خالی است.' };
  }

  let ai: GoogleGenAI;
  try {
    ai = getGenAIClient(cleanKey);
  } catch (err: any) {
    return { success: false, error: parseGeminiDiagnosticError(err) };
  }

  const modelsToTest = ['gemini-3.6-flash', 'gemini-2.5-flash'];
  let lastErr: any = null;

  for (const modelName of modelsToTest) {
    try {
      await ai.models.generateContent({
        model: modelName,
        contents: 'Respond with OK',
      });
      return { success: true };
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      const is404 = msg.includes('404') || msg.toLowerCase().includes('not found');
      if (is404) continue; // Try fallback model if 404
      break; // For rate limit, auth errors, etc., stop immediately for diagnostic speed
    }
  }

  return { success: false, error: parseGeminiDiagnosticError(lastErr) };
}

// API Endpoint: Test single or batch Gemini API key validity
app.post('/api/test-key', async (req, res) => {
  try {
    const { apiKey, apiKeys } = req.body || {};

    if (Array.isArray(apiKeys) && apiKeys.length > 0) {
      const results = await Promise.all(
        apiKeys.map(async (k: string) => {
          const resObj = await testSingleGeminiKey(k);
          return { key: k, success: resObj.success, error: resObj.error };
        })
      );
      return res.json({ success: true, results });
    }

    const customKey = String(apiKey || req.headers['x-gemini-api-key'] || '').trim();
    if (!customKey) {
      return res.status(400).json({ success: false, error: 'کلید API وارد نشده است.' });
    }

    const result = await testSingleGeminiKey(customKey);
    if (result.success) {
      return res.json({ success: true, message: 'ارتباط برقرار شد و کلید API معتبر است.' });
    } else {
      return res.status(400).json({ success: false, error: result.error });
    }
  } catch (err: unknown) {
    const errorMsg = parseGeminiDiagnosticError(err);
    console.error('API key test error:', err);
    return res.status(400).json({ success: false, error: errorMsg });
  }
});


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite development server or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
