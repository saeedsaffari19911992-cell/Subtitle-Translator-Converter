import React, { useState, useMemo } from 'react';
import { SubtitleItem } from '../types';
import { UILanguage, TRANSLATIONS } from '../lib/i18n';
import { 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Play, 
  Pause, 
  Layers, 
  Replace, 
  Eye, 
  Edit3,
  Clock,
  Trash2
} from 'lucide-react';

interface SubtitleEditorProps {
  items: SubtitleItem[];
  onItemChange: (id: number, translatedText: string) => void;
  onSingleLineTranslate: (id: number) => Promise<void>;
  onDeleteItem: (id: number) => void;
  onBatchReplace: (findText: string, replaceText: string) => void;
  onFillEmptyWithOriginal: () => void;
  uiLang: UILanguage;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  items,
  onItemChange,
  onSingleLineTranslate,
  onDeleteItem,
  onBatchReplace,
  onFillEmptyWithOriginal,
  uiLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'untranslated' | 'translated'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [translatingLineId, setTranslatingLineId] = useState<number | null>(null);

  // Find & Replace Modal state
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Subtitle Player Simulator
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const t = TRANSLATIONS[uiLang];

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.startTime.includes(searchQuery) ||
        item.id.toString() === searchQuery;

      if (!matchSearch) return false;

      if (filterMode === 'untranslated') return !item.translatedText.trim();
      if (filterMode === 'translated') return !!item.translatedText.trim();
      return true;
    });
  }, [items, searchQuery, filterMode]);

  // Handle single line re-translation
  const handleSingleTranslate = async (id: number) => {
    setTranslatingLineId(id);
    try {
      await onSingleLineTranslate(id);
    } finally {
      setTranslatingLineId(null);
    }
  };

  const handleCopyLine = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFindReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (findText.trim()) {
      onBatchReplace(findText, replaceText);
      setFindText('');
      setReplaceText('');
      setShowFindReplace(false);
    }
  };

  // Currently active subtitle line for simulator player
  const activeSimulatedItem = useMemo(() => {
    return items.find(
      (item) => currentTimeSec >= item.startSeconds && currentTimeSec <= item.endSeconds
    );
  }, [items, currentTimeSec]);

  const maxDuration = items.length > 0 ? items[items.length - 1].endSeconds : 100;

  const getSearchPlaceholder = () => {
    if (uiLang === 'en') return 'Search in original, translation, line # or time...';
    if (uiLang === 'ar') return 'البحث في النص الأصلي أو المترجم أو رقم السطر...';
    return 'جستجو در متن اصلی، ترجمه، شماره یا زمان‌بندی...';
  };

  const getFindPlaceholder = () => {
    if (uiLang === 'en') return 'Word to find...';
    if (uiLang === 'ar') return 'الكلمة المراد البحث عنها...';
    return 'کلمه مورد نظر برای یافتن...';
  };

  const getReplacePlaceholder = () => {
    if (uiLang === 'en') return 'Replacement word...';
    if (uiLang === 'ar') return 'الكلمة البديلة...';
    return 'کلمه جایگزین...';
  };

  const getNoSubtitleNotice = () => {
    if (uiLang === 'en') return 'Selected timestamp has no subtitle';
    if (uiLang === 'ar') return 'لا يوجد ترجمة للوقت المحدد';
    return 'زمان‌بندی انتخاب شده فاقد زیرنویس است';
  };

  const getNoResultsNotice = () => {
    if (uiLang === 'en') return 'No subtitles match your search or filter.';
    if (uiLang === 'ar') return 'لم يتم العثور على نتائج للبحث المطبق.';
    return 'هیچ زیرنویسی با فیلتر یا جستجوی فعلی یافت نشد.';
  };

  return (
    <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-4 lg:p-6 shadow-xl backdrop-blur-sm flex flex-col gap-5">
      
      {/* Editor Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.filterAll} ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('translated')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'translated'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.filterTranslated} ({items.filter((i) => i.translatedText.trim()).length})
          </button>
          <button
            onClick={() => setFilterMode('untranslated')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'untranslated'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.filterUntranslated} ({items.filter((i) => !i.translatedText.trim()).length})
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            title={t.replaceWords}
          >
            <Replace className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t.replaceWords}</span>
          </button>

          <button
            onClick={onFillEmptyWithOriginal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            title={t.fillEmptyLines}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{t.fillEmptyLines}</span>
          </button>
        </div>

      </div>

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <form onSubmit={handleFindReplaceSubmit} className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder={getFindPlaceholder()}
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
          />
          <input
            type="text"
            placeholder={getReplacePlaceholder()}
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0"
          >
            {t.applyReplace}
          </button>
        </form>
      )}

      {/* Subtitle Live Preview Simulator */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>{t.previewLiveSubtitle}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            {currentTimeSec.toFixed(1)}s / {maxDuration.toFixed(1)}s
          </div>
        </div>

        {/* Video Canvas Simulator Box */}
        <div className="w-full h-32 sm:h-40 rounded-lg bg-slate-900/90 border border-slate-800 relative flex items-center justify-center p-4 overflow-hidden shadow-inner">
          <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-600 uppercase">
            Video Simulator
          </div>

          {activeSimulatedItem ? (
            <div className="text-center flex flex-col gap-1.5 max-w-xl animate-fade-in">
              <p className="text-xs text-slate-400 font-mono opacity-80">
                {activeSimulatedItem.originalText}
              </p>
              <p className="text-sm sm:text-base font-bold text-yellow-300 bg-black/60 px-3 py-1 rounded-md border border-yellow-500/20 shadow-lg">
                {activeSimulatedItem.translatedText || activeSimulatedItem.originalText}
              </p>
            </div>
          ) : (
            <span className="text-xs text-slate-600">
              {getNoSubtitleNotice()}
            </span>
          )}
        </div>

        {/* Player Seek Slider */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={maxDuration || 100}
            step={0.1}
            value={currentTimeSec}
            onChange={(e) => setCurrentTimeSec(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Subtitle Lines Grid */}
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {getNoResultsNotice()}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col md:flex-row items-stretch gap-3 ${
                currentTimeSec >= item.startSeconds && currentTimeSec <= item.endSeconds
                  ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* ID & Timestamp Badge */}
              <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 border-b md:border-b-0 ltr:md:border-r rtl:md:border-l border-slate-800/80 pb-2 md:pb-0 ltr:md:pr-3 rtl:md:pl-3 shrink-0">
                <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  #{item.id}
                </span>

                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{item.startTime}</span>
                  <span>→</span>
                  <span>{item.endTime}</span>
                </div>
              </div>

              {/* Side-by-Side Text Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                
                {/* Original Text Box */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-medium">{t.originalTextLabel}:</span>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap min-h-[50px] leading-relaxed select-text">
                    {item.originalText}
                  </div>
                </div>

                {/* Translated Text Editor Box */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>{t.translatedTextLabel}:</span>
                    </span>
                    {item.translatedText.trim() && (
                      <span className="text-[9px] font-mono text-emerald-400/80">{t.completedLine}</span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={item.translatedText}
                    onChange={(e) => onItemChange(item.id, e.target.value)}
                    placeholder="..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

              </div>

              {/* Single Line Action Controls */}
              <div className="flex md:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSingleTranslate(item.id)}
                  disabled={translatingLineId === item.id}
                  className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors disabled:opacity-50"
                  title={t.retranslateLine}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${translatingLineId === item.id ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyLine(item.id, item.translatedText || item.originalText)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={t.copyText}
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => onItemChange(item.id, item.originalText)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title={t.restoreOriginal}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                  title={t.deleteLine}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

