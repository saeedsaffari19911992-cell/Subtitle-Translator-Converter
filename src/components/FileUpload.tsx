import React, { useRef, useState } from 'react';
import { SubtitleFormat } from '../types';
import { UILanguage, TRANSLATIONS } from '../lib/i18n';
import { 
  Upload, 
  FileCode2, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Settings2
} from 'lucide-react';
import { SAMPLE_SRT_CONTENT } from '../constants';

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string, encoding: string) => void;
  selectedEncoding: string;
  setSelectedEncoding: (enc: string) => void;
  detectedEncoding?: string;
  currentFileName?: string;
  currentFileSize?: number;
  itemCount?: number;
  currentFormat?: SubtitleFormat;
  uiLang: UILanguage;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedEncoding,
  setSelectedEncoding,
  detectedEncoding,
  currentFileName,
  currentFileSize,
  itemCount,
  currentFormat,
  uiLang,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[uiLang];

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['srt', 'vtt', 'ass', 'ssa', 'sub', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setErrorMsg(uiLang === 'en' ? 'Invalid file format. Supported: .srt, .vtt, .ass, .ssa, .sub' : uiLang === 'ar' ? 'صيغة غير صالحة. الصيغ المدعومة: .srt, .vtt, .ass, .ssa, .sub' : 'فرمت فایل نامعتبر است. فرمت‌های پشتیبانی شده: .srt, .vtt, .ass, .ssa, .sub');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        setErrorMsg(uiLang === 'en' ? 'Error reading file content.' : uiLang === 'ar' ? 'خطأ في قراءة ملف الترجمة.' : 'خطا در خواندن محتوای فایل.');
        return;
      }

      onFileSelect('', file.name, selectedEncoding);
      // Pass ArrayBuffer processing through callback
      const customEvent = new CustomEvent('processBuffer', {
        detail: { buffer, fileName: file.name, fileSize: file.size }
      });
      window.dispatchEvent(customEvent);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    const sampleFileName = 'Sample_Movie_Subtitles.srt';
    const encoder = new TextEncoder();
    const buffer = encoder.encode(SAMPLE_SRT_CONTENT).buffer;

    const customEvent = new CustomEvent('processBuffer', {
      detail: { buffer, fileName: sampleFileName, fileSize: buffer.byteLength }
    });
    window.dispatchEvent(customEvent);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getLoadSampleText = () => {
    if (uiLang === 'en') return 'Load sample subtitle for quick testing';
    if (uiLang === 'ar') return 'تحميل ملف ترجمة تجريبي للاختبار السريع';
    return 'بارگذاری زیرنویس نمونه برای تست سریع';
  };

  const getChangeFileText = () => {
    if (uiLang === 'en') return 'Change file';
    if (uiLang === 'ar') return 'تغيير الملف';
    return 'تغییر فایل';
  };

  const getParsedSuccessText = () => {
    if (uiLang === 'en') return 'File parsed successfully';
    if (uiLang === 'ar') return 'تم تحليل الملف بنجاح';
    return 'فایل با موفقیت پارس شد';
  };

  return (
    <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-5 lg:p-6 shadow-xl backdrop-blur-sm">
      
      {/* Encoding & File Info Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            {t.uploadTitle}
          </h2>
        </div>

        {/* Encoding Selector */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <label className="text-slate-400 flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5" />
            <span>{t.encoding}:</span>
          </label>
          <select
            value={selectedEncoding}
            onChange={(e) => setSelectedEncoding(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
          >
            <option value="auto">{t.autoDetect}</option>
            <option value="UTF-8">UTF-8</option>
            <option value="Windows-1256">Windows-1256</option>
            <option value="UTF-16LE">UTF-16 LE</option>
            <option value="ISO-8859-1">ISO-8859-1 (Latin)</option>
          </select>
        </div>
      </div>

      {/* Upload Zone */}
      {!currentFileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 lg:p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".srt,.vtt,.ass,.ssa,.sub,.txt"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              {t.dragDropOrClick}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t.uploadSubtitle}
            </p>
          </div>

          {/* Formats Supported Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {['.SRT', '.VTT', '.ASS', '.SSA', '.SUB'].map((fmt) => (
              <span key={fmt} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                {fmt}
              </span>
            ))}
          </div>

          {/* Quick Test Button */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleLoadSample(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getLoadSampleText()}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Loaded File Summary Card */
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono truncate max-w-[240px] sm:max-w-[360px]">
                  {currentFileName}
                </h3>
                <span className="uppercase text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentFormat}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Size: {formatBytes(currentFileSize)}</span>
                <span>•</span>
                <span>{itemCount || 0} {t.linesCount}</span>
                {detectedEncoding && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{t.encoding}: {detectedEncoding}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>{getParsedSuccessText()}</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-400 hover:text-white underline px-2 py-1"
            >
              {getChangeFileText()}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept=".srt,.vtt,.ass,.ssa,.sub,.txt"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

    </div>
  );
};

