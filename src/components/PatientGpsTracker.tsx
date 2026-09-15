import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Home, 
  Compass, 
  RefreshCw, 
  Volume2, 
  Share2, 
  Check, 
  Footprints,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Language, GPSLocation, GeofenceZone, GeofenceStatus, PatientProfile } from '../types';
import { getBhashiniI18n } from '../i18n/bhashiniTranslations';
import { calculateHaversineDistanceMeters } from '../services/bhashiniService';
import { playAlertChime, playGentleTap } from '../utils/audio';

interface PatientGpsTrackerProps {
  patient: PatientProfile;
  language: Language;
  onTriggerWanderingAlert?: (alertMessage: string, distance: number) => void;
}

// Default Fallback Home Location (e.g. Green Valley Senior Living)
const DEFAULT_HOME_COORDS = {
  lat: 23.0338,
  lng: 72.5850,
};

export const PatientGpsTracker: React.FC<PatientGpsTrackerProps> = ({
  patient,
  language,
  onTriggerWanderingAlert,
}) => {
  const t = getBhashiniI18n(language);

  // Home Safe Zone State
  const [homeZone, setHomeZone] = useState<GeofenceZone>(() => {
    const saved = localStorage.getItem(`gps_home_${patient.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: `${patient.name}'s Residence`,
      latitude: DEFAULT_HOME_COORDS.lat,
      longitude: DEFAULT_HOME_COORDS.lng,
      radiusMeters: 150, // 150 meters default safe perimeter
      isActive: true,
    };
  });

  // Current GPS Telemetry
  const [currentLocation, setCurrentLocation] = useState<GPSLocation>(() => ({
    latitude: homeZone.latitude + 0.00018, // ~20 meters away
    longitude: homeZone.longitude + 0.00015,
    accuracy: 6,
    altitude: 54,
    speed: 1.1, // ~4 km/h walking pace
    heading: 45,
    timestamp: Date.now(),
    isSimulated: true,
  }));

  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ lat: number; lng: number; time: string }>>([
    { lat: homeZone.latitude, lng: homeZone.longitude, time: '30m ago' },
    { lat: homeZone.latitude + 0.00008, lng: homeZone.longitude + 0.00006, time: '15m ago' },
    { lat: homeZone.latitude + 0.00018, lng: homeZone.longitude + 0.00015, time: 'Just now' },
  ]);

  const [gpsStatus, setGpsStatus] = useState<GeofenceStatus>('safe');
  const [distanceFromHome, setDistanceFromHome] = useState<number>(25);
  const [isTrackingLive, setIsTrackingLive] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [alarmPlaying, setAlarmPlaying] = useState<boolean>(false);
  const [radarZoom, setRadarZoom] = useState<number>(1); // 1 = 1x, 1.5 = zoomed in, 0.75 = wide
  const [hasAlertedWandering, setHasAlertedWandering] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);

  // Save Home Zone to localStorage when changed
  const updateHomeZone = (newZone: GeofenceZone) => {
    setHomeZone(newZone);
    localStorage.setItem(`gps_home_${patient.id}`, JSON.stringify(newZone));
  };

  // Recalculate distance and geofence status
  useEffect(() => {
    if (!currentLocation) return;

    const dist = calculateHaversineDistanceMeters(
      homeZone.latitude,
      homeZone.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    setDistanceFromHome(dist);

    if (dist <= homeZone.radiusMeters * 0.75) {
      setGpsStatus('safe');
      setHasAlertedWandering(false);
    } else if (dist <= homeZone.radiusMeters) {
      setGpsStatus('near_boundary');
    } else {
      setGpsStatus('wandering_alert');

      // Trigger automatic wandering alert once when threshold is breached
      if (!hasAlertedWandering && onTriggerWanderingAlert) {
        setHasAlertedWandering(true);
        playAlertChime(true);
        onTriggerWanderingAlert(
          `${patient.name} has crossed the safe home perimeter! Currently ${dist} meters away from ${homeZone.name}.`,
          dist
        );
      }
    }
  }, [currentLocation, homeZone, hasAlertedWandering, patient.name, onTriggerWanderingAlert]);

  // Real Hardware Geolocation (Offline satellite works on device)
  const startRealGpsTracking = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation hardware is not available on this browser. Simulated mode will remain active.');
      return;
    }

    playGentleTap();
    setIsTrackingLive(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc: GPSLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : null,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
          isSimulated: false,
        };
        setCurrentLocation(newLoc);

        // If Home is still default, align home to patient's real initial fix
        if (homeZone.latitude === DEFAULT_HOME_COORDS.lat) {
          updateHomeZone({
            ...homeZone,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      },
      (err) => {
        console.warn('GPS location acquisition note:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Watch position
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc: GPSLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : null,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
          isSimulated: false,
        };
        setCurrentLocation(newLoc);
        setBreadcrumbs((prev) => [
          ...prev.slice(-8),
          { lat: newLoc.latitude, lng: newLoc.longitude, time: 'Just now' },
        ]);
      },
      (err) => {
        console.warn('GPS watch error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const stopRealGpsTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTrackingLive(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Action: Set Current Location as Home Base
  const handleSetCurrentAsHome = () => {
    playGentleTap();
    updateHomeZone({
      ...homeZone,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });
    setBreadcrumbs([
      { lat: currentLocation.latitude, lng: currentLocation.longitude, time: 'Home set' },
    ]);
  };

  // Action: Reset patient location to home
  const handleResetToHome = () => {
    playGentleTap();
    setCurrentLocation({
      latitude: homeZone.latitude + 0.00005,
      longitude: homeZone.longitude + 0.00005,
      accuracy: 5,
      altitude: 50,
      speed: 0,
      heading: 0,
      timestamp: Date.now(),
      isSimulated: true,
    });
    setHasAlertedWandering(false);
  };

  // Action: Simulate Step (Walk slightly or breach safe perimeter for test)
  const handleSimulateWalk = (stepMeters: number) => {
    playGentleTap();
    // 1 deg latitude is approx 111,000 meters
    const deltaDeg = stepMeters / 111000;
    const newLat = currentLocation.latitude + deltaDeg;
    const newLng = currentLocation.longitude + deltaDeg * 0.8;

    const newLoc: GPSLocation = {
      latitude: newLat,
      longitude: newLng,
      accuracy: 6,
      altitude: 52,
      speed: 3.2,
      heading: 60,
      timestamp: Date.now(),
      isSimulated: true,
    };
    setCurrentLocation(newLoc);
    setBreadcrumbs((prev) => [
      ...prev.slice(-8),
      { lat: newLat, lng: newLng, time: 'Just now' },
    ]);
  };

  // Action: Copy SMS Emergency Coordinates
  const handleCopyCoords = () => {
    playGentleTap();
    const smsText = `EMERGENCY GPS for ${patient.name}:\nLat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}\nDistance from Home: ${distanceFromHome}m (${gpsStatus})\nMap: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(smsText);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 3000);
    }
  };

  // Action: Trigger Loud Patient Device Siren
  const handleTriggerAlarm = () => {
    setAlarmPlaying(true);
    playAlertChime(true);
    setTimeout(() => {
      playAlertChime(true);
    }, 600);
    setTimeout(() => setAlarmPlaying(false), 3000);
  };

  // Calculate radar pixel coordinates relative to center (Home)
  // 1 meter = 1.1 * radarZoom pixels in a 300x300 viewBox
  const RADAR_CENTER = 150;
  const METERS_TO_PIXELS = (100 / homeZone.radiusMeters) * radarZoom;

  // Approximate dx, dy in meters from home
  const deltaLatMeters = (currentLocation.latitude - homeZone.latitude) * 111000;
  const deltaLngMeters = (currentLocation.longitude - homeZone.longitude) * 111000 * Math.cos((homeZone.latitude * Math.PI) / 180);

  const patientPixelX = Math.max(15, Math.min(285, RADAR_CENTER + deltaLngMeters * METERS_TO_PIXELS));
  const patientPixelY = Math.max(15, Math.min(285, RADAR_CENTER - deltaLatMeters * METERS_TO_PIXELS));
  const safeZonePixelRadius = homeZone.radiusMeters * METERS_TO_PIXELS;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden text-stone-800 space-y-3 p-3 sm:p-4">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
              <Navigation className="w-4 h-4 text-teal-700" />
            </span>
            <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center space-x-1.5">
              <span>{t.liveGpsTitle}</span>
              <span className="text-[9px] bg-teal-800 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Offline Satellite GPS
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {t.liveGpsSubtitle}
          </p>
        </div>

        {/* Live Satellite Satellite Sync Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={isTrackingLive ? stopRealGpsTracking : startRealGpsTracking}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isTrackingLive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isTrackingLive ? 'text-emerald-100 animate-spin' : 'text-stone-500'}`} />
            <span>{isTrackingLive ? 'Live Hardware GPS Active' : 'Acquire Device GPS'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Alert Ribbon */}
      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
        gpsStatus === 'safe'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : gpsStatus === 'near_boundary'
          ? 'bg-amber-50 border-amber-300 text-amber-950'
          : 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-500'
      }`}>
        <div className="flex items-center space-x-2 min-w-0">
          {gpsStatus === 'safe' && (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          {gpsStatus === 'near_boundary' && (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
          )}
          {gpsStatus === 'wandering_alert' && (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
          )}
          <div className="min-w-0">
            <span className="text-xs font-black block truncate">
              {gpsStatus === 'safe'
                ? t.gpsStatusSafe
                : gpsStatus === 'near_boundary'
                ? t.gpsStatusNearBoundary
                : t.gpsStatusWandering}
            </span>
            <span className="text-[10px] opacity-80 block truncate">
              {patient.name} is {distanceFromHome} meters from {homeZone.name} (Perimeter: {homeZone.radiusMeters}m)
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-black text-stone-900 block">
            {distanceFromHome}m
          </span>
          <span className="text-[9px] text-stone-500 block uppercase font-bold">
            from Safe Zone
          </span>
        </div>
      </div>

      {/* Interactive Offline Geofence Radar / Map Vector Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Visual Map Canvas (Left 7 Cols) */}
        <div className="md:col-span-7 bg-stone-900 rounded-xl p-3 relative overflow-hidden border border-stone-800 shadow-inner flex flex-col items-center justify-center min-h-[280px]">
          
          {/* Compass & Zoom Overlays */}
          <div className="absolute top-2 left-2 flex items-center space-x-1.5 z-10">
            <span className="px-2 py-0.5 bg-stone-800/80 backdrop-blur-xs text-[10px] font-black text-teal-400 rounded-md flex items-center space-x-1">
              <Compass className="w-3 h-3 text-teal-400" />
              <span>N</span>
            </span>
            <span className="px-2 py-0.5 bg-stone-800/80 backdrop-blur-xs text-[9px] font-bold text-stone-300 rounded-md">
              Zoom: {radarZoom.toFixed(1)}x
            </span>
          </div>

          <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
            <button
              onClick={() => setRadarZoom((prev) => Math.min(2.5, prev + 0.25))}
              className="p-1 bg-stone-800/90 hover:bg-stone-700 text-stone-200 rounded-md transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setRadarZoom((prev) => Math.max(0.5, prev - 0.25))}
              className="p-1 bg-stone-800/90 hover:bg-stone-700 text-stone-200 rounded-md transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setRadarZoom(1)}
              className="p-1 bg-stone-800/90 hover:bg-stone-700 text-stone-200 rounded-md transition-colors cursor-pointer"
              title="Recenter"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Geofence Radar */}
          <svg viewBox="0 0 300 300" className="w-full max-w-[280px] sm:max-w-[310px] aspect-square select-none">
            <defs>
              {/* Pulsing Safe Zone Pattern */}
              <radialGradient id="safePerimeterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="85%" stopColor="#10b981" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
              </radialGradient>
              <radialGradient id="patientGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </radialGradient>
            </defs>

            {/* Radar Grid Background Lines */}
            <circle cx="150" cy="150" r="135" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx="150" cy="150" r="95" fill="none" stroke="#27272a" strokeWidth="1" />
            <circle cx="150" cy="150" r="50" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="15" y1="150" x2="285" y2="150" stroke="#27272a" strokeWidth="1" />
            <line x1="150" y1="15" x2="150" y2="285" stroke="#27272a" strokeWidth="1" />

            {/* Safe Zone Boundary Circle */}
            <circle
              cx="150"
              cy="150"
              r={Math.min(140, safeZonePixelRadius)}
              fill="url(#safePerimeterGlow)"
              stroke={gpsStatus === 'wandering_alert' ? '#f43f5e' : '#10b981'}
              strokeWidth="2"
              strokeDasharray="4,3"
              className={gpsStatus === 'wandering_alert' ? 'animate-pulse' : ''}
            />

            {/* Safe Perimeter Label */}
            <text
              x="150"
              y={Math.max(25, 150 - Math.min(135, safeZonePixelRadius) - 5)}
              textAnchor="middle"
              fill="#10b981"
              fontSize="9"
              fontWeight="bold"
            >
              Safe Zone ({homeZone.radiusMeters}m)
            </text>

            {/* Breadcrumb Trail */}
            {breadcrumbs.length > 1 && (
              <polyline
                points={breadcrumbs
                  .map((b) => {
                    const dx = (b.lng - homeZone.longitude) * 111000 * Math.cos((homeZone.latitude * Math.PI) / 180);
                    const dy = (b.lat - homeZone.latitude) * 111000;
                    const px = Math.max(15, Math.min(285, RADAR_CENTER + dx * METERS_TO_PIXELS));
                    const py = Math.max(15, Math.min(285, RADAR_CENTER - dy * METERS_TO_PIXELS));
                    return `${px},${py}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.5"
                strokeDasharray="2,2"
                strokeOpacity="0.6"
              />
            )}

            {/* Home Marker */}
            <g transform="translate(142, 142)">
              <circle cx="8" cy="8" r="9" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="8" y="11" textAnchor="middle" fontSize="10">🏠</text>
            </g>
            <text x="150" y="166" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">
              Home Base
            </text>

            {/* Direct Line between Home and Patient */}
            <line
              x1="150"
              y1="150"
              x2={patientPixelX}
              y2={patientPixelY}
              stroke={gpsStatus === 'wandering_alert' ? '#f43f5e' : '#14b8a6'}
              strokeWidth="1.5"
              strokeDasharray="3,2"
            />

            {/* Distance Marker on Vector Line */}
            <text
              x={(150 + patientPixelX) / 2}
              y={(150 + patientPixelY) / 2 - 4}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="8"
              fontWeight="black"
              className="bg-stone-900"
            >
              {distanceFromHome}m
            </text>

            {/* Patient Marker (Pulsing Animated Pin) */}
            <g transform={`translate(${patientPixelX - 10}, ${patientPixelY - 10})`}>
              {/* Accuracy halo */}
              <circle cx="10" cy="10" r="14" fill="url(#patientGlow)" />
              <circle
                cx="10"
                cy="10"
                r="7"
                fill={gpsStatus === 'wandering_alert' ? '#e11d48' : '#0d9488'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <circle cx="10" cy="10" r="2.5" fill="#ffffff" />
            </g>
            <text
              x={patientPixelX}
              y={patientPixelY + 16}
              textAnchor="middle"
              fill={gpsStatus === 'wandering_alert' ? '#f87171' : '#2dd4bf'}
              fontSize="8"
              fontWeight="black"
            >
              {patient.name.split(' ')[0]} 🚶
            </text>
          </svg>

          {/* Map Footer Note */}
          <div className="text-[10px] text-stone-400 mt-1 flex items-center space-x-1">
            <span>● Green: Safe Perimeter</span>
            <span>•</span>
            <span>● Blue: Patient GPS Ping</span>
            <span>•</span>
            <span>🏠 Amber: Home Base</span>
          </div>
        </div>

        {/* Telemetry & Controls (Right 5 Cols) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-2.5">
          
          {/* Telemetry Details */}
          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 text-xs space-y-1.5">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
              {t.gpsCurrentCoordinates}
            </span>
            
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-1.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[9px]">{t.gpsLatitude}:</span>
                <span className="font-bold text-stone-900 font-mono text-[11px]">
                  {currentLocation.latitude.toFixed(5)}° N
                </span>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[9px]">{t.gpsLongitude}:</span>
                <span className="font-bold text-stone-900 font-mono text-[11px]">
                  {currentLocation.longitude.toFixed(5)}° E
                </span>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[9px]">{t.gpsAccuracy}:</span>
                <span className="font-bold text-stone-900">
                  ±{currentLocation.accuracy}m
                </span>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[9px]">{t.gpsSpeed}:</span>
                <span className="font-bold text-stone-900">
                  {currentLocation.speed !== null ? `${currentLocation.speed} km/h` : 'Stationary'}
                </span>
              </div>
            </div>

            {/* Geofence Radius Selector */}
            <div className="pt-1">
              <label className="text-[10px] font-bold text-stone-600 block mb-1">
                Safe Perimeter Radius:
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[50, 100, 150, 300].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => {
                      playGentleTap();
                      updateHomeZone({ ...homeZone, radiusMeters: radius });
                    }}
                    className={`py-1 rounded-lg text-[10px] font-black transition-colors ${
                      homeZone.radiusMeters === radius
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {radius}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions / Geofence Management */}
          <div className="space-y-1.5">
            
            {/* Set Current as Home */}
            <button
              onClick={handleSetCurrentAsHome}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold border border-stone-300 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.gpsSetHome}</span>
            </button>

            {/* Simulation Controls (Testing Wandering Alerts Offline) */}
            <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-1">
              <span className="text-[10px] font-black text-amber-900 uppercase block">
                Offline Simulation & Test:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSimulateWalk(25)}
                  className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Footprints className="w-3 h-3" />
                  <span>Walk 25m</span>
                </button>
                <button
                  onClick={() => handleSimulateWalk(120)}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-black transition-colors cursor-pointer"
                  title="Force exit safe zone to trigger Wandering Alert"
                >
                  Breach Safe Zone!
                </button>
              </div>
              <button
                onClick={handleResetToHome}
                className="w-full py-1 text-[10px] font-bold text-stone-600 hover:text-stone-900 hover:underline cursor-pointer"
              >
                Reset Patient Location to Home
              </button>
            </div>

            {/* Emergency Broadcast Actions */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleCopyCoords}
                className="flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy SMS GPS</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTriggerAlarm}
                className={`flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  alarmPlaying
                    ? 'bg-rose-700 text-white animate-bounce'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{alarmPlaying ? 'Alarm Ringing!' : 'Ring Phone'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Offline Hardware Direct Guarantee Badge */}
      <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-950 flex items-center justify-between text-[11px]">
        <span className="flex items-center space-x-1 font-semibold">
          <Radio className="w-3.5 h-3.5 text-teal-700" />
          <span>{t.gpsOfflineNotice}</span>
        </span>
        <span className="text-[10px] text-teal-700 font-bold">
          Satellite GPS: Active
        </span>
      </div>

    </div>
  );
};
