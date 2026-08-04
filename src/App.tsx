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
  timestampToSeconds,
  RTL_LANGUAGES
} from './lib/subtitleParser';
import { getApiKeyArrayForHeader } from './lib/apiKeyManager';
import { UILanguage, TRANSLATIONS } from './lib/i18n';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ConfigPanel } from './components/ConfigPanel';
import { TranslationProgress } from './components/TranslationProgress';
import { SubtitleEditor } from './components/SubtitleEditor';
import { VideoSubtitlePreview } from './components/VideoSubtitlePreview';
import { ApiKeyModal } from './components/ApiKeyModal';
import { HelpModal } from './components/HelpModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  // i18n & BYOK API Key State
  const [uiLang, setUiLang] = useState<UILanguage>(() => {
    return (localStorage.getItem('gemini_ui_lang') as UILanguage) || 'fa';
  });
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    const keys = getApiKeyArrayForHeader();
    return keys[0] || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const t = TRANSLATIONS[uiLang];

  // Helper to generate API headers with multi-key support
  const getApiHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const keys = getApiKeyArrayForHeader();
    if (keys.length > 0) {
      headers['x-gemini-api-keys'] = JSON.stringify(keys);
      headers['x-gemini-api-key'] = keys[0];
    }
    return headers;
  };

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

        // Optional language detection on load
        detectLanguageOnLoad(parsed.items);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : t.fileParseError, 'error');
      }
    };

    window.addEventListener('processBuffer', handleProcessBuffer);
    return () => window.removeEventListener('processBuffer', handleProcessBuffer);
  }, [uiLang, t]);

  const detectLanguageOnLoad = async (loadedItems: SubtitleItem[]) => {
    if (loadedItems.length === 0) return;
    const sampleText = loadedItems.slice(0, 5).map((i) => i.originalText).join(' ');

    try {
      const res = await fetch('/api/detect-language', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ text: sampleText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.detectedLanguage) {
          setDetectedSourceLang(data.detectedLanguage);
        }
      }
    } catch {
      // Ignore background detection errors
    }
  };

  // Save / Clear API Key handlers
  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setUserApiKey(trimmed);
    localStorage.setItem('gemini_user_api_key', trimmed);
    showToast(t.apiKeySaved, 'success');
  };

  const handleClearApiKey = () => {
    setUserApiKey('');
    localStorage.removeItem('gemini_user_api_key');
    showToast(t.apiKeyCleared, 'info');
  };

  // Source item modification handler (REQ_2)
  const handleSourceItemChange = (id: number, field: 'originalText' | 'startTime' | 'endTime', value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isTextChanged = field === 'originalText' && value !== item.originalText;
          let newStartSec = item.startSeconds;
          let newEndSec = item.endSeconds;

          if (field === 'startTime') {
            const parsedSec = timestampToSeconds(value);
            if (!isNaN(parsedSec)) newStartSec = parsedSec;
          } else if (field === 'endTime') {
            const parsedSec = timestampToSeconds(value);
            if (!isNaN(parsedSec)) newEndSec = parsedSec;
          }

          return {
            ...item,
            [field]: value,
            startSeconds: newStartSec,
            endSeconds: newEndSec,
            sourceModified: isTextChanged ? true : item.sourceModified,
          };
        }
        return item;
      })
    );
  };

  // Re-translate modified source lines (REQ_2)
  const handleRetranslateModified = async () => {
    const modifiedItems = items.filter((item) => item.sourceModified);
    if (modifiedItems.length === 0) return;

    showToast(uiLang === 'en' ? `Re-translating ${modifiedItems.length} modified line(s)...` : `در حال ترجمه مجدد ${modifiedItems.length} سطر اصلاح‌شده...`, 'info');

    for (const item of modifiedItems) {
      await handleSingleLineTranslate(item.id);
    }

    // Clear sourceModified flags
    setItems((prev) =>
      prev.map((item) => ({ ...item, sourceModified: false }))
    );
  };

  // AI Quality Audit & Verification Pass (REQ_1)
  const [isVerifyingQuality, setIsVerifyingQuality] = useState(false);

  const handleVerifyQuality = async () => {
    if (items.length === 0) return;
    setIsVerifyingQuality(true);
    try {
      const res = await fetch('/api/verify-translation', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            originalText: i.originalText,
            translatedText: i.translatedText,
          })),
          targetLanguage,
          tone: selectedTone,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Quality audit failed.');
      }

      const data = await res.json();
      const reviewedItems = data.reviewedItems || data.verifiedTranslations;
      if (reviewedItems && Array.isArray(reviewedItems)) {
        let refinedCount = 0;
        const isRTL = RTL_LANGUAGES.includes(targetLanguage);

        setItems((prev) => {
          const copy = [...prev];
          reviewedItems.forEach((vt: { id: number; translatedText?: string; text?: string }) => {
            const idx = copy.findIndex((i) => i.id === vt.id);
            const textVal = vt.translatedText ?? vt.text;
            if (idx !== -1 && textVal && textVal !== copy[idx].translatedText) {
              const finalText = isRTL ? fixRTLPunctuation(textVal) : textVal;
              copy[idx] = { ...copy[idx], translatedText: finalText };
              refinedCount++;
            }
          });
          return copy;
        });

        showToast(
          uiLang === 'en'
            ? `Quality audit complete! Refined ${refinedCount} line(s).`
            : `ارزیابی کیفیت انجام شد! ${refinedCount} سطر بهبود یافت.`,
          'success'
        );
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error auditing translation quality', 'error');
    } finally {
      setIsVerifyingQuality(false);
    }
  };

  // Add a new empty subtitle line
  const handleAddNewLine = () => {
    setItems((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((i) => i.id)) + 1 : 1;
      const lastItem = prev[prev.length - 1];
      const newStart = lastItem ? lastItem.endTime : '00:00:00,000';
      const newEnd = lastItem ? lastItem.endTime : '00:00:05,000';
      return [
        ...prev,
        {
          id: nextId,
          startTime: newStart,
          endTime: newEnd,
          startSeconds: lastItem ? lastItem.endSeconds : 0,
          endSeconds: lastItem ? lastItem.endSeconds + 5 : 5,
          originalText: '',
          translatedText: '',
        },
      ];
    });
    showToast(uiLang === 'en' ? 'New subtitle line added' : 'سطر جدید افزوده‌شد', 'info');
  };

  // Fill empty lines with original text
  const handleFillEmptyWithOriginal = () => {
    let count = 0;
    setItems((prev) =>
      prev.map((item) => {
        if (!item.translatedText || !item.translatedText.trim()) {
          count++;
          return { ...item, translatedText: item.originalText };
        }
        return item;
      })
    );
    showToast(`${count} ${t.emptyLinesFilled}`, 'info');
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

    const BATCH_SIZE = 35; // 35 lines per Gemini batch (optimized to avoid rate limit quota exhaustion)
    const totalCount = items.length;
    const totalBatchesCount = Math.ceil(totalCount / BATCH_SIZE);

    setTotalBatches(totalBatchesCount);
    setCurrentBatch(0);
    setTranslatedCount(0);

    const isRTL = RTL_LANGUAGES.includes(targetLanguage);

    for (let b = 0; b < totalBatchesCount; b++) {
      if (cancelTranslationRef.current) break;

      // Handle pause loop
      while (isPausedRef.current) {
        if (cancelTranslationRef.current) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (cancelTranslationRef.current) break;

      setCurrentBatch(b + 1);

      const startIndex = b * BATCH_SIZE;
      const batchSlice = items.slice(startIndex, startIndex + BATCH_SIZE);

      let success = false;
      let attempt = 0;
      const MAX_RETRIES = 5;

      while (!success && attempt < MAX_RETRIES && !cancelTranslationRef.current) {
        attempt++;
        if (attempt > 1) {
          setRetryInfo({ batch: b + 1, attempt, maxRetries: MAX_RETRIES });
          // Exponential backoff for rate limit quota recovery
          const backoffDelay = Math.min(attempt * 6000, 30000);
          showToast(
            uiLang === 'en'
              ? `Rate limit backoff: retrying batch ${b + 1} in ${Math.round(backoffDelay / 1000)}s...`
              : uiLang === 'ar'
              ? `انتظار تجديد الحصة: جاري إعادة المحاولة خلال ${Math.round(backoffDelay / 1000)} ثوانٍ...`
              : `توقف کوتاه‌مدت به دلیل محدودیت درخواست: تلاش مجدد دسته ${b + 1} تا ${Math.round(backoffDelay / 1000)} ثانیه دیگر...`,
            'warning'
          );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }

        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify({
              items: batchSlice.map((i) => ({ id: i.id, text: i.originalText })),
              sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
              targetLanguage,
              tone: selectedTone,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${response.status}) during translation.`);
          }

          const data = await response.json();
          const translationsList: Array<{ id: number; text: string }> = data.translations || [];

          // Merge translations into state
          setItems((prevItems) => {
            const updated = [...prevItems];
            translationsList.forEach((transObj) => {
              const targetIndex = updated.findIndex((i) => i.id === transObj.id);
              if (targetIndex !== -1) {
                const finalText = isRTL ? fixRTLPunctuation(transObj.text) : transObj.text;
                updated[targetIndex] = {
                  ...updated[targetIndex],
                  translatedText: finalText,
                };
              }
            });
            return updated;
          });

          setTranslatedCount((prev) => prev + batchSlice.length);
          success = true;
          setRetryInfo(null);
        } catch (err: unknown) {
          console.error(`Batch ${b + 1} attempt ${attempt} failed:`, err);
          if (attempt >= MAX_RETRIES) {
            const errMsg = err instanceof Error ? err.message : `Batch ${b + 1} failed after ${MAX_RETRIES} attempts.`;
            showToast(errMsg, 'error');
          }
        }
      }

      // Throttle delay between batches to stay within rate limits
      await new Promise((resolve) => setTimeout(resolve, 1200));
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
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: getApiHeaders(),
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
    showToast(`${replacedCount} ${t.batchReplacedNotice}`, 'success');
  };

  // Export File Download
  const handleExport = () => {
    if (items.length === 0) return;

    const isRTL = RTL_LANGUAGES.includes(targetLanguage);
    const exportedContent = exportSubtitleFile(
      items,
      targetFormat,
      rawHeader,
      isRTL
    );

    const blob = new Blob([exportedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const nameWithoutExt = fileName ? fileName.substring(0, fileName.lastIndexOf('.')) || fileName : 'translated_subtitles';
    link.download = `${nameWithoutExt}_${targetLanguage}.${targetFormat}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    showToast(`${t.subtitleExported} (.${targetFormat.toUpperCase()})`, 'success');
  };

  // Reset State
  const handleReset = () => {
    setItems([]);
    setFileName('');
    setFileSize(0);
    setRawHeader(undefined);
    setDetectedEncoding('');
    showToast(t.allDataReset, 'info');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors`}>
      
      {/* Top Application Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        uiLang={uiLang}
        setUiLang={setUiLang}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
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

        {/* Video Player, AI Extraction & Subtitle Style Customizer */}
        <VideoSubtitlePreview
          items={items}
          onUpdateItems={(newItems) => setItems(newItems)}
          uiLang={uiLang}
          userApiKey={userApiKey}
          onShowToast={showToast}
        />

        {/* Subtitle Editor & Live Preview */}
        {items.length > 0 && (
          <SubtitleEditor
            items={items}
            onItemChange={handleItemChange}
            onSourceItemChange={handleSourceItemChange}
            onSingleLineTranslate={handleSingleLineTranslate}
            onRetranslateModified={handleRetranslateModified}
            onVerifyQuality={handleVerifyQuality}
            isVerifyingQuality={isVerifyingQuality}
            onDeleteItem={handleDeleteItem}
            onAddNewLine={handleAddNewLine}
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

      {/* User Guide & Network Warning Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        uiLang={uiLang}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
}
