import React from 'react';
import { SubtitleFormat } from '../types';
import { UILanguage, TRANSLATIONS } from '../lib/i18n';
import { 
  Subtitles, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Sun, 
  Moon, 
  FileText,
  Lock,
  Loader2,
  Key,
  Globe,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  uiLang: UILanguage;
  setUiLang: (lang: UILanguage) => void;
  onOpenApiKeyModal: () => void;
  onOpenHelpModal?: () => void;
  userApiKey: string;
  onExport: () => void;
  onReset: () => void;
  hasSubtitles: boolean;
  subtitleFormat?: SubtitleFormat;
  fileName?: string;
  isTranslating?: boolean;
  isFullyTranslated?: boolean;
  completionPercentage?: number;
  translatedItemsCount?: number;
  totalItemsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  uiLang,
  setUiLang,
  onOpenApiKeyModal,
  onOpenHelpModal,
  userApiKey,
  onExport,
  onReset,
  hasSubtitles,
  subtitleFormat,
  fileName,
  isTranslating = false,
  isFullyTranslated = false,
  completionPercentage = 0,
  translatedItemsCount = 0,
  totalItemsCount = 0,
}) => {
  const t = TRANSLATIONS[uiLang];

  const getHelpBtnText = () => {
    if (uiLang === 'en') return 'Help Guide';
    if (uiLang === 'ar') return 'دليل الاستخدام';
    return 'راهنما';
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-md dark:shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo & Brand Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
              <Subtitles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.appTitle}
                </h1>
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Mobile Dark mode button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="sm:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title="Theme Toggle"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        {/* Current File Indicator (Desktop) */}
        {hasSubtitles && fileName && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="max-w-[180px] truncate font-medium">{fileName}</span>
            <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
              {subtitleFormat}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          
          {/* Help / User Guide Button */}
          {onOpenHelpModal && (
            <button
              onClick={onOpenHelpModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all active:scale-95 shadow-sm"
              title={getHelpBtnText()}
            >
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{getHelpBtnText()}</span>
            </button>
          )}

          {/* UI Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            <button
              onClick={() => setUiLang('fa')}
              className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                uiLang === 'fa' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="فارسی"
            >
              🇮🇷 FA
            </button>
            <button
              onClick={() => setUiLang('en')}
              className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                uiLang === 'en' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="English"
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => setUiLang('ar')}
              className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                uiLang === 'ar' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="العربية"
            >
              🇸🇦 AR
            </button>
          </div>

          {/* API Key BYOK Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all active:scale-95 ${
              userApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
            title={userApiKey ? t.customKeyActive : t.defaultKeyActive}
          >
            <Key className={`w-3.5 h-3.5 ${userApiKey ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`} />
            <span className="hidden md:inline">{t.apiKey}</span>
            <span className={`w-2 h-2 rounded-full ${userApiKey ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'}`} />
          </button>

          {/* Reset File Button */}
          {hasSubtitles && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800/50 rounded-xl transition-all active:scale-95"
              title="Load new subtitle file"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400" />
            </button>
          )}

          {/* Export / Download Button with Strict Completion Lock */}
          {hasSubtitles && (
            <button
              onClick={onExport}
              disabled={isTranslating || !isFullyTranslated}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                isTranslating
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/60 cursor-wait'
                  : isFullyTranslated
                  ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 shadow-lg shadow-emerald-900/30 active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700/80 cursor-not-allowed opacity-80'
              }`}
              title={
                isTranslating
                  ? `${t.processing} (${completionPercentage}%)...`
                  : !isFullyTranslated
                  ? `${t.downloadDisabled} (${completionPercentage}%)`
                  : t.downloadSubtitle
              }
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>{completionPercentage}%</span>
                </>
              ) : !isFullyTranslated ? (
                <>
                  <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>{t.downloadDisabled} ({completionPercentage}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>{t.downloadSubtitle}</span>
                </>
              )}
            </button>
          )}

          {/* Desktop Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
            title={darkMode ? 'Light Theme' : 'Dark Theme'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

        </div>
      </div>
    </header>
  );
};
