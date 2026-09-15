import React, { useState } from 'react';
import { 
  Usb, 
  Download, 
  HardDrive, 
  FolderDown, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  X, 
  FileArchive, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { getDashboardI18n } from '../i18n/dashboardTranslations';
import { 
  createUsbZipBundle, 
  triggerFileDownload, 
  saveDirectlyToUsbDrive,
  generateOfflineStandaloneHtml
} from '../utils/usbExportBundle';

interface UsbDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  patientName: string;
  caregiverName: string;
}

export const UsbDownloadModal: React.FC<UsbDownloadModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  patientName,
  caregiverName
}) => {
  const [activeTab, setActiveTab] = useState<'otg' | 'cable' | 'clinic' | 'apk'>('apk');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isSavingDirectUsb, setIsSavingDirectUsb] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [copiedAdb, setCopiedAdb] = useState(false);

  const t = getDashboardI18n(currentLanguage);

  if (!isOpen) return null;

  // Direct USB File System API check
  const supportsDirectUsb = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);
    try {
      const zipBlob = await createUsbZipBundle({
        patientName,
        caregiverName,
        language: currentLanguage
      });
      triggerFileDownload(zipBlob, 'Smriti-Offline-USB-Package.zip');
      setSaveSuccessMessage('Smriti USB Installer ZIP downloaded successfully! Ready to copy to USB drive.');
    } catch (err: any) {
      setErrorMessage('Failed to generate ZIP package: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleDownloadSingleHtml = () => {
    setErrorMessage(null);
    setSaveSuccessMessage(null);
    try {
      const htmlContent = generateOfflineStandaloneHtml({
        patientName,
        caregiverName,
        language: currentLanguage
      });
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      triggerFileDownload(blob, 'Smriti-Offline-App.html');
      setSaveSuccessMessage('Smriti-Offline-App.html downloaded! You can directly open it on any device.');
    } catch (err: any) {
      setErrorMessage('Failed to download standalone HTML: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDirectUsbSave = async () => {
    setIsSavingDirectUsb(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);
    try {
      const result = await saveDirectlyToUsbDrive({
        patientName,
        caregiverName,
        language: currentLanguage
      });
      if (result.success) {
        setSaveSuccessMessage(result.message);
      } else {
        if (result.message.includes('cancelled')) {
          // cancelled by user
        } else {
          setErrorMessage(result.message);
        }
      }
    } catch (err: any) {
      setErrorMessage('USB write failed: ' + (err?.message || 'Permission denied'));
    } finally {
      setIsSavingDirectUsb(false);
    }
  };

  const handleSpeakInstructions = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingGuide) {
      window.speechSynthesis.cancel();
      setIsSpeakingGuide(false);
      return;
    }

    const instructionsText = currentLanguage === 'hi'
      ? `यूएसबी से ऐप इंस्टॉल करने के तीन आसान चरण: पहला, पेन ड्राइव को कंप्यूटर में लगाएं और यूएसबी पैकेज डाउनलोड करें। दूसरा, पेन ड्राइव को ओटीजी केबल से मरीज़ के एंड्रॉयड टैबलेट में लगाएं। तीसरा, फाइल खोलें और ऐड टू होम स्क्रीन पर टैप करें। यह ऐप बिना इंटरनेट के हमेशा चलेगी।`
      : `Three simple steps to install via USB: Step 1, plug your USB flash drive into your computer and download the offline package. Step 2, plug the USB drive into the patient's Android tablet using a USB OTG adapter. Step 3, open the file and tap Add to Home Screen. This app will run 100 percent offline without internet.`;

    const utterance = new SpeechSynthesisUtterance(instructionsText);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingGuide(false);
    utterance.onerror = () => setIsSpeakingGuide(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeakingGuide(true);
  };

  const handleCopyAdb = () => {
    const cmd = `adb push ./Smriti-Offline-App.html /sdcard/Download/`;
    navigator.clipboard.writeText(cmd);
    setCopiedAdb(true);
    setTimeout(() => setCopiedAdb(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-stone-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-inner">
              <Usb className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Download App via USB (Offline Sideload)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Offline
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Install directly on Android Tablet, TV, or Clinic PC via USB drive or cable — zero internet required.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK NOTIFICATIONS */}
        {saveSuccessMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{saveSuccessMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* BODY CONTENT */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* QUICK PROMPT & AUDIO GUIDE */}
          <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Specially built for Indian households & clinics with limited or no Wi-Fi.</span>
            </div>
            <button
              onClick={handleSpeakInstructions}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 ${
                isSpeakingGuide 
                  ? 'bg-amber-600 text-white animate-pulse' 
                  : 'bg-amber-200/70 hover:bg-amber-300 text-amber-900'
              }`}
              title="Listen to instructions aloud"
            >
              {isSpeakingGuide ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeakingGuide ? 'Stop Voice' : 'Listen Guide'}</span>
            </button>
          </div>

          {/* ANDROID APK DIRECT DOWNLOAD BANNER (Attractive, Jewel-styled Smriti Logo) */}
          <div className="bg-gradient-to-r from-teal-950 via-stone-900 to-slate-900 border border-teal-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl text-white">
            <div className="flex items-center space-x-3.5">
              <div className="relative group shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-teal-400 to-emerald-300 shadow-xl shadow-teal-950/60 ring-2 ring-white/20 overflow-hidden">
                  <img 
                    src="/logo.svg" 
                    alt="Smriti App Logo" 
                    className="w-full h-full object-cover rounded-[14px] group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-amber-200">
                  APK
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-black tracking-tight text-white">
                    Smriti.apk (Android Package)
                  </span>
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    v2.4 Offline
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1 leading-snug">
                  Native Android package with 100% offline memory, hydration, and medication care.
                </p>
                <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-teal-300/90 font-medium">
                  <span>📦 Size: 12.7 MB</span>
                  <span>•</span>
                  <span>⚡ Zero Wi-Fi Required</span>
                  <span>•</span>
                  <span>🔒 100% Private</span>
                </div>
              </div>
            </div>
            <a
              href="/api/download-apk"
              download="Smriti.apk"
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:from-emerald-700 active:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-md shadow-teal-950/40 shrink-0 cursor-pointer group hover:scale-[1.02]"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>Download Smriti.apk</span>
            </a>
          </div>

          {/* THREE PRIMARY DOWNLOAD / USB TRANSFER OPTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* OPTION 1: FULL USB ZIP PACKAGE */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-teal-500 transition-colors group">
              <div className="space-y-1.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FileArchive className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-stone-900 group-hover:text-teal-700">
                  Full USB Package (.zip)
                </h3>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Contains offline app, Windows & Mac 1-click launchers, and step-by-step guide.
                </p>
                <div className="text-[10px] font-mono text-stone-400">~150 KB • ZIP archive</div>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isGeneratingZip}
                className="w-full py-2 px-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingZip ? 'Generating...' : 'Download ZIP'}</span>
              </button>
            </div>

            {/* OPTION 2: DIRECT SAVE TO CONNECTED USB DRIVE */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500 transition-colors group">
              <div className="space-y-1.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900 group-hover:text-amber-700">
                    Direct USB Transfer
                  </h3>
                  {supportsDirectUsb && (
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                      Ready
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Write files directly to your plugged-in USB pen drive without downloading a ZIP.
                </p>
                <div className="text-[10px] font-mono text-stone-400">WebUSB / File System API</div>
              </div>

              <button
                onClick={handleDirectUsbSave}
                disabled={isSavingDirectUsb}
                className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${
                  supportsDirectUsb
                    ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                title={supportsDirectUsb ? 'Select USB Drive to write files' : 'Use Chrome or Edge for direct USB writing'}
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{isSavingDirectUsb ? 'Copying to USB...' : 'Pick USB & Save'}</span>
              </button>
            </div>

            {/* OPTION 3: SINGLE STANDALONE HTML FILE */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-purple-500 transition-colors group">
              <div className="space-y-1.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <FolderDown className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-stone-900 group-hover:text-purple-700">
                  Standalone File (.html)
                </h3>
                <p className="text-[11px] text-stone-500 leading-tight">
                  One single standalone file. Double-click on any tablet or PC to run instantly.
                </p>
                <div className="text-[10px] font-mono text-stone-400">~80 KB • Single File</div>
              </div>

              <button
                onClick={handleDownloadSingleHtml}
                className="w-full py-2 px-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .HTML</span>
              </button>
            </div>

          </div>

          {/* STEP-BY-STEP SIDELOAD GUIDE TABS */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-xs font-black uppercase text-stone-500 tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                <span>How to Install from USB (Choose your method)</span>
              </span>

              <div className="flex space-x-1 bg-stone-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTab('apk')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    activeTab === 'apk' ? 'bg-white text-teal-700 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  📱 Android APK Guide
                </button>
                <button
                  onClick={() => setActiveTab('otg')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    activeTab === 'otg' ? 'bg-white text-teal-700 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  USB OTG
                </button>
                <button
                  onClick={() => setActiveTab('cable')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    activeTab === 'cable' ? 'bg-white text-teal-700 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  USB Cable
                </button>
                <button
                  onClick={() => setActiveTab('clinic')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    activeTab === 'clinic' ? 'bg-white text-teal-700 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Clinic PC
                </button>
              </div>
            </div>

            {/* TAB CONTENT: ANDROID APK GENERATION & ADB INSTALL */}
            {activeTab === 'apk' && (
              <div className="space-y-3 text-xs text-stone-700">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-950 flex items-start space-x-2">
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">How to get a signed Android APK:</strong>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      Smriti is a Progressive Web App (PWA) with offline caching and web manifest built-in. You can run it directly as an app on your phone with zero build tools, or convert it to a native <code className="bg-white px-1 py-0.2 rounded font-mono font-bold text-amber-800">.apk</code> file in 2 minutes.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">A</div>
                    <div>
                      <span className="font-bold text-stone-900">Method 1 (Instant APK via PWABuilder - 1 Click):</span>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Open <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-bold inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="w-2.5 h-2.5" /></a>, paste your deployed app URL, click <strong>Package for Android</strong>, and it will generate a signed installable <code className="bg-stone-100 px-1 py-0.2 rounded font-mono text-teal-800">.apk</code> file for you!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">B</div>
                    <div>
                      <span className="font-bold text-stone-900">Method 2 (Direct PWA Home Screen App - No APK needed):</span>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Open the app in Chrome on your phone $\rightarrow$ Tap <strong>⋮ (3 dots)</strong> $\rightarrow$ Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>. It gives the exact same native app icon and full-screen experience as an APK!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">C</div>
                    <div>
                      <span className="font-bold text-stone-900">Method 3 (Install APK via USB Debugging / ADB):</span>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Once you have your <code className="bg-stone-100 px-1 py-0.2 rounded font-mono text-teal-800">app-release.apk</code>, connect your phone via USB with USB Debugging turned ON, and run:
                      </p>
                      <div className="mt-1 flex items-center justify-between bg-stone-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px]">
                        <span>adb install -r Smriti.apk</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('adb install -r Smriti.apk');
                            setCopiedAdb(true);
                            setTimeout(() => setCopiedAdb(false), 2000);
                          }}
                          className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[10px] flex items-center gap-1 font-sans cursor-pointer"
                        >
                          {copiedAdb ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedAdb ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: USB OTG PEN DRIVE */}
            {activeTab === 'otg' && (
              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <span className="font-bold text-stone-900">Copy to USB Flash Drive:</span> Click &quot;Download ZIP&quot; above and copy the extracted files (or click &quot;Pick USB &amp; Save&quot;) onto any standard USB pen drive.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <span className="font-bold text-stone-900">Plug OTG Adapter into Elder&apos;s Tablet:</span> Use a USB Type-C or Micro-USB OTG adapter to plug the pen drive directly into the patient&apos;s Android tablet.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <span className="font-bold text-stone-900">Open &amp; Pin to Home Screen:</span> Open the &quot;Files&quot; app on the tablet, tap <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono font-bold text-teal-800">Smriti-Offline-App.html</code>, then in Chrome tap &quot;⋮ &gt; Add to Home Screen&quot;. It now launches full-screen without internet!
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: USB CABLE */}
            {activeTab === 'cable' && (
              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <span className="font-bold text-stone-900">Connect Phone/Tablet to Laptop:</span> Plug the phone/tablet into your PC using its charging USB cable.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <span className="font-bold text-stone-900">Select &quot;File Transfer / MTP&quot;:</span> On the device screen, pull down the top notification bar and choose &quot;Transferring Files / MTP&quot;.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <span className="font-bold text-stone-900">Drag to &quot;Download&quot; Folder:</span> On your computer, open &quot;This PC &gt; [Your Phone/Tablet] &gt; Internal Storage &gt; Download&quot; and copy <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono font-bold text-teal-800">Sahayak-Sathi-Offline-App.html</code> there. Open and enjoy!
                  </div>
                </div>

                {/* Optional ADB Command for Technical Attendants */}
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between bg-stone-50 p-2 rounded-lg">
                  <div className="text-[11px] font-mono text-stone-600 truncate mr-2">
                    adb push ./Sahayak-Sathi-Offline-App.html /sdcard/Download/
                  </div>
                  <button
                    onClick={handleCopyAdb}
                    className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded text-[10px] font-bold flex items-center space-x-1 shrink-0"
                  >
                    {copiedAdb ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAdb ? 'Copied' : 'Copy ADB'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CLINIC / LAPTOP DIRECT USB RUN */}
            {activeTab === 'clinic' && (
              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <span className="font-bold text-stone-900">Keep USB Drive Plugged In:</span> Leave the USB drive inserted into any hospital ward laptop or family desktop.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <span className="font-bold text-stone-900">Double Click to Launch:</span> On Windows, double-click <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono font-bold text-teal-800">START_SMRITI.bat</code>. On Mac/Linux, double-click <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono font-bold text-teal-800">Smriti-Offline-App.html</code>.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <span className="font-bold text-stone-900">Zero Internet / Complete Privacy:</span> All patient activity logs, hydration counts, medication checkboxes, and memory reassurance features run completely inside the local device.
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* PRIVACY & OFFLINE GUARANTEE */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All patient data stays safe and encrypted on the local device.</span>
            </div>
            <button
              onClick={onClose}
              className="text-stone-600 hover:text-stone-900 font-bold underline"
            >
              Done / Return to App
            </button>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-stone-50 px-4 py-3 sm:px-6 flex items-center justify-between border-t border-stone-200 text-xs">
          <div className="text-stone-600">
            Selected Patient: <strong className="text-stone-900">{patientName}</strong> • Caregiver: <strong className="text-stone-900">{caregiverName}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
