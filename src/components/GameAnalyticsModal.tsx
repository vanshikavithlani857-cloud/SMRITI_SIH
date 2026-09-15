import React from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  BrainCircuit, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Sparkles, 
  Volume2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  HeartHandshake,
  Layers,
  Compass,
  Eye,
  Camera
} from 'lucide-react';
import { Language, TrackedGameAnswer, GameDifficultyLevel } from '../types';
import { speakText, playGentleTap } from '../utils/audio';

interface GameAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  patientName: string;
  trackedAnswers: TrackedGameAnswer[];
  currentLevel: GameDifficultyLevel;
  onSetLevel: (level: GameDifficultyLevel) => void;
  adaptiveReason: string;
  totalScore: number;
  totalEffortScore: number;
}

export const GameAnalyticsModal: React.FC<GameAnalyticsModalProps> = ({
  isOpen,
  onClose,
  language,
  patientName,
  trackedAnswers,
  currentLevel,
  onSetLevel,
  adaptiveReason,
  totalScore,
  totalEffortScore,
}) => {
  if (!isOpen) return null;

  const totalAttempts = trackedAnswers.length;
  const correctCount = trackedAnswers.filter((a) => a.isCorrect).length;
  const incorrectWithEffortCount = totalAttempts - correctCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;

  // Breakdown by game
  const gamesMap: Record<string, { title: string; count: number; correct: number; points: number }> = {};
  trackedAnswers.forEach((ans) => {
    const key = ans.gameId || 'other';
    if (!gamesMap[key]) {
      gamesMap[key] = {
        title: ans.gameTitle || key,
        count: 0,
        correct: 0,
        points: 0,
      };
    }
    gamesMap[key].count += 1;
    if (ans.isCorrect) gamesMap[key].correct += 1;
    gamesMap[key].points += ans.scoreAwarded;
  });

  const readAnalyticsSummary = () => {
    const text = `Game progress for ${patientName}: Total score is ${totalScore} points, including ${totalEffortScore} points from positive participation. Total questions answered: ${totalAttempts} with ${accuracy} percent accuracy. Currently at Level ${currentLevel}. ${adaptiveReason}`;
    speakText(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-3.5 sm:p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Cognitive Progress & Game Analytics
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-400 text-stone-950 rounded-full">
                  Lvl {currentLevel}
                </span>
              </div>
              <p className="text-xs text-teal-100">
                Encouraging participation, tracking answers & adaptive level for {patientName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={readAnalyticsSummary}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playGentleTap();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            
            {/* Total Points */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                Total Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 my-0.5">
                {totalScore}
              </div>
              <span className="text-[10px] font-semibold text-amber-700">
                Always rewarded!
              </span>
            </div>

            {/* Effort Bonus */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                Effort Points
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 my-0.5">
                +{totalEffortScore}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">
                {incorrectWithEffortCount} tries supported
              </span>
            </div>

            {/* Questions Answered */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 block">
                Questions
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-950 my-0.5">
                {totalAttempts}
              </div>
              <span className="text-[10px] font-semibold text-sky-700">
                {correctCount} precise hits
              </span>
            </div>

            {/* Accuracy Rate */}
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 block">
                Recall Rate
              </span>
              <div className="text-2xl sm:text-3xl font-black text-teal-950 my-0.5">
                {accuracy}%
              </div>
              <span className="text-[10px] font-semibold text-teal-700">
                Cognitive vitality
              </span>
            </div>

          </div>

          {/* Adaptive Difficulty Level Control */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <BrainCircuit className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs sm:text-sm font-black text-stone-900">
                  Adaptive Cognitive Difficulty
                </h3>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                Auto-Adjusts to Progress
              </span>
            </div>

            <p className="text-xs text-stone-600">
              {adaptiveReason}
            </p>

            {/* Level selection tabs */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => {
                  playGentleTap();
                  onSetLevel(1);
                }}
                className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  currentLevel === 1
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-black">Level 1: Gentle</div>
                <div className="text-[10px] opacity-80 mt-0.5">2-3 choices, instant hints</div>
              </button>

              <button
                onClick={() => {
                  playGentleTap();
                  onSetLevel(2);
                }}
                className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  currentLevel === 2
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-black">Level 2: Steady</div>
                <div className="text-[10px] opacity-80 mt-0.5">4 choices, gentle cues</div>
              </button>

              <button
                onClick={() => {
                  playGentleTap();
                  onSetLevel(3);
                }}
                className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  currentLevel === 3
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-black">Level 3: Sharp</div>
                <div className="text-[10px] opacity-80 mt-0.5">Deep focus, finer details</div>
              </button>
            </div>
          </div>

          {/* Breakdown by Game Category */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-stone-700" />
              <span>Performance by Cultural Game</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.keys(gamesMap).length === 0 ? (
                <div className="col-span-2 text-center py-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
                  Play any of the North Eastern cultural games below to track performance and analytics!
                </div>
              ) : (
                Object.entries(gamesMap).map(([key, data]) => {
                  const gameAcc = Math.round((data.correct / data.count) * 100);
                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-stone-900 truncate block">
                          {data.title}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {data.count} answers • {data.correct} correct
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-teal-800 block">
                          {data.points} pts
                        </span>
                        <span className="text-[10px] font-bold text-stone-600">
                          {gameAcc}% recall
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Response History Log (Every Tracked Answer) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
              <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-stone-700" />
                <span>Response History & Tracked Answers</span>
              </h3>
              <span className="text-[10px] text-stone-500">
                {trackedAnswers.length} recorded
              </span>
            </div>

            {trackedAnswers.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-3">
                No answers logged yet in this session. Start playing to see detailed tracking!
              </p>
            ) : (
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {trackedAnswers.slice().reverse().map((ans) => (
                  <div
                    key={ans.id}
                    className="pt-2 pb-1.5 flex items-start justify-between gap-2.5 text-left"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-700 uppercase">
                          {ans.gameTitle}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          {ans.timestamp} • Lvl {ans.level}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-stone-900 line-clamp-2">
                        {ans.questionText}
                      </p>

                      <div className="text-[11px] flex items-center space-x-2 flex-wrap text-stone-600 pt-0.5">
                        <span>
                          Chosen: <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-amber-800'}>{ans.chosenOption}</strong>
                        </span>
                        {!ans.isCorrect && (
                          <span>
                            • Correct: <span className="text-stone-800 font-semibold">{ans.correctOption}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                          ans.isCorrect
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        +{ans.scoreAwarded} pts
                      </span>
                      <span className="block text-[9px] text-stone-400 mt-0.5">
                        {ans.isCorrect ? 'Correct!' : 'Effort Bonus'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-medium">
            Positive reinforcement: Every attempt receives points to sustain cognitive joy.
          </span>
          <button
            onClick={() => {
              playGentleTap();
              onClose();
            }}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Continue Playing
          </button>
        </div>

      </div>
    </div>
  );
};
