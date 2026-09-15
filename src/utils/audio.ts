import { Language } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Active sound nodes
let activeAmbientNodes: { stop: () => void } | null = null;

export function stopAmbientSound() {
  if (activeAmbientNodes) {
    try {
      activeAmbientNodes.stop();
    } catch (e) {
      console.warn('Error stopping ambient node', e);
    }
    activeAmbientNodes = null;
  }
}

// Play gentle synthesized ambient sounds
export function playAmbientSound(type: 'flute' | 'rain' | 'bell' | 'om'): boolean {
  stopAmbientSound();
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (type === 'bell') {
      // Tibetan / Temple Singing Bowl
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz healing tone
      
      // Harmonics
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(864, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6.0);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.0);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 6.0);
      osc2.stop(ctx.currentTime + 6.0);

      activeAmbientNodes = {
        stop: () => {
          try {
            osc.stop();
            osc2.stop();
          } catch (e) {}
        }
      };
      return true;
    }

    if (type === 'om') {
      // Warm meditative tanpura / OM drone
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const f0 = 136.1; // OM frequency
      const freqs = [f0, f0 * 1.5, f0 * 2, f0 * 0.5];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.15 / (i + 1), ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      activeAmbientNodes = {
        stop: () => {
          oscs.forEach(o => {
            try { o.stop(); } catch(e) {}
          });
        }
      };
      return true;
    }

    if (type === 'flute') {
      // Indian Bansuri Flute tone with gentle tremolo & vibrato
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();

      vibrato.frequency.value = 4.5; // gentle 4.5 Hz vibrato
      vibratoGain.gain.value = 6;
      vibrato.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4 note

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      vibrato.start();
      osc.start();

      activeAmbientNodes = {
        stop: () => {
          try {
            vibrato.stop();
            osc.stop();
          } catch (e) {}
        }
      };
      return true;
    }

    if (type === 'rain') {
      // Pink / Brown filtered noise for gentle rain
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.22, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();

      activeAmbientNodes = {
        stop: () => {
          try {
            noise.stop();
          } catch (e) {}
        }
      };
      return true;
    }
  } catch (err) {
    console.error('Audio synthesis failed:', err);
    return false;
  }
  return false;
}

// Emergency / Caregiver alert acoustic chime
export function playAlertChime(isCritical = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCritical ? 'sawtooth' : 'sine';
    
    // Pulsing two-tone alert
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, now);
    osc.frequency.setValueAtTime(isCritical ? 660 : 440, now + 0.18);
    osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, now + 0.36);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isCritical ? 0.7 : 0.5));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isCritical ? 0.7 : 0.5));
  } catch (err) {
    console.warn('Alert chime could not play:', err);
  }
}

// Gentle tap feedback chime
export function playGentleTap() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {}
}

// Web Speech Synthesis (Text to Speech) with Robust Offline Multi-Voice Fallback
const languageLocaleMap: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN',
  mni: 'mni-IN',
  ne: 'ne-IN',
  brx: 'brx-IN',
};

// Cached voices list
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  if (cachedVoices.length > 0) return cachedVoices;
  try {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  } catch (e) {
    cachedVoices = [];
  }
  return cachedVoices;
}

// Pre-warm voices on script load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        cachedVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {}
    };
  }
}

// Find the best locally available voice for offline use
function findBestOfflineVoice(targetLocale: string, lang: Language): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  const primaryLang = targetLocale.split('-')[0].toLowerCase();

  // 1. Exact locale match (e.g. hi-IN)
  let match = voices.find(v => v.lang.toLowerCase() === targetLocale.toLowerCase());
  if (match) return match;

  // 2. Language prefix match (e.g. hi, en)
  match = voices.find(v => v.lang.toLowerCase().startsWith(primaryLang));
  if (match) return match;

  // 3. Any available Indic voice offline (Hindi, Bengali, Tamil, etc.)
  const indicPrefixes = ['hi', 'bn', 'ta', 'te', 'gu', 'mr', 'kn', 'ml', 'pa'];
  match = voices.find(v => indicPrefixes.some(p => v.lang.toLowerCase().startsWith(p)));
  if (match && lang !== 'en') return match;

  // 4. Any Indian English voice (en-IN)
  match = voices.find(v => v.lang.toLowerCase() === 'en-in');
  if (match) return match;

  // 5. Any English voice
  match = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  if (match) return match;

  // 6. Device default voice
  match = voices.find(v => v.default);
  if (match) return match;

  // 7. Fallback to first voice
  return voices[0] || null;
}

// Play pleasant speech feedback chime if TTS hardware or engine fails
export function playSpeechFeedbackChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

// Keep-alive timer for Android SpeechSynthesis pause bug
let speechKeepAliveTimer: any = null;

function clearKeepAlive() {
  if (speechKeepAliveTimer) {
    clearInterval(speechKeepAliveTimer);
    speechKeepAliveTimer = null;
  }
}

export function speakText(
  text: string, 
  lang: Language = 'en', 
  onEnd?: () => void,
  rate = 0.92 // slightly slower, very clear for elderly listeners
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // If SpeechSynthesis is missing, fallback to audio chime
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
    playSpeechFeedbackChime();
    if (onEnd) setTimeout(onEnd, 300);
    return false;
  }

  try {
    // Resume audio context & speech engine if paused by Android OS
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    
    // Stop any stale speech
    window.speechSynthesis.cancel();
    clearKeepAlive();

    // Give a tiny 30ms tick to let Android/Chrome cancel finish cleanly
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLocale = languageLocaleMap[lang] || 'en-IN';
        
        // Find offline voice
        const matchedVoice = findBestOfflineVoice(targetLocale, lang);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          // Default fallback language safe for offline Android
          utterance.lang = (lang === 'hi' || lang === 'as' || lang === 'ne' || lang === 'mni' || lang === 'brx')
            ? 'hi-IN'
            : 'en-IN';
        }

        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        let finished = false;
        const handleFinish = () => {
          if (finished) return;
          finished = true;
          clearKeepAlive();
          if (onEnd) onEnd();
        };

        utterance.onend = handleFinish;
        
        utterance.onerror = (err) => {
          console.warn('Speech synthesis offline error, trying voice fallback:', err);
          // If error was language-unavailable, retry with default language
          if (!finished) {
            clearKeepAlive();
            playSpeechFeedbackChime();
            handleFinish();
          }
        };

        // Android SpeechSynthesis keep-alive (resumes every 6 seconds to prevent sleep)
        speechKeepAliveTimer = setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.resume();
          } else {
            clearKeepAlive();
          }
        }, 6000);

        window.speechSynthesis.speak(utterance);
      } catch (innerErr) {
        console.warn('TTS speak error, playing audio fallback:', innerErr);
        playSpeechFeedbackChime();
        if (onEnd) onEnd();
      }
    }, 35);

    return true;
  } catch (err) {
    console.warn('TTS initialization failed:', err);
    playSpeechFeedbackChime();
    if (onEnd) onEnd();
    return false;
  }
}
export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.3);
    });
  } catch (e) {
    console.warn('Game chime error', e);
  }
}

export function playCardFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch (e) {
    console.warn('Card flip audio error', e);
  }
}

export function playGentleIncorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn('Incorrect sound error', e);
  }
}

// Synthesized tone for colored box sequence game (100% offline Web Audio)
export function playBoxTone(colorIndex: number, duration: number = 0.35) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const tones = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    const freq = tones[colorIndex % tones.length];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle'; // Warm, resonant tone
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Box tone audio error', e);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Web Speech Recognition helper
export function getSpeechRecognitionInstance(lang: Language = 'en'): any | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageLocaleMap[lang] || 'en-IN';
    return recognition;
  } catch (e) {
    console.warn('SpeechRecognition initialization error', e);
    return null;
  }
}
