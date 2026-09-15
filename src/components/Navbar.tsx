import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Globe, 
  Mic, 
  LogOut, 
  Lock, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Usb, 
  Users, 
  PhoneCall,
  BellRing,
  Sparkles
} from 'lucide-react';
import { Language, UserRole, CaregiverAlert, PatientProfile } from '../types';
import { translations } from '../i18n/translations';
import { getDashboardI18n } from '../i18n/dashboardTranslations';
import { SUPPORTED_LANGUAGES } from '../i18n/languagesMeta';
import { playGentleTap, speakText } from '../utils/audio';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  voicePromptsEnabled: boolean;
  onToggleVoicePrompts: () => void;
  alerts: CaregiverAlert[];
  patients?: PatientProfile[];
  activePatientId?: string;
  onSelectPatient?: (patientId: string) => void;
  onOpenVoiceModal: () => void;
  onOpenTermsModal: () => void;
  onOpenAlerts: () => void;
  onRequestCaregiverSwitch?: () => void;
  onCaregiverLogout?: () => void;
  onOpenUsbDownload?: () => void;
  onOpenRoleAndLanguageSelector?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentLanguage,
  onLanguageChange,
  voicePromptsEnabled,
  onToggleVoicePrompts,
  alerts,
  patients = [],
  activePatientId,
  onSelectPatient,
  onOpenVoiceModal,
  onOpenTermsModal,
  onOpenAlerts,
  onRequestCaregiverSwitch,
  onCaregiverLogout,
  onOpenUsbDownload,
  onOpenRoleAndLanguageSelector,
}) => {
  const t = translations[currentLanguage] || translations.en;
  const dt = getDashboardI18n(currentLanguage);

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const hasCritical = activeAlerts.some(a => a.priority === 'critical');

  const handleLanguageSwitch = (lang: Language) => {
    playGentleTap();
    onLanguageChange(lang);
    if (voicePromptsEnabled) {
      const prompt = lang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।'
        : lang === 'as' ? 'ভাষা অসমীয়ালৈ সলনি কৰা হৈছে।'
        : lang === 'mni' ? 'লোন মৈতৈলোন্দা হোংদোক্লে।'
        : lang === 'ne' ? 'भाषा नेपालीमा परिवर्तन गरियो।'
        : lang === 'brx' ? 'रावखौ बर’सिम सोलायबाय।'
        : 'Language changed to English.';
      speakText(prompt, lang);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E7E0D3] shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Main Navbar Bar (Spacious & Elderly Legible) */}
        <div className="flex items-center justify-between h-13 sm:h-15 gap-1.5 sm:gap-3">
          
          {/* 1. App Brand with attractive North-Eastern Emblem */}
          <div className="flex items-center space-x-2 shrink-0">
            <AppLogo size="sm" className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-stone-900 leading-tight">
                {t.appName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-800 font-extrabold hidden sm:inline leading-none">
                {dt.sahayakSathiBadge} • North-East Edition
              </span>
            </div>
          </div>

          {/* 2. DESKTOP CENTERED ROLE SWITCHER (Visible on md+ screens) */}
          <div 
            id="top-role-switcher-container"
            className="hidden md:flex items-center bg-[#F4EFE6] p-1 rounded-xl border border-[#E0D7C6] shadow-inner shrink-0"
          >
            {/* Patient Option */}
            <button
              id="role-switch-patient"
              type="button"
              onClick={() => {
                if (currentRole !== 'patient') {
                  playGentleTap();
                  onRoleChange('patient');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentRole === 'patient'
                  ? 'bg-emerald-800 text-white shadow-xs border border-emerald-900 ring-2 ring-emerald-600/30'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#EAE2D2]'
              }`}
              title="Switch to Patient View"
            >
              <UserCheck className={`w-4 h-4 ${currentRole === 'patient' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">{dt.patientRoleBadge}</span>
            </button>

            {/* Caregiver Option (Requires PIN from Patient mode) */}
            <button
              id="role-switch-caregiver"
              type="button"
              onClick={() => {
                if (currentRole !== 'caregiver') {
                  playGentleTap();
                  if (onRequestCaregiverSwitch) {
                    onRequestCaregiverSwitch();
                  } else {
                    onRoleChange('caregiver');
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentRole === 'caregiver'
                  ? 'bg-amber-600 text-white shadow-xs border border-amber-700 ring-2 ring-amber-400/40'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#EAE2D2]'
              }`}
              title="Caregiver Portal (Protected with Security PIN)"
            >
              <Lock className={`w-3.5 h-3.5 ${currentRole === 'caregiver' ? 'text-amber-200' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">{dt.caregiverRoleBadge}</span>
              {currentRole !== 'caregiver' && (
                <span className="text-[9px] bg-amber-200 text-amber-950 px-1 py-0.2 rounded font-black">
                  PIN
                </span>
              )}
            </button>

            {/* Logout button for Caregiver */}
            {currentRole === 'caregiver' && onCaregiverLogout && (
              <button
                id="caregiver-logout-quick-btn"
                type="button"
                onClick={() => {
                  playGentleTap();
                  onCaregiverLogout();
                }}
                className="ml-1 p-1 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                title={dt.logoutBtn}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 3. Right Utility Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            
            {/* Active Patient Selector (Desktop only) */}
            {patients.length > 1 && onSelectPatient && (
              <div className="hidden lg:flex items-center bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1">
                <Users className="w-3.5 h-3.5 text-emerald-800 mr-1 shrink-0" />
                <select
                  id="nav-patient-select"
                  value={activePatientId}
                  onChange={(e) => {
                    playGentleTap();
                    onSelectPatient(e.target.value);
                  }}
                  className="bg-transparent text-xs font-black text-emerald-950 focus:outline-none cursor-pointer pr-1 py-0.5 max-w-[100px] truncate"
                  title="Switch active patient profile"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="text-stone-900 bg-white font-bold">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Voice Assistant Mic Trigger */}
            <button
              id="nav-voice-assistant-btn"
              type="button"
              onClick={() => {
                playGentleTap();
                onOpenVoiceModal();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-black text-xs transition-colors shadow-xs cursor-pointer shrink-0 border border-emerald-800"
              title={t.voiceAssistant}
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline text-xs font-black">{t.voiceButton.split(' ')[0]}</span>
            </button>

            {/* Caregiver Alerts Notification Bell */}
            <button
              id="nav-caregiver-alerts-btn"
              type="button"
              onClick={() => {
                playGentleTap();
                onOpenAlerts();
              }}
              className={`relative p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                hasCritical
                  ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse'
                  : activeAlerts.length > 0
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-[#F4EFE6] border-[#E0D7C6] text-stone-700 hover:bg-[#EAE2D2]'
              }`}
              title="Caregiver Alerts"
            >
              <ShieldAlert className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative inline-block text-left shrink-0">
              <div className="flex items-center bg-[#F4EFE6] px-2 py-1 rounded-xl border border-[#E0D7C6]">
                <Globe className="w-3.5 h-3.5 text-stone-600 mr-1 shrink-0" />
                <select
                  id="nav-language-select"
                  value={currentLanguage}
                  onChange={(e) => handleLanguageSwitch(e.target.value as Language)}
                  className="bg-transparent text-xs font-black text-stone-900 focus:outline-none cursor-pointer pr-1 py-0.5 max-w-[70px] sm:max-w-[105px] truncate"
                >
                  <optgroup label="🌟 North East Languages">
                    {SUPPORTED_LANGUAGES.filter(l => l.isNorthEast).map((l) => (
                      <option key={l.code} value={l.code} className="text-stone-900 bg-white">
                        {l.nativeName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 Hindi & English">
                    {SUPPORTED_LANGUAGES.filter(l => !l.isNorthEast).map((l) => (
                      <option key={l.code} value={l.code} className="text-stone-900 bg-white">
                        {l.nativeName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Language & Role Setup Re-trigger */}
            {onOpenRoleAndLanguageSelector && (
              <button
                id="nav-onboarding-setup-btn"
                type="button"
                onClick={() => {
                  playGentleTap();
                  onOpenRoleAndLanguageSelector();
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border border-amber-300 transition-colors cursor-pointer shrink-0"
                title="Choose Preferred Language & Role"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden xs:inline">Setup</span>
              </button>
            )}

            {/* Voice Prompts Audio Toggle */}
            <button
              id="nav-voice-prompts-toggle"
              type="button"
              onClick={() => {
                playGentleTap();
                onToggleVoicePrompts();
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                voicePromptsEnabled
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                  : 'bg-[#F4EFE6] border-[#E0D7C6] text-stone-500 hover:text-stone-700'
              }`}
              title={voicePromptsEnabled ? t.voicePromptsOn : t.voicePromptsOff}
            >
              {voicePromptsEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Direct Android APK Download Button */}
            <a
              id="nav-apk-download-btn"
              href="/api/download-apk"
              download="Smriti.apk"
              onClick={() => playGentleTap()}
              className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black rounded-xl text-xs transition-all shadow-xs border border-emerald-600/70 cursor-pointer shrink-0 group"
              title="Download Android APK (Smriti.apk)"
            >
              <div className="w-3.5 h-3.5 rounded overflow-hidden shrink-0 ring-1 ring-white/60 bg-stone-900">
                <img src="/logo.svg" alt="Smriti APK Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <span className="hidden xs:inline sm:inline">Smriti.apk</span>
              <span className="xs:hidden sm:hidden">APK</span>
            </a>

            {/* Download App via USB Button */}
            {onOpenUsbDownload && (
              <button
                id="nav-usb-download-btn"
                type="button"
                onClick={() => {
                  playGentleTap();
                  onOpenUsbDownload();
                }}
                className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-black rounded-xl text-xs transition-colors shadow-xs border border-amber-400 cursor-pointer shrink-0"
                title={dt.usbDownloadTitle}
              >
                <Usb className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                <span>USB</span>
              </button>
            )}

            {/* Terms Modal Link */}
            <button
              id="nav-terms-btn"
              type="button"
              onClick={() => {
                playGentleTap();
                onOpenTermsModal();
              }}
              className="p-1.5 text-stone-500 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer shrink-0"
              title={dt.termsBtn}
            >
              {dt.termsBtn}
            </button>

          </div>

        </div>

        {/* MOBILE DEDICATED FULL-WIDTH ROLE SWITCHER (Visible on < md screens) */}
        <div className="md:hidden pb-2 pt-0.5">
          <div 
            id="mobile-role-switcher-container"
            className="grid grid-cols-2 p-1 bg-[#F4EFE6] rounded-xl border border-[#E0D7C6] shadow-inner w-full"
          >
            {/* Patient Option */}
            <button
              id="mobile-role-switch-patient"
              type="button"
              onClick={() => {
                if (currentRole !== 'patient') {
                  playGentleTap();
                  onRoleChange('patient');
                }
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                currentRole === 'patient'
                  ? 'bg-emerald-800 text-white shadow-xs border border-emerald-900 ring-2 ring-emerald-600/30'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
              title="Switch to Patient View"
            >
              <UserCheck className={`w-4 h-4 ${currentRole === 'patient' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span className="truncate">{dt.patientRoleBadge}</span>
            </button>

            {/* Caregiver Option (Requires PIN from Patient mode) */}
            <div className="flex items-center">
              <button
                id="mobile-role-switch-caregiver"
                type="button"
                onClick={() => {
                  if (currentRole !== 'caregiver') {
                    playGentleTap();
                    if (onRequestCaregiverSwitch) {
                      onRequestCaregiverSwitch();
                    } else {
                      onRoleChange('caregiver');
                    }
                  }
                }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  currentRole === 'caregiver'
                    ? 'bg-amber-600 text-white shadow-xs border border-amber-700 ring-2 ring-amber-400/40'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Caregiver Portal (Protected with Security PIN)"
              >
                <Lock className={`w-3.5 h-3.5 ${currentRole === 'caregiver' ? 'text-amber-200' : 'text-stone-500'}`} />
                <span className="truncate">{dt.caregiverRoleBadge}</span>
                {currentRole !== 'caregiver' && (
                  <span className="text-[8px] bg-amber-200 text-amber-950 px-1 py-0.2 rounded font-black">
                    PIN
                  </span>
                )}
              </button>

              {currentRole === 'caregiver' && onCaregiverLogout && (
                <button
                  id="mobile-caregiver-logout-btn"
                  type="button"
                  onClick={() => {
                    playGentleTap();
                    onCaregiverLogout();
                  }}
                  className="ml-1 p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={dt.logoutBtn}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Authentic North-Eastern Traditional Gamosa / Handloom Weave Ribbon Border */}
      <div className="ne-weave-ribbon" />
    </header>
  );
};
