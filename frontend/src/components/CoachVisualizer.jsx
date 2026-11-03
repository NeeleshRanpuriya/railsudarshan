import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  Info, 
  HelpCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { generateCoachState } from '../utils/safetySeatAllocator';

export default function CoachVisualizer({ 
  berths: propBerths, 
  coachName = 'B3', 
  bookedSeats = [], 
  allocationRationale = '',
  isFemaleOnly = false,
  isCancelled = false,
  refundInfo = null,
  showPassengerNames = false
}) {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const berths = propBerths || generateCoachState(coachName, 64);

  // Group berths into 8-berth bays (Classic Indian Railways compartment layout)
  // Each bay has: 6 main berths (Lower, Middle, Upper x 2) + 2 side berths (Side Lower, Side Upper)
  const totalBays = Math.ceil(berths.length / 8);
  const bays = [];

  for (let b = 1; b <= totalBays; b++) {
    bays.push({
      bayNumber: b,
      seats: berths.filter(s => s.bayNumber === b),
    });
  }

  // Get seat styling based on prompt:
  // Male: yellow
  // Female: pink
  // Families: dot indicator
  // Free seats: dotted line boxes
  const getSeatStyle = (seat) => {
    const isCurrentUser = seat.isCurrentUserBooking || bookedSeats.some(s => s.berthNumber === seat.berthNumber);

    if (isCurrentUser) {
      if (isCancelled) {
        return {
          bg: 'bg-red-500 text-white shadow-md ring-2 ring-red-400 line-through',
          border: 'border-2 border-red-600',
          badge: 'CANCELLED',
        };
      }
      return {
        bg: 'bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-300 dark:ring-emerald-700 animate-pulse',
        border: 'border-2 border-emerald-400',
        badge: 'YOU',
      };
    }

    if (!seat.isOccupied) {
      return {
        // "fre seats with dotted line boxes"
        bg: 'bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
        border: 'border-2 border-dashed border-slate-300 dark:border-slate-700',
        badge: 'FREE',
      };
    }

    const occupant = seat.occupant;
    const gender = occupant?.gender?.toLowerCase();

    if (gender === 'female') {
      // Female: Pink
      return {
        bg: 'bg-pink-500 text-white shadow-sm hover:brightness-105',
        border: 'border border-pink-600',
        badge: 'F',
      };
    }

    if (gender === 'male') {
      // Male: Yellow
      return {
        bg: 'bg-amber-400 text-slate-900 shadow-sm hover:brightness-105 font-bold',
        border: 'border border-amber-500',
        badge: 'M',
      };
    }

    return {
      bg: 'bg-indigo-500 text-white',
      border: 'border border-indigo-600',
      badge: 'O',
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Coach Header & Legend */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-railway-900 text-white text-xs font-mono font-bold tracking-wider">
                COACH {coachName}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Coach Berth Demographics & Seat Layout
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visual seat allocation showing safety indicators, surrounding passengers, and vacant seats.
              Passenger names are hidden by default for privacy.
            </p>
          </div>

          {bookedSeats.length > 0 && (
            isCancelled ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold animate-pulse">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Cancelled Berths: {bookedSeats.map(s => `${s.berthNumber} (${s.berthType})`).join(', ')} {refundInfo ? `• Refund: ₹${refundInfo.refundAmount}` : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Allocated Berths: {bookedSeats.map(s => `${s.berthNumber} (${s.berthType})`).join(', ')}</span>
              </div>
            )
          )}
        </div>

        {/* Safety Allocation Algorithm Notification */}
        {allocationRationale && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-emerald-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-emerald-950/30 border border-pink-200/80 dark:border-pink-900/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-pinkFemale text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Women Safety Guarantee Applied</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-pinkFemale/20 text-pink-700 dark:text-pink-300 font-semibold">
                  Rule IR-WS7
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                {allocationRationale}
              </p>
            </div>
          </div>
        )}

        {/* PROMPT SPECIFIED COLOR LEGEND:
            - Male for yellow
            - Females for pink
            - Families with dot
            - Free seats with dotted line boxes
        */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Official Color & Passenger Indicators (Per Railway Safety Directive)
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-semibold">
            
            {/* Female: Pink */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-pink-500 border border-pink-600 shadow-sm flex items-center justify-center text-[10px] text-white font-bold">
                F
              </div>
              <span className="text-slate-700 dark:text-slate-300">Female Passenger (<span className="text-pinkFemale font-bold">Pink</span>)</span>
            </div>

            {/* Male: Yellow */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-400 border border-amber-500 shadow-sm flex items-center justify-center text-[10px] text-slate-900 font-bold">
                M
              </div>
              <span className="text-slate-700 dark:text-slate-300">Male Passenger (<span className="text-amber-600 font-bold">Yellow</span>)</span>
            </div>

            {/* Family: Dot */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500 border border-indigo-600 shadow-sm flex items-center justify-center text-white relative">
                <span className="text-xs">•</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300">Family Group (<span className="font-bold text-indigo-600 dark:text-indigo-400">• Dot Badge</span>)</span>
            </div>

            {/* Free Seats: Dotted Line Boxes */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-400 dark:border-slate-500"></div>
              <span className="text-slate-700 dark:text-slate-300">Available / Free (<span className="font-bold text-slate-500">Dotted Box</span>)</span>
            </div>

            {/* Your Booked Seat */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-600 border border-emerald-400 shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                YOU
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-bold text-emerald-600 dark:text-emerald-400">Your Allocated Seat</span>
            </div>

          </div>
        </div>
      </div>

      {/* Visual Coach Compartments */}
      <div className="space-y-4 overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          
          {/* Train coach outer shell styling */}
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-mono">
              <span>◄ TOILET & ENTRY DOOR</span>
              <span className="font-bold tracking-widest text-railway-800 dark:text-slate-300">COACH {coachName} (3-TIER AIR CONDITIONED)</span>
              <span>PANTRY & EXIT DOOR ►</span>
            </div>

            {/* Bays Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {bays.map((bay) => (
                <div 
                  key={bay.bayNumber}
                  className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="text-[10px] font-bold text-center text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">
                    BAY {bay.bayNumber}
                  </div>

                  {/* 6 Main Berths (LB, MB, UB, LB, MB, UB) */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {bay.seats.slice(0, 6).map((seat) => {
                      const style = getSeatStyle(seat);
                      return (
                        <button
                          key={seat.berthNumber}
                          type="button"
                          onClick={() => setSelectedSeat(seat)}
                          className={`berth-seat relative p-1.5 rounded-lg flex flex-col items-center justify-center text-center transition-all ${style.bg} ${style.border}`}
                          title={`Berth ${seat.berthNumber} (${seat.berthType})`}
                        >
                          {/* Dot Badge for Families (Prompt: "families with dot to identify who are sitting around them") */}
                          {seat.isOccupied && seat.occupant?.isFamily && (
                            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-white dark:bg-indigo-300 ring-1 ring-black/20 shadow-sm"></span>
                          )}

                          <span className="text-[11px] font-extrabold leading-tight">
                            {seat.berthNumber}
                          </span>
                          <span className="text-[8px] opacity-80 uppercase tracking-tighter">
                            {seat.berthType.slice(0, 2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle Corridor Line */}
                  <div className="h-2 w-full my-1 flex items-center justify-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800 border-dashed"></div>
                  </div>

                  {/* 2 Side Berths (Side Lower, Side Upper) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {bay.seats.slice(6, 8).map((seat) => {
                      const style = getSeatStyle(seat);
                      return (
                        <button
                          key={seat.berthNumber}
                          type="button"
                          onClick={() => setSelectedSeat(seat)}
                          className={`berth-seat relative p-1.5 rounded-lg flex flex-col items-center justify-center text-center transition-all ${style.bg} ${style.border}`}
                          title={`Berth ${seat.berthNumber} (${seat.berthType})`}
                        >
                          {seat.isOccupied && seat.occupant?.isFamily && (
                            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-white ring-1 ring-black/20 shadow-sm"></span>
                          )}
                          <span className="text-[11px] font-extrabold leading-tight">
                            {seat.berthNumber}
                          </span>
                          <span className="text-[8px] opacity-80 uppercase tracking-tighter">
                            {seat.berthType === 'Side Lower' ? 'SL' : 'SU'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>

            <div className="text-center text-[11px] text-slate-500 font-mono">
              ▲ CORRIDOR / AISLE PASSAGEWAY ▼
            </div>

          </div>

        </div>
      </div>

      {/* Selected Seat Inspector Modal / Card */}
      {selectedSeat && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              selectedSeat.isCurrentUserBooking
                ? 'bg-emerald-600 text-white'
                : selectedSeat.occupant?.gender === 'female'
                ? 'bg-pink-500 text-white'
                : selectedSeat.occupant?.gender === 'male'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {selectedSeat.berthNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Berth {selectedSeat.berthNumber} • {selectedSeat.berthType} (Bay {selectedSeat.bayNumber})
                </h4>
                {selectedSeat.isCurrentUserBooking && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                    YOUR SEAT
                  </span>
                )}
                {selectedSeat.occupant?.isFamily && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    • Family Unit
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedSeat.isOccupied ? (
                  <>
                    Passenger: <strong className="text-slate-800 dark:text-slate-200">
                      {selectedSeat.isCurrentUserBooking || showPassengerNames
                        ? (selectedSeat.occupant?.name || 'Verified Traveler')
                        : 'Anonymous verified traveler'}
                    </strong> • Gender: <span className="capitalize">{selectedSeat.occupant?.gender}</span>
                    {selectedSeat.occupant?.occupation && ` • ${selectedSeat.occupant?.occupation}`}
                  </>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Vacant / Available Berth</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSeat(null)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-semibold"
          >
            Dismiss Inspector
          </button>
        </div>
      )}

    </div>
  );
}
