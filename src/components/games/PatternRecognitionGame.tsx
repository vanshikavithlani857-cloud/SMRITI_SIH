import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Volume2, 
  RotateCcw, 
  ChevronRight, 
  Award, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Play,
  Heart
} from 'lucide-react';
import { Language, GameDifficultyLevel } from '../../types';
import { 
  playGentleTap, 
  playSuccessChime, 
  playGentleIncorrectSound, 
  playBoxTone, 
  speakText 
} from '../../utils/audio';
import { RoundScorePieChart } from './RoundScorePieChart';

interface PatternRecognitionGameProps {
  language: Language;
  level: GameDifficultyLevel;
  patientName?: string;
  onRecordAnswer: (
    gameId: string,
    gameTitle: string,
    questionId: number | string,
    questionText: string,
    chosenOption: string,
    correctOption: string,
    isCorrect: boolean,
    photoUrl?: string
  ) => void;
}

interface ColoredBox {
  id: number;
  name: string;
  colorName: Record<string, string>;
  icon: string;
  bgClass: string;
  activeBgClass: string;
  borderClass: string;
  textColor: string;
  toneIndex: number;
}

const COLORED_BOXES: ColoredBox[] = [
  {
    id: 0,
    name: 'Emerald Green',
    colorName: {
      en: 'Green (Tea Leaf)',
      hi: 'हरा (चाय पत्ती)',
      as: 'সেউজীয়া (চাহ পাত)',
      mni: 'অশেংবা (চা মনা)',
      ne: 'हरियो (चिया पात)',
      brx: 'गोथां (साहा बिलाइ)',
    },
    icon: '🍃',
    bgClass: 'bg-emerald-600 hover:bg-emerald-500',
    activeBgClass: 'bg-emerald-300 ring-8 ring-emerald-400/80 scale-105 shadow-2xl brightness-125',
    borderClass: 'border-emerald-700',
    textColor: 'text-emerald-950',
    toneIndex: 0,
  },
  {
    id: 1,
    name: 'Golden Amber',
    colorName: {
      en: 'Gold (Muga Silk)',
      hi: 'सुनहरा (मूगा रेशम)',
      as: 'সোণালী (মুগা ৰেচম)',
      mni: 'সনা মচু (মুগা)',
      ne: 'सुनौलो (मुगा सिल्क)',
      brx: 'सोनारु (मुगा खुन)',
    },
    icon: '☀️',
    bgClass: 'bg-amber-500 hover:bg-amber-400',
    activeBgClass: 'bg-amber-200 ring-8 ring-amber-300/80 scale-105 shadow-2xl brightness-125',
    borderClass: 'border-amber-600',
    textColor: 'text-amber-950',
    toneIndex: 1,
  },
  {
    id: 2,
    name: 'Royal Blue',
    colorName: {
      en: 'Blue (Brahmaputra)',
      hi: 'नीला (ब्रह्मपुत्र नदी)',
      as: 'নীলা (ব্ৰহ্মপুত্ৰ)',
      mni: 'হিগোক (ব্রহ্মপুত্র)',
      ne: 'नीलो (ब्रह्मपुत्र)',
      brx: 'गोथां-गोजा (ब्रह्मपुत्र)',
    },
    icon: '🌊',
    bgClass: 'bg-blue-600 hover:bg-blue-500',
    activeBgClass: 'bg-blue-200 ring-8 ring-blue-300/80 scale-105 shadow-2xl brightness-125',
    borderClass: 'border-blue-700',
    textColor: 'text-blue-950',
    toneIndex: 2,
  },
  {
    id: 3,
    name: 'Coral Red',
    colorName: {
      en: 'Red (Rhododendron)',
      hi: 'लाल (बुरांश पुष्प)',
      as: 'ৰঙা (ৰঙালী ফুল)',
      mni: 'অঙাংবা (থাম্বল)',
      ne: 'रातो (गुराँस)',
      brx: 'गोजा (बिबार)',
    },
    icon: '🌺',
    bgClass: 'bg-rose-600 hover:bg-rose-500',
    activeBgClass: 'bg-rose-200 ring-8 ring-rose-300/80 scale-105 shadow-2xl brightness-125',
    borderClass: 'border-rose-700',
    textColor: 'text-rose-950',
    toneIndex: 3,
  },
];

type GamePhase = 
  | 'ready'            // Waiting to start level
  | 'showing_sequence' // App is flashing colored boxes in sequence
  | 'user_turn'        // User is tapping the boxes
  | 'level_success'    // Sequence matched!
  | 'level_mistake'    // Incorrect step made, showing replay
  | 'round_complete';  // All levels in round finished -> show Pie Chart!

export const PatternRecognitionGame: React.FC<PatternRecognitionGameProps> = ({
  language,
  level: difficultyLevel,
  patientName = 'Senior',
  onRecordAnswer,
}) => {
  // Round management (3 levels per round)
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0); // 0, 1, 2
  const TOTAL_LEVELS_IN_ROUND = 3;

  // Level lengths based on difficulty
  // Gentle (difficulty 1): lengths [2, 3, 3]
  // Steady (difficulty 2): lengths [3, 4, 4]
  // Sharp  (difficulty 3): lengths [3, 4, 5]
  const getSequenceLengthForLevel = (lvlIdx: number) => {
    if (difficultyLevel === 1) return lvlIdx === 0 ? 2 : 3;
    if (difficultyLevel === 2) return lvlIdx === 0 ? 3 : 4;
    return lvlIdx === 0 ? 3 : lvlIdx === 1 ? 4 : 5;
  };

  // State
  const [sequence, setSequence] = useState<number[]>([]);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);

  // Round scoring metrics
  const [roundResults, setRoundResults] = useState<{
    levelIdx: number;
    isCorrect: boolean;
    points: number;
  }[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Generate a random sequence of colored boxes
  const generateNewSequence = (len: number): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * COLORED_BOXES.length));
    }
    return seq;
  };

  // Start current level
  const startLevel = (lvlIdx: number) => {
    const len = getSequenceLengthForLevel(lvlIdx);
    const newSeq = generateNewSequence(len);
    setSequence(newSeq);
    setUserTaps([]);
    setActiveBoxId(null);
    setFeedbackMessage(`Level ${lvlIdx + 1}: Watch the ${len}-box pattern!`);
    setPhase('showing_sequence');

    // Announce turn
    speakText(`Level ${lvlIdx + 1}. Watch the sequence.`, language);

    // Play sequence presentation
    playSequencePresentation(newSeq);
  };

  // Play sequence one by one with visual highlight and audio tone
  const playSequencePresentation = (seq: number[]) => {
    let step = 0;

    const playNextStep = () => {
      if (step < seq.length) {
        const boxId = seq[step];
        setActiveBoxId(boxId);
        playBoxTone(boxId, 0.45);

        timeoutRef.current = setTimeout(() => {
          setActiveBoxId(null);
          step++;
          // Brief gap between boxes
          timeoutRef.current = setTimeout(playNextStep, 300);
        }, 550);
      } else {
        // Sequence display finished -> user's turn
        timeoutRef.current = setTimeout(() => {
          setPhase('user_turn');
          setFeedbackMessage('👉 Your turn! Tap the boxes in the same order.');
          speakText('Your turn. Tap the boxes in the same order.', language);
        }, 400);
      }
    };

    // Small initial delay before first flash
    timeoutRef.current = setTimeout(playNextStep, 700);
  };

  // Replay sequence for senior assistance
  const handleReplaySequence = () => {
    playGentleTap();
    setUserTaps([]);
    setActiveBoxId(null);
    setPhase('showing_sequence');
    setFeedbackMessage('Replaying pattern. Watch closely...');
    playSequencePresentation(sequence);
  };

  // Handle user tapping a colored box
  const handleBoxTap = (boxId: number) => {
    if (phase !== 'user_turn') return;

    // Flash tapped box & play sound
    setActiveBoxId(boxId);
    playBoxTone(boxId, 0.3);
    setTimeout(() => setActiveBoxId(null), 250);

    const nextTaps = [...userTaps, boxId];
    setUserTaps(nextTaps);
    const currentStep = nextTaps.length - 1;

    // Verify if tapped box matches sequence
    if (boxId !== sequence[currentStep]) {
      // Mistake made
      playGentleIncorrectSound();
      setPhase('level_mistake');
      setFeedbackMessage('Good effort! That was a different box. Let’s review the pattern.');

      // Award +5 effort points
      const effortPoints = 5;
      const updatedResults = [
        ...roundResults,
        { levelIdx: currentLevelIdx, isCorrect: false, points: effortPoints },
      ];
      setRoundResults(updatedResults);

      onRecordAnswer(
        'pattern-recognition',
        'Pattern Recognition: Colored Boxes Sequence',
        `lvl-${currentLevelIdx + 1}`,
        `Match sequence of ${sequence.length} colored boxes`,
        nextTaps.map((id) => COLORED_BOXES[id].name).join(' → '),
        sequence.map((id) => COLORED_BOXES[id].name).join(' → '),
        false
      );

      speakText('Good try! You earned 5 effort points. Tap Replay to see the pattern again.', language);
      return;
    }

    // Step was correct!
    if (nextTaps.length === sequence.length) {
      // Completed full sequence correctly!
      playSuccessChime();
      setPhase('level_success');
      const points = 10;
      setFeedbackMessage(`Splendid! You matched all ${sequence.length} boxes perfectly! (+10 pts)`);

      const updatedResults = [
        ...roundResults,
        { levelIdx: currentLevelIdx, isCorrect: true, points },
      ];
      setRoundResults(updatedResults);

      onRecordAnswer(
        'pattern-recognition',
        'Pattern Recognition: Colored Boxes Sequence',
        `lvl-${currentLevelIdx + 1}`,
        `Match sequence of ${sequence.length} colored boxes`,
        sequence.map((id) => COLORED_BOXES[id].name).join(' → '),
        sequence.map((id) => COLORED_BOXES[id].name).join(' → '),
        true
      );

      speakText('Wonderful memory! Pattern matched perfectly!', language);
    }
  };

  // Move to next level or complete round
  const handleProceedToNextLevel = () => {
    playGentleTap();
    if (currentLevelIdx + 1 < TOTAL_LEVELS_IN_ROUND) {
      const nextIdx = currentLevelIdx + 1;
      setCurrentLevelIdx(nextIdx);
      startLevel(nextIdx);
    } else {
      // Round Complete!
      setPhase('round_complete');
    }
  };

  // Start fresh round
  const handleStartFreshRound = () => {
    playGentleTap();
    setRoundNumber((r) => r + 1);
    setCurrentLevelIdx(0);
    setRoundResults([]);
    startLevel(0);
  };

  // Auto-start on initial mount
  useEffect(() => {
    startLevel(0);
  }, []);

  // Compute round scores
  const roundCorrectCount = roundResults.filter((r) => r.isCorrect).length;
  const roundEffortCount = roundResults.filter((r) => !r.isCorrect).length;
  const roundTotalScore = roundResults.reduce((s, r) => s + r.points, 0);
  const roundMaxPossible = TOTAL_LEVELS_IN_ROUND * 10;

  // --------------------------------------------------------------------------
  // ROUND COMPLETE SCREEN (Pie Chart Showing Percentage Score)
  // --------------------------------------------------------------------------
  if (phase === 'round_complete') {
    return (
      <RoundScorePieChart
        gameTitle="Pattern Recognition: Colored Boxes Sequence"
        roundNumber={roundNumber}
        totalQuestions={TOTAL_LEVELS_IN_ROUND}
        correctCount={roundCorrectCount}
        effortCount={roundEffortCount}
        scoreEarned={roundTotalScore}
        maxScorePossible={roundMaxPossible}
        language={language}
        patientName={patientName}
        onPlayNextRound={handleStartFreshRound}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ACTIVE GAMEPLAY SCREEN
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-5 animate-in fade-in">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                Pattern Recognition: Colored Boxes
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                Round {roundNumber}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Level {currentLevelIdx + 1} of {TOTAL_LEVELS_IN_ROUND} • Sequence Length: {getSequenceLengthForLevel(currentLevelIdx)} Boxes
            </p>
          </div>
        </div>

        {/* Level Steps Dots */}
        <div className="flex items-center space-x-1.5">
          {[0, 1, 2].map((idx) => {
            const isCompleted = idx < currentLevelIdx;
            const isCurrent = idx === currentLevelIdx;
            return (
              <span
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 ring-2 ring-emerald-200'
                    : isCurrent
                    ? 'bg-indigo-600 ring-4 ring-indigo-100 animate-pulse'
                    : 'bg-stone-200'
                }`}
                title={`Level ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Dynamic Status / Feedback Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-center transition-all ${
          phase === 'showing_sequence'
            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-bold'
            : phase === 'user_turn'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
            : phase === 'level_success'
            ? 'bg-teal-50 border-teal-300 text-teal-950 font-black'
            : 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          {phase === 'showing_sequence' && (
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping inline-block" />
          )}
          <span className="text-sm sm:text-base">{feedbackMessage}</span>
        </div>

        {/* Step dots for user's turn */}
        {phase === 'user_turn' && (
          <div className="flex items-center justify-center space-x-2 mt-2">
            {sequence.map((_, i) => {
              const filled = i < userTaps.length;
              return (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full border transition-all ${
                    filled
                      ? 'bg-emerald-500 border-emerald-600 scale-110 shadow-xs'
                      : 'bg-white border-emerald-300'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4 COLORED BOXES (LARGE, HIGH VISIBILITY, ACCESSIBLE) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto py-1">
        {COLORED_BOXES.map((box) => {
          const isCurrentlyActive = activeBoxId === box.id;
          const isUserTurn = phase === 'user_turn';

          return (
            <button
              key={box.id}
              onClick={() => handleBoxTap(box.id)}
              disabled={!isUserTurn}
              className={`h-28 sm:h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-150 transform select-none cursor-pointer ${
                box.borderClass
              } ${
                isCurrentlyActive
                  ? box.activeBgClass
                  : isUserTurn
                  ? `${box.bgClass} active:scale-95 shadow-md`
                  : `${box.bgClass} opacity-85 cursor-not-allowed`
              }`}
              title={box.name}
            >
              <span className="text-3xl sm:text-4xl filter drop-shadow-md mb-1">
                {box.icon}
              </span>
              <span className="text-xs sm:text-sm font-black text-white tracking-wide drop-shadow-sm">
                {box.colorName[language] || box.colorName.en}
              </span>
              <span className="text-[10px] text-white/80 font-bold mt-0.5">
                Box {box.id + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Post-Turn Options (Success, Mistake, Replay) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {/* Replay Sequence Button */}
        {phase === 'user_turn' && (
          <button
            onClick={handleReplaySequence}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>Replay Pattern</span>
          </button>
        )}

        {/* Level Success -> Continue */}
        {phase === 'level_success' && (
          <button
            onClick={handleProceedToNextLevel}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-black flex items-center space-x-2 shadow-md cursor-pointer animate-bounce"
          >
            <span>
              {currentLevelIdx + 1 < TOTAL_LEVELS_IN_ROUND ? 'Next Level' : 'View Round Rating & Pie Chart'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Mistake Made -> Try Again or Proceed */}
        {phase === 'level_mistake' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReplaySequence}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Watch & Try Again</span>
            </button>

            <button
              onClick={handleProceedToNextLevel}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs border border-stone-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>
                {currentLevelIdx + 1 < TOTAL_LEVELS_IN_ROUND ? 'Skip to Next Level' : 'Finish Round'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Gentle Instructions Footer */}
      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500 flex items-center justify-center space-x-2">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>How to play:</strong> First, the app flashes the colored boxes in a sequence. Then, tap the same boxes in the identical order!
        </span>
      </div>

    </div>
  );
};
