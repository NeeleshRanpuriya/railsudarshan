import React from 'react';
import { User, Phone, Calendar, Briefcase, ShieldCheck, Key, CheckCircle, X, Award } from 'lucide-react';

export default function MeProfileModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header with Royal Railway Navy Gradient */}
        <div className="relative bg-gradient-to-r from-railway-900 via-railway-800 to-railway-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-bold text-amber-300 shadow-inner">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{user.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">{user.occupation || 'Passenger'} • RailRaksha Member</p>
            </div>
          </div>
        </div>

        {/* User Details Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Passenger Profile Credentials
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <User className="w-3.5 h-3.5 text-railway-600 dark:text-railway-400" /> Full Name
              </div>

              <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm mt-1">
                {user.fullName}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Registered Mobile
              </div>
              <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm mt-1 font-mono">
                +91 {user.mobile}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Age & Gender
              </div>
              <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm mt-1 capitalize">
                {user.age} yrs • {user.gender}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Occupation
              </div>
              <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm mt-1">
                {user.occupation}
              </div>
            </div>
          </div>

          {/* Security PIN Status Card */}
          <div className="p-4 rounded-xl bg-railway-50 dark:bg-railway-950/40 border border-railway-100 dark:border-railway-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-railway-600 text-white flex items-center justify-center shadow-md">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Quick Security PIN
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Used for fast PIN-based login on this portal
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sm text-railway-700 dark:text-railway-300 tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-railway-200 dark:border-railway-800">
                •••• ({user.pin ? 'Active' : 'Not Set'})
              </span>
            </div>
          </div>

          {/* Women Safety Protection Badge (if female) */}
          {user.gender?.toLowerCase() === 'female' ? (
            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pinkFemale text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300">
                  RailRaksha Women Safety Shield Active
                </div>
                <p className="text-xs text-pink-800/90 dark:text-pink-300/80 mt-0.5 leading-relaxed">
                  Your bookings automatically activate priority safe seat allocation near verified families and female passengers, strictly bypassing isolated male berths.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  RailRaksha Safety Network Member
                </div>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                  On-board emergency services, SOS medical assistance, and coolie/mobility bookings are active for your account.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
