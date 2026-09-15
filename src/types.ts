export type Language = 
  | 'en' 
  | 'hi' 
  | 'as'   // Assamese (অসমীয়া) - North East
  | 'mni'  // Manipuri / Meitei (মৈতৈলোন্) - North East
  | 'ne'   // Nepali (नेपाली) - Sikkim & North East
  | 'brx'; // Bodo (बर'/बड़ो) - Assam / North East

export type UserRole = 'patient' | 'caregiver';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'info';

export type AlertType = 
  | 'sos' 
  | 'anxiety' 
  | 'medication_missed' 
  | 'fall_detected' 
  | 'inactivity' 
  | 'voice_distress'
  | 'wandering';

export interface CaregiverAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  patientName: string;
  patientId?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location?: string;
  resolvedAt?: string;
  responseNotes?: string;
  notes?: string;
}

export interface MemoryPhoto {
  id: string;
  url: string;
  title: string;
  relation: string;
  memoryNote: string;
  dateAdded: string;
  addedBy: string;
  patientId?: string;
  featuredInDashboard?: boolean;
  translations?: Partial<Record<Language, {
    title?: string;
    relation?: string;
    memoryNote?: string;
  }>>;
}

export type RecentActionType = 
  | 'water' 
  | 'medication' 
  | 'breathing' 
  | 'photo' 
  | 'tea' 
  | 'walk' 
  | 'family' 
  | 'rest' 
  | 'wash' 
  | 'mood';

export interface RecentAction {
  id: string;
  timestamp: string;
  minutesAgo: number;
  type: RecentActionType;
  title: string;
  description: string;
  patientId?: string;
  translations?: Partial<Record<Language, {
    title: string;
    description: string;
  }>>;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude?: number | null;
  speed?: number | null; // km/h or m/s
  heading?: number | null;
  timestamp: number;
  isSimulated?: boolean;
}

export interface GeofenceZone {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export type GeofenceStatus = 'safe' | 'near_boundary' | 'wandering_alert' | 'gps_offline' | 'acquiring';

export interface PatientLocationState {
  currentLocation: GPSLocation | null;
  homeZone: GeofenceZone;
  status: GeofenceStatus;
  distanceFromHomeMeters: number;
  lastUpdated: string;
  history: GPSLocation[];
}

export interface CaregiverDetails {
  name: string;
  phone: string;
  relation: string;
  email?: string;
  city?: string;
  securityPin?: string;
  registeredAt?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  instructions: string;
  takenToday: boolean;
  takenAt?: string;
}

export interface AnxietyLog {
  id: string;
  timestamp: string;
  level: 'mild' | 'moderate' | 'severe';
  rating: number; // 1-10
  techniqueUsed: string;
  patientNote?: string;
  caregiverAlerted: boolean;
  resolved: boolean;
  patientId?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender?: string;
  condition: string;
  conditions?: string[];
  roomOrLocation?: string;
  caregiverName: string;
  primaryCaregiver?: string;
  caregiverPhone: string;
  emergencyContact: string;
  emergencyContactName?: string;
  bloodGroup?: string;
  doctorName?: string;
  preferredLanguage: Language;
  language?: Language;
  voicePromptsEnabled: boolean;
  voiceVolume: number;
  dateAdded?: string;
  notes?: string;
  gameScores?: CognitiveGameScore[];
}

export type GameDifficultyLevel = 1 | 2 | 3;

export interface TrackedGameAnswer {
  id: string;
  gameId: string;
  gameTitle: string;
  questionId: number | string;
  questionText: string;
  photoUrl?: string;
  chosenOption: string;
  correctOption: string;
  isCorrect: boolean;
  scoreAwarded: number;
  level: GameDifficultyLevel;
  timestamp: string;
}

export interface CognitiveGameScore {
  id: string;
  gameId: 'memory-flip' | 'emoji-identify' | 'odd-one-out' | 'sound-bell' | 'pattern-recognition' | 'object-recognition' | 'attention-challenge' | 'authentic-india-tours';
  gameTitle: string;
  score: number;
  maxScore: number;
  accuracyPercent: number;
  date: string;
  timestamp: string;
  patientId?: string;
  level?: GameDifficultyLevel;
  totalAnswered?: number;
  correctCount?: number;
  effortPoints?: number;
}

export interface DailyProgressSummary {
  date: string;
  medsComplianceRate: number; // 0 - 100
  waterGlasses: number;
  anxietyCount: number;
  gamesPlayedCount: number;
  averageGameScore: number;
  overallMood: string;
}
