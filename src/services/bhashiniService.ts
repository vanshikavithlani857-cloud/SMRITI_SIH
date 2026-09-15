import { Language, MemoryPhoto } from '../types';

/**
 * Bhashini Indic Eldercare Translation & Language Engine (Offline-First)
 * Grounded in the National Language Translation Mission (NLTM - Project Bhashini / AI4Bharat)
 * Supporting 10 Indic languages with authentic vocabulary, familial honorifics, and empathetic tone.
 */

export interface BhashiniPhotoData {
  title: string;
  relation: string;
  memoryNote: string;
  spokenNarration: string;
}

export interface BhashiniPreset {
  id: string;
  url: string;
  translations: Record<string, {
    title: string;
    relation: string;
    note: string;
  }>;
}

// 1. Comprehensive Kinship & Familial Relationship Matrix
export const BHASHINI_RELATIONS: Record<string, Record<string, string>> = {
  'granddaughter': {
    en: 'Granddaughter',
    hi: 'पोती / नातिन',
    gu: 'પૌત્રી / દોહિત્રી',
    mr: 'नात',
    bn: 'নাতনি',
    ta: 'பேத்தி',
    as: 'নাতিনী',
    mni: 'ইশু নুপী',
    ne: 'नातिनी',
    brx: 'उनदै हिनजाव (नातिनी)',
  },
  'grandson': {
    en: 'Grandson',
    hi: 'पोता / नाती',
    gu: 'પૌત્ર / દોહિત્ર',
    mr: 'नातु',
    bn: 'নাতি',
    ta: 'பேரன்',
    as: 'নাতি',
    mni: 'ইশু নুপা',
    ne: 'नाति',
    brx: 'उनदै हौवा (नाति)',
  },
  'daughter': {
    en: 'Daughter',
    hi: 'बेटी / पुत्री',
    gu: 'દીકરી / સુપુત્રી',
    mr: 'मुलगी / कन्या',
    bn: 'মেয়ে / কন্যা',
    ta: 'மகள்',
    as: 'জীয়াৰী',
    mni: 'মচা নুপী',
    ne: 'छोरी',
    brx: 'फिसा हिनजाव',
  },
  'son': {
    en: 'Son',
    hi: 'बेटा / पुत्र',
    gu: 'દીકરો / સુપુત્ર',
    mr: 'मुलगा / चिरंजीव',
    bn: 'ছেলে / পুত্র',
    ta: 'மகன்',
    as: 'পুত্ৰ',
    mni: 'মচা নুপা',
    ne: 'छोरा',
    brx: 'फिसा हौवा',
  },
  'entire family': {
    en: 'Entire Family',
    hi: 'पूरा परिवार',
    gu: 'સમગ્ર પરિવાર',
    mr: 'संपूर्ण कुटुंब',
    bn: 'গোটা পরিবার',
    ta: 'முழு குடும்பம்',
    as: 'সমগ্র পৰিয়াল',
    mni: 'ইমুং মনুং পুম্নমক',
    ne: 'सम्पूर्ण परिवार',
    brx: 'गासै नखर',
  },
  'spouse': {
    en: 'Spouse / Life Partner',
    hi: 'जीवनसाथी (धर्मपत्नी/पति)',
    gu: 'જીવનસાથી (પત્ની/પતિ)',
    mr: 'जोडीदार (पत्नी/पती)',
    bn: 'জীবনসঙ্গী',
    ta: 'மனைவி / கணவர்',
    as: 'জীৱনসংগী',
    mni: 'নুপি / মপুরোয়বা',
    ne: 'जीवनसाथी',
    brx: 'बिसि / गोहो',
  },
  'sister': {
    en: 'Sister',
    hi: 'बहन / दीदी',
    gu: 'બહેન / મોટી બહેન',
    mr: 'बहीण / ताई',
    bn: 'বোন / দিদি',
    ta: 'சகோதரி / அக்கா',
    as: 'ভনী / বায়েক',
    mni: 'ইচেল / ইচল',
    ne: 'बहिनी / दिदी',
    brx: 'बिनानाव / आदा',
  },
  'brother': {
    en: 'Brother',
    hi: 'भाई / भइया',
    gu: 'ભાઈ / મોટા ભાઈ',
    mr: 'भाऊ / दादा',
    bn: 'ভাই / দাদা',
    ta: 'சகோதரன் / அண்ணன்',
    as: 'ভাই / ককায়েক',
    mni: 'ইনাও / ইবুংগো',
    ne: 'भाइ / दाजु',
    brx: 'बिदा / फंबाय',
  },
  'caregiver': {
    en: 'Caregiver (Sahayak)',
    hi: 'देखभालकर्ता (सहायक)',
    gu: 'સંભાળ રાખનાર (સહાયક)',
    mr: 'काळजीवाहक (सहाय्यक)',
    bn: 'পরিচর্যাকারী (সহায়ক)',
    ta: 'பராமரிப்பாளர் (சஹாயக்)',
    as: 'সেৱা আৰু সহায়ক',
    mni: 'মতেং পাংবা সহায়ক',
    ne: 'हेरचाहकर्ता (सहायक)',
    brx: 'हेफाजाबगिरि (सहायक)',
  },
  'spiritual': {
    en: 'Spiritual Pilgrimage',
    hi: 'तीर्थ यात्रा एवं सत्संग',
    gu: 'તીર્થ યાત્રા અને સત્સંગ',
    mr: 'तीर्थयात्रा व ध्यान',
    bn: 'তীর্থযাত্রা ও প্রার্থনা',
    ta: 'ஆன்மீக யாத்திரை',
    as: 'তীৰ্থ ভ্ৰমণ আৰু প্ৰাৰ্থনা',
    mni: 'লাই খোইরম চৎপা',
    ne: 'तीर्थ यात्रा एवं भजन',
    brx: 'ईस्वर पुजा आरो तीर्थ',
  },
  'friends': {
    en: 'Childhood Friends',
    hi: 'बचपन के मित्र',
    gu: 'બાળપણના મિત્રો',
    mr: 'बालपणीचे मित्र',
    bn: 'শৈশবের বন্ধু',
    ta: 'சிறுவயது நண்பர்கள்',
    as: 'বাল্যকালৰ বন্ধু',
    mni: 'অঙাং ওইরিঙৈগী মরুপ',
    ne: 'बाल्यकालका साथीहरू',
    brx: 'उन्दै समाव लोगो',
  },
};

// 2. High-Quality Preset Memories Localized in All 10 Languages
export const BHASHINI_PHOTO_PRESETS: BhashiniPreset[] = [
  {
    id: 'preset-1',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    translations: {
      en: {
        title: 'Ananya & Grandfather at Green Park',
        relation: 'Granddaughter Ananya',
        note: 'Ananya made you laugh with pure joy under the old mango tree.',
      },
      hi: {
        title: 'अनन्या और दादाजी की हरी-भरी दोपहर',
        relation: 'पोती अनन्या',
        note: 'अनन्या ने आम के पुराने पेड़ के नीचे आपको दिल खोलकर हँसाया।',
      },
      gu: {
        title: 'અનન્યા અને દાદાજીની બગીચામાં હાસ્યભરી ક્ષણ',
        relation: 'પૌત્રી અનન્યા',
        note: 'આંબાના ઘટાદાર ઝાડ નીચે અનન્યાએ તમારી સાથે ખૂબ નિર્દોષ મસ્તી કરી હતી.',
      },
      mr: {
        title: 'अनन्या आणि आजोबांची बागेतील आनंददायी भेट',
        relation: 'नात अनन्या',
        note: 'मोठ्या आंब्याच्या झाडाखाली अनन्याने तुम्हाला मनापासून हसविले होते.',
      },
      bn: {
        title: 'সবুজ পার্কে অনন্যা ও দাদু',
        relation: 'নাতনি অনন্যা',
        note: 'পুরোনো আমগাছের তলায় অনন্যা আপনাকে অফুরন্ত খুশিতে ভরিয়ে দিয়েছিল।',
      },
      ta: {
        title: 'பூங்காவில் அனன்யா மற்றும் தாத்தாவின் மகிழ்ச்சி',
        relation: 'பேத்தி அனன்யா',
        note: 'பெரிய மாமரத்தடியில் அனன்யா உங்களை மனதார சிரிக்க வைத்த இனிய தருணம்.',
      },
      as: {
        title: 'সেউজীয়া উদ্যানত অনন্যা আৰু ককা',
        relation: 'নাতিনী অনন্যা',
        note: 'ডাঙৰ আমজোপাৰ তলত অনন্যাই আপোনাক মন ভৰি হাঁহিৰ আমেজ দিছিল।',
      },
      mni: {
        title: 'পার্কতা অনন্যা অমসুং ইবুধো',
        relation: 'ইশু নুপী অনন্যা',
        note: 'হৈনৌ চপচাবী মখাদা অনন্যাগা লোয়ননা নখোয় অনি নুংশিরবা নোংথ্রোল হাপখি।',
      },
      ne: {
        title: 'हरियाली पार्कमा अनन्या र बाजे',
        relation: 'नातिनी अनन्या',
        note: 'आँपको छहारीमुनि अनन्याले तपाईंलाई धेरै मीठो हाँसो हँसाएकी थिइन्।',
      },
      brx: {
        title: 'गोजाउ पार्कआव अनन्या आरो आबौ',
        relation: 'उनदै हिनजाव अनन्या',
        note: 'थायजौ बिफांनि गाहायाव अनन्या नोंखौ गोसो गोरबोनिफ्राय मिनिखांदोंमोन।',
      },
    },
  },
  {
    id: 'preset-2',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    translations: {
      en: {
        title: 'Diwali Lights & Family Blessings',
        relation: 'Entire Family',
        note: 'All children and grandchildren gathered to seek your sacred blessings.',
      },
      hi: {
        title: 'दीपावली के मंगल दीप और परिवार का मिलन',
        relation: 'पूरा परिवार',
        note: 'घर के सभी बच्चे और नाती-पोते आपका आशीर्वाद लेने घर आए थे।',
      },
      gu: {
        title: 'દિવાળીના દીવડા અને પરિવારના સ્નેહ આશીર્વાદ',
        relation: 'સમગ્ર પરિવાર',
        note: 'તમામ સંતાનો અને પૌત્રોએ તમારા ચરણ સ્પર્શ કરી આશીર્વાદ લીધા હતા.',
      },
      mr: {
        title: 'दिवाळीतील कौटुंबिक स्नेहमिलन आणि आशीर्वाद',
        relation: 'संपूर्ण कुटुंब',
        note: 'सर्व नातवंडे व मुले तुमच्या चरणांवर डोके ठेवून आशीर्वाद घेण्यासाठी एकत्र आली होती.',
      },
      bn: {
        title: 'দীপাবলির আলো এবং পরিবারের স্নেহভরা আশীর্বাদ',
        relation: 'গোটা পরিবার',
        note: 'বাড়ির সকলে এক হয়ে আপনার স্নেহের আশীর্বাদ ও মিষ্টি মুখ করেছিল।',
      },
      ta: {
        title: 'தீபாவளி பண்டிகை மற்றும் குடும்ப ஆசீர்வாதம்',
        relation: 'முழு குடும்பம்',
        note: 'அனைத்து பிள்ளைகளும் பேரக்குழந்தைகளும் உங்கள் புனித ஆசீர்வாதத்தை பெற்றனர்.',
      },
      as: {
        title: 'দীপাৱলীৰ চাকি আৰু পৰিয়ালৰ আশীৰ্বাদ',
        relation: 'সমগ্র পৰিয়াল',
        note: 'সকলো ল’ৰা-ছোৱালী আৰু নাতি-নাতিনীয়ে আপোনাৰ পৱিত্ৰ আশীৰ্বাদ ল’বলৈ আহিছিল।',
      },
      mni: {
        title: 'দিৱালীগী মৈরা অমসুং ইমুংগী থৌজাল',
        relation: 'ইমুং মনুং পুম্নমক',
        note: 'ইমুংগী অঙাং পুম্নমক লাক্তুনা ইবুধোগী অশেংবা থৌজাল লৌখি।',
      },
      ne: {
        title: 'तिहारको बत्ती र परिवारको आशीर्वाद',
        relation: 'सम्पूर्ण परिवार',
        note: 'सबै छोराछोरी र नातिनातिनाहरू तपाईंको पवित्र आशीर्वाद लिन भेला भएका थिए।',
      },
      brx: {
        title: 'दिवालि अनजिमा आरो नखरनि आशिर्वाद',
        relation: 'गासै नखर',
        note: 'गासै गथ’-गथाय आरो नाथि-नाथिनिया नोंनि मोजां आशिर्वाद लानो फैदोंमोन।',
      },
    },
  },
  {
    id: 'preset-3',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    translations: {
      en: {
        title: 'Peaceful Morning Tea in Verandah',
        relation: 'Daughter Pooja',
        note: 'Warm ginger tea and pleasant sunshine, sharing quiet morning stories.',
      },
      hi: {
        title: 'आंगन की खिली धूप और सुबह की अदरक वाली चाय',
        relation: 'बेटी पूजा',
        note: 'गुनगुनी धूप में बैठकर पूजा के साथ मीठी बातें और गरमा-गरम चाय की चुस्कियां।',
      },
      gu: {
        title: 'વરંડામાં સવારની ગરમ આદુવાળી ચા',
        relation: 'દીકરી પૂજા',
        note: 'સવારના મીઠા તડકામાં દીકરી પૂજા સાથે નિરાંતે બેસી ચા અને છાપું વાંચ્યું.',
      },
      mr: {
        title: 'व्हरांड्यातील सकाळचा निवांत आलं चहा',
        relation: 'मुलगी पूजा',
        note: 'कोवळ्या उन्हात बसून पूजेसोबत शांतपणे घेतलेली गरमागरम चहाची गोड घोट.',
      },
      bn: {
        title: 'বারান্দায় সকালের শান্ত চায়ের আড্ডা',
        relation: 'মেয়ে পূজা',
        note: 'মিষ্টি রোদে বসে গরম আদা চা আর পূজার সাথে সুন্দর সকালের স্মৃতিচারণ।',
      },
      ta: {
        title: 'திண்ணையில் அமைதியான காலை இஞ்சி தேநீர்',
        relation: 'மகள் பூஜா',
        note: 'மிதமான வெயிலில் மகள் பூஜாவுடன் அமர்ந்து பருகிய சுவையான இஞ்சி டீ.',
      },
      as: {
        title: 'বাৰাণ্ডাত ৰাতিপুৱাৰ শান্ত চাহৰ মেল',
        relation: 'জীয়াৰী পূজা',
        note: 'ৰাতিপুৱাৰ কোমল ৰ’দত পূজাৰ সৈতে গৰম আদা চাহ খাই কটোৱা সুন্দৰ সময়।',
      },
      mni: {
        title: 'সুমনদা অয়ুক্কী চান্থবা চা অমসুং নুংশিরবা ৱারী',
        relation: 'মচা নুপী পূজা',
        note: 'অয়ুক্কী নুংশিরবা নুমিৎকী মঙাল মখাদা পূজাগা লোয়ননা চা থকখিবা।',
      },
      ne: {
        title: 'पिँढीमा बिहानको शान्त अदुवा चिया',
        relation: 'छोरी पूजा',
        note: 'बिहानको न्यानो घाममा छोरी पूजासँग बसेर पिएको मीठो अदुवा चिया।',
      },
      brx: {
        title: 'आंगोनो फुंनि गोजोन साहा लोंनाय',
        relation: 'फिसा हिनजाव पुजा',
        note: 'फुंनि दुंहाब सानदुंआव पुजाजों लोगोसे गोरबोनिफ्राय साहा लोंदोंमोन।',
      },
    },
  },
  {
    id: 'preset-4',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    translations: {
      en: {
        title: 'Sacred River Evening Aarti & Peace',
        relation: 'Spiritual Pilgrimage',
        note: 'Sacred bells and glowing lamps filled your heart with deep eternal calmness.',
      },
      hi: {
        title: 'पवित्र गंगा आरती और मन की असीम शांति',
        relation: 'तीर्थ यात्रा एवं सत्संग',
        note: 'मंदिर की दिव्य घंटियों और दीपों के दर्शन से आपका मन पूर्णतः शांत हो गया।',
      },
      gu: {
        title: 'પવિત્ર ગંગા આરતી અને આંતરિક શાંતિ',
        relation: 'તીર્થ યાત્રા અને સત્સંગ',
        note: 'દિવ્ય ઘંટનાદ અને આરતીના તેજથી તમારું હૃદય શાંતિ અને આનંદથી ભરાઈ ગયું.',
      },
      mr: {
        title: 'पवित्र नदी आरती आणि अंतरंगातील शांतता',
        relation: 'तीर्थयात्रा व ध्यान',
        note: 'मंदिरातील घंटानाद आणि तेवत असलेल्या दिव्यांनी मनाला असीम शांतता दिली.',
      },
      bn: {
        title: 'পবিত্র গঙ্গা আরতি ও আত্মিক প্রশান্তি',
        relation: 'তীর্থযাত্রা ও প্রার্থনা',
        note: 'মন্দিরের পবিত্র ঘণ্টার ধ্বনি আর প্রদীপের আলো আপনার মনে গভীর প্রশান্তি এনেছিল।',
      },
      ta: {
        title: 'புனித கங்கை ஆரத்தி மற்றும் அமைதி',
        relation: 'ஆன்மீக யாத்திரை',
        note: 'கோவில் மணிகளின் ஓசையும் தீப ஒளியும் உங்கள் மனதை அமைதியில் ஆழ்த்தியது.',
      },
      as: {
        title: 'পৱিত্ৰ গংগা আৰতি আৰু অন্তৰৰ শান্তি',
        relation: 'তীৰ্থ ভ্ৰমণ আৰু প্ৰাৰ্থনা',
        note: 'মন্দিৰৰ পৱিত্ৰ ঘন্টাৰ ধ্বনি আৰু বন্তিৰ পোহৰে আপোনাৰ মন শান্ত কৰি তুলিছিল।',
      },
      mni: {
        title: 'অশেংবা লাই খুরুম্বা অমসুং আরতি',
        relation: 'লাই খোইরম চৎপা',
        note: 'লাইশঙগী ঘন্টাগী মখোল অমসুং থাউমৈগী মঙালনা নুংশিরবা শান্তি পীখি।',
      },
      ne: {
        title: 'पवित्र गंगा आरती र मनको शान्ति',
        relation: 'तीर्थ यात्रा एवं भजन',
        note: 'घण्टीको पवित्र धुन र दियोको ज्योतिले तपाईंको मनलाई शान्त तुल्याएको थियो।',
      },
      brx: {
        title: 'पवित्र गङ्गा आरति आरो गोसोनि गोजोननाय',
        relation: 'ईस्वर पुजा आरो तीर्थ',
        note: 'मन्दिरनि गन्थानि सोदोब आरो बाथि जों नोंनि गोसोआ जोबोर गोजोन जादोंमोन।',
      },
    },
  },
];

// 3. Known Initial Photos Translations Mapping (photo-1 to photo-4)
const INITIAL_PHOTO_TRANSLATIONS: Record<string, Record<string, BhashiniPhotoData>> = {
  'photo-1': {
    en: {
      title: 'Ananya & Dadaji Laughing',
      relation: 'Granddaughter Ananya',
      memoryNote: 'Dadaji, remember when Ananya visited during summer holidays and made you laugh all afternoon?',
      spokenNarration: 'Ananya and Dadaji Laughing. Featuring your Granddaughter Ananya. Dadaji, remember when Ananya visited during summer holidays and made you laugh all afternoon?',
    },
    hi: {
      title: 'अनन्या और दादाजी की खिली हुई हँसी',
      relation: 'पोती अनन्या',
      memoryNote: 'दादाजी, याद है जब अनन्या छुट्टियों में आई थी और उसने आपको खूब हंसाया था?',
      spokenNarration: 'अनन्या और दादाजी की हँसी। यह तस्वीर आपकी लाडली पोती अनन्या की है। दादाजी, याद है जब अनन्या छुट्टियों में आई थी और उसने आपको खूब हंसाया था?',
    },
    gu: {
      title: 'અનન્યા અને દાદાજીનું નિર્દોષ હાસ્ય',
      relation: 'પૌત્રી અનન્યા',
      memoryNote: 'દાદાજી, યાદ છે જ્યારે અનન્યા વેકેશનમાં આવી હતી અને તમને આખો દિવસ હસાવ્યા હતા?',
      spokenNarration: 'અનન્યા અને દાદાજીનું નિર્દોષ હાસ્ય. આ તસવીર તમારી વહાલી પૌત્રી અનન્યા સાથેની છે. દાદાજી, યાદ છે જ્યારે અનન્યા વેકેશનમાં આવી હતી અને તમને ખૂબ હસાવ્યા હતા?',
    },
    mr: {
      title: 'अनन्या आणि आजोबांचे मनमुराद हास्य',
      relation: 'नात अनन्या',
      memoryNote: 'आजोबा, आठवतंय का जेव्हा अनन्या सुट्ट्यांमध्ये आली होती आणि तिने तुम्हाला खूप हसवलं होतं?',
      spokenNarration: 'अनन्या आणि आजोबांचे मनमुराद हास्य. हे छायाचित्र तुमची लाडकी नात अनन्या हिचे आहे. आजोबा, आठवतंय का जेव्हा अनन्या सुट्ट्यांमध्ये आली होती आणि तिने तुम्हाला खूप हसवलं होतं?',
    },
    bn: {
      title: 'অনন্যা ও দাদুর নির্মল হাসি',
      relation: 'নাতনি অনন্যা',
      memoryNote: 'দাদু, মনে আছে যখন অনন্যা ছুটির দিনে এসেছিল আর আপনাকে অনেক হাসিয়েছিল?',
      spokenNarration: 'অনন্যা ও দাদুর নির্মল হাসি। এই ছবিটি আপনার প্রিয় নাতনি অনন্যার সাথে। দাদু, মনে আছে যখন অনন্যা ছুটির দিনে এসেছিল আর আপনাকে অনেক হাসিয়েছিল?',
    },
    ta: {
      title: 'அனன்யா மற்றும் தாத்தாவின் இனிய சிரிப்பு',
      relation: 'பேத்தி அனன்யா',
      memoryNote: 'தாத்தா, அனன்யா விடுமுறையில் வந்து உங்களை நாள் முழுவதும் சிரிக்க வைத்தது நினைவிருக்கிறதா?',
      spokenNarration: 'அனன்யா மற்றும் தாத்தாவின் இனிய சிரிப்பு. இந்த புகைப்படம் உங்கள் அன்புப் பேத்தி அனன்யா உடையது. தாத்தா, அனன்யா விடுமுறையில் வந்து உங்களை நாள் முழுவதும் சிரிக்க வைத்தது நினைவிருக்கிறதா?',
    },
    as: {
      title: 'অনন্যা আৰু ককাৰ মনখোলা হাঁহি',
      relation: 'নাতিনী অনন্যা',
      memoryNote: 'ককা, মনত আছেনে যেতিয়া অনন্যা বন্ধৰ দিনত আহিছিল আৰু আপোনাক মন ভৰি হঁহুৱাইছিল?',
      spokenNarration: 'অনন্যা আৰু ককাৰ মনখোলা হাঁহি। এই ছবিখন আপোনাৰ মৰমৰ নাতিনী অনন্যাৰ সৈতে। ককা, মনত আছেনে যেতিয়া অনন্যা বন্ধৰ দিনত আহিছিল আৰু আপোনাক মন ভৰি হঁহুৱাইছিল?',
    },
    mni: {
      title: 'অনন্যা অমসুং ইবুধোগী নোংথ্রোল',
      relation: 'ইশু নুপী অনন্যা',
      memoryNote: 'ইবুধো, নিংশিংবীরব্রা অনন্যা ছুটিদা লাক্তুনা নখোয়দা নোংথ্রোল পীনখিবা?',
      spokenNarration: 'অনন্যা অমসুং ইবুধোগী নোংথ্রোল। মসি ইবুধোগী নুংশিরবী ইশু নুপী অনন্যাগী ফটোনি। ইবুধো, নিংশিংবীরব্রা অনন্যা ছুটিদা লাক্তুনা নখোয়দা নুংশিরবা নোংথ্রোল পীনখিবা?',
    },
    ne: {
      title: 'अनन्या र बाजेको न्यानो हाँसो',
      relation: 'नातिनी अनन्या',
      memoryNote: 'बाजे, सम्झनुहुन्छ जब अनन्या बिदामा आएकी थिइन् र तपाईंलाई धेरै हँसाएकी थिइन्?',
      spokenNarration: 'अनन्या र बाजेको न्यानो हाँसो। यो तस्बिर तपाईंको मायालु नातिनी अनन्याको हो। बाजे, सम्झनुहुन्छ जब अनन्या बिदामा आएकी थिइन् र तपाईंलाई धेरै हँसाएकी थिइन्?',
    },
    brx: {
      title: 'अनन्या आरो आबौनि मिनिस्लु',
      relation: 'उनदै हिनजाव अनन्या',
      memoryNote: 'आबौ, गोसोआव दं नामा जेब्ला अनन्या फुंनि समाव फैदोंमोन आरो नोंखौ गोजोनखोन्दो खालामदोंमोन?',
      spokenNarration: 'अनन्या आरो आबौनि मिनिस्लु। बे सावगारिया नोंनि मोजां उनदै हिनजाव अनन्याजों लोगोसे। आबौ, गोसोआव दं नामा जेब्ला अनन्या फुंनि समाव फैदोंमोन आरो नोंखौ मिनिहोदोंमोन?',
    },
  },
  'photo-2': {
    en: {
      title: 'Family Diwali Celebration',
      relation: 'Entire Family',
      memoryNote: 'All of us gathered together in Ahmedabad for Diwali. You blessed everyone with love and sweets.',
      spokenNarration: 'Family Diwali Celebration. Featuring your entire family. All of us gathered together for Diwali, receiving your blessings.',
    },
    hi: {
      title: 'सपरिवार दीपावली महोत्सव',
      relation: 'पूरा परिवार',
      memoryNote: 'हम सब दीपावली पर आपके पास एकत्रित हुए थे। आपने सभी बच्चों को प्रेम और मिठाई के साथ आशीर्वाद दिया था।',
      spokenNarration: 'सपरिवार दीपावली महोत्सव। यह आपके पूरे परिवार की तस्वीर है। हम सब दीपावली पर एकत्रित हुए थे और आपका पवित्र आशीर्वाद लिया था।',
    },
    gu: {
      title: 'પરિવાર સાથે દિવાળીની મંગળ ઉજવણી',
      relation: 'સમગ્ર પરિવાર',
      memoryNote: 'દિવાળી પર આપણે સૌ સાથે મળ્યા હતા. તમે દરેકને પ્રેમપૂર્વક મીઠાઈ ખવડાવી આશીર્વાદ આપ્યા હતા.',
      spokenNarration: 'પરિવાર સાથે દિવાળીની ઉજવણી. આ તમારા સમગ્ર પરિવારની તસવીર છે. આપણે સૌ ભેગા થયા હતા અને તમારા સ્નેહભર્યા આશીર્વાદ મેળવ્યા હતા.',
    },
    mr: {
      title: 'कुटुंबासोबत दिवाळीचा मंगल सोहळा',
      relation: 'संपूर्ण कुटुंब',
      memoryNote: 'दिवाळीला सर्व कुटुंब एकत्र आले होते. तुम्ही सर्वांना भरभरून गोड आशीर्वाद आणि लाडू दिले होते.',
      spokenNarration: 'कुटुंबासोबत दिवाळीचा मंगल सोहळा. हे छायाचित्र तुमच्या संपूर्ण कुटुंबाचे आहे. दिवाळीला सर्वांनी तुमचे आशीर्वाद घेतले होते.',
    },
    bn: {
      title: 'পরিবারের সাথে দীপাবলি উৎসব',
      relation: 'গোটা পরিবার',
      memoryNote: 'দীপাবলিতে আমরা সবাই একসাথে হয়েছিলাম। আপনি সবাইকে মনভরে ভালোবাসা ও আশীর্বাদ দিয়েছিলেন।',
      spokenNarration: 'পরিবারের সাথে দীপাবলি উৎসব। এটি আপনার গোটা পরিবারের ছবি। দীপাবলিতে সবাই আপনার আশীর্বাদ নিয়েছিল।',
    },
    ta: {
      title: 'குடும்பத்துடன் தீபாவளி கொண்டாட்டம்',
      relation: 'முழு குடும்பம்',
      memoryNote: 'தீபாவளிக்கு நாம் அனைவரும் ஒன்று கூடினோம். நீங்கள் அனைவருக்கும் இனிப்புகளுடன் ஆசீர்வாதம் வழங்கினீர்கள்.',
      spokenNarration: 'குடும்பத்துடன் தீபாவளி கொண்டாட்டம். இந்த புகைப்படம் உங்கள் முழு குடும்பத்தினருடையது. தீபாவளி நாளில் உங்கள் ஆசியை பெற்றோம்.',
    },
    as: {
      title: 'পৰিয়ালৰ সৈতে দীপাৱলী উদযাপন',
      relation: 'সমগ্র পৰিয়াল',
      memoryNote: 'দীপাৱলীত আমি সকলোৱে একেলগ হৈছিলো। আপুনি সকলোকে মৰম আৰু মিঠাইৰে আশীৰ্বাদ দিছিল।',
      spokenNarration: 'পৰিয়ালৰ সৈতে দীপাৱলী উদযাপন। এইখন আপোনাৰ সমগ্র পৰিয়ালৰ ছবি। সকলোৱে আপোনাৰ আশীৰ্বাদ লৈছিল।',
    },
    mni: {
      title: 'ইমুং মনুংগা লোয়ননা দিৱালী হরাওবা',
      relation: 'ইমুং মনুং পুম্নমক',
      memoryNote: 'দিৱালী নুমিৎতা ঐখোয় পুম্নমক পুনশিনখি। ইবুধোনা ঐখোয়দা নুংশিবা অমসুং থৌজাল পীবীখি।',
      spokenNarration: 'ইমুং মনুংগা লোয়ননা দিৱালী হরাওবা। মসি নখোয়গী ইমুং মনুং পুম্নমক্কী ফটোনি। দিৱালীদা ইবুধোগী থৌজাল লৌখিবা নুমিৎনি।',
    },
    ne: {
      title: 'परिवारसँग तिहारको रमाइलो',
      relation: 'सम्पूर्ण परिवार',
      memoryNote: 'तिहारमा हामी सबै एकै ठाउँमा भेला भएका थियौँ। तपाईंले सबैलाई माया र आशीर्वाद दिनुभएको थियो।',
      spokenNarration: 'परिवारसँग तिहारको रमाइलो। यो तपाईंको सम्पूर्ण परिवारको तस्बिर हो। तिहारमा सबैले तपाईंको आशीर्वाद लिएका थिए।',
    },
    brx: {
      title: 'नखरजों लोगोसे दिवालि रंजानाय',
      relation: 'गासै नखर',
      memoryNote: 'दिवालियाव जों गासैबो लोगो जादोंमोन। नों गासैबो गथ’-गथायखौ मोजां आशिर्वाद होदोंमोन।',
      spokenNarration: 'नखरजों लोगोसे दिवालि रंजानाय। बे सावगारिया गासै नखरनि। दिवालियाव नोंनि गोजोन आशिर्वाद लादोंमोन।',
    },
  },
  'photo-3': {
    en: {
      title: 'Morning Walk in Park',
      relation: 'Son Rahul & Dadaji',
      memoryNote: 'Sunny morning walk under ancient trees. Rahul made sure you rested on your favorite bench.',
      spokenNarration: 'Morning Walk in Park. Featuring your Son Rahul. Sunny morning walk under ancient trees, resting on your favorite bench.',
    },
    hi: {
      title: 'उद्यान में सुबह की ताज़ा सैर',
      relation: 'बेटा राहुल और दादाजी',
      memoryNote: 'पेड़ों की ठंडी छांव में सुबह की सैर। राहुल ने आपको आपकी पसंदीदा बेंच पर बिठाकर पानी पिलाया था।',
      spokenNarration: 'उद्यान में सुबह की सैर। यह आपके बेटे राहुल के साथ की तस्वीर है। सुबह की ताज़ा हवा और पसंदीदा बेंच पर सुकून का समय।',
    },
    gu: {
      title: 'બગીચામાં સવારનું તાજગીસભર ભ્રમણ',
      relation: 'દીકરો રાહુલ અને દાદાજી',
      memoryNote: 'વૃક્ષોની શીતળ છાયામાં સવારની સહેલ. રાહુલે તમને તમારી પ્રિય બેંચ પર બેસાડી આરામ કરાવ્યો હતો.',
      spokenNarration: 'બગીચામાં સવારનું ભ્રમણ. આ તમારા સુપુત્ર રાહુલ સાથેની તસવીર છે. સવારની તાજી હવામાં સાથે વિતાવેલો આનંદદાયક સમય.',
    },
    mr: {
      title: 'बागेतील सकाळची प्रसन्न फेरी',
      relation: 'मुलगा राहुल आणि आजोबा',
      memoryNote: 'झाडांच्या सावलीत सकाळची ताजी हवा घेत राहुलसोबत फिरणे आणि बाकड्यावर निवांत बसणे.',
      spokenNarration: 'बागेतील सकाळची प्रसन्न फेरी. हे छायाचित्र तुमचा मुलगा राहुल याच्यासोबतचे आहे. सकाळच्या सुंदर हवेतील शांत क्षण.',
    },
    bn: {
      title: 'পার্কে সকালের মনোরম হাঁটা',
      relation: 'ছেলে রাহুল ও দাদু',
      memoryNote: 'গাছের শীতল ছায়ায় সকালের হাঁটা। রাহুল আপনাকে প্রিয় বেঞ্চে বসিয়ে যত্ন নিয়েছিল।',
      spokenNarration: 'পার্কে সকালের মনোরম হাঁটা। এটি আপনার ছেলে রাহুলের সাথে তোলা ছবি। সকালের স্নিগ্ধ বাতাসে সুন্দর সময়।',
    },
    ta: {
      title: 'பூங்காவில் அமைதியான காலை நடைபயிற்சி',
      relation: 'மகன் ராகுல் மற்றும் தாத்தா',
      memoryNote: 'மரங்களின் குளிர்ந்த நிழலில் காலை நடை. ராகுல் உங்களை பிடித்த இருக்கையில் அமர வைத்து கவனித்துக் கொண்டார்.',
      spokenNarration: 'பூங்காவில் அமைதியான காலை நடைபயிற்சி. இந்த புகைப்படம் உங்கள் மகன் ராகுலுடன் எடுக்கப்பட்டது. இனிமையான காலைப் பொழுது.',
    },
    as: {
      title: 'উদ্যানত ৰাতিপুৱাৰ প্ৰাতঃভ্ৰমণ',
      relation: 'পুত্ৰ ৰাহুল আৰু ককা',
      memoryNote: 'গছৰ শীতল ছাঁত ৰাতিপুৱাৰ খোজ কঢ়া। ৰাহুলে আপোনাক প্ৰিয় বেঞ্চত জিৰণি ল’বলৈ দিছিল।',
      spokenNarration: 'উদ্যানত ৰাতিপুৱাৰ প্ৰাতঃভ্ৰমণ। এই ছবিখন আপোনাৰ পুত্ৰ ৰাহুলৰ সৈতে। ৰাতিপুৱাৰ স্নিগ্ধ বতাহত কটোৱা সময়।',
    },
    mni: {
      title: 'পার্কতা অয়ুক্কী খোঙচৎ',
      relation: 'মচা নুপা রাহুল অমসুং ইবুধো',
      memoryNote: 'উমং মখাদা অয়ুক্কী অহিংবা নুংশিত মখাদা রাহুলগা লোয়ননা খোঙচৎ চৎখিবা।',
      spokenNarration: 'পার্কতা অয়ুক্কী খোঙচৎ। মসি নখোয়গী মচা নুপা রাহুলগা লোয়ননা লৌখিবা ফটোনি। অয়ুক্কী নুংশিরবা মতম।',
    },
    ne: {
      title: 'पार्कमा बिहानको पैदल यात्रा',
      relation: 'छोरा राहुल र बाजे',
      memoryNote: 'रूखको छहारीमुनि बिहानको न्यानो हावा लिँदै राहुलसँग हिँडेको र मनपर्ने बेन्चमा आराम गरेको समय।',
      spokenNarration: 'पार्कमा बिहानको पैदल यात्रा। यो तपाईंको छोरा राहुलसँगको तस्बिर हो। बिहानको शीतलता र आरामको समय।',
    },
    brx: {
      title: 'पार्कआव फुंनि थाबायनाय',
      relation: 'फिसा हौवा राहुल आरो आबौ',
      memoryNote: 'बिफांनि सिरिसिरि अनजिमायाव फुंनि बार लोंनाय आरो बेन्सआव जिरायनाय।',
      spokenNarration: 'पार्कआव फुंनि थाबायनाय। बे सावगारिया नोंनि फिसा हौवा राहुलजों लोगोसे। फुंनि गोजोन समाव लादोंमोन।',
    },
  },
  'photo-4': {
    en: {
      title: 'Ganga Aarti Pilgrimage',
      relation: 'Spiritual Pilgrimage',
      memoryNote: 'Peaceful bells and holy lamps at Haridwar. You felt deeply calm and blessed by the divine waters.',
      spokenNarration: 'Ganga Aarti Pilgrimage. A sacred spiritual journey. Peaceful temple bells and holy lamps filling your heart with blessings.',
    },
    hi: {
      title: 'हरिद्वार में पावन गंगा आरती',
      relation: 'तीर्थ यात्रा एवं सत्संग',
      memoryNote: 'हरिद्वार में बजते पावन घंटे और दीपदान। माँ गंगा के पवित्र जल के समक्ष आपको गहरी शांति का अनुभव हुआ था।',
      spokenNarration: 'हरिद्वार में पावन गंगा आरती। यह आपकी पवित्र तीर्थ यात्रा की तस्वीर है। माँ गंगा के पावन तट पर मन को असीम शांति मिली थी।',
    },
    gu: {
      title: 'પવિત્ર ગંગા આરતી દર્શન',
      relation: 'તીર્થ યાત્રા અને સત્સંગ',
      memoryNote: 'હરિદ્વારમાં ગુંજતા પવિત્ર ઘંટનાદ અને દીવડાઓ. પવિત્ર ગંગાજીના દર્શનથી મન અત્યંત શાંત અને પ્રસન્ન બન્યું હતું.',
      spokenNarration: 'પવિત્ર ગંગા આરતી દર્શન. આ તમારી દિવ્ય તીર્થયાત્રાની તસવીર છે. પવિત્ર જળ અને આરતીના દર્શનથી મનને ઊંડી શાંતિ મળી હતી.',
    },
    mr: {
      title: 'हरिद्वारची पावन गंगा आरती',
      relation: 'तीर्थयात्रा व ध्यान',
      memoryNote: 'हरिद्वारमधील पवित्र घंटानाद व दिव्यांची आरास. गंगामाईच्या चरणी मनाला अपार शांतता व समाधान लाभले होते.',
      spokenNarration: 'हरिद्वारची पावन गंगा आरती. हे छायाचित्र तुमच्या पवित्र तीर्थयात्रेचे आहे. गंगामाईच्या सान्निध्यात मनाला असीम शांतता लाभली होती.',
    },
    bn: {
      title: 'হরিদ্বারের পুণ্য গঙ্গা আরতি',
      relation: 'তীর্থযাত্রা ও প্রার্থনা',
      memoryNote: 'হরিদ্বারের পবিত্র ঘণ্টার ধ্বনি ও প্রদীপমালা। মা গঙ্গার নির্মল স্রোতের কাছে মন গভীর শান্তিতে ভরে উঠেছিল।',
      spokenNarration: 'হরিদ্বারের পুণ্য গঙ্গা আরতি। এটি আপনার পবিত্র তীর্থযাত্রার ছবি। মা গঙ্গার পবিত্র রূপ দর্শন করে মনে অপার শান্তি এসেছিল।',
    },
    ta: {
      title: 'புனித கங்கை ஆரத்தி யாத்திரை',
      relation: 'ஆன்மீக யாத்திரை',
      memoryNote: 'ஹரித்வாரில் ஒலித்த புனித மணிகளும் தீபங்களும். கங்கை நதிக்கரையில் நீங்கள் எல்லையற்ற அமைதியை உணர்ந்தீர்கள்.',
      spokenNarration: 'புனித கங்கை ஆரத்தி யாத்திரை. இது உங்கள் ஆன்மீக பயணத்தின் புகைப்படம். கங்கைக் கரையில் மனம் நிறைந்த தெய்வீக அமைதி.',
    },
    as: {
      title: 'হৰিদ্বাৰৰ পৱিত্ৰ গংগা আৰতি',
      relation: 'তীৰ্থ ভ্ৰমণ আৰু প্ৰাৰ্থনা',
      memoryNote: 'হৰিদ্বাৰৰ পৱিত্ৰ ঘন্টাধ্বনি আৰু দীপমালা। মা গংগাৰ পৱিত্ৰ তীৰ্থত আপোনাৰ মন গভীৰ শান্তিত নিমগ্ন হৈছিল।',
      spokenNarration: 'হৰিদ্বাৰৰ পৱিত্ৰ গংগা আৰতি। এইখন আপোনাৰ পৱিত্ৰ তীৰ্থযাত্ৰাৰ ছবি। মা গংগাৰ চৰণত মনলৈ অহা পৰম শান্তিৰ মুহূৰ্ত।',
    },
    mni: {
      title: 'হরিদ্বারদা অশেংবা গঙ্গা আরতি',
      relation: 'লাই খোইরম চৎপা',
      memoryNote: 'হরিদ্বারগী অশেংবা ঘন্টা মখোল অমসুং থাউমৈ আরতি। গঙ্গাগী তোর্বান্দা ইবুধোগী পুক্নিং শান্তিনা থল্লকখি।',
      spokenNarration: 'হরিদ্বারদা অশেংবা গঙ্গা আরতি। মসি লাই খোইরম চৎখিবা মতমগী অশেংবা ফটোনি। গঙ্গাগী তোর্বান্দা শান্তিনা থল্লকখিবা মতম।',
    },
    ne: {
      title: 'हरिद्वारमा पवित्र गङ्गा आरती',
      relation: 'तीर्थ यात्रा एवं भजन',
      memoryNote: 'हरिद्वारमा बजिरहेको मन्दिरको पवित्र घण्टी र दियोको आरती। गङ्गाजीको तटमा तपाईंले गहिरो मनको शान्ति पाउनुभएको थियो।',
      spokenNarration: 'हरिद्वारमा पवित्र गङ्गा आरती। यो तपाईंको पवित्र तीर्थयात्राको तस्बिर हो। गङ्गाजीको पावन स्पर्शले मनमा असीम शान्ति ल्याएको थियो।',
    },
    brx: {
      title: 'हरिद्वारआव पवित्र गङ्गा आरति',
      relation: 'ईस्वर पुजा आरो तीर्थ',
      memoryNote: 'हरिद्वारनि पवित्र गन्था सोदोब आरो बाथि आरति। गङ्गा दैमायाव नोंनि गोसोआ जोबोर गोजोन जादोंमोन।',
      spokenNarration: 'हरिद्वारआव पवित्र गङ्गा आरति। बे सावगारिया तीर्थ यात्रा समाव लादोंमोन। गङ्गा दैमानि खाथियाव गोसोनि गोजोननाय।',
    },
  },
};

/**
 * Translates and culturalizes any photo memory for the current target language
 * using Bhashini Indic standards.
 */
export function translatePhotoWithBhashini(
  photo: MemoryPhoto, 
  targetLang: Language
): BhashiniPhotoData {
  if (!photo) {
    return {
      title: 'Family Memory',
      relation: 'Family',
      memoryNote: 'A cherished moment of love and warmth.',
      spokenNarration: 'A cherished family moment filled with comfort.',
    };
  }

  // 1. Direct match in initial photo dataset
  if (INITIAL_PHOTO_TRANSLATIONS[photo.id] && INITIAL_PHOTO_TRANSLATIONS[photo.id][targetLang]) {
    return INITIAL_PHOTO_TRANSLATIONS[photo.id][targetLang];
  }

  // 2. Custom photo with manual translations attached
  if (photo.translations && photo.translations[targetLang]) {
    const custom = photo.translations[targetLang]!;
    const title = custom.title || photo.title;
    const relation = custom.relation || photo.relation;
    const memoryNote = custom.memoryNote || photo.memoryNote;
    const spokenNarration = buildBhashiniNarration(title, relation, memoryNote, targetLang);
    return { title, relation, memoryNote, spokenNarration };
  }

  // 3. Fallback: Lookup relation keyword in Bhashini Kinship Matrix
  const cleanRelKey = photo.relation.trim().toLowerCase();
  let translatedRelation = photo.relation;
  for (const [key, map] of Object.entries(BHASHINI_RELATIONS)) {
    if (cleanRelKey.includes(key)) {
      translatedRelation = map[targetLang] || photo.relation;
      break;
    }
  }

  const title = photo.title;
  const memoryNote = photo.memoryNote;
  const spokenNarration = buildBhashiniNarration(title, translatedRelation, memoryNote, targetLang);

  return {
    title,
    relation: translatedRelation,
    memoryNote,
    spokenNarration,
  };
}

/**
 * Builds culturally warm, respectful elder-friendly narration in 10 languages
 */
export function buildBhashiniNarration(
  title: string, 
  relation: string, 
  note: string, 
  lang: Language
): string {
  switch (lang) {
    case 'hi':
      return `${title}। यह तस्वीर ${relation} के साथ बिताए प्यारे पलों की है। ${note}`;
    case 'as':
      return `${title}। এই ছবিখন ${relation} ৰ সৈতে কটোৱা মধুৰ স্মৃতিৰ। ${note}`;
    case 'mni':
      return `${title}। মসিগী ফটো অসি ${relation} অমসুং ইবুধোগী নুংশিরবা মিকুপনি। ${note}`;
    case 'ne':
      return `${title}। यो तस्बिर ${relation} सँग बिताएका मायालु पलहरूको सम्झना हो। ${note}`;
    case 'brx':
      return `${title}। बे सावगारिया ${relation} जों लोगोसे मोनसे समायना गोसोखांथि। ${note}`;
    case 'en':
    default:
      return `${title}. A loving memory featuring ${relation}. ${note}`;
  }
}

/**
 * Offline GPS Geofence & Haversine Distance Calculator
 * Calculates accurate great-circle distance between two latitude/longitude points in meters.
 * Works 100% offline without network or cloud API.
 */
export function calculateHaversineDistanceMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
