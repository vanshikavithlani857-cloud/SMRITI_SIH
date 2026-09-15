import React, { useEffect } from 'react';
import { Trophy, Sparkles, RotateCcw, Volume2, ArrowRight, Award, Heart, CheckCircle2 } from 'lucide-react';
import { Language } from '../../types';
import { playSuccessChime, playGentleTap, speakText } from '../../utils/audio';

interface RoundScorePieChartProps {
  gameTitle: string;
  roundNumber?: number;
  totalQuestions: number;
  correctCount: number;
  effortCount: number;
  scoreEarned: number;
  maxScorePossible: number;
  language: Language;
  patientName?: string;
  onPlayNextRound: () => void;
  onChangeGame?: () => void;
}

export const RoundScorePieChart: React.FC<RoundScorePieChartProps> = ({
  gameTitle,
  roundNumber = 1,
  totalQuestions,
  correctCount,
  effortCount,
  scoreEarned,
  maxScorePossible,
  language,
  patientName = 'Senior',
  onPlayNextRound,
  onChangeGame,
}) => {
  // Accuracy percentage
  const percentage = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
    : 0;

  // Star & Performance Rating
  let ratingStars = '⭐⭐⭐';
  let ratingTitle = 'Outstanding Master!';
  let ratingDesc = 'Incredible focus and memory recall this round!';
  let badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';

  if (percentage >= 80) {
    ratingStars = '⭐⭐⭐';
    ratingTitle = 'Outstanding Precision!';
    ratingDesc = 'Exceptional cognitive recall and pattern recognition!';
    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (percentage >= 60) {
    ratingStars = '⭐⭐';
    ratingTitle = 'Excellent Effort & Focus!';
    ratingDesc = 'Great observation and consistent participation!';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  } else {
    ratingStars = '⭐';
    ratingTitle = 'Heartfelt Participation!';
    ratingDesc = 'Every try strengthens the mind and earns positive points!';
    badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
  }

  // Play celebratory chime upon mounting
  useEffect(() => {
    playSuccessChime();
    const voiceMsg = `Round complete! You scored ${percentage} percent with ${scoreEarned} points! ${ratingTitle}`;
    speakText(voiceMsg, language);
  }, []);

  // SVG Pie/Donut Calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Slice percentages
  const correctPct = totalQuestions > 0 ? (correctCount / totalQuestions) : 0;
  const effortPct = totalQuestions > 0 ? (effortCount / totalQuestions) : 0;
  const missedCount = Math.max(0, totalQuestions - correctCount - effortCount);
  const missedPct = totalQuestions > 0 ? (missedCount / totalQuestions) : 0;

  // Stroke Dash arrays
  const correctDash = correctPct * circumference;
  const effortDash = effortPct * circumference;
  const missedDash = missedPct * circumference;

  const correctOffset = 0;
  const effortOffset = -correctDash;
  const missedOffset = -(correctDash + effortDash);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Badge & Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Round {roundNumber} Completed!</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
          {gameTitle}
        </h2>
        <p className="text-xs text-stone-500">
          Round performance summary for <span className="font-bold text-teal-800">{patientName}</span>
        </p>
      </div>

      {/* Pie Chart & Performance Rating Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-stone-50 to-teal-50/40 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-center gap-6">
        
        {/* Interactive SVG Pie/Donut Chart */}
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background circle track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Correct Answers Segment (Emerald Green) */}
            {correctPct > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#10b981"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${correctDash} ${circumference}`}
                strokeDashoffset={correctOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Effort / Assisted Segment (Amber) */}
            {effortPct > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${effortDash} ${circumference}`}
                strokeDashoffset={effortOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Missed / Needs Practice Segment (Stone/Rose) */}
            {missedPct > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#cbd5e1"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${missedDash} ${circumference}`}
                strokeDashoffset={missedOffset}
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 leading-none tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">
              Score Rate
            </span>
          </div>
        </div>

        {/* Rating Breakdown & Stars */}
        <div className="space-y-2.5 text-center sm:text-left">
          <div className="text-xl sm:text-2xl">{ratingStars}</div>
          <div className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${badgeColor}`}>
            {ratingTitle}
          </div>
          <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
            {ratingDesc}
          </p>
          
          <button
            onClick={() => {
              playGentleTap();
              speakText(`You completed this round with a score of ${percentage} percent, earning ${scoreEarned} total points! ${ratingTitle}`, language);
            }}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Voice Review</span>
          </button>
        </div>

      </div>

      {/* Legend & Stat Counters */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px] font-bold text-emerald-950">Correct</span>
          </div>
          <div className="text-lg font-black text-emerald-900">
            {correctCount} <span className="text-xs font-semibold text-emerald-700">({Math.round(correctPct * 100)}%)</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">+10 pts each</span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-[11px] font-bold text-amber-950">Effort Points</span>
          </div>
          <div className="text-lg font-black text-amber-900">
            {effortCount} <span className="text-xs font-semibold text-amber-700">({Math.round(effortPct * 100)}%)</span>
          </div>
          <span className="text-[10px] text-amber-700 font-medium">+5 pts each</span>
        </div>

        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Trophy className="w-3 h-3 text-teal-700 inline" />
            <span className="text-[11px] font-bold text-teal-950">Points Earned</span>
          </div>
          <div className="text-lg font-black text-teal-900">
            {scoreEarned} <span className="text-xs font-semibold text-teal-600">/ {maxScorePossible}</span>
          </div>
          <span className="text-[10px] text-teal-700 font-medium">Recorded to Profile</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        <button
          onClick={() => {
            playGentleTap();
            onPlayNextRound();
          }}
          className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Next Round</span>
        </button>

        {onChangeGame && (
          <button
            onClick={() => {
              playGentleTap();
              onChangeGame();
            }}
            className="w-full sm:w-auto px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm rounded-2xl border border-stone-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Choose Another Game</span>
            <ArrowRight className="w-4 h-4 text-stone-500" />
          </button>
        )}
      </div>

    </div>
  );
};
