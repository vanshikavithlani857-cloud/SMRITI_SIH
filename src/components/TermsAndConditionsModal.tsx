import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Heart, 
  Lock, 
  X, 
  Check,
  Sparkles 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { playGentleTap } from '../utils/audio';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAccept?: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
  language,
  onAccept,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="terms-conditions-modal-card"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1C1917] via-[#064E3B] to-[#047857] text-white flex items-center justify-between border-b-2 border-amber-400/50 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 opacity-90" />
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{t.termsConditions}</h2>
              <p className="text-xs text-amber-200 font-medium">{t.termsLastUpdated}</p>
            </div>
          </div>
          <button
            onClick={() => {
              playGentleTap();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-stone-800 flex-1 leading-relaxed bg-[#FAF7F0]">
          
          <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#E0D7C6] text-xs sm:text-sm text-stone-700">
            {t.termsIntro}
          </div>

          {/* Section 0: Senior Accessibility & Medium to Large Font Size Standard */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-950 font-black text-sm sm:text-base">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-700" />
              <h3>Senior Accessibility Standard: Medium to Large Font Size</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 pl-7 font-medium leading-relaxed">
              To guarantee optimal legibility and prevent visual fatigue for elderly users, this application enforces <strong>Medium to Large font sizing (16px to 22px baseline text, 24px+ for titles)</strong>, high contrast ratios (4.5:1+), generous touch padding, and culturally familiar North-Eastern aesthetic motifs across all screens, medication reminders, memory recall feeds, and caregiver alerts.
            </p>
          </div>

          {/* Section 1: Non-Emergency Medical Disclaimer */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h3>{t.termsMedicalTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 pl-6">
              {t.termsMedicalBody}
            </p>
          </div>

          {/* Section 2: Caregiver Responsibility */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm sm:text-base">
              <Heart className="w-4 h-4 shrink-0 text-emerald-700" />
              <h3>{t.termsCaregiverTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 pl-6">
              {t.termsCaregiverBody}
            </p>
          </div>

          {/* Section 3: Voice Assistance & Privacy */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm sm:text-base">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-700" />
              <h3>{t.termsVoiceTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 pl-6">
              {t.termsVoiceBody}
            </p>
          </div>

          {/* Section 4: Data Security & Photos */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm sm:text-base">
              <Lock className="w-4 h-4 shrink-0 text-amber-700" />
              <h3>{t.termsDataTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 pl-6">
              {t.termsDataBody}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-[#F4EFE6] border-t border-[#E0D7C6] flex items-center justify-between gap-4">
          <button
            onClick={() => {
              playGentleTap();
              onClose();
            }}
            className="px-5 py-2.5 text-xs sm:text-sm font-black text-stone-700 hover:text-stone-950 transition-colors"
          >
            {t.termsClose}
          </button>
          <button
            onClick={() => {
              playGentleTap();
              if (onAccept) onAccept();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-colors border border-emerald-800"
          >
            <Check className="w-4 h-4 text-amber-300" />
            <span>{t.termsAgree}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
