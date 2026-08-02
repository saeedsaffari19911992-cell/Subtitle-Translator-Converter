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

// API Endpoint: Translate batch of subtitle items
app.post('/api/translate', async (req, res) => {
  try {
    const { items, sourceLanguage, targetLanguage, tone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'آیتمی برای ترجمه ارسال نشده است.' });
    }

    const userApiKey = (req.headers['x-gemini-api-key'] as string) || undefined;
    const ai = getGenAIClient(userApiKey);
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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

// API Endpoint: Detect source language of text sample
app.post('/api/detect-language', async (req, res) => {
  try {
    const { sampleText } = req.body;
    if (!sampleText || typeof sampleText !== 'string') {
      return res.status(400).json({ error: 'متن نمونه ارسال نشده است.' });
    }

    const userApiKey = (req.headers['x-gemini-api-key'] as string) || undefined;
    const ai = getGenAIClient(userApiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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

// API Endpoint: Test Gemini API key validity
app.post('/api/test-key', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const ai = getGenAIClient(customKey);
    
    // Quick test prompt
    await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond with OK if connected.',
    });

    return res.json({ success: true, message: 'API Key is valid and active.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid API Key or connection error.';
    console.error('API key test error:', err);
    return res.status(400).json({ success: false, error: message });
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
