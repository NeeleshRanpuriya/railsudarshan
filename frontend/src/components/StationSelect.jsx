
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// ==========================================
// 1. POPULAR INDIAN RAILWAY STATIONS
// ==========================================

const POPULAR_STATIONS = [
  { name: "New Delhi", code: "NDLS" },
  { name: "Gwalior Junction", code: "GWL" },
  { name: "Bhopal Junction", code: "BPL" },
  { name: "Mumbai Central", code: "MMCT" },
  { name: "Chhatrapati Shivaji Maharaj Terminus", code: "CSMT" },
  { name: "Hazrat Nizamuddin", code: "NZM" },
  { name: "Howrah Junction", code: "HWH" },
  { name: "Kolkata", code: "KOAA" },
  { name: "Chennai Central", code: "MAS" },
  { name: "Bengaluru City", code: "SBC" },
  { name: "Hyderabad Deccan", code: "HYB" },
  { name: "Pune Junction", code: "PUNE" },
  { name: "Jaipur Junction", code: "JP" },
  { name: "Lucknow NR", code: "LKO" },
  { name: "Agra Cantt", code: "AGC" },
  { name: "Varanasi Junction", code: "BSB" },
  { name: "Patna Junction", code: "PNBE" },
  { name: "Kanpur Central", code: "CNB" },
  { name: "Prayagraj Junction", code: "PRYJ" },
  { name: "Indore Junction", code: "INDB" },
  { name: "Jabalpur Junction", code: "JBP" },
  { name: "Nagpur Junction", code: "NGP" },
  { name: "Ahmedabad Junction", code: "ADI" },
  { name: "Surat", code: "ST" },
  { name: "Ranchi Junction", code: "RNC" },
  { name: "Amritsar Junction", code: "ASR" },
  { name: "Chandigarh", code: "CDG" },
  { name: "Gorakhpur Junction", code: "GKP" },
  { name: "Dehradun", code: "DDN" },
  { name: "Udaipur City", code: "UDZ" },
  { name: "Kota Junction", code: "KOTA" },
  { name: "Raipur Junction", code: "R" },
  { name: "Vijayawada Junction", code: "BZA" },
  { name: "Ernakulam Junction", code: "ERS" },
  { name: "Thiruvananthapuram Central", code: "TVC" },
  { name: "Madurai Junction", code: "MDU" },
  { name: "Jodhpur Junction", code: "JU" },
  { name: "Ajmer Junction", code: "AII" },
  { name: "Varanasi City", code: "BCY" },
  { name: "Raxaul Junction", code: "RXL" }
];

// ==========================================
// 2. NORMALIZE API RESPONSE
// ==========================================

function normalizeStations(payload) {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === "string") return null;
        if (!item || typeof item !== "object") return null;

        const name =
          item.name ||
          item.station_name ||
          item.stationName ||
          item.station ||
          item.stn_name ||
          item.stationNameEn;

        const code =
          item.code ||
          item.station_code ||
          item.stationCode ||
          item.stn_code ||
          item.stationCodeEn;

        if (!name || !code) return null;

        return {
          name: String(name).trim(),
          code: String(code).trim().toUpperCase()
        };
      })
      .filter(
        (station) =>
          station &&
          station.name &&
          /^[A-Z0-9]{2,6}$/.test(station.code)
      );
  }

  if (typeof payload === "object") {
    const nested =
      payload.data ||
      payload.stations ||
      payload.results ||
      payload.response ||
      [];

    if (nested === payload) return [];

    return normalizeStations(nested);
  }

  return [];
}

// ==========================================
// 3. STATION SELECT COMPONENT
// ==========================================

export default function StationSelect({
  value,
  onChange,
  stations = [],
  placeholder = "Search station...",
  disabled = false
}) {
  const [query, setQuery] = useState("");
  const [apiStations, setApiStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ==========================================
  // 4. COMBINE LOCAL STATIONS
  // ==========================================

  const allLocalStations = useMemo(() => {
    const combined = [...POPULAR_STATIONS, ...stations];
    const unique = new Map();

    combined.forEach((station) => {
      if (station?.name && station?.code) {
        unique.set(
          String(station.code).toUpperCase(),
          {
            name: String(station.name),
            code: String(station.code).toUpperCase()
          }
        );
      }
    });

    return [...unique.values()];
  }, [stations]);

  // ==========================================
  // 5. KEEP SELECTED STATION NAME
  // ==========================================

  useEffect(() => {
    const code = String(value || "").toUpperCase();

    if (!code) {
      setSelectedStation(null);
      return;
    }

    const selected = allLocalStations.find(
      (station) => station.code === code
    );

    if (selected) {
      setSelectedStation(selected);
    }
  }, [value, allLocalStations]);

  // ==========================================
  // 6. LIVE API SEARCH
  // ==========================================

  useEffect(() => {
    const search = query.trim();

    if (search.length < 2) {
      setApiStations([]);
      setApiError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(
          `${API_BASE}/api/railway/stations/search?q=${encodeURIComponent(search)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json"
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(`Station API error: ${response.status}`);
        }

        const payload = await response.json();

        const normalized = normalizeStations(payload);

        setApiStations(normalized);

        if (normalized.length === 0) {
          setApiError("No live station results returned.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Station search failed:", error);

          setApiStations([]);
          setApiError("Live search unavailable. Showing local stations.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // ==========================================
  // 7. FILTER AND MERGE RESULTS
  // ==========================================

  const displayedStations = useMemo(() => {
    const search = query.trim().toLowerCase();

    const combined = [
      ...apiStations,
      ...allLocalStations
    ];

    const unique = new Map();

    combined.forEach((station) => {
      if (!station?.code || !station?.name) return;

      const matches =
        !search ||
        station.name.toLowerCase().includes(search) ||
        station.code.toLowerCase().includes(search);

      if (matches) {
        unique.set(station.code.toUpperCase(), station);
      }
    });

    return [...unique.values()].slice(0, 25);
  }, [apiStations, allLocalStations, query]);

  // ==========================================
  // 8. SELECT STATION
  // ==========================================

  const handleSelect = (station) => {
    setSelectedStation(station);

    onChange(station.code);

    setQuery("");
    setApiStations([]);
    setOpen(false);
  };

  // ==========================================
  // 9. DISPLAY SELECTED VALUE
  // ==========================================

  const selectedLabel = selectedStation
    ? `${selectedStation.name} (${selectedStation.code})`
    : value || "";

  // ==========================================
  // 10. UI
  // ==========================================

  return (
    <div className="relative w-full">

      {/* Search Input */}

      <input
        type="text"
        value={open ? query : selectedLabel}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}

        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}

        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}

        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }

          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}

        onBlur={() => {
          setTimeout(() => setOpen(false), 180);
        }}

        className="w-full pl-3 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500 disabled:opacity-50"
      />

      {/* Dropdown */}

      {open && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">

          {/* Header */}

          <div className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800">
            {query.trim().length >= 2
              ? "SEARCH RESULTS"
              : "POPULAR RAILWAY STATIONS"}
          </div>

          {/* Loading */}

          {loading && (
            <div className="px-4 py-3 text-xs text-slate-500">
              Searching railway stations...
            </div>
          )}

          {/* API Error */}

          {apiError && !loading && query.trim().length >= 2 && (
            <div className="px-4 py-2 text-xs text-amber-600">
              {apiError}
            </div>
          )}

          {/* No Results */}

          {!loading && displayedStations.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-500">
              No stations found. Try another station name or code.
            </div>
          )}

          {/* Station List */}

          {displayedStations.map((station) => (
            <button
              key={station.code}
              type="button"

              onMouseDown={(event) => {
                event.preventDefault();
              }}

              onClick={() => handleSelect(station)}

              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <span className="text-sm font-semibold text-slate-800 dark:text-white">
                {station.name}
              </span>

              <span className="shrink-0 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {station.code}
              </span>
            </button>
          ))}

          {/* Footer */}

          <div className="px-3 py-2 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800">
            Popular stations + live railway API search
          </div>

        </div>
      )}

    </div>
  );
}
