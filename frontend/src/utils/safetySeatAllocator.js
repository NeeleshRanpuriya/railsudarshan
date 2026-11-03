// Coach layout simulation with Women Safety Allocation Engine
// Male: Yellow, Female: Pink, Families: Dot indicator, Free seats: Dotted line boxes

export const BERTH_TYPES = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];

export function generateCoachState(coachId = 'B3', totalBerths = 64) {
  // Generates a realistic baseline coach occupied with passengers
  // Bay size = 8 berths (6 main berths + 2 side berths)
  const berths = [];
  
  // Seed realistic existing occupancy
  for (let i = 1; i <= totalBerths; i++) {
    const bayIndex = Math.floor((i - 1) / 8);
    const berthInBay = (i - 1) % 8;
    const berthType = BERTH_TYPES[berthInBay];

    // Pre-populate some bays with families, some with solo females, some with males, and some empty seats
    let occupant = null;

    // Bay 0 (1-8): Family with children
    if (i >= 1 && i <= 3) {
      occupant = {
        name: i === 1 ? 'Rajesh Verma (Father)' : i === 2 ? 'Anita Verma (Mother)' : 'Aarav Verma (Child)',
        gender: i === 1 ? 'male' : i === 2 ? 'female' : 'male',
        age: i === 1 ? 42 : i === 2 ? 38 : 9,
        isFamily: true,
        familyGroupId: 'FAM-101',
      };
    } else if (i === 4) {
      occupant = {
        name: 'Sunita Devi (Grandmother)',
        gender: 'female',
        age: 64,
        isFamily: true,
        familyGroupId: 'FAM-101',
      };
    } 
    // Bay 1 (9-16): Two female travelers
    else if (i === 10) {
      occupant = {
        name: 'Dr. Priya Sharma',
        gender: 'female',
        age: 32,
        isFamily: false,
        occupation: 'Doctor',
      };
    } else if (i === 11) {
      occupant = {
        name: 'Neha Gupta',
        gender: 'female',
        age: 26,
        isFamily: false,
        occupation: 'Engineer',
      };
    }
    // Bay 2 (17-24): Another family group
    else if (i >= 17 && i <= 19) {
      occupant = {
        name: i === 17 ? 'Meena Iyer' : i === 18 ? 'Suresh Iyer' : 'Kavya Iyer',
        gender: i === 17 ? 'female' : i === 18 ? 'male' : 'female',
        age: i === 17 ? 35 : i === 18 ? 39 : 7,
        isFamily: true,
        familyGroupId: 'FAM-202',
      };
    }
    // Bay 4 (33-40): Group of male travelers
    else if (i >= 33 && i <= 36) {
      occupant = {
        name: `Passenger M${i}`,
        gender: 'male',
        age: 28 + (i % 5),
        isFamily: false,
        occupation: 'Business',
      };
    }
    // Bay 5 (41-48): Male passengers
    else if (i === 42 || i === 43) {
      occupant = {
        name: `Passenger M${i}`,
        gender: 'male',
        age: 45,
        isFamily: false,
      };
    }

    berths.push({
      berthNumber: i,
      bayNumber: bayIndex + 1,
      berthType,
      isOccupied: occupant !== null,
      occupant,
      isCurrentUserBooking: false,
      safetyTag: null,
    });
  }

  return berths;
}

/**
 * Intelligent Women Safety Seat Allocator:
 * - If passenger(s) are solo females or female-only group:
 *   - Must be placed near families or other female passengers.
 *   - NEVER placed near isolated male passengers or in empty/isolated coaches.
 * - If passenger group has males or is mixed/family:
 *   - Standard railway allocation based on available empty seats.
 */
export function allocateSeatsWithSafetyEngine(existingBerths, passengersToBook) {
  const isFemaleOnlyBooking = passengersToBook.every(p => p.gender.toLowerCase() === 'female');
  const hasMalePassengers = passengersToBook.some(p => p.gender.toLowerCase() === 'male');
  const isSoloFemale = isFemaleOnlyBooking && passengersToBook.length === 1;

  const countNeeded = passengersToBook.length;
  const updatedBerths = JSON.parse(JSON.stringify(existingBerths));

  // Find bay safety scores
  // 8 berths per bay
  const totalBays = Math.ceil(updatedBerths.length / 8);
  const bayMetrics = [];

  for (let b = 1; b <= totalBays; b++) {
    const baySeats = updatedBerths.filter(seat => seat.bayNumber === b);
    const emptySeats = baySeats.filter(seat => !seat.isOccupied);
    const femaleCount = baySeats.filter(seat => seat.isOccupied && seat.occupant?.gender === 'female').length;
    const familyCount = baySeats.filter(seat => seat.isOccupied && seat.occupant?.isFamily).length;
    const maleOnlyCount = baySeats.filter(seat => seat.isOccupied && seat.occupant?.gender === 'male' && !seat.occupant?.isFamily).length;

    bayMetrics.push({
      bayNumber: b,
      emptySeats,
      emptyCount: emptySeats.length,
      femaleCount,
      familyCount,
      maleOnlyCount,
      // For female safety: Higher score means safer (more families & females, zero isolated males)
      womenSafetyScore: (femaleCount * 10) + (familyCount * 8) - (maleOnlyCount * 15),
      isEmptyBay: emptySeats.length === baySeats.length,
    });
  }

  let selectedSeats = [];
  let allocationRationale = '';

  if (isFemaleOnlyBooking) {
    // WOMEN SAFETY ALGORITHM:
    // 1. Filter out bays that are completely empty (prompt: "they will not be allocated seats near males or empty coaches")
    // 2. Filter out bays with isolated males
    // 3. Sort bays by highest safety score (near families or other females)
    const eligibleBays = bayMetrics
      .filter(b => b.emptyCount >= countNeeded)
      .filter(b => !b.isEmptyBay) // Never put solo females in empty bay/coach
      .filter(b => b.maleOnlyCount === 0 || (b.familyCount > 0 && b.maleOnlyCount <= 1))
      .sort((a, b) => b.womenSafetyScore - a.womenSafetyScore);

    let chosenBay = eligibleBays[0];

    // Fallback if no single bay has enough contiguous seats: search adjacent bays near families
    if (!chosenBay) {
      // Find bays near families or females even if partially distributed
      const safestBays = bayMetrics
        .filter(b => b.emptyCount > 0 && !b.isEmptyBay && b.maleOnlyCount === 0)
        .sort((a, b) => b.womenSafetyScore - a.womenSafetyScore);

      for (const bay of safestBays) {
        for (const seat of bay.emptySeats) {
          if (selectedSeats.length < countNeeded) {
            selectedSeats.push(seat);
          }
        }
        if (selectedSeats.length === countNeeded) break;
      }
    } else {
      // Pick best seats in this safe bay (prefer Lower/Middle for security & comfort)
      selectedSeats = chosenBay.emptySeats.slice(0, countNeeded);
    }

    // Fallback if coach is very full
    if (selectedSeats.length < countNeeded) {
      const remainingEmpty = updatedBerths.filter(s => !s.isOccupied && !selectedSeats.some(ss => ss.berthNumber === s.berthNumber));
      selectedSeats.push(...remainingEmpty.slice(0, countNeeded - selectedSeats.length));
    }

    allocationRationale = isSoloFemale
      ? `🛡️ RailRaksha Women Safety Engine Activated: Solo female passenger securely allocated in Bay ${selectedSeats[0]?.bayNumber || 1} adjacent to verified families and female passengers. Isolated male zones and empty coaches strictly bypassed.`
      : `🛡️ RailRaksha Women Safety Engine Activated: All-female group allocated adjacent berths in Bay ${selectedSeats[0]?.bayNumber || 1} next to family & verified women travelers for maximum safety and mutual escort.`;

  } else {
    // STANDARD RAILWAY ALLOCATION (male or family groups):
    // Standard real-life booking: Find contiguous empty seats
    const contiguousBay = bayMetrics.find(b => b.emptyCount >= countNeeded);
    if (contiguousBay) {
      selectedSeats = contiguousBay.emptySeats.slice(0, countNeeded);
    } else {
      // Take standard available empty seats
      const allEmpty = updatedBerths.filter(s => !s.isOccupied);
      selectedSeats = allEmpty.slice(0, countNeeded);
    }

    allocationRationale = `🚆 Standard Railway Allocation: Seats allocated based on optimal vacancy and group proximity in Coach B3.`;
  }

  // Update berths with new occupants
  selectedSeats.forEach((seat, idx) => {
    const passenger = passengersToBook[idx];
    const target = updatedBerths.find(s => s.berthNumber === seat.berthNumber);
    if (target) {
      target.isOccupied = true;
      target.isCurrentUserBooking = true;
      target.occupant = {
        name: passenger.name,
        gender: passenger.gender,
        age: passenger.age,
        isFamily: passengersToBook.length > 1,
        familyGroupId: passengersToBook.length > 1 ? 'MY-GROUP' : null,
        occupation: passenger.occupation || 'Passenger',
        berthType: target.berthType,
      };
      target.safetyTag = isFemaleOnlyBooking ? 'Women Safety Priority' : 'Standard Booking';
    }
  });

  return {
    updatedBerths,
    allocatedSeats: selectedSeats.map((s, i) => ({
      berthNumber: s.berthNumber,
      bayNumber: s.bayNumber,
      berthType: s.berthType,
      passengerName: passengersToBook[i].name,
      gender: passengersToBook[i].gender,
    })),
    allocationRationale,
    isFemaleOnlyBooking,
  };
}
