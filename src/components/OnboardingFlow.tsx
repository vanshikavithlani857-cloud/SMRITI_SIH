import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Smile, 
  Users, 
  Heart, 
  Lock, 
  AlertTriangle, 
  FileText, 
  Check, 
  Volume2,
  ChevronDown,
  Sparkles,
  Phone,
  MapPin,
  KeyRound,
  User,
  AlertCircle,
  Type
} from 'lucide-react';
import { Language, UserRole, CaregiverDetails } from '../types';
import { translations } from '../i18n/translations';
import { SUPPORTED_LANGUAGES } from '../i18n/languagesMeta';
import { playGentleTap, speakText } from '../utils/audio';
import { AppLogo } from './AppLogo';

interface OnboardingFlowProps {
  currentLanguage: Language;
  currentRole: UserRole;
  initialCaregiverDetails?: CaregiverDetails;
  initialPatientName?: string;
  onComplete: (
    role: UserRole, 
    language: Language, 
    caregiverDetails?: CaregiverDetails,
    patientName?: string
  ) => void;
  initialStep?: 1 | 2;
  onCancel?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  currentLanguage,
  currentRole,
  initialCaregiverDetails,
  initialPatientName = 'Rameshwar Ji',
  onComplete,
  initialStep = 1,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [selectedLang, setSelectedLang] = useState<Language>(currentLanguage || 'hi');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'patient');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [showFullTerms, setShowFullTerms] = useState<boolean>(false);

  // Font Size state: Medium to Large font size mention and support
  const [fontSize, setFontSize] = useState<'medium' | 'large'>(() => {
    const saved = localStorage.getItem('sahayak_font_size');
    return (saved === 'large' || saved === 'medium') ? saved : 'medium';
  });

  const handleFontSizeChange = (size: 'medium' | 'large') => {
    playGentleTap();
    setFontSize(size);
    try {
      localStorage.setItem('sahayak_font_size', size);
      if (size === 'large') {
        document.documentElement.classList.add('app-font-large');
      } else {
        document.documentElement.classList.remove('app-font-large');
      }
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  };

  // Caregiver Details Form State (All fields are necessary!)
  const [isCaregiverFormOpen, setIsCaregiverFormOpen] = useState<boolean>(false);
  const [caregiverName, setCaregiverName] = useState<string>(initialCaregiverDetails?.name || 'Pooja Sharma');
  const [relation, setRelation] = useState<string>(initialCaregiverDetails?.relation || 'Daughter');
  const [phone, setPhone] = useState<string>(initialCaregiverDetails?.phone || '+91 98765 43210');
  const [city, setCity] = useState<string>(initialCaregiverDetails?.city || 'Guwahati, Assam');
  const [securityPin, setSecurityPin] = useState<string>(initialCaregiverDetails?.securityPin || '1234');
  const [patientName, setPatientName] = useState<string>(initialPatientName);
  const [formError, setFormError] = useState<string | null>(null);

  const t = translations[selectedLang] || translations.en;

  const handleLanguageChange = (lang: Language) => {
    playGentleTap();
    setSelectedLang(lang);

    const greeting = lang === 'hi' 
      ? 'नमस्ते! स्मृति में आपका स्वागत है।'
      : lang === 'as'
      ? 'নমস্কাৰ! স্মৃতিলৈ স্বাগতম।'
      : lang === 'mni'
      ? 'খুরুমজরি! স্মৃতিদা তরাম্না ওকচরি।'
      : lang === 'ne'
      ? 'नमस्ते! स्मृतिमा स्वागत छ।'
      : lang === 'brx'
      ? 'खुलुमबाय! स्मृतिसिम बरायबाय।'
      : 'Welcome to Smriti Eldercare Companion.';
    
    speakText(greeting, lang);
  };

  const handleProceedToStep2 = () => {
    if (!termsAccepted) return;
    playGentleTap();
    setStep(2);
  };

  const handleSelectRole = (role: UserRole) => {
    playGentleTap();
    setSelectedRole(role);
    if (role === 'caregiver') {
      setIsCaregiverFormOpen(true);
      setFormError(null);
    } else {
      onComplete('patient', selectedLang);
    }
  };

  const handleCaregiverFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playGentleTap();

    // Validation: ALL FIELDS ARE STRICTLY MANDATORY
    if (!caregiverName.trim()) {
      setFormError('Caregiver Full Name is mandatory.');
      return;
    }
    if (!relation.trim()) {
      setFormError('Relationship to Senior/Patient is mandatory.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!phone.trim() || cleanPhone.length < 10) {
      setFormError('A valid 10-digit Emergency Phone Number is mandatory.');
      return;
    }
    if (!city.trim()) {
      setFormError('City / Residential Location is mandatory.');
      return;
    }
    const pin = securityPin.trim();
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setFormError('A 4-digit numeric Security PIN is mandatory to protect settings.');
      return;
    }
    if (!patientName.trim()) {
      setFormError("Senior / Patient's Full Name is mandatory.");
      return;
    }

    setFormError(null);
    const newDetails: CaregiverDetails = {
      name: caregiverName.trim(),
      phone: phone.trim(),
      relation: relation.trim(),
      city: city.trim(),
      securityPin: pin,
      registeredAt: new Date().toLocaleDateString(),
    };

    onComplete('caregiver', selectedLang, newDetails, patientName.trim());
  };

  // Localized texts for Step 1
  const step1Labels: Record<string, {
    stepBadge: string;
    langTitle: string;
    langSubtitle: string;
    fontSizeTitle: string;
    fontSizeSubtitle: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    fontSizeMention: string;
    termsTitle: string;
    termsBadge: string;
    termsAccessibilityTitle: string;
    termsAccessibilityBody: string;
    termsCheckbox: string;
    continueBtn: string;
  }> = {
    hi: {
      stepBadge: 'चरण १ / २: भाषा, फॉन्ट साइज़ और नियम व शर्तें',
      langTitle: 'अपनी पसंदीदा भाषा चुनें',
      langSubtitle: 'ऐप की सभी आवाज़ और जानकारी इसी भाषा में उपलब्ध होगी',
      fontSizeTitle: 'अक्षर का आकार (Medium to Large Font Size)',
      fontSizeSubtitle: 'वरिष्ठ नागरिकों और मरीज़ों के सहज पठन के लिए मध्यम से बड़ा फॉन्ट साइज़',
      fontSizeMedium: 'मध्यम (Medium - 18px)',
      fontSizeLarge: 'बड़ा (Large - 22px)',
      fontSizeMention: 'इस ऐप में पढ़ने में आसानी के लिए मध्यम से बड़ा (Medium to Large) फॉन्ट साइज़ और स्पष्ट रूपरेखा शामिल है।',
      termsTitle: 'नियम व शर्तें एवं गोपनीयता सुरक्षा',
      termsBadge: '१००% ऑफ़लाइन और सुरक्षित',
      termsAccessibilityTitle: 'वरिष्ठ सुलभता: मध्यम से बड़ा फॉन्ट',
      termsAccessibilityBody: 'सभी निर्देश, दवाई रिमाइंडर और आपातकालीन बटन मध्यम से बड़े (Medium to Large) स्पष्ट अक्षरों में प्रदर्शित किए जाते हैं।',
      termsCheckbox: 'मैंने नियम व शर्तें, मध्यम से बड़ा फॉन्ट प्रारूप और गोपनीयता नीति पढ़ ली है और सहमत हूँ',
      continueBtn: 'आगे बढ़ें (मरीज़ या केयरगिवर चुनें) →',
    },
    as: {
      stepBadge: 'পৰ্যায় ১ / ২: ভাষা, ফন্ট আৰু চৰ্তাৱলী',
      langTitle: 'আপোনাৰ পছন্দৰ ভাষা বাচক',
      langSubtitle: 'সকলো কথা আৰু তথ্য এই ভাষাত উপলব্ধ হ’ব',
      fontSizeTitle: 'আখৰৰ আকাৰ (Medium to Large Font Size)',
      fontSizeSubtitle: 'জ্যেষ্ঠ নাগৰিক আৰু ৰোগীৰ সুবিধাৰ বাবে মধ্যমীয়াৰ পৰা ডাঙৰ ফন্ট',
      fontSizeMedium: 'মধ্যমীয়া (Medium - 18px)',
      fontSizeLarge: 'ডাঙৰ (Large - 22px)',
      fontSizeMention: 'বয়োবৃদ্ধসকলৰ বাবে এই এপত মধ্যমীয়াৰ পৰা ডাঙৰ (Medium to Large) ফন্ট আকাৰ প্ৰদান কৰা হৈছে।',
      termsTitle: 'চৰ্তাৱলী আৰু গোপনীয়তা সুৰক্ষা',
      termsBadge: '১০০% অফলাইন আৰু সুৰক্ষিত',
      termsAccessibilityTitle: 'সহজ পঠন: মধ্যমীয়াৰ পৰা ডাঙৰ ফন্ট',
      termsAccessibilityBody: 'সকলো তথ্য, ঔষধৰ সতৰ্কবাৰ্তা আৰু বুটাম মধ্যমীয়াৰ পৰা ডাঙৰ (Medium to Large) ফন্ট আকাৰত উপলব্ধ।',
      termsCheckbox: 'মই চৰ্তাৱলী আৰু গোপনীয়তা নীতি পঢ়িছোঁ আৰু সন্মত',
      continueBtn: 'অগ্ৰসৰ হওক (ৰোগী নে পৰিচৰ্যাকাৰী বাচক) →',
    },
    mni: {
      stepBadge: 'তাঙ্ক ১ / ২: লোন, ফন্ট অমসুং কাংলোন',
      langTitle: 'অদোমগী লোন খনবীয়ু',
      langSubtitle: 'অ্যাপ অসিগী ৱা অমসুং পাউ পুম্নমক লোন অসিদা ফংগনি',
      fontSizeTitle: 'ময়োক্কী মশক (Medium to Large Font Size)',
      fontSizeSubtitle: 'অহলশিংগী লাইনা পাহন্নবা ময়ামদগী চাউবা ফন্ট',
      fontSizeMedium: 'ময়াম (Medium - 18px)',
      fontSizeLarge: 'চাউবা (Large - 22px)',
      fontSizeMention: 'লৈরিবা অহলশিংগী কান্ননবা ময়ামদগী চাউবা (Medium to Large) ফন্ট সাইজ পীরি।',
      termsTitle: 'কাংলোন অমসুং অকুপ্পা ৱাফম',
      termsBadge: '১০০% অফলাইন অমসুং শেফতি',
      termsAccessibilityTitle: 'অহলশিংগী ফন্ট: ময়ামদগী চাউবা',
      termsAccessibilityBody: 'হিদাক্কী পাউ অমসুং বুটামশিং অহলশিংনা লাইনা উনবা ময়ামদগী চাউবা (Medium to Large) ময়েক সেম্মী।',
      termsCheckbox: 'ঐহাক্না কাংলোনশিং পুম্নমক য়ানরে',
      continueBtn: 'মাংলোইন্না চঙবীয়ু (লৈরিবা নত্রগা য়োকখৎপীবা) →',
    },
    ne: {
      stepBadge: 'चरण १ / २: भाषा, फन्ट र नियम तथा सर्तहरू',
      langTitle: 'आफ्नो मनपर्ने भाषा छान्नुहोस्',
      langSubtitle: 'एपको आवाज र विवरण यही भाषामा उपलब्ध हुनेछ',
      fontSizeTitle: 'अक्षरको आकार (Medium to Large Font Size)',
      fontSizeSubtitle: 'ज्येष्ठ नागरिकहरूको सहज पठनका लागि मध्यमदेखि ठूलो फन्ट',
      fontSizeMedium: 'मध्यम (Medium - 18px)',
      fontSizeLarge: 'ठूलो (Large - 22px)',
      fontSizeMention: 'ज्येष्ठ नागरिकलाई सजिलै देखिने गरी मध्यमदेखि ठूलो (Medium to Large) फन्ट आकार समावेश गरिएको छ।',
      termsTitle: 'नियम, सर्त र गोपनीयता सुरक्षा',
      termsBadge: '१००% अफलाइन र सुरक्षित',
      termsAccessibilityTitle: 'सहज पठन: मध्यमदेखि ठूलो फन्ट',
      termsAccessibilityBody: 'औषधि सम्झना र बटनहरू स्पष्ट देखिने गरी मध्यमदेखि ठूलो (Medium to Large) फन्टमा राखिएका छन्।',
      termsCheckbox: 'मैले नियम, सर्त र गोपनीयता नीति पढेको छु र सहमत छु',
      continueBtn: 'अगाडि बढ्नुहोस् (बिरामी वा हेरचाहकर्ता) →',
    },
    brx: {
      stepBadge: 'बाहागो १ / २: राव, फन्ट आरो नियमफोर',
      langTitle: 'नोंथांनि मोजां मोननाय राव सायख',
      langSubtitle: 'गासै रादाब आरो मदद बे रावावनो मोनगोन',
      fontSizeTitle: 'हांखो महर (Medium to Large Font Size)',
      fontSizeSubtitle: 'गेदेर सुबुंफोरनि थाखाय गेजेरनिफ्राय गेदेर फन्ट',
      fontSizeMedium: 'गेजेर (Medium - 18px)',
      fontSizeLarge: 'गेदेर (Large - 22px)',
      fontSizeMention: 'मोजाङै फरायनो थाखाय गेजेरनिफ्राय गेदेर (Medium to Large) फन्ट होनाय जादों।',
      termsTitle: 'नियमफोर आरो गोसोखो रांखाथि',
      termsBadge: '१००% अफलाइन आरो सांग्रां',
      termsAccessibilityTitle: 'मोजां फरायनो: गेजेरनिफ्राय गेदेर फन्ट',
      termsAccessibilityBody: 'मुलिनि सोमावसारनाय आरो गासै बाथ्राफोरखौ गेजेरनिफ्राय गेदेर (Medium to Large) फन्टाव होनाय जादों।',
      termsCheckbox: 'आं नियमफोर आरो गोसोखो रांखाथिखौ गनायबाय',
      continueBtn: 'सिगां बाहाय (बिमारी एबा फासिग्रा) →',
    },
    en: {
      stepBadge: 'Step 1 of 2: Preferred Language, Font Size & Terms',
      langTitle: 'Choose Your Preferred Language',
      langSubtitle: 'All voice guidance and content will be provided in this language',
      fontSizeTitle: 'Font Size (Medium to Large Display)',
      fontSizeSubtitle: 'Senior accessibility with comfortable Medium to Large text sizing',
      fontSizeMedium: 'Medium (18px)',
      fontSizeLarge: 'Large (22px)',
      fontSizeMention: 'This app features a dedicated Medium to Large font size calibrated for senior citizens and dementia care.',
      termsTitle: 'Terms & Conditions & Privacy Safeguards',
      termsBadge: '100% Offline & Private',
      termsAccessibilityTitle: 'Senior Readability: Medium to Large Font',
      termsAccessibilityBody: 'All schedules, medication reminders, and controls are set in comfortable Medium to Large typography to prevent eye strain.',
      termsCheckbox: 'I have read and agree to the Terms & Conditions and Senior Accessibility Standards',
      continueBtn: 'Continue to Role Selection →',
    },
  };

  // Localized texts for Step 2
  const step2Labels: Record<string, {
    stepBadge: string;
    mainHeading: string;
    subHeading: string;
    patientTitle: string;
    patientDesc: string;
    patientBtn: string;
    caregiverTitle: string;
    caregiverDesc: string;
    caregiverBtn: string;
    backBtn: string;
  }> = {
    hi: {
      stepBadge: 'चरण २ / २: प्रोफ़ाइल चयन',
      mainHeading: 'क्या आप देखभालकर्ता हैं या वरिष्ठ नागरिक?',
      subHeading: 'अपनी आवश्यकता के अनुसार सही प्रोफ़ाइल चुनें',
      patientTitle: 'मरीज़ / वरिष्ठ नागरिक साथी',
      patientDesc: 'सरल आवाज़ सहायता, समय पर दवाई की याद, परिवार की यादें, और १-टैप आपातकालीन SOS।',
      patientBtn: 'मरीज़ के रूप में शुरू करें →',
      caregiverTitle: 'केयरगिवर / परिजन पोर्टल',
      caregiverDesc: 'सुरक्षा अलर्ट, दवाई और रूटीन प्रबंधन, दैनिक स्वास्थ्य प्रगति, और GPS मॉनिटरिंग।',
      caregiverBtn: 'केयरगिवर के रूप में शुरू करें →',
      backBtn: '← भाषा और नियम पर वापस जाएं',
    },
    as: {
      stepBadge: 'পৰ্যায় ২ / ২: ভূমিকা বাচক',
      mainHeading: 'আপুনি পৰিচৰ্যাকাৰী নে ৰোগী?',
      subHeading: 'আপোনাৰ প্ৰয়োজন অনুসৰি সঠিক বিকল্প বাচক',
      patientTitle: 'ৰোগী / জ্যেষ্ঠ সংগী',
      patientDesc: 'সহজ কথাৰে সহায়, ঔষধৰ সোঁৱৰণী, পৰিয়ালৰ পুৰণি স্মৃতি আৰু ১-টেপ জৰুৰীকালীন SOS।',
      patientBtn: 'ৰোগী হিচাপে আৰম্ভ কৰক →',
      caregiverTitle: 'পৰিচৰ্যাকাৰী প’ৰ্টেল',
      caregiverDesc: 'সুৰক্ষা সতৰ্কবাৰ্তা, ঔষধ আৰু ৰুটিন পৰিচালনা, স্বাস্থ্য অগ্ৰগতি আৰু GPS অনুসৰণ।',
      caregiverBtn: 'পৰিচৰ্যাকাৰী হিচাপে আৰম্ভ কৰক →',
      backBtn: '← ভাষা আৰু চৰ্তলৈ উভতি যাওক',
    },
    mni: {
      stepBadge: 'তাঙ্ক ২ / ২: থৌদাং খনবা',
      mainHeading: 'অদোম য়োকখৎপীবা নে নত্রগা লৈরিবা মীওইনি?',
      subHeading: 'অদোমগী অপাম্বগী মতুংইন্না খনবীয়ু',
      patientTitle: 'লৈরিবা মীওইগী মরূপ',
      patientDesc: 'খোন্থোক্না মতেং পাংবা, হিদাক নীংশিংবা, ইমুংগী ফটো অমসুং ১-তেপ SOS।',
      patientBtn: 'লৈরিবা ওইনা চঙবা →',
      caregiverTitle: 'য়োকখৎপীবা পোর্তেল',
      caregiverDesc: 'সুৰক্ষা পাউজেল, হিদাক মতম নিংথিনা শেম্বা অমসুং GPS নিৰীক্ষণ।',
      caregiverBtn: 'য়োকখৎপীবা ওইনা চঙবা →',
      backBtn: '← লোন অমসুং কাংলোন্দা হল্লকপা',
    },
    ne: {
      stepBadge: 'चरण २ / २: भूमिका छान्नुहोस्',
      mainHeading: 'के तपाईँ हेरचाहकर्ता हुनुहुन्छ वा बिरामी?',
      subHeading: 'आफ्नो आवश्यकता अनुसार उपयुक्त विकल्प छान्नुहोस्',
      patientTitle: 'बिरामी / ज्येष्ठ नागरिक साथी',
      patientDesc: 'आवाजबाट सहयोग, औषधिको सम्झना, पारिवारिक सम्झनाहरू र १-ट्याप आपतकालीन SOS।',
      patientBtn: 'बिरामीको रूपमा सुरु गर्नुहोस् →',
      caregiverTitle: 'हेरचाहकर्ता पोर्टल',
      caregiverDesc: 'सुरक्षा सूचनाहरू, औषधि व्यवस्थापन, दैनिक स्वास्थ्य प्रगति र GPS ट्र्याकिङ।',
      caregiverBtn: 'हेरचाहकर्ताको रूपमा सुरु गर्नुहोस् →',
      backBtn: '← भाषा र नियममा फर्कनुहोस्',
    },
    brx: {
      stepBadge: 'बाहागो २ / २: बिबान सायख',
      mainHeading: 'नोंथाङा फासिग्रा ना बिमारी?',
      subHeading: 'गावनि गोनांथिखौ सायख आरो जागाय',
      patientTitle: 'बिमारी / गेदेर साथी',
      patientDesc: 'गोरलै राव मदद, मुलिनि सोमावसारनाय, नखरनि नोजोर आरो १-थेप SOS।',
      patientBtn: 'बिमारी हिसाबै जागाय →',
      caregiverTitle: 'फासिग्रा पोर्टल',
      caregiverDesc: 'रैखाथि सांग्रांथि, मुलि आरो सानफ्रोमबोनि हाबाफोर आरो GPS नोजोर।',
      caregiverBtn: 'फासिग्रा हिसाबै जागाय →',
      backBtn: '← राव आरो नियमाव थांफिन',
    },
    en: {
      stepBadge: 'Step 2 of 2: Role Selection',
      mainHeading: 'Are you a Caregiver or a Patient?',
      subHeading: 'Select your role to personalize the dashboard and controls',
      patientTitle: 'Patient / Senior Citizen',
      patientDesc: 'Calm voice recall, gentle medicine reminders, cherished family memories, and 1-tap SOS.',
      patientBtn: 'Continue as Patient →',
      caregiverTitle: 'Caregiver / Family Guardian',
      caregiverDesc: 'Real-time safety alerts, medicine scheduler, cognitive tracking, and live GPS monitoring.',
      caregiverBtn: 'Continue as Caregiver →',
      backBtn: '← Back to Language & Terms',
    },
  };

  const s1 = step1Labels[selectedLang] || step1Labels.en;
  const s2 = step2Labels[selectedLang] || step2Labels.en;

  return (
    <div 
      id="onboarding-flow-container"
      className="min-h-screen bg-gradient-to-b from-stone-50 via-teal-50/20 to-stone-100 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans text-stone-900"
    >
      <div className="max-w-3xl mx-auto w-full space-y-6 pt-2 sm:pt-4">
        
        {/* App Branding Header */}
        <header className="text-center space-y-2 relative">
          {onCancel && (
            <button
              id="btn-skip-onboarding-to-dashboard"
              type="button"
              onClick={() => {
                playGentleTap();
                onCancel();
              }}
              className="sm:absolute sm:right-0 sm:top-0 text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer inline-flex items-center space-x-1 mb-2 sm:mb-0"
              title="Skip directly to dashboard"
            >
              <span>Skip to Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <div className="flex justify-center items-center">
            <AppLogo size="lg" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t.appName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-md mx-auto mt-0.5">
              {t.appTagline}
            </p>
          </div>

          {/* Step Progress Pill */}
          <div className="inline-flex items-center space-x-2 bg-teal-100/70 border border-teal-300/80 px-3.5 py-1 rounded-full text-xs font-black text-teal-900 shadow-2xs">
            <span>{step === 1 ? s1.stepBadge : s2.stepBadge}</span>
          </div>
        </header>

        {/* ============================================================ */}
        {/* SCREEN 1: PREFERRED LANGUAGE DROPDOWN & TERMS AND CONDITIONS */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* 1. LANGUAGE DROPDOWN CARD */}
            <section 
              id="onboarding-language-section"
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-teal-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-stone-900">
                      {s1.langTitle}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                      {s1.langSubtitle}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.nativeName || 'हिन्दी'}
                </span>
              </div>

              {/* Prominent Drop-Down Menu */}
              <div className="relative">
                <select
                  id="preferred-language-dropdown"
                  value={selectedLang}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  className="w-full bg-stone-50 hover:bg-stone-100/80 border-2 border-teal-600 focus:border-teal-700 rounded-xl py-3 px-4 text-base font-bold text-stone-900 cursor-pointer focus:outline-none transition-all pr-10 shadow-2xs"
                >
                  <optgroup label="🌟 North East Indian Languages (Priority)">
                    {SUPPORTED_LANGUAGES.filter(l => l.isNorthEast).map((lang) => (
                      <option key={lang.code} value={lang.code} className="font-bold py-1.5 text-stone-900">
                        {lang.nativeName} — {lang.name} ({lang.region})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 National & Universal Languages">
                    {SUPPORTED_LANGUAGES.filter(l => !l.isNorthEast).map((lang) => (
                      <option key={lang.code} value={lang.code} className="font-bold py-1.5 text-stone-900">
                        {lang.nativeName} — {lang.name} ({lang.region})
                      </option>
                    ))}
                  </optgroup>
                </select>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-teal-700">
                  <ChevronDown className="w-5 h-5 font-black" />
                </div>
              </div>

              {/* Quick Language Selection Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-500'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] opacity-75">({lang.name})</span>
                      {lang.isNorthEast && (
                        <span className="text-[9px] bg-teal-100 text-teal-800 px-1 rounded font-bold ml-0.5">
                          NE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. MEDIUM TO LARGE FONT SIZE SECTION */}
            <section 
              id="onboarding-font-size-section"
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-stone-900 flex items-center space-x-2">
                      <span>{s1.fontSizeTitle}</span>
                      <span className="text-[11px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                        Medium to Large
                      </span>
                    </h2>
                    <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                      {s1.fontSizeSubtitle}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  Senior Readability
                </span>
              </div>

              {/* Explanatory Mention Box */}
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                <p className="text-xs font-bold text-teal-950 leading-relaxed">
                  {s1.fontSizeMention}
                </p>
              </div>

              {/* Interactive Medium vs Large Selector */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  id="btn-font-size-medium"
                  type="button"
                  onClick={() => handleFontSizeChange('medium')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    fontSize === 'medium'
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-500/40 font-black'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  <span className="text-base font-bold">Aa</span>
                  <span className="text-xs font-bold mt-0.5">{s1.fontSizeMedium}</span>
                  <span className={`text-[10px] mt-0.5 ${fontSize === 'medium' ? 'text-teal-100' : 'text-stone-500'}`}>
                    Comfortable Senior Reading
                  </span>
                </button>

                <button
                  id="btn-font-size-large"
                  type="button"
                  onClick={() => handleFontSizeChange('large')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-500/40 font-black'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  <span className="text-xl font-black">Aa</span>
                  <span className="text-xs font-black mt-0.5">{s1.fontSizeLarge}</span>
                  <span className={`text-[10px] mt-0.5 ${fontSize === 'large' ? 'text-teal-100' : 'text-stone-500'}`}>
                    Extra-Large & High Visibility
                  </span>
                </button>
              </div>
            </section>

            {/* 3. TERMS AND CONDITIONS CARD */}
            <section 
              id="onboarding-terms-section"
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-stone-900">
                      {s1.termsTitle}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                      Important safety, medical, and data privacy principles
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  {s1.termsBadge}
                </span>
              </div>

              {/* 4 Systematic Core Terms Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                
                {/* Pillar 1: Non-emergency medical disclaimer */}
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-rose-800 font-black">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{t.termsMedicalTitle}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {t.termsMedicalBody}
                  </p>
                </div>

                {/* Pillar 2: Caregiver partnership */}
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-teal-900 font-black">
                    <Heart className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                    <span>{t.termsCaregiverTitle}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {t.termsCaregiverBody}
                  </p>
                </div>

                {/* Pillar 3: Offline audio privacy */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-900 font-black">
                    <Volume2 className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                    <span>{t.termsVoiceTitle}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {t.termsVoiceBody}
                  </p>
                </div>

                {/* Pillar 4: 100% On-device data security */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-950 font-black">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                    <span>{t.termsDataTitle}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {t.termsDataBody}
                  </p>
                </div>

                {/* Pillar 5: Senior Accessibility & Medium to Large Font Size */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-teal-950 font-black">
                    <Type className="w-3.5 h-3.5 shrink-0 text-teal-700" />
                    <span>{s1.termsAccessibilityTitle}</span>
                    <span className="text-[10px] bg-teal-200/80 text-teal-900 px-1.5 py-0.5 rounded font-bold ml-1">
                      Medium to Large Font Size
                    </span>
                  </div>
                  <p className="text-stone-700 text-[11px] leading-relaxed">
                    {s1.termsAccessibilityBody}
                  </p>
                </div>

              </div>

              {/* Full Terms Text Toggle */}
              {showFullTerms && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed max-h-40 overflow-y-auto space-y-2 animate-in fade-in">
                  <p><strong>General Terms:</strong> {t.termsIntro}</p>
                  <p><strong>Senior Accessibility & Font Size:</strong> High contrast layout with Medium to Large font size (18px - 22px) is calibrated across all screens to ensure effortless legibility for elderly patients and individuals with visual challenges.</p>
                  <p><strong>Medical Emergency:</strong> In serious acute medical emergencies, immediately contact your local healthcare provider or emergency medical service (108 / 112).</p>
                  <p><strong>Offline Guarantee:</strong> Photos, medication schedules, and anxiety journals are stored purely in your browser's private local storage.</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowFullTerms(!showFullTerms)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                >
                  {showFullTerms ? 'Hide detailed legal text' : 'Read full legal terms & conditions →'}
                </button>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-teal-700 rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-bold text-stone-800">
                    {s1.termsCheckbox}
                  </span>
                </label>
              </div>

              {/* Step 1 Continue Button */}
              <button
                id="btn-onboarding-continue-step1"
                type="button"
                onClick={handleProceedToStep2}
                disabled={!termsAccepted}
                className={`w-full py-3.5 px-5 rounded-xl font-black text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  termsAccepted
                    ? 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white shadow-teal-700/20'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>{s1.continueBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>

          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: ROLE SELECTION OR CAREGIVER MANDATORY DETAILS FORM */}
        {/* ============================================================ */}
        {step === 2 && !isCaregiverFormOpen && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {s2.mainHeading}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                {s2.subHeading}
              </p>
            </div>

            {/* The Two Distinct Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CARD 1: PATIENT COMPANION */}
              <article
                id="role-card-patient-select"
                onClick={() => handleSelectRole('patient')}
                className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-teal-500 hover:border-teal-600 hover:shadow-xl transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Smile className="w-7 h-7" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      <Heart className="w-3.5 h-3.5 text-rose-500 mr-1 fill-rose-500" />
                      Senior / Patient
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                      {s2.patientTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1.5 font-medium leading-relaxed">
                      {s2.patientDesc}
                    </p>
                  </div>

                  {/* Systematic Checklist of What You Get */}
                  <ul className="space-y-1.5 pt-1 text-xs font-semibold text-stone-700">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Large, easy-to-read friendly buttons</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Family photos & audio voice stories</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>1-Tap Emergency Caregiver SOS</span>
                    </li>
                  </ul>
                </div>

                <button
                  id="btn-select-patient-finish"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('patient');
                  }}
                  className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-black text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{s2.patientBtn}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </article>

              {/* CARD 2: CAREGIVER PORTAL */}
              <article
                id="role-card-caregiver-select"
                onClick={() => handleSelectRole('caregiver')}
                className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-500 hover:border-amber-600 hover:shadow-xl transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <Users className="w-3.5 h-3.5 text-amber-700 mr-1" />
                      Family / Guardian
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                      {s2.caregiverTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1.5 font-medium leading-relaxed">
                      {s2.caregiverDesc}
                    </p>
                  </div>

                  {/* Systematic Checklist of What You Get */}
                  <ul className="space-y-1.5 pt-1 text-xs font-semibold text-stone-700">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Instant safety & wandering perimeter alerts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Medication adherence & hydration tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Live GPS geofence & patient management</span>
                    </li>
                  </ul>
                </div>

                <button
                  id="btn-select-caregiver-finish"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('caregiver');
                  }}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-black active:bg-stone-950 text-amber-300 font-black text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Enter Caregiver Details →</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </article>

            </div>

            {/* Back Button to Step 1 */}
            <div className="flex items-center justify-center pt-2">
              <button
                id="btn-onboarding-back-to-step1"
                type="button"
                onClick={() => {
                  playGentleTap();
                  setStep(1);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{s2.backBtn}</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2 (CAREGIVER DETAILS FORM): ALL FIELDS ARE MANDATORY  */}
        {/* ============================================================ */}
        {step === 2 && isCaregiverFormOpen && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <section 
              id="caregiver-mandatory-details-form"
              className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-amber-200 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                      Caregiver & Senior Guardian Registration
                    </h2>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      Enter your details to configure emergency alerts, medication management, and GPS zones.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 mr-1" />
                  All Fields Required (*)
                </span>
              </div>

              {/* Validation Alert */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleCaregiverFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  
                  {/* Field 1: Caregiver Full Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 flex items-center justify-between">
                      <span>Caregiver's Full Name *</span>
                      <span className="text-[10px] text-stone-400 font-normal">Primary Guardian</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={caregiverName}
                        onChange={(e) => {
                          setCaregiverName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="e.g., Pooja Sharma"
                        className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-stone-900 font-medium focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Field 2: Relationship to Senior */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 flex items-center justify-between">
                      <span>Relationship to Senior *</span>
                      <span className="text-[10px] text-stone-400 font-normal">Relation</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={relation}
                      onChange={(e) => {
                        setRelation(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g., Daughter / Son / Spouse / Attendant"
                      className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-stone-900 font-medium focus:outline-none transition-all shadow-2xs"
                    />
                    {/* Quick Relation Suggestions */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {['Daughter', 'Son', 'Spouse', 'Family Guardian', 'Nurse'].map((rel) => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => {
                            playGentleTap();
                            setRelation(rel);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold cursor-pointer transition-colors ${
                            relation === rel
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black'
                              : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
                          }`}
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 3: Emergency Mobile Phone */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 flex items-center justify-between">
                      <span>Mobile Phone (Emergency Line) *</span>
                      <span className="text-[10px] text-emerald-700 font-normal">1-Tap SOS calls this</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="e.g., +91 98765 43210"
                        className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-stone-900 font-medium focus:outline-none transition-all shadow-2xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Field 4: City / Residence Location */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 flex items-center justify-between">
                      <span>City / Residential Location *</span>
                      <span className="text-[10px] text-stone-400 font-normal">Home Base</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g., Guwahati, Assam / New Delhi"
                      className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-stone-900 font-medium focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  {/* Field 5: 4-Digit Security Access PIN */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 flex items-center justify-between">
                      <span>4-Digit Security PIN *</span>
                      <span className="text-[10px] text-stone-400 font-normal">Protects Caregiver Mode</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={securityPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                        setSecurityPin(val);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g., 1234"
                      className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-stone-900 font-bold focus:outline-none transition-all shadow-2xs tracking-widest font-mono"
                    />
                    <span className="text-[10px] text-stone-500 block">
                      Used to unlock caregiver settings and medication schedule changes.
                    </span>
                  </div>

                  {/* Field 6: Senior / Patient's Full Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 flex items-center justify-between">
                      <span>Senior / Patient's Name *</span>
                      <span className="text-[10px] text-teal-700 font-normal">Person Under Care</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g., Rameshwar Ji / Devendra Sharma"
                      className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-stone-900 font-medium focus:outline-none transition-all shadow-2xs"
                    />
                    <span className="text-[10px] text-stone-500 block">
                      Displayed on patient's companion tablet/phone.
                    </span>
                  </div>

                </div>

                {/* Form Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playGentleTap();
                      setIsCaregiverFormOpen(false);
                      setFormError(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center space-x-1.5 order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Role</span>
                  </button>

                  <button
                    id="btn-submit-caregiver-mandatory-details"
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-black active:bg-stone-950 text-amber-300 font-black text-sm rounded-xl shadow-xs transition-all inline-flex items-center justify-center space-x-2 cursor-pointer order-1 sm:order-2"
                  >
                    <span>Register Details & Open Caregiver Portal →</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </form>
            </section>

          </div>
        )}

      </div>

      {/* Systematic, Minimalist Footer */}
      <footer className="max-w-3xl mx-auto w-full pt-8 pb-4 text-center space-y-1.5 border-t border-stone-200 mt-8">
        <div className="flex items-center justify-center space-x-3 text-xs font-semibold text-stone-500">
          <span className="flex items-center text-teal-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
            100% Offline & Private
          </span>
          <span className="text-stone-300">•</span>
          <span>No Cloud Tracking</span>
          <span className="text-stone-300">•</span>
          <span>Instant Emergency SOS</span>
        </div>
        <p className="text-[11px] text-stone-400">
          Sahayak Sathi / Smriti • North East Indian Edition (Assamese, Manipuri, Nepali, Bodo) + Hindi & English
        </p>
      </footer>
    </div>
  );
};
