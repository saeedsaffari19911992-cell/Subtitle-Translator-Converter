import React, { useState, useEffect } from 'react';
import { UILanguage, TRANSLATIONS } from '../lib/i18n';
import { Key, X, Check, Trash2, Eye, EyeOff, ShieldCheck, ExternalLink, Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiLang: UILanguage;
  userApiKey?: string;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  uiLang,
  userApiKey = '',
  onSaveKey,
  onClearKey,
}) => {
  const [inputKey, setInputKey] = useState<string>(userApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [testError, setTestError] = useState<string>('');
  const t = TRANSLATIONS[uiLang];

  useEffect(() => {
    setInputKey(userApiKey || '');
    setTestStatus('idle');
    setTestError('');
  }, [userApiKey, isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = (inputKey || '').trim();
    setTestStatus('testing');
    setTestError('');

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('valid');
      } else {
        setTestStatus('invalid');
        setTestError(data.error || 'Connection failed.');
      }
    } catch (err: unknown) {
      setTestStatus('invalid');
      setTestError(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputKey);
    onClose();
  };

  const handleClear = () => {
    onClearKey();
    setInputKey('');
    setTestStatus('idle');
    onClose();
  };

  const getKeyLinkText = () => {
    if (uiLang === 'en') return 'Get Free Gemini API Key';
    if (uiLang === 'ar') return 'احصل على مفتاح Gemini مجاني';
    return 'دریافت کلید رایگان Gemini';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t.apiKeyModalTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.apiKeyModalDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {userApiKey ? t.customKeyActive : t.defaultKeyActive}
            </span>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline underline-offset-2"
          >
            <span>{getKeyLinkText()}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Key Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setTestStatus('idle');
                  }}
                  placeholder={t.enterApiKeyPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Test Key Connection Button */}
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testStatus === 'testing'}
                className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>{t.testingKey}</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.testKey}</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Connection Outcome Badges */}
            {testStatus === 'valid' && (
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 p-2.5 rounded-xl text-xs font-medium animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.keyValid}</span>
              </div>
            )}

            {testStatus === 'invalid' && (
              <div className="flex items-start gap-2 bg-rose-950/50 border border-rose-800/80 text-rose-300 p-2.5 rounded-xl text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t.keyInvalid}</p>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">{testError}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {userApiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearKey}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                {t.close}
              </button>
              <button
                type="submit"
                disabled={!(inputKey || '').trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-indigo-900/30"
              >
                <Check className="w-4 h-4" />
                <span>{t.saveKey}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

