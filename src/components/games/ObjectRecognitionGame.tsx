import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  ChevronRight, 
  Award, 
  Info, 
  Camera, 
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Eye,
  Tag
} from 'lucide-react';
import { Language, GameDifficultyLevel } from '../../types';
import { 
  playGentleTap, 
  playSuccessChime, 
  playGentleIncorrectSound, 
  speakText 
} from '../../utils/audio';
import { RoundScorePieChart } from './RoundScorePieChart';

interface ObjectRecognitionGameProps {
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

interface RecognizableObject {
  id: number;
  name: Record<string, string>;
  category: Record<string, string>;
  description: Record<string, string>;
  culturalSignificance: Record<string, string>;
  emoji: string;
  svgType: 'jaapi' | 'pepa' | 'gamusa' | 'tea_cup' | 'dhol' | 'bell' | 'spectacles' | 'clay_pitcher' | 'key' | 'handloom';
  options: {
    id: string;
    text: Record<string, string>;
    isCorrect: boolean;
  }[];
}

const OBJECTS_POOL: RecognizableObject[] = [
  {
    id: 1,
    name: {
      en: 'Assam Traditional Jaapi (জাপি)',
      hi: 'असमिया पारंपरिक जापी',
      as: 'অসমীয়া পৰম্পৰাগত জাপি',
      mni: 'জাপি',
      ne: 'असमिया परम्परागत जापी',
      brx: 'आछामनि जापि',
    },
    category: { en: 'Traditional Conical Sun Hat', hi: 'पारंपरिक बांस की टोपी', as: 'বাঁহ-বেতৰ প্ৰতীকাত্মক টুপি' },
    description: {
      en: 'A conical bamboo and cane hat adorned with red felt patterns, historically worn by farmers and given as a supreme symbol of Assamese honor.',
      hi: 'बांस और लाल कपड़े से बनी असम की पारंपरिक टोपी जो सम्मान का सर्वोच्च प्रतीक है।',
      as: 'বাঁহ, বেত আৰু টকৌ পাতেৰে নিৰ্মিত সন্মানীয় জাতীয় স্মাৰক।',
    },
    culturalSignificance: {
      en: 'Gifted to revered guests and family elders during festive welcomes.',
      hi: 'सम्माननीय अतिथियों को स्वागत में भेंट की जाती है।',
      as: 'বিহু আৰু বিশেষ অনুষ্ঠানত গুৰুজন আৰু অতিথিক শ্ৰদ্ধাৰে আগবঢ়োৱা হয়।',
    },
    emoji: '👒',
    svgType: 'jaapi',
    options: [
      { id: 'opt-1', text: { en: 'Jaapi (Traditional Sun Hat)', hi: 'जापी (पारंपरिक टोपी)', as: 'জাপি (পৰম্পৰাগত টুপি)' }, isCorrect: true },
      { id: 'opt-2', text: { en: 'Turband (Pagri)', hi: 'पगड़ी', as: 'পাগুলি' }, isCorrect: false },
      { id: 'opt-3', text: { en: 'Rain Umbrella', hi: 'छाता', as: 'ছাটি' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Decorative Fan', hi: 'हाथ का पंखा', as: 'বিচনী' }, isCorrect: false },
    ],
  },
  {
    id: 2,
    name: {
      en: 'Bihu Pepa (পেঁপা)',
      hi: 'बिहू पेंपा (भैंस के सींग का बाजा)',
      as: 'বিহুৰ পেঁপা (ম’হৰ শিঙৰ পেঁপা)',
      mni: 'পেপা',
      ne: 'बिहु पेपा',
      brx: 'पेपा',
    },
    category: { en: 'Folk Wind Musical Instrument', hi: 'पारंपरिक लोक वाद्ययंत्र', as: 'লোক বাদ্যযন্ত্ৰ' },
    description: {
      en: 'A high-pitched traditional musical flute crafted from a curved buffalo horn and capped with four small bamboo holes.',
      hi: 'भैंस के सींग और बांस से बना बिहू उत्सव का प्रमुख वाद्य।',
      as: 'ম’হৰ শিঙ আৰু বাঁহেৰে তৈয়াৰী সুমধুৰ সুৰীয়া বিহুৰ প্ৰধান বাদ্য।',
    },
    culturalSignificance: {
      en: 'Played during Rongali Bihu to herald springtime love and renewal.',
      hi: 'वसंत ऋतु के आगमन पर बिहू नर्तकों के साथ बजाया जाता है।',
      as: 'বসন্তৰ আগমন আৰু ৰঙালী বিহুত ডেকা-গাভৰুৱে বজোৱা প্ৰাণৱন্ত বাদ্য।',
    },
    emoji: '🎺',
    svgType: 'pepa',
    options: [
      { id: 'opt-1', text: { en: 'Bamboo Flute (Bansuri)', hi: 'बांसुरी', as: 'বাঁহী' }, isCorrect: false },
      { id: 'opt-2', text: { en: 'Bihu Pepa (Hornpipe)', hi: 'बिहू पेंपा (सींग का बाजा)', as: 'বিহুৰ পেঁপা' }, isCorrect: true },
      { id: 'opt-3', text: { en: 'Trumpet', hi: 'तुरही', as: 'তুৰহী' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Conch Shell (Shankh)', hi: 'शंख', as: 'শংখ' }, isCorrect: false },
    ],
  },
  {
    id: 3,
    name: {
      en: 'Handwoven Gamusa (গামোচা)',
      hi: 'पारंपरिक असमिया गमोसा',
      as: 'অসমৰ স্বাভিমানী গামোচা',
      mni: 'গামোচা',
      ne: 'गमोसा',
      brx: 'गमोसा',
    },
    category: { en: 'Sacred Handwoven Cloth', hi: 'पवित्र हथकरघा वस्त्र', as: 'স্বাভিমানী বস্ত্ৰ' },
    description: {
      en: 'A pristine white rectangular cotton towel with intricate red floral motifs woven along both ends, representing Assamese dignity.',
      hi: 'सफेद सूती कपड़े पर लाल फूलों की कढ़ाई वाला असम का प्रतिष्ठित वस्त्र।',
      as: 'বগা সূতা আৰু ৰঙা ফুলৰ বুটা বচা অসমৰ গৌৰৱ আৰু স্নেহৰ প্ৰতীক।',
    },
    culturalSignificance: {
      en: 'Offered as Bihuwan to parents, mentors, and loved ones in mutual respect.',
      hi: 'बड़ों और प्रियजनों को आदरपूर्वक बिहुवान के रूप में दिया जाता है।',
      as: 'বিহুত জ্যেষ্ঠজনক শ্ৰদ্ধা আৰু মৰমৰ প্ৰতীক হিচাপে আগবঢ়োৱা হয়।',
    },
    emoji: '🧣',
    svgType: 'gamusa',
    options: [
      { id: 'opt-1', text: { en: 'Gamusa (Sacred Scarf)', hi: 'गमोसा (पारंपरिक वस्त्र)', as: 'গামোচা' }, isCorrect: true },
      { id: 'opt-2', text: { en: 'Woolen Shawl', hi: 'ऊनी शॉल', as: 'চাদৰ' }, isCorrect: false },
      { id: 'opt-3', text: { en: 'Cotton Tablecloth', hi: 'मेजपोश', as: 'মেজৰ কাপোৰ' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Sari Border', hi: 'साड़ी का पल्लू', as: 'শাড়ীৰ আঁচল' }, isCorrect: false },
    ],
  },
  {
    id: 4,
    name: {
      en: 'Assam Tea Cup (চাহৰ কাপ)',
      hi: 'असम की गरमागरम चाय',
      as: 'এপিয়লা সুগন্ধি অসম চাহ',
      mni: 'চা কাপ',
      ne: 'चियाको कप',
      brx: 'साहा कप',
    },
    category: { en: 'Morning Refreshment', hi: 'दैनिक पेय', as: 'দৈনন্দিন সতেজতা' },
    description: {
      en: 'Freshly brewed aromatic Assam golden milk tea, served hot in a glass or earthenware cup with ginger and cardamom.',
      hi: 'असम के बागानों की ताजी चाय की प्याली, जो ताजगी और सुकून देती है।',
      as: 'চাহ বাগিচাৰ সতেজ সুবাসিত গাখীৰ চাহৰ সুন্দৰ পিয়লা।',
    },
    culturalSignificance: {
      en: 'The heart of morning conversations and warm hospitalities across the North East.',
      hi: 'असमिया घरों में मेहमाननवाजी और सुबह की ताजगी की शुरुआत।',
      as: 'প্ৰতিটো পুৱা আৰু আলহী-অতিথিক আপ্যায়ন কৰাৰ পৰম্পৰাগত ৰীতি।',
    },
    emoji: '☕',
    svgType: 'tea_cup',
    options: [
      { id: 'opt-1', text: { en: 'Cold Juice Glass', hi: 'ठंडे जूस का गिलास', as: 'জুচৰ গিলাচ' }, isCorrect: false },
      { id: 'opt-2', text: { en: 'Warm Assam Tea Cup', hi: 'असम चाय की प्याली', as: 'সুগন্ধি চাহৰ পিয়লা' }, isCorrect: true },
      { id: 'opt-3', text: { en: 'Coffee Mug', hi: 'कॉफी मग', as: 'কফি মগ' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Water Tumbler', hi: 'पानी का लोटा', as: 'পানীৰ গিলাচ' }, isCorrect: false },
    ],
  },
  {
    id: 5,
    name: {
      en: 'Folk Dhol Drum (বিহু ঢোল)',
      hi: 'पारंपरिक बिहू ढोल',
      as: 'বিহুৰ ৰসাল ঢোল',
      mni: 'ঢোলক',
      ne: 'ढोल',
      brx: 'खम (ढोल)',
    },
    category: { en: 'Percussion Drum', hi: 'ताल वाद्य', as: 'তাল বাদ্য' },
    description: {
      en: 'A wooden barrel-shaped two-headed drum struck with a stick on one side and the palm on the other.',
      hi: 'लकड़ी और चमड़े से बना पारंपरिक ढोल जो उत्सव की लय तय करता है।',
      as: 'কাঠ আৰু চামৰাৰে নিৰ্মিত বিহুৰ হৃদয়স্পন্দনস্বৰূপ বাদ্য।',
    },
    culturalSignificance: {
      en: 'The prime rhythmic instrument that commands the steps of the dancers in Bihu.',
      hi: 'बिहू नृत्य में उल्लास और ताल भरने वाला सबसे मुख्य वाद्य।',
      as: 'ঢোলৰ চাবে সমগ্ৰ অসমবাসীক আনন্দ আৰু নৃত্যত মতলীয়া কৰে।',
    },
    emoji: '🥁',
    svgType: 'dhol',
    options: [
      { id: 'opt-1', text: { en: 'Tabla Pair', hi: 'तबला जोड़ी', as: 'তবলা' }, isCorrect: false },
      { id: 'opt-2', text: { en: 'Bihu Dhol (Folk Drum)', hi: 'बिहू ढोल (पारंपरिक वाद्य)', as: 'বিহু ঢোল' }, isCorrect: true },
      { id: 'opt-3', text: { en: 'Conga Drums', hi: 'कांगो ड्रम', as: 'ড্রাম' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Khol / Mridanga', hi: 'खोल (मृदंग)', as: 'খোল' }, isCorrect: false },
    ],
  },
  {
    id: 6,
    name: {
      en: 'Sacred Brass Puja Bell (পূজাৰ ঘণ্টা)',
      hi: 'पारंपरिक पीतल की घंटी',
      as: 'কাঁহৰ মংগল ঘণ্টা',
      mni: 'ঘণ্টা',
      ne: 'पूजाको घण्टी',
      brx: 'घंटा',
    },
    category: { en: 'Temple & Prayer Bell', hi: 'पूजा की घंटी', as: 'মংগল ঘণ্টা' },
    description: {
      en: 'A melodious bell cast from sacred bell metal (Kanh / Bell Metal from Sarthebari), used during morning prayers.',
      hi: 'सरथेबाड़ी के कांस्य व पीतल से बनी सुरीली पूजा घंटी।',
      as: 'সৰ্থেবাৰীৰ কাঁহৰ শিল্পৰে গঢ়া মংগলময় সুৰীয়া ঘণ্টা।',
    },
    culturalSignificance: {
      en: 'Rung to clear negative energies and bring spiritual clarity into the home.',
      hi: 'मन में शांति और पवित्रता का संचार करती है।',
      as: 'ঘৰত আৰু মন্দিৰত প্ৰাৰ্থনা আৰু মনৰ পবিত্ৰতাৰ বাবে বজোৱা হয়।',
    },
    emoji: '🔔',
    svgType: 'bell',
    options: [
      { id: 'opt-1', text: { en: 'Brass Puja Bell', hi: 'पूजा की पीतल घंटी', as: 'কাঁহৰ পূজা ঘণ্টা' }, isCorrect: true },
      { id: 'opt-2', text: { en: 'Telephone Bell', hi: 'टेलीफोन की घंटी', as: 'টেলিফোন' }, isCorrect: false },
      { id: 'opt-3', text: { en: 'Bicycle Bell', hi: 'साइकिल की घंटी', as: 'চাইকেল ঘণ্টা' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Wind Chime', hi: 'हवा की घंटियां', as: 'উইণ্ড চাইম' }, isCorrect: false },
    ],
  },
  {
    id: 7,
    name: {
      en: 'Reading Spectacles / Glasses (চশমা)',
      hi: 'पढ़ने का चश्मा',
      as: 'দৈনন্দিন চশমা',
      mni: 'চশমা',
      ne: 'पढ्ने चश्मा',
      brx: 'चश्मा',
    },
    category: { en: 'Everyday Vision Care', hi: 'दैनिक उपयोग की वस्तु', as: 'দৈনন্দিন ব্যৱহাৰিক বস্তু' },
    description: {
      en: 'A pair of daily reading glasses with clear lenses and comfortable frames, helping to read newspapers and books.',
      hi: 'अखबार और धार्मिक पुस्तकें पढ़ने के लिए रोज काम आने वाला चश्मा।',
      as: 'খবৰ কাগজ, গ্ৰন্থ আৰু বাতৰি পঢ়িবলৈ ব্যৱহাৰ কৰা চশমা।',
    },
    culturalSignificance: {
      en: 'A familiar daily companion for keeping the mind active through literature and news.',
      hi: 'दैनिक दिनचर्या और ज्ञानार्जन का साथी।',
      as: 'জ্ঞান আৰু দৈনিক পাঠৰ এক অপৰিহাৰ্য সংগী।',
    },
    emoji: '👓',
    svgType: 'spectacles',
    options: [
      { id: 'opt-1', text: { en: 'Reading Glasses', hi: 'पढ़ने का चश्मा', as: 'পঢ়া চশমা' }, isCorrect: true },
      { id: 'opt-2', text: { en: 'Magnifying Glass', hi: 'आवर्धक लेंस', as: 'লেন্স' }, isCorrect: false },
      { id: 'opt-3', text: { en: 'Binoculars', hi: 'दूरबीन', as: 'দূৰবীন' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Camera Lens', hi: 'कैमरा लेंस', as: 'কেমেৰা' }, isCorrect: false },
    ],
  },
  {
    id: 8,
    name: {
      en: 'Terracotta Water Pitcher / Kalash (মাটিৰ কলহ)',
      hi: 'मिट्टी का घड़ा / कलश',
      as: 'মাটিৰ শীতল কলহ',
      mni: 'পুখাম',
      ne: 'माटोको घैँटो',
      brx: 'हादनि कलश',
    },
    category: { en: 'Clay Cooling Jug', hi: 'प्राकृतिक जलपात्र', as: 'মাটিৰ পাত্ৰ' },
    description: {
      en: 'Traditional hand-turned clay pot that naturally cools water and imparts a soothing earthen aroma.',
      hi: 'असम के कुम्हारों द्वारा चाक पर बनाया गया प्राकृतिक शीतल जल का घड़ा।',
      as: 'অসমৰ মৃৎশিল্পীসকলে সজা সুশীতল আৰু সুগন্ধি পানীৰ কলহ।',
    },
    culturalSignificance: {
      en: 'Keeps drinking water cool naturally during warm summer afternoons.',
      hi: 'प्राकृतिक रूप से शीतल और स्वास्थ्यवर्धक जल प्रदान करता है।',
      as: 'প্ৰাকৃতিকভাৱে পানী শীতল আৰু স্বাস্থ্যসন্মত কৰি ৰাখে।',
    },
    emoji: '🏺',
    svgType: 'clay_pitcher',
    options: [
      { id: 'opt-1', text: { en: 'Plastic Bottle', hi: 'प्लास्टिक की बोतल', as: 'প্লাষ্টিক বটল' }, isCorrect: false },
      { id: 'opt-2', text: { en: 'Terracotta Water Pitcher (Ghada)', hi: 'मिट्टी का घड़ा / सुराही', as: 'মাটিৰ কলহ' }, isCorrect: true },
      { id: 'opt-3', text: { en: 'Flower Vase', hi: 'फूलदान', as: 'ফুলদানী' }, isCorrect: false },
      { id: 'opt-4', text: { en: 'Cooking Pot', hi: 'खाना बनाने का बर्तन', as: 'কেৰাহী' }, isCorrect: false },
    ],
  },
];

// Guaranteed 100% Offline SVG Illustrator Component
const ObjectSvgIllustration: React.FC<{ type: RecognizableObject['svgType'] }> = ({ type }) => {
  switch (type) {
    case 'jaapi':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Conical Jaapi Hat Base */}
          <polygon points="100,20 20,135 180,135" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />
          {/* Woven Cane Radiating Lines */}
          <line x1="100" y1="20" x2="60" y2="135" stroke="#b45309" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="100" y1="20" x2="100" y2="135" stroke="#b45309" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="100" y1="20" x2="140" y2="135" stroke="#b45309" strokeWidth="2" strokeDasharray="3 2" />
          {/* Red Velvet / Cloth Circular Center Ring */}
          <circle cx="100" cy="85" r="28" fill="#ef4444" stroke="#991b1b" strokeWidth="3" />
          <circle cx="100" cy="85" r="14" fill="#fbbf24" />
          <circle cx="100" cy="85" r="6" fill="#1e293b" />
          {/* Decorative Rim */}
          <ellipse cx="100" cy="135" rx="82" ry="14" fill="#fde68a" stroke="#b45309" strokeWidth="3" />
          <circle cx="65" cy="115" r="7" fill="#ef4444" />
          <circle cx="135" cy="115" r="7" fill="#ef4444" />
        </svg>
      );
    case 'pepa':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Curved Buffalo Horn Body */}
          <path d="M 30,120 Q 80,140 140,80 Q 170,40 180,25 Q 165,25 130,55 Q 85,95 40,95 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          {/* Bamboo Pipe Extension & Finger Holes */}
          <rect x="20" y="105" width="45" height="14" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
          <circle cx="30" cy="112" r="3" fill="#451a03" />
          <circle cx="40" cy="112" r="3" fill="#451a03" />
          <circle cx="50" cy="112" r="3" fill="#451a03" />
          {/* Red decorative ribbons */}
          <path d="M 140,80 Q 150,110 165,130" stroke="#ef4444" strokeWidth="4" fill="none" />
          <path d="M 145,75 Q 160,105 175,125" stroke="#f59e0b" strokeWidth="3" fill="none" />
          {/* Horn Rim flare */}
          <ellipse cx="178" cy="28" rx="8" ry="16" fill="#78350f" stroke="#451a03" strokeWidth="2" transform="rotate(-30 178 28)" />
        </svg>
      );
    case 'gamusa':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* White pristine folded cotton cloth */}
          <rect x="25" y="30" width="150" height="100" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          {/* Left Red Floral Border (Kalka / Phool) */}
          <rect x="35" y="30" width="22" height="100" fill="#fee2e2" />
          <line x1="46" y1="30" x2="46" y2="130" stroke="#ef4444" strokeWidth="3" />
          {/* Floral motifs */}
          <circle cx="46" cy="55" r="5" fill="#dc2626" />
          <circle cx="46" cy="80" r="5" fill="#dc2626" />
          <circle cx="46" cy="105" r="5" fill="#dc2626" />
          {/* Right Red Floral Border */}
          <rect x="143" y="30" width="22" height="100" fill="#fee2e2" />
          <line x1="154" y1="30" x2="154" y2="130" stroke="#ef4444" strokeWidth="3" />
          <circle cx="154" cy="55" r="5" fill="#dc2626" />
          <circle cx="154" cy="80" r="5" fill="#dc2626" />
          <circle cx="154" cy="105" r="5" fill="#dc2626" />
          {/* White fringe threads */}
          <line x1="25" y1="130" x2="25" y2="145" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="30" y1="130" x2="30" y2="145" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="170" y1="130" x2="170" y2="145" stroke="#cbd5e1" strokeWidth="2" />
        </svg>
      );
    case 'tea_cup':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Brass Saucer */}
          <ellipse cx="100" cy="135" rx="65" ry="12" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
          <ellipse cx="100" cy="132" rx="45" ry="8" fill="#f59e0b" />
          {/* Glass Cup Body */}
          <path d="M 65,65 L 75,128 Q 100,135 125,128 L 135,65 Z" fill="#93c5fd" fillOpacity="0.4" stroke="#3b82f6" strokeWidth="3" />
          {/* Steaming Amber Tea Liquid */}
          <path d="M 70,75 L 76,122 Q 100,128 124,122 L 130,75 Z" fill="#d97706" />
          {/* Rising Steam Swirls */}
          <path d="M 85,55 Q 80,40 90,30 Q 95,20 90,12" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 105,52 Q 115,38 108,26 Q 104,18 110,10" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'dhol':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Barrel Dhol Body */}
          <ellipse cx="100" cy="80" rx="70" ry="42" fill="#78350f" stroke="#451a03" strokeWidth="4" />
          {/* Drum Left Head */}
          <ellipse cx="40" cy="80" rx="14" ry="38" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />
          <ellipse cx="40" cy="80" rx="7" ry="20" fill="#1e293b" />
          {/* Drum Right Head */}
          <ellipse cx="160" cy="80" rx="14" ry="38" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />
          <ellipse cx="160" cy="80" rx="6" ry="18" fill="#1e293b" />
          {/* Diagonal Leather Lacing */}
          <line x1="42" y1="50" x2="158" y2="105" stroke="#fbbf24" strokeWidth="2.5" />
          <line x1="42" y1="110" x2="158" y2="55" stroke="#fbbf24" strokeWidth="2.5" />
          <line x1="42" y1="80" x2="158" y2="80" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />
          {/* Wooden Dhol Stick (Doli) */}
          <line x1="165" y1="40" x2="185" y2="25" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Handle */}
          <rect x="94" y="20" width="12" height="45" rx="4" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
          <circle cx="100" cy="20" r="10" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
          {/* Bell Body */}
          <path d="M 85,65 C 80,85 50,110 45,130 L 155,130 C 150,110 120,85 115,65 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
          {/* Rim Flare */}
          <ellipse cx="100" cy="130" rx="56" ry="12" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
          {/* Clapper */}
          <circle cx="100" cy="138" r="8" fill="#78350f" />
        </svg>
      );
    case 'spectacles':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Left Lens Frame */}
          <circle cx="65" cy="80" r="32" fill="#e0f2fe" fillOpacity="0.7" stroke="#0f172a" strokeWidth="4" />
          {/* Right Lens Frame */}
          <circle cx="135" cy="80" r="32" fill="#e0f2fe" fillOpacity="0.7" stroke="#0f172a" strokeWidth="4" />
          {/* Nose Bridge */}
          <path d="M 97,76 Q 100,68 103,76" stroke="#0f172a" strokeWidth="4" fill="none" />
          {/* Temples (Arms) */}
          <path d="M 33,78 Q 20,70 12,65" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 167,78 Q 180,70 188,65" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          {/* Lens reflection glares */}
          <line x1="55" y1="65" x2="68" y2="78" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="125" y1="65" x2="138" y2="78" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'clay_pitcher':
    default:
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-48 drop-shadow-md">
          {/* Terracotta Kalash / Ghada */}
          <circle cx="100" cy="95" r="45" fill="#ea580c" stroke="#9a3412" strokeWidth="3.5" />
          {/* Neck */}
          <path d="M 82,58 L 86,40 L 114,40 L 118,58 Z" fill="#c2410c" stroke="#9a3412" strokeWidth="3" />
          {/* Flared Mouth */}
          <ellipse cx="100" cy="38" rx="20" ry="7" fill="#ea580c" stroke="#9a3412" strokeWidth="2.5" />
          <ellipse cx="100" cy="38" rx="14" ry="4" fill="#7c2d12" />
          {/* Decorative Engraved Rings */}
          <path d="M 68,90 Q 100,105 132,90" stroke="#fed7aa" strokeWidth="3" fill="none" />
          <path d="M 75,108 Q 100,120 125,108" stroke="#fed7aa" strokeWidth="2.5" fill="none" />
        </svg>
      );
  }
};

export const ObjectRecognitionGame: React.FC<ObjectRecognitionGameProps> = ({
  language,
  level,
  patientName = 'Senior',
  onRecordAnswer,
}) => {
  // 4 objects per round
  const QUESTIONS_PER_ROUND = 4;
  const [roundNumber, setRoundNumber] = useState(1);
  const [questionIdxInRound, setQuestionIdxInRound] = useState(0); // 0 to 3
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'answered'>('idle');
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  // Round scores record
  const [roundAnswers, setRoundAnswers] = useState<{
    objectId: number;
    isCorrect: boolean;
    points: number;
  }[]>([]);

  // Pick question based on round and index
  const activePoolIndex = ((roundNumber - 1) * QUESTIONS_PER_ROUND + questionIdxInRound) % OBJECTS_POOL.length;
  const currentObject = OBJECTS_POOL[activePoolIndex];

  const objName = currentObject.name[language] || currentObject.name.en;
  const objCategory = currentObject.category[language] || currentObject.category.en;
  const objDesc = currentObject.description[language] || currentObject.description.en;
  const objSignificance = currentObject.culturalSignificance[language] || currentObject.culturalSignificance.en;

  const correctOption = currentObject.options.find((o) => o.isCorrect);

  // Visible choices based on level
  const visibleOptions = level === 1 
    ? currentObject.options.slice(0, 3) 
    : currentObject.options;

  // Handle user selecting an option
  const handleSelectOption = (optId: string) => {
    if (feedbackState === 'answered') return;

    setSelectedOptionId(optId);
    setFeedbackState('answered');

    const chosen = currentObject.options.find((o) => o.id === optId);
    const isCorrect = chosen ? chosen.isCorrect : false;
    const points = isCorrect ? 10 : 5;

    // Record for round pie chart
    setRoundAnswers((prev) => [
      ...prev,
      { objectId: currentObject.id, isCorrect, points },
    ]);

    if (isCorrect) {
      playSuccessChime();
      const speakMsg = `Excellent identification! That is the ${objName}. ${objDesc}`;
      speakText(speakMsg, language);
    } else {
      playGentleIncorrectSound();
      const speakMsg = `Good try! You earned 5 points. That is the ${correctOption?.text[language] || correctOption?.text.en}. ${objDesc}`;
      speakText(speakMsg, language);
    }

    onRecordAnswer(
      'object-recognition',
      'Object Recognition: Cultural & Daily Items',
      currentObject.id,
      `Identify the shown cultural object: ${objName}`,
      chosen ? (chosen.text[language] || chosen.text.en) : optId,
      correctOption ? (correctOption.text[language] || correctOption.text.en) : '',
      isCorrect
    );
  };

  // Next object or complete round
  const handleNext = () => {
    playGentleTap();
    if (questionIdxInRound + 1 < QUESTIONS_PER_ROUND) {
      setSelectedOptionId(null);
      setFeedbackState('idle');
      setQuestionIdxInRound((prev) => prev + 1);
    } else {
      // Round Complete!
      setIsRoundComplete(true);
    }
  };

  // Play next round
  const handlePlayNextRound = () => {
    playGentleTap();
    setRoundNumber((r) => r + 1);
    setQuestionIdxInRound(0);
    setSelectedOptionId(null);
    setFeedbackState('idle');
    setRoundAnswers([]);
    setIsRoundComplete(false);
  };

  // Read description aloud
  const handleListenObject = () => {
    playGentleTap();
    const voiceText = `Examine this object closely. ${objDesc}. What is it?`;
    speakText(voiceText, language);
  };

  // Calculate round performance
  const correctCount = roundAnswers.filter((a) => a.isCorrect).length;
  const effortCount = roundAnswers.filter((a) => !a.isCorrect).length;
  const scoreEarned = roundAnswers.reduce((sum, a) => sum + a.points, 0);
  const maxPossible = QUESTIONS_PER_ROUND * 10;

  // --------------------------------------------------------------------------
  // ROUND COMPLETE: PIE CHART WITH PERCENTAGE SCORE
  // --------------------------------------------------------------------------
  if (isRoundComplete) {
    return (
      <RoundScorePieChart
        gameTitle="Object Recognition: Cultural & Daily Items"
        roundNumber={roundNumber}
        totalQuestions={QUESTIONS_PER_ROUND}
        correctCount={correctCount}
        effortCount={effortCount}
        scoreEarned={scoreEarned}
        maxScorePossible={maxPossible}
        language={language}
        patientName={patientName}
        onPlayNextRound={handlePlayNextRound}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ACTIVE QUESTION SCREEN
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-4 animate-in fade-in">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                Object Recognition
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Round {roundNumber}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Question {questionIdxInRound + 1} of {QUESTIONS_PER_ROUND} • {objCategory}
            </p>
          </div>
        </div>

        {/* Listen Button & Progress Dots */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleListenObject}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Read description aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Listen</span>
          </button>

          {/* Progress Dots */}
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3].map((idx) => {
              const answered = idx < questionIdxInRound;
              const isCurrent = idx === questionIdxInRound;
              return (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full ${
                    answered
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-amber-500 ring-2 ring-amber-200 animate-pulse'
                      : 'bg-stone-200'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Prominent Object Card with Guaranteed Offline Vector Art */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50/50 via-stone-50 to-white border border-stone-200/80 flex flex-col items-center justify-center space-y-3">
        <div className="w-full max-w-xs flex items-center justify-center py-2">
          <ObjectSvgIllustration type={currentObject.svgType} />
        </div>

        <div className="text-center space-y-1 max-w-md">
          <span className="inline-block px-3 py-0.5 rounded-full bg-white border border-stone-200 text-[11px] font-bold text-stone-600">
            {currentObject.emoji} Daily Heritage Item
          </span>
          <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
            Can you identify this object?
          </h3>
          <p className="text-xs text-stone-500 italic">
            "{objDesc}"
          </p>
        </div>
      </div>

      {/* 4 Interactive Option Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visibleOptions.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let btnStyle = 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800';

          if (feedbackState === 'answered') {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = 'bg-amber-50 border-amber-400 text-amber-950 font-medium';
            } else {
              btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={feedbackState === 'answered'}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0">
                  {opt.id.replace('opt-', '')}
                </span>
                <span className="text-xs sm:text-sm font-black truncate">
                  {opt.text[language] || opt.text.en}
                </span>
              </div>

              {feedbackState === 'answered' && opt.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Next Button */}
      {feedbackState === 'answered' && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="text-left space-y-1">
            <span className="text-xs font-black text-stone-900 block">
              {currentObject.options.find((o) => o.id === selectedOptionId)?.isCorrect
                ? '🎉 Correct identification! (+10 pts)'
                : `💡 Good try! (+5 effort pts) This is the ${correctOption?.text[language] || correctOption?.text.en}.`}
            </span>
            <p className="text-xs text-stone-600">
              {objSignificance}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <span>
              {questionIdxInRound + 1 < QUESTIONS_PER_ROUND ? 'Next Object' : 'Complete Round & See Rating'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
