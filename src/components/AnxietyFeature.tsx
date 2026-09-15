import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Wind, 
  Music, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck, 
  Pause, 
  Play, 
  RefreshCw,
  ArrowLeft 
} from 'lucide-react';
import { Language, CaregiverAlert, AnxietyLog } from '../types';
import { translations } from '../i18n/translations';
import { 
  playAmbientSound, 
  stopAmbientSound, 
  playAlertChime, 
  playGentleTap, 
  speakText 
} from '../utils/audio';

interface AnxietyFeatureProps {
  language: Language;
  patientName: string;
  caregiverName: string;
  caregiverPhone: string;
  voicePromptsEnabled: boolean;
  onAddCaregiverAlert: (alert: Omit<CaregiverAlert, 'id' | 'timestamp'>) => void;
  onLogAnxietySession: (log: Omit<AnxietyLog, 'id' | 'timestamp'>) => void;
  onBackToHome: () => void;
}

export const AnxietyFeature: React.FC<AnxietyFeatureProps> = ({
  language,
  patientName,
  caregiverName,
  caregiverPhone,
  voicePromptsEnabled,
  onAddCaregiverAlert,
  onLogAnxietySession,
  onBackToHome,
}) => {
  const t = translations[language];

  // Breathing state: 4s inhale, 4s hold, 6s exhale
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState(0);

  // Sound state
  const [activeSound, setActiveSound] = useState<'flute' | 'rain' | 'bell' | 'om' | null>(null);

  // Anxiety Rating
  const [reportedLevel, setReportedLevel] = useState<'mild' | 'moderate' | 'severe' | null>(null);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [recoveryNoted, setRecoveryNoted] = useState(false);

  // Automatic gentle alert when entering anxiety module
  useEffect(() => {
    onAddCaregiverAlert({
      type: 'anxiety',
      priority: 'high',
      title: 'Patient Entered Anxiety Relief Screen',
      message: `${patientName} opened the anxiety calming suite and initiated soothing exercises.`,
      patientName,
      status: 'active',
    });

    if (voicePromptsEnabled) {
      speakText(t.promptAnxietyOpened, language);
    }

    return () => {
      stopAmbientSound();
    };
  }, []);

  // Breathing timer cycle
  useEffect(() => {
    if (!isBreathingActive) return;

    const timer = setInterval(() => {
      setBreathingSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        if (breathingPhase === 'inhale') {
          setBreathingPhase('hold');
          if (voicePromptsEnabled) speakText(t.holdBreath, language);
          return 4;
        } else if (breathingPhase === 'hold') {
          setBreathingPhase('exhale');
          if (voicePromptsEnabled) speakText(t.breatheOut, language);
          return 6;
        } else {
          setBreathingPhase('inhale');
          setBreathingCyclesCompleted((c) => c + 1);
          if (voicePromptsEnabled) speakText(t.breatheIn, language);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, breathingPhase, language, voicePromptsEnabled]);

  // Ambient sound handler
  const handleSoundToggle = (soundType: 'flute' | 'rain' | 'bell' | 'om') => {
    playGentleTap();
    if (activeSound === soundType) {
      stopAmbientSound();
      setActiveSound(null);
    } else {
      playAmbientSound(soundType);
      setActiveSound(soundType);
    }
  };

  // Severity rating trigger
  const handleRateAnxiety = (level: 'mild' | 'moderate' | 'severe') => {
    playGentleTap();
    setReportedLevel(level);
    setAlertDispatched(true);

    const isCritical = level === 'severe';
    if (isCritical) {
      playAlertChime(true);
    }

    onAddCaregiverAlert({
      type: 'anxiety',
      priority: isCritical ? 'critical' : level === 'moderate' ? 'high' : 'medium',
      title: `${level.toUpperCase()} Anxiety Level Reported`,
      message: `${patientName} assessed their anxiety as ${level.toUpperCase()}. Real-time monitoring alert active.`,
      patientName,
      status: 'active',
    });

    onLogAnxietySession({
      level,
      rating: level === 'severe' ? 9 : level === 'moderate' ? 6 : 3,
      techniqueUsed: `Breathing (${breathingCyclesCompleted} cycles) + ${activeSound || 'None'}`,
      caregiverAlerted: true,
      resolved: false,
    });

    if (voicePromptsEnabled) {
      speakText(
        isCritical 
          ? (language === 'hi' ? 'केयरगिवर को तुरंत आपातकालीन सूचना दे दी गई है। आप बिल्कुल सुरक्षित हैं।' : 'Your caregiver has been alerted urgently. Please relax, you are safe.')
          : t.logAnxietySuccess,
        language
      );
    }
  };

  // Patient recovery confirmation
  const handleFeelBetter = () => {
    playGentleTap();
    setRecoveryNoted(true);

    onAddCaregiverAlert({
      type: 'anxiety',
      priority: 'info',
      title: 'Patient Recovered & Feels Peaceful',
      message: `${patientName} marked that they are feeling better and calm after breathing exercises.`,
      patientName,
      status: 'resolved',
      resolvedAt: 'Just now',
    });

    if (voicePromptsEnabled) {
      const msg = language === 'hi' 
        ? 'यह सुनकर बहुत खुशी हुई कि आप शांत महसूस कर रहे हैं। ईश्वर आपका भला करे।'
        : 'It is wonderful to know you feel calm and at peace. Stay blessed.';
      speakText(msg, language);
    }

    setTimeout(() => {
      onBackToHome();
    }, 1800);
  };

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 space-y-2.5 sm:space-y-3 pb-8 animate-in fade-in duration-200">
      
      {/* Top Banner (Slim & Compact) */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={() => {
              playGentleTap();
              onBackToHome();
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight truncate flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{t.anxietyTitle}</span>
            </h1>
            <p className="text-[11px] text-teal-100/90 truncate">
              {t.anxietySubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${caregiverPhone}`}
            onClick={playGentleTap}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.callCaregiverNow}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>

      {/* 2-COLUMN LANDSCAPE-OPTIMIZED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3">
        
        {/* LEFT COLUMN: GUIDED BREATHING ORB (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-3 sm:p-4 border border-stone-200 shadow-xs flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between border-b border-stone-100 pb-1.5 mb-1">
            <span className="text-xs font-black tracking-tight text-teal-800 flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>Pranayama & 4-7-8</span>
            </span>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
              {breathingCyclesCompleted} cycles
            </span>
          </div>

          {/* Compact Animated Breathing Orb */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center my-1.5">
            {/* Ambient pulse ring */}
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                breathingPhase === 'inhale'
                  ? 'bg-teal-100/70 scale-105 animate-pulse'
                  : breathingPhase === 'hold'
                  ? 'bg-amber-100/60 scale-105'
                  : 'bg-emerald-100/50 scale-95'
              }`} 
            />

            {/* Main breathing orb */}
            <div 
              className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all duration-700 ${
                breathingPhase === 'inhale'
                  ? 'bg-gradient-to-tr from-teal-600 to-teal-500 scale-105 shadow-teal-600/30'
                  : breathingPhase === 'hold'
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-500 scale-105 shadow-amber-600/30'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-600 scale-95 shadow-emerald-600/20'
              }`}
            >
              <Heart className="w-5 h-5 mb-1 opacity-90" />
              <span className="text-sm sm:text-base font-black px-2 leading-tight">
                {breathingPhase === 'inhale' && t.breatheIn}
                {breathingPhase === 'hold' && t.holdBreath}
                {breathingPhase === 'exhale' && t.breatheOut}
              </span>
              <span className="text-xl font-extrabold mt-0.5 font-mono">
                {breathingSecondsLeft}s
              </span>
            </div>
          </div>

          {/* Breathing Controls & Relief Confirm */}
          <div className="w-full space-y-2 pt-1">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  playGentleTap();
                  setIsBreathingActive(!isBreathingActive);
                }}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>{t.pauseBreathing}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.startBreathing}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  playGentleTap();
                  setBreathingPhase('inhale');
                  setBreathingSecondsLeft(4);
                  setBreathingCyclesCompleted(0);
                }}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                title="Reset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleFeelBetter}
              disabled={recoveryNoted}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{recoveryNoted ? 'Relaxed & Calm Noted' : t.iFeelBetterNow}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SEVERITY RATING, SOUNDS & GROUNDING (7 COLS) */}
        <div className="lg:col-span-7 space-y-2.5">
          
          {/* Real-time Anxiety Severity Rating */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-stone-900">
                  {t.rateAnxietyTitle}
                </h3>
                <p className="text-[10px] text-stone-500">
                  {t.emergencyCaregiverNote}
                </p>
              </div>
              {alertDispatched && (
                <span className="flex items-center space-x-1 text-[10px] font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-teal-700" />
                  <span>Logged</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRateAnxiety('mild')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  reportedLevel === 'mild'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                    : 'bg-white border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800">
                    Mild
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                    1-3
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">Slight restlessness</p>
              </button>

              <button
                onClick={() => handleRateAnxiety('moderate')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  reportedLevel === 'moderate'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-white border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800">
                    Moderate
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                    4-6
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">Racing thoughts</p>
              </button>

              <button
                onClick={() => handleRateAnxiety('severe')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  reportedLevel === 'severe'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 animate-pulse'
                    : 'bg-white border-stone-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-800">
                    Severe
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                    7-10
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">Emergency alert</p>
              </button>
            </div>
          </div>

          {/* Ambient Soundscapes Suite */}
          <div className="bg-white rounded-xl p-3 border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Music className="w-3.5 h-3.5 text-teal-600" />
                <h3 className="text-xs font-black text-stone-900">
                  {t.calmAmbientTitle}
                </h3>
              </div>
              {activeSound && (
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-full animate-pulse">
                  {t.soundPlaying}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'flute', label: t.soundFlute, icon: '🪈' },
                { id: 'rain', label: t.soundRain, icon: '🌧️' },
                { id: 'bell', label: t.soundBell, icon: '🔔' },
                { id: 'om', label: t.soundOm, icon: '🕉️' },
              ].map((sound) => {
                const isPlaying = activeSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundToggle(sound.id as any)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{sound.icon}</div>
                    <div className="text-[10px] font-bold truncate">
                      {sound.label}
                    </div>
                    <div className={`text-[8px] font-medium ${isPlaying ? 'text-teal-100' : 'text-stone-400'}`}>
                      {isPlaying ? 'Playing' : 'Play'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-4-3-2-1 Sensory Grounding Section */}
          <div className="bg-white rounded-xl p-3 border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-stone-900">
                {t.groundingTitle}
              </h3>
              <span className="text-[10px] text-stone-400">Sensory Focus</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-stone-800 text-[10px] text-center">
                <span className="font-black block text-amber-900">5 See</span>
                <span className="text-[8px] text-stone-500 line-clamp-1">Look around</span>
              </div>
              <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-200 text-stone-800 text-[10px] text-center">
                <span className="font-black block text-teal-900">4 Feel</span>
                <span className="text-[8px] text-stone-500 line-clamp-1">Touch chair</span>
              </div>
              <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-200 text-stone-800 text-[10px] text-center">
                <span className="font-black block text-sky-900">3 Hear</span>
                <span className="text-[8px] text-stone-500 line-clamp-1">Listen close</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200 text-stone-800 text-[10px] text-center">
                <span className="font-black block text-rose-900">2 Smell</span>
                <span className="text-[8px] text-stone-500 line-clamp-1">Breathe air</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-stone-800 text-[10px] text-center">
                <span className="font-black block text-emerald-900">1 Taste</span>
                <span className="text-[8px] text-stone-500 line-clamp-1">Sip water</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
