import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  Send, 
  Sparkles, 
  HeartHandshake, 
  AlertCircle 
} from 'lucide-react';
import { Language, CaregiverAlert } from '../types';
import { translations } from '../i18n/translations';
import { 
  speakText, 
  stopSpeaking, 
  getSpeechRecognitionInstance, 
  playGentleTap, 
  playAlertChime 
} from '../utils/audio';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  patientName: string;
  onNavigateToAnxiety: () => void;
  onNavigateToPhotos: () => void;
  onNavigateToMeds: () => void;
  onTriggerSOS: (reason?: string) => void;
  onAddCaregiverAlert: (alert: Omit<CaregiverAlert, 'id' | 'timestamp'>) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  patientName,
  onNavigateToAnxiety,
  onNavigateToPhotos,
  onNavigateToMeds,
  onTriggerSOS,
  onAddCaregiverAlert,
}) => {
  const t = translations[language];

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantReply, setAssistantReply] = useState('');
  const [isSpeakingReply, setIsSpeakingReply] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition when modal opens or language changes
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      return;
    }

    const recognition = getSpeechRecognitionInstance(language);
    if (!recognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
      setInputText(current);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Auto-welcome greeting if empty
    if (!assistantReply) {
      const initialGreeting = language === 'hi'
        ? `नमस्ते ${patientName}, मैं आपका सहायक साथी हूँ। आप मुझसे कुछ भी पूछ सकते हैं।`
        : language === 'gu'
        ? `નમસ્તે ${patientName}, હું તમારો સહાયક સાથી છું. તમે મને કંઈ પણ પૂછી શકો છો.`
        : language === 'mr'
        ? `नमस्कार ${patientName}, मी आपला सहायक साथी आहे. आपण मला काहीही विचारू शकता.`
        : language === 'bn'
        ? `নমস্কার ${patientName}, আমি আপনার সহায়ক সাথী। বলুন কীভাবে সাহায্য করতে পারি?`
        : language === 'ta'
        ? `வணக்கம் ${patientName}, நான் உங்கள் சகாயக் சாதி. உங்களுக்கு என்ன உதவி வேண்டும்?`
        : `Hello ${patientName}, I am right here with you. Speak or ask anything anytime.`;
      
      setAssistantReply(initialGreeting);
      setIsSpeakingReply(true);
      speakText(initialGreeting, language, () => setIsSpeakingReply(false));
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopSpeaking();
    };
  }, [isOpen, language]);

  const startListening = () => {
    playGentleTap();
    stopSpeaking();
    setIsSpeakingReply(false);
    setTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start issue:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText || transcript).trim();
    if (!message) return;

    playGentleTap();
    stopListening();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language,
          role: 'patient',
          patientName,
        }),
      });

      const data = await response.json();
      const reply = data.replyText || '';
      setAssistantReply(reply);
      setInputText('');
      setTranscript('');

      // Play vocal response
      setIsSpeakingReply(true);
      speakText(reply, language, () => {
        setIsSpeakingReply(false);
      });

      // Handle server-directed actions
      if (data.alertTriggered && data.alertReason) {
        playAlertChime(true);
        onAddCaregiverAlert({
          type: 'voice_distress',
          priority: 'critical',
          title: 'Urgent Voice Distress Reported',
          message: `${patientName}: "${message}" -> ${data.alertReason}`,
          patientName,
          status: 'active',
        });
      }

      if (data.action === 'TRIGGER_SOS') {
        onTriggerSOS(data.alertReason || 'Emergency voice request');
        setTimeout(() => onClose(), 1200);
      } else if (data.action === 'OPEN_ANXIETY') {
        setTimeout(() => {
          onClose();
          onNavigateToAnxiety();
        }, 1200);
      } else if (data.action === 'SHOW_PHOTOS') {
        setTimeout(() => {
          onClose();
          onNavigateToPhotos();
        }, 1200);
      } else if (data.action === 'SHOW_MEDICINES') {
        setTimeout(() => {
          onClose();
          onNavigateToMeds();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to communicate with voice assistant:', err);
      const fallback = language === 'hi' 
        ? 'मैं आपकी बात समझ रहा हूँ। आप सुरक्षित हैं, मैं हमेशा आपके साथ हूँ।' 
        : 'I hear you. You are completely safe and we are right beside you.';
      setAssistantReply(fallback);
      speakText(fallback, language);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplayVoice = () => {
    if (!assistantReply) return;
    playGentleTap();
    setIsSpeakingReply(true);
    speakText(assistantReply, language, () => setIsSpeakingReply(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="voice-assistant-modal-card"
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.voiceModalTitle}</h2>
              <p className="text-xs sm:text-sm text-teal-100">{t.voiceModalSubtitle}</p>
            </div>
          </div>
          <button
            id="close-voice-modal-btn"
            onClick={() => {
              stopListening();
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">

          {/* Central Animated Mic Orb */}
          <div className="flex flex-col items-center justify-center py-4 sm:py-6">
            <div className="relative">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
                  <div className="absolute -inset-4 rounded-full bg-teal-500/10 animate-pulse" />
                </>
              )}
              <button
                id="voice-mic-main-button"
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${
                  isListening
                    ? 'bg-rose-500 hover:bg-rose-600 text-white scale-105 shadow-rose-500/30'
                    : 'bg-gradient-to-tr from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white shadow-teal-600/30'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-10 h-10 mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10 mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Speak</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-sm font-semibold text-stone-700 text-center">
              {isListening ? t.listening : isProcessing ? t.processing : t.speakPrompt}
            </p>

            {/* Realtime voice transcription preview */}
            {transcript && (
              <div className="mt-2 px-4 py-2 bg-teal-50 text-teal-800 text-sm rounded-xl border border-teal-200 text-center max-w-md animate-fade-in">
                “{transcript}”
              </div>
            )}
          </div>

          {/* Assistant Voice Response Box */}
          {assistantReply && (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-800 uppercase tracking-wide">
                <span className="flex items-center space-x-1.5">
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  <span>Sahayak Companion</span>
                </span>
                <button
                  onClick={handleReplayVoice}
                  className="flex items-center space-x-1 text-teal-700 hover:text-teal-900 bg-teal-100/70 hover:bg-teal-200 px-2.5 py-1 rounded-lg transition-colors text-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingReply ? 'animate-bounce' : ''}`} />
                  <span>{t.speakResponse}</span>
                </button>
              </div>
              <p className="text-base sm:text-lg text-stone-900 font-medium leading-relaxed">
                {assistantReply}
              </p>
            </div>
          )}

          {/* Prompt Suggestion Chips in Selected Language */}
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              {t.tryAsking}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[t.samplePrompt1, t.samplePrompt2, t.samplePrompt3, t.samplePrompt4].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.replace(/[“”"']/g, ''))}
                  className="text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-100 hover:bg-teal-50 hover:border-teal-200 border border-stone-200 text-stone-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Quiet Text Input Option */}
          <div className="pt-2 border-t border-stone-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.typeMessagePlaceholder}
                className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-teal-600 text-sm"
              />
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center space-x-1"
              >
                <span>{t.send}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
