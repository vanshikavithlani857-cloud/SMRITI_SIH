import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Heart, 
  Images, 
  BellRing, 
  PhoneCall, 
  User, 
  CheckCircle2, 
  Plus, 
  Activity, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  UserPlus,
  Users,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Globe,
  Trash2,
  Check,
  Usb,
  UserCheck,
  LogOut,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { 
  Language, 
  CaregiverAlert, 
  MemoryPhoto, 
  Medication, 
  PatientProfile, 
  CaregiverDetails 
} from '../types';
import { translations } from '../i18n/translations';
import { getDashboardI18n } from '../i18n/dashboardTranslations';
import { playGentleTap } from '../utils/audio';
import { PatientGpsTracker } from './PatientGpsTracker';

interface CaregiverDashboardProps {
  language: Language;
  profile: PatientProfile;
  caregiverDetails?: CaregiverDetails;
  patients?: PatientProfile[];
  alerts: CaregiverAlert[];
  photos: MemoryPhoto[];
  medications: Medication[];
  waterGlasses: number;
  currentMood: string;
  onSelectPatient?: (patientId: string) => void;
  onDeletePatient?: (patientId: string) => void;
  onOpenAddPatient?: () => void;
  onOpenProgressTracker?: () => void;
  onOpenAlerts: () => void;
  onOpenPhotos: () => void;
  onOpenTasks?: () => void;
  onSendComfortNote: (note: string) => void;
  onUpdateAlertStatus: (alertId: string, status: 'acknowledged' | 'resolved') => void;
  onTriggerWanderingAlert?: (alertMessage: string, distance: number) => void;
  onOpenUsbDownload?: () => void;
  onSwitchToPatient?: () => void;
  onCaregiverLogout?: () => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  language,
  profile,
  caregiverDetails,
  patients = [profile],
  alerts,
  photos,
  medications,
  waterGlasses,
  currentMood,
  onSelectPatient,
  onDeletePatient,
  onOpenAddPatient,
  onOpenProgressTracker,
  onOpenAlerts,
  onOpenPhotos,
  onOpenTasks,
  onSendComfortNote,
  onUpdateAlertStatus,
  onTriggerWanderingAlert,
  onOpenUsbDownload,
  onSwitchToPatient,
  onCaregiverLogout,
}) => {
  const t = translations[language] || translations.en;
  const dt = getDashboardI18n(language);

  const [noteText, setNoteText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [showGpsMap, setShowGpsMap] = useState(false);

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical');
  const medsTakenCount = medications.filter(m => m.takenToday).length;

  const patientStatus = criticalAlerts.length > 0 ? 'sos' : 'normal';

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    playGentleTap();
    onSendComfortNote(noteText.trim());
    setNoteText('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 space-y-3 pb-16 animate-in fade-in duration-200">
      
      {/* Unified Systematic North-Eastern Caregiver Header */}
      <div 
        id="caregiver-unified-header"
        className="relative overflow-hidden bg-gradient-to-r from-[#1C1917] via-[#064E3B] to-[#047857] text-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-amber-400/50 space-y-3.5"
      >
        {/* Decorative Gamosa ribbon top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 opacity-90" />

        {/* Row 1: Profile info & primary actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full text-xs font-black border border-amber-400/40">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>🌿 {dt.caregiverRoleBadge} Portal</span>
              </span>
              <span className="text-xs text-stone-200 font-bold truncate">
                Monitoring: <strong className="text-amber-300">{profile.name}</strong>
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white truncate">
              {caregiverDetails?.name || profile.caregiverName} ({caregiverDetails?.relation || 'Family Caregiver'})
            </h1>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1.5">
            {onSwitchToPatient && (
              <button
                id="caregiver-switch-to-patient-btn"
                type="button"
                onClick={() => {
                  playGentleTap();
                  onSwitchToPatient();
                }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl transition-colors shadow-xs cursor-pointer border border-emerald-600"
                title="Switch to Patient View"
              >
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span>Switch to Patient</span>
              </button>
            )}

            <a
              href={`tel:${profile.emergencyContact}`}
              onClick={playGentleTap}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-xs transition-colors border border-amber-500"
            >
              <PhoneCall className="w-4 h-4 text-stone-950" />
              <span>{t.callPatient}</span>
            </a>

            <button
              onClick={() => {
                playGentleTap();
                onOpenAlerts();
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors cursor-pointer border border-stone-600"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>{activeAlerts.length} Alerts</span>
            </button>

            {onCaregiverLogout && (
              <button
                id="caregiver-banner-logout-btn"
                type="button"
                onClick={() => {
                  playGentleTap();
                  onCaregiverLogout();
                }}
                className="p-2 bg-stone-800 hover:bg-rose-900/80 text-stone-200 hover:text-rose-200 border border-stone-600 rounded-xl transition-colors cursor-pointer"
                title={dt.logoutBtn}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Systematic Quick Metric & Actions Bar */}
        <div className="pt-2.5 border-t border-stone-700/80 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
          <div className="flex items-center space-x-3 sm:space-x-5">
            <span className="flex items-center space-x-1.5 text-emerald-300 font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Safety: Normal</span>
            </span>
            <button
              type="button"
              onClick={() => {
                playGentleTap();
                if (onOpenTasks) onOpenTasks();
              }}
              className="text-stone-200 hover:text-white transition-colors cursor-pointer flex items-center space-x-1 font-semibold"
              title="Click to view & manage daily tasks"
            >
              <span>💊 Meds: <strong className="text-amber-300 underline decoration-dotted underline-offset-2">{medsTakenCount}/{medications.length}</strong></span>
            </button>
            <button
              type="button"
              onClick={() => {
                playGentleTap();
                if (onOpenTasks) onOpenTasks();
              }}
              className="text-stone-200 hover:text-white transition-colors cursor-pointer flex items-center space-x-1 font-semibold"
              title="Click to view & manage hydration"
            >
              <span>💧 Water: <strong className="text-cyan-300 underline decoration-dotted underline-offset-2">{waterGlasses}/8</strong></span>
            </button>
            <span className="text-stone-200 hidden sm:inline font-semibold">
              📍 GPS: <strong className="text-emerald-300">Safe Home Zone</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenProgressTracker && (
              <button
                onClick={() => {
                  playGentleTap();
                  onOpenProgressTracker();
                }}
                className="text-xs font-black text-amber-300 hover:text-amber-200 flex items-center space-x-1.5 bg-stone-800/90 hover:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-600 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{dt.viewProgressBtn}</span>
              </button>
            )}

            {onOpenUsbDownload && (
              <button
                onClick={() => {
                  playGentleTap();
                  onOpenUsbDownload();
                }}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-100 flex items-center space-x-1 bg-stone-800/80 hover:bg-stone-800 px-2 py-1 rounded-lg border border-stone-700 cursor-pointer"
                title={dt.usbDownloadTitle}
              >
                <Usb className="w-3 h-3 text-amber-400" />
                <span>USB Backup</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REGISTERED PATIENTS ROSTER & CHIP SELECTOR */}
      <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-stone-200 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 min-w-0">
            <Users className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="text-xs font-black text-stone-900 truncate">
              {dt.patientSelectLabel} ({patients.length})
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {onOpenAddPatient && (
              <button
                id="caregiver-add-patient-btn"
                onClick={() => {
                  playGentleTap();
                  onOpenAddPatient();
                }}
                className="flex items-center space-x-1 px-2 py-0.5 bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-black rounded-lg transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <UserPlus className="w-3 h-3 text-amber-300" />
                <span>+ {dt.addPatientBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Patient Chips List */}
        <div className="flex flex-wrap gap-1.5">
          {patients.map((p) => {
            const isSelected = p.id === profile.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isSelected && onSelectPatient) {
                    playGentleTap();
                    onSelectPatient(p.id);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-emerald-100/90 border-emerald-700 ring-1 ring-emerald-600/50 shadow-xs'
                    : 'bg-[#FAF7F0] hover:bg-[#F0EAE1] border-[#E0D7C6] text-stone-800'
                }`}
              >
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="text-xs sm:text-sm font-black text-stone-900 truncate max-w-[120px]">
                    {p.name}
                  </span>
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 bg-emerald-800 text-white text-[9px] font-black rounded uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-bold">
                      {p.age}y
                    </span>
                  )}
                </div>

                {patients.length > 1 && onDeletePatient && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to remove ${p.name}? Other patients will remain safe.`)) {
                        onDeletePatient(p.id);
                      }
                    }}
                    className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0 cursor-pointer"
                    title={`Remove ${p.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PATIENT LIVE GPS TRACKER & OFFLINE SATELLITE GEOFENCING */}
      <div className="bg-[#FAF7F0] rounded-2xl border-2 border-[#E0D7C6] shadow-xs overflow-hidden">
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 bg-[#F4EFE6] border-b border-[#E0D7C6]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 border border-emerald-900">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-black text-stone-900">GPS Geofence Tracking</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Active & Safe
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-600 font-medium">
                Safe 150m perimeter around {profile.name}'s residence • Wandering alerts active
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGpsMap(!showGpsMap)}
            className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F0EAE1] text-emerald-900 text-xs font-black rounded-xl border border-emerald-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            {showGpsMap ? '▲ Hide Map' : '▼ View Live Map'}
          </button>
        </div>

        {showGpsMap && (
          <div className="p-2 sm:p-3 border-t border-[#E0D7C6] animate-in fade-in duration-200">
            <PatientGpsTracker
              patient={profile}
              language={language}
              onTriggerWanderingAlert={onTriggerWanderingAlert}
            />
          </div>
        )}
      </div>

      {/* 2-COLUMN HIGH-DENSITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* COLUMN 1 (LEFT 7 COLS): STATUS & DETAILS */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* UNIFIED ACTIVE PATIENT MEDICAL & CARE PROFILE */}
          <div className="bg-[#FAF7F0] rounded-2xl p-3.5 sm:p-4 border-2 border-[#E0D7C6] shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E0D7C6] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-800 text-amber-300 border border-emerald-900 flex items-center justify-center font-black text-base shadow-xs">
                  {profile.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                      {profile.name}
                    </h2>
                    <span className="text-xs sm:text-sm text-stone-500 font-bold">
                      ({profile.age} yrs)
                    </span>
                  </div>
                  <span className="inline-block text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 mt-1">
                    {profile.condition}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1.5 ${
                  patientStatus === 'sos'
                    ? 'bg-rose-100 text-rose-800 border-2 border-rose-300 animate-pulse'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    patientStatus === 'sos' ? 'bg-rose-600' : 'bg-emerald-600'
                  }`} />
                  <span>{patientStatus === 'sos' ? t.patientStatusSOS : dt.patientSafeStable}</span>
                </span>
                
                <a
                  href={`tel:${profile.emergencyContact}`}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-black transition-colors inline-flex items-center space-x-1 shadow-2xs border border-amber-500"
                  title="Call Emergency Contact"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-stone-950" />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Systematic 4-Field Clinical & Guardian Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm">
              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#E0D7C6] space-y-1">
                <span className="text-[10px] text-stone-500 font-black uppercase block">
                  {dt.caregiverLabel}
                </span>
                <span className="font-black text-stone-900 truncate block">
                  {caregiverDetails?.name || profile.caregiverName}
                </span>
                <span className="text-xs text-stone-600 block truncate font-medium">
                  {caregiverDetails?.relation || 'Guardian'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#E0D7C6] space-y-1">
                <span className="text-[10px] text-stone-500 font-black uppercase block">
                  {dt.emergencyContactTitle}
                </span>
                <span className="font-black text-stone-900 font-mono text-xs sm:text-sm truncate block">
                  {profile.emergencyContact}
                </span>
                <span className="text-xs text-stone-600 block truncate font-medium">
                  Primary Line
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#E0D7C6] space-y-1">
                <span className="text-[10px] text-stone-500 font-black uppercase block">
                  Physician / Doctor
                </span>
                <span className="font-black text-stone-900 truncate block">
                  {profile.doctorName || 'Dr. Hazarika'}
                </span>
                <span className="text-xs text-emerald-800 block truncate font-bold">
                  Senior Geriatrician
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#E0D7C6] space-y-1">
                <span className="text-[10px] text-stone-500 font-black uppercase block">
                  Safe Home Zone
                </span>
                <span className="font-black text-stone-900 truncate block">
                  150m Perimeter
                </span>
                <span className="text-xs text-emerald-700 block truncate font-bold">
                  GPS Active & Monitored
                </span>
              </div>
            </div>
          </div>

          {/* SEND REASSURING NOTE DIRECT TO PATIENT */}
          <div className="bg-[#FAF7F0] rounded-2xl p-3.5 sm:p-4 border-2 border-[#E0D7C6] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <span>{dt.quickComfortNoteTitle}</span>
              </span>
              {sentSuccess && (
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1 animate-fade-in bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Delivered to patient's screen!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSendNote} className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={dt.comfortNotePlaceholder}
                className="flex-1 px-3 py-2 bg-white text-xs sm:text-sm rounded-xl border border-[#D5CAB6] focus:outline-none focus:border-emerald-700 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black transition-colors shadow-xs shrink-0 cursor-pointer border border-emerald-800"
              >
                {dt.sendComfortNoteBtn}
              </button>
            </form>
          </div>

        </div>

        {/* COLUMN 2 (RIGHT 5 COLS): ALERTS & DIRECT MODULES */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* ACTIVE ALERTS SPOTLIGHT */}
          <div className="bg-[#FAF7F0] rounded-2xl p-3.5 sm:p-4 border-2 border-[#E0D7C6] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Active Alerts ({activeAlerts.length})</span>
              </h3>
              <button
                onClick={onOpenAlerts}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                All Alerts ❯
              </button>
            </div>

            {activeAlerts.length > 0 ? (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-0.5">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-xl border-2 flex items-center justify-between gap-2 ${
                      alert.priority === 'critical'
                        ? 'bg-rose-50 border-rose-300'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-stone-900 text-white">
                          {alert.priority}
                        </span>
                        <span className="text-[10px] text-stone-500 font-semibold">{alert.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-black text-stone-900 truncate mt-0.5">{alert.title}</h4>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => {
                          playGentleTap();
                          onUpdateAlertStatus(alert.id, 'acknowledged');
                        }}
                        className="px-2 py-1 bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Ack
                      </button>
                      <button
                        onClick={() => {
                          playGentleTap();
                          onUpdateAlertStatus(alert.id, 'resolved');
                        }}
                        className="px-2 py-1 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-600 py-1.5 italic font-medium">
                No active alerts. All quiet and safe.
              </p>
            )}
          </div>

          {/* DIRECT ACTION MODULES: TASKS, PHOTOS/UPLOAD, ANALYTICS */}
          <div className="bg-[#FAF7F0] rounded-2xl p-3.5 sm:p-4 border-2 border-[#E0D7C6] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs sm:text-sm font-black text-stone-900">
                  Direct Modules
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs text-stone-500 font-black">1-Tap Direct Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              {/* Direct Tasks & Meds Icon */}
              <button
                id="btn-caregiver-open-tasks"
                type="button"
                onClick={() => {
                  playGentleTap();
                  if (onOpenTasks) onOpenTasks();
                }}
                className="p-3 rounded-2xl bg-[#EFE9DF] hover:bg-[#E7DFC0] border-2 border-emerald-700/60 flex flex-col items-start transition-all cursor-pointer group text-left shadow-xs"
                title="View and manage daily tasks and medication routine"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-xs border border-emerald-900">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-black text-emerald-950 block leading-tight">
                  Tasks & Meds
                </span>
                <span className="text-[11px] text-emerald-800 mt-1 block leading-tight font-bold">
                  {medsTakenCount}/{medications.length} taken • View ❯
                </span>
              </button>

              {/* Direct Photos & Upload Icon */}
              <button
                id="btn-caregiver-open-photos"
                type="button"
                onClick={() => {
                  playGentleTap();
                  onOpenPhotos();
                }}
                className="p-3 rounded-2xl bg-[#EFE9DF] hover:bg-[#E7DFC0] border-2 border-indigo-700/60 flex flex-col items-start transition-all cursor-pointer group text-left shadow-xs"
                title="Open photo album and upload new family memories"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-800 text-amber-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-xs border border-indigo-900">
                  <Images className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-black text-indigo-950 block leading-tight">
                  Upload & Photos
                </span>
                <span className="text-[11px] text-indigo-800 mt-1 block leading-tight font-bold">
                  + Add Photos ({photos.length}) ❯
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
