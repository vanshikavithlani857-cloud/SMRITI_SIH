import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  BellRing, 
  Filter, 
  PlusCircle, 
  Sparkles, 
  Volume2 
} from 'lucide-react';
import { Language, CaregiverAlert, AlertPriority } from '../types';
import { translations } from '../i18n/translations';
import { playAlertChime, playGentleTap, speakText } from '../utils/audio';

interface CaregiverAlertsProps {
  language: Language;
  alerts: CaregiverAlert[];
  patientName: string;
  patientPhone?: string;
  onUpdateAlertStatus: (alertId: string, status: 'acknowledged' | 'resolved', note?: string) => void;
  onSimulateTestAlert: (priority: AlertPriority, title: string, message: string) => void;
  onSendComfortNoteToPatient: (note: string) => void;
}

export const CaregiverAlerts: React.FC<CaregiverAlertsProps> = ({
  language,
  alerts,
  patientName,
  patientPhone = '+91 98765 43210',
  onUpdateAlertStatus,
  onSimulateTestAlert,
  onSendComfortNoteToPatient,
}) => {
  const t = translations[language];

  const [filter, setFilter] = useState<'all' | 'active' | 'critical' | 'resolved'>('all');
  const [responseModalAlertId, setResponseModalAlertId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [quickComfortSent, setQuickComfortSent] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return alert.status !== 'resolved';
    if (filter === 'critical') return alert.priority === 'critical' && alert.status !== 'resolved';
    if (filter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const activeCount = alerts.filter(a => a.status !== 'resolved').length;
  const criticalCount = alerts.filter(a => a.priority === 'critical' && a.status !== 'resolved').length;

  const handleSendComfort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    playGentleTap();
    onSendComfortNoteToPatient(responseText.trim());
    
    if (responseModalAlertId) {
      onUpdateAlertStatus(responseModalAlertId, 'acknowledged', `Caregiver sent note: "${responseText.trim()}"`);
    }

    setResponseText('');
    setResponseModalAlertId(null);
    setQuickComfortSent(true);
    setTimeout(() => setQuickComfortSent(false), 3000);
  };

  const handleTestTrigger = (type: 'sos' | 'anxiety' | 'fall') => {
    playAlertChime(true);
    if (type === 'sos') {
      onSimulateTestAlert(
        'critical',
        'EMERGENCY SOS Triggered (Simulated Test)',
        `${patientName} tapped the emergency panic button. Immediate intervention requested.`
      );
    } else if (type === 'anxiety') {
      onSimulateTestAlert(
        'high',
        'High Anxiety Episode (Simulated Test)',
        `${patientName} reported severe anxiety (8/10). Breathing assistance opened.`
      );
    } else {
      onSimulateTestAlert(
        'critical',
        'Fall Sensor Alert Triggered (Simulated)',
        `Sudden drop acceleration detected in bedroom. Verifying safety.`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30">
            <BellRing className="w-3.5 h-3.5" />
            <span>Real-Time Safety & Monitoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.criticalAlerts} & Safety Feed
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Instant push alerts for emergency SOS, high anxiety spikes, missed doses, and sensor activity.
          </p>
        </div>

        {/* Quick Simulation testing tools */}
        <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700 space-y-2 w-full md:w-auto">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Test Safety Dispatchers:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTestTrigger('sos')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              + Test SOS
            </button>
            <button
              onClick={() => handleTestTrigger('anxiety')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              + Test Anxiety
            </button>
            <button
              onClick={() => handleTestTrigger('fall')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              + Test Fall
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium block">Total Alerts</span>
          <span className="text-2xl font-black text-stone-900">{alerts.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-amber-700 font-medium block">Active Needs Action</span>
          <span className="text-2xl font-black text-amber-700">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/50 shadow-xs">
          <span className="text-xs text-rose-800 font-medium block">Critical / Urgent</span>
          <span className="text-2xl font-black text-rose-700">{criticalCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <span className="text-xs text-emerald-800 font-medium block">Resolved Safely</span>
          <span className="text-2xl font-black text-emerald-700">
            {alerts.filter(a => a.status === 'resolved').length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-stone-200">
        <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'active' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'critical' ? 'bg-white text-rose-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'resolved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Resolved
          </button>
        </div>

        {quickComfortSent && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-fade-in flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Calming note delivered to Patient Dashboard!</span>
          </span>
        )}
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-stone-200 text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No alerts in this category</h3>
            <p className="text-xs text-stone-500">
              Everything is peaceful and normal. Real-time alerts will appear here immediately when triggered.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.priority === 'critical';
            const isHigh = alert.priority === 'high';
            const isResolved = alert.status === 'resolved';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'bg-stone-50/70 border-stone-200 opacity-80'
                    : isCritical
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400 shadow-sm'
                    : isHigh
                    ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                    : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Alert Details */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isHigh
                          ? 'bg-amber-600 text-white'
                          : alert.priority === 'medium'
                          ? 'bg-sky-600 text-white'
                          : 'bg-stone-200 text-stone-800'
                      }`}>
                        {alert.priority}
                      </span>

                      <span className="text-xs font-semibold text-stone-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{alert.timestamp}</span>
                      </span>

                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        alert.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : alert.status === 'acknowledged'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-rose-100 text-rose-800 font-extrabold'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900">
                      {alert.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.responseNotes && (
                      <p className="text-xs font-medium text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 mt-2">
                        💬 Response Note: {alert.responseNotes}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2 w-full md:w-auto justify-end">
                    
                    {/* Call Patient Direct */}
                    <a
                      href={`tel:${patientPhone}`}
                      onClick={playGentleTap}
                      className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t.callPatient}</span>
                    </a>

                    {/* Send Comfort Message Note */}
                    <button
                      onClick={() => {
                        playGentleTap();
                        setResponseModalAlertId(alert.id);
                        setResponseText(`Dadaji, I am right here. You are safe, take a deep breath. Love you.`);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Comfort Note</span>
                    </button>

                    {/* Acknowledge Button */}
                    {!isResolved && alert.status !== 'acknowledged' && (
                      <button
                        onClick={() => {
                          playGentleTap();
                          onUpdateAlertStatus(alert.id, 'acknowledged');
                        }}
                        className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-colors"
                      >
                        {t.acknowledgeAlert}
                      </button>
                    )}

                    {/* Mark Resolved Button */}
                    {!isResolved && (
                      <button
                        onClick={() => {
                          playGentleTap();
                          onUpdateAlertStatus(alert.id, 'resolved');
                        }}
                        className="flex items-center space-x-1 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.resolveAlert}</span>
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Reassurance Modal */}
      {responseModalAlertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">
              Send Reassuring Note to {patientName}
            </h3>
            <p className="text-xs text-stone-600">
              This message will immediately appear as a soothing banner on their dashboard and can be read aloud.
            </p>
            <form onSubmit={handleSendComfort} className="space-y-3">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                className="w-full p-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-teal-600"
                placeholder="Write a warm note (e.g. 'I am on my way home with fresh fruits...')"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResponseModalAlertId(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Send & Acknowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
