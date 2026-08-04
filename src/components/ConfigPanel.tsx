import React from 'react';
import { SubtitleFormat, ToneOption } from '../types';
import { TONE_OPTIONS } from '../constants';
import { UILanguage, TRANSLATIONS } from '../lib/i18n';
import { SearchableLanguageSelect } from './SearchableLanguageSelect';
import { 
  Languages, 
  Sparkles, 
  MessageSquareQuote, 
  FileType, 
  Film, 
  MessageSquare, 
  BookOpen, 
  Smile, 
  GraduationCap, 
  ArrowLeftRight 
} from 'lucide-react';

interface ConfigPanelProps {
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  selectedTone: ToneOption;
  setSelectedTone: (tone: ToneOption) => void;
  targetFormat: SubtitleFormat;
  setTargetFormat: (fmt: SubtitleFormat) => void;
  onStartTranslation: () => void;
  isTranslating: boolean;
  itemCount: number;
  detectedSourceLang?: string;
  uiLang: UILanguage;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  selectedTone,
  setSelectedTone,
  targetFormat,
  setTargetFormat,
  onStartTranslation,
  isTranslating,
  itemCount,
  detectedSourceLang,
  uiLang,
}) => {
  const t = TRANSLATIONS[uiLang];

  const getToneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film': return <Film className="w-4 h-4" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Smile': return <Smile className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      default: return <MessageSquareQuote className="w-4 h-4" />;
    }
  };

  const getToneLabel = (toneId: ToneOption) => {
    switch (toneId) {
      case 'cinematic': return t.toneCinematic;
      case 'conversational': return t.toneConversational;
      case 'formal': return t.toneFormal;
      case 'humorous': return t.toneHumorous;
      case 'educational': return t.toneEducational;
      default: return toneId;
    }
  };

  const getToneDescription = (toneId: ToneOption) => {
    switch (toneId) {
      case 'cinematic': return t.toneDescCinematic;
      case 'conversational': return t.toneDescConversational;
      case 'formal': return t.toneDescFormal;
      case 'humorous': return t.toneDescHumorous;
      case 'educational': return t.toneDescEducational;
      default: return '';
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const prevSource = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(prevSource);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 lg:p-6 shadow-md dark:shadow-xl backdrop-blur-sm flex flex-col gap-6 transition-colors">
      
      {/* Title */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {t.subtitleSettings}
        </h2>
      </div>

      {/* Language Selection Row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-3">
        
        {/* Source Language Searchable Select */}
        <SearchableLanguageSelect
          value={sourceLanguage}
          onChange={setSourceLanguage}
          label={t.sourceLang}
          includeAuto={true}
          detectedLangText={detectedSourceLang ? `${uiLang === 'en' ? 'Auto:' : 'تشخیص:'} ${detectedSourceLang}` : undefined}
          uiLang={uiLang}
        />

        {/* Swap Button */}
        <div className="flex items-center justify-center pb-1">
          <button
            type="button"
            onClick={handleSwapLanguages}
            disabled={sourceLanguage === 'auto'}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors"
            title="Swap Source and Target Languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Target Language Searchable Select */}
        <SearchableLanguageSelect
          value={targetLanguage}
          onChange={setTargetLanguage}
          label={t.targetLang}
          includeAuto={false}
          uiLang={uiLang}
        />

      </div>

      {/* Tone Selection Cards */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MessageSquareQuote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{t.translationTone}:</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {TONE_OPTIONS.map((tone) => {
            const isSelected = selectedTone === tone.id;
            return (
              <div
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between gap-2 relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {getToneIcon(tone.iconName)}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {getToneLabel(tone.id)}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {getToneDescription(tone.id)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Export Format & Start Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        
        {/* Export Format selector */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <FileType className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            {t.outputFormat}
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['srt', 'vtt', 'ass', 'ssa', 'sub'] as SubtitleFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setTargetFormat(fmt)}
                className={`uppercase text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  targetFormat === fmt
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                .{fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Start Translation Button */}
        <button
          onClick={onStartTranslation}
          disabled={isTranslating || itemCount === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/30 shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>
            {isTranslating ? t.processing : `${t.startTranslation} ${itemCount > 0 ? `(${itemCount} ${t.linesCount})` : ''}`}
          </span>
        </button>

      </div>

    </div>
  );
};
