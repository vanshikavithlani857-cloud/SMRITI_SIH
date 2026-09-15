import React, { useState } from 'react';
import { 
  CheckSquare, 
  Pill, 
  Droplet, 
  Sun, 
  Coffee, 
  Sunset, 
  Moon, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Volume2, 
  Plus 
} from 'lucide-react';
import { Language, Medication } from '../types';
import { translations } from '../i18n/translations';
import { playGentleTap, playSuccessChime, speakText } from '../utils/audio';

interface TasksViewProps {
  language: Language;
  patientName: string;
  medications: Medication[];
  waterGlasses: number;
  voicePromptsEnabled: boolean;
  onToggleMedication: (medId: string) => void;
  onAddWaterGlass: () => void;
  onBackToHome: () => void;
}

interface RoutineItem {
  id: string;
  title: string;
  subtitle: string;
  timeSlot: string;
  completed: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({
  language,
  patientName,
  medications,
  waterGlasses,
  voicePromptsEnabled,
  onToggleMedication,
  onAddWaterGlass,
  onBackToHome,
}) => {
  const t = translations[language];

  // Daily elder wellness routine
  const [routines, setRoutines] = useState<RoutineItem[]>([
    {
      id: 'r-1',
      title: 'Morning Prayer & Bhakti / ধ্যান',
      subtitle: 'Peaceful chant or meditation to start the day calm',
      timeSlot: 'Morning • 7:30 AM',
      completed: true,
    },
    {
      id: 'r-2',
      title: '15-Min Garden Walk / খোজ কাঢ়া',
      subtitle: 'Gentle walk in sunlight and fresh morning air',
      timeSlot: 'Morning • 8:30 AM',
      completed: false,
    },
    {
      id: 'r-3',
      title: 'Afternoon Rest & Hydration / জিৰণি',
      subtitle: 'Rest quietly in room, drink lukewarm water',
      timeSlot: 'Afternoon • 2:00 PM',
      completed: false,
    },
    {
      id: 'r-4',
      title: 'Evening Family Talk / কথা-বতৰা',
      subtitle: 'Call children or listen to family memories',
      timeSlot: 'Evening • 6:30 PM',
      completed: false,
    },
  ]);

  const toggleRoutine = (id: string) => {
    playGentleTap();
    playSuccessChime();
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.completed;
          if (voicePromptsEnabled && next) {
            speakText(`Well done! Completed: ${r.title.split('/')[0]}`, language);
          }
          return { ...r, completed: next };
        }
        return r;
      })
    );
  };

  const handleMedToggle = (med: Medication) => {
    playGentleTap();
    playSuccessChime();
    onToggleMedication(med.id);
    if (voicePromptsEnabled && !med.takenToday) {
      speakText(`${med.name} medicine taken. Very good!`, language);
    }
  };

  const handleDrinkWater = () => {
    playGentleTap();
    playSuccessChime();
    onAddWaterGlass();
    if (voicePromptsEnabled) {
      speakText(`Water glass recorded. Stay well hydrated!`, language);
    }
  };

  const medsTakenCount = medications.filter((m) => m.takenToday).length;
  const routineDoneCount = routines.filter((r) => r.completed).length;

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-3 space-y-3 pb-12 animate-in fade-in duration-200">
      
      {/* Header bar with Back button */}
      <div className="flex items-center justify-between bg-[#FAF7F0] rounded-2xl px-4 py-3 border-2 border-[#E0D7C6] shadow-xs">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              playGentleTap();
              onBackToHome();
            }}
            className="p-2 bg-[#F4EFE6] hover:bg-[#EAE2D3] rounded-xl text-stone-800 transition-colors cursor-pointer border border-[#D5CAB6]"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-900" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-stone-900 flex items-center space-x-2 truncate">
              <CheckSquare className="w-5 h-5 text-emerald-800" />
              <span>Today's Tasks & Daily Routine</span>
            </h1>
            <p className="text-xs text-stone-600 truncate font-semibold">
              🌿 Gentle reminders for {patientName} • Saved locally
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-black text-emerald-900 block">
            {medsTakenCount + routineDoneCount}/{medications.length + routines.length} Done
          </span>
          <span className="text-[10px] sm:text-xs text-stone-500 font-bold">Keep going!</span>
        </div>
      </div>

      {/* 2-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        
        {/* COLUMN 1 (LEFT 7 COLS): MEDICINES SCHEDULE */}
        <div className="lg:col-span-7 bg-[#FAF7F0] rounded-2xl p-4 border-2 border-[#E0D7C6] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E0D7C6] pb-2.5">
            <div className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-emerald-800" />
              <h2 className="text-sm sm:text-base font-black text-stone-900">
                {t.medicines} ({medsTakenCount}/{medications.length})
              </h2>
            </div>
            <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
              Prescribed Routine
            </span>
          </div>

          <div className="space-y-2">
            {medications.map((med) => (
              <div
                key={med.id}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2.5 ${
                  med.takenToday
                    ? 'bg-emerald-50/80 border-emerald-300 text-stone-600'
                    : 'bg-[#F4EFE6] border-[#E0D7C6] text-stone-900 hover:border-emerald-700'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    med.timeSlot === 'morning' ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : med.timeSlot === 'afternoon' ? 'bg-orange-100 text-orange-900 border-orange-300'
                    : med.timeSlot === 'evening' ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    : 'bg-stone-800 text-amber-300 border-stone-700'
                  }`}>
                    {med.timeSlot === 'morning' && <Sun className="w-5 h-5" />}
                    {med.timeSlot === 'afternoon' && <Coffee className="w-5 h-5" />}
                    {med.timeSlot === 'evening' && <Sunset className="w-5 h-5" />}
                    {med.timeSlot === 'night' && <Moon className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm sm:text-base font-black truncate ${med.takenToday ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                        {med.name}
                      </h3>
                      <span className="text-[10px] font-black bg-white px-1.5 py-0.2 rounded border border-stone-200 text-stone-700 shrink-0">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 truncate mt-0.5 font-medium">{med.timing} • {med.instructions}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleMedToggle(med)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 border ${
                    med.takenToday
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-white border-stone-300 text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {med.takenToday ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3] text-amber-300" />
                      <span>Taken</span>
                    </>
                  ) : (
                    <span>Take Med</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2 (RIGHT 5 COLS): HYDRATION & ROUTINES */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* HYDRATION TRACKER */}
          <div className="bg-[#FAF7F0] rounded-2xl p-4 border-2 border-[#E0D7C6] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplet className="w-5 h-5 text-cyan-700" />
                <h2 className="text-xs sm:text-sm font-black text-stone-900">
                  Water Hydration ({waterGlasses}/8)
                </h2>
              </div>
              <button
                onClick={handleDrinkWater}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer border border-cyan-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Drink Glass</span>
              </button>
            </div>

            {/* 8 Glass Visual Indicator */}
            <div className="grid grid-cols-8 gap-1.5 pt-0.5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    idx < waterGlasses
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                      : 'bg-[#F4EFE6] text-stone-400 border-[#D5CAB6]'
                  }`}
                >
                  <Droplet className="w-4 h-4 mx-auto fill-current" />
                  <span className="text-[9px] font-black block mt-0.5">#{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GENTLE DAILY ROUTINE CHECKLIST */}
          <div className="bg-[#FAF7F0] rounded-2xl p-4 border-2 border-[#E0D7C6] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#E0D7C6] pb-2">
              <h2 className="text-xs sm:text-sm font-black text-stone-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Daily Routine ({routineDoneCount}/{routines.length})</span>
              </h2>
              <span className="text-xs text-stone-500 font-bold">4 Milestones</span>
            </div>

            <div className="space-y-2">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  onClick={() => toggleRoutine(routine.id)}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                    routine.completed
                      ? 'bg-emerald-50/90 border-emerald-300 text-stone-600'
                      : 'bg-[#F4EFE6] border-[#E0D7C6] text-stone-800 hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                      routine.completed
                        ? 'bg-emerald-800 border-emerald-900 text-amber-300'
                        : 'bg-white border-stone-300 text-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-black truncate ${routine.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                        {routine.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-stone-600 truncate">{routine.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-stone-500 shrink-0">
                    {routine.timeSlot.split('•')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
