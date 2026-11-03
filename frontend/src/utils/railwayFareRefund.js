/**
 * Indian Railways Official Ticket Cancellation and Refund Rules Engine
 */

export const CANCELLATION_SLABS = [
  {
    id: 'more_than_48h',
    label: '> 48 Hours before departure',
    description: 'Flat clerkage/cancellation charge per passenger based on travel class',
    badge: 'Maximum Refund',
  },
  {
    id: 'between_12_48h',
    label: 'Between 48 hrs & 12 hrs before departure',
    description: '25% of total fare deducted (subject to minimum flat class fee)',
    badge: '75% Refund',
  },
  {
    id: 'between_4_12h',
    label: 'Between 12 hrs & 4 hrs (Pre-charting)',
    description: '50% of total fare deducted (subject to minimum flat class fee)',
    badge: '50% Refund',
  },
  {
    id: 'less_than_4h',
    label: '< 4 Hours (Post chart preparation)',
    description: 'No refund admissible on confirmed tickets per Railway Rules',
    badge: '0% Refund',
  },
];

export const FLAT_CHARGES_PER_PASSENGER = {
  '1A': 240,
  'EC': 240,
  '2A': 200,
  '3A': 180,
  'CC': 180,
  'SL': 120,
  '2S': 60,
};

export function calculateRailwayRefund(totalFare, travelClass = '3A', passengerCount = 1, slabId = 'more_than_48h') {
  const flatPerHead = FLAT_CHARGES_PER_PASSENGER[travelClass] || 180;
  const minFlatTotal = flatPerHead * passengerCount;

  let deduction = 0;
  let ruleApplied = '';
  let refundPercentage = 100;

  switch (slabId) {
    case 'more_than_48h':
      deduction = minFlatTotal;
      ruleApplied = `Flat cancellation fee of ₹${flatPerHead} per passenger (${passengerCount} passenger(s)) as per Rule 48A.`;
      refundPercentage = Math.round(((totalFare - deduction) / totalFare) * 100);
      break;

    case 'between_12_48h':
      const quarterFare = Math.round(totalFare * 0.25);
      deduction = Math.max(quarterFare, minFlatTotal);
      ruleApplied = `25% of fare (₹${quarterFare}) applied (min. flat fee ₹${minFlatTotal}).`;
      refundPercentage = Math.round(((totalFare - deduction) / totalFare) * 100);
      break;

    case 'between_4_12h':
      const halfFare = Math.round(totalFare * 0.50);
      deduction = Math.max(halfFare, minFlatTotal);
      ruleApplied = `50% of fare (₹${halfFare}) applied before chart preparation.`;
      refundPercentage = Math.round(((totalFare - deduction) / totalFare) * 100);
      break;

    case 'less_than_4h':
      deduction = totalFare;
      ruleApplied = `Chart already finalized. Confirmed tickets non-refundable within 4 hours of departure.`;
      refundPercentage = 0;
      break;

    default:
      deduction = minFlatTotal;
  }

  // Ensure deduction does not exceed total fare
  deduction = Math.min(deduction, totalFare);
  const refundAmount = Math.max(0, totalFare - deduction);

  return {
    totalFare,
    deduction,
    refundAmount,
    travelClass,
    passengerCount,
    ruleApplied,
    refundPercentage,
    gstComponent: travelClass.includes('A') || travelClass === 'EC' || travelClass === 'CC' ? Math.round(deduction * 0.05) : 0,
    processedVia: 'IRCTC / RailRaksha Instant Refund Gateway',
  };
}
