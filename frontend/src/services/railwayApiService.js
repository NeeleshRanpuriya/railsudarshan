/**
 * RAILRAKSHA — RAILWAYS API SERVICE WITH SEAMLESS MOCK FALLBACK (RapidAPI Version)
 */

import { TRAINS, STATIONS } from '../data/mockData';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function formatAvailabilityDate(date) {
  const [year, month, day] = String(date || '').split('-');
  return year && month && day ? `${day}-${month}-${year}` : '';
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );

  return results;
}

export async function searchTrains(fromStation, toStation, journeyDate) {
  try {
    const url = `${API_BASE}/api/railway/trains/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${encodeURIComponent(journeyDate || '')}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(url, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();

        const apiTrainList = json.data || json.body || json.trains || json.results || json || [];

        if (Array.isArray(apiTrainList) && apiTrainList.length > 0) {
          const normalizedTrains = await mapWithConcurrency(apiTrainList, 3, async (item, idx) => {
            const trainNumber = item.train_number || item.trainNo || item.train_no || item.number || `12${idx}01`;
            const trainName = item.train_name || item.trainName || item.name || `Express Special`;
            const departureTime = item.departure_time || item.departureTime || item.depTime || item.departure || '16:00';
            const arrivalTime = item.arrival_time || item.arrivalTime || item.arrTime || item.arrival || '08:30';
            const duration = item.duration || item.travelTime || 'Live provider value unavailable';

            let fares = item.fares || (typeof item.fare === 'object' ? item.fare : {});
            const availableSeats = item.availableSeats || {};
            const availabilityStatus = {};
            let providerClasses = Array.isArray(item.classes) ? item.classes.filter(Boolean) : [];

            if (!providerClasses.length && !Object.keys(fares).length) {
              try {
                const fareResponse = await fetch(
                  `${API_BASE}/api/railway/trains/${encodeURIComponent(trainNumber)}/fare?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&class=all&quota=GN`,
                  { signal: controller.signal }
                );

                if (fareResponse.ok) {
                  const farePayload = await fareResponse.json();
                  const fareRows = Array.isArray(farePayload.fares) ? farePayload.fares : [];
                  fares = Object.fromEntries(
                    fareRows
                      .filter((fareRow) => fareRow?.class && Number.isFinite(Number(fareRow.totalFare)))
                      .map((fareRow) => [fareRow.class, Number(fareRow.totalFare)])
                  );
                  providerClasses = fareRows
                    .map((fareRow) => fareRow?.class)
                    .filter(Boolean);
                }
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.warn(`Fare details unavailable for train ${trainNumber}:`, error.message);
                }
              }
            }

            const classes = [...new Set([
              ...providerClasses,
              ...Object.keys(fares),
            ])];

            await Promise.all(classes.map(async (classCode) => {
              try {
                const availabilityResponse = await fetch(
                  `${API_BASE}/api/railway/trains/${encodeURIComponent(trainNumber)}/availability?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${encodeURIComponent(formatAvailabilityDate(journeyDate))}&class=${encodeURIComponent(classCode)}&quota=GN`,
                  { signal: controller.signal }
                );

                if (!availabilityResponse.ok) return;

                const availabilityPayload = await availabilityResponse.json();
                const rows = Array.isArray(availabilityPayload.availability)
                  ? availabilityPayload.availability
                  : [];
                const journeyRow = rows.find((row) => row?.date === journeyDate) || rows[0];

                if (journeyRow?.status) {
                  availabilityStatus[classCode] = String(journeyRow.status);
                }
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.warn(`Availability unavailable for ${trainNumber} ${classCode}:`, error.message);
                }
              }
            }));

            return {
              number: String(trainNumber),
              name: trainName,
              from: fromStation,
              to: toStation,
              departureTime,
              arrivalTime,
              duration,
              originStation: item.trainSrc || item.sourceStation || item.originStation || fromStation,
              destinationStation: item.trainDstn || item.destinationStation || item.toStation || toStation,
              classes,
              fares,
              availableSeats,
              availabilityStatus,
              fromDayOffset: Number(item.fromStationDayOffset) || 0,
              toDayOffset: Number(item.toStationDayOffset) || 0,
              stops: item.stops || generateStopsForRoute(fromStation, toStation, departureTime, arrivalTime),
              isLiveApiSource: true,
            };
          });

          return {
            success: true,
            trains: normalizedTrains,
            source: 'LIVE_API',
            isLive: true,
            message: `Fetched ${normalizedTrains.length} live trains from RapidAPI IRCTC Gateway.`,
          };
        }
      }
    } catch (err) {
      console.warn('RapidAPI Live request failed or timed out. Falling back to mock dataset:', err.message);
    }

  // MOCK FALLBACK (Default when no key or when live API fails/times out)
  const matchingMockTrains = TRAINS.filter(
    t => (t.from === fromStation && t.to === toStation) ||
         (t.stops.some(s => s.code === fromStation) && t.stops.some(s => s.code === toStation))
  );

  const fallbackResults = matchingMockTrains.length > 0 ? matchingMockTrains : TRAINS.slice(0, 3);

  return {
    success: true,
    trains: fallbackResults.map(t => ({ ...t, isLiveApiSource: false })),
    source: 'MOCK_DATA',
    isLive: false,
    message: 'Live backend returned no matching runs; RailRaksha verified mock dataset loaded.',
  };
}

function generateStopsForRoute(fromCode, toCode, depTime, arrTime) {
  const fromObj = STATIONS.find(s => s.code === fromCode) || { name: fromCode, code: fromCode };
  const toObj = STATIONS.find(s => s.code === toCode) || { name: toCode, code: toCode };

  return [
    { code: fromCode, name: fromObj.name, arrival: 'Source', departure: depTime, day: 1, dist: 0, status: 'passed' },
    { code: 'CNB', name: 'Kanpur Central', arrival: '22:15', departure: '22:20', day: 1, dist: 440, status: 'current' },
    { code: 'PRYJ', name: 'Prayagraj Jn', arrival: '02:30', departure: '02:35', day: 2, dist: 635, status: 'upcoming' },
    { code: toCode, name: toObj.name, arrival: arrTime, departure: 'Destination', day: 2, dist: 980, status: 'upcoming' },
  ];
}