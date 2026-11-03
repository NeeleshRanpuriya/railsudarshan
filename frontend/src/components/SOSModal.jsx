import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Stethoscope, 
  ShieldAlert, 
  Ambulance, 
  PhoneCall, 
  AlertOctagon, 
  CheckCircle, 
  X, 
  Radio, 
  Clock, 
  MapPin, 
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { ONBOARD_DOCTORS, EMERGENCY_NUMBERS } from '../data/mockData';

export default function SOSModal({ 
  isOpen, 
  onClose, 
  user,
  trainStatus = { isCurrentlyRunning: true, currentStation: 'DDU' },
  stops = [
    { code: 'HWH', name: 'Howrah Jn', status: 'passed' },
    { code: 'ASN', name: 'Asansol Jn', status: 'passed' },
    { code: 'DHN', name: 'Dhanbad Jn', status: 'passed' },
    { code: 'GAYA', name: 'Gaya Jn', status: 'passed' },
    { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', status: 'current' },
    { code: 'PRYJ', name: 'Prayagraj Jn', status: 'upcoming' },
    { code: 'CNB', name: 'Kanpur Central', status: 'upcoming' },
    { code: 'NDLS', name: 'New Delhi', status: 'upcoming' },
  ]
}) {
  if (!isOpen) return null;

  const [sosCategory, setSosCategory] = useState('medical'); // 'medical' or 'safety'
  
  // Medical State
  const [symptom, setSymptom] = useState('Chest pain');
  const [medicalAction, setMedicalAction] = useState(null); // 'alert_doctor', 'book_ambulance', 'dispatched'
  const [selectedUpcomingStation, setSelectedUpcomingStation] = useState('PRYJ');
  const [ambulanceType, setAmbulanceType] = useState('Advanced Cardiac Life Support (ACLS)');
  const [doctorAlertStatus, setDoctorAlertStatus] = useState(null);
  const [ambulanceDispatchStatus, setAmbulanceDispatchStatus] = useState(null);

  // Safety State
  const [policeAlertStatus, setPoliceAlertStatus] = useState(null);
  const [threatDescription, setThreatDescription] = useState('Harassment / Suspicious Activity');

  // Filter ONLY UPCOMING STATIONS for ambulance booking
  // Prompt Requirement: "(only , not on the station left, and can only be booked while the trian is running currnnently can't be booked in advance)."
  const upcomingStops = stops.filter(s => s.status === 'upcoming');

  // Handle Alert Doctor On Board
  const handleAlertDoctor = () => {
    setDoctorAlertStatus({
      alertedDoctors: ONBOARD_DOCTORS,
      timestamp: new Date().toLocaleTimeString(),
      status: 'Emergency broadcast transmitted to 3 verified medical professionals on board in coaches B2, A1, B4.',
    });
  };

  // Handle Book Ambulance at Upcoming Station
  const handleBookAmbulance = () => {
    if (!trainStatus.isCurrentlyRunning) {
      alert('RailRaksha Rule: Emergency Ambulance can ONLY be booked while the train is actively running, not in advance.');
      return;
    }

    const stationObj = stops.find(s => s.code === selectedUpcomingStation);
    setAmbulanceDispatchStatus({
      station: stationObj ? stationObj.name : selectedUpcomingStation,
      ambulanceType,
      dispatchId: 'AMB-' + Math.floor(10000 + Math.random() * 90000),
      eta: 'Waiting at Platform upon train arrival',
      paramedics: 'Railway Divisional Hospital Emergency Response Unit',
    });
  };

  // Handle Alert Police On Board
  const handleAlertPolice = () => {
    setPoliceAlertStatus({
      alertId: 'RPF-SOS-' + Math.floor(10000 + Math.random() * 90000),
      coach: 'B3',
      berth: '21',
      squad: 'RPF Train Escort Party (Sub-Inspector R.K. Meena & 2 Armed Constables)',
      eta: 'Reaching Coach B3 within 2-3 minutes',
      status: 'High-priority distress siren triggered on onboard security devices.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Emergency Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white ring-2 ring-white/30 animate-pulse">
              <LifeBuoy className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">RailRaksha Emergency SOS</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white text-red-700 tracking-wider">
                  24x7 Priority Red Line
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Instant Onboard Doctor Network & Police Escort Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Dual Option Switch: Medical vs Safety */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setSosCategory('medical')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              sosCategory === 'medical'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>1. Medical Emergency Help</span>
          </button>

          <button
            onClick={() => setSosCategory('safety')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              sosCategory === 'safety'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>2. Safety & Police Escort</span>
          </button>
        </div>

        {/* Scrollable SOS Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* ========================================================
              BRANCH 1: MEDICAL HELP
              (Prompt: "in medical help , there will be options like what is happening? chest pain,fainting and dizziness,injury and bleeding ,pregancy related, fever and vomiting , then there will be option to alert doctors on the board,then the user can book the ambulance on the upcoming stations (only , not on the station left, and can only be booked while the trian is running currnnently can't be booked in advance).")
             ======================================================== */}
          {sosCategory === 'medical' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Question: What is happening? */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  What is happening? (Select Condition)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Chest pain', icon: '🫀' },
                    { label: 'Fainting and dizziness', icon: '💫' },
                    { label: 'Injury and bleeding', icon: '🩸' },
                    { label: 'Pregnancy related', icon: '🤰' },
                    { label: 'Fever and vomiting', icon: '🌡️' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSymptom(item.label)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        symptom === item.label
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-bold text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action 1: Alert Doctors on Board */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Alert Doctors On Board
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    3 Doctors in Train Database
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sends an instant high-priority emergency pager to verified medical practitioners and nurses traveling on this train to attend to your berth immediately.
                </p>

                {!doctorAlertStatus ? (
                  <button
                    type="button"
                    onClick={handleAlertDoctor}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Broadcast Urgent Alert to Onboard Doctors</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Doctors Alerted Successfully at {doctorAlertStatus.timestamp}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {doctorAlertStatus.status}
                    </p>
                    <div className="pt-1 text-[11px] font-mono border-t border-emerald-200 dark:border-emerald-800">
                      Attending: Dr. Priya Sharma (Cardiology, Coach B2 Berth 24), Dr. Anand Verma (A1 Berth 11)
                    </div>
                  </div>
                )}
              </div>

              {/* Action 2: Book Ambulance on Upcoming Stations */}
              {/* Prompt Rules: (only, not on station left, and can only be booked while train is running currently, can't be booked in advance) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ambulance className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Book Ambulance at Upcoming Stations
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    Strict Railway Rule Active
                  </span>
                </div>

                {/* Validation Banner */}
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-[11px] text-red-800 dark:text-red-300">
                  ⚡ <strong>Mandatory Rule:</strong> Station ambulance can <strong>ONLY</strong> be booked for <strong>upcoming stations</strong> ahead of current train position while train is actively running. Passed stations ({stops.filter(s => s.status === 'passed').map(s => s.name).join(', ')}) are locked. Advance booking is strictly prohibited.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Upcoming Station (Only Upcoming)
                    </label>
                    <select
                      value={selectedUpcomingStation}
                      onChange={(e) => setSelectedUpcomingStation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      {upcomingStops.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} ({st.code}) — Arr: {st.arrival}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ambulance Fleet Type
                    </label>
                    <select
                      value={ambulanceType}
                      onChange={(e) => setAmbulanceType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="Advanced Cardiac Life Support (ACLS)">Advanced Cardiac Life Support (ACLS)</option>
                      <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                      <option value="Neonatal & Maternity Trauma Unit">Neonatal & Maternity Trauma Unit</option>
                    </select>
                  </div>
                </div>

                {!ambulanceDispatchStatus ? (
                  <button
                    type="button"
                    onClick={handleBookAmbulance}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Ambulance className="w-4 h-4" />
                    <span>Confirm & Dispatch Ambulance to {selectedUpcomingStation} Station</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 space-y-1.5 animate-fadeIn font-mono">
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Ambulance Dispatched! Ref: {ambulanceDispatchStatus.dispatchId}</span>
                    </div>
                    <div>Station: <strong>{ambulanceDispatchStatus.station}</strong></div>
                    <div>Fleet: {ambulanceDispatchStatus.ambulanceType}</div>
                    <div>Team: {ambulanceDispatchStatus.paramedics}</div>
                    <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                      Status: {ambulanceDispatchStatus.eta}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              BRANCH 2: SAFETY & POLICE HELP
              (Prompt: "now another service ill be of safety whic will alert police on board using this option , also it will have women helpone numbers ,railway police numbers.")
             ======================================================== */}
          {sosCategory === 'safety' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Alert Police On Board */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Alert Police / RPF Escort On Board
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse">
                    Armed Patrol Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instantly transmits an SOS emergency signal with your live coach (B3) and berth (21) directly to the Railway Protection Force (RPF) and GRP squad currently patrolling this train.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nature of Distress
                  </label>
                  <select
                    value={threatDescription}
                    onChange={(e) => setThreatDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Harassment / Unsafe co-passenger">Harassment / Unsafe Co-passenger</option>
                    <option value="Theft or physical intimidation">Theft or Physical Intimidation</option>
                    <option value="Unauthorized male entered female section">Unauthorized Male Entered Safe Section</option>
                    <option value="General emergency security threat">General Emergency Security Threat</option>
                  </select>
                </div>

                {!policeAlertStatus ? (
                  <button
                    type="button"
                    onClick={handleAlertPolice}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Dispatch RPF Police Patrol to My Coach Immediately</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 space-y-1.5 animate-fadeIn">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Distress Siren Acknowledged! Incident #{policeAlertStatus.alertId}</span>
                    </div>
                    <div className="font-mono">
                      Responding Squad: <strong>{policeAlertStatus.squad}</strong>
                    </div>
                    <div className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                      {policeAlertStatus.eta}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Helplines Directory */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Direct Toll-Free Emergency Helpline Numbers
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EMERGENCY_NUMBERS.map((item) => (
                    <div
                      key={item.number}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.note}
                        </div>
                      </div>

                      <a
                        href={`tel:${item.number}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-mono font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{item.number}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
