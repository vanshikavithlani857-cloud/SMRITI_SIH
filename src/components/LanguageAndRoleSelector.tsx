import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Smile, 
  Users, 
  Phone, 
  Heart,
  Download,
  Check
} from 'lucide-react';
import { Language, UserRole, CaregiverDetails } from '../types';
import { translations } from '../i18n/translations';
import { SUPPORTED_LANGUAGES } from '../i18n/languagesMeta';
import { playGentleTap, speakText } from '../utils/audio';
import { AppLogo } from './AppLogo';

interface LanguageAndRoleSelectorProps {
  currentLanguage: Language;
  currentRole: UserRole;
  initialCaregiverDetails?: CaregiverDetails;
  onSelectLanguage: (lang: Language) => void;
  onSelectRole: (role: UserRole) => void;
  onConfirm: (role: UserRole, lang: Language, caregiverInfo?: CaregiverDetails) => void;
  onOpenUsbModal?: () => void;
}

export const LanguageAndRoleSelector: React.FC<LanguageAndRoleSelectorProps> = ({
  currentLanguage,
  currentRole,
  initialCaregiverDetails,
  onSelectLanguage,
  onSelectRole,
  onConfirm,
  onOpenUsbModal,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(currentLanguage || 'en');

  const t = translations[selectedLang] || translations.en;

  const handleLangChange = (lang: Language) => {
    playGentleTap();
    setSelectedLang(lang);
    onSelectLanguage(lang);

    const greeting = lang === 'hi' 
      ? 'नमस्ते! स्मृति में आपका स्वागत है।'
      : lang === 'as'
      ? 'নমস্কাৰ! স্মৃতিলৈ স্বাগতম।'
      : lang === 'mni'
      ? 'খুরুমজরি! স্মৃতিদা তরাম্না ওকচরি।'
      : lang === 'ne'
      ? 'नमस्ते! स्मृतिमा स्वागत छ।'
      : lang === 'brx'
      ? 'खुलुमबाय! स्मृतिसिम बरायबाय।'
      : 'Welcome to Smriti.';
    
    speakText(greeting, lang);
  };

  const handleSelectRole = (role: UserRole) => {
    playGentleTap();
    onSelectRole(role);

    const caregiverInfo: CaregiverDetails = initialCaregiverDetails || {
      name: 'Pooja Sharma',
      phone: '+91 98765 43210',
      relation: 'Daughter',
      city: 'Guwahati / New Delhi',
      securityPin: '1234',
      registeredAt: new Date().toLocaleDateString(),
    };

    onConfirm(role, selectedLang, caregiverInfo);
  };

  // Localized Titles & Descriptions
  const roleCopy = {
    patient: {
      hi: {
        title: 'मरीज़ साथी',
        subtitle: 'सरल आवाज़ सहायता, दवाई की याद, परिवार की तस्वीरें और १-टैप आपातकालीन SOS।',
        btn: 'मरीज़ के रूप में शुरू करें',
      },
      as: {
        title: 'ৰোগী সংগী',
        subtitle: 'সহজ কথাৰে সহায়, ঔষধৰ সোঁৱৰণী, পৰিয়ালৰ পুৰণি স্মৃতি আৰু ১-টেপ জৰুৰীকালীন SOS।',
        btn: 'ৰোগী হিচাপে আৰম্ভ কৰক',
      },
      mni: {
        title: 'লৈরিবা মরূপ',
        subtitle: 'খোন্থোক্না মতেং পাংবা, হিদাক নীংশিংবা, ইমুংগী স্মৃতি অমসুং ১-তেপ জৰুৰীকালীন SOS।',
        btn: 'লৈরিবা ওইনা চঙবা',
      },
      ne: {
        title: 'बिरामी साथी',
        subtitle: 'आवाजबाट सहयोग, औषधिको सम्झना, पारिवारिक सम्झनाहरू र १-ट्याप आपतकालीन SOS।',
        btn: 'बिरामीको रूपमा सुरु गर्नुहोस्',
      },
      brx: {
        title: 'बिमारी साथी',
        subtitle: 'गोरलै राव मदद, मुलिनि सोमावसारनाय, नखरनि नोजोर आरो १-थेप गोनांथार SOS।',
        btn: 'बिमारी हिसाबै जागाय',
      },
      en: {
        title: 'Patient Companion',
        subtitle: 'Calm voice recall, gentle medicine reminders, cherished family memories, and 1-tap SOS.',
        btn: 'Continue as Patient',
      },
    },
    caregiver: {
      hi: {
        title: 'केयरगिवर पोर्टल',
        subtitle: 'सुरक्षा अलर्ट, दवाई और रूटीन प्रबंधन, दैनिक स्वास्थ्य प्रगति और डॉक्टर संपर्क।',
        btn: 'केयरगिवर के रूप में शुरू करें',
      },
      as: {
        title: 'পৰিচৰ্যাকাৰী প’ৰ্টেল',
        subtitle: 'সুৰক্ষা সতৰ্কবাৰ্তা, ঔষধ আৰু ৰুটিন পৰিচালনা, দৈনিক স্বাস্থ্য অগ্ৰগতি আৰু সুৰক্ষিত প্ৰৱেশ।',
        btn: 'পৰিচৰ্যাকাৰী হিচাপে আৰম্ভ কৰক',
      },
      mni: {
        title: 'য়োকখৎপীবা পোর্তেল',
        subtitle: 'সুৰক্ষা পাউজেল, হিদাক অমসুং মতম নিংথিনা শেম্বা, হকচাংগী ফিভম নিৰীক্ষণ।',
        btn: 'য়োকখৎপীবা ওইনা চঙবা',
      },
      ne: {
        title: 'हेरचाहकर्ता पोर्टल',
        subtitle: 'सुरक्षा सूचनाहरू, औषधि र दैनिक तालिका व्यवस्थापन, दैनिक स्वास्थ्य प्रगति र सम्पर्क।',
        btn: 'हेरचाहकर्ताको रूपमा सुरु गर्नुहोस्',
      },
      brx: {
        title: 'फासिग्रा पोर्टल',
        subtitle: 'रैखाथि सांग्रांथि, मुलि आरो सानफ्रोमबोनि हाबाफोर, सावस्रि जौगानाय निजिं।',
        btn: 'फासिग्रा हिसाबै जागाय',
      },
      en: {
        title: 'Caregiver Portal',
        subtitle: 'Real-time safety alerts, medicine scheduler, cognitive tracking, and secure PIN access.',
        btn: 'Continue as Caregiver',
      },
    },
  };

  const patientText = roleCopy.patient[selectedLang] || roleCopy.patient.en;
  const caregiverText = roleCopy.caregiver[selectedLang] || roleCopy.caregiver.en;

  const getLanguageGreeting = (lang: Language) => {
    switch (lang) {
      case 'as': return 'অসমীয়া নিৰ্বাচিত হৈছে';
      case 'mni': return 'মৈতৈলোন্ খনখ্রে';
      case 'ne': return 'नेपाली भाषा चयन गरियो';
      case 'brx': return 'बर’ राव सायखबाय';
      case 'hi': return 'हिन्दी चुनी गई है';
      default: return 'English selected';
    }
  };

  const selectPrompt = 
    selectedLang === 'as' ? 'আপোনাৰ ভাষা বাচক আৰু আৰম্ভ কৰক:'
    : selectedLang === 'mni' ? 'অদোমগী লোন খনবীরগা হৌবীয়ু:'
    : selectedLang === 'ne' ? 'आफ्नो भाषा छान्नुहोस् र सुरु गर्नुहोस्:'
    : selectedLang === 'brx' ? 'नोंथांनि राव सायख आरो जागाय:'
    : selectedLang === 'hi' ? 'अपनी भाषा चुनें और शुरू करें:'
    : 'Choose your language to begin:';

  const rolePrompt = 
    selectedLang === 'as' ? 'আজি স্মৃতি কোনে ব্যৱহাৰ কৰিছে?'
    : selectedLang === 'mni' ? 'ঙসি স্মৃতি কনাগীদমক শীজিন্নগনি?'
    : selectedLang === 'ne' ? 'आज स्मृति कसले प्रयोग गर्दै हुनुहुन्छ?'
    : selectedLang === 'brx' ? 'दिनै स्मृतिखौ सोर बाहायगोन?'
    : selectedLang === 'hi' ? 'आज स्मृति का उपयोग कौन कर रहा है?'
    : 'Who is using Smriti today?';

  return (
    <main 
      id="main-language-role-dashboard"
      className="min-h-screen bg-[#F7F3E9] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans text-stone-900"
    >
      <div className="max-w-3xl mx-auto w-full space-y-6 pt-2 sm:pt-6">
        
        {/* Brand & Welcoming Header */}
        <header className="text-center space-y-2.5">
          <div className="flex justify-center items-center">
            <AppLogo size="lg" showText={false} />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight">
            {t.appName}
          </h1>

          <p className="text-sm sm:text-base text-stone-700 max-w-lg mx-auto font-semibold">
            {t.appTagline}
          </p>

          {/* Elderly Accessibility Indicator */}
          <div className="inline-flex items-center space-x-2 bg-amber-100/90 text-amber-950 border border-amber-300/90 px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Senior Friendly Design • Medium to Large Font Size Standard</span>
          </div>
        </header>

        {/* SECTION 1: PROMINENT LANGUAGE SELECTOR DROPDOWN */}
        <section 
          id="language-selection-card"
          className="bg-[#FAF7F0] rounded-2xl p-5 sm:p-6 shadow-xs border-2 border-[#E0D7C6] space-y-3.5"
          aria-labelledby="language-dropdown-label"
        >
          <div className="flex items-center justify-between">
            <label 
              id="language-dropdown-label"
              htmlFor="primary-language-dropdown"
              className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950 flex items-center space-x-2"
            >
              <Globe className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>{selectPrompt}</span>
            </label>
            <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              {getLanguageGreeting(selectedLang)}
            </span>
          </div>

          {/* Large, Beautiful Dropdown Menu */}
          <div className="relative">
            <select
              id="primary-language-dropdown"
              value={selectedLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="w-full bg-white hover:bg-stone-50 border-2 border-emerald-800 focus:border-emerald-900 rounded-xl py-3.5 px-4 text-base sm:text-lg font-black text-stone-900 cursor-pointer focus:outline-none transition-all pr-10 shadow-xs"
            >
              <optgroup label="🌿 North East Indian Languages">
                {SUPPORTED_LANGUAGES.filter(l => l.isNorthEast).map((lang) => (
                  <option key={lang.code} value={lang.code} className="font-bold py-1.5 text-stone-900">
                    {lang.nativeName} — {lang.name} ({lang.region})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌐 Hindi & English">
                {SUPPORTED_LANGUAGES.filter(l => !l.isNorthEast).map((lang) => (
                  <option key={lang.code} value={lang.code} className="font-bold py-1.5 text-stone-900">
                    {lang.nativeName} — {lang.name} ({lang.region})
                  </option>
                ))}
              </optgroup>
            </select>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-800 text-sm font-black">
              ▼
            </div>
          </div>

          {/* 1-Tap Quick Language Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLangChange(lang.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 border border-emerald-900'
                      : 'bg-[#F4EFE6] hover:bg-[#EAE2D3] text-stone-800 border border-[#D5CAB6]'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  {lang.isNorthEast && (
                    <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-black ml-0.5">
                      NE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: THE TWO ROLES (PATIENT & CAREGIVER) */}
        <section className="space-y-3" aria-label="Role Selection">
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              {rolePrompt}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* OPTION 1: PATIENT COMPANION */}
            <article
              id="role-card-patient"
              onClick={() => handleSelectRole('patient')}
              className="bg-[#FAF7F0] rounded-2xl p-5 sm:p-6 border-2 border-emerald-800/80 hover:border-emerald-800 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-emerald-900">
                    <Smile className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <Heart className="w-3.5 h-3.5 text-rose-600 mr-1.5 fill-rose-600" />
                    Senior / Elder
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                    {patientText.title}
                  </h3>
                  <p className="text-sm text-stone-700 mt-2 font-medium leading-relaxed">
                    {patientText.subtitle}
                  </p>
                </div>
              </div>

              <button
                id="btn-enter-as-patient"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('patient');
                }}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black text-base rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-emerald-900"
              >
                <span>{patientText.btn}</span>
                <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </article>

            {/* OPTION 2: CAREGIVER PORTAL */}
            <article
              id="role-card-caregiver"
              onClick={() => handleSelectRole('caregiver')}
              className="bg-[#FAF7F0] rounded-2xl p-5 sm:p-6 border-2 border-amber-600/80 hover:border-amber-700 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-stone-800">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                    <Users className="w-3.5 h-3.5 text-amber-800 mr-1.5" />
                    Family / Guardian
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                    {caregiverText.title}
                  </h3>
                  <p className="text-sm text-stone-700 mt-2 font-medium leading-relaxed">
                    {caregiverText.subtitle}
                  </p>
                </div>
              </div>

              <button
                id="btn-enter-as-caregiver"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('caregiver');
                }}
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-black active:bg-stone-950 text-amber-300 font-black text-base rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-stone-800"
              >
                <span>{caregiverText.btn}</span>
                <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </article>

          </div>
        </section>

      </div>

      {/* Clean, Non-intrusive Footer */}
      <footer className="max-w-3xl mx-auto w-full pt-8 pb-3 text-center space-y-2 border-t border-[#E0D7C6] mt-8">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-black text-stone-600">
          <span className="flex items-center text-emerald-900 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block mr-1.5" />
            100% Offline & Private
          </span>
          <span className="text-stone-400">•</span>
          {onOpenUsbModal && (
            <button
              type="button"
              onClick={() => {
                playGentleTap();
                onOpenUsbModal();
              }}
              className="inline-flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 underline cursor-pointer font-bold"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Download Smriti App (APK / USB)</span>
            </button>
          )}
        </div>
        <p className="text-xs text-stone-500 font-semibold">
          Smriti • North East Indian Edition (Assamese, Manipuri, Nepali, Bodo) + Hindi & English • Large Accessible Font
        </p>
      </footer>
    </main>
  );
};
