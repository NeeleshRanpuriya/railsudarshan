import React, { useEffect, useMemo, useState } from 'react';
import { 
  Train, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Utensils, 
  Luggage, 
  Accessibility, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Eye, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Receipt,
  PhoneCall,
  Printer,
  RefreshCw
} from 'lucide-react';
import { STATION_RESTAURANTS, STATIONS } from '../data/mockData';
import { calculateRailwayRefund, CANCELLATION_SLABS } from '../utils/railwayFareRefund';
import CoachVisualizer from './CoachVisualizer';
import { printTicket } from '../utils/printTicket';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function formatJourneyDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getEffectiveRunDate(ticket) {
  if (!ticket?.journeyDate) return ticket?.runDate;
  const date = new Date(`${ticket.journeyDate}T00:00:00`);
  const offset = Number(ticket.fromDayOffset);

  if (!Number.isInteger(offset) || offset < 0) {
    return ticket.runDate || ticket.journeyDate;
  }

  date.setDate(date.getDate() - offset);
  return date.toISOString().slice(0, 10);
}

function normalizeStationName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/junction|jn\.?|central|railway station/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getMinutesFromTime(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function hasScheduledHalt(stop) {
  const arrival = getMinutesFromTime(stop.arrives);
  const departure = getMinutesFromTime(stop.departs);
  if (arrival === null || departure === null || arrival === departure) return false;
  return (departure - arrival + 1440) % 1440 > 0;
}

function mergeLiveStops(previousStops, nextStops) {
  if (!Array.isArray(nextStops) || !nextStops.length) return previousStops || [];
  if (!Array.isArray(previousStops) || !previousStops.length) return nextStops;

  const nextByName = new Map(
    nextStops.map((stop) => [normalizeStationName(stop.stationName || stop.name), stop])
  );

  return previousStops.map((previousStop) => {
    const key = normalizeStationName(previousStop.stationName || previousStop.name);
    const nextStop = nextByName.get(key);
    return nextStop ? { ...previousStop, ...nextStop } : previousStop;
  });
}

function previousStatusBelongsToTicket(trainNumber, status) {
  return !status?.trainNumber ||
    String(status.trainNumber) === String(trainNumber);
}

export default function MyJourneyTab({ 
  user, 
  tickets = [], 
  selectedJourneyPnr,
  onCancelTicket,
  onNavigateToBook 
}) {
  const [selectedPnr, setSelectedPnr] = useState(
    selectedJourneyPnr || tickets[0]?.pnr || tickets[0]?.id || '2489102431'
  );
  const [activeService, setActiveService] = useState('food'); // 'food', 'luggage', 'mobility'
  const [showCoachMapModal, setShowCoachMapModal] = useState(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationSlab, setCancellationSlab] = useState('more_than_48h');
  const [cancellationResult, setCancellationResult] = useState(null);

  // Default fallback ticket if user hasn't booked one yet
  const defaultFallbackTicket = {
    pnr: '2489102431',
    bookingType: 'Reserved',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express (via Gaya)',
    from: 'HWH',
    to: 'NDLS',
    journeyDate: '2026-11-02',
    runDate: '2026-11-02',
    travelClass: '3A',
    coach: 'B3',
    passengers: [
      { id: 1, name: user?.fullName || 'Ananya Deshmukh', age: user?.age || 26, gender: user?.gender || 'female', berthNumber: 21, berthType: 'Lower' }
    ],
    allocatedSeats: [
      { berthNumber: 21, bayNumber: 3, berthType: 'Lower', passengerName: user?.fullName || 'Ananya Deshmukh', gender: user?.gender || 'female' }
    ],
    totalFare: 2365,
    status: 'Confirmed',
    allocationRationale: '🛡️ Women Safety Engine: Solo female allocated in Bay 3 alongside verified family (Berths 17-19) and fellow female traveler.',
    stops: [
      { code: 'HWH', name: 'Howrah Jn', arrival: 'Source', departure: '16:50', day: 1, dist: 0, status: 'passed' },
      { code: 'ASN', name: 'Asansol Jn', arrival: '18:57', departure: '19:00', day: 1, dist: 200, status: 'passed' },
      { code: 'DHN', name: 'Dhanbad Jn', arrival: '19:50', departure: '19:55', day: 1, dist: 259, status: 'passed' },
      { code: 'GAYA', name: 'Gaya Jn', arrival: '22:19', departure: '22:22', day: 1, dist: 459, status: 'passed' },
      { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', arrival: '00:45', departure: '00:55', day: 2, dist: 664, status: 'current' },
      { code: 'PRYJ', name: 'Prayagraj Jn', arrival: '02:43', departure: '02:45', day: 2, dist: 816, status: 'upcoming' },
      { code: 'CNB', name: 'Kanpur Central', arrival: '04:50', departure: '04:55', day: 2, dist: 1011, status: 'upcoming' },
      { code: 'NDLS', name: 'New Delhi', arrival: '10:05', departure: 'Destination', day: 2, dist: 1451, status: 'upcoming' },
    ]
  };

  // Find active ticket dynamically from tickets array based on selectedPnr!
  const activeTicket = tickets.find(t => (t.pnr && t.pnr === selectedPnr) || (t.id && t.id === selectedPnr)) || tickets[0] || defaultFallbackTicket;
  const effectiveRunDate = getEffectiveRunDate(activeTicket);
  const isCancelled = activeTicket.status === 'Cancelled';
  const [liveStatus, setLiveStatus] = useState({ loading: true });
  const [isLoadingLiveStatus, setIsLoadingLiveStatus] = useState(false);

  useEffect(() => {
    const requestedPnr = selectedJourneyPnr || tickets[0]?.pnr || tickets[0]?.id;
    if (requestedPnr && requestedPnr !== selectedPnr) {
      setSelectedPnr(requestedPnr);
    }
  }, [selectedJourneyPnr, tickets, selectedPnr]);
  const displayStops = useMemo(() => {
    const statusBelongsToTicket = previousStatusBelongsToTicket(
      activeTicket.trainNumber,
      liveStatus
    );
    const providerStops = Array.isArray(liveStatus?.stops) ? liveStatus.stops : [];

    if (!statusBelongsToTicket || !providerStops.length) return [];

    const boardingStation = STATIONS.find((station) => station.code === activeTicket.from);
    const boardingNames = [
      normalizeStationName(activeTicket.from),
      normalizeStationName(boardingStation?.name),
    ].filter(Boolean);
    const boardingIndex = providerStops.findIndex((stop) =>
      boardingNames.some((name) =>
        normalizeStationName(stop.stationName) === name ||
        normalizeStationName(stop.stationName).includes(name)
      )
    );
    const startIndex = boardingIndex >= 0 ? boardingIndex : 0;
    const destination = STATIONS.find((station) => station.code === activeTicket.to);
    const destinationIndex = providerStops.findIndex((stop) => {
      const name = String(stop.stationName || '').toLowerCase();
      return name.includes(String(destination?.name || activeTicket.to).toLowerCase().split(' ')[0]);
    });
    const endIndex = destinationIndex >= startIndex ? destinationIndex : providerStops.length - 1;
    const scheduledStopNames = new Set(
      (activeTicket.stops || []).flatMap((stop) => [
        normalizeStationName(stop.code),
        normalizeStationName(stop.name),
      ]).filter(Boolean)
    );

    return providerStops.slice(startIndex, endIndex + 1)
      .map((stop, index) => ({
      code: stop.stationName || `provider-stop-${index}`,
      name: stop.stationName,
      arrival: stop.arrives || '—',
      departure: stop.departs || '—',
      status: stop.status || 'upcoming',
      delayStr: stop.delayStr,
      date: stop.date,
      distance: Number(
        stop.distance ?? stop.distanceKm ?? stop.dist ?? stop.km ?? NaN
      ),
      isScheduledStop: Boolean(
        stop.isHalt ||
        stop.isScheduledStop ||
        stop.stoppage ||
        stop.halt ||
        scheduledStopNames.has(normalizeStationName(stop.stationName)) ||
        hasScheduledHalt(stop)
      ),
    }));
  }, [activeTicket.stops, activeTicket.to, liveStatus]);

  const liveLocationInfo = useMemo(() => {
    const location = liveStatus?.currentLocation ||
      liveStatus?.currentStation ||
      liveStatus?.current_station;
    if (!location || !displayStops.length) return null;

    const locationName = normalizeStationName(location);
    const matchingStop = displayStops.find(
      (stop) => normalizeStationName(stop.name) === locationName
    );
    if (matchingStop) {
      return {
        name: location,
        between: false,
        passingThrough: matchingStop.isScheduledStop === false,
      };
    }

    const currentIndex = displayStops.reduce((lastIndex, stop, index) =>
      ['current', 'departed'].includes(String(stop.status || '').toLowerCase())
        ? index
        : lastIndex, -1);
    const previousStop = currentIndex >= 0 ? displayStops[currentIndex] : null;
    const nextStop = currentIndex >= 0 ? displayStops[currentIndex + 1] : null;

    return {
      name: location,
      between: Boolean(previousStop && nextStop),
      previousStop,
      nextStop,
    };
  }, [displayStops, liveStatus]);

  const fetchLiveStatus = async () => {
    if (!activeTicket.trainNumber || isCancelled) return;
    setIsLoadingLiveStatus(true);
    setLiveStatus((previousStatus) => previousStatus
      ? { ...previousStatus, refreshing: true }
      : { loading: true });
    try {
      const date = String(activeTicket.journeyDate || activeTicket.runDate || '');
      const params = new URLSearchParams({
        date,
        from: String(activeTicket.from || ''),
        runDate: String(effectiveRunDate || ''),
        refresh: '1',
        _: String(Date.now()),
      });
      const response = await fetch(`${API_BASE}/api/railway/live/${encodeURIComponent(activeTicket.trainNumber)}?${params.toString()}`, {
        cache: 'no-store',
      });
      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();
      let result = null;
      if (contentType.includes('application/json')) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error('Live status returned invalid JSON');
        }
      } else {
        throw new Error(
          response.ok
            ? 'Live status endpoint returned HTML instead of JSON. Check VITE_API_BASE_URL.'
            : `Live status request failed with HTTP ${response.status}. Check the deployed backend URL.`
        );
      }
      if (!response.ok) throw new Error(result?.message || 'Live status unavailable');
      const nextStatus = result.data || result;
      setLiveStatus((previousStatus) => ({
        ...(previousStatus || {}),
        ...nextStatus,
        stops: mergeLiveStops(
          previousStatusBelongsToTicket(activeTicket.trainNumber, previousStatus)
            ? previousStatus?.stops
            : [],
          nextStatus.stops
        ),
        trainNumber: activeTicket.trainNumber,
        loading: false,
        refreshing: false,
        runDate: result.runDate,
        boardingDate: result.boardingDate,
      }));
    } catch (error) {
      setLiveStatus((previousStatus) => ({
        ...(previousStatus || {}),
        loading: false,
        refreshing: false,
        error: error.message,
      }));
    } finally {
      setIsLoadingLiveStatus(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
  }, [activeTicket.pnr, activeTicket.trainNumber, activeTicket.from, activeTicket.runDate, activeTicket.journeyDate, isCancelled]);

  // --- SERVICE 1: FOOD ORDERS STATE ---
  const [foodStation, setFoodStation] = useState('CNB');
  const [foodCoach, setFoodCoach] = useState(activeTicket?.coach || 'B3');
  const [foodBerth, setFoodBerth] = useState(activeTicket?.passengers?.[0]?.berthNumber || '21');
  const [foodCart, setFoodCart] = useState([]);
  const [foodOrdersPlaced, setFoodOrdersPlaced] = useState([]);

  // --- SERVICE 2: LUGGAGE HELP STATE (Coolie at ₹80 per bag) ---
  const [luggageStation, setLuggageStation] = useState('CNB');
  const [luggageServiceType, setLuggageServiceType] = useState('Porter to Coach (Station Entrance to Berth)');
  const [luggageBagsCount, setLuggageBagsCount] = useState(2);
  const [luggageBookings, setLuggageBookings] = useState([]);

  // --- SERVICE 3: MEDICAL & MOBILITY STATE ---
  const [mobilityStation, setMobilityStation] = useState('CNB');
  const [mobilityServiceType, setMobilityServiceType] = useState('Wheelchair Assistance');
  const [mobilityPassengerName, setMobilityPassengerName] = useState(user?.fullName || 'Senior Traveler');
  const [mobilityBookings, setMobilityBookings] = useState([]);

  // Cart helper functions
  const handleAddToCart = (dish) => {
    const existing = foodCart.find(i => i.id === dish.id);
    if (existing) {
      setFoodCart(foodCart.map(i => i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setFoodCart([...foodCart, { ...dish, qty: 1 }]);
    }
  };

  const handleUpdateCartQty = (id, delta) => {
    setFoodCart(foodCart.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const cartTotal = foodCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Submit Food Order
  const handlePlaceFoodOrder = (restaurantName) => {
    if (foodCart.length === 0) return;
    const newOrder = {
      id: 'FOOD-' + Math.floor(1000 + Math.random() * 9000),
      station: foodStation,
      coach: foodCoach,
      berth: foodBerth,
      restaurant: restaurantName,
      items: foodCart,
      total: cartTotal + 30, // 30 packaging/rail delivery
      orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed — Chef Preparing at ' + foodStation,
    };
    setFoodOrdersPlaced([newOrder, ...foodOrdersPlaced]);
    setFoodCart([]);
    alert(`🍽️ Food Order Placed! Your hot meal will be delivered to Coach ${foodCoach}, Berth ${foodBerth} at ${foodStation} Station.`);
  };

  // Submit Luggage Help (₹80 per bag)
  const handleBookLuggage = (e) => {
    e.preventDefault();
    const ratePerBag = 80;
    const totalCost = luggageBagsCount * ratePerBag;
    const booking = {
      id: 'SAHAYAK-' + Math.floor(10000 + Math.random() * 90000),
      station: luggageStation,
      service: luggageServiceType,
      bags: luggageBagsCount,
      ratePerBag: 80,
      total: totalCost,
      sahayakName: 'Rameshwar Yadav (Badge #482)',
      sahayakMobile: '+91 94150 99812',
      bookedAt: new Date().toLocaleTimeString(),
      status: 'Assigned & Dispatched',
    };
    setLuggageBookings([booking, ...luggageBookings]);
    alert(`🧳 Luggage Porter Booked! Sahayak Rameshwar Yadav (Badge #482, Ph: +91 94150 99812) assigned at ${luggageStation} Station. Total: ₹${totalCost} (₹80 × ${luggageBagsCount} bags).`);
  };

  // Submit Mobility Assistance
  const handleBookMobility = (e) => {
    e.preventDefault();
    const booking = {
      id: 'MOBILITY-' + Math.floor(10000 + Math.random() * 90000),
      station: mobilityStation,
      service: mobilityServiceType,
      passengerName: mobilityPassengerName,
      attendant: 'Sunil Kumar (Railway Divyangjan Attendant)',
      contact: '139 (Prompt 4)',
      bookedAt: new Date().toLocaleTimeString(),
      status: 'Confirmed — Attendant with Equipment Waiting on Platform',
    };
    setMobilityBookings([booking, ...mobilityBookings]);
    alert(`♿ Mobility Service Booked! Railway Attendant confirmed for ${mobilityPassengerName} at ${mobilityStation} Station for ${mobilityServiceType}.`);
  };

  // Refund Calculation Preview
  const currentRefundCalculation = calculateRailwayRefund(
    activeTicket.totalFare,
    activeTicket.travelClass,
    activeTicket.passengers?.length || 1,
    cancellationSlab
  );

  // Process Cancel Ticket
  const handleConfirmCancellation = () => {
    setCancellationResult(currentRefundCalculation);
    onCancelTicket(activeTicket.pnr, currentRefundCalculation);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Trip Switcher (when multiple tickets exist) */}
      {tickets.length > 1 && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2 shrink-0">
            Switch Journey:
          </span>
          {tickets.map((t) => {
            const isTicketSelected = (t.pnr || t.id) === (activeTicket.pnr || activeTicket.id);
            const ticketCancelled = t.status === 'Cancelled';
            return (
              <button
                key={t.pnr || t.id}
                onClick={() => setSelectedPnr(t.pnr || t.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isTicketSelected
                    ? ticketCancelled
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-railway-900 text-white dark:bg-emerald-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{t.trainNumber || t.id}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                  ticketCancelled ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {ticketCancelled ? 'CANCELLED' : 'CONFIRMED'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Header & Ticket Summary Bar */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
        isCancelled 
          ? 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              {isCancelled ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1.5 animate-pulse">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Ticket Cancelled • Refund Processed</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Confirmed Active Journey
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                PNR: <strong className="text-slate-800 dark:text-slate-200">{activeTicket.pnr || activeTicket.id}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {activeTicket.trainNumber ? `${activeTicket.trainNumber} — ${activeTicket.trainName}` : activeTicket.station ? `${activeTicket.station} Platform Pass` : `UTS ${activeTicket.from} ➔ ${activeTicket.to}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Route: <strong>{activeTicket.from}</strong> ➔ <strong>{activeTicket.to}</strong> | Class: <strong>{activeTicket.travelClass}</strong> | Coach: <strong className="text-railway-700 dark:text-railway-400">{activeTicket.coach}</strong> | Berths: <strong className={isCancelled ? "text-red-500 line-through" : "text-emerald-600 font-bold"}>
                {activeTicket.passengers?.map(p => `${p.berthNumber} (${p.berthType})`).join(', ')}
              </strong>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 mt-2">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-railway-600 dark:text-emerald-400" />
                Boarding: <strong>{activeTicket.from}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-railway-600 dark:text-emerald-400" />
                Date: <strong>{formatJourneyDate(activeTicket.boardingDate || activeTicket.journeyDate)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-railway-600 dark:text-emerald-400" />
                Departure: <strong>{activeTicket.boardingTime || activeTicket.stops?.[0]?.departure || 'Time unavailable'}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isCancelled && (
              <button
                onClick={() => printTicket(activeTicket)}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900 transition-all flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>
            )}

            {/* View Coach Map Button */}
            {activeTicket.allocatedSeats && (
              <button
                onClick={() => setShowCoachMapModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Eye className="w-4 h-4 text-railway-600 dark:text-emerald-400" />
                <span>View Coach Demographics</span>
              </button>
            )}

            {/* Cancel Ticket or Refund Receipt Button */}
            {isCancelled ? (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300 dark:border-red-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <Receipt className="w-4 h-4" />
                <span>View Refund Receipt (₹{activeTicket.refundInfo?.refundAmount ?? (activeTicket.totalFare - 180)})</span>
              </button>
            ) : (
              <button
                onClick={() => { setShowCancelModal(true); setCancellationResult(null); }}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 transition-all flex items-center gap-2 shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Ticket & Refund</span>
              </button>
            )}
          </div>
        </div>

        {/* CANCELLATION NOTICE BANNER (Prominent when ticket is cancelled) */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-red-100/80 dark:bg-red-950/60 border-2 border-red-300 dark:border-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-red-900 dark:text-red-200 uppercase tracking-wider">
                    Journey Cancelled & Seats Released
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200">
                    REFUND ISSUED
                  </span>
                </div>
                <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                  Refund of <strong className="font-bold text-emerald-700 dark:text-emerald-400">₹{activeTicket.refundInfo?.refundAmount ?? (activeTicket.totalFare - 180)}</strong> ({activeTicket.refundInfo?.refundPercentage ?? 92}%) processed to source bank account. Deduction: ₹{activeTicket.refundInfo?.deduction ?? 180}.
                </p>
                {activeTicket.refundInfo?.ruleApplied && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                    {activeTicket.refundInfo.ruleApplied}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-center"
            >
              <Receipt className="w-4 h-4" />
              <span>Full Receipt</span>
            </button>
          </div>
        )}

        {/* Women Safety Guarantee Banner */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isCancelled 
            ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60' 
            : 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/60'
        }`}>
          <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
            isCancelled ? 'bg-slate-400' : 'bg-pinkFemale'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              isCancelled ? 'text-slate-500' : 'text-pink-900 dark:text-pink-200'
            }`}>
              RailRaksha Women Safety Allocation Record {isCancelled ? '(Voided upon Cancellation)' : ''}
            </h4>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isCancelled ? 'text-slate-500' : 'text-pink-800 dark:text-pink-300'
            }`}>
              {activeTicket.allocationRationale}
            </p>
          </div>
        </div>

        {/* ========================================================
            ROUTE & STATIONS TIMELINE
            (Prompt: "In my journey portal users can also see the stations betwen their to and from stations with the arrival time of train they booked .")
           ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
                Live Route Schedule
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Intermediate Stations & Scheduled Timings
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {liveStatus?.error ? 'Live status unavailable' : 'Live GPS Sync Active'}
            </span>
          </div>

          <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Provider live running status
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {liveStatus?.error
                  ? liveStatus.error
                  : liveStatus?.loading
                    ? 'Fetching live train position...'
                  : [
                      liveStatus?.currentLocation || liveStatus?.currentStation || liveStatus?.current_station,
                      liveStatus?.locationStatus || liveStatus?.status,
                    ].filter(Boolean).join(' — ') || 'Refresh to fetch current position'}
              </div>
              {liveStatus?.lastUpdated && (
                <div className="text-xs text-slate-500 mt-1">
                  Provider updated: {liveStatus.lastUpdated}
                </div>
              )}
              {liveLocationInfo && (liveLocationInfo.between || liveLocationInfo.passingThrough) && (
                <div className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-semibold">
                  {liveLocationInfo.passingThrough
                    ? 'Train is passing through this location; no scheduled halt.'
                    : `GPS location is between ${liveLocationInfo.previousStop.name} and ${liveLocationInfo.nextStop.name}; this is not a scheduled halt.`}
                </div>
              )}
              {liveStatus?.eta && (
                <div className="text-xs text-slate-500 mt-1">ETA: {liveStatus.eta}</div>
              )}
            </div>
            <button
              type="button"
              onClick={fetchLiveStatus}
              disabled={isLoadingLiveStatus}
              className="px-3 py-2 rounded-xl bg-railway-900 dark:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveStatus ? 'animate-spin' : ''}`} />
              {isLoadingLiveStatus ? 'Refreshing...' : 'Refresh live status'}
            </button>
          </div>

          <div className="pb-4">
            {liveStatus?.loading && !displayStops.length ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-500 dark:text-slate-400">
                Loading the live route schedule...
              </div>
            ) : (
            <div className="flex flex-col gap-0 p-2 max-w-3xl">
              {displayStops.map((stop, idx) => {
                const hasNotStarted = ['yet to start', 'not started'].includes(
                  String(liveStatus?.locationStatus || '').toLowerCase()
                );
                const liveStatusIsAuthoritative = Boolean(
                  liveStatus && !liveStatus.error
                );
                const liveStatusFailed = Boolean(liveStatus?.error);
                const liveLocation = String(
                  liveStatus?.currentLocation ||
                  liveStatus?.currentStation ||
                  liveStatus?.current_station ||
                  ''
                ).toLowerCase();
                const liveLocationMatchesStop = displayStops.some((candidate) =>
                  (candidate.name || '').toLowerCase().includes(liveLocation)
                );
                const stopMatchesLiveLocation = liveLocation &&
                  (stop.name || '').toLowerCase().includes(liveLocation);
                const isPassed = liveStatusIsAuthoritative && hasNotStarted
                  ? false
                  : liveStatusFailed
                    ? false
                  : liveStatusIsAuthoritative && liveLocationMatchesStop && !stopMatchesLiveLocation
                    ? false
                    : stop.status === 'passed';
                const isCurrent = liveStatusIsAuthoritative && hasNotStarted
                  ? false
                  : liveStatusFailed
                    ? false
                  : liveStatusIsAuthoritative && liveLocationMatchesStop && !stopMatchesLiveLocation
                    ? false
                    : stop.status === 'current';
                const isUpcoming = !isPassed && !isCurrent;

                return (
                  <div key={stop.code} className="relative flex gap-4 min-h-[104px]">
                    {/* Connecting line */}
                    {idx < displayStops.length - 1 && (
                      <div className={`absolute top-8 left-[15px] w-1 h-[calc(100%-24px)] z-0 ${
                        isPassed ? 'bg-emerald-500' : isCurrent ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    )}

                    {/* Node circle */}
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold relative z-10 shadow-sm transition-all ${
                      isCurrent
                        ? 'bg-white text-blue-600 ring-4 ring-amber-300 animate-pulse'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                      }`}>
                      {isCurrent ? <Train className="w-5 h-5" aria-label="Train is currently here" /> : isPassed ? '✓' : idx + 1}
                    </div>

                    <div className="text-left -mt-1 space-y-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {stop.name}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Arr: <strong className="text-slate-700 dark:text-slate-300">{stop.arrival}</strong>
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Dep: <strong className="text-slate-700 dark:text-slate-300">{stop.departure}</strong>
                      </div>
                      {stop.date && (
                        <div className="text-xs text-slate-400">
                          {stop.date}{stop.delayStr ? ` • ${stop.delayStr}` : ''}
                        </div>
                      )}
                      {isCurrent && stop.isScheduledStop !== false && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-900">
                          AT STATION
                        </span>
                      )}
                      {stop.isScheduledStop === false && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          PASSING THROUGH • NO HALT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================
          SERVICES SECTION IN MY JOURNEY
          (Prompt: "In my journey there will be a section of services which will have food orders... luggage help services... medical and mobility assistance")
         ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
            Passenger Amenities
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Journey Services & On-Seat Delivery
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seamlessly order hot meals, pre-book station coolies at official ₹80/bag rate, and request free wheelchair & medical mobility escorts.
          </p>
        </div>

        {/* 3 Services Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveService('food')}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              activeService === 'food'
                ? 'bg-railway-900 text-white dark:bg-emerald-600 border-transparent shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              activeService === 'food' ? 'bg-white/10' : 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600'
            }`}>
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">1. Food Orders</div>
              <div className="text-[11px] opacity-80">Hot meals delivered to berth</div>
            </div>
          </button>

          <button
            onClick={() => setActiveService('luggage')}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              activeService === 'luggage'
                ? 'bg-railway-900 text-white dark:bg-emerald-600 border-transparent shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              activeService === 'luggage' ? 'bg-white/10' : 'bg-white dark:bg-slate-700 shadow-sm text-amber-600'
            }`}>
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">2. Luggage Help</div>
              <div className="text-[11px] opacity-80">Coolie at ₹80 per bag</div>
            </div>
          </button>

          <button
            onClick={() => setActiveService('mobility')}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              activeService === 'mobility'
                ? 'bg-railway-900 text-white dark:bg-emerald-600 border-transparent shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              activeService === 'mobility' ? 'bg-white/10' : 'bg-white dark:bg-slate-700 shadow-sm text-purple-600'
            }`}>
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">3. Medical & Mobility</div>
              <div className="text-[11px] opacity-80">Wheelchair, stretcher & escort</div>
            </div>
          </button>
        </div>

        {/* ----------------------------------------------------
            SERVICE 1: FOOD ORDERS
            (Prompt: "food orders with deliver at option staion,berth and coach no with the nearby hotels in that particular staions with their own menu option and user can select selct and order them")
           ---------------------------------------------------- */}
        {activeService === 'food' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Delivery Location Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deliver At Station
                </label>
                <select
                  value={foodStation}
                  onChange={(e) => setFoodStation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="CNB">Kanpur Central (CNB) — Upcoming Stop</option>
                  <option value="PRYJ">Prayagraj Jn (PRYJ) — Upcoming Stop</option>
                  <option value="NDLS">New Delhi (NDLS) — Destination</option>
                  <option value="BSB">Varanasi Jn (BSB)</option>
                  <option value="BRC">Vadodara Jn (BRC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Coach Number
                </label>
                <input
                  type="text"
                  value={foodCoach}
                  onChange={(e) => setFoodCoach(e.target.value)}
                  placeholder="e.g. B3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Berth / Seat Number
                </label>
                <input
                  type="text"
                  value={foodBerth}
                  onChange={(e) => setFoodBerth(e.target.value)}
                  placeholder="e.g. 21"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Restaurant Menus for the Selected Station */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Nearby Verified Station Hotels & Restaurants at {foodStation}
                </h4>
                <span className="text-xs text-emerald-600 font-semibold">
                  IRCTC e-Catering Certified
                </span>
              </div>

              {((STATION_RESTAURANTS[foodStation] || STATION_RESTAURANTS['NDLS']).map((rest) => (
                <div
                  key={rest.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{rest.name}</h5>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          ★ {rest.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rest.cuisine} • Delivery in {rest.deliveryTime} • FSSAI #{rest.fssai}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-emerald-600 font-bold">Berth Delivery Guaranteed</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {rest.menu.map((dish) => {
                      const inCart = foodCart.find(i => i.id === dish.id);
                      return (
                        <div
                          key={dish.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${dish.veg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                              <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                {dish.name}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                              ₹{dish.price}
                            </span>
                          </div>

                          <div>
                            {inCart ? (
                              <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-lg px-2 py-1 text-xs font-bold">
                                <button type="button" onClick={() => handleUpdateCartQty(dish.id, -1)}>
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span>{inCart.qty}</span>
                                <button type="button" onClick={() => handleUpdateCartQty(dish.id, 1)}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToCart(dish)}
                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-railway-800 dark:text-slate-200 hover:bg-railway-50 dark:hover:bg-slate-800 shadow-sm"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Button for this Restaurant */}
                  {foodCart.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {foodCart.length} item(s) selected | Subtotal: <strong>₹{cartTotal}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlaceFoodOrder(rest.name)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Now (Deliver to Coach {foodCoach}, Berth {foodBerth})</span>
                      </button>
                    </div>
                  )}

                </div>
              )))}
            </div>

            {/* Active Orders List */}
            {foodOrdersPlaced.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Active Food Deliveries
                </h5>
                {foodOrdersPlaced.map((ord) => (
                  <div key={ord.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ord.restaurant} • ₹{ord.total}
                      </div>
                      <div className="text-slate-500">
                        Deliver to Station {ord.station} ➔ Coach {ord.coach}, Berth {ord.berth}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[11px] animate-pulse">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            SERVICE 2: LUGGAGE HELP SERVICES (COOLIE)
            (Prompt: "also it will have luggage help services with options like station,service like from porter to and from the coach ,help loading in coach, with bags with dropdon option with cost of rupees 80 per bag and book service.")
           ---------------------------------------------------- */}
        {activeService === 'luggage' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Luggage className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Official Railway Coolie & Sahayak Service
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  Fixed Tariff: ₹80 per bag
                </span>
              </div>

              <form onSubmit={handleBookLuggage} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Station */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Station
                  </label>
                  <select
                    value={luggageStation}
                    onChange={(e) => setLuggageStation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    {STATIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service Type
                  </label>
                  <select
                    value={luggageServiceType}
                    onChange={(e) => setLuggageServiceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Porter from station entrance to coach">Porter to Coach (Station Entrance to Berth)</option>
                    <option value="Porter from coach to station exit">Porter from Coach to Station Exit</option>
                    <option value="Help loading luggage into coach">Help Loading in Coach Overhead Rack</option>
                  </select>
                </div>

                {/* Bags with Dropdown Option (Prompt: "with bags with dropdon option with cost of rupees 80 per bag and book service") */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Bags (₹80/bag)
                  </label>
                  <select
                    value={luggageBagsCount}
                    onChange={(e) => setLuggageBagsCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>
                        {n} Bag{n > 1 ? 's' : ''} — ₹{n * 80}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Total Official Cost: <strong className="text-base text-emerald-600">₹{luggageBagsCount * 80}</strong> (₹80 × {luggageBagsCount} bags)
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-railway-900 hover:bg-railway-800 text-white font-bold text-xs shadow-md shadow-railway-900/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Luggage className="w-4 h-4" />
                    <span>Book Service (₹{luggageBagsCount * 80})</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Issued Luggage Slips */}
            {luggageBookings.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Assigned Sahayak Porters
                </h5>
                {luggageBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.sahayakName} • {b.station} Station
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                        {b.service} • {b.bags} Bags • Paid: <strong className="text-emerald-700 dark:text-emerald-400">₹{b.total}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${b.sahayakMobile}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Sahayak
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            SERVICE 3: MEDICAL AND MOBILITY ASSISTANCE
            (Prompt: "now another service willbe medical and mobility assistance with station option ,services like wheelchair,stretcher and first aid,escortfor senior and then book .")
           ---------------------------------------------------- */}
        {activeService === 'mobility' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Medical & Divyangjan Mobility Assistance
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                  Subsidized / Free Railway Service
                </span>
              </div>

              <form onSubmit={handleBookMobility} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Station Option */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Station Option
                  </label>
                  <select
                    value={mobilityStation}
                    onChange={(e) => setMobilityStation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    {STATIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Services
                  </label>
                  <select
                    value={mobilityServiceType}
                    onChange={(e) => setMobilityServiceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Wheelchair">Wheelchair Assistance</option>
                    <option value="Stretcher">Stretcher Assistance</option>
                    <option value="First Aid">First Aid & Medical Dressing</option>
                    <option value="Escort for Senior Citizens">Escort for Senior Citizens</option>
                  </select>
                </div>

                {/* Passenger Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    value={mobilityPassengerName}
                    onChange={(e) => setMobilityPassengerName(e.target.value)}
                    placeholder="Passenger Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Service Attendant is dispatched to platform prior to train arrival.
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Accessibility className="w-4 h-4" />
                    <span>Book Assistance</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Issued Mobility Slips */}
            {mobilityBookings.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Mobility Assistance Requisitions
                </h5>
                {mobilityBookings.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {m.service} • {m.station} Station
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                        Passenger: <strong>{m.passengerName}</strong> • {m.attendant}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================
          CANCELLATION & REFUND MODAL
          (Prompt: "Theere will also be an option to cancel ticket inside my journey which show the user how much refund will be iniciated to them based on today's railways cancellation rules .")
         ======================================================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Cancel Ticket & Calculate Refund
                  </h3>
                  <p className="text-xs text-slate-500">
                    As per Indian Railways Gazette Cancellation Rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {isCancelled ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Ticket Cancelled & Refund Initiated</span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>PNR Number:</span>
                      <span className="font-bold">{activeTicket.pnr || activeTicket.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Original Fare Paid:</span>
                      <span className="font-bold">₹{activeTicket.totalFare}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Cancellation Charge Deducted:</span>
                      <span className="font-bold">- ₹{activeTicket.refundInfo?.deduction ?? 180}</span>
                    </div>
                    <div className="pt-2 border-t border-red-200 dark:border-red-800 flex justify-between text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <span>Net Refund Processed:</span>
                      <span>₹{activeTicket.refundInfo?.refundAmount ?? (activeTicket.totalFare - 180)} ({activeTicket.refundInfo?.refundPercentage ?? 92}%)</span>
                    </div>
                  </div>

                  {activeTicket.refundInfo?.ruleApplied && (
                    <p className="text-[11px] text-slate-500 pt-1">
                      Rule: {activeTicket.refundInfo.ruleApplied}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
                >
                  Close Receipt
                </button>
              </div>
            ) : !cancellationResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Cancellation Time Window (Simulate Rule Applied)
                  </label>
                  <select
                    value={cancellationSlab}
                    onChange={(e) => setCancellationSlab(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    {CANCELLATION_SLABS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Refund Calculation Live Preview Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex justify-between">
                    <span>Total Fare Paid</span>
                    <span>₹{currentRefundCalculation.totalFare}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Railway Cancellation Charge ({currentRefundCalculation.ruleApplied})</span>
                    <span>- ₹{currentRefundCalculation.deduction}</span>
                  </div>
                  {currentRefundCalculation.gstComponent > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>GST Component on Cancellation Fee</span>
                      <span>₹{currentRefundCalculation.gstComponent}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Net Refund Initiated to Source Bank</span>
                    <span className="text-base">₹{currentRefundCalculation.refundAmount} ({currentRefundCalculation.refundPercentage}%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
                  ⚠️ <strong>Instant Refund:</strong> Amount will be credited back directly to the source payment method within 2-4 hours via IRCTC refund pipeline.
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Keep My Ticket
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCancellation}
                    className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ticket Successfully Cancelled
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  A refund of <strong className="text-emerald-600 text-sm">₹{cancellationResult.refundAmount}</strong> has been initiated under Indian Railways refund guidelines.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-1 font-mono">
                  <div>Refund Ref: REF-{Math.floor(1000000 + Math.random() * 9000000)}</div>
                  <div>PNR: {activeTicket.pnr}</div>
                  <div>Rule: {cancellationResult.ruleApplied}</div>
                  <div>Credit ETA: 2 to 4 Hours</div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Visual Coach Map Modal */}
      {showCoachMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Coach {activeTicket.coach} Demographics — {isCancelled ? 'Cancelled Booking' : 'Active Booking'}
              </h3>
              <button
                onClick={() => setShowCoachMapModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <CoachVisualizer
              coachName={activeTicket.coach}
              bookedSeats={activeTicket.allocatedSeats || [{ berthNumber: 21, berthType: 'Lower' }]}
              allocationRationale={activeTicket.allocationRationale}
              isFemaleOnly={activeTicket.isFemaleOnlyBooking}
              isCancelled={isCancelled}
              refundInfo={activeTicket.refundInfo}
            />
          </div>
        </div>
      )}

    </div>
  );
}
