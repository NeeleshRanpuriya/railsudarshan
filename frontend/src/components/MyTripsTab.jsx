import React, { useState } from 'react';
import { 
  Briefcase, 
  Train, 
  Ticket, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Receipt, 
  ArrowRight, 
  Eye, 
  ShieldCheck,
  AlertCircle,
  Plus,
  Printer
} from 'lucide-react';
import { calculateRailwayRefund, CANCELLATION_SLABS } from '../utils/railwayFareRefund';
import CoachVisualizer from './CoachVisualizer';
import { printTicket } from '../utils/printTicket';

export default function MyTripsTab({ 
  user,
  tickets = [], 
  onCancelTicket, 
  onSelectJourney, 
  onNavigateToBook 
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'confirmed', 'cancelled'
  const [activeCancelModalTicket, setActiveCancelModalTicket] = useState(null);
  const [cancellationSlab, setCancellationSlab] = useState('more_than_48h');
  const [cancellationResult, setCancellationResult] = useState(null);
  const [activeCoachMapTicket, setActiveCoachMapTicket] = useState(null);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'confirmed') return t.status === 'Confirmed' || t.status === 'Active';
    if (filter === 'cancelled') return t.status === 'Cancelled';
    return true;
  });

  const handleOpenCancelModal = (ticket) => {
    setActiveCancelModalTicket(ticket);
    setCancellationResult(null);
  };

  const currentRefundCalculation = activeCancelModalTicket ? calculateRailwayRefund(
    activeCancelModalTicket.totalFare,
    activeCancelModalTicket.travelClass || '3A',
    activeCancelModalTicket.passengers?.length || 1,
    cancellationSlab
  ) : null;

  const handleConfirmCancel = () => {
    if (!activeCancelModalTicket) return;
    setCancellationResult(currentRefundCalculation);
    onCancelTicket(activeCancelModalTicket.pnr || activeCancelModalTicket.id, currentRefundCalculation);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
            Passenger Trip History
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            My Trips & Booking Records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View all confirmed active journeys, digital passes, and cancelled tickets with refund statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-railway-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Confirmed ({tickets.filter(t => t.status !== 'Cancelled').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cancelled ({tickets.filter(t => t.status === 'Cancelled').length})
            </button>
          </div>

          <button
            onClick={onNavigateToBook}
            className="px-4 py-2 rounded-2xl bg-railway-900 hover:bg-railway-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No {filter !== 'all' ? filter : ''} trips found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'cancelled'
              ? 'You have not cancelled any bookings.'
              : 'You have no tickets in this view. Use the Book tab to plan your next journey.'}
          </p>
          <button
            onClick={onNavigateToBook}
            className="px-5 py-2.5 rounded-xl bg-railway-900 dark:bg-emerald-600 text-white text-xs font-bold shadow-md"
          >
            Book Train Tickets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket) => {
            const isCancelled = ticket.status === 'Cancelled';
            const isPlatform = ticket.type === 'Platform Ticket';
            const isUTS = ticket.type?.includes('Unreserved');

            return (
              <div
                key={ticket.pnr || ticket.id}
                className={`p-6 rounded-3xl border transition-all duration-200 ${
                  isCancelled
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Column: Train & Route Information */}
                  <div className="space-y-3 flex-1">
                    
                    {/* Status & Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isCancelled ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1.5 animate-pulse">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Cancelled • Refund Processed</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Confirmed Active</span>
                        </span>
                      )}

                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {ticket.pnr ? `PNR: ${ticket.pnr}` : `Pass ID: ${ticket.id}`}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ticket.bookingType || ticket.type || 'Reserved'}
                      </span>
                    </div>

                    {/* Train Title */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {ticket.trainName ? `${ticket.trainNumber} — ${ticket.trainName}` : ticket.station ? `${ticket.station} Station Platform Pass` : `UTS ${ticket.from} ➔ ${ticket.to}`}
                      </h3>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-4">
                        {ticket.from && ticket.to && (
                          <span>Route: <strong className="text-slate-800 dark:text-slate-200">{ticket.from} ➔ {ticket.to}</strong></span>
                        )}
                        {ticket.journeyDate && (
                          <span>Date: <strong className="text-slate-800 dark:text-slate-200">{ticket.journeyDate}</strong></span>
                        )}
                        {ticket.travelClass && (
                          <span>Class: <strong className="text-railway-700 dark:text-railway-400">{ticket.travelClass}</strong></span>
                        )}
                        {ticket.coach && (
                          <span>Coach: <strong className="text-railway-700 dark:text-railway-400">{ticket.coach}</strong></span>
                        )}
                        {ticket.allocatedSeats && (
                          <span>Berths: <strong className={isCancelled ? "text-red-500 line-through" : "text-emerald-600 font-bold"}>
                            {ticket.allocatedSeats.map(s => `${s.berthNumber} (${s.berthType})`).join(', ')}
                          </strong></span>
                        )}
                      </div>
                    </div>

                    {/* Cancellation details box */}
                    {isCancelled && ticket.refundInfo && (
                      <div className="p-3.5 rounded-2xl bg-red-100/70 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200 space-y-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>Refund Initiated: ₹{ticket.refundInfo.refundAmount} ({ticket.refundInfo.refundPercentage}%)</span>
                          <span className="font-mono text-[11px]">Deduction: ₹{ticket.refundInfo.deduction}</span>
                        </div>
                        <p className="text-[11px] opacity-90">
                          {ticket.refundInfo.ruleApplied}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-400">Total Ticket Fare</div>
                      <div className={`text-xl font-black ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                        ₹{ticket.totalFare}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <button
                          onClick={() => printTicket(ticket)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900 transition-all flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Ticket</span>
                        </button>
                      )}

                      {/* View Journey Timeline & Services */}
                      {ticket.stops && (
                        <button
                          onClick={() => onSelectJourney(ticket)}
                          className="px-4 py-2 rounded-xl bg-railway-900 hover:bg-railway-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <span>{isCancelled ? 'View Trip History' : 'Open Journey'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Coach Map Button (if reserved) */}
                      {ticket.allocatedSeats && (
                        <button
                          onClick={() => setActiveCoachMapTicket(ticket)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
                          title="View Coach Demographics"
                        >
                          <Eye className="w-3.5 h-3.5 text-railway-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">Coach Map</span>
                        </button>
                      )}

                      {/* Cancel Ticket Button (only for confirmed tickets) */}
                      {!isCancelled && ticket.pnr && (
                        <button
                          onClick={() => handleOpenCancelModal(ticket)}
                          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Ticket</span>
                        </button>
                      )}

                      {/* View Refund Receipt for cancelled tickets */}
                      {isCancelled && ticket.refundInfo && (
                        <button
                          onClick={() => handleOpenCancelModal(ticket)}
                          className="px-3.5 py-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300 dark:border-red-800 transition-all flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Refund Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION & REFUND MODAL */}
      {activeCancelModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeCancelModalTicket.status === 'Cancelled' ? 'Railway Cancellation Refund Receipt' : 'Cancel Ticket & Calculate Refund'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    PNR: {activeCancelModalTicket.pnr} • {activeCancelModalTicket.trainName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCancelModalTicket(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* If ticket is already cancelled, show receipt */}
            {activeCancelModalTicket.status === 'Cancelled' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Refund Successfully Processed</span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Original Fare Paid:</span>
                      <span className="font-bold">₹{activeCancelModalTicket.totalFare}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Railway Cancellation Fee:</span>
                      <span className="font-bold">- ₹{activeCancelModalTicket.refundInfo?.deduction ?? 180}</span>
                    </div>
                    <div className="pt-2 border-t border-red-200 dark:border-red-800 flex justify-between text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <span>Refund Amount Credited:</span>
                      <span>₹{activeCancelModalTicket.refundInfo?.refundAmount ?? (activeCancelModalTicket.totalFare - 180)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    {activeCancelModalTicket.refundInfo?.ruleApplied}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCancelModalTicket(null)}
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

                {/* Refund calculation live preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex justify-between">
                    <span>Total Fare Paid</span>
                    <span>₹{currentRefundCalculation.totalFare}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Cancellation Fee ({currentRefundCalculation.ruleApplied})</span>
                    <span>- ₹{currentRefundCalculation.deduction}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Net Refund to Source Bank</span>
                    <span className="text-base">₹{currentRefundCalculation.refundAmount} ({currentRefundCalculation.refundPercentage}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveCancelModalTicket(null)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Keep Ticket
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCancel}
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

                <button
                  type="button"
                  onClick={() => setActiveCancelModalTicket(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* COACH MAP MODAL */}
      {activeCoachMapTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Coach {activeCoachMapTicket.coach} Demographics — {activeCoachMapTicket.status === 'Cancelled' ? 'Cancelled Booking' : 'Active Booking'}
              </h3>
              <button
                onClick={() => setActiveCoachMapTicket(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <CoachVisualizer
              coachName={activeCoachMapTicket.coach}
              bookedSeats={activeCoachMapTicket.allocatedSeats || []}
              showPassengerNames={false}
              allocationRationale={activeCoachMapTicket.allocationRationale}
              isFemaleOnly={activeCoachMapTicket.isFemaleOnlyBooking}
              isCancelled={activeCoachMapTicket.status === 'Cancelled'}
              refundInfo={activeCoachMapTicket.refundInfo}
            />
          </div>
        </div>
      )}

    </div>
  );
}
