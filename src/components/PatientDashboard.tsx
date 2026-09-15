import React from 'react';
import { 
  Heart, 
  PhoneCall, 
  Wind, 
  Images, 
  Gamepad2, 
  CheckSquare, 
  Volume2, 
  Mic, 
  AlertTriangle 
} from 'lucide-react';
import { Language, MemoryPhoto, Medication, PatientProfile, RecentAction } from '../types';
import { translations } from '../i18n/translations';
import { getDashboardI18n } from '../i18n/dashboardTranslations';
import { playGentleTap, playAlertChime, speakText } from '../utils/audio';
import { RecentMemoryRecall } from './RecentMemoryRecall';

interface PatientDashboardProps {
  language: Language;
  profile?: PatientProfile;
  patientName?: string;
  caregiverName?: string;
  caregiverPhone?: string;
  patients?: PatientProfile[];
  activePatientId?: string;
  onSelectPatient?: (patientId: string) => void;
  photos?: MemoryPhoto[];
  medications?: Medication[];
  waterGlasses?: number;
  currentMood?: string;
  comfortNote?: string | null;
  voicePromptsEnabled?: boolean;
  recentActions?: RecentAction[];
  onAddRecentAction?: (action: Omit<RecentAction, 'id' | 'timestamp'>) => void;
  onAddAction?: (action: Omit<RecentAction, 'id' | 'timestamp'>) => void;
  onTriggerSOS: () => void;
  onOpenAnxietyRelief?: () => void;
  onOpenAnxiety?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenVoiceModal?: () => void;
  onOpenGames: () => void;
  onOpenPhotos: () => void;
  onOpenTasks: () => void;
  onToggleMedication: (id: string) => void;
  onAddWaterGlass: () => void;
  onSetMood?: (mood: string) => void;
  onSelectMood?: (mood: string) => void;
  onCaregiverSwitchRequest?: () => void;
  onRequestCaregiverSwitch?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  language,
  profile,
  patientName,
  caregiverName,
  caregiverPhone,
  patients = [],
  activePatientId,
  onSelectPatient,
  photos = [],
  medications = [],
  waterGlasses = 4,
  currentMood = 'calm',
  comfortNote = null,
  voicePromptsEnabled = true,
  recentActions = [],
  onAddRecentAction,
  onAddAction,
  onTriggerSOS,
  onOpenAnxietyRelief,
  onOpenAnxiety,
  onOpenVoiceAssistant,
  onOpenVoiceModal,
  onOpenGames,
  onOpenPhotos,
  onOpenTasks,
  onToggleMedication,
  onAddWaterGlass,
  onSetMood,
  onSelectMood,
  onCaregiverSwitchRequest,
  onRequestCaregiverSwitch,
}) => {
  const t = translations[language] || translations.en;
  const dt = getDashboardI18n(language);

  // Resiliently resolve patient details with safe fallbacks
  const pName = profile?.name || patientName || 'Rameshwar Ji';
  const cName = profile?.caregiverName || caregiverName || 'Pooja (Daughter)';
  const cPhone = profile?.emergencyContact || profile?.caregiverPhone || caregiverPhone || '+91 98765 43210';
  const pCondition = profile?.condition || 'Mild Cognitive Care & Senior Wellness';

  const handleOpenAnxiety = onOpenAnxietyRelief || onOpenAnxiety || (() => {});
  const handleOpenVoice = onOpenVoiceAssistant || onOpenVoiceModal || (() => {});
  const handleAddRecent = onAddRecentAction || onAddAction;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 space-y-3 pb-20 animate-in fade-in duration-200">
      
      {/* Top Warm Systematic North-Eastern Greeting Card */}
      <div 
        id="patient-top-greeting-card"
        className="relative overflow-hidden bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#065F46] text-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-amber-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
      >
        {/* Subtle decorative Gamosa weave top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 opacity-90" />

        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-xs sm:text-sm font-black text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-400/40">
              🌿 {dt.sahayakSathiBadge} • North-East Elder Care
            </span>
            <span className="text-xs text-emerald-100 font-semibold">• {pCondition}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {t.welcomeBack}, {pName}
          </h1>
          <p className="text-xs sm:text-base text-emerald-100 font-medium">
            {cName} ({dt.caregiverLabel}) is connected • All safety systems active
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
          <a
            id="btn-patient-call-caregiver-header"
            href={`tel:${cPhone}`}
            onClick={playGentleTap}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 rounded-xl text-sm sm:text-base font-black shadow-md border-2 border-amber-500 transition-transform active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 text-stone-950 shrink-0" />
            <span>{dt.callCaregiverBtn} ({cName.split(' ')[0]})</span>
          </a>
        </div>
      </div>

      {/* Warm Reassuring Caregiver Note Banner (if sent by caregiver) */}
      {comfortNote && (
        <div className="bg-[#FEF9EE] border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 flex items-start space-x-3 shadow-xs animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500">
            <Heart className="w-5 h-5 fill-amber-800 text-amber-800" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-amber-950">
                Message from {cName}:
              </span>
              <button
                onClick={() => {
                  playGentleTap();
                  speakText(comfortNote, language);
                }}
                className="text-xs sm:text-sm font-black text-amber-950 flex items-center space-x-1.5 px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-400 cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-sm sm:text-base text-amber-950 mt-1 italic font-semibold">
              "{comfortNote}"
            </p>
          </div>
        </div>
      )}

      {/* 6 PRIMARY ACTION TILES (LARGE, HIGH VISIBILITY, ACCESSIBLE FOR ELDERLY USERS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* 1. DAILY TASKS & ROUTINE (ASSAM TEA LEAF EMERALD) */}
        <button
          id="btn-daily-tasks"
          type="button"
          onClick={() => {
            playGentleTap();
            onOpenTasks();
          }}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#047857] hover:bg-[#065F46] active:bg-[#064E3B] text-white shadow-sm transition-all transform active:scale-98 cursor-pointer border-2 border-emerald-600/80 group min-h-[115px] sm:min-h-[135px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-800/80 border border-emerald-400/40 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <CheckSquare className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-center">
            {t.dailyRoutineTitle || 'Daily Tasks & Meds'}
          </span>
          <span className="text-xs text-emerald-200 mt-1 font-semibold text-center">
            View Schedule & Routine ❯
          </span>
        </button>

        {/* 2. FAMILY PHOTOS ALBUM (LOKTAK INDIGO) */}
        <button
          id="btn-family-photos"
          type="button"
          onClick={() => {
            playGentleTap();
            onOpenPhotos();
          }}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#312E81] hover:bg-[#3730A3] active:bg-[#1E1B4B] text-white shadow-sm transition-all transform active:scale-98 cursor-pointer border-2 border-indigo-500/80 group min-h-[115px] sm:min-h-[135px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-900/80 border border-indigo-400/40 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <Images className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-center">
            {t.todayMemoryTitle || 'Family Photos'}
          </span>
          <span className="text-xs text-indigo-200 mt-1 font-semibold text-center">
            Audio Stories & Memories ❯
          </span>
        </button>

        {/* 3. EMERGENCY SOS (TRADITIONAL GAMOSA VERMILION) */}
        <button
          id="btn-emergency-sos"
          type="button"
          onClick={() => {
            playAlertChime();
            onTriggerSOS();
          }}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#B91C1C] hover:bg-[#991B1B] active:bg-[#7F1D1D] text-white shadow-md transition-all transform active:scale-98 cursor-pointer border-2 border-red-500 ring-2 ring-red-400/40 group min-h-[115px] sm:min-h-[135px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-800/90 border border-red-300/50 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 animate-bounce" />
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-center">
            {dt.emergencyBadge}
          </span>
          <span className="text-xs text-rose-200 mt-1 font-semibold text-center">
            {t.sosSubtitle}
          </span>
        </button>

        {/* 4. CALM & RELIEF (DZUKOU VALLEY TEAL) */}
        <button
          id="btn-anxiety-relief"
          type="button"
          onClick={() => {
            playGentleTap();
            handleOpenAnxiety();
          }}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] active:bg-[#134E4A] text-white shadow-sm transition-all transform active:scale-98 cursor-pointer border-2 border-teal-500/80 group min-h-[115px] sm:min-h-[135px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-900/80 border border-teal-400/40 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <Wind className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300" />
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-center">
            {dt.calmBadge}
          </span>
          <span className="text-xs text-teal-200 mt-1 font-semibold text-center">
            {t.anxietyButtonSubtitle}
          </span>
        </button>

        {/* 5. VOICE COMPANION (BRAHMAPUTRA SKY) */}
        <button
          id="btn-voice-companion"
          type="button"
          onClick={() => {
            playGentleTap();
            handleOpenVoice();
          }}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#075985] text-white shadow-sm transition-all transform active:scale-98 cursor-pointer border-2 border-sky-500/80 group min-h-[115px] sm:min-h-[135px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-900/80 border border-sky-400/40 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-center">
            {dt.voiceAIBadge}
          </span>
          <span className="text-xs text-sky-200 mt-1 font-semibold text-center">
            {dt.voiceAISubtitle}
          </span>
        </button>

        {/* 6. BRAIN GAMES (GOLDEN MUGA SILK AMBER) */}
        <button
          id="btn-brain-games"
          type="button"
          onClick={() => {
            playGentleTap();
            onOpenGames();
          }}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#B45309] hover:bg-[#92400E] active:bg-[#78350F] text-white shadow-sm transition-all transform active:scale-98 cursor-pointer border-2 border-amber-500/80 group min-h-[115px] sm:min-h-[135px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-900/80 border border-amber-300/40 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-200" />
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider text-center">
            {dt.gamesBadge}
          </span>
          <span className="text-xs text-amber-200 mt-1 font-semibold text-center">
            {dt.gamesSubtitle}
          </span>
        </button>

      </div>

      {/* RECENT MEMORY RECALL (WHAT DID I DO JUST NOW? - COMPACT SYSTEMATIC VIEW) */}
      <RecentMemoryRecall
        language={language}
        patientName={pName}
        caregiverName={cName}
        recentActions={recentActions}
        onAddAction={handleAddRecent}
        isCompactView={true}
      />

    </div>
  );
};
