import React from 'react';
import { 
  ShieldCheck, 
  LifeBuoy, 
  Stethoscope, 
  PhoneCall, 
  AlertCircle, 
  Users, 
  HeartHandshake, 
  Sparkles,
  CheckCircle,
  Eye,
  Radio,
  FileText
} from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../data/mockData';

export default function SafetyTab({ onOpenSOS, user }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-railway-900 via-railway-800 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>National Railway Safety & Meri Saheli Framework</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Safety First. Every Passenger, Every Berth.
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            RailRaksha is India's dedicated railway passenger protection portal. Combining real-time algorithmic women safe-berth grouping with 24x7 onboard doctor alerts, rapid police response squads, and direct ambulance booking at upcoming stations.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenSOS}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <LifeBuoy className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Launch Emergency SOS Triage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Engine Core Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pinkFemale flex items-center justify-center font-bold text-xl shadow-inner">
            🛡️
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Solo Women & Female Group Allocation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The seat engine automatically groups solo female passengers and all-female parties in bays populated with verified families or female co-passengers. Isolated male sections and deserted coaches are dynamically excluded.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-inner">
            🩺
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Onboard Medical Professional Broadcast
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Registered doctors, surgeons, and emergency trauma nurses traveling on board receive high-priority alerts with your seat number during medical distress (chest pain, fainting, pregnancy emergencies).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner">
            🚨
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Upcoming Station Ambulance Pipeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Real-time ambulance dispatch to railway platform ahead of train arrival. Strict safety logic guarantees booking only for upcoming reachable stations while train is actively running.
          </p>
        </div>

      </div>

      {/* Emergency Helpline Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
            Emergency Contacts
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            24x7 Government & Railway Security Helplines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            One-touch emergency calling directory for immediate intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMERGENCY_NUMBERS.map((h) => (
            <div
              key={h.number}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{h.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{h.note}</p>
              </div>

              <a
                href={`tel:${h.number}`}
                className="px-3.5 py-1.5 rounded-xl bg-railway-900 dark:bg-emerald-600 text-white font-mono font-bold text-xs hover:bg-railway-800 shadow-sm flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{h.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Railway Safety Tips for Women & Families */}
      <div className="bg-pink-50 dark:bg-pink-950/20 rounded-3xl p-6 sm:p-8 border border-pink-200 dark:border-pink-900/40 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-pinkFemale" />
          <h3 className="text-base font-bold text-pink-900 dark:text-pink-200">
            "Meri Saheli" Journey Safety Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-pink-900/90 dark:text-pink-300 leading-relaxed">
          <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-pink-200 dark:border-pink-900/60">
            <strong>1. Female Officer Station Visits:</strong> RPF women officer teams visit coaches at major stopping stations to check on solo women travelers.
          </div>
          <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-pink-200 dark:border-pink-900/60">
            <strong>2. Emergency Chain Pull:</strong> Pulling the alarm chain notifies the driver, guard, and RPF squad immediately with coach telemetry.
          </div>
          <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-pink-200 dark:border-pink-900/60">
            <strong>3. CCTV Covered Entry Corridors:</strong> Modern LHB coaches feature 360-degree security cameras in vestibules and doorways.
          </div>
          <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-pink-200 dark:border-pink-900/60">
            <strong>4. Instant Help via 139 / RailRaksha:</strong> Dial 139 or click SOS anytime for immediate armed escort arrival within minutes.
          </div>
        </div>
      </div>

    </div>
  );
}
