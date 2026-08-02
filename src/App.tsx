import React, { useState, useEffect, useRef } from 'react';
import { 
  SubtitleFormat, 
  SubtitleItem, 
  ToneOption, 
  ToastMessage 
} from './types';
import { 
  parseSubtitleFile, 
  exportSubtitleFile, 
  detectEncodingAndDecode,
  fixRTLPunctuation,
  RTL_LANGUAGES
} from './lib/subtitleParser';
import { UILanguage, TRANSLATIONS } from './lib/i18n';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ConfigPanel } from './components/ConfigPanel';
import { TranslationProgress } from './components/TranslationProgress';
import { SubtitleEditor } from './components/SubtitleEditor';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  // i18n & BYOK API Key State
  const [uiLang, setUiLang] = useState<UILanguage>(() => {
    return (localStorage.getItem('gemini_ui_lang') as UILanguage) || 'fa';
  });
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_user_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const t = TRANSLATIONS[uiLang];

  // Sync document direction and language code on uiLang change
  useEffect(() => {
    localStorage.setItem('gemini_ui_lang', uiLang);
    document.documentElement.dir = uiLang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  // File state
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [sourceFormat, setSourceFormat] = useState<SubtitleFormat>('srt');
  const [rawHeader, setRawHeader] = useState<string | undefined>(undefined);
  const [selectedEncoding, setSelectedEncoding] = useState<string>('auto');
  const [detectedEncoding, setDetectedEncoding] = useState<string>('');
  const [items, setItems] = useState<SubtitleItem[]>([]);

  // Config options
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto');
  const [detectedSourceLang, setDetectedSourceLang] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('fa');
  const [selectedTone, setSelectedTone] = useState<ToneOption>('cinematic');
  const [targetFormat, setTargetFormat] = useState<SubtitleFormat>('srt');

  // Translation execution state
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [translatedCount, setTranslatedCount] = useState<number>(0);
  const [retryInfo, setRetryInfo] = useState<{ batch: number; attempt: number; maxRetries: number } | null>(null);

  // Modals & Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Calculate overall translation completion stats
  const translatedItemsCount = items.filter((item) => item.translatedText && item.translatedText.trim().length > 0).length;
  const totalItemsCount = items.length;
  const isFullyTranslated = totalItemsCount > 0 && translatedItemsCount === totalItemsCount;
  const completionPercentage = totalItemsCount > 0 ? Math.round((translatedItemsCount / totalItemsCount) * 100) : 0;

  const cancelTranslationRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Listen to file upload events
  useEffect(() => {
    const handleProcessBuffer = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { buffer, fileName: name, fileSize: size } = customEvent.detail;

      if (!buffer) return;

      const { text, encoding } = detectEncodingAndDecode(buffer);
      setDetectedEncoding(encoding);
      setFileName(name || 'subtitle');
      setFileSize(size || 0);

      try {
        const parsed = parseSubtitleFile(text, name || 'subtitle.srt');
        setItems(parsed.items);
        setSourceFormat(parsed.format);
        setTargetFormat(parsed.format);
        setRawHeader(parsed.rawHeader);

        showToast(`${t.newFileLoaded} (${parsed.items.length} ${t.linesCount})`, 'success');

        // Trigger auto-language detection on server if first lines exist
        if (parsed.items.length > 0) {
          detectSourceLanguageOnServer(parsed.items.slice(0, 5).map((i) => i.originalText).join('\n'));
        }
      } catch (err) {
        console.error('Subtitle parse error:', err);
        showToast('Error parsing subtitle file.', 'error');
      }
    };

    window.addEventListener('processBuffer', handleProcessBuffer);
    return () => window.removeEventListener('processBuffer', handleProcessBuffer);
  }, [uiLang, t]);

  // Save / Clear custom Gemini API key
  const handleSaveApiKey = (key: string) => {
    const trimmed = (key || '').trim();
    setUserApiKey(trimmed);
    localStorage.setItem('gemini_user_api_key', trimmed);
    showToast(t.keySavedSuccess, 'success');
  };

  const handleClearApiKey = () => {
    setUserApiKey('');
    localStorage.removeItem('gemini_user_api_key');
    showToast(t.keyClearedSuccess, 'info');
  };

  // Server API: Detect source language
  const detectSourceLanguageOnServer = async (sampleText: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) headers['x-gemini-api-key'] = userApiKey;

      const res = await fetch('/api/detect-language', {
        method: 'POST',
        headers,
        body: JSON.stringify({ sampleText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.languageFa) {
          setDetectedSourceLang(uiLang === 'en' ? `${data.language}` : `${data.languageFa} (${data.language})`);
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  // Start Batch Translation Process
  const handleStartTranslation = async () => {
    if (items.length === 0) {
      showToast(t.noSubtitlesToTranslate, 'warning');
      return;
    }

    setIsTranslating(true);
    setIsPaused(false);
    cancelTranslationRef.current = false;

    const isRTL = RTL_LANGUAGES.includes(targetLanguage);
    const BATCH_SIZE = 50; // Optimal batch chunking of 50 subtitle frames for reliability
    const total = Math.ceil(items.length / BATCH_SIZE);
    setTotalBatches(total);
    setCurrentBatch(0);
    setTranslatedCount(0);

    const updatedItems = [...items];

    for (let i = 0; i < total; i++) {
      if (cancelTranslationRef.current) {
        showToast(t.userCancelled, 'warning');
        break;
      }

      // Check pause state
      while (isPausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (cancelTranslationRef.current) break;
      }

      if (cancelTranslationRef.current) break;

      setCurrentBatch(i + 1);

      const batchSlice = updatedItems.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const payloadItems = batchSlice.map((item) => ({
        id: item.id,
        text: item.originalText,
      }));

      const MAX_RETRIES = 3;
      let batchSuccess = false;
      let attempts = 0;
      let batchTranslations: { id: number; text: string }[] = [];

      while (attempts < MAX_RETRIES && !batchSuccess) {
        attempts++;
        if (cancelTranslationRef.current) break;

        setRetryInfo({ batch: i + 1, attempt: attempts, maxRetries: MAX_RETRIES });

        try {
          if (attempts > 1) {
            // Exponential backoff delay
            const backoffMs = Math.pow(2, attempts - 2) * 1500;
            showToast(`${t.retryAttempt} (${attempts}/${MAX_RETRIES}) - ${t.batch} ${i + 1}...`, 'warning');
            await new Promise((r) => setTimeout(r, backoffMs));
          }

          if (cancelTranslationRef.current) break;

          const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (userApiKey) reqHeaders['x-gemini-api-key'] = userApiKey;

          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: reqHeaders,
            body: JSON.stringify({
              items: payloadItems,
              sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
              targetLanguage,
              tone: selectedTone,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
          }

          const data = await res.json();
          const translationsList: { id: number; text: string }[] = data.translations || [];

          if (!Array.isArray(translationsList)) {
            throw new Error('Invalid translation response format.');
          }

          batchTranslations = translationsList;
          batchSuccess = true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Batch ${i + 1} attempt ${attempts} failed:`, msg);
          if (attempts >= MAX_RETRIES) {
            showToast(`${t.batch} ${i + 1} failed after ${MAX_RETRIES} retries: ${msg}`, 'error');
          }
        }
      }

      setRetryInfo(null);

      if (batchSuccess) {
        // Apply translations to state items with RTL punctuation fixing if applicable
        batchTranslations.forEach((tItem) => {
          const targetIndex = updatedItems.findIndex((item) => item.id === tItem.id);
          if (targetIndex !== -1 && tItem.text) {
            const finalText = isRTL ? fixRTLPunctuation(tItem.text) : tItem.text;
            updatedItems[targetIndex] = {
              ...updatedItems[targetIndex],
              translatedText: finalText,
            };
          }
        });

        setItems([...updatedItems]);
        setTranslatedCount((prev) => prev + batchSlice.length);
      }
    }

    setIsTranslating(false);

    if (!cancelTranslationRef.current) {
      showToast(t.translationFinished, 'success');
    }
  };

  // Re-translate single line
  const handleSingleLineTranslate = async (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const isRTL = RTL_LANGUAGES.includes(targetLanguage);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) headers['x-gemini-api-key'] = userApiKey;

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: [{ id: item.id, text: item.originalText }],
          sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
          targetLanguage,
          tone: selectedTone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const translatedObj = data.translations?.[0];
        if (translatedObj && translatedObj.text) {
          const finalText = isRTL ? fixRTLPunctuation(translatedObj.text) : translatedObj.text;
          handleItemChange(id, finalText);
          showToast(`#${id} ${t.singleLineTranslated}`, 'success');
        }
      } else {
        showToast('Single line translation error.', 'error');
      }
    } catch {
      showToast('Network error while translating line.', 'error');
    }
  };

  // Item edit change handler
  const handleItemChange = (id: number, translatedText: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, translatedText } : item))
    );
  };

  const handleDeleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`#${id} ${t.lineDeleted}`, 'info');
  };

  // Batch Replace
  const handleBatchReplace = (findText: string, replaceText: string) => {
    let replacedCount = 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.translatedText.includes(findText)) {
          replacedCount++;
          return {
            ...item,
            translatedText: item.translatedText.replaceAll(findText, replaceText),
          };
        }
        return item;
      })
    );
    showToast(t.replacedCount.replace('{count}', replacedCount.toString()), 'success');
  };

  // Fill Empty Lines With Original
  const handleFillEmptyWithOriginal = () => {
    let filled = 0;
    setItems((prev) =>
      prev.map((item) => {
        if (!item.translatedText.trim()) {
          filled++;
          return { ...item, translatedText: item.originalText };
        }
        return item;
      })
    );
    showToast(t.filledEmptyCount.replace('{count}', filled.toString()), 'info');
  };

  // Export File Download Handler
  const handleExport = () => {
    if (items.length === 0) return;

    const isRTL = RTL_LANGUAGES.includes(targetLanguage);
    const rawContent = exportSubtitleFile(items, targetFormat, rawHeader, isRTL);
    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName || 'Subtitle';
    link.href = url;
    link.download = `${nameWithoutExt}_translated.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`.${targetFormat.toUpperCase()} file downloaded.`, 'success');
  };

  // Reset Application State
  const handleReset = () => {
    const confirmMsg = uiLang === 'en'
      ? 'Are you sure you want to unload current subtitles and start new?'
      : uiLang === 'ar'
      ? 'هل أنت متأكد من إغلاق الترجمة الحالية والبدء من جدید؟'
      : 'آیا مایل به خروج از پروژه فعلی و بارگذاری فایل جدید هستید؟';

    if (items.length > 0 && !confirm(confirmMsg)) {
      return;
    }
    setItems([]);
    setFileName('');
    setFileSize(0);
    setRawHeader(undefined);
    setDetectedSourceLang('');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} transition-colors`}>
      
      {/* Top Application Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        uiLang={uiLang}
        setUiLang={setUiLang}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        userApiKey={userApiKey}
        onExport={handleExport}
        onReset={handleReset}
        hasSubtitles={items.length > 0}
        subtitleFormat={targetFormat}
        fileName={fileName}
        isTranslating={isTranslating}
        isFullyTranslated={isFullyTranslated}
        completionPercentage={completionPercentage}
        translatedItemsCount={translatedItemsCount}
        totalItemsCount={totalItemsCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Upload Zone */}
        <FileUpload
          onFileSelect={() => {}}
          selectedEncoding={selectedEncoding}
          setSelectedEncoding={setSelectedEncoding}
          detectedEncoding={detectedEncoding}
          currentFileName={fileName}
          currentFileSize={fileSize}
          itemCount={items.length}
          currentFormat={sourceFormat}
          uiLang={uiLang}
        />

        {/* Translation Configuration Bar */}
        <ConfigPanel
          sourceLanguage={sourceLanguage}
          setSourceLanguage={setSourceLanguage}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          selectedTone={selectedTone}
          setSelectedTone={setSelectedTone}
          targetFormat={targetFormat}
          setTargetFormat={setTargetFormat}
          onStartTranslation={handleStartTranslation}
          isTranslating={isTranslating}
          itemCount={items.length}
          detectedSourceLang={detectedSourceLang}
          uiLang={uiLang}
        />

        {/* Translation Progress Bar (Shows when translating) */}
        {isTranslating && (
          <TranslationProgress
            currentBatch={currentBatch}
            totalBatches={totalBatches}
            translatedLines={translatedCount}
            totalLines={items.length}
            isPaused={isPaused}
            retryInfo={retryInfo}
            onPauseToggle={() => setIsPaused(!isPaused)}
            onCancel={() => {
              cancelTranslationRef.current = true;
              setIsTranslating(false);
            }}
            uiLang={uiLang}
          />
        )}

        {/* Subtitle Editor & Live Preview */}
        {items.length > 0 && (
          <SubtitleEditor
            items={items}
            onItemChange={handleItemChange}
            onSingleLineTranslate={handleSingleLineTranslate}
            onDeleteItem={handleDeleteItem}
            onBatchReplace={handleBatchReplace}
            onFillEmptyWithOriginal={handleFillEmptyWithOriginal}
            uiLang={uiLang}
          />
        )}

      </main>

      {/* User Gemini API Key (BYOK) Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        userApiKey={userApiKey}
        onSaveKey={handleSaveApiKey}
        onClearKey={handleClearApiKey}
        uiLang={uiLang}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
}
