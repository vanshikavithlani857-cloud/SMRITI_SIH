import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  CheckCircle2, 
  Volume2, 
  Heart, 
  HelpCircle, 
  Layers, 
  BrainCircuit, 
  ArrowLeft,
  Compass,
  Camera,
  Target,
  TrendingUp,
  Smile,
  ChevronRight,
  Award
} from 'lucide-react';
import { Language, CognitiveGameScore, TrackedGameAnswer, GameDifficultyLevel } from '../types';
import { translations } from '../i18n/translations';
import { 
  playGentleTap, 
  playSuccessChime, 
  playCardFlipSound, 
  playGentleIncorrectSound, 
  speakText 
} from '../utils/audio';
import { calculateAdaptiveGameLevel } from '../data/northEastGamesData';
import { HeritageTourGame } from './games/HeritageTourGame';
import { PatternRecognitionGame } from './games/PatternRecognitionGame';
import { ObjectRecognitionGame } from './games/ObjectRecognitionGame';
import { RoundScorePieChart } from './games/RoundScorePieChart';
import { GameAnalyticsModal } from './GameAnalyticsModal';

interface GamesHubProps {
  language: Language;
  patientName: string;
  onSaveScore: (score: Omit<CognitiveGameScore, 'id' | 'timestamp'>) => void;
  onBackToHome: () => void;
}

// -------------------------------------------------------------
// GAME 5: MEMORY CARD MATCH (North East Heritage Icons)
// -------------------------------------------------------------
interface MemoryCard {
  id: number;
  symbol: string;
  name: string;
  matched: boolean;
}

const NE_MEMORY_SYMBOLS = [
  { symbol: '👒', name: 'Assam Jaapi (জাপি)' },
  { symbol: '🎺', name: 'Bihu Pepa (পেঁপা)' },
  { symbol: '🦏', name: 'Kaziranga Rhino (গঁড়)' },
  { symbol: '🍃', name: 'Assam Tea Leaf (চাহ পাত)' },
  { symbol: '🪔', name: 'Sacred Diya (চাকি)' },
  { symbol: '🧣', name: 'Assamese Gamusa (গামোচা)' },
];

// -------------------------------------------------------------
// GAME 6: EMOTION & CULTURAL FAMILY SCENARIOS
// -------------------------------------------------------------
interface EmotionScenario {
  id: number;
  situation: Record<string, string>;
  options: { emoji: string; label: Record<string, string>; correct: boolean }[];
  explanation: Record<string, string>;
}

const NE_EMOTION_SCENARIOS: EmotionScenario[] = [
  {
    id: 1,
    situation: {
      en: "Your family gathers together for Rongali Bihu festival, serving homemade Pitha, Laru, and playing melodious Dhol songs on the verandah.",
      hi: "रोंगाली बिहू पर पूरा परिवार एक साथ जुटा है, घर की बनी पीठा-लारू परोसी जा रही है और ढोल की धुन गूंज रही है।",
      as: "ৰঙালী বিহু উপলক্ষে পৰিয়ালৰ সকলো একেলগে বহিছে, পিঠা-লাৰু খাইছে আৰু ঢোলৰ মাতত আনন্দ কৰিছে।",
      bn: "পরিবারের সবাই রঙ্গালী বিহু উৎসবে একসাথে হয়েছে, ঘরে তৈরি পিঠে-নাড়ু খাচ্ছে আর খোশগল্প করছে।",
      gu: "પરિવારના સૌ સાથે મળીને પારંપરિક ઉત્સવની ઉજવણી કરી રહ્યા છે અને સ્વાદિષ્ટ મીઠાઈ માણી રહ્યા છે.",
      mr: "सणासुदीच्या दिवशी संपूर्ण कुटुंब एकत्र जमले असून गोडधोड खाऊन आनंदाने गप्पा मारत आहे.",
      ta: "பண்டிகை நாளில் குடும்பத்தினர் அனைவரும் ஒன்று கூடி இனிப்புகளுடன் மகிழ்ச்சியாக கொண்டாடுகிறார்கள்.",
      mni: "ইমুং-মনুং পুন্না ফমদুনা কুহ্মৈগী পোৎশক চাদুনা নুংঙাইনা হরাওরি।",
      ne: "चाडपर्वमा सम्पूर्ण परिवार भेला भएर परम्परागत परिकार खाँदै रमाइलो गर्दैछन्।",
      brx: "फुजायाव नख'रनि गासैबो लोगोसे जानानै खुसिजों रंजादों।",
    },
    options: [
      { emoji: '😊', label: { en: 'Celebratory Joy & Warmth', hi: 'उत्सव का आनंद व अपनापन', as: 'উৎসৱৰ আনন্দ আৰু স্নেহ', bn: 'উৎসবের আনন্দ ও ভালোবাসা', gu: 'ઉત્સવનો આનંદ', mr: 'सणाचा आनंद', ta: 'பண்டிகை மகிழ்ச்சி', mni: 'নুংঙাই-হরাওবা', ne: 'चाडपर्वको खुसी', brx: 'रंजानाय' }, correct: true },
      { emoji: '😠', label: { en: 'Anger', hi: 'क्रोध', as: 'খং', bn: 'রাগ', gu: 'ગુસ્સો', mr: 'राग', ta: 'கோபம்', mni: 'শাউবা', ne: 'रिस', brx: 'राग' }, correct: false },
      { emoji: '😢', label: { en: 'Sadness', hi: 'उदासी', as: 'দুখ', bn: 'কষ্ট', gu: 'ઉદાસી', mr: 'दुःख', ta: 'சோகம்', mni: 'নুংঙাইতবা', ne: 'उदासी', brx: 'दुखु' }, correct: false },
      { emoji: '😴', label: { en: 'Boredom', hi: 'उबाऊपन', as: 'আমনি', bn: 'একঘেয়েমি', gu: 'કંટાળો', mr: 'कंटाळा', ta: 'சலிப்பு', mni: 'থোইদোকপাম্ববা', ne: 'अल्छी', brx: 'उदां' }, correct: false },
    ],
    explanation: {
      en: "Celebrating traditional festivals with loved ones brings profound harmony, happiness, and cultural joy!",
      hi: "अपनों के साथ पारंपरिक त्यौहार मनाने से मन में आनंद और आत्मीयता का संचार होता है!",
      as: "আপোন মানুহৰ লগত উৎসৱ পালন কৰিলে মন আনন্দ আৰু পৰিতৃপ্তিৰে উপচি পৰে!",
      bn: "প্রিয়জনদের সাথে উৎসব উদযাপন হৃদয়ে অপার আনন্দ ও প্রশান্তি বয়ে আনে!",
      gu: "સ્નેહીજનો સાથે તહેવાર મનાવવાથી મન પ્રસન્ન રહે છે!",
      mr: "कुटुंबासोबत सण साजरा केल्याने मन खूप प्रसन्न होते!",
      ta: "உறவினர்களுடன் பண்டிகையைக் கொண்டாடுவது மனதிற்கு பேரானந்தம் அளிக்கிறது!",
      mni: "নুংশিরবা মীওইশিংগা পুন্না কুহ্মৈ পাংথোকপা অসিদা মন হরাওই!",
      ne: "आफन्तहरूसँग चाड मनाउँदा मनमा धेरै सुख र सन्तोष मिल्छ!",
      brx: "अनजायि नख'रजों रंजानाया गोसोखौ जोबोद गोजोनहोयो!",
    },
  },
  {
    id: 2,
    situation: {
      en: "You are sitting peacefully in the morning on an Assam tea garden verandah, listening to birds singing in the bamboo grove while sipping warm tea.",
      hi: "आप असम के चाय बागान के बरामदे में बैठकर ताजी हवा, पक्षियों की चहचहाहट और गर्म चाय का शांति से आनंद ले रहे हैं।",
      as: "চাহ বাগিচাৰ বাৰান্দাত বহি সুগন্ধি চাহৰ সৈতে বাঁহনিৰ চৰাইৰ কলকাকলি শুনি শান্তিত সময় কটাইছে।",
      bn: "চা বাগানের বারান্দায় বসে স্নিগ্ধ সকালে পাখির ডাক শুনতে শুনতে গরম চায়ে চুমুক দিচ্ছেন।",
      gu: "સવારે ચાના બગીચા વચ્ચે બેસીને પંખીઓનો કલરવ સાંભળતાં ગરમ ચાની ચુસકી લઈ રહ્યા છો.",
      mr: "सकाळी बागेत बसून पक्ष्यांचा किलबिलाट ऐकत आणि वाफाळलेला चहा पीत शांतता अनुभवत आहात.",
      ta: "காலை வேளையில் தேயிலைத் தோட்டத்தில் பறவைகளின் ஒலியை ரசித்தவாறு தேநீர் அருந்துகிறீர்கள்.",
      mni: "চা পাম্বীগী মনুংদা অয়ুক্কী মতমদা শান্তিনা উচেকশিংগী খোন্থা তাদুনা চা থকরি।",
      ne: "बिहान चिया बगानको बरण्डामा ताजा हावा र चराहरूको आवाज सुन्दै चिया पिउँदै हुनुहुन्छ।",
      brx: "साहा बारियाव फुंनि समायना बारजों दाउसिनि गाबनाय खोनानानै शान्ति मोनदों।",
    },
    options: [
      { emoji: '🧘', label: { en: 'Calm & Serene Harmony', hi: 'शांत व सुकून', as: 'শান্ত আৰু নিৰ্মল', bn: 'শান্ত ও তৃপ্ত', gu: 'શાંત અને સ્વસ્થ', mr: 'शांत व समाधानी', ta: 'அமைதி & நிம்மதி', mni: 'শান্ত ওইবা', ne: 'शान्त र सहज', brx: 'शान्ति' }, correct: true },
      { emoji: '😨', label: { en: 'Fear', hi: 'डर', as: 'ভয়', bn: 'ভীত', gu: 'ડર', mr: 'भीती', ta: 'பயம்', mni: 'কিপা', ne: 'डर', brx: 'गिनाय' }, correct: false },
      { emoji: '😡', label: { en: 'Irritation', hi: 'चिड़चिड़ापन', as: 'অশান্ত', bn: 'বিরক্তি', gu: 'ચીડ', mr: 'चिडचिड', ta: 'எரிச்சல்', mni: 'খুংবা', ne: 'रिस', brx: 'राग' }, correct: false },
      { emoji: '😲', label: { en: 'Alarmed', hi: 'चौंकना', as: 'আচৰিত', bn: 'চমক', gu: 'આશ્ચર્ય', mr: 'चकित', ta: 'அதிர்ச்சி', mni: 'ঙকপা', ne: 'छक्क', brx: 'गोमोनाय' }, correct: false },
    ],
    explanation: {
      en: "The calm beauty of nature and fresh tea calms the nervous system and creates deep mental clarity.",
      hi: "प्रकृति की हरी-भरी सुंदरता और ताजी चाय मन को शांत कर आंतरिक सुकून देती है।",
      as: "প্ৰকৃতিৰ সৌন্দৰ্য্য আৰু চাহৰ সুবাসে মনক গভীৰ প্ৰশান্তি প্ৰদান কৰে।",
      bn: "সবুজ প্রকৃতি ও সতেজ চায়ের স্নিগ্ধতা মনের ক্লান্তি দূর করে প্রশান্তি আনে।",
      gu: "પ્રકૃતિનું સૌંદર્ય અને ચા મનને ગહેરી શાંતિ અર્પે છે.",
      mr: "निसर्गाचे सौंदर्य आणि चहा मनाला अथांग शांतता देते.",
      ta: "இயற்கை சூழலும் காலை அமைதியும் மனதை அமைதிப்படுத்துகிறது.",
      mni: "মহৌশাগী ফজবনা মনবু শান্তনা লৈহল্লি।",
      ne: "प्रकृतिको सुन्दरताले मनलाई गहिरो शान्ति दिन्छ।",
      brx: "मिथिंगानि समायनाया गोसोखौ शान्ति खालामो।",
    },
  },
];

type ActiveGameType = 
  | 'authentic-india-tours' 
  | 'pattern-recognition' 
  | 'object-recognition' 
  | 'memory-match' 
  | 'emotion-scenarios';

const STORAGE_KEY_ANSWERS = 'sahayak_game_answers_log';

export const GamesHub: React.FC<GamesHubProps> = ({
  language,
  patientName,
  onSaveScore,
  onBackToHome,
}) => {
  const t = translations[language];

  // Active game selector
  const [activeGame, setActiveGame] = useState<ActiveGameType>('authentic-india-tours');

  // Tracked answers & adaptive leveling
  const [trackedAnswers, setTrackedAnswers] = useState<TrackedGameAnswer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANSWERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentLevel, setCurrentLevel] = useState<GameDifficultyLevel>(1);
  const [adaptiveReason, setAdaptiveReason] = useState<string>('Welcome! Starting at Gentle Level with supportive hints.');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Recalculate adaptive level on mount or when answers change
  useEffect(() => {
    if (trackedAnswers.length > 0) {
      const adaptive = calculateAdaptiveGameLevel(trackedAnswers);
      setCurrentLevel(adaptive.recommendedLevel);
      setAdaptiveReason(adaptive.reason);
    }
  }, []);

  // Save tracked answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(trackedAnswers));
    } catch {
      // Ignore storage errors
    }
  }, [trackedAnswers]);

  // Compute total scores
  const totalScore = trackedAnswers.reduce((sum, a) => sum + (a.scoreAwarded || 0), 0);
  const totalEffortScore = trackedAnswers
    .filter((a) => !a.isCorrect)
    .reduce((sum, a) => sum + (a.scoreAwarded || 0), 0);
  const totalCorrect = trackedAnswers.filter((a) => a.isCorrect).length;

  // Universal answer recording function
  const handleRecordAnswer = (
    gameId: string,
    gameTitle: string,
    questionId: number | string,
    questionText: string,
    chosenOption: string,
    correctOption: string,
    isCorrect: boolean,
    photoUrl?: string
  ) => {
    // Score rule: +10 for correct, +5 for effort (encouraging participation!)
    const scoreAwarded = isCorrect ? 10 : 5;

    const newAnswer: TrackedGameAnswer = {
      id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      gameId,
      gameTitle,
      questionId,
      questionText,
      chosenOption,
      correctOption,
      isCorrect,
      scoreAwarded,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: currentLevel,
      photoUrl,
    };

    const updatedAnswers = [...trackedAnswers, newAnswer];
    setTrackedAnswers(updatedAnswers);

    // Dynamic adaptive difficulty update
    const adaptive = calculateAdaptiveGameLevel(updatedAnswers);
    setCurrentLevel(adaptive.recommendedLevel);
    setAdaptiveReason(adaptive.reason);

    // Save session score to patient profile
    const recentGameAnswers = updatedAnswers.filter((a) => a.gameId === gameId);
    const gameCorrectCount = recentGameAnswers.filter((a) => a.isCorrect).length;
    const gameTotalScore = recentGameAnswers.reduce((s, a) => s + a.scoreAwarded, 0);
    const gameEffortScore = recentGameAnswers
      .filter((a) => !a.isCorrect)
      .reduce((s, a) => s + a.scoreAwarded, 0);
    const gameAccuracy = Math.round((gameCorrectCount / recentGameAnswers.length) * 100);

    onSaveScore({
      gameId,
      gameTitle,
      score: gameTotalScore,
      maxScore: recentGameAnswers.length * 10,
      accuracyPercent: gameAccuracy,
      date: new Date().toLocaleDateString(),
      level: adaptive.recommendedLevel,
      totalAnswered: recentGameAnswers.length,
      correctCount: gameCorrectCount,
      effortPoints: gameEffortScore,
    });
  };

  // --- MEMORY GAME STATE ---
  const [memoryRound, setMemoryRound] = useState(1);
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  const initMemoryGame = () => {
    // Level 1: 4 pairs (8 cards), Level 2/3: 6 pairs (12 cards)
    const activeSymbols = currentLevel === 1 
      ? NE_MEMORY_SYMBOLS.slice(0, 4) 
      : NE_MEMORY_SYMBOLS;

    const deck = [...activeSymbols, ...activeSymbols]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        symbol: item.symbol,
        name: item.name,
        matched: false,
      }));
    setMemoryCards(deck);
    setFlippedCards([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (activeGame === 'memory-match') {
      initMemoryGame();
    }
  }, [activeGame, currentLevel]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(id)) return;
    const clicked = memoryCards.find((c) => c.id === id);
    if (!clicked || clicked.matched) return;

    playCardFlipSound();
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = memoryCards.find((c) => c.id === firstId);
      const secondCard = memoryCards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Matched!
        setTimeout(() => {
          playSuccessChime();
          setMemoryCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
            )
          );
          setFlippedCards([]);

          // Record score
          handleRecordAnswer(
            'memory-match',
            'North East Cultural Memory Match',
            `pair-${firstCard.symbol}`,
            `Match pair for ${firstCard.name}`,
            firstCard.name,
            firstCard.name,
            true
          );

          const remaining = memoryCards.filter(
            (c) => !c.matched && c.id !== firstId && c.id !== secondId
          );
          if (remaining.length === 0) {
            setMemoryWon(true);
            speakText(`Wonderful memory! You completed the North Eastern cultural memory game!`, language);
          }
        }, 400);
      } else {
        // No match - award 5 effort points!
        setTimeout(() => {
          setFlippedCards([]);
          handleRecordAnswer(
            'memory-match',
            'North East Cultural Memory Match',
            `try-${firstId}-${secondId}`,
            `Card flip attempt`,
            `${firstCard?.name} & ${secondCard?.name}`,
            'Pair Match',
            false
          );
        }, 900);
      }
    }
  };

  // --- EMOTION SCENARIOS STATE ---
  const SCENARIOS_PER_ROUND = 2;
  const [scenarioRound, setScenarioRound] = useState(1);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [scenarioCountInRound, setScenarioCountInRound] = useState(0);
  const [selectedEmojiIdx, setSelectedEmojiIdx] = useState<number | null>(null);
  const [emojiFeedback, setEmojiFeedback] = useState<string | null>(null);
  const [scenarioResults, setScenarioResults] = useState<{ isCorrect: boolean; points: number }[]>([]);
  const [isScenarioRoundComplete, setIsScenarioRoundComplete] = useState(false);

  const currentScenario = NE_EMOTION_SCENARIOS[scenarioIdx] || NE_EMOTION_SCENARIOS[0];
  const situationText = currentScenario.situation[language] || currentScenario.situation.en;

  const handleSelectEmotion = (index: number) => {
    if (selectedEmojiIdx !== null) return;
    setSelectedEmojiIdx(index);
    const chosen = currentScenario.options[index];
    const points = chosen.correct ? 10 : 5;

    setScenarioResults((prev) => [...prev, { isCorrect: chosen.correct, points }]);

    if (chosen.correct) {
      playSuccessChime();
      setEmojiFeedback('correct');
      const speakMsg = `Wonderful empathy! ${chosen.label[language] || chosen.label.en}. ${currentScenario.explanation[language] || currentScenario.explanation.en}`;
      speakText(speakMsg, language);
    } else {
      playGentleIncorrectSound();
      setEmojiFeedback('effort');
      const correctOpt = currentScenario.options.find((o) => o.correct);
      const speakMsg = `Warm effort! In this joyful scene, the feeling is ${correctOpt?.label[language] || correctOpt?.label.en}. ${currentScenario.explanation[language] || currentScenario.explanation.en}`;
      speakText(speakMsg, language);
    }

    const correctOpt = currentScenario.options.find((o) => o.correct);
    handleRecordAnswer(
      'emotion-scenarios',
      'North East Cultural Family Stories',
      currentScenario.id,
      situationText,
      chosen.label[language] || chosen.label.en,
      correctOpt ? (correctOpt.label[language] || correctOpt.label.en) : '',
      chosen.correct
    );
  };

  const handleNextScenario = () => {
    playGentleTap();
    if (scenarioCountInRound + 1 < SCENARIOS_PER_ROUND) {
      setSelectedEmojiIdx(null);
      setEmojiFeedback(null);
      setScenarioCountInRound((prev) => prev + 1);
      setScenarioIdx((prev) => (prev + 1) % NE_EMOTION_SCENARIOS.length);
    } else {
      setIsScenarioRoundComplete(true);
    }
  };

  const handlePlayNextScenarioRound = () => {
    playGentleTap();
    setScenarioRound((r) => r + 1);
    setScenarioCountInRound(0);
    setSelectedEmojiIdx(null);
    setEmojiFeedback(null);
    setScenarioResults([]);
    setIsScenarioRoundComplete(false);
    setScenarioIdx((prev) => (prev + 1) % NE_EMOTION_SCENARIOS.length);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 space-y-3 animate-fade-in pb-10">
      
      {/* Top Bar with Return, Level, Analytics Button & Live Points */}
      <div className="bg-gradient-to-r from-stone-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              playGentleTap();
              onBackToHome();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Cognitive Cultural Games
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                North East Heritage
              </span>
            </div>
            <p className="text-[11px] text-teal-200">
              Interactive photo MCQs, voice assistance & positive reinforcement for {patientName}
            </p>
          </div>
        </div>

        {/* Right: Adaptive Level Badge, Live Points & Analytics Button */}
        <div className="flex items-center space-x-2 flex-wrap">
          
          {/* Level Badge (Clickable to view/adjust) */}
          <button
            onClick={() => {
              playGentleTap();
              setIsAnalyticsOpen(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black text-amber-300 transition-colors cursor-pointer"
            title="Adaptive level based on progress"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Level {currentLevel} {currentLevel === 1 ? 'Gentle' : currentLevel === 2 ? 'Steady' : 'Sharp'}</span>
          </button>

          {/* Live Score Pill */}
          <div className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs font-black text-amber-300 flex items-center space-x-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalScore} pts</span>
            {totalEffortScore > 0 && (
              <span className="text-[10px] text-emerald-300 font-bold ml-1">
                (+{totalEffortScore} effort)
              </span>
            )}
          </div>

          {/* Analytics & Progress Button */}
          <button
            onClick={() => {
              playGentleTap();
              setIsAnalyticsOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>Analytics & Progress</span>
          </button>

        </div>

      </div>

      {/* Game Tabs Navigation (5 Games) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
        
        {/* 1. Authentic India Tours: NER */}
        <button
          onClick={() => {
            playGentleTap();
            setActiveGame('authentic-india-tours');
          }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'authentic-india-tours'
              ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Compass className={`w-4 h-4 ${activeGame === 'authentic-india-tours' ? 'text-amber-300' : 'text-teal-700'}`} />
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
              activeGame === 'authentic-india-tours' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-800'
            }`}>
              Featured
            </span>
          </div>
          <div>
            <span className="text-xs font-black block leading-snug">
              Authentic India Tours
            </span>
            <span className={`text-[10px] block truncate mt-0.5 ${
              activeGame === 'authentic-india-tours' ? 'text-teal-100' : 'text-stone-400'
            }`}>
              NER Heritage Explorer
            </span>
          </div>
        </button>

        {/* 2. Pattern Recognition */}
        <button
          onClick={() => {
            playGentleTap();
            setActiveGame('pattern-recognition');
          }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'pattern-recognition'
              ? 'bg-indigo-700 text-white border-indigo-800 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Layers className={`w-4 h-4 ${activeGame === 'pattern-recognition' ? 'text-amber-300' : 'text-indigo-700'}`} />
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
              activeGame === 'pattern-recognition' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-800'
            }`}>
              Visual
            </span>
          </div>
          <div>
            <span className="text-xs font-black block leading-snug">
              Pattern Recognition
            </span>
            <span className={`text-[10px] block truncate mt-0.5 ${
              activeGame === 'pattern-recognition' ? 'text-indigo-100' : 'text-stone-400'
            }`}>
              Coloured Boxes
            </span>
          </div>
        </button>

        {/* 3. Object Recognition */}
        <button
          onClick={() => {
            playGentleTap();
            setActiveGame('object-recognition');
          }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'object-recognition'
              ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Camera className={`w-4 h-4 ${activeGame === 'object-recognition' ? 'text-amber-200' : 'text-amber-700'}`} />
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
              activeGame === 'object-recognition' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'
            }`}>
              Recall
            </span>
          </div>
          <div>
            <span className="text-xs font-black block leading-snug">
              Object Recognition
            </span>
            <span className={`text-[10px] block truncate mt-0.5 ${
              activeGame === 'object-recognition' ? 'text-amber-100' : 'text-stone-400'
            }`}>
              Cultural Artifacts
            </span>
          </div>
        </button>

        {/* 5. Memory Match */}
        <button
          onClick={() => {
            playGentleTap();
            setActiveGame('memory-match');
          }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'memory-match'
              ? 'bg-teal-800 text-white border-teal-900 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Sparkles className={`w-4 h-4 ${activeGame === 'memory-match' ? 'text-amber-300' : 'text-teal-700'}`} />
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
              activeGame === 'memory-match' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
            }`}>
              Matching
            </span>
          </div>
          <div>
            <span className="text-xs font-black block leading-snug">
              Cultural Memory
            </span>
            <span className={`text-[10px] block truncate mt-0.5 ${
              activeGame === 'memory-match' ? 'text-teal-100' : 'text-stone-400'
            }`}>
              Pairs & Icons
            </span>
          </div>
        </button>

        {/* 6. Emotion & Stories */}
        <button
          onClick={() => {
            playGentleTap();
            setActiveGame('emotion-scenarios');
          }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'emotion-scenarios'
              ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Smile className={`w-4 h-4 ${activeGame === 'emotion-scenarios' ? 'text-amber-300' : 'text-rose-600'}`} />
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
              activeGame === 'emotion-scenarios' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-800'
            }`}>
              Empathy
            </span>
          </div>
          <div>
            <span className="text-xs font-black block leading-snug">
              Family Scenarios
            </span>
            <span className={`text-[10px] block truncate mt-0.5 ${
              activeGame === 'emotion-scenarios' ? 'text-rose-100' : 'text-stone-400'
            }`}>
              Social & Emotion
            </span>
          </div>
        </button>

      </div>

      {/* Game Content Body */}
      <div className="w-full">
        {activeGame === 'authentic-india-tours' && (
          <HeritageTourGame
            language={language}
            level={currentLevel}
            patientName={patientName}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {activeGame === 'pattern-recognition' && (
          <PatternRecognitionGame
            language={language}
            level={currentLevel}
            patientName={patientName}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {activeGame === 'object-recognition' && (
          <ObjectRecognitionGame
            language={language}
            level={currentLevel}
            patientName={patientName}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {/* 4. Memory Match */}
        {activeGame === 'memory-match' && (
          memoryWon ? (
            <RoundScorePieChart
              gameTitle="Cultural Memory Match: North East Symbols"
              roundNumber={memoryRound}
              totalQuestions={currentLevel === 1 ? 4 : 6}
              correctCount={currentLevel === 1 ? 4 : 6}
              effortCount={Math.max(0, memoryMoves - (currentLevel === 1 ? 4 : 6))}
              scoreEarned={(currentLevel === 1 ? 4 : 6) * 10}
              maxScorePossible={(currentLevel === 1 ? 4 : 6) * 10}
              language={language}
              patientName={patientName}
              onPlayNextRound={() => {
                setMemoryRound((r) => r + 1);
                initMemoryGame();
              }}
            />
          ) : (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 text-left">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-stone-900">
                    Cultural Memory Match: North East Symbols
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Flip and match traditional items: Jaapi, Hornpipe Pepa, Kaziranga Rhino, and Tea Leaf
                  </p>
                </div>
                <button
                  onClick={initMemoryGame}
                  className="flex items-center space-x-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto py-2">
                {memoryCards.map((card) => {
                  const isFlipped = flippedCards.includes(card.id) || card.matched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      disabled={card.matched}
                      className={`h-20 sm:h-24 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        card.matched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-90'
                          : isFlipped
                          ? 'bg-teal-50 border-teal-400 shadow-md scale-105'
                          : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-400'
                      }`}
                    >
                      {isFlipped ? (
                        <div className="space-y-1 text-center p-1">
                          <span className="text-2xl sm:text-3xl block">{card.symbol}</span>
                          <span className="text-[9px] font-bold text-stone-700 block truncate max-w-[80px]">
                            {card.name.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-teal-800/40">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-stone-400 pt-1">
                Moves: <strong>{memoryMoves}</strong> • Every try earns effort points!
              </div>
            </div>
          )
        )}

        {/* 5. Emotion Scenarios */}
        {activeGame === 'emotion-scenarios' && (
          isScenarioRoundComplete ? (
            <RoundScorePieChart
              gameTitle="Cultural Story & Emotion Recognition"
              roundNumber={scenarioRound}
              totalQuestions={SCENARIOS_PER_ROUND}
              correctCount={scenarioResults.filter((r) => r.isCorrect).length}
              effortCount={scenarioResults.filter((r) => !r.isCorrect).length}
              scoreEarned={scenarioResults.reduce((sum, r) => sum + r.points, 0)}
              maxScorePossible={SCENARIOS_PER_ROUND * 10}
              language={language}
              patientName={patientName}
              onPlayNextRound={handlePlayNextScenarioRound}
            />
          ) : (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-stone-900">
                    Cultural Story & Emotion Recognition
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Reflect on warm scenes of family, Rongali Bihu celebrations, and tea gardens
                  </p>
                </div>

                <button
                  onClick={() => speakText(situationText, language)}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>

              {/* Scenario Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 font-medium leading-relaxed">
                "{situationText}"
              </div>

              {/* Choices */}
              <div className="grid grid-cols-2 gap-2.5">
                {currentScenario.options.map((opt, idx) => {
                  const isSelected = selectedEmojiIdx === idx;
                  let btnStyle = 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800';

                  if (selectedEmojiIdx !== null) {
                    if (opt.correct) {
                      btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected && !opt.correct) {
                      btnStyle = 'bg-amber-100 border-amber-400 text-amber-950';
                    } else {
                      btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectEmotion(idx)}
                      disabled={selectedEmojiIdx !== null}
                      className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">
                          {opt.label[language] || opt.label.en}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {selectedEmojiIdx !== null && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2 animate-fade-in">
                  <p className="text-xs text-stone-700">
                    {currentScenario.explanation[language] || currentScenario.explanation.en}
                  </p>
                  <button
                    onClick={handleNextScenario}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Next Story
                  </button>
                </div>
              )}

            </div>
          )
        )}

      </div>

      {/* Dedicated Game Analytics & Progress Drawer / Modal */}
      <GameAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        language={language}
        patientName={patientName}
        trackedAnswers={trackedAnswers}
        currentLevel={currentLevel}
        onSetLevel={(lvl) => {
          setCurrentLevel(lvl);
          setAdaptiveReason(`Difficulty manually adjusted to Level ${lvl}.`);
        }}
        adaptiveReason={adaptiveReason}
        totalScore={totalScore}
        totalEffortScore={totalEffortScore}
      />

    </div>
  );
};
