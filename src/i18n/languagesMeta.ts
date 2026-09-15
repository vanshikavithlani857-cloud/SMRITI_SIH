import { Language } from '../types';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
  isNorthEast?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  // North East Indian Languages (Priority Region)
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    region: 'North East (Assam)',
    isNorthEast: true,
  },
  {
    code: 'mni',
    name: 'Manipuri / Meitei',
    nativeName: 'মৈতৈলোন্',
    region: 'North East (Manipur)',
    isNorthEast: true,
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    region: 'North East & Sikkim',
    isNorthEast: true,
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बर’ / बड़ो',
    region: 'North East (Bodoland)',
    isNorthEast: true,
  },

  // National & Universal Languages
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'National / Hindi Belt',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Universal / English',
  },
];
