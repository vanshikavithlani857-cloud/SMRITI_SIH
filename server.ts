import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Direct APK Download Endpoint
  app.get('/api/download-apk', (req, res) => {
    const primaryApkPath = path.join(process.cwd(), 'Smriti.apk');
    const fallbackApkPath = path.join(process.cwd(), 'SahayakSathi.apk');
    const targetPath = fs.existsSync(primaryApkPath) ? primaryApkPath : fallbackApkPath;
    res.download(targetPath, 'Smriti.apk', (err) => {
      if (err) {
        res.status(404).json({ error: 'APK file not found' });
      }
    });
  });

  // Multilingual Voice Assistant Endpoint with Gemini 3.8 Flash
  app.post('/api/voice-assistant', async (req, res) => {
    const { message, language = 'en', role = 'patient', patientName = 'Dadaji' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      as: 'Assamese (অসমীয়া)',
      mni: 'Manipuri / Meiteilon (মৈতৈলোন্)',
      ne: 'Nepali (नेपाली)',
      brx: 'Bodo (बर’/बड़ो)',
    };

    const targetLangName = languageNames[language] || 'Hindi or English';

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful offline fallback with multilingual compassionate responses
      const offlineReply = getOfflineCompassionateResponse(message, language, patientName);
      return res.json(offlineReply);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are 'Smriti' (स्मृति), a respectful, caring, soothing, and devoted eldercare companion, memory supporter, and health assistant for ${patientName}.
The current user is communicating in ${targetLangName}.
User role: ${role}.
User input: "${message}".

Instructions:
1. Reply purely in ${targetLangName}.
2. Keep your response short, calm, and comforting (1 to 3 clear sentences max) because this will be read aloud through Text-To-Speech to an elderly individual.
3. If the user mentions feeling anxious, scared, nervous, panicked, or having palpitations, respond with immediate soothing guidance (e.g., reminding them to breathe gently and that they are safe) and append "[ACTION: OPEN_ANXIETY]" and "[ALERT: High anxiety reported by patient]".
4. If the user says they fell down, have severe pain, chest pain, or need urgent help / emergency, tell them you are alerting their caregiver right now, stay calm, and append "[ACTION: TRIGGER_SOS]" and "[ALERT: Urgent emergency SOS requested by patient]".
5. If the user asks about family photos, memories, or wants to see their children/grandchildren, warmly mention looking at family memories and append "[ACTION: SHOW_PHOTOS]".
6. If the user asks about medicine, pills, tablets, or routine, reassure them and append "[ACTION: SHOW_MEDICINES]".
7. If the user asks for calming music, bhajan, or sounds, append "[ACTION: PLAY_CALM]".

Format your response naturally as conversational text, with any tags at the very end.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API response timeout')), 5000)
      );

      const geminiResponse = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        timeoutPromise,
      ]);

      const rawText = geminiResponse.text?.trim() || '';

      // Parse tags
      let action: string | null = null;
      let alertReason: string | null = null;

      let cleanText = rawText;

      const actionMatch = cleanText.match(/\[ACTION:\s*([^\]]+)\]/i);
      if (actionMatch) {
        action = actionMatch[1].trim();
        cleanText = cleanText.replace(/\[ACTION:\s*[^\]]+\]/gi, '').trim();
      }

      const alertMatch = cleanText.match(/\[ALERT:\s*([^\]]+)\]/i);
      if (alertMatch) {
        alertReason = alertMatch[1].trim();
        cleanText = cleanText.replace(/\[ALERT:\s*[^\]]+\]/gi, '').trim();
      }

      return res.json({
        replyText: cleanText || getDefaultGreeting(language, patientName),
        action,
        alertTriggered: Boolean(alertReason),
        alertReason,
      });
    } catch (err: any) {
      console.error('Error generating AI response:', err?.message || err);
      // Fallback seamlessly
      const offlineReply = getOfflineCompassionateResponse(message, language, patientName);
      return res.json(offlineReply);
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smriti server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err?.message || err);
  });
}

function getDefaultGreeting(lang: string, name: string): string {
  switch (lang) {
    case 'hi':
      return `नमस्ते ${name}, मैं आपकी स्मृति (Smriti) साथी हूँ। मैं आपकी क्या मदद करूँ?`;
    case 'as':
      return `নমস্কাৰ ${name}, মই আপোনাৰ স্মৃতি (Smriti) সংগী। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?`;
    case 'mni':
      return `খুরুমজরি ${name}, ঐহাক অদোমগী স্মৃতি (Smriti) সংগীনি। ঐহাক্না করম্না মতেং পাংগদগে?`;
    case 'ne':
      return `नमस्ते ${name}, म तपाईँको स्मृति (Smriti) साथी हुँ। म तपाईँलाई कसरी सहयोग गर्न सक्छु?`;
    case 'brx':
      return `खुलुमबाय ${name}, आं नोंथांनि स्मृति (Smriti) लोगो। आं नोंथांखौ माबोरै हेफाजाब होनो हागोन?`;
    default:
      return `Hello ${name}, I am your Smriti memory & care companion. How can I help you feel peaceful today?`;
  }
}

function getOfflineCompassionateResponse(text: string, lang: string, name: string) {
  const lower = text.toLowerCase();

  // Emergency / SOS
  if (lower.includes('bachao') || lower.includes('madad') || lower.includes('help') || lower.includes('fall') || lower.includes('gir gaya') || lower.includes('emergency') || lower.includes('dard')) {
    return {
      replyText: lang === 'hi' 
        ? 'घबराइए मत, मैंने आपके केयरगिवर को तुरंत आपातकालीन सूचना भेज दी है। आप आराम से बैठिए, वे आ रहे हैं।'
        : lang === 'gu'
        ? 'ચિંતા ના કરો, મેં તમારા કેરગીવરને તાત્કાલિક સંદેશ મોકલી દીધો છે. શાંતિથી બેસો.'
        : 'Please stay calm. I have dispatched an urgent alert to your caregiver right now. They are notified.',
      action: 'TRIGGER_SOS',
      alertTriggered: true,
      alertReason: 'Urgent emergency SOS triggered via voice by patient',
    };
  }

  // Anxiety
  if (lower.includes('anxious') || lower.includes('ghabrahat') || lower.includes('dar') || lower.includes('panic') || lower.includes('bechaini') || lower.includes('bhay') || lower.includes('breathe')) {
    return {
      replyText: lang === 'hi'
        ? 'चिंता मत कीजिए, मैं आपके साथ हूँ। चलिए एक गहरी सांस अंदर लेते हैं। शांत मन से बैठिए।'
        : lang === 'gu'
        ? 'ચિંતા ના કરો, હું તમારી સાથે છું. ચાલો ઊંડો શ્વાસ લઈએ અને મનને શાંત કરીએ.'
        : 'Do not worry, I am right here with you. Let us take slow, deep breaths together. You are safe.',
      action: 'OPEN_ANXIETY',
      alertTriggered: true,
      alertReason: 'Patient reported feeling anxious via voice',
    };
  }

  // Photos / Memories
  if (lower.includes('photo') || lower.includes('tasveer') || lower.includes('yaad') || lower.includes('family') || lower.includes('bachhe') || lower.includes('parivar') || lower.includes('chitra')) {
    return {
      replyText: lang === 'hi'
        ? 'ज़रूर, मैं आपकी खूबसूरत पारिवारिक यादें और तस्वीरें खोल रहा हूँ।'
        : lang === 'gu'
        ? 'ચોક્કસ, હું તમારી સુંદર પારિવારિક યાદો અને ફોટા બતાવું છું.'
        : 'Opening your treasured family photos and memories now.',
      action: 'SHOW_PHOTOS',
      alertTriggered: false,
      alertReason: null,
    };
  }

  // Medicine
  if (lower.includes('dawa') || lower.includes('medicine') || lower.includes('goli') || lower.includes('tablet')) {
    return {
      replyText: lang === 'hi'
        ? 'यहाँ आपकी आज की दवाइयों की सूची है। कृपया पानी के साथ समय पर लें।'
        : lang === 'gu'
        ? 'અહીં તમારી આજની દવાઓની યાદી છે. સમયસર પાણી સાથે દવા લઈ લેજો.'
        : 'Here is your medication schedule for today. Please take it with a glass of water.',
      action: 'SHOW_MEDICINES',
      alertTriggered: false,
      alertReason: null,
    };
  }

  // General calming response
  return {
    replyText: getDefaultGreeting(lang, name),
    action: null,
    alertTriggered: false,
    alertReason: null,
  };
}

startServer();
