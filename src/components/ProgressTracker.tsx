import React from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Heart, 
  Award, 
  Calendar, 
  Droplet, 
  Pill, 
  ShieldCheck, 
  Sparkles, 
  Smile, 
  ArrowLeft, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { Language, PatientProfile, DailyProgressSummary, CognitiveGameScore } from '../types';
import { translations } from '../i18n/translations';
import { playGentleTap } from '../utils/audio';

interface ProgressTrackerProps {
  language: Language;
  patient: PatientProfile;
  waterGlasses: number;
  medsTakenCount: number;
  totalMeds: number;
  anxietyEpisodesToday: number;
  onBack: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  language,
  patient,
  waterGlasses,
  medsTakenCount,
  totalMeds,
  anxietyEpisodesToday,
  onBack,
}) => {
  const t = translations[language];

  // Default sample game scores if patient has newly joined
  const gameScores: CognitiveGameScore[] = patient.gameScores && patient.gameScores.length > 0
    ? patient.gameScores
    : [
        {
          id: 'score-1',
          gameId: 'memory-flip',
          gameTitle: 'Memory Card Match',
          score: 100,
          maxScore: 100,
          accuracyPercent: 100,
          date: 'Today',
        },
        {
          id: 'score-2',
          gameId: 'emoji-identify',
          gameTitle: 'Emotion & Emoji Guess',
          score: 50,
          maxScore: 50,
          accuracyPercent: 100,
          date: 'Today',
        },
        {
          id: 'score-3',
          gameId: 'odd-one-out',
          gameTitle: 'Spot the Different Item',
          score: 50,
          maxScore: 50,
          accuracyPercent: 100,
          date: 'Yesterday',
        },
      ];

  const avgAccuracy = Math.round(
    gameScores.reduce((acc, curr) => acc + curr.accuracyPercent, 0) / (gameScores.length || 1)
  );

  const medsPercentage = totalMeds > 0 ? Math.round((medsTakenCount / totalMeds) * 100) : 100;
  const waterTarget = 6;
  const waterPercentage = Math.min(100, Math.round((waterGlasses / waterTarget) * 100));

  // Overall wellness score out of 100
  const cognitiveWellnessIndex = Math.min(
    100,
    Math.round(avgAccuracy * 0.4 + medsPercentage * 0.35 + waterPercentage * 0.25)
  );

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 space-y-2.5 sm:space-y-3 pb-8 animate-in fade-in duration-200">
      
      {/* Top Banner (Slim) */}
      <div className="bg-gradient-to-r from-stone-900 via-teal-950 to-emerald-950 text-white rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={() => {
              playGentleTap();
              onBack();
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight truncate flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Progress & Wellness Report</span>
            </h1>
            <p className="text-[11px] text-stone-300 truncate">
              {patient.name} (Age {patient.age}) • Brain agility, medication & calm retention
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playGentleTap();
            window.print();
          }}
          className="flex items-center space-x-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Print Report</span>
        </button>
      </div>

      {/* TOP ROW: WELLNESS SCORE + 3 CORE PILLARS (4 COMPACT CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        
        {/* Card 1: Wellness Score */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
              Wellness Index
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="my-1 text-center">
            <div className="text-3xl font-black text-teal-700">
              {cognitiveWellnessIndex}<span className="text-base text-stone-400">/100</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 block truncate">
              High Retention
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-teal-600 h-full rounded-full" 
              style={{ width: `${cognitiveWellnessIndex}%` }} 
            />
          </div>
        </div>

        {/* Card 2: Mind Games Accuracy */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
              Brain Recall
            </span>
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="my-1 text-center">
            <div className="text-3xl font-black text-stone-900">
              {avgAccuracy}%
            </div>
            <span className="text-[10px] font-bold text-stone-500 block truncate">
              3 Games Played
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full" 
              style={{ width: `${avgAccuracy}%` }} 
            />
          </div>
        </div>

        {/* Card 3: Medication Adherence */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Medication
            </span>
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="my-1 text-center">
            <div className="text-3xl font-black text-stone-900">
              {medsTakenCount}/{totalMeds}
            </div>
            <span className="text-[10px] font-bold text-emerald-700 block truncate">
              {medsPercentage}% Doses Taken
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full" 
              style={{ width: `${medsPercentage}%` }} 
            />
          </div>
        </div>

        {/* Card 4: Daily Hydration */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">
              Hydration
            </span>
            <Droplet className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="my-1 text-center">
            <div className="text-3xl font-black text-stone-900">
              {waterGlasses}/{waterTarget}
            </div>
            <span className="text-[10px] font-bold text-sky-700 block truncate">
              {waterPercentage}% Reached
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-sky-600 h-full rounded-full" 
              style={{ width: `${waterPercentage}%` }} 
            />
          </div>
        </div>

      </div>

      {/* 2-COLUMN BOTTOM SECTION: RECENT SESSIONS + DOCTOR NOTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3">
        
        {/* LEFT COLUMN: RECENT COGNITIVE SESSIONS (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-3 border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-black text-stone-900">
                Cognitive Game Sessions & Mental Agility
              </h3>
            </div>
            <span className="text-[10px] text-stone-400">Recent logs</span>
          </div>

          <div className="divide-y divide-stone-100">
            {gameScores.map((score) => {
              const getGameIcon = (id: string) => {
                if (id === 'authentic-india-tours') return '🧭';
                if (id === 'pattern-recognition') return '🧵';
                if (id === 'object-recognition') return '🪕';
                if (id === 'attention-challenge') return '🦏';
                if (id.includes('memory')) return '👒';
                if (id.includes('emoji') || id.includes('emotion')) return '😊';
                return '🎯';
              };

              return (
                <div key={score.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {getGameIcon(score.gameId)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{score.gameTitle}</h4>
                        {score.level && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-850 border border-amber-300 shrink-0">
                            Lvl {score.level}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center space-x-1.5">
                        <span>{score.date}</span>
                        {score.effortPoints !== undefined && score.effortPoints > 0 && (
                          <span className="text-emerald-700 font-semibold">
                            • +{score.effortPoints} effort rewarded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                      {score.accuracyPercent}% Accuracy
                    </span>
                    <span className="text-xs font-black text-stone-800">
                      {score.score}/{score.maxScore} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DOCTOR & CLINICAL CONTACT (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center space-x-1.5 border-b border-stone-100 pb-1.5 mb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-black text-stone-900">
                Clinical & Family Reference
              </h3>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              This summary is ready for doctor consultations with <strong>{patient.emergencyContactName}</strong>.
            </p>
            <div className="mt-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200 text-[10px] text-stone-700 space-y-1">
              <div><strong>Emergency Contact:</strong> {patient.emergencyContact}</div>
              <div><strong>Caregiver:</strong> {patient.emergencyContactName}</div>
              <div><strong>Anxiety Events Today:</strong> {anxietyEpisodesToday}</div>
            </div>
          </div>

          <button
            onClick={() => {
              playGentleTap();
              window.print();
            }}
            className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer text-center"
          >
            Export as PDF / Print
          </button>
        </div>

      </div>

    </div>
  );
};
