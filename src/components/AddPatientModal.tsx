import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Heart, 
  Phone, 
  Globe, 
  ShieldAlert, 
  Stethoscope, 
  UserCheck, 
  MapPin, 
  Check 
} from 'lucide-react';
import { Language, PatientProfile } from '../types';
import { translations } from '../i18n/translations';
import { SUPPORTED_LANGUAGES } from '../i18n/languagesMeta';
import { playGentleTap, playSuccessChime } from '../utils/audio';

interface AddPatientModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (newPatient: PatientProfile) => void;
  existingPatients?: PatientProfile[];
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  language,
  isOpen,
  onClose,
  onAddPatient,
  existingPatients = [],
}) => {
  const t = translations[language];

  // Box 1: Patient Details
  const [name, setName] = useState('');
  const [age, setAge] = useState('74');
  const [gender, setGender] = useState('Elder');
  const [patientLang, setPatientLang] = useState<Language>(language);
  const [conditions, setConditions] = useState('Early Memory Support, Mild Blood Pressure');
  const [notes, setNotes] = useState('Enjoys devotional morning music and warm chai. Needs gentle reminders.');

  // Box 2: Emergency Contact & Medical Info
  const [emergencyName, setEmergencyName] = useState('Ananya Sharma (Daughter)');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43210');
  const [doctorName, setDoctorName] = useState('Dr. Hemanta Saikia / Dr. Priya');
  const [locationRoom, setLocationRoom] = useState('Home - Ground Floor Bedroom');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playGentleTap();
    playSuccessChime();

    const newPatient: PatientProfile = {
      id: `pat-${Date.now()}`,
      name: name.trim(),
      age: parseInt(age, 10) || 70,
      gender,
      condition: conditions.trim() || 'General Eldercare & Senior Wellness',
      conditions: conditions.split(',').map((c) => c.trim()).filter(Boolean),
      caregiverName: emergencyName.trim() || 'Primary Caregiver',
      primaryCaregiver: emergencyName.trim() || 'Primary Caregiver',
      caregiverPhone: emergencyPhone.trim(),
      emergencyContact: emergencyPhone.trim(),
      emergencyContactName: emergencyName.trim(),
      doctorName: doctorName.trim(),
      roomOrLocation: locationRoom.trim(),
      preferredLanguage: patientLang,
      language: patientLang,
      voicePromptsEnabled: true,
      voiceVolume: 0.9,
      notes: notes.trim(),
      gameScores: [],
      dateAdded: new Date().toLocaleDateString(),
    };

    onAddPatient(newPatient);
    
    // Reset fields for future additions
    setName('');
    setConditions('Early Memory Support, Mild Blood Pressure');
    setNotes('Enjoys devotional morning music and warm chai. Needs gentle reminders.');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="add-patient-modal-card"
        className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                {t.addNewPatient}
              </h2>
              <p className="text-xs text-stone-500">
                Fill the patient details below. All existing patients remain saved on your dashboard.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playGentleTap();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Preserved Patients Banner */}
        {existingPatients.length > 0 && (
          <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🛡️</span>
              <span className="text-stone-700 font-medium">
                <strong className="text-teal-900 font-bold">Existing profiles ({existingPatients.length}):</strong>{' '}
                {existingPatients.map(p => p.name).join(', ')} — will remain intact.
              </span>
            </div>
          </div>
        )}

        {/* Form with 2 distinct structured boxes */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* BOX 1: PATIENT DETAILS */}
          <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 border-b border-stone-200/80 pb-2">
              <Heart className="w-4 h-4 text-teal-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Box 1: Patient Personal & Health Details (मरीज का विवरण)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Ji / Kamala Baruah"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-teal-600 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="40"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-teal-600 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>Preferred Native Language</span>
                </label>
                <select
                  value={patientLang}
                  onChange={(e) => setPatientLang(e.target.value as Language)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-teal-600 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
                >
                  <optgroup label="🌟 North East Indian Languages">
                    {SUPPORTED_LANGUAGES.filter((l) => l.isNorthEast).map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 Pan-Indian Languages">
                    {SUPPORTED_LANGUAGES.filter((l) => !l.isNorthEast).map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Health & Cognitive Conditions
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Mild Memory Loss, Hypertension, Mobility Assistance"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-teal-600 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Care Routine & Comfort Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Loves morning classical music, needs reminders for evening tea"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-teal-600 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BOX 2: EMERGENCY CONTACT & MEDICAL INFO */}
          <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 border-b border-amber-200 pb-2">
              <ShieldAlert className="w-4 h-4 text-amber-800" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                Box 2: Emergency Contact & Medical Info (आपातकालीन संपर्क)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Primary Emergency Contact Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Ananya (Daughter)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-amber-600 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span>Emergency Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-amber-600 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                  <span>Doctor / Clinic Name</span>
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Hemanta Saikia (Guwahati)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-amber-600 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>Room / Location</span>
                </label>
                <input
                  type="text"
                  value={locationRoom}
                  onChange={(e) => setLocationRoom(e.target.value)}
                  placeholder="e.g. Ground Floor Bedroom"
                  className="w-full px-3 py-2 bg-white border border-stone-300 focus:border-amber-600 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playGentleTap();
                onClose();
              }}
              className="px-4 py-2.5 text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Patient & Display on Dashboard</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
