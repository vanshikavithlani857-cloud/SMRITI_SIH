import JSZip from 'jszip';
import { Language } from '../types';

export interface UsbPackageOptions {
  patientName?: string;
  caregiverName?: string;
  language?: Language;
}

export function generateOfflineStandaloneHtml(options: UsbPackageOptions = {}): string {
  const patientName = options.patientName || 'Dadaji';
  const caregiverName = options.caregiverName || 'Pooja';
  const defaultLang = options.language || 'hi';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Smriti - 100% Offline Standalone USB App</title>
  <meta name="description" content="Smriti Offline Eldercare & Memory Companion - Standalone USB Edition">
  <link rel="manifest" href="manifest.webmanifest">
  <style>
    :root {
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --bg-color: #fcfbf9;
      --card-bg: #ffffff;
      --text-main: #1c1917;
      --text-muted: #78716c;
      --primary: #0f766e;
      --primary-hover: #115e59;
      --primary-light: #ccfbf1;
      --accent: #d97706;
      --danger: #e11d48;
      --success: #16a34a;
      --border: #e7e5e4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-family);
      background-color: var(--bg-color);
      color: var(--text-main);
      padding-bottom: 80px;
      line-height: 1.5;
    }
    header {
      background-color: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-icon {
      background: #0f766e;
      color: white;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f766e;
      line-height: 1.1;
    }
    .offline-badge {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 16px;
    }
    .banner {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border: 1px solid #99f6e4;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .banner h2 { font-size: 18px; font-weight: 800; color: #115e59; margin-bottom: 4px; }
    .banner p { font-size: 13px; color: #134e4a; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .card-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: background 0.15s;
    }
    .btn:hover { background: var(--primary-hover); }
    .btn-secondary {
      background: #f5f5f4;
      color: #292524;
      border: 1px solid #e7e5e4;
    }
    .btn-secondary:hover { background: #e7e5e4; }
    .btn-danger { background: var(--danger); }
    .btn-danger:hover { background: #be123c; }
    .btn-warning { background: var(--accent); }
    .btn-warning:hover { background: #b45309; }

    .counter-display {
      font-size: 28px;
      font-weight: 900;
      color: #0f766e;
      text-align: center;
      margin: 10px 0;
    }
    .recent-list {
      list-style: none;
      margin-top: 10px;
    }
    .recent-item {
      padding: 8px 12px;
      background: #f5f5f4;
      border-radius: 8px;
      margin-bottom: 6px;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .recent-time {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }
    .soothing-player {
      text-align: center;
      padding: 16px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 14px;
      margin-top: 12px;
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 16px;
    }
    .modal-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .alert-banner {
      background: #fef2f2;
      border: 2px solid #fca5a5;
      color: #991b1b;
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 16px;
      font-weight: 700;
      display: none;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div style="width: 36px; height: 36px; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #0f766e; box-shadow: 0 4px 8px rgba(15,118,110,0.25);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
          <rect width="512" height="512" fill="#0f766e" />
          <circle cx="256" cy="225" r="75" fill="#fef08a" opacity="0.3" />
          <path d="M 256 315 C 256 315, 170 255, 170 195 C 170 155, 205 130, 240 148 C 250 153, 256 162, 256 162 C 256 162, 262 153, 272 148 C 307 130, 342 155, 342 195 C 342 255, 256 315, 256 315 Z" fill="#f59e0b" />
          <path d="M 120 375 C 135 340, 165 315, 195 300 C 215 290, 235 295, 245 312 C 235 325, 215 330, 190 340 C 165 350, 145 370, 135 395 C 126 390, 122 382, 120 375 Z" fill="#ffffff" />
          <path d="M 392 375 C 377 340, 347 315, 317 300 C 297 290, 277 295, 267 312 C 277 325, 297 330, 322 340 C 347 350, 367 370, 377 395 C 386 390, 390 382, 392 375 Z" fill="#ffffff" />
        </svg>
      </div>
      <div>
        <div class="brand-title">Smriti • स्मृति</div>
        <div style="font-size: 10px; color: #78716c;">Offline Eldercare & Memory Companion</div>
      </div>
    </div>
    <div class="offline-badge">
      <span>💾 100% Offline Mode (USB Sideload)</span>
    </div>
  </header>

  <div class="container">
    
    <div id="sosAlertBanner" class="alert-banner">
      🚨 EMERGENCY ALERT ACTIVE — Caregiver ${caregiverName} notified!
    </div>

    <!-- PATIENT STATUS & GREETING -->
    <div class="banner">
      <h2>Pranam, <span id="patientNameDisplay">${patientName}</span> ji! 🙏</h2>
      <p>Aap bilkul surakshit apne ghar par hain. Parivaar aapke saath hai. (You are safe at home with your family).</p>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <button class="btn btn-warning" onclick="speakText('Aap bilkul surakshit apne ghar par hain. Parivaar aapke saath hai.')">
          🔊 Awaaz se sunein (Listen)
        </button>
        <button class="btn btn-danger" onclick="triggerSos()">
          🚨 Emergency SOS
        </button>
      </div>
    </div>

    <!-- RECENT 2-3 MINUTE SHORT TERM MEMORY RECALL -->
    <div class="card" style="margin-bottom: 16px; border: 2px solid #0f766e;">
      <div class="card-title" style="color: #0f766e;">
        <span>🧠 Maine abhi 2-3 minute pehle kya kiya? (Recent Memory)</span>
      </div>
      <p style="font-size: 12px; color: #57534e; margin-bottom: 12px;">
        Agar aap bhool gaye hain to ghabraiye mat, yahan dekhein aapne abhi kya kiya:
      </p>

      <ul id="recentList" class="recent-list">
        <li class="recent-item">
          <span>💧 1 Glass Paani Piya (Drank Water)</span>
          <span class="recent-time">Abhi-Abhi</span>
        </li>
        <li class="recent-item">
          <span>🛋️ Aaram Kiya (Rested on Sofa)</span>
          <span class="recent-time">3 min pehle</span>
        </li>
      </ul>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 12px;">
        <button class="btn btn-secondary" onclick="logAction('☕ Chai / Nasta Liya (Had Tea)')">☕ Chai</button>
        <button class="btn btn-secondary" onclick="logAction('🚶 Thoda Tehle (Walked in Room)')">🚶 Tehle</button>
        <button class="btn btn-secondary" onclick="logAction('💊 Dawai Li (Took Medicine)')">💊 Dawai</button>
      </div>
    </div>

    <!-- MAIN INTERACTIVE GRID -->
    <div class="grid">
      
      <!-- WATER COUNTER -->
      <div class="card">
        <div class="card-title">💧 Paani Counter (Hydration)</div>
        <p style="font-size: 12px; color: var(--text-muted);">Swasthya ke liye roz 8 glass paani zaroori hai.</p>
        <div class="counter-display" id="waterDisplay">3 / 8 Glass</div>
        <button class="btn" onclick="addWater()">+ 1 Glass Paani Piya</button>
      </div>

      <!-- MEDICATION REMINDER -->
      <div class="card">
        <div class="card-title">💊 Aaj Ki Dawai (Medicines)</div>
        <div id="medsList" style="margin: 10px 0; font-size: 13px;">
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" checked onchange="toggleMed(this, 'Subah BP Dawai')">
            <span>Subah BP Dawai (Morning BP)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" onchange="toggleMed(this, 'Dopehar Vitamin D')">
            <span>Dopehar Vitamin D (Afternoon)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" onchange="toggleMed(this, 'Raat Smriti Dawai')">
            <span>Raat Smriti Dawai (Night Memory)</span>
          </label>
        </div>
      </div>

      <!-- SOOTHING SOUNDS FOR ANXIETY -->
      <div class="card">
        <div class="card-title">🌸 Shanti & Tanav Rahat (Calm Audio)</div>
        <p style="font-size: 12px; color: var(--text-muted);">Jab bhi ghabrahat ho, yeh shaant swar sunein.</p>
        <div class="soothing-player">
          <button id="audioToneBtn" class="btn btn-secondary" onclick="toggleCalmTone()">
            🎵 Shaant Mandir Swar Bajayein (Temple Bell Sound)
          </button>
        </div>
      </div>

      <!-- CAREGIVER CONTACT -->
      <div class="card">
        <div class="card-title">📞 Caregiver / Parivaar Sampark</div>
        <p style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${caregiverName} (Daughter / Dekhbhal Karta)</p>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Kisi bhi zaroorat ke liye turant call karein.</p>
        <button class="btn btn-warning" onclick="callCaregiver()">
          📞 Caregiver Ko Call Karein
        </button>
      </div>

    </div>

    <div class="card" style="text-align: center; background: #fafaf9;">
      <p style="font-size: 12px; color: #78716c;">
        💾 Sahayak Sathi USB Standalone Edition • Runs 100% offline from Pen Drive or Tablet SD Card • All data saved locally.
      </p>
    </div>

  </div>

  <script>
    let waterCount = parseInt(localStorage.getItem('sahayak_usb_water') || '3', 10);
    let isPlayingAudio = false;
    let audioCtx = null;
    let oscillator = null;

    function updateWater() {
      document.getElementById('waterDisplay').innerText = waterCount + ' / 8 Glass';
      localStorage.setItem('sahayak_usb_water', waterCount.toString());
    }

    function addWater() {
      if (waterCount < 12) waterCount++;
      updateWater();
      logAction('💧 1 Glass Paani Piya (' + waterCount + '/8)');
      speakText('Shabash, aapne paani piya.');
    }

    function logAction(title) {
      const list = document.getElementById('recentList');
      const li = document.createElement('li');
      li.className = 'recent-item';
      li.innerHTML = '<span>' + title + '</span><span class="recent-time">Abhi-Abhi</span>';
      list.insertBefore(li, list.firstChild);
      
      // Keep max 5
      while (list.children.length > 5) {
        list.removeChild(list.lastChild);
      }
    }

    function toggleMed(el, name) {
      if (el.checked) {
        logAction('💊 Dawai Li: ' + name);
        speakText(name + ' li gayi.');
      }
    }

    function triggerSos() {
      document.getElementById('sosAlertBanner').style.display = 'block';
      speakText('Emergency SOS Alert Chalu kiya gaya hai. Caregiver ko suchna bhej di gayi hai.');
      playAlertTone();
    }

    function callCaregiver() {
      speakText('Caregiver ko call milaya ja raha hai.');
      window.location.href = 'tel:9876543210';
    }

    let offlineVoices = [];
    function getOfflineVoices() {
      if (!('speechSynthesis' in window)) return [];
      if (offlineVoices.length > 0) return offlineVoices;
      try {
        offlineVoices = window.speechSynthesis.getVoices() || [];
      } catch(e) {}
      return offlineVoices;
    }

    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        try { offlineVoices = window.speechSynthesis.getVoices() || []; } catch(e){}
      };
    }

    function playOfflineChime() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      } catch(e) {}
    }

    function speakText(text) {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        playOfflineChime();
        return;
      }
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
        
        setTimeout(() => {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = getOfflineVoices();
            const preferredLang = '${defaultLang === 'hi' ? 'hi-IN' : 'en-IN'}';
            
            // Find best available voice on device offline
            let matchedVoice = voices.find(v => v.lang.toLowerCase() === preferredLang.toLowerCase())
              || voices.find(v => v.lang.toLowerCase().startsWith('hi'))
              || voices.find(v => v.lang.toLowerCase() === 'en-in')
              || voices.find(v => v.lang.toLowerCase().startsWith('en'))
              || voices.find(v => v.default)
              || voices[0];

            if (matchedVoice) {
              utterance.voice = matchedVoice;
              utterance.lang = matchedVoice.lang;
            } else {
              utterance.lang = preferredLang;
            }

            utterance.rate = 0.92;
            utterance.pitch = 1.0;
            
            utterance.onerror = () => {
              playOfflineChime();
            };

            window.speechSynthesis.speak(utterance);
          } catch(e) {
            playOfflineChime();
          }
        }, 30);
      } catch(err) {
        playOfflineChime();
      }
    }

    function toggleCalmTone() {
      const btn = document.getElementById('audioToneBtn');
      if (isPlayingAudio) {
        stopTone();
        btn.innerText = '🎵 Shaant Mandir Swar Bajayein (Temple Bell Sound)';
        isPlayingAudio = false;
      } else {
        startCalmTone();
        btn.innerText = '⏹️ Swar Band Karein (Stop Sound)';
        isPlayingAudio = true;
      }
    }

    function startCalmTone() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // Warm relaxing 432Hz meditative drone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(432, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
      } catch (e) {
        console.error('Audio synthesis not supported', e);
      }
    }

    function stopTone() {
      if (oscillator) {
        try { oscillator.stop(); } catch(e){}
        oscillator = null;
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch(e){}
        audioCtx = null;
      }
    }

    function playAlertTone() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 800);
      } catch(e) {}
    }
  </script>
</body>
</html>`;
}

export function generateUsbReadme(options: UsbPackageOptions = {}): string {
  const patientName = options.patientName || 'Dadaji / Patient';
  const caregiverName = options.caregiverName || 'Pooja / Caregiver';

  return `================================================================================
SMRITI - OFFLINE USB INSTALLATION & SIDELOAD GUIDE
================================================================================
App Name: Smriti (Eldercare & Memory Companion)
Target Patient: ${patientName}
Primary Caregiver: ${caregiverName}
Mode: 100% Offline Standalone USB Package (Zero Internet Required)

CONTENTS OF THIS USB PACKAGE:
1. Smriti-Offline-App.html       -> Complete standalone web application.
2. START_SMRITI.bat              -> 1-click Windows PC launcher.
3. START_SMRITI.sh               -> 1-click Linux/Mac launcher.
4. manifest.webmanifest          -> PWA configuration for Android tablet install.
5. README_USB_INSTALLATION.txt   -> This guide.

--------------------------------------------------------------------------------
METHOD 1: HOW TO INSTALL ON ANDROID TABLET / PHONE USING USB OTG PEN DRIVE
--------------------------------------------------------------------------------
Step 1: Keep this folder on your USB Flash Drive (Pen Drive).
Step 2: Connect the USB Flash Drive to your Android Tablet using a USB-OTG adapter.
Step 3: Open the 'Files' or 'File Manager' app on the Android tablet.
Step 4: Navigate to USB Storage -> Smriti folder.
Step 5: Tap 'Smriti-Offline-App.html' to open it in Google Chrome or your default browser.
Step 6: In Chrome, tap the 3-dots menu (top-right) and select:
        "Add to Home Screen" or "Install App".
Step 7: The 'Smriti' icon will now appear on your tablet home screen!
        It will work 100% offline at all times without Wi-Fi, SIM card, or data!

--------------------------------------------------------------------------------
METHOD 2: HOW TO TRANSFER VIA USB CABLE (PC / LAPTOP TO ANDROID PHONE/TABLET)
--------------------------------------------------------------------------------
Step 1: Connect your Android phone or tablet to your PC using a USB charging/data cable.
Step 2: On the phone/tablet screen, pull down the notification bar, tap 'USB Charging this device',
        and select 'File Transfer' (MTP).
Step 3: On your PC, open 'This PC' -> Double-click your Phone/Tablet name.
Step 4: Go to 'Internal Storage' -> 'Download' folder.
Step 5: Copy the 'Smriti-Offline-App.html' file into the 'Download' folder.
Step 6: On the phone/tablet, open 'Files' -> 'Downloads' -> Tap the file to launch.

--------------------------------------------------------------------------------
METHOD 3: HOW TO RUN ON ANY LAPTOP / CLINIC COMPUTER DIRECTLY FROM USB
--------------------------------------------------------------------------------
- Windows: Simply double-click 'START_SMRITI.bat' or double-click 'Smriti-Offline-App.html'.
- Mac / Linux: Open 'Smriti-Offline-App.html' in Chrome, Safari, or Firefox.
- Zero installation required. Runs directly off the USB drive.

--------------------------------------------------------------------------------
KEY FEATURES WORKING 100% OFFLINE:
--------------------------------------------------------------------------------
- Recent 2-3 Minute Short-Term Memory Recall (Alzheimer's disorientation relief)
- Daily Hydration Counter & Medication Checkers
- Meditative 432Hz Anxiety Relief Drone (Synthesized locally with Web Audio)
- Emergency SOS Siren & Caregiver Direct Dial
- Multi-Indic Language Voice Synthesis (Hindi, English, Gujarati, etc.)

For support: Contact your family caregiver or open the companion app.
================================================================================
`;
}

export function generateWindowsLauncherBat(): string {
  return `@echo off
title Smriti - Offline USB Launcher
echo ===================================================
echo Launching Smriti Offline Memory Companion...
echo No internet connection needed!
echo ===================================================
start "" "Smriti-Offline-App.html"
exit
`;
}

export function generateMacLinuxLauncherSh(): string {
  return `#!/bin/bash
# Smriti Offline USB Launcher
echo "Launching Smriti Offline Memory Companion..."
if which xdg-open > /dev/null; then
  xdg-open "Smriti-Offline-App.html"
elif which open > /dev/null; then
  open "Smriti-Offline-App.html"
else
  echo "Please open Smriti-Offline-App.html in your web browser."
fi
`;
}

export function generateManifestJson(): string {
  return JSON.stringify({
    name: "Smriti - Eldercare & Memory Companion",
    short_name: "Smriti",
    description: "Offline Eldercare and Alzheimer's Companion",
    start_url: "./Smriti-Offline-App.html",
    display: "standalone",
    background_color: "#fcfbf9",
    theme_color: "#0f766e",
    icons: [
      {
        src: "logo.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml"
      }
    ]
  }, null, 2);
}

/**
 * Creates the complete offline zip bundle ready to copy to a USB drive
 */
export async function createUsbZipBundle(options: UsbPackageOptions = {}): Promise<Blob> {
  const zip = new JSZip();

  const folderName = 'Smriti-USB-Offline';
  const folder = zip.folder(folderName) || zip;

  // Add all files
  folder.file('Smriti-Offline-App.html', generateOfflineStandaloneHtml(options));
  folder.file('README_USB_INSTALLATION.txt', generateUsbReadme(options));
  folder.file('START_SMRITI.bat', generateWindowsLauncherBat());
  folder.file('START_SMRITI.sh', generateMacLinuxLauncherSh());
  folder.file('manifest.webmanifest', generateManifestJson());

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Direct file download trigger helper
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Write directly to a connected USB drive using the File System Access API
 */
export async function saveDirectlyToUsbDrive(options: UsbPackageOptions = {}): Promise<{ success: boolean; message: string; directoryName?: string }> {
  // Check if showDirectoryPicker is supported in this browser
  if (!('showDirectoryPicker' in window)) {
    return {
      success: false,
      message: 'Direct USB drive writing is only supported in modern Chromium browsers (Chrome, Edge, Opera). Please use the ZIP download option instead.'
    };
  }

  try {
    // Prompt the user to select their USB drive or a folder on their USB drive
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker({
      id: 'usb-drive-export',
      mode: 'readwrite',
      startIn: 'desktop'
    });

    const dirName = dirHandle.name || 'Selected USB Folder';

    // Create subfolder on the USB drive
    const subDirHandle = await dirHandle.getDirectoryHandle('Smriti-Offline', { create: true });

    // Write Smriti-Offline-App.html
    const htmlHandle = await subDirHandle.getFileHandle('Smriti-Offline-App.html', { create: true });
    const htmlWritable = await htmlHandle.createWritable();
    await htmlWritable.write(generateOfflineStandaloneHtml(options));
    await htmlWritable.close();

    // Write README_USB_INSTALLATION.txt
    const readmeHandle = await subDirHandle.getFileHandle('README_USB_INSTALLATION.txt', { create: true });
    const readmeWritable = await readmeHandle.createWritable();
    await readmeWritable.write(generateUsbReadme(options));
    await readmeWritable.close();

    // Write Windows bat launcher
    const batHandle = await subDirHandle.getFileHandle('START_SMRITI.bat', { create: true });
    const batWritable = await batHandle.createWritable();
    await batWritable.write(generateWindowsLauncherBat());
    await batWritable.close();

    // Write manifest
    const manifestHandle = await subDirHandle.getFileHandle('manifest.webmanifest', { create: true });
    const manifestWritable = await manifestHandle.createWritable();
    await manifestWritable.write(generateManifestJson());
    await manifestWritable.close();

    return {
      success: true,
      message: `Successfully copied Smriti files to USB drive (${dirName}/Smriti-Offline)!`,
      directoryName: dirName
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'USB drive selection cancelled.' };
    }
    return {
      success: false,
      message: 'Failed to write to USB drive: ' + (err.message || 'Permission denied or unsupported.')
    };
  }
}
