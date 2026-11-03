import React, { useEffect, useRef, useState } from 'react';
import {
  Train,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  ArrowRight,
  QrCode,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Eye,
  Server,
  Loader2,
  XCircle,
  Printer
} from 'lucide-react';
import { STATIONS, TRAINS } from '../data/mockData';
import { allocateSeatsWithSafetyEngine, generateCoachState } from '../utils/safetySeatAllocator';
import { searchTrains } from '../services/railwayApiService';
import { isLiveRailwayApiActive } from '../config/railwayApi';
import CoachVisualizer from './CoachVisualizer';
import { printTicket } from '../utils/printTicket';
import StationSelect from './StationSelect';

/**
 * Helper to check if a train has already departed based on journey date and departure time.
 */
function isTrainDeparted(journeyDate, departureTime) {
  if (!journeyDate || !departureTime) return false;

  try {
    let normalizedDateStr = journeyDate;
    if (journeyDate.includes('-') && journeyDate.split('-')[0].length === 2) {
      const [day, month, year] = journeyDate.split('-');
      normalizedDateStr = `${year}-${month}-${day}`;
    }

    const [hours, minutes] = departureTime.split(':').map(Number);
    const trainDateTime = new Date(normalizedDateStr);

    if (isNaN(trainDateTime.getTime())) return false;

    trainDateTime.setHours(hours || 0, minutes || 0, 0, 0);
    return trainDateTime < new Date();
  } catch (err) {
    return false;
  }
}

function getOriginRunDate(journeyDate, fromDayOffset = 0) {
  const date = new Date(`${journeyDate}T00:00:00`);
  date.setDate(date.getDate() - fromDayOffset);
  return date.toISOString().split('T')[0];
}

export default function BookingTab({
  user,
  onTicketBooked,
  onNavigateToJourney,
  tickets = [],
  onOpenApiConfig
}) {
  const [bookingType, setBookingType] = useState('reserved'); // 'reserved', 'unreserved', 'platform'

  // --- RESERVED BOOKING STATE ---
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journeyDate, setJourneyDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [travelClass, setTravelClass] = useState('3A');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showPassengerDetails, setShowPassengerDetails] = useState(false);
  const passengerDetailsRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMeta, setSearchMeta] = useState(null);

  // Passengers list (Default: Passenger 1 is current user)
  const [passengers, setPassengers] = useState([
    {
      id: 1,
      name: user?.fullName || 'Ananya Sharma',
      age: user?.age || 26,
      gender: user?.gender || 'female',
      berthPref: 'Lower Berth (LB)',
      occupation: user?.occupation || 'Engineer',
    }
  ]);

  // Fare summary & Payment Modal
  const [showFareSummary, setShowFareSummary] = useState(false);
  const [bookedTicketResult, setBookedTicketResult] = useState(null);
  const [coachBerths, setCoachBerths] = useState(generateCoachState('B3', 64));

  // --- UNRESERVED (UTS) STATE ---
  const [utsFrom, setUtsFrom] = useState('NDLS');
  const [utsTo, setUtsTo] = useState('CNB');
  const [utsAdults, setUtsAdults] = useState(1);
  const [utsChildren, setUtsChildren] = useState(0);
  const [utsTrainType, setUtsTrainType] = useState('Mail/Express');
  const [utsBookedTicket, setUtsBookedTicket] = useState(null);

  // --- PLATFORM TICKET STATE ---
  const [platformStation, setPlatformStation] = useState('NDLS');
  const [platformPersons, setPlatformPersons] = useState(1);
  const [platformTicketPass, setPlatformTicketPass] = useState(null);

  // Handle Search Train (Queries Live API if key is present, otherwise verified mock dataset)
  const handleSearchTrain = async (e) => {
    e?.preventDefault();

    if (!fromStation || !toStation) {
      alert('Please select both From and To stations.');
      return;
    }

    setSelectedTrain(null);
    setShowFareSummary(false);
    setBookedTicketResult(null);
    setIsSearching(true);

    try {
      const result = await searchTrains(fromStation, toStation, journeyDate);
      setSearchResults(result.trains);
      setSearchMeta({
        source: result.source,
        isLive: result.isLive,
        message: result.message,
      });
    } catch (err) {
      console.warn('Train search error, using mock fallback:', err);
      const matches = TRAINS.filter(
        t => (t.from === fromStation && t.to === toStation) ||
             (t.stops.some(s => s.code === fromStation) && t.stops.some(s => s.code === toStation))
      );
      setSearchResults(matches.length > 0 ? matches : TRAINS.slice(0, 3));
      setSearchMeta({
        source: 'MOCK_DATA',
        isLive: false,
        message: 'Using RailRaksha Verified Mock Engine.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Add passenger
  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      alert('Maximum 6 passengers allowed per booking.');
      return;
    }
    setPassengers([
      ...passengers,
      {
        id: Date.now(),
        name: '',
        age: 28,
        gender: 'female',
        berthPref: 'Lower Berth (LB)',
        occupation: 'Passenger',
      }
    ]);
  };

  // Remove passenger
  const handleRemovePassenger = (id) => {
    if (passengers.length === 1) {
      alert('At least one passenger is required. You can edit the passenger details directly.');
      return;
    }
    setPassengers(passengers.filter(p => p.id !== id));
  };

  // Update passenger details
  const handlePassengerChange = (id, field, value) => {
    setPassengers(passengers.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Calculate Reserved Fare
  const baseFare = selectedTrain ? (selectedTrain.fares[travelClass] || 2280) : 2280;
  const totalReservedFare = baseFare * passengers.length;
  const reservationFee = 40 * passengers.length;
  const superfastCharge = 45 * passengers.length;
  const gstTax = travelClass.includes('A') || travelClass === 'CC' ? Math.round(totalReservedFare * 0.05) : 0;
  const grandTotal = totalReservedFare + reservationFee + superfastCharge + gstTax;

  // Confirm and Pay -> Run Women Safety Seat Allocator
  const handleConfirmAndPay = () => {
    if (selectedTrain && isTrainDeparted(journeyDate, selectedTrain.departureTime)) {
      alert('Cannot book tickets for a train that has already departed!');
      setShowFareSummary(false);
      return;
    }

    // Validate passengers
    for (let p of passengers) {
      if (!p.name.trim()) {
        alert('Please fill names for all passengers.');
        return;
      }
    }

    // RUN WOMEN SAFETY SEAT ALLOCATION ENGINE
    const allocation = allocateSeatsWithSafetyEngine(coachBerths, passengers);
    setCoachBerths(allocation.updatedBerths);

    const pnrNumber = '24' + Math.floor(10000000 + Math.random() * 90000000);
    const newTicket = {
      pnr: pnrNumber,
      bookingType: 'Reserved',
      trainNumber: selectedTrain.number,
      trainName: selectedTrain.name,
      from: fromStation,
      to: toStation,
      originStation: selectedTrain.originStation || fromStation,
      destinationStation: selectedTrain.destinationStation || toStation,
      journeyDate: journeyDate,
      boardingDate: journeyDate,
      boardingTime: selectedTrain.departureTime,
      runDate: getOriginRunDate(journeyDate, selectedTrain.fromDayOffset),
      fromDayOffset: selectedTrain.fromDayOffset || 0,
      travelClass: travelClass,
      coach: 'B3',
      passengers: passengers.map((p, idx) => ({
        ...p,
        berthNumber: allocation.allocatedSeats[idx]?.berthNumber || 21,
        berthType: allocation.allocatedSeats[idx]?.berthType || 'Lower',
        coach: 'B3',
      })),
      allocatedSeats: allocation.allocatedSeats,
      totalFare: grandTotal,
      bookingDate: new Date().toISOString(),
      status: 'Confirmed',
      allocationRationale: allocation.allocationRationale,
      isFemaleOnlyBooking: allocation.isFemaleOnlyBooking,
      stops: selectedTrain.stops,
    };

    setBookedTicketResult(newTicket);
    onTicketBooked(newTicket);
    setShowFareSummary(false);
  };

  const handleSelectTrainAttempt = (train, requestedClass) => {
    if (isTrainDeparted(journeyDate, train.departureTime)) {
      alert('This train has already departed. Booking is closed for this run.');
      return;
    }

    const trainClasses = Array.isArray(train.classes) ? train.classes : [];
    const nextClass = requestedClass ||
      (trainClasses.includes(travelClass) ? travelClass : trainClasses[0]);

    if (!nextClass) {
      alert('Live class and fare details are unavailable for this train.');
      return;
    }

    setTravelClass(nextClass);
    setSelectedTrain(train);
    setShowPassengerDetails(false);
  };

  const handleOpenPassengerDetails = () => {
    setShowPassengerDetails(true);
    requestAnimationFrame(() => {
      passengerDetailsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleOpenFareSummary = () => {
    if (selectedTrain && isTrainDeparted(journeyDate, selectedTrain.departureTime)) {
      alert('Cannot proceed. This train has already departed.');
      return;
    }
    setShowFareSummary(true);
  };

  // Handle Unreserved (UTS) Booking
  const handleBookUTS = (e) => {
    e.preventDefault();
    const distanceKm = 440;
    const ratePerKm = utsTrainType === 'Superfast' ? 0.45 : utsTrainType === 'Mail/Express' ? 0.38 : 0.25;
    const adultFare = Math.round(distanceKm * ratePerKm);
    const childFare = Math.round(adultFare * 0.5);
    const totalFare = (adultFare * utsAdults) + (childFare * utsChildren);

    const utsTicket = {
      id: 'UTS-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Unreserved (UTS General)',
      from: utsFrom,
      to: utsTo,
      adults: utsAdults,
      children: utsChildren,
      trainType: utsTrainType,
      totalFare: Math.max(totalFare, 35),
      bookedAt: new Date().toLocaleTimeString(),
      validity: 'Valid for 3 Hours from Booking Time',
      status: 'Active',
      qrCode: `UTS|${utsFrom}|${utsTo}|${utsAdults}A${utsChildren}C|₹${totalFare}`,
    };

    setUtsBookedTicket(utsTicket);
    onTicketBooked(utsTicket);
  };

  // Handle Platform Ticket Booking
  const handleBookPlatform = (e) => {
    e.preventDefault();
    const cost = platformPersons * 10;
    const expiryTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const platformTicket = {
      id: 'PLT-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Platform Ticket',
      station: platformStation,
      persons: platformPersons,
      totalFare: cost,
      issuedAt: new Date().toLocaleTimeString(),
      validTill: expiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active (2 Hours Validity)',
      qrCode: `PLATFORM|${platformStation}|${platformPersons}P|VALID_2HR`,
    };

    setPlatformTicketPass(platformTicket);
    onTicketBooked(platformTicket);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {!showPassengerDetails && (
        <>
      {/* Top 3 Booking Mode Selector (Reserved, Unreserved, Platform) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
            Smart Ticket Counter
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Book Train Tickets
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => { setBookingType('reserved'); setBookedTicketResult(null); }}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              bookingType === 'reserved'
                ? 'bg-railway-900 text-white dark:bg-emerald-600 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>Reserved</span>
          </button>

          <button
            onClick={() => { setBookingType('unreserved'); setUtsBookedTicket(null); }}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              bookingType === 'unreserved'
                ? 'bg-railway-900 text-white dark:bg-emerald-600 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Unreserved (UTS)</span>
          </button>

          <button
            onClick={() => { setBookingType('platform'); setPlatformTicketPass(null); }}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              bookingType === 'platform'
                ? 'bg-railway-900 text-white dark:bg-emerald-600 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Platform Ticket</span>
          </button>
        </div>
      </div>
          </>
        )}

      {/* ========================================================
          1. RESERVED TICKET FLOW
         ======================================================== */}
      {bookingType === 'reserved' && (
        <div className="space-y-8">

          {showPassengerDetails && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Secure Booking Checkout
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Passenger details & payment
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedTrain?.name} ({selectedTrain?.number}) • {travelClass} • Journey {journeyDate}
              </p>
            </div>
          )}

          {/* Search Form Card */}
          {!showPassengerDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-railway-100 dark:bg-railway-950/60 text-railway-700 dark:text-railway-300 flex items-center justify-center">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Search Reserved Trains
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    With Automatic Women Safety Berth Protection Guarantee
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-pinkFemale" />
                <span>Solo Female Priority Allocation</span>
              </div>
            </div>

            <form onSubmit={handleSearchTrain} className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* From Station */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  From Station
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <StationSelect
                    value={fromStation}
                    onChange={setFromStation}
                    stations={STATIONS}
                    placeholder="From station"
                  />
                </div>
              </div>

              {/* To Station */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  To Station
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <StationSelect
                    value={toStation}
                    onChange={setToStation}
                    stations={STATIONS}
                    placeholder="To station"
                  />
                </div>
              </div>

              {/* Date of Journey */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date of Journey
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    required
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                  />
                </div>
              </div>

              {/* Travel Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Class
                </label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                >
                  <option value="3A">AC 3 Tier (3A)</option>
                  <option value="2A">AC 2 Tier (2A)</option>
                  <option value="1A">AC First Class (1A)</option>
                  <option value="SL">Sleeper Class (SL)</option>
                  <option value="CC">AC Chair Car (CC)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${isLiveRailwayApiActive() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span>Engine: <strong>{isLiveRailwayApiActive() ? 'Live Indian Railways API' : 'Verified Mock Dataset'}</strong></span>
                  {onOpenApiConfig && (
                    <button
                      type="button"
                      onClick={onOpenApiConfig}
                      className="text-railway-600 dark:text-emerald-400 font-semibold hover:underline text-[11px] ml-1"
                    >
                      (Configure API Key)
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-railway-900 hover:bg-railway-800 disabled:opacity-75 text-white font-bold text-sm shadow-lg shadow-railway-900/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Searching Railway Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Train className="w-4 h-4" />
                      <span>Search Available Trains</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          )}

          {/* Search Results List */}
          {searchResults && !showPassengerDetails && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Available Trains ({searchResults.length} trains found)</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      searchMeta?.isLive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    }`}>
                      {searchMeta?.isLive ? '🟢 Live Railways API' : '⚡ Verified Mock Data'}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing runs for {journeyDate} • {searchMeta?.message || 'RailRaksha safety schedule'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((train) => {
                  const isSelected = selectedTrain?.number === train.number;
                  const displayClasses = [
                    ...new Set([
                      ...(Array.isArray(train.classes) ? train.classes : []),
                      ...Object.keys(train.fares || {}),
                      ...Object.keys(train.availableSeats || {}),
                    ]),
                  ];
                  const departed = isTrainDeparted(journeyDate, train.departureTime);

                  return (
                    <div
                      key={train.number}
                      className={`p-6 rounded-3xl border transition-all duration-200 ${
                        departed
                          ? 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-60 grayscale-[30%]'
                          : isSelected
                            ? 'bg-railway-50/80 dark:bg-railway-950/40 border-railway-500 shadow-md ring-2 ring-railway-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        {/* Train Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-railway-900 text-white font-mono text-xs font-bold">
                              {train.number}
                            </span>
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {train.name}
                            </h4>
                            {departed && (
                              <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold">
                                ⚠️ Train Departed — Booking Closed
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {train.departureTime}
                              </span>
                              <div className="text-slate-500 text-[11px]">{train.from}</div>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-slate-400 font-mono">{train.duration}</span>
                              <div className="w-20 border-t border-slate-300 dark:border-slate-700 relative my-1">
                                <div className="absolute right-0 top-[-3px] w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                              </div>
                              <span className="text-[10px] text-emerald-600 font-semibold">{train.stops.length} Stops</span>
                            </div>

                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {train.arrivalTime}
                              </span>
                              <div className="text-slate-500 text-[11px]">{train.to}</div>
                            </div>
                          </div>
                        </div>

                        {/* Classes & Seat Availability */}
                        <div className="flex flex-wrap items-center gap-2">
                          {displayClasses.length === 0 && (
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Live class availability unavailable
                            </span>
                          )}

                          {displayClasses.map((cls) => {
                            const clsFare = train.fares?.[cls];
                            const clsSeats = train.availableSeats?.[cls];
                            const clsAvailability = train.availabilityStatus?.[cls];
                            const isCurrentCls = travelClass === cls;

                            return (
                              <button
                                key={cls}
                                type="button"
                                disabled={departed}
                                onClick={() => {
                                  handleSelectTrainAttempt(train, cls);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all ${
                                  departed
                                    ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 border-transparent'
                                    : isSelected && isCurrentCls
                                      ? 'bg-railway-900 text-white dark:bg-emerald-600 border-transparent shadow-md'
                                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 text-xs font-bold">
                                  <span>{cls}</span>
                                  <span>{clsFare != null ? `₹${clsFare}` : 'Fare unavailable'}</span>
                                </div>
                                <div className={`text-[11px] mt-1 font-semibold ${
                                  isSelected && isCurrentCls
                                    ? 'text-emerald-200'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {clsSeats != null
                                    ? `AVL ${clsSeats}`
                                    : clsAvailability || 'Status unavailable'}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Select Action */}
                        <div>
                          {departed ? (
                            <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-xl block text-center">
                              Expired Schedule
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => isSelected
                                ? handleOpenPassengerDetails()
                                : handleSelectTrainAttempt(train)}
                              className={`w-full lg:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800'
                              }`}
                            >
                              {isSelected ? 'Enter Passenger Details' : 'Select Train'}
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Passenger Details Section (Opens when train is selected) */}
          {selectedTrain && showPassengerDetails && (
            <div ref={passengerDetailsRef} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
                    Step 2: Passenger Manifest
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Configure Travelers ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Passenger 1 is by default set to your profile. You can edit, remove, or add co-passengers.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowPassengerDetails(false)}
                    className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
                  >
                    Back to trains
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPassenger}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>+ Add New Passenger</span>
                  </button>
                </div>
              </div>

              {/* Passengers Form Rows */}
              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <div
                    key={passenger.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-railway-900 text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          Passenger {index + 1} {index === 0 ? '(Default Profile)' : ''}
                        </span>
                        {passenger.gender === 'female' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
                            🌸 Women Safety Shield Active
                          </span>
                        )}
                      </div>

                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(passenger.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remove Passenger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Name"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(passenger.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500 font-semibold"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Age *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="110"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(passenger.id, 'age', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500 font-semibold"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Gender *
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(passenger.id, 'gender', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500 capitalize font-semibold"
                        >
                          <option value="female">Female 🌸</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Book Train Action Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Train: <strong className="text-slate-900 dark:text-white">{selectedTrain.name} ({selectedTrain.number})</strong>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Class: <span className="font-bold text-railway-700 dark:text-railway-300">{travelClass}</span> • Total Passengers: <span className="font-bold">{passengers.length}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenFareSummary}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Book Train & Calculate Fare</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Fare Summary & "Confirm and Pay" Modal */}
          {showFareSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">

                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Official Fare Breakdown
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Confirm Booking & Pay
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFareSummary(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Train details badge */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedTrain.number} - {selectedTrain.name}
                  </div>
                  <div className="text-slate-500">
                    Route: {fromStation} ➔ {toStation} | Date: {journeyDate} | Class: {travelClass}
                  </div>
                </div>

                {/* Itemized Fare List */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Base Ticket Fare ({passengers.length} × ₹{baseFare})</span>
                    <span className="font-semibold">₹{totalReservedFare}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Reservation Fee</span>
                    <span className="font-semibold">₹{reservationFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Superfast Surcharge</span>
                    <span className="font-semibold">₹{superfastCharge}</span>
                  </div>
                  {gstTax > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>GST (5% AC Component)</span>
                      <span className="font-semibold">₹{gstTax}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Grand Total Payable</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-base">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Safety Guarantee Notice */}
                <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/60 text-[11px] text-pink-800 dark:text-pink-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-pinkFemale shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Automated Safety Seat Allocation:</span>
                    <p className="mt-0.5 opacity-90">
                      Upon payment, our safety algorithm places female/solo travelers alongside verified families and female passengers. Isolated male zones and empty coaches are strictly excluded.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFareSummary(false)}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back / Modify
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndPay}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Confirm & Pay ₹{grandTotal}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* BOOKED TICKET & VISUAL COACH DEMOGRAPHICS */}
          {bookedTicketResult && (() => {
            const liveTicket = tickets.find(t => t.pnr === bookedTicketResult.pnr) || bookedTicketResult;
            const isCancelled = liveTicket.status === 'Cancelled';
            return (
              <div className="space-y-6 animate-fadeIn">

                {/* Banner */}
                {isCancelled ? (
                  <div className="p-6 rounded-3xl bg-red-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-6 h-6 text-red-200" />
                        <h3 className="text-xl font-bold">Booking Cancelled • Seats Released</h3>
                      </div>
                      <p className="text-xs text-red-100">
                        PNR: <strong className="font-mono text-white text-sm">{liveTicket.pnr}</strong> | Refund of <strong>₹{liveTicket.refundInfo?.refundAmount ?? (liveTicket.totalFare - 180)}</strong> processed.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => printTicket(bookedTicketResult)}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Ticket</span>
                      </button>
                      <button
                        onClick={onNavigateToJourney}
                        className="px-4 py-2.5 rounded-xl bg-white text-red-800 font-bold text-xs hover:bg-red-50 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <span>View in My Journey</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-emerald-200" />
                        <h3 className="text-xl font-bold">Booking Confirmed! Seats Allocated</h3>
                      </div>
                      <p className="text-xs text-emerald-100">
                        PNR: <strong className="font-mono text-white text-sm">{bookedTicketResult.pnr}</strong> | Coach: <strong className="text-white">B3</strong> | Berths: <strong className="text-white">{bookedTicketResult.allocatedSeats.map(s => `${s.berthNumber} (${s.berthType})`).join(', ')}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => printTicket(bookedTicketResult)}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Ticket</span>
                      </button>
                      <button
                        onClick={onNavigateToJourney}
                        className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <span>View in My Journey</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* VISUAL COACH COMPARTMENT LAYOUT */}
                <CoachVisualizer
                  berths={coachBerths}
                  coachName={bookedTicketResult.coach}
                  bookedSeats={bookedTicketResult.allocatedSeats}
                  allocationRationale={bookedTicketResult.allocationRationale}
                  isFemaleOnly={bookedTicketResult.isFemaleOnlyBooking}
                  isCancelled={isCancelled}
                  refundInfo={liveTicket.refundInfo}
                />

              </div>
            );
          })()}

        </div>
      )}

      {/* ========================================================
          2. UNRESERVED (UTS) TICKET FLOW
         ======================================================== */}
      {bookingType === 'unreserved' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
                Paperless UTS General Booking
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Book Unreserved Railway Ticket
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issued in compliance with Indian Railways UTS rules. Valid for travel within 3 hours of issuance in General coaches.
              </p>
            </div>

            <form onSubmit={handleBookUTS} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Source Station
                  </label>
                  <select
                    value={utsFrom}
                    onChange={(e) => setUtsFrom(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {STATIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Station
                  </label>
                  <select
                    value={utsTo}
                    onChange={(e) => setUtsTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {STATIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adults
                  </label>
                  <select
                    value={utsAdults}
                    onChange={(e) => setUtsAdults(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Children (5-11 yrs)
                  </label>
                  <select
                    value={utsChildren}
                    onChange={(e) => setUtsChildren(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Child</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Train Type
                  </label>
                  <select
                    value={utsTrainType}
                    onChange={(e) => setUtsTrainType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Ordinary">Ordinary Passenger</option>
                    <option value="Mail/Express">Mail / Express</option>
                    <option value="Superfast">Superfast Express</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ <strong>UTS Railway Rule:</strong> Journey must commence within 3 hours of issuance or departure of the first train from the booking station. Non-refundable once issued.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-railway-900 hover:bg-railway-800 text-white font-bold text-sm shadow-lg shadow-railway-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>Issue Digital UTS Ticket</span>
              </button>
            </form>
          </div>

          {/* UTS Digital Pass Display */}
          <div className="lg:col-span-5">
            {utsBookedTicket ? (
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-6 border-2 border-amber-400 shadow-2xl relative overflow-hidden animate-fadeIn">
                <div className="text-center pb-4 border-b border-amber-200 dark:border-slate-700">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-900 text-xs font-mono font-extrabold uppercase">
                    INDIAN RAILWAYS PAPERLESS UTS
                  </span>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                    JOURNEY TICKET (GENERAL COACH)
                  </h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Ticket ID: {utsBookedTicket.id}
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                    <span>{utsBookedTicket.from}</span>
                    <span className="text-xs text-slate-500">➔ {utsBookedTicket.trainType} ➔</span>
                    <span>{utsBookedTicket.to}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>Adults: <strong>{utsBookedTicket.adults}</strong></div>
                    <div>Children: <strong>{utsBookedTicket.children}</strong></div>
                    <div>Class: <strong>SECOND (II) UNRESERVED</strong></div>
                    <div>Total Fare: <strong className="text-emerald-700 dark:text-emerald-400 text-sm">₹{utsBookedTicket.totalFare}</strong></div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-[11px] text-center font-mono">
                    ⏰ {utsBookedTicket.validity}
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <QrCode className="w-24 h-24 text-slate-900 dark:text-white" />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">TTE SCANNABLE ANTI-FRAUD QR</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-400">
                <Ticket className="w-12 h-12 mb-2 opacity-50" />
                <h4 className="font-bold text-sm">Digital Ticket Preview</h4>
                <p className="text-xs max-w-xs mt-1">
                  Fill in the UTS route details on the left to issue your paperless unreserved travel ticket.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          3. PLATFORM TICKET FLOW
         ======================================================== */}
      {bookingType === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
                Official Station Access Pass
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Book Platform Ticket
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mandatory for non-passengers visiting railway platforms to see off or receive travelers.
              </p>
            </div>

            <form onSubmit={handleBookPlatform} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Railway Station
                </label>
                <select
                  value={platformStation}
                  onChange={(e) => setPlatformStation(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {STATIONS.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Persons
                </label>
                <select
                  value={platformPersons}
                  onChange={(e) => setPlatformPersons(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      {n} Person{n > 1 ? 's' : ''} (₹{n * 10})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Standard Platform Tariff</span>
                  <span>₹10 per head</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Payable</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{platformPersons * 10}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-railway-900 hover:bg-railway-800 text-white font-bold text-sm shadow-lg shadow-railway-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{platformPersons * 10} & Issue Platform Pass</span>
              </button>
            </form>
          </div>

          {/* Platform Pass Card */}
          <div className="lg:col-span-5">
            {platformTicketPass ? (
              <div className="bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-6 border-2 border-blue-400 shadow-2xl relative overflow-hidden animate-fadeIn">
                <div className="text-center pb-4 border-b border-blue-200 dark:border-slate-700">
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-mono font-extrabold uppercase">
                    INDIAN RAILWAYS PLATFORM PASS
                  </span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                    {platformTicketPass.station} STATION
                  </h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Pass ID: {platformTicketPass.id}
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>Issued For: <strong>{platformTicketPass.persons} Person(s)</strong></div>
                    <div>Fare Paid: <strong className="text-emerald-600 font-bold">₹{platformTicketPass.totalFare}</strong></div>
                    <div>Issued At: <strong>{platformTicketPass.issuedAt}</strong></div>
                    <div>Valid Until: <strong className="text-red-600 font-bold">{platformTicketPass.validTill}</strong></div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">
                      ⏳ 2-HOUR LIVE PLATFORM TIMER ACTIVE
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Surrender / exit platform within 2 hours to avoid penalty.
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <QrCode className="w-20 h-20 text-slate-900 dark:text-white" />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">GATE SCANNER QR</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-400">
                <MapPin className="w-12 h-12 mb-2 opacity-50" />
                <h4 className="font-bold text-sm">Platform Pass Display</h4>
                <p className="text-xs max-w-xs mt-1">
                  Select station and person count on the left to issue an official 2-hour platform access pass.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}