/**
 * Types for Universal Subtitle Translator & Converter
 */

export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa' | 'sub';

export type ToneOption = 'conversational' | 'cinematic' | 'formal' | 'humorous' | 'educational';

export interface ToneInfo {
  id: ToneOption;
  labelFa: string;
  labelEn: string;
  descriptionFa: string;
  iconName: string;
}

export interface LanguageOption {
  code: string;
  nameFa: string;
  nameEn: string;
  flag: string;
}

export interface SubtitleItem {
  id: number;
  startTime: string;  // e.g. "00:01:20,500" or "00:01:20.50"
  endTime: string;    // e.g. "00:01:24,100"
  startSeconds: number;
  endSeconds: number;
  originalText: string;
  translatedText: string;
  styleTags?: string; // ASS/SSA styling or header tags if any
  isEditing?: boolean;
}

export interface BatchTranslateRequest {
  items: { id: number; text: string }[];
  sourceLanguage?: string;
  targetLanguage: string;
  tone: ToneOption;
}

export interface BatchTranslateResponse {
  translations: { id: number; text: string }[];
  detectedSourceLanguage?: string;
  error?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
