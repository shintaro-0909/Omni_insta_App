import { createI18n } from 'vue-i18n';
import ja from '@/locales/ja.json';
import en from '@/locales/en.json';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = typeof messages.ja;

const messages = {
  ja,
  en,
};

// ブラウザの言語設定を取得
const getBrowserLocale = (): string => {
  const navigator = window.navigator;
  const browserLang = navigator.language || (navigator as any).userLanguage;

  // 言語コード（例: ja-JP → ja）を抽出
  const lang = browserLang.split('-')[0];

  // サポートしている言語かチェック
  return Object.keys(messages).includes(lang) ? lang : 'ja';
};

// ローカルストレージから言語設定を取得
const getStoredLocale = (): string => {
  const stored = localStorage.getItem('omniy-locale');
  if (stored && Object.keys(messages).includes(stored)) {
    return stored;
  }
  return getBrowserLocale();
};

// i18nインスタンス作成
const i18n = createI18n<MessageSchema, MessageLanguages>({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: 'ja',
  messages,
  globalInjection: true,
  warnHtmlMessage: false,
});

// 言語変更関数
export const setLocale = (locale: MessageLanguages) => {
  (i18n.global.locale as any).value = locale;
  localStorage.setItem('omniy-locale', locale);

  // HTMLのlang属性も更新
  document.documentElement.lang = locale;
};

// 現在の言語を取得
export const getCurrentLocale = (): MessageLanguages => {
  return (i18n.global.locale as any).value;
};

// サポートしている言語の一覧
export const supportedLocales: {
  code: MessageLanguages;
  name: string;
  flag: string;
}[] = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

// 翻訳関数のヘルパー
export const t = (key: string, params?: Record<string, any>) => {
  return i18n.global.t(key, params || {});
};

// 日付・時刻のフォーマット
export const formatDate = (date: Date, locale?: MessageLanguages): string => {
  const currentLocale = locale || getCurrentLocale();

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(
    currentLocale === 'ja' ? 'ja-JP' : 'en-US',
    options
  ).format(date);
};

export const formatDateTime = (
  date: Date,
  locale?: MessageLanguages
): string => {
  const currentLocale = locale || getCurrentLocale();

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(
    currentLocale === 'ja' ? 'ja-JP' : 'en-US',
    options
  ).format(date);
};

export const formatTime = (date: Date, locale?: MessageLanguages): string => {
  const currentLocale = locale || getCurrentLocale();

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(
    currentLocale === 'ja' ? 'ja-JP' : 'en-US',
    options
  ).format(date);
};

// 数値のフォーマット
export const formatNumber = (
  num: number,
  locale?: MessageLanguages
): string => {
  const currentLocale = locale || getCurrentLocale();

  return new Intl.NumberFormat(
    currentLocale === 'ja' ? 'ja-JP' : 'en-US'
  ).format(num);
};

// 通貨のフォーマット
export const formatCurrency = (
  amount: number,
  currency = 'JPY',
  locale?: MessageLanguages
): string => {
  const currentLocale = locale || getCurrentLocale();

  return new Intl.NumberFormat(currentLocale === 'ja' ? 'ja-JP' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// パーセンテージのフォーマット
export const formatPercentage = (
  value: number,
  locale?: MessageLanguages
): string => {
  const currentLocale = locale || getCurrentLocale();

  return new Intl.NumberFormat(currentLocale === 'ja' ? 'ja-JP' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export default i18n;
