import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  RotateCcw, 
  ChevronRight, 
  Info, 
  MapPin, 
  Award,
  Heart
} from 'lucide-react';
import { Language, GameDifficultyLevel } from '../../types';
import { 
  BaseGameQuestion, 
  AUTHENTIC_INDIA_TOURS_NER_QUESTIONS 
} from '../../data/northEastGamesData';
import { 
  playGentleTap, 
  playSuccessChime, 
  playGentleIncorrectSound, 
  speakText 
} from '../../utils/audio';
import { RoundScorePieChart } from './RoundScorePieChart';

interface HeritageTourGameProps {
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

export const HeritageTourGame: React.FC<HeritageTourGameProps> = ({
  language,
  level,
  patientName = 'Senior',
  onRecordAnswer,
}) => {
  const QUESTIONS_PER_ROUND = 4;
  const [roundNumber, setRoundNumber] = useState(1);
  const [questionIdxInRound, setQuestionIdxInRound] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'answered'>('idle');
  const [showHint, setShowHint] = useState(level === 1); // auto-show on gentle level
  const [scoreEarned, setScoreEarned] = useState<number | null>(null);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [roundResults, setRoundResults] = useState<{ isCorrect: boolean; points: number }[]>([]);

  const currentQ = AUTHENTIC_INDIA_TOURS_NER_QUESTIONS[questionIdx] || AUTHENTIC_INDIA_TOURS_NER_QUESTIONS[0];
  const questionText = currentQ.question[language] || currentQ.question.en;
  const correctOption = currentQ.options.find((o) => o.isCorrect);

  // Shuffle options so the answer is randomized across A, B, C, D (not always option A)
  // and remove image previews from options
  const [shuffledOptions, setShuffledOptions] = useState<typeof currentQ.options>(() => {
    const opts = [...currentQ.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  });

  // Re-shuffle options whenever the destination question changes or new round starts
  React.useEffect(() => {
    const correctOpt = currentQ.options.find((o) => o.isCorrect);
    let pool = [...currentQ.options];

    if (level === 1 && correctOpt) {
      // Level 1: 1 correct option + 2 distractors
      const distractors = currentQ.options.filter((o) => !o.isCorrect);
      // Shuffle distractors
      for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
      }
      pool = [correctOpt, distractors[0], distractors[1]].filter(Boolean);
    }

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    setShuffledOptions(pool);
  }, [questionIdx, level]);

  const visibleOptions = shuffledOptions.length > 0 ? shuffledOptions : currentQ.options;

  const handleSelectOption = (optId: string) => {
    if (feedbackState === 'answered') return;

    setSelectedOptionId(optId);
    const chosen = currentQ.options.find((o) => o.id === optId);
    const isCorrect = chosen ? chosen.isCorrect : false;
    const points = isCorrect ? 10 : 5; // +10 for correct, +5 for effort!

    setScoreEarned(points);
    setFeedbackState('answered');

    setRoundResults((prev) => [...prev, { isCorrect, points }]);

    if (isCorrect) {
      playSuccessChime();
      const speakMsg = `Well done! ${chosen?.text[language] || chosen?.text.en} is correct! You earned 10 points! ${currentQ.explanation[language] || currentQ.explanation.en}`;
      speakText(speakMsg, language);
    } else {
      playGentleIncorrectSound();
      const speakMsg = `Wonderful effort! You earned 5 points for trying. The answer is ${correctOption?.text[language] || correctOption?.text.en}. ${currentQ.explanation[language] || currentQ.explanation.en}`;
      speakText(speakMsg, language);
    }

    onRecordAnswer(
      'authentic-india-tours',
      'Authentic India Tours: NER Heritage',
      currentQ.id,
      questionText,
      chosen ? (chosen.text[language] || chosen.text.en) : optId,
      correctOption ? (correctOption.text[language] || correctOption.text.en) : '',
      isCorrect,
      currentQ.photoUrl
    );
  };

  const handleNext = () => {
    playGentleTap();
    if (questionIdxInRound + 1 < QUESTIONS_PER_ROUND) {
      setSelectedOptionId(null);
      setFeedbackState('idle');
      setScoreEarned(null);
      setShowHint(level === 1);
      setQuestionIdxInRound((prev) => prev + 1);
      if (questionIdx + 1 < AUTHENTIC_INDIA_TOURS_NER_QUESTIONS.length) {
        setQuestionIdx((prev) => prev + 1);
      } else {
        setQuestionIdx(0);
      }
    } else {
      setIsRoundComplete(true);
    }
  };

  const handlePlayNextRound = () => {
    playGentleTap();
    setRoundNumber((r) => r + 1);
    setQuestionIdxInRound(0);
    setSelectedOptionId(null);
    setFeedbackState('idle');
    setScoreEarned(null);
    setShowHint(level === 1);
    setRoundResults([]);
    setIsRoundComplete(false);
    if (questionIdx + 1 < AUTHENTIC_INDIA_TOURS_NER_QUESTIONS.length) {
      setQuestionIdx((prev) => prev + 1);
    } else {
      setQuestionIdx(0);
    }
  };

  if (isRoundComplete) {
    const roundCorrect = roundResults.filter((r) => r.isCorrect).length;
    const roundEffort = roundResults.filter((r) => !r.isCorrect).length;
    const roundTotalScore = roundResults.reduce((sum, r) => sum + r.points, 0);
    const roundMaxPossible = QUESTIONS_PER_ROUND * 10;

    return (
      <RoundScorePieChart
        gameTitle="Authentic India Tours: NER Heritage Explorer"
        roundNumber={roundNumber}
        totalQuestions={QUESTIONS_PER_ROUND}
        correctCount={roundCorrect}
        effortCount={roundEffort}
        scoreEarned={roundTotalScore}
        maxScorePossible={roundMaxPossible}
        language={language}
        patientName={patientName}
        onPlayNextRound={handlePlayNextRound}
      />
    );
  }

  const readQuestionAloud = () => {
    const textToRead = `${currentQ.title}. ${currentQ.photoCaption}. Question: ${questionText}`;
    speakText(textToRead, language);
  };

  return (
    <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl p-3.5 sm:p-5 border border-stone-200 shadow-sm space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm sm:text-base font-black text-stone-900">
                Authentic India Tours: NER Heritage Explorer
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                Lvl {level}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-teal-600" />
              <span>{currentQ.category}</span>
              <span className="text-stone-300">•</span>
              <span className="text-teal-700 font-semibold">{currentQ.sourceCredit}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
            Destination {questionIdx + 1} of {AUTHENTIC_INDIA_TOURS_NER_QUESTIONS.length}
          </span>
          <button
            onClick={readQuestionAloud}
            className="flex items-center space-x-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
            title="Read question & photo story aloud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>
        </div>
      </div>

      {/* Main Picture Card */}
      <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-900 aspect-16/9 max-h-72 w-full group">
        <img
          src={currentQ.photoUrl}
          alt={currentQ.photoAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
            {currentQ.category}
          </span>
          <h3 className="text-sm sm:text-base font-black text-white drop-shadow-sm">
            {currentQ.title}
          </h3>
          <p className="text-xs text-stone-200 line-clamp-2 mt-0.5">
            {currentQ.photoCaption}
          </p>
        </div>
      </div>

      {/* Question Statement */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block">
              Heritage Photo Quiz:
            </span>
            <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">
              {questionText}
            </p>
          </div>
          <button
            onClick={() => speakText(questionText, language)}
            className="p-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-900 shrink-0 cursor-pointer"
            title="Listen to question"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hint button/box */}
        {!showHint ? (
          <button
            onClick={() => {
              playGentleTap();
              setShowHint(true);
            }}
            className="text-[11px] text-teal-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need a gentle hint?</span>
          </button>
        ) : (
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span><strong>Clue:</strong> {currentQ.hint[language] || currentQ.hint.en}</span>
          </div>
        )}
      </div>

      {/* Multiple Choice Options (Text Only with Shuffled Positions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visibleOptions.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
          let btnStyle = 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 shadow-xs';
          let letterBadgeStyle = 'bg-stone-100 text-stone-700 border-stone-200';

          if (feedbackState === 'answered') {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-black';
              letterBadgeStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = 'bg-amber-50 border-amber-400 text-amber-950 font-bold';
              letterBadgeStyle = 'bg-amber-500 text-white border-amber-500';
            } else {
              btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
              letterBadgeStyle = 'bg-stone-200 text-stone-500 border-stone-200';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={feedbackState === 'answered'}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 ${letterBadgeStyle}`}>
                  {letter}
                </span>
                <span className="text-xs sm:text-sm font-bold truncate">
                  {opt.text[language] || opt.text.en}
                </span>
              </div>

              {feedbackState === 'answered' && opt.isCorrect && (
                <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">
                  Correct (+10)
                </span>
              )}
              {feedbackState === 'answered' && isSelected && !opt.isCorrect && (
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0">
                  Effort (+5)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Cultural Explanation */}
      {feedbackState === 'answered' && (
        <div className="p-3.5 rounded-xl bg-stone-50 border border-teal-200 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-xs sm:text-sm font-black text-stone-900">
                {scoreEarned === 10 ? '✨ Brilliant! Perfect Answer!' : '💖 Warm Effort! Great Participation!'}
              </span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                +{scoreEarned} points awarded
              </span>
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>Next Destination</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed">
            {currentQ.explanation[language] || currentQ.explanation.en}
          </p>

          <div className="pt-1.5 border-t border-stone-200 flex items-start space-x-1.5 text-[11px] text-teal-900 bg-teal-50/70 p-2 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong>Authentic India Tours Insight:</strong>{' '}
              {currentQ.culturalTrivia[language] || currentQ.culturalTrivia.en}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
