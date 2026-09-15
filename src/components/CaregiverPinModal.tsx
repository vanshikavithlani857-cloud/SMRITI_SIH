import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  Delete, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Language } from '../types';
import { playGentleTap, playAlertChime, speakText } from '../utils/audio';

interface CaregiverPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
  language: Language;
}

export const CaregiverPinModal: React.FC<CaregiverPinModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
  language,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage(null);
      setIsShaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    playGentleTap();
    setErrorMessage(null);
    if (pinInput.length < 6) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === correctPin.length) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    playGentleTap();
    setErrorMessage(null);
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    playGentleTap();
    setErrorMessage(null);
    setPinInput('');
  };

  const verifyPin = (candidate: string) => {
    if (candidate === correctPin) {
      playGentleTap();
      setErrorMessage(null);
      onSuccess();
    } else {
      playAlertChime(false);
      setErrorMessage('Incorrect Security PIN. Please try again.');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPinInput('');
      }, 700);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-pin-title"
    >
      <div 
        className={`bg-white w-full max-w-sm rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-200 space-y-3 sm:space-y-4 my-auto max-h-[96vh] overflow-y-auto ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="caregiver-pin-title" className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                Caregiver Security PIN
              </h2>
              <span className="text-[11px] text-stone-500 font-medium">
                केयरगिवर सुरक्षा पिन दर्ज करें
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playGentleTap();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Enter the 4-digit caregiver PIN to protect settings and switch to the Caregiver Portal.
        </p>

        {/* PIN Circles Display */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-3">
            {[0, 1, 2, 3].map((idx) => {
              const hasChar = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center font-black text-lg transition-all ${
                    hasChar
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-stone-300 bg-white text-stone-400'
                  }`}
                >
                  {hasChar ? (showPin ? pinInput[idx] : '●') : ''}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center space-x-1 pt-1"
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPin ? 'Hide PIN' : 'View PIN'}</span>
          </button>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Numeric Keypad for direct touch */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num)}
              className="py-2.5 sm:py-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-amber-100 text-stone-900 font-black text-base sm:text-lg border border-stone-200 shadow-xs transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="py-2.5 sm:py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs border border-stone-200 transition-colors cursor-pointer"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="py-2.5 sm:py-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-amber-100 text-stone-900 font-black text-base sm:text-lg border border-stone-200 shadow-xs transition-colors cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="py-2.5 sm:py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center border border-stone-200 transition-colors cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Security Hint */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-center">
          <p className="text-[11px] text-amber-900 font-semibold">
            Default Security PIN: <strong className="font-black text-amber-950">{correctPin}</strong>
          </p>
          <span className="text-[10px] text-amber-800/80 block">
            (Can be changed inside Caregiver Settings)
          </span>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => {
            playGentleTap();
            onClose();
          }}
          className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
        >
          Cancel & Return to Patient View
        </button>

      </div>
    </div>
  );
};
