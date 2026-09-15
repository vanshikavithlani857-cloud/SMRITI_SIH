import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Globe, 
  Home, 
  Wind, 
  Images, 
  Gamepad2, 
  CheckSquare, 
  Mic, 
  TrendingUp, 
  LogOut, 
  UserCheck 
} from 'lucide-react';
import { 
  Language, 
  UserRole, 
  MemoryPhoto, 
  Medication, 
  CaregiverAlert, 
  AnxietyLog, 
  PatientProfile, 
  AlertPriority, 
  CognitiveGameScore, 
  CaregiverDetails,
  RecentAction
} from './types';
import { translations } from './i18n/translations';
import { 
  initialAlerts, 
  initialMedications, 
  initialPatientProfile, 
  initialPatients, 
  initialPhotos 
} from './data/initialData';
import { 
  playGentleTap, 
  playAlertChime, 
  speakText 
} from './utils/audio';

import { Navbar } from './components/Navbar';
import { PatientDashboard } from './components/PatientDashboard';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { TasksView } from './components/TasksView';
import { AnxietyFeature } from './components/AnxietyFeature';
import { CaregiverAlerts } from './components/CaregiverAlerts';
import { PhotoAlbum } from './components/PhotoAlbum';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { TermsAndConditionsModal } from './components/TermsAndConditionsModal';
import { GamesHub } from './components/GamesHub';
import { ProgressTracker } from './components/ProgressTracker';
import { AddPatientModal } from './components/AddPatientModal';
import { CaregiverPinModal } from './components/CaregiverPinModal';
import { UsbDownloadModal } from './components/UsbDownloadModal';
import { OnboardingFlow } from './components/OnboardingFlow';

export default function App() {
  // Onboarding sequence (Step 1: Language dropdown + Terms & Conditions, Step 2: Role selection)
  // Starts directly on the Language & Terms screen at app launch as requested
  const [isOnboarding, setIsOnboarding] = useState<boolean>(true);
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<1 | 2>(1);

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('sahayak_role') as UserRole) || 'patient';
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    return (localStorage.getItem('sahayak_language') as Language) || 'hi';
  });

  // Caregiver personal details entered at onboarding
  const [caregiverDetails, setCaregiverDetails] = useState<CaregiverDetails>(() => {
    const saved = localStorage.getItem('sahayak_caregiver_details');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { securityPin: '1234', ...parsed };
    }
    return {
      name: 'Pooja Sharma',
      phone: '+91 98765 43210',
      relation: 'Daughter',
      city: 'Guwahati / New Delhi',
      securityPin: '1234',
      registeredAt: new Date().toLocaleDateString(),
    };
  });

  // Multiple Patients state (Persistent and resilient)
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('sahayak_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved patients', e);
    }
    return initialPatients;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return localStorage.getItem('sahayak_active_patient_id') || 'pat-1';
  });

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0] || initialPatientProfile;

  // Active view tab: dashboard, tasks, anxiety, photos, alerts, games, progress
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'anxiety' | 'photos' | 'alerts' | 'games' | 'progress'>('dashboard');

  const [voicePromptsEnabled, setVoicePromptsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahayak_voice_prompts');
    return saved !== null ? saved === 'true' : true;
  });

  // Data Collections with LocalStorage Sync (Offline Capability)
  const [photos, setPhotos] = useState<MemoryPhoto[]>(() => {
    const saved = localStorage.getItem('sahayak_photos');
    return saved ? JSON.parse(saved) : initialPhotos;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('sahayak_medications');
    return saved ? JSON.parse(saved) : initialMedications;
  });

  const [alerts, setAlerts] = useState<CaregiverAlert[]>(() => {
    const saved = localStorage.getItem('sahayak_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [anxietyLogs, setAnxietyLogs] = useState<AnxietyLog[]>(() => {
    const saved = localStorage.getItem('sahayak_anxiety_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('sahayak_water');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [currentMood, setCurrentMood] = useState<string>('calm');
  const [comfortNote, setComfortNote] = useState<string | null>(null);

  // 2-3 minute recent memory recall actions
  const [recentActions, setRecentActions] = useState<RecentAction[]>(() => {
    try {
      const saved = localStorage.getItem('sahayak_recent_actions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'act-1',
        timestamp: 'Just now',
        minutesAgo: 1,
        type: 'water',
        title: 'Drank 1 glass of fresh water',
        description: 'Hydration maintained at dining table.',
      },
      {
        id: 'act-2',
        timestamp: '3 mins ago',
        minutesAgo: 3,
        type: 'medication',
        title: 'Took morning blood pressure medicine',
        description: 'Amlodipine 5mg taken with water.',
      },
      {
        id: 'act-3',
        timestamp: '8 mins ago',
        minutesAgo: 8,
        type: 'breathing',
        title: 'Calm breathing exercise',
        description: 'Practiced 3-minute slow diaphragmatic breathing.',
      },
      {
        id: 'act-4',
        timestamp: '18 mins ago',
        minutesAgo: 18,
        type: 'photo',
        title: 'Viewed family album',
        description: 'Looked at daughter Ananya and family photos.',
      },
      {
        id: 'act-5',
        timestamp: '30 mins ago',
        minutesAgo: 30,
        type: 'tea',
        title: 'Morning tea and light refreshment',
        description: 'Had warm ginger tea prepared by caregiver.',
      }
    ];
  });

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUsbModalOpen, setIsUsbModalOpen] = useState(false);

  // SOS Banner
  const [sosBannerActive, setSosBannerActive] = useState(false);

  const t = translations[currentLanguage];

  // Sync state to LocalStorage (Complete offline support)
  useEffect(() => {
    localStorage.setItem('sahayak_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('sahayak_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('sahayak_caregiver_details', JSON.stringify(caregiverDetails));
  }, [caregiverDetails]);

  useEffect(() => {
    localStorage.setItem('sahayak_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('sahayak_active_patient_id', activePatientId);
  }, [activePatientId]);

  useEffect(() => {
    localStorage.setItem('sahayak_voice_prompts', String(voicePromptsEnabled));
  }, [voicePromptsEnabled]);

  useEffect(() => {
    localStorage.setItem('sahayak_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('sahayak_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('sahayak_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('sahayak_anxiety_logs', JSON.stringify(anxietyLogs));
  }, [anxietyLogs]);

  useEffect(() => {
    localStorage.setItem('sahayak_water', String(waterGlasses));
  }, [waterGlasses]);

  useEffect(() => {
    localStorage.setItem('sahayak_recent_actions', JSON.stringify(recentActions));
  }, [recentActions]);

  const handleAddRecentAction = (action: Omit<RecentAction, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAction: RecentAction = {
      ...action,
      id: `act-${Date.now()}`,
      timestamp: timeStr,
      minutesAgo: 1,
    };
    setRecentActions((prev) => [
      newAction,
      ...prev.map((a) => ({ ...a, minutesAgo: a.minutesAgo + 1 })),
    ]);
  };

  const handleAddWater = () => {
    setWaterGlasses((prev) => {
      const next = prev + 1;
      handleAddRecentAction({
        type: 'water',
        minutesAgo: 1,
        title: 'Drank 1 glass of fresh water',
        description: `Hydration level updated (${next}/8 glasses).`,
      });
      return next;
    });
  };

  const handleSelectMood = (mood: string) => {
    setCurrentMood(mood);
    handleAddRecentAction({
      type: 'mood',
      minutesAgo: 1,
      title: `Checked in mood: ${mood}`,
      description: 'Emotional state updated.',
    });
  };

  // Handlers
  const handleSelectPatient = (id: string) => {
    setActivePatientId(id);
    try {
      localStorage.setItem('sahayak_active_patient_id', id);
    } catch (err) {
      console.error('Error persisting active patient id:', err);
    }
    const selected = patients.find((p) => p.id === id);
    if (selected?.preferredLanguage) {
      setCurrentLanguage(selected.preferredLanguage);
    }
  };

  const handleAddPatient = (newPatient: PatientProfile) => {
    setPatients((prev) => {
      // Retain all existing patients and prepend the new one
      const filtered = prev.filter((p) => p.id !== newPatient.id);
      const updated = [newPatient, ...filtered];
      try {
        localStorage.setItem('sahayak_patients', JSON.stringify(updated));
      } catch (err) {
        console.error('Error persisting new patient to localStorage:', err);
      }
      return updated;
    });

    setActivePatientId(newPatient.id);
    try {
      localStorage.setItem('sahayak_active_patient_id', newPatient.id);
    } catch (err) {
      console.error('Error persisting active patient id:', err);
    }

    if (newPatient.preferredLanguage) {
      setCurrentLanguage(newPatient.preferredLanguage);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    if (patients.length <= 1) return;
    setPatients((prev) => {
      const updated = prev.filter((p) => p.id !== patientId);
      try {
        localStorage.setItem('sahayak_patients', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving updated patients after deletion:', err);
      }
      return updated;
    });

    if (activePatientId === patientId) {
      const remaining = patients.filter((p) => p.id !== patientId);
      if (remaining.length > 0) {
        setActivePatientId(remaining[0].id);
        try {
          localStorage.setItem('sahayak_active_patient_id', remaining[0].id);
        } catch (err) {
          console.error('Error persisting active patient id:', err);
        }
      }
    }
  };

  const handleSaveGameScore = (scoreData: Omit<CognitiveGameScore, 'id' | 'timestamp'>) => {
    const newScore: CognitiveGameScore = {
      ...scoreData,
      id: `score-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientId: activePatient.id,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            gameScores: [newScore, ...(p.gameScores || [])],
          };
        }
        return p;
      })
    );
  };

  const handleAddPhoto = (newPhotoData: Omit<MemoryPhoto, 'id' | 'dateAdded'>) => {
    const newPhoto: MemoryPhoto = {
      ...newPhotoData,
      id: `photo-${Date.now()}`,
      dateAdded: 'Just now',
      featuredInDashboard: true,
      patientId: activePatient.id,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleToggleMedication = (medId: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          const nextTaken = !m.takenToday;
          if (nextTaken) {
            handleAddRecentAction({
              type: 'medication',
              minutesAgo: 1,
              title: `Took medicine: ${m.name}`,
              description: `Dosage: ${m.dosage} (${m.time}) marked as taken.`,
            });
          }
          return {
            ...m,
            takenToday: nextTaken,
            takenAt: nextTaken ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleAddCaregiverAlert = (newAlertData: Omit<CaregiverAlert, 'id' | 'timestamp'>) => {
    const newAlert: CaregiverAlert = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAlerts((prev) => [newAlert, ...prev]);

    if (newAlert.priority === 'critical') {
      playAlertChime(true);
      setSosBannerActive(true);
    } else {
      playAlertChime(false);
    }
  };

  const handleUpdateAlertStatus = (alertId: string, status: 'acknowledged' | 'resolved', note?: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status,
            notes: note ? (a.notes ? `${a.notes} | ${note}` : note) : a.notes,
          };
        }
        return a;
      })
    );
  };

  const handleSimulateTestAlert = (type: 'sos' | 'anxiety' | 'medication_missed' | 'wandering') => {
    const titles = {
      sos: 'Test Emergency SOS Button Pressed',
      anxiety: 'Patient Logged Anxiety & Panic Episode',
      medication_missed: 'Afternoon Blood Pressure Pill Overdue by 45m',
      wandering: 'Patient Movement Sensor Outside Safety Boundary',
    };

    const priorities: Record<string, AlertPriority> = {
      sos: 'critical',
      anxiety: 'high',
      medication_missed: 'medium',
      wandering: 'critical',
    };

    handleAddCaregiverAlert({
      patientId: activePatient.id,
      patientName: activePatient.name,
      type,
      priority: priorities[type],
      title: titles[type],
      message: `Automatic alert triggered for ${activePatient.name}. Please check immediately.`,
      status: 'active',
    });
  };

  const handleTriggerSOS = () => {
    handleAddCaregiverAlert({
      patientId: activePatient.id,
      patientName: activePatient.name,
      type: 'sos',
      priority: 'critical',
      title: `${activePatient.name} Pressed Emergency SOS!`,
      message: `Emergency button pressed at ${new Date().toLocaleTimeString()}. Caregiver notified with location coordinates.`,
      status: 'active',
      location: activePatient.roomOrLocation || 'Home - Ground Floor Bedroom',
    });

    if (voicePromptsEnabled) {
      speakText(t.promptSosTriggered, currentLanguage);
    }
  };

  const handleLogAnxietySession = (level: 'mild' | 'moderate' | 'severe', technique: string) => {
    const newLog: AnxietyLog = {
      id: `anx-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientId: activePatient.id,
      level,
      rating: level === 'severe' ? 9 : level === 'moderate' ? 6 : 3,
      techniqueUsed: technique,
      patientNote: `Patient completed calming session using ${technique}.`,
      caregiverAlerted: level === 'severe',
      resolved: true,
    };
    setAnxietyLogs((prev) => [newLog, ...prev]);
  };

  const handleSendComfortNote = (note: string) => {
    setComfortNote(note);
    if (voicePromptsEnabled && currentRole === 'patient') {
      speakText(`Note from your caregiver: ${note}`, currentLanguage);
    }
  };

  // CAREGIVER LOGOUT HANDLER (LOGS OUT AND RESETS TO PATIENT VIEW)
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    try {
      localStorage.setItem('sahayak_role', role);
    } catch (err) {
      console.error('Error saving role:', err);
    }
    if (role === 'patient' && (activeTab === 'alerts' || activeTab === 'progress')) {
      setActiveTab('dashboard');
    }
  };

  const handleCaregiverLogout = () => {
    playGentleTap();
    handleRoleChange('patient');
    setActiveTab('dashboard');
  };

  const handleOnboardingComplete = (
    role: UserRole, 
    language: Language,
    newCaregiverDetails?: CaregiverDetails,
    seniorPatientName?: string
  ) => {
    setCurrentRole(role);
    setCurrentLanguage(language);
    localStorage.setItem('sahayak_role', role);
    localStorage.setItem('sahayak_language', language);
    localStorage.setItem('sahayak_onboarding_completed', 'true');

    if (newCaregiverDetails) {
      setCaregiverDetails(newCaregiverDetails);
      localStorage.setItem('sahayak_caregiver_details', JSON.stringify(newCaregiverDetails));

      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === activePatientId || p.id === 'pat-1') {
            return {
              ...p,
              name: seniorPatientName && seniorPatientName.trim() ? seniorPatientName.trim() : p.name,
              caregiverName: newCaregiverDetails.name,
              caregiverPhone: newCaregiverDetails.phone,
              emergencyContact: newCaregiverDetails.phone,
              emergencyContactName: newCaregiverDetails.name,
            };
          }
          return p;
        })
      );
    }

    setIsOnboarding(false);
  };

  // If user is completing initial setup or requested language/role switch:
  if (isOnboarding) {
    return (
      <OnboardingFlow
        currentLanguage={currentLanguage}
        currentRole={currentRole}
        initialCaregiverDetails={caregiverDetails}
        initialPatientName={activePatient?.name || 'Rameshwar Ji'}
        initialStep={onboardingInitialStep}
        onComplete={handleOnboardingComplete}
        onCancel={
          localStorage.getItem('sahayak_onboarding_completed') === 'true'
            ? () => setIsOnboarding(false)
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      
      {/* Top Accessible Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        voicePromptsEnabled={voicePromptsEnabled}
        onToggleVoicePrompts={() => setVoicePromptsEnabled(!voicePromptsEnabled)}
        alerts={alerts}
        patients={patients}
        activePatientId={activePatientId}
        onSelectPatient={handleSelectPatient}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
        onOpenAlerts={() => {
          setCurrentRole('caregiver');
          setActiveTab('alerts');
        }}
        onRequestCaregiverSwitch={() => setIsPinModalOpen(true)}
        onCaregiverLogout={handleCaregiverLogout}
        onOpenUsbDownload={() => setIsUsbModalOpen(true)}
        onOpenRoleAndLanguageSelector={() => {
          setOnboardingInitialStep(1);
          setIsOnboarding(true);
        }}
      />

      {/* Critical Emergency SOS Active Banner */}
      {sosBannerActive && (
        <div className="bg-rose-600 text-white p-3.5 shadow-xl text-center sticky top-16 sm:top-20 z-30 animate-bounce">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🚨</span>
              <span className="font-black text-xs sm:text-sm">
                {t.promptSosTriggered}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={`tel:${activePatient.caregiverPhone}`}
                className="px-3.5 py-1.5 bg-white text-rose-700 text-xs font-black rounded-xl shadow-xs hover:bg-rose-50"
              >
                Call Caregiver ({activePatient.caregiverPhone})
              </a>
              <button
                onClick={() => setSosBannerActive(false)}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Content View */}
      <main className="flex-1 pb-16 sm:pb-20 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6">
        {activeTab === 'tasks' ? (
          <TasksView
            language={currentLanguage}
            patientName={activePatient.name}
            medications={medications}
            waterGlasses={waterGlasses}
            voicePromptsEnabled={voicePromptsEnabled}
            onToggleMedication={handleToggleMedication}
            onAddWaterGlass={() => setWaterGlasses((w) => w + 1)}
            onBackToHome={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'anxiety' ? (
          <AnxietyFeature
            language={currentLanguage}
            patientName={activePatient.name}
            caregiverName={activePatient.caregiverName}
            caregiverPhone={activePatient.caregiverPhone}
            voicePromptsEnabled={voicePromptsEnabled}
            onAddCaregiverAlert={handleAddCaregiverAlert}
            onLogAnxietySession={handleLogAnxietySession}
            onBackToHome={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'photos' ? (
          <PhotoAlbum
            language={currentLanguage}
            currentRole={currentRole}
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onBackToHome={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'games' ? (
          <GamesHub
            language={currentLanguage}
            patientName={activePatient.name}
            onSaveScore={handleSaveGameScore}
            onBackToHome={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'progress' ? (
          <ProgressTracker
            language={currentLanguage}
            patient={activePatient}
            waterGlasses={waterGlasses}
            medsTakenCount={medications.filter((m) => m.takenToday).length}
            totalMeds={medications.length}
            anxietyEpisodesToday={anxietyLogs.length}
            onBack={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'alerts' ? (
          <CaregiverAlerts
            language={currentLanguage}
            alerts={alerts}
            patientName={activePatient.name}
            patientPhone={activePatient.emergencyContact}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onSimulateTestAlert={handleSimulateTestAlert}
            onSendComfortNoteToPatient={handleSendComfortNote}
          />
        ) : currentRole === 'caregiver' ? (
          <CaregiverDashboard
            language={currentLanguage}
            profile={activePatient}
            caregiverDetails={caregiverDetails}
            patients={patients}
            alerts={alerts}
            photos={photos}
            medications={medications}
            waterGlasses={waterGlasses}
            currentMood={currentMood}
            onSelectPatient={handleSelectPatient}
            onDeletePatient={handleDeletePatient}
            onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
            onOpenProgressTracker={() => setActiveTab('progress')}
            onOpenAlerts={() => setActiveTab('alerts')}
            onOpenPhotos={() => setActiveTab('photos')}
            onOpenTasks={() => setActiveTab('tasks')}
            onSendComfortNote={handleSendComfortNote}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onTriggerWanderingAlert={(message, distance) => {
              handleAddCaregiverAlert({
                type: 'wandering',
                title: `WANDERING ALERT: ${activePatient.name} Left Safe Perimeter (${distance}m)`,
                message,
                priority: 'critical',
                patientName: activePatient.name,
                patientId: activePatient.id,
                status: 'active',
                location: `${distance}m from safe zone`,
                notes: 'Check Live GPS & Contact Family Immediately',
              });
            }}
            onOpenUsbDownload={() => setIsUsbModalOpen(true)}
            onSwitchToPatient={() => handleRoleChange('patient')}
            onCaregiverLogout={handleCaregiverLogout}
          />
        ) : (
          <PatientDashboard
            language={currentLanguage}
            profile={activePatient}
            patientName={activePatient.name}
            caregiverName={activePatient.caregiverName}
            caregiverPhone={activePatient.caregiverPhone}
            patients={patients}
            activePatientId={activePatientId}
            onSelectPatient={handleSelectPatient}
            photos={photos}
            medications={medications}
            waterGlasses={waterGlasses}
            currentMood={currentMood}
            comfortNote={comfortNote}
            voicePromptsEnabled={voicePromptsEnabled}
            recentActions={recentActions}
            onAddRecentAction={handleAddRecentAction}
            onAddAction={handleAddRecentAction}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
            onOpenAnxiety={() => setActiveTab('anxiety')}
            onOpenAnxietyRelief={() => setActiveTab('anxiety')}
            onOpenGames={() => setActiveTab('games')}
            onOpenPhotos={() => setActiveTab('photos')}
            onOpenTasks={() => setActiveTab('tasks')}
            onRequestCaregiverSwitch={() => setIsPinModalOpen(true)}
            onCaregiverSwitchRequest={() => setIsPinModalOpen(true)}
            onTriggerSOS={handleTriggerSOS}
            onToggleMedication={handleToggleMedication}
            onAddWaterGlass={handleAddWater}
            onSelectMood={handleSelectMood}
            onSetMood={handleSelectMood}
          />
        )}
      </main>

      {/* Bottom Navigation: Specific, Clean Icons For Patient & Caregiver */}
      <nav 
        id="app-bottom-navbar" 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-3 shadow-lg"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* 1. HOME TAB */}
          <button
            id="tab-home"
            onClick={() => {
              playGentleTap();
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center p-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-teal-700 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.home}</span>
          </button>

          {/* 2. TASKS & ROUTINE TAB (BOTH ROLES) */}
          <button
            id="tab-tasks"
            onClick={() => {
              playGentleTap();
              setActiveTab('tasks');
            }}
            className={`flex flex-col items-center p-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'text-teal-700 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-5 h-5 text-teal-600" />
            <span className="text-[10px] mt-0.5">Tasks</span>
          </button>

          {/* 3. PHOTOS / UPLOAD TAB (BOTH ROLES) */}
          <button
            id="tab-photos"
            onClick={() => {
              playGentleTap();
              setActiveTab('photos');
            }}
            className={`flex flex-col items-center p-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'photos'
                ? 'text-teal-700 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Images className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Photos</span>
          </button>

          {/* 4. PATIENT: GAMES / CAREGIVER: ALERTS */}
          {currentRole === 'patient' ? (
            <button
              id="tab-games"
              onClick={() => {
                playGentleTap();
                setActiveTab('games');
              }}
              className={`flex flex-col items-center p-1.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'games'
                  ? 'text-amber-700 font-extrabold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Gamepad2 className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] mt-0.5">Games</span>
            </button>
          ) : (
            <button
              id="tab-alerts"
              onClick={() => {
                playGentleTap();
                setActiveTab('alerts');
              }}
              className={`flex flex-col items-center p-1.5 rounded-xl transition-colors relative cursor-pointer ${
                activeTab === 'alerts'
                  ? 'text-amber-800 font-extrabold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              {alerts.filter((a) => a.status !== 'resolved').length > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-600 rounded-full animate-ping" />
              )}
              <span className="text-[10px] mt-0.5">Alerts</span>
            </button>
          )}

          {/* 5. PATIENT: CALM / CAREGIVER: ANALYTICS */}
          {currentRole === 'patient' ? (
            <button
              id="tab-anxiety"
              onClick={() => {
                playGentleTap();
                setActiveTab('anxiety');
              }}
              className={`flex flex-col items-center p-1.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'anxiety'
                  ? 'text-teal-700 font-extrabold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Wind className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] mt-0.5">Calm</span>
            </button>
          ) : (
            <button
              id="tab-progress"
              onClick={() => {
                playGentleTap();
                setActiveTab('progress');
              }}
              className={`flex flex-col items-center p-1.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'progress'
                  ? 'text-teal-700 font-extrabold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Analytics</span>
            </button>
          )}

        </div>
      </nav>

      {/* Voice Assistant AI Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={currentLanguage}
        patientName={activePatient.name}
        onNavigateToAnxiety={() => setActiveTab('anxiety')}
        onNavigateToPhotos={() => setActiveTab('photos')}
        onNavigateToMeds={() => setActiveTab('tasks')}
        onTriggerSOS={handleTriggerSOS}
        onAddCaregiverAlert={handleAddCaregiverAlert}
      />

      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        language={currentLanguage}
        onAccept={() => {
          localStorage.setItem('sahayak_terms_accepted', 'true');
        }}
      />

      {/* Add New Patient Modal (Caregiver) with Box 1 and Box 2 */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        language={currentLanguage}
        onAddPatient={handleAddPatient}
        existingPatients={patients}
      />

      {/* Caregiver PIN Verification Modal (Protects Caregiver Portal) */}
      <CaregiverPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        language={currentLanguage}
        correctPin={caregiverDetails.securityPin || '1234'}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setCurrentRole('caregiver');
          setActiveTab('dashboard');
        }}
      />

      {/* Download App via USB Modal */}
      <UsbDownloadModal
        isOpen={isUsbModalOpen}
        onClose={() => setIsUsbModalOpen(false)}
        currentLanguage={currentLanguage}
        patientName={activePatient.name}
        caregiverName={caregiverDetails.name}
      />

    </div>
  );
}
