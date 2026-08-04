import React from 'react';
import { UILanguage, TRANSLATIONS } from '../lib/i18n';
import { 
  HelpCircle, 
  X, 
  Key, 
  Upload, 
  Sliders, 
  Download, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  Video,
  Palette,
  Wand2
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiLang: UILanguage;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  uiLang,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[uiLang];

  const getHelpContent = () => {
    if (uiLang === 'en') {
      return {
        title: 'User Guide & Features Overview',
        subtitle: 'Complete guide for raw video subtitle extraction, translation, preview, styling, and editing',
        steps: [
          {
            stepNum: '1',
            icon: Key,
            title: 'Gemini API Key Setup & Multi-Key Failover',
            desc: 'Click "API Key" in the top bar. Enter one or multiple Google AI Studio keys (separated by lines). The system automatically rotates keys if rate limits (429) occur.',
            tag: 'Multi-Key Rotation',
          },
          {
            stepNum: '2',
            icon: Wand2,
            title: 'Auto-Generate Subtitles from Raw Video',
            desc: 'Upload any raw video file without subtitles in any spoken language. Click "Generate Subtitles from Video" for 1-click AI speech recognition and timing generation before translating.',
            tag: 'New: AI Video-to-Subtitle',
          },
          {
            stepNum: '3',
            icon: Video,
            title: 'Real-time Video Preview & Subtitle Sync',
            desc: 'Upload or attach a video file to play it alongside your translated subtitles in real-time with instant line highlighting and video seeking.',
            tag: 'Live Preview Player',
          },
          {
            stepNum: '4',
            icon: Palette,
            title: 'Custom Subtitle Visual Styling',
            desc: 'Customize subtitle overlay appearance on video: adjust font family, font size, text color, background opacity, outline, and screen position.',
            tag: 'Styling Controls',
          },
          {
            stepNum: '5',
            icon: Sliders,
            title: 'Smart Translation, Tone & Custom Glossary',
            desc: 'Choose from 50+ languages, set translation tone (Formal, Informal, Technical, Creative), and define custom Glossary terms for accurate AI translations.',
            tag: 'AI Translation Engine',
          },
          {
            stepNum: '6',
            icon: Clock,
            title: 'Interactive Editor, Time-Shift & RTL Fix',
            desc: 'Inline line editing, bulk time-shifting (+/- milliseconds), Undo/Redo history, and automated punctuation fix for RTL Persian and Arabic scripts.',
            tag: 'Advanced Subtitle Tools',
          },
          {
            stepNum: '7',
            icon: Download,
            title: 'Export in Multiple Formats',
            desc: 'Download your translated or generated subtitles in SRT, VTT, or ASS format preserving custom styling and formatting.',
            tag: 'SRT / VTT / ASS',
          },
        ],
        networkNoticeTitle: 'Rate Limits & Network Guidance',
        networkNoticeDesc: 'Free-tier Gemini API keys have rate limits. The app features intelligent failovers:',
        networkNoticePoints: [
          'Add multiple API keys to prevent translation pauses on 429 quota exhaustion',
          'Automated fallback between Gemini 3.6 Flash and Gemini 2.5 Flash',
          'If in restricted network regions, use a VPN with TUN Mode or anti-sanction DNS',
          'Translation progress is saved line-by-line; click Resume if a batch pauses',
        ],
      };
    }

    if (uiLang === 'ar') {
      return {
        title: 'دليل الاستخدام والميزات الجديدة',
        subtitle: 'دليل شامل لاستخراج الترجمة من الفيديو الخام، الترجمة الذكية، المعاينة، الضبط والتصدير',
        steps: [
          {
            stepNum: '١',
            icon: Key,
            title: 'إعداد مفتاح Gemini API والتدوير المتعدد',
            desc: 'انقر على "مفتاح API". أدخل مفتاحاً واحداً أو مفاتيح متعددة (كل مفتاح في سطر). يقوم النظام بتدوير المفاتيح تلقائياً عند الوصول للحد الأقصى (429).',
            tag: 'جديد: تدوير المفاتيح',
          },
          {
            stepNum: '٢',
            icon: Wand2,
            title: 'توليد تلقائي للترجمة من الفيديو الخام',
            desc: 'قم برفع أي فيديو خام بدون ترجمة بأي لغة. بنقرة واحدة على "توليد الترجمة من الفيديو"، يستخرج الذكاء الاصطناعي الكلام ويحدد التوقيت بدقة قبل ترجمته.',
            tag: 'جديد: الذكاء الاصطناعي للفيديو',
          },
          {
            stepNum: '٣',
            icon: Video,
            title: 'معاينة الفيديو المباشرة ومزامنة النص',
            desc: 'ارفق ملف الفيديو لمشاهدته بالتزامن مع الترجمة المترجمة مباشرة مع التمييز التلقائي للسطر الحالي.',
            tag: 'مشغل المعاينة المباشر',
          },
          {
            stepNum: '٤',
            icon: Palette,
            title: 'تخصيص مظهر ونمط الترجمة',
            desc: 'تخصيص كامل لظهر الترجمة على الفيديو: اختيار الخط، حجم النص، لون الخط، لون الخلفية، الحواف، وموقع الترجمة على الشاشة.',
            tag: 'تنسيق النمط',
          },
          {
            stepNum: '٥',
            icon: Sliders,
            title: 'الترجمة الذكية، النبرة والمصطلحات المخصصة',
            desc: 'اختر من بين أكثر من 50 لغة، حدد نبرة الترجمة (رسمية، إبداعية، تقنية) وأضف قاموس مصطلحات مخصص لتوحيد الأسماء والكلمات الخاصة.',
            tag: 'محرك ترجمة مخصص',
          },
          {
            stepNum: '٦',
            icon: Clock,
            title: 'محرر تفاعلي، ضبط التوقيت وإصلاح علامات الترقيم',
            desc: 'تعديل مباشر للنصوص والتوقيت، تقديم/تأخير الزمن (+/- ملي ثانية)، سجل التراجع، وإصلاح تلقائي لعلامات الترقيم والأقواس للنصوص العربية.',
            tag: 'أدوات تحرير متقدمة',
          },
          {
            stepNum: '٧',
            icon: Download,
            title: 'تصدير بصيغ متعددة',
            desc: 'قم بتحميل ملف الترجمة بصيغ SRT أو VTT أو ASS مع الحفاظ على الأنماط والتنسيق الأصلي.',
            tag: 'تصدير SRT / VTT / ASS',
          },
        ],
        networkNoticeTitle: 'إرشادات حدود API والشبكة',
        networkNoticeDesc: 'تتمتع المفاتيح المجانية بحد أقصى للطلبات. يحتوي التطبيق على نظام استعادة تلقائي:',
        networkNoticePoints: [
          'أضف أكثر من مفتاح API لتفادي توقف الترجمة عند نفاد الحصة',
          'تحويل تلقائي سلس بين طرازي Gemini 3.6 Flash و Gemini 2.5 Flash',
          'تأكد من استقرار الاتصال أو تفعيل VPN مناسب في حال وجود قيود شبكة',
          'يتم حفظ تقدم الترجمة تلقائياً خطوة بخطوة ويمكنك الاستئناف في أي وقت',
        ],
      };
    }

    // Default Persian (fa)
    return {
      title: 'راهنمای جامع و معرفی امکانات پیشرفته سیستم',
      subtitle: 'راهنمای ساخت زیرنویس از ویدیو خام، ترجمه هوشمند، پیش‌نمایش، تنظیم استایل و ویرایش با Gemini 3.6 Flash',
      steps: [
        {
          stepNum: '۱',
          icon: Key,
          title: 'تنظیم کلید API و پشتیبانی از چند کلید (Multi-Key Rotation)',
          desc: 'از بالای صفحه روی «کلید API» کلیک کنید. امکان وارد کردن یک یا چند کلید Gemini (در خطوط مجزا) وجود دارد. در صورت اتمام سهمیه (خطای ۴۲۹)، سیستم به صورت خودکار روی کلید بعدی سوییچ می‌کند.',
          tag: 'چرخش خودکار کلیدها',
        },
        {
          stepNum: '۲',
          icon: Wand2,
          title: 'تولید هوشمند زیرنویس از روی ویدیو خام (بدون زیرنویس)',
          desc: 'شما می‌توانید فایل ویدیو خام (به هر زبانی) را آپلود کنید. با یک کلیک روی دکمه «تولید زیرنویس از ویدیو»، هوش مصنوعی گفتار ویدیو را تحلیل کرده، زیرنویس دقیق با زمانبندی کامل می‌سازد تا سپس آن را به زبان دلخواه ترجمه کنید.',
          tag: 'جدید: تولید زیرنویس با AI',
        },
        {
          stepNum: '۳',
          icon: Video,
          title: 'پیش‌نمایش زنده ویدیو و هماهنگ‌سازی با زیرنویس',
          desc: 'با بارگذاری فایل ویدیو، می‌توانید ویدیو را همزمان با زیرنویس ترجمه‌شده پخش کرده و هایلایت خط فعال و پرش زنده به زمان‌های مختلف را مشاهده کنید.',
          tag: 'پلیر پیش‌نمایش زنده',
        },
        {
          stepNum: '۴',
          icon: Palette,
          title: 'تنظیمات کامل استایل و مظهر زیرنویس',
          desc: 'شخصی‌سازی کامل نحوه نمایش زیرنویس روی ویدیو: تغییر فونت، اندازه متن، رنگ فونت، رنگ و شفافیت پس‌زمینه/کادر، سایه و موقعیت قرارگیری روی تصویر.',
          tag: 'جدید: سفارشی‌سازی استایل',
        },
        {
          stepNum: '۵',
          icon: Sliders,
          title: 'ترجمه هوشمند، تنظیم لحن و واژه‌نامه اختصاصی (Glossary)',
          desc: 'انتخاب از میان ۵۰+ زبان، تعیین لحن ترجمه (رسمی، عامیانه، تخصصی، سینمایی) و تعریف واژه‌نامه اختصاصی برای ترجمه یکدست اسامی خاص و اصطلاحات فیلم.',
          tag: 'موتور هوشمند Gemini',
        },
        {
          stepNum: '۶',
          icon: Clock,
          title: 'ویرایشگر پیشرفته، تنظیم تایمینگ و اصلاح علائم راست‌به‌چپ',
          desc: 'ویرایش مستقیم متن و زمانبندی، عقب/جلو بردن زمان زیرنویس (میلی‌ثانیه)، تاریخچه Undo/Redo، و اصلاح هوشمند علائم نگارشی و پرانتزهای فارسی/عربی.',
          tag: 'ابزارهای تخصصی',
        },
        {
          stepNum: '۷',
          icon: Download,
          title: 'خروجی‌گرفتن با فرمت‌های مختلف (SRT, VTT, ASS)',
          desc: 'دانلود فایل ترجمه‌شده یا تولیدشده نهایی به فرمت‌های SRT, VTT یا ASS با حفظ کامل استایل‌ها و هدرهای اصلی فایل.',
          tag: 'خروجی فوری',
        },
      ],
      networkNoticeTitle: '⚠️ راهنمای مدیریت محدودیت API و شبکه (ویژه کاربران)',
      networkNoticeDesc: 'کلیدهای رایگان گوگل Gemini دارای محدودیت تعداد درخواست (Rate Limit) هستند. سیستم هوشمند جدید شامل موارد زیر است:',
      networkNoticePoints: [
        'افزایش سرعت با وارد کردن چند کلید API مجزا (سیستم خودکار کلید بعدی را جایگزین می‌کند)',
        'جایگزینی هوشمند میان جدیدترین مدل‌ها: Gemini 3.6 Flash (اصلی) و Gemini 2.5 Flash (پشتیبان)',
        'در صورت خطای شبکه در ایران، حتماً از VPN با TUN Mode (مانند Clash یا V2ray) یا DNS ضدتحریم استفاده کنید',
        'پیشرفت ترجمه خط‌به‌خط ذخیره می‌شود؛ در صورت توقف می‌توانید با دکمه «ادامه» فرایند را تکمیل کنید',
      ],
    };
  };

  const content = getHelpContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {content.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {content.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="grid grid-cols-1 gap-3.5">
          {content.steps.map((step) => {
            const IconComp = step.icon;
            return (
              <div
                key={step.stepNum}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-start gap-3.5 transition-all hover:border-indigo-500/40"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {step.stepNum}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Network & Rate Limit Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{content.networkNoticeTitle}</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/90">
            {content.networkNoticeDesc}
          </p>
          <ul className="list-disc list-inside text-xs space-y-1 font-medium text-amber-900/90 dark:text-amber-200/90 mt-1">
            {content.networkNoticePoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Powered by Gemini 3.6 Flash & 2.5 Flash
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
