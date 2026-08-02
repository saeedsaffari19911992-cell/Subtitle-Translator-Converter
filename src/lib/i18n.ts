export type UILanguage = 'fa' | 'en' | 'ar';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  apiKey: string;
  customKeyActive: string;
  defaultKeyActive: string;
  downloadSubtitle: string;
  downloadDisabled: string;
  processing: string;
  uploadTitle: string;
  uploadSubtitle: string;
  dragDropOrClick: string;
  encoding: string;
  autoDetect: string;
  linesCount: string;
  sourceLang: string;
  targetLang: string;
  translationTone: string;
  startTranslation: string;
  translatingProgress: string;
  pause: string;
  resume: string;
  cancel: string;
  retryAttempt: string;
  batch: string;
  of: string;
  searchLanguagePlaceholder: string;
  noLanguageFound: string;
  subtitlesList: string;
  line: string;
  originalText: string;
  translatedText: string;
  actions: string;
  retranslateLine: string;
  deleteLine: string;
  findAndReplace: string;
  findPlaceholder: string;
  replacePlaceholder: string;
  replace: string;
  replaceWords: string;
  applyReplace: string;
  fillEmptyWithOriginal: string;
  fillEmptyLines: string;
  apiKeyModalTitle: string;
  apiKeyModalDesc: string;
  enterApiKeyPlaceholder: string;
  saveKey: string;
  clearKey: string;
  keySavedSuccess: string;
  keyClearedSuccess: string;
  close: string;
  toneCinematic: string;
  toneConversational: string;
  toneFormal: string;
  toneHumorous: string;
  toneEducational: string;
  toneDescCinematic: string;
  toneDescConversational: string;
  toneDescFormal: string;
  toneDescHumorous: string;
  toneDescEducational: string;
  testKey: string;
  testingKey: string;
  keyValid: string;
  keyInvalid: string;
  swapLanguages: string;
  outputFormat: string;
  subtitleSettings: string;
  autoDetectedSource: string;
  filterAll: string;
  filterUntranslated: string;
  filterTranslated: string;
  searchEditorPlaceholder: string;
  itemsPerPage: string;
  page: string;
  previous: string;
  next: string;
  copiedToClipboard: string;
  lineUpdated: string;
  lineDeleted: string;
  replacedCount: string;
  filledEmptyCount: string;
  newFileLoaded: string;
  previewLiveSubtitle: string;
  originalTextLabel: string;
  translatedTextLabel: string;
  completedLine: string;
  copyText: string;
  restoreOriginal: string;
  noSubtitlesToTranslate: string;
  userCancelled: string;
  translationFinished: string;
  singleLineTranslated: string;
  noFileLoaded: string;
}

export const TRANSLATIONS: Record<UILanguage, Translations> = {
  fa: {
    appTitle: 'مترجم و مبدل هوشمند زیرنویس',
    appSubtitle: 'ترجمه دقیق فیلم، سریال و ولاگ با Gemini 3.6',
    apiKey: 'کلید API',
    customKeyActive: 'کلید اختصاصی',
    defaultKeyActive: 'کلید پیش‌فرض',
    downloadSubtitle: 'دانلود ترجمه',
    downloadDisabled: 'دانلود غیرفعال',
    processing: 'در حال پردازش',
    uploadTitle: 'بارگذاری فایل زیرنویس',
    uploadSubtitle: 'پشتیبانی کامل از فرمت‌های SRT, VTT, ASS, SSA, SUB',
    dragDropOrClick: 'فایل زیرنویس را اینجا رها کنید یا برای انتخاب کلیک نمایید',
    encoding: 'انکودینگ فایل',
    autoDetect: 'تشخیص خودکار',
    linesCount: 'خط زیرنویس',
    sourceLang: 'زبان مبدأ',
    targetLang: 'زبان مقصد',
    translationTone: 'لحن و سبک ترجمه',
    startTranslation: 'شروع ترجمه هوشمند',
    translatingProgress: 'در حال ترجمه زیرنویس با Gemini 3.6 Flash',
    pause: 'توقف موقت',
    resume: 'ادامه',
    cancel: 'لغو',
    retryAttempt: 'تلاش مجدد',
    batch: 'بسته',
    of: 'از',
    searchLanguagePlaceholder: 'جستجوی زبان...',
    noLanguageFound: 'زبانی یافت نشد',
    subtitlesList: 'ویرایشگر خط به خط زیرنویس',
    line: 'خط',
    originalText: 'متن اصلی',
    translatedText: 'متن ترجمه‌شده',
    actions: 'عملیات',
    retranslateLine: 'ترجمه مجدد این خط',
    deleteLine: 'حذف خط',
    findAndReplace: 'جستجو و جایگزینی همزمان',
    findPlaceholder: 'واژه قدیمی...',
    replacePlaceholder: 'واژه جدید...',
    replace: 'جایگزینی',
    replaceWords: 'جستجو و جایگزینی کلمات',
    applyReplace: 'جایگزینی همه',
    fillEmptyWithOriginal: 'پرکردن خطوط خالی با متن اصلی',
    fillEmptyLines: 'تکمیل خطوط خالی',
    apiKeyModalTitle: 'تنظیم کلید اختصاصی Gemini API (BYOK)',
    apiKeyModalDesc: 'می‌توانید کلید شخصی خود را از Google AI Studio وارد کنید تا محدودیتی در ترجمه نداشته باشید. کلید در مرورگر شما ذخیره می‌شود.',
    enterApiKeyPlaceholder: 'کلید API خود را وارد کنید (AIzaSy...)',
    saveKey: 'ذخیره کلید',
    clearKey: 'پاکسازی کلید',
    keySavedSuccess: 'کلید API شخصی با موفقیت ذخیره شد.',
    keyClearedSuccess: 'کلید API شخصی پاک شد و سیستم به کلید پیش‌فرض برگشت.',
    close: 'بستن',
    toneCinematic: 'سینمایی و دراماتیک',
    toneConversational: 'عامیانه و گفتاری',
    toneFormal: 'رسمی و دقیق',
    toneHumorous: 'طنز و شوخ‌طبعانه (بدون سانسور)',
    toneEducational: 'آموزشی و علمی',
    toneDescCinematic: 'لحن شیوا، حماسی و مناسب دوبله و فیلم‌های سینمایی فاخر',
    toneDescConversational: 'زبان روزمره، صمیمی، روانی مکالمات خیابانی و اصطلاحات روز',
    toneDescFormal: 'وفاداری کامل به واژگان با ادبیات معیار و رسمی',
    toneDescHumorous: 'ترجمه شوخی‌ها، جوک‌ها و متلک‌ها به صورت روان و بدون سانسور',
    toneDescEducational: 'رعایت ترمینولوژی تخصصی و صراحت مستندهای علمی',
    testKey: 'تست ارتباط کلید',
    testingKey: 'در حال بررسی کلید...',
    keyValid: 'کلید API معتبر و فعال است!',
    keyInvalid: 'خطا در تست کلید API:',
    swapLanguages: 'تعویض زبان مبدأ و مقصد',
    outputFormat: 'فرمت خروجی زیرنویس:',
    subtitleSettings: 'تنظیمات ترجمه و لحن زبان',
    autoDetectedSource: 'تشخیص هوشمند:',
    filterAll: 'همه خطوط',
    filterUntranslated: 'ترجمه‌نشده',
    filterTranslated: 'ترجمه‌شده',
    searchEditorPlaceholder: 'جستجو در زیرنویس اصلی یا ترجمه...',
    itemsPerPage: 'تعداد در صفحه:',
    page: 'صفحه',
    previous: 'قبلی',
    next: 'بعدی',
    copiedToClipboard: 'در حافظه کپی شد!',
    lineUpdated: 'خط زیرنویس به‌روزرسانی شد.',
    lineDeleted: 'خط زیرنویس حذف شد.',
    replacedCount: 'تعداد {count} مورد جایگزین شد.',
    filledEmptyCount: 'تعداد {count} خط خالی با متن اصلی پر شد.',
    newFileLoaded: 'فایل زیرنویس جدید با موفقیت بارگذاری شد.',
    previewLiveSubtitle: 'پیش‌نمایش زنده زیرنویس',
    originalTextLabel: 'متن اصلی',
    translatedTextLabel: 'متن ترجمه‌شده',
    completedLine: 'تکمیل‌شده',
    copyText: 'کپی متن',
    restoreOriginal: 'بازگردانی متن اصلی',
    noSubtitlesToTranslate: 'هیچ زیرنویسی برای ترجمه وجود ندارد.',
    userCancelled: 'ترجمه توسط کاربر لغو شد.',
    translationFinished: 'ترجمه زیرنویس با موفقیت به پایان رسید!',
    singleLineTranslated: 'خط با موفقیت ترجمه شد.',
    noFileLoaded: 'هیچ فایلی بارگذاری نشده است.',
  },
  en: {
    appTitle: 'Universal Subtitle Translator & Converter',
    appSubtitle: 'Accurate subtitle translation powered by Gemini 3.6 Flash',
    apiKey: 'API Key',
    customKeyActive: 'Custom Key',
    defaultKeyActive: 'Default Key',
    downloadSubtitle: 'Download Subtitle',
    downloadDisabled: 'Download Locked',
    processing: 'Processing',
    uploadTitle: 'Upload Subtitle File',
    uploadSubtitle: 'Full support for SRT, VTT, ASS, SSA, SUB formats',
    dragDropOrClick: 'Drag & drop subtitle file here or click to browse',
    encoding: 'File Encoding',
    autoDetect: 'Auto Detect',
    linesCount: 'lines',
    sourceLang: 'Source Language',
    targetLang: 'Target Language',
    translationTone: 'Translation Tone & Style',
    startTranslation: 'Start AI Translation',
    translatingProgress: 'Translating subtitles with Gemini 3.6 Flash',
    pause: 'Pause',
    resume: 'Resume',
    cancel: 'Cancel',
    retryAttempt: 'Retry Attempt',
    batch: 'Batch',
    of: 'of',
    searchLanguagePlaceholder: 'Search language...',
    noLanguageFound: 'No language found',
    subtitlesList: 'Line-by-Line Subtitle Editor',
    line: 'Line',
    originalText: 'Original Text',
    translatedText: 'Translated Text',
    actions: 'Actions',
    retranslateLine: 'Re-translate line',
    deleteLine: 'Delete line',
    findAndReplace: 'Find & Batch Replace',
    findPlaceholder: 'Find word...',
    replacePlaceholder: 'Replace with...',
    replace: 'Replace All',
    replaceWords: 'Find & Replace Words',
    applyReplace: 'Replace All',
    fillEmptyWithOriginal: 'Fill empty lines with original text',
    fillEmptyLines: 'Fill Empty Lines',
    apiKeyModalTitle: 'Custom Gemini API Key Settings (BYOK)',
    apiKeyModalDesc: 'Enter your personal Google AI Studio Gemini API key to bypass default usage limits. Stored securely in your browser.',
    enterApiKeyPlaceholder: 'Paste your Gemini API Key (AIzaSy...)',
    saveKey: 'Save Key',
    clearKey: 'Clear Key',
    keySavedSuccess: 'Custom API key saved successfully.',
    keyClearedSuccess: 'Custom API key removed. Restored default server key.',
    close: 'Close',
    toneCinematic: 'Cinematic & Dramatic',
    toneConversational: 'Casual & Conversational',
    toneFormal: 'Formal & Precise',
    toneHumorous: 'Humorous & Uncensored',
    toneEducational: 'Educational & Technical',
    toneDescCinematic: 'Expressive, epic, cinematic and movie-dubbing style',
    toneDescConversational: 'Casual spoken language, friendly banter and everyday idioms',
    toneDescFormal: 'Strict literary accuracy, standard formal grammar and vocabulary',
    toneDescHumorous: 'Natural jokes, street slang & comedy translated without censorship',
    toneDescEducational: 'Precise scientific terminology & clear educational clarity',
    testKey: 'Test Connection',
    testingKey: 'Testing key...',
    keyValid: 'API Key is valid and active!',
    keyInvalid: 'API Key test failed:',
    swapLanguages: 'Swap source and target languages',
    outputFormat: 'Subtitle Output Format:',
    subtitleSettings: 'Translation & Language Settings',
    autoDetectedSource: 'Auto-detected:',
    filterAll: 'All Lines',
    filterUntranslated: 'Untranslated',
    filterTranslated: 'Translated',
    searchEditorPlaceholder: 'Search in original or translated subtitles...',
    itemsPerPage: 'Items per page:',
    page: 'Page',
    previous: 'Previous',
    next: 'Next',
    copiedToClipboard: 'Copied to clipboard!',
    lineUpdated: 'Subtitle line updated.',
    lineDeleted: 'Subtitle line deleted.',
    replacedCount: 'Replaced {count} occurrence(s).',
    filledEmptyCount: 'Filled {count} empty line(s) with original text.',
    newFileLoaded: 'New subtitle file loaded successfully.',
    previewLiveSubtitle: 'Live Subtitle Preview',
    originalTextLabel: 'Original Text',
    translatedTextLabel: 'Translated Text',
    completedLine: 'Completed',
    copyText: 'Copy Text',
    restoreOriginal: 'Restore Original',
    noSubtitlesToTranslate: 'No subtitles available to translate.',
    userCancelled: 'Translation cancelled by user.',
    translationFinished: 'Subtitle translation completed successfully!',
    singleLineTranslated: 'Line translated successfully.',
    noFileLoaded: 'No file loaded.',
  },
  ar: {
    appTitle: 'مترجم ومحول الترجمات الذكي',
    appSubtitle: 'ترجمة دقيقة لملفات الترجمة بواسطة Gemini 3.6 Flash',
    apiKey: 'مفتاح API',
    customKeyActive: 'مفتاح خاص',
    defaultKeyActive: 'المفتاح الافتراضي',
    downloadSubtitle: 'تحميل الترجمة',
    downloadDisabled: 'التحميل معطل',
    processing: 'جاري المعالجة',
    uploadTitle: 'رفع ملف الترجمة',
    uploadSubtitle: 'دعم كامل لصيغ SRT, VTT, ASS, SSA, SUB',
    dragDropOrClick: 'اسحب ملف الترجمة واسقطه هنا أو انقر للاختيار',
    encoding: 'ترميز الملف',
    autoDetect: 'كشف تلقائي',
    linesCount: 'سطر ترجمة',
    sourceLang: 'اللغة المصدر',
    targetLang: 'اللغة الهدف',
    translationTone: 'أسلوب وأسلوب الترجمة',
    startTranslation: 'بدء الترجمة الذكية',
    translatingProgress: 'جاري ترجمة النصوص بواسطة Gemini 3.6 Flash',
    pause: 'إيقاف مؤقت',
    resume: 'استئناف',
    cancel: 'إلغاء',
    retryAttempt: 'إعادة المحاولة',
    batch: 'دفعة',
    of: 'من',
    searchLanguagePlaceholder: 'البحث عن لغة...',
    noLanguageFound: 'لم يتم العثور على لغة',
    subtitlesList: 'محرر الترجمة سطرًا بسطر',
    line: 'سطر',
    originalText: 'النص الأصلي',
    translatedText: 'النص المترجم',
    actions: 'إجراءات',
    retranslateLine: 'إعادة ترجمة هذا السطر',
    deleteLine: 'حذف السطر',
    findAndReplace: 'البحث والاستبدال الجماعي',
    findPlaceholder: 'الكلمة القديمة...',
    replacePlaceholder: 'الكلمة الجديدة...',
    replace: 'استبدال الكل',
    replaceWords: 'البحث واستبدال الكلمات',
    applyReplace: 'استبدال الكل',
    fillEmptyWithOriginal: 'ملء الأسطر الفارغة بالنص الأصلي',
    fillEmptyLines: 'ملء الأسطر الفارغة',
    apiKeyModalTitle: 'إعداد مفتاح Gemini API الخاص (BYOK)',
    apiKeyModalDesc: 'أدخل مفتاح API الخاص بك من Google AI Studio لتجاوز قيود الاستخدام الافتراضية. يحفظ بأمان في متصفحك.',
    enterApiKeyPlaceholder: 'أدخل مفتاح API الخاص بك (AIzaSy...)',
    saveKey: 'حفظ المفتاح',
    clearKey: 'مسح المفتاح',
    keySavedSuccess: 'تم حفظ مفتاح API بنجاح.',
    keyClearedSuccess: 'تمت إزالة المفتاح الخاص والعودة للمفتاح الافتراضي.',
    close: 'إغلاق',
    toneCinematic: 'سينمائي ودرامي',
    toneConversational: 'عامي وحواري',
    toneFormal: 'رسمي ودقيق',
    toneHumorous: 'فكاهي وبدون رقابة',
    toneEducational: 'تعليمي وعلمي',
    toneDescCinematic: 'أسلوب درامي وشيق مناسب للأفلام والمسلسلات',
    toneDescConversational: 'لغة عامية وحوارات يومية طبيعية',
    toneDescFormal: 'دقة لغوية رسمية وأسلوب أادبي قياسي',
    toneDescHumorous: 'ترجمة الفكاهة والنكات بدون سانسور وبشكل طبيعي',
    toneDescEducational: 'دقة علمية ومصطلحات متخصصة للمستندات',
    testKey: 'اختبار الاتصال',
    testingKey: 'جاري اختبار المفتاح...',
    keyValid: 'مفتاح API صالح ونشط!',
    keyInvalid: 'فشل اختبار مفتاح API:',
    swapLanguages: 'تبديل اللغة المصدر والهدف',
    outputFormat: 'صيغة مخرجات الترجمة:',
    subtitleSettings: 'إعدادات الترجمة واللغة',
    autoDetectedSource: 'الكشف التلقائي:',
    filterAll: 'كل الأسطر',
    filterUntranslated: 'غير مترجم',
    filterTranslated: 'مترجم',
    searchEditorPlaceholder: 'البحث في الترجمة الأصلية أو المترجمة...',
    itemsPerPage: 'العناصر في الصفحة:',
    page: 'صفحة',
    previous: 'السابق',
    next: 'التالي',
    copiedToClipboard: 'تم النسخ إلى الحافظة!',
    lineUpdated: 'تم تحديث سطر الترجمة.',
    lineDeleted: 'تم حذف سطر الترجمة.',
    replacedCount: 'تم استبدال {count} عنصر.',
    filledEmptyCount: 'تم ملء {count} سطر فارغ بالنص الأصلي.',
    newFileLoaded: 'تم تحميل ملف الترجمة بنجاح.',
    previewLiveSubtitle: 'معاينة الترجمة الحية',
    originalTextLabel: 'النص الأصلي',
    translatedTextLabel: 'النص المترجم',
    completedLine: 'مكتمل',
    copyText: 'نسخ النص',
    restoreOriginal: 'استعادة الأصلي',
    noSubtitlesToTranslate: 'لا توجد ترجمات متاحة للترجمة.',
    userCancelled: 'تم إلغاء الترجمة بواسطة المستخدم.',
    translationFinished: 'تمت ترجمة ملف الترجمة بنجاح!',
    singleLineTranslated: 'تمت ترجمة السطر بنجاح.',
    noFileLoaded: 'لم يتم تحميل أي ملف.',
  },
};
