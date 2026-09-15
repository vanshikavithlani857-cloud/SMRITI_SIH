import React, { useState } from 'react';
import { 
  Clock, 
  Volume2, 
  CheckCircle2, 
  ShieldCheck, 
  Droplet, 
  Pill, 
  Wind, 
  Image as ImageIcon, 
  Coffee, 
  Footprints, 
  PhoneCall, 
  Armchair, 
  Sparkles, 
  Plus, 
  Smile,
  Check
} from 'lucide-react';
import { Language, RecentAction, RecentActionType } from '../types';
import { getDashboardI18n } from '../i18n/dashboardTranslations';
import { playGentleTap, playSuccessChime, speakText } from '../utils/audio';

interface RecentMemoryRecallProps {
  language: Language;
  patientName: string;
  caregiverName?: string;
  recentActions: RecentAction[];
  onAddAction?: (action: Omit<RecentAction, 'id' | 'timestamp'>) => void;
  isCompactView?: boolean;
}

export const RecentMemoryRecall: React.FC<RecentMemoryRecallProps> = ({
  language,
  patientName,
  caregiverName = 'Caregiver',
  recentActions,
  onAddAction,
  isCompactView = false,
}) => {
  const t = getDashboardI18n(language);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [justAddedType, setJustAddedType] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to get localized title and description for an action
  const getActionTexts = (action: RecentAction) => {
    if (action.translations && action.translations[language]) {
      return {
        title: action.translations[language]!.title,
        description: action.translations[language]!.description,
      };
    }

    // Default translations based on action type for all 10 languages
    const typeKey = action.type;
    const localizedMap: Record<RecentActionType, Record<string, { title: string; desc: string }>> = {
      water: {
        hi: { title: '१ गिलास ताज़ा पानी पिया', desc: 'शरीर में पानी की मात्रा और ताज़गी बनी हुई है।' },
        gu: { title: '૧ ગ્લાસ તાજું પાણી પીધું', desc: 'શરીરમાં પાણીનું પ્રમાણ અને તાજગી જળવાઈ છે.' },
        mr: { title: '१ ग्लास ताजे पाणी प्यायलो', desc: 'शरीराला आवश्यक ताजेतवाने पाणी मिळाले आहे.' },
        bn: { title: '১ গ্লাস টাটকা জল খেলাম', desc: 'শরীর সুস্থ ও সতেজ রাখতে জল পান করেছেন।' },
        ta: { title: '1 டம்ளர் தண்ணீர் குடித்தேன்', desc: 'உடல் புத்துணர்ச்சியுடன் இருக்க தண்ணீர் அருந்தப்பட்டது.' },
        as: { title: '১ গিলাচ বিশুদ্ধ পানী খালোঁ', desc: 'শৰীৰ সতেজ ৰাখিবলৈ নিয়মমতে পানী খালে।' },
        mni: { title: 'ঈশিং গ্লাস ১ থক্লে', desc: 'হকচাং ফনা লৈনবা ঈশিং থকপগী থবক লোইরে।' },
        ne: { title: '१ गिलास ताजा पानी पिएँ', desc: 'शरीरलाई स्फूर्ति दिन पानी पिउनुभयो।' },
        brx: { title: 'दै गिलास १ लोंबाय', desc: 'गोसो आरो देहा मोजां थाहोनो दै लोंबाय।' },
        en: { title: 'Drank 1 glass of fresh water', desc: 'Good hydration and body refresh maintained.' },
      },
      medication: {
        hi: { title: 'समय पर निर्धारित दवाई ली', desc: `दवाई समय पर ली गई है। सब कुछ नियंत्रण में है।` },
        gu: { title: 'સમયસર નિયમિત દવા લીધી', desc: 'બધી દવાઓ બરાબર સમયે લેવાઈ ગઈ છે.' },
        mr: { title: 'वेळेवर नियमित औषध घेतले', desc: 'सर्व औषधे वेळेवर घेतली गेली आहेत.' },
        bn: { title: 'সময়মতো নির্ধারিত ওষুধ নেওয়া হয়েছে', desc: 'আপনার সমস্ত ওষুধ সঠিক সময়ে খাওয়া হয়েছে।' },
        ta: { title: 'மருந்து சரியான நேரத்தில் உட்கொள்ளப்பட்டது', desc: 'மருந்து அட்டவணைப்படி எடுக்கப்பட்டது.' },
        as: { title: 'সময়মতে নিৰ্ধাৰিত ঔষধ খালে', desc: 'আপোনাৰ ঔষধ নিয়মমতে লোৱা হ’ল।' },
        mni: { title: 'মতম চানা হিদাক চারে', desc: 'হিদাক পুম্নমক মতম চানা চাবা লোইরে।' },
        ne: { title: 'समयमै नियमित औषधि लिनुभयो', desc: 'औषधि सही तालिका अनुसार लिइयो।' },
        brx: { title: 'समाव मुलि लोंबाय', desc: 'मुलिखौ मोजां समावनो लोंनाय जाबाय।' },
        en: { title: 'Took prescribed medication on schedule', desc: 'Medication routine successfully maintained.' },
      },
      breathing: {
        hi: { title: '३ मिनट गहरी और शांत सांस ली', desc: 'मन और हृदय बिल्कुल शांत और तनावमुक्त हैं।' },
        gu: { title: '૩ મિનિટ શાંત અને ઊંડા શ્વાસ લીધા', desc: 'મન અને હૃદય સંપૂર્ણપણે શાંત અને રાહત અનુભવે છે.' },
        mr: { title: '३ मिनिटे खोल आणि शांत श्वास घेतला', desc: 'मन आणि हृदय पूर्णपणे शांत झाले आहे.' },
        bn: { title: '৩ মিনিট গভীর শ্বাস-প্রশ্বাস নিয়েছেন', desc: 'মন ও শরীর শান্ত এবং উদ্বেগহীন আছে।' },
        ta: { title: '3 நிமிடங்கள் அமைதியான ஆழ்ந்த மூச்சுப்பயிற்சி', desc: 'மனம் மற்றும் உடல் அமைதியாக உள்ளது.' },
        as: { title: '৩ মিনিট গভীৰভাৱে শান্ত উশাহ ল’লে', desc: 'মন আৰু শৰীৰ সম্পূৰ্ণ শান্ত অৱস্থাত আছে।' },
        mni: { title: 'মিনিট ৩ তন্থাবা ইথক হোনখ্রে', desc: 'ৱাখল অমসুং হকচাং তন্থানা লৈরে।' },
        ne: { title: '३ मिनेट गहिरो र शान्त सास फेर्नुभयो', desc: 'मन र शरीर पूर्ण शान्त भएको छ।' },
        brx: { title: 'मिनिट ३ गोसो गोजोन हासा लोंबाय', desc: 'गोसोआ गोजोन आरो रैखाथि गोनां जाबाय।' },
        en: { title: 'Completed 3 minutes of calm deep breathing', desc: 'Heart rate and emotions settled peacefully.' },
      },
      photo: {
        hi: { title: 'परिवार की पुरानी यादें और तस्वीरें देखीं', desc: 'प्रियजनों के चेहरे देखकर मन में बहुत प्रसन्नता आई।' },
        gu: { title: 'પરિવારની જૂની યાદો અને તસવીરો જોઈ', desc: 'સ્નેહીજનોના ફોટા જોઈને આનંદ થયો.' },
        mr: { title: 'कुटुंबाच्या जुन्या आठवणी आणि फोटो पाहिले', desc: 'आपल्या माणसांचे फोटो पाहून आनंद वाटला.' },
        bn: { title: 'পরিবারের প্রিয় স্মৃতি ও ছবি দেখলেন', desc: 'আপনজনদের ছবি দেখে মন ভালো হলো।' },
        ta: { title: 'குடும்ப நினைவுகளையும் புகைப்படங்களையும் பார்த்தீர்கள்', desc: 'அன்புக்குரியவர்களின் படங்களை கண்டு மகிழ்ந்தீர்கள்.' },
        as: { title: 'পৰিয়ালৰ পুৰণি ফটো আৰু স্মৃতি চালে', desc: 'আপোন মানুহৰ মৰমৰ ছবি চাই আনন্দ পালে।' },
        mni: { title: 'ইমুংগী নুংশিবা ফোটো য়েংখ্রে', desc: 'নুংশিবা মীওইশিংগী ফোটো য়েংদুনা হরাওরে।' },
        ne: { title: 'परिवारको पुराना सम्झना र तस्बिर हेर्नुभयो', desc: 'आफ्ना मान्छेहरूको तस्बिर देखेर खुसी लाग्यो।' },
        brx: { title: 'नख’रनि गोजाम फटो आरो गोसोखां नायबाय', desc: 'अनजालु मानसिफोरनि फटो नायनानै खुसि जाबाय।' },
        en: { title: 'Looked at cherished family memory photos', desc: 'Felt warm comfort seeing loving family members.' },
      },
      tea: {
        hi: { title: 'गरमा-गरम चाय और हल्का नाश्ता किया', desc: 'बैठकर आराम से चाय की चुस्कियां लीं।' },
        gu: { title: 'ગરમાગરમ ચા અને હળવો નાસ્તો કર્યો', desc: 'બેસીને શાંતિથી ચા અને નાસ્તો માણ્યો.' },
        mr: { title: 'गरम चहा आणि हलका नाश्ता केला', desc: 'शांतपणे बसून चहा घेतला.' },
        bn: { title: 'গরম চা এবং হালকা জলখাবার খেলেন', desc: 'বসে আরামে গরম চা উপভোগ করেছেন।' },
        ta: { title: 'சூடான தேநீர் மற்றும் காலை உணவு அருந்தப்பட்டது', desc: 'அமைதியாக அமர்ந்து தேநீர் குடித்தீர்கள்.' },
        as: { title: 'গৰম চাহ আৰু পাতল জলপান খালে', desc: 'আৰামত বহি চাহৰ সোৱাদ ল’লে।' },
        mni: { title: 'চা অমসুং চিঞ্জাক চারম্মি', desc: 'শান্তিনা ফমদুনা চা থকখ্রে।' },
        ne: { title: 'तातो चिया र हल्का खाजा खानुभयो', desc: 'आरामसँग बसेर चिया पिउनुभयो।' },
        brx: { title: 'गुदुं सा आरो नास्ता लोंबाय', desc: 'गोजोनै जिरायनानै सा लोंबाय।' },
        en: { title: 'Enjoyed warm tea and light refreshment', desc: 'Sat down peacefully and enjoyed a warm beverage.' },
      },
      walk: {
        hi: { title: 'बगीचे/बालकनी में १० मिनट टहले', desc: 'ताज़ी हवा में हल्का कदमताल किया, शरीर में फुर्ती आई।' },
        gu: { title: 'બગીચા/બાલ્કનીમાં ૧૦ મિનિટ ચાલ્યા', desc: 'તાજી હવામાં ચાલ્યા અને શરીરમાં સ્ફૂર્તિ આવી.' },
        mr: { title: 'बागेत/गॅलरीत १० मिनिटे फेरफटका मारला', desc: 'ताज्या हवेत थोडे चालल्याने छान वाटले.' },
        bn: { title: 'বাগানে বা বারান্দায় ১০ মিনিট হেঁটেছেন', desc: 'টাটকা বাতাসে মৃদু হাঁটার ফলে শরীর ভালো লাগছে।' },
        ta: { title: 'தோட்டத்தில்/பால்கனியில் 10 நிமிடங்கள் நடந்தீர்கள்', desc: 'புதிய காற்றில் மெதுவாக நடைப்பயிற்சி செய்தீர்கள்.' },
        as: { title: 'ফুলনি বা বাৰান্দাত ১০ মিনিট খোজ কাঢ়িলে', desc: 'মুকলি বতাহত খোজ কাঢ়ি গাটো পাতল লাগিল।' },
        mni: { title: 'লৈকোলদা মিনিট ১০ চৎলম্মি', desc: 'নুংশিবা নোংথক্তা খোঙ চৎতুনা হকচাং ফখ্রে।' },
        ne: { title: 'बगैंचा वा कौसीमा १० मिनेट टहलिनुभयो', desc: 'ताजा हावामा हिँडेर शरीर हलुका भयो।' },
        brx: { title: 'बारियाव मिनिट १० सालायबाय', desc: 'बार गोनां जायगायाव सालायनानै देहा मोजां जाबाय।' },
        en: { title: 'Strolled 10 minutes in the garden/balcony', desc: 'Enjoyed fresh air and gentle movement.' },
      },
      family: {
        hi: { title: `देखभालकर्ता ${caregiverName} से बात की`, desc: 'परिवार के साथ प्रेमपूर्वक बातचीत हुई और कुशलक्षेम जाना।' },
        gu: { title: `સંભાળ રાખનાર ${caregiverName} સાથે વાત કરી`, desc: 'પરિવાર સાથે સ્નેહપૂર્વક વાતચીત થઈ.' },
        mr: { title: `काळजीवाहू ${caregiverName} यांच्याशी संवाद साधला`, desc: 'कुटुंबाशी प्रेमाने संवाद झाला.' },
        bn: { title: `যত্নকারী ${caregiverName}-এর সাথে কথা বললেন`, desc: 'পরিবারের সাথে স্নেহভরা কথা হয়েছে।' },
        ta: { title: `பராமரிப்பாளர் ${caregiverName} உடன் பேசினீர்கள்`, desc: 'குடும்பத்தினருடன் பாசமாக உரையாடினீர்கள்.' },
        as: { title: `যত্নলওঁতা ${caregiverName}ৰ লগত কথা পাতিলে`, desc: 'পৰিয়ালৰ সৈতে মৰমৰে কথা-বতৰা হ’ল।' },
        mni: { title: `য়েংশিনবীবা ${caregiverName}গা ৱারী শানম্মি`, desc: 'ইমুংগা নুংশিনা ৱারী শানখ্রে।' },
        ne: { title: `हेरचाहकर्ता ${caregiverName}सँग कुरा गर्नुभयो`, desc: 'परिवारसँग मायालु कुराकानी भयो।' },
        brx: { title: `हेरचाहगिरि ${caregiverName} जों रायलायबाय`, desc: 'नख’रनि मानसिजों अननायजों रायलायनाय जाबाय।' },
        en: { title: `Spoke with caregiver ${caregiverName}`, desc: 'Had a warm, loving conversation with family.' },
      },
      rest: {
        hi: { title: 'सोफे पर आराम से विश्राम किया', desc: 'बैठक में तकिये के सहारे आंखें मूंदकर विश्राम किया।' },
        gu: { title: 'સોફા પર આરામથી વિશ્રામ કર્યો', desc: 'બેઠક રૂમમાં શાંતિથી આંખો બંધ કરીને આરામ કર્યો.' },
        mr: { title: 'सोफ्यावर शांतपणे विश्रांती घेतली', desc: 'हॉलमध्ये बसून डोळे मिटून विश्रांती घेतली.' },
        bn: { title: 'সোফায় বসে আরামে বিশ্রাম নিয়েছেন', desc: 'ঘরে চোখ বন্ধ করে আরামদায়ক বিশ্রাম করেছেন।' },
        ta: { title: 'சோபாவில் சாய்ந்து அமைதியாக ஓய்வெடுத்தீர்கள்', desc: 'கண்களை மூடி நிம்மதியாக ஓய்வெடுத்தீர்கள்.' },
        as: { title: 'চ’ফাত আৰামত জিৰণি ল’লে', desc: 'কোঠাত চকু মুদি শান্তভাৱে জিৰণি ল’লে।' },
        mni: { title: 'শাফাদা ফমদুনা পোথারি', desc: 'মীত কাপতুনা শান্তিনা পোথারম্মি।' },
        ne: { title: 'सोफामा आरामसँग बस्नुभयो', desc: 'कोठामा आँखा चिम्लेर शान्तसँग विश्राम गर्नुभयो।' },
        brx: { title: 'सफायाव गोजोनै जिरायबाय', desc: 'न’आव मेगन ख्रेबनानै जिरायनाय जाबाय।' },
        en: { title: 'Rested comfortably on the sofa', desc: 'Closed eyes and relaxed peacefully in the living room.' },
      },
      wash: {
        hi: { title: 'हाथ और मुंह धोकर तरोताज़ा हुए', desc: 'गुनगुने पानी से हाथ-मुंह धोया और साफ तौलिए से पोंछा।' },
        gu: { title: 'હાથ અને મોં ધોઈને તાજગી અનુભવી', desc: 'હૂંફાળા પાણીથી હાથ-મોં ધોયા અને સ્વચ્છ થયા.' },
        mr: { title: 'हात-तोंड धुऊन ताजेतवाने झालात', desc: 'स्वच्छ पाण्याने हात-तोंड धुतले.' },
        bn: { title: 'হাত-মুখ ধুয়ে সতেজ হলেন', desc: 'পরিস্কার জলে হাত-মুখ ধুয়ে ফ্রেশ হয়েছেন।' },
        ta: { title: 'கை மற்றும் முகம் கழுவி புத்துணர்ச்சி அடைந்தீர்கள்', desc: 'சுத்தமான நீரில் முகம் கழுவி புத்துணர்வு பெற்றீர்கள்.' },
        as: { title: 'হাত-মুখ ধুই সতেজ হ’লে', desc: 'পানীৰে হাত-মুখ ধুই গা জুৰালে।' },
        mni: { title: 'খুৎ অমসুং মাই হামদোক্লে', desc: 'ঈশিংনা খুৎ-মাই হামদুনা শেংদোক্লে।' },
        ne: { title: 'हात-मुख धोएर ताजा हुनुभयो', desc: 'सफा पानीले हात-मुख धुनुभयो।' },
        brx: { title: 'आखाय-मुख सुनानै गोजोन मोनबाय', desc: 'मोजां दैजों आखाय-मुख सुबाय।' },
        en: { title: 'Washed hands and face, feeling refreshed', desc: 'Washed with fresh water and wiped clean.' },
      },
      mood: {
        hi: { title: 'दैनिक मनोदशा दर्ज की', desc: 'आज के भाव और मन की स्थिति दर्ज हुई।' },
        gu: { title: 'મૂડ અને મનોભાવ નોંધાયો', desc: 'આજના મનની સ્થિતિ બરાબર છે.' },
        mr: { title: 'मनाची स्थिती नोंदवली', desc: 'आजचे विचार आणि मन शांत आहे.' },
        bn: { title: 'মনের ভাব ও অনুভূতি লিপিবদ্ধ হলো', desc: 'মন শান্ত ও সুস্থির রয়েছে।' },
        ta: { title: 'மனநிலை பதிவு செய்யப்பட்டது', desc: 'மனநிலை சீராக உள்ளது.' },
        as: { title: 'মনৰ অৱস্থা লিপিবদ্ধ কৰা হ’ল', desc: 'মন শান্ত অৱস্থাত আছে।' },
        mni: { title: 'ৱাখলগী ফিভম ইরে', desc: 'ৱাখল ফনা লৈরি।' },
        ne: { title: 'मनको स्थिति दर्ता गरियो', desc: 'मन स्थिर र शान्त छ।' },
        brx: { title: 'गोसोनि थासारिखौ लिरबाय', desc: 'गोसोआ मोजाङै दं।' },
        en: { title: 'Checked in daily mood and emotions', desc: 'Emotional state recorded peacefully.' },
      },
    };

    const mapping = localizedMap[typeKey] || localizedMap.water;
    const item = mapping[language] || mapping.en;
    return {
      title: item.title,
      description: item.desc,
    };
  };

  const getActionIcon = (type: RecentActionType) => {
    switch (type) {
      case 'water':
        return <Droplet className="w-4 h-4 text-cyan-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'breathing':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'photo':
        return <ImageIcon className="w-4 h-4 text-amber-600" />;
      case 'tea':
        return <Coffee className="w-4 h-4 text-orange-600" />;
      case 'walk':
        return <Footprints className="w-4 h-4 text-emerald-700" />;
      case 'family':
        return <PhoneCall className="w-4 h-4 text-blue-600" />;
      case 'rest':
        return <Armchair className="w-4 h-4 text-purple-600" />;
      case 'wash':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'mood':
        return <Smile className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-stone-600" />;
    }
  };

  const formatRelativeTime = (mins: number) => {
    if (mins <= 2) return t.justNowTag;
    if (mins < 60) return `${mins} ${t.minsAgoTag}`;
    const hours = Math.floor(mins / 60);
    return `${hours} ${t.hoursAgoTag}`;
  };

  const handleSpeakRecentAloud = () => {
    playGentleTap();
    setIsSpeaking(true);

    // Build empathetic, warm speech in the chosen language
    const reassurancePrefix = language === 'hi'
      ? `घबराइए नहीं ${patientName} जी, आप अपने घर पर बिल्कुल सुरक्षित हैं। `
      : language === 'gu'
      ? `ચિંતા ન કરો ${patientName} ભાઈ/બેન, તમે ઘરમાં પરિવાર સાથે સુરક્ષિત છો. `
      : language === 'mr'
      ? `काळजी करू नका ${patientName}, तुम्ही स्वतःच्या घरात सुरक्षित आहात. `
      : language === 'bn'
      ? `ভয় পাবেন না ${patientName}, আপনি নিজের বাড়িতে নিরাপদে আছেন। `
      : language === 'ta'
      ? `பயப்பட வேண்டாம் ${patientName}, நீங்கள் வீட்டில் நலமாக உள்ளீர்கள். `
      : language === 'as'
      ? `চিন্তা নকৰিব ${patientName}, আপুনি ঘৰতে সুৰক্ষিত আছে। `
      : language === 'mni'
      ? `কিগনু ${patientName}, নহাক য়ুমদা শেফ ওইনা লৈরি। `
      : language === 'ne'
      ? `चिन्ता नगर्नुहोस् ${patientName}, तपाईं घरमा सुरक्षित हुनुहुन्छ। `
      : language === 'brx'
      ? `गिनाङा ${patientName}, नोंथाङा न'आव मोजाङै दं। `
      : `Do not worry ${patientName}, you are completely safe at home. `;

    const topActions = recentActions.slice(0, 4);
    const actionsSpeech = topActions.map((act) => {
      const texts = getActionTexts(act);
      const timeStr = act.minutesAgo <= 2 ? t.justNowTag : `${act.minutesAgo} ${t.minsAgoTag}`;
      return `${timeStr}: ${texts.title}।`;
    }).join(' ');

    const fullSpeech = `${reassurancePrefix} पिछले कुछ मिनटों में आपने यह किया: ${actionsSpeech} सब कुछ ठीक है, आराम से रहिए।`;

    speakText(fullSpeech, language, () => {
      setIsSpeaking(false);
    });
  };

  const handleQuickAdd = (type: RecentActionType, defaultTitle: string) => {
    playGentleTap();
    playSuccessChime();
    setJustAddedType(type);
    setTimeout(() => setJustAddedType(null), 1800);

    if (onAddAction) {
      onAddAction({
        minutesAgo: 1,
        type,
        title: defaultTitle,
        description: 'Recorded by patient',
      });
    }
  };

  return (
    <div className="bg-[#FAF7F0] rounded-2xl border-2 border-[#E0D7C6] shadow-xs p-3 sm:p-4 space-y-3 animate-in fade-in duration-200">
      
      {/* Sleek Reassurance & 2-3 Min Recall Bar */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs shrink-0 border border-emerald-900">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-emerald-950 leading-tight truncate">
                {t.reassuranceSafeTitle}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                2-3 Min Recall
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 truncate mt-0.5 font-semibold">
              {recentActions.length > 0 
                ? `⏱️ ${formatRelativeTime(recentActions[0].minutesAgo)}: ${getActionTexts(recentActions[0]).title}`
                : t.reassuranceSafeText}
            </p>
          </div>
        </div>

        {/* Listen Button & Details Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="listen-recent-activity-btn"
            onClick={handleSpeakRecentAloud}
            disabled={isSpeaking}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs cursor-pointer border border-emerald-800"
            title="Listen aloud to recent memory"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span className="hidden xs:inline">{isSpeaking ? t.speakingRecentText : t.listenRecentAloudBtn}</span>
            <span className="xs:hidden">{isSpeaking ? '...' : 'Listen'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 text-xs font-black text-emerald-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer"
            title="Toggle recent activity timeline"
          >
            {isExpanded ? '▲' : `▼ ${recentActions.length}`}
          </button>
        </div>
      </div>

      {/* EXPANDABLE SECTION: TIMELINE & QUICK ACTIONS */}
      {isExpanded && (
        <div className="space-y-2 pt-1 border-t border-emerald-100 animate-in fade-in duration-200">
          {/* TIMELINE OF RECENT ACTIONS (2-5 MINS AGO) */}
          <div className="space-y-1.5">
            {recentActions.length === 0 ? (
              <div className="p-3 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
                {t.emptyRecentActivity}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {recentActions.slice(0, 6).map((act) => {
                  const texts = getActionTexts(act);
                  const isVeryRecent = act.minutesAgo <= 3;

                  return (
                    <div 
                      key={act.id}
                      className={`p-2 rounded-lg border transition-all flex items-start space-x-2 ${
                        isVeryRecent 
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/40 shadow-xs' 
                          : 'bg-stone-50/80 border-stone-200'
                      }`}
                    >
                      <div className={`p-1 rounded-md shrink-0 mt-0.5 ${
                        isVeryRecent ? 'bg-amber-200 text-amber-900' : 'bg-white border border-stone-200'
                      }`}>
                        {getActionIcon(act.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            isVeryRecent 
                              ? 'bg-amber-200/90 text-amber-950' 
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            ⏱️ {formatRelativeTime(act.minutesAgo)}
                          </span>
                          <span className="text-[9px] text-stone-400 font-bold">{act.timestamp}</span>
                        </div>

                        <h4 className="text-xs font-black text-stone-900 leading-tight">
                          {texts.title}
                        </h4>
                        <p className="text-[10px] text-stone-600 line-clamp-1 leading-snug mt-0.5">
                          {texts.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* QUICK ACTIONS: "WHAT DID YOU JUST DO?" (ONE-TAP LOGGING FOR PATIENT OR CAREGIVER) */}
          <div className="pt-1 border-t border-stone-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">
                {t.quickLogActivityTitle}
              </span>
              {justAddedType && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-fade-in">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>दर्ज हुआ / Recorded!</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleQuickAdd('water', 'Drank Water')}
                className="flex items-center space-x-1 px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-md text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.quickWaterBtn}</span>
              </button>

              <button
                onClick={() => handleQuickAdd('tea', 'Had Tea/Snack')}
                className="flex items-center space-x-1 px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 rounded-md text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.quickTeaBtn}</span>
              </button>

              <button
                onClick={() => handleQuickAdd('walk', 'Garden Walk')}
                className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.quickWalkBtn}</span>
              </button>

              <button
                onClick={() => handleQuickAdd('rest', 'Rested on Sofa')}
                className="flex items-center space-x-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-md text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.quickRestBtn}</span>
              </button>

              <button
                onClick={() => handleQuickAdd('family', 'Talked to Family')}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-md text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.quickFamilyBtn}</span>
              </button>

              <button
                onClick={() => handleQuickAdd('wash', 'Washed Hands')}
                className="flex items-center space-x-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-md text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.quickWashBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
