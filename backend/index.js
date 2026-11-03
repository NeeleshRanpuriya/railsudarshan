import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ==========================================
// 1. CONFIGURATION
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Loads server/.env from the same folder as index.js
dotenv.config({
  path: resolve(__dirname, ".env"),
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;
const BASE_URL = (
  process.env.IRCTC_BASE_URL || "https://api.irctc.dev"
).replace(/\/+$/, "");

const API_KEY = process.env.IRCTC_API_KEY;
const liveStatusCache = new Map();

app.disable("x-powered-by");

// ==========================================
// 2. RAILWAY API HELPER
// ==========================================

async function railwayAPI(endpoint, params = {}) {
  if (!API_KEY) {
    const error = new Error("Railway API key is not configured");
    error.status = 503;
    throw error;
  }

  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        accept: "application/json",
      },
      signal: controller.signal,
    });

    const responseText = await response.text();

    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: "Railway provider returned an invalid response" };
    }

    if (!response.ok) {
      const error = new Error("Railway provider request failed");
      error.status = response.status >= 500 ? 502 : response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Railway API request timed out");
      timeoutError.status = 504;
      throw timeoutError;
    }

    if (error.status) throw error;

    const networkError = new Error("Unable to connect to railway provider");
    networkError.status = 502;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
}

// ==========================================
// 3. VALIDATION HELPERS
// ==========================================

function required(value, name) {
  if (
    value === undefined ||
    value === null ||
    !String(value).trim()
  ) {
    const error = new Error(`${name} is required`);
    error.status = 400;
    throw error;
  }

  return String(value).trim();
}

function trainNumber(value) {
  const number = required(value, "Train number");

  if (!/^\d{5}$/.test(number)) {
    const error = new Error("Train number must contain 5 digits");
    error.status = 400;
    throw error;
  }

  return number;
}

function stationCode(value) {
  const code = required(value, "Station code").toUpperCase();

  if (!/^[A-Z0-9]{2,6}$/.test(code)) {
    const error = new Error("Invalid station code");
    error.status = 400;
    throw error;
  }

  return code;
}

function dateValue(value, format = "YYYY-MM-DD") {
  const date = required(value, "Date");

  const pattern =
    format === "DD-MM-YYYY"
      ? /^(\d{2})-(\d{2})-(\d{4})$/
      : /^(\d{4})-(\d{2})-(\d{2})$/;

  const match = date.match(pattern);

  if (!match) {
    const error = new Error(`Date must be in ${format} format`);
    error.status = 400;
    throw error;
  }

  let year;
  let month;
  let day;

  if (format === "DD-MM-YYYY") {
    [, day, month, year] = match;
  } else {
    [, year, month, day] = match;
  }

  const parsed = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month) - 1 ||
    parsed.getUTCDate() !== Number(day)
  ) {
    const error = new Error("Invalid calendar date");
    error.status = 400;
    throw error;
  }

  return date;
}

function shiftDate(date, days) {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function optionalShortText(value, name, maxLength = 100) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const result = String(value).trim();

  if (result.length > maxLength) {
    const error = new Error(`${name} is too long`);
    error.status = 400;
    throw error;
  }

  return result;
}

// ==========================================
// 4. ASYNC ROUTE HANDLER
// ==========================================

const route = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// ==========================================
// 5. BACKEND HEALTH
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "HEALTHY",
    service: "RailRaksha Backend",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 6. RAILWAY API HEALTH
// ==========================================

app.get(
  "/api/railway/health",
  route(async (req, res) => {
    const data = await railwayAPI("/health");
    res.json(data);
  })
);

// ==========================================
// 7. TRAIN SEARCH BETWEEN STATIONS
// ==========================================

app.get(
  "/api/railway/trains/search",
  route(async (req, res) => {
    const from = stationCode(req.query.from);
    const to = stationCode(req.query.to);

    if (from === to) {
      const error = new Error("Source and destination cannot be the same");
      error.status = 400;
      throw error;
    }

    const data = await railwayAPI("/api/v1/trains/search", {
      from,
      to,
      date: req.query.date
        ? dateValue(req.query.date)
        : undefined,
    });

    res.json(data);
  })
);

// ==========================================
// 8. SEARCH TRAIN BY NAME
// ==========================================

app.get(
  "/api/railway/trains/search/name",
  route(async (req, res) => {
    const name = required(req.query.name, "Train name");

    if (name.length < 2) {
      const error = new Error(
        "Train name must have at least 2 characters"
      );
      error.status = 400;
      throw error;
    }

    const data = await railwayAPI(
      "/api/v1/trains/search/name",
      { name }
    );

    res.json(data);
  })
);

// ==========================================
// 9. CANCELLED TRAINS
// ==========================================

app.get(
  "/api/railway/trains/cancelled",
  route(async (req, res) => {
    const data = await railwayAPI("/api/v1/trains/cancelled");
    res.json(data);
  })
);

// ==========================================
// 10. TRAIN SCHEDULE
// ==========================================

app.get(
  "/api/railway/trains/:trainNo",
  route(async (req, res) => {
    const number = trainNumber(req.params.trainNo);

    const data = await railwayAPI(
      `/api/v1/trains/${number}`
    );

    res.json(data);
  })
);

// ==========================================
// 11. TRAIN FARE
// ==========================================

app.get(
  "/api/railway/trains/:trainNo/fare",
  route(async (req, res) => {
    const number = trainNumber(req.params.trainNo);

    const from = stationCode(req.query.from);
    const to = stationCode(req.query.to);

    const data = await railwayAPI(
      `/api/v1/trains/${number}/fare`,
      {
        from,
        to,
        class: optionalShortText(req.query.class, "Class") || "all",
        quota: optionalShortText(req.query.quota, "Quota") || "GN",
      }
    );

    res.json(data);
  })
);

// ==========================================
// 12. SEAT AVAILABILITY
// ==========================================

app.get(
  "/api/railway/trains/:trainNo/availability",
  route(async (req, res) => {
    const number = trainNumber(req.params.trainNo);

    const data = await railwayAPI(
      `/api/v1/trains/${number}/availability`,
      {
        from: stationCode(req.query.from),
        to: stationCode(req.query.to),
        date: dateValue(req.query.date, "DD-MM-YYYY"),
        class: optionalShortText(req.query.class, "Class") || "3A",
        quota: optionalShortText(req.query.quota, "Quota") || "GN",
      }
    );

    res.json(data);
  })
);

// ==========================================
// 13. VACANT SEATS AFTER CHARTING
// ==========================================

app.get(
  "/api/railway/trains/:trainNo/chart-vacant",
  route(async (req, res) => {
    const number = trainNumber(req.params.trainNo);

    const data = await railwayAPI(
      `/api/v1/trains/${number}/chart-vacant`,
      {
        boardingStation: stationCode(req.query.boardingStation),
        date: req.query.date
          ? dateValue(req.query.date)
          : undefined,
        class: optionalShortText(req.query.class, "Class") || "ALL",
      }
    );

    res.json(data);
  })
);

// ==========================================
// 14. SEARCH INDIAN RAILWAY STATIONS
// ==========================================
// Used by StationSelect.jsx
//
// Example:
// /api/railway/stations/search?q=Gwalior
// /api/railway/stations/search?q=Delhi
// /api/railway/stations/search?q=BPL
//
// This is query-based search, not a complete
// download of every Indian railway station.
// ==========================================

app.get(
  "/api/railway/stations/search",
  route(async (req, res) => {
    const q = required(req.query.q, "Station search query");

    if (q.length < 2) {
      const error = new Error(
        "Station search query must have at least 2 characters"
      );
      error.status = 400;
      throw error;
    }

    if (q.length > 80) {
      const error = new Error("Station search query is too long");
      error.status = 400;
      throw error;
    }

    const data = await railwayAPI(
      "/api/v1/trains/stations",
      { q }
    );

    // Preserve the provider response format.
    // The frontend StationSelect component normalizes it.
    res.json(data);
  })
);

// ==========================================
// 15. STATION DETAILS
// ==========================================

app.get(
  "/api/railway/stations/:code",
  route(async (req, res) => {
    const code = stationCode(req.params.code);

    const data = await railwayAPI(
      `/api/v1/trains/stations/${code}`
    );

    res.json(data);
  })
);

// ==========================================
// 16. STATION TIMETABLE
// ==========================================

app.get(
  "/api/railway/stations/:code/timetable/:date",
  route(async (req, res) => {
    const code = stationCode(req.params.code);
    const date = dateValue(req.params.date);

    const data = await railwayAPI(
      `/api/v1/trains/stations/${code}/timetable/${date}`
    );

    res.json(data);
  })
);

// ==========================================
// 17. LIVE TRAIN STATUS
// ==========================================

app.get(
  "/api/railway/live/:trainNo",
  route(async (req, res) => {
    const number = trainNumber(req.params.trainNo);
    const boardingDate = dateValue(req.query.date);
    const cacheKey = `${number}:${boardingDate}:${req.query.from || ""}`;
    const cached = liveStatusCache.get(cacheKey);

    const forceRefresh = req.query.refresh === "1";
    if (!forceRefresh && cached && Date.now() - cached.timestamp < 30000) {
      return res.json(cached.payload);
    }

    let runDate = boardingDate;

    if (req.query.from) {
      const boardingStation = stationCode(req.query.from);
      const schedule = await railwayAPI(`/api/v1/trains/${number}`);
      const scheduleData = schedule.data || schedule;
      const scheduleStations = Array.isArray(scheduleData.stations)
        ? scheduleData.stations
        : [];
      const boardingStop = scheduleStations.find(
        (stop) => String(stop.code || "").toUpperCase() === boardingStation
      );

      if (!boardingStop) {
        const error = new Error(
          `Boarding station ${boardingStation} was not found in train schedule`
        );
        error.status = 502;
        throw error;
      }

      const dayOffset = Number(boardingStop.dayOffset);
      if (!Number.isInteger(dayOffset) || dayOffset < 0) {
        const error = new Error("Train schedule has an invalid boarding day offset");
        error.status = 502;
        throw error;
      }

      runDate = shiftDate(boardingDate, -dayOffset);
    }

    const data = await railwayAPI(
      `/api/v1/live/${number}`,
      { date: runDate, refresh: forceRefresh ? Date.now() : undefined }
    );

    const payload = {
      ...data,
      runDate,
      boardingDate,
    };
    liveStatusCache.set(cacheKey, { timestamp: Date.now(), payload });
    res.json(payload);
  })
);

// ==========================================
// 18. LIVE STATION BOARD
// ==========================================

app.get(
  "/api/railway/live/station/:stationCode",
  route(async (req, res) => {
    const code = stationCode(req.params.stationCode);
    const hours = Number(req.query.hours || 2);

    if (![2, 4, 8].includes(hours)) {
      const error = new Error("Hours must be 2, 4, or 8");
      error.status = 400;
      throw error;
    }

    const data = await railwayAPI(
      `/api/v1/live/station/${code}`,
      {
        hours,
        toStation: req.query.toStation
          ? stationCode(req.query.toStation)
          : undefined,
      }
    );

    res.json(data);
  })
);

// ==========================================
// 19. PNR STATUS
// ==========================================

app.get(
  "/api/railway/pnr/:pnr",
  route(async (req, res) => {
    const pnr = required(req.params.pnr, "PNR");

    if (!/^\d{10}$/.test(pnr)) {
      const error = new Error(
        "PNR must contain exactly 10 digits"
      );
      error.status = 400;
      throw error;
    }

    const data = await railwayAPI(
      `/api/v1/pnr/${pnr}`
    );

    res.json(data);
  })
);

// ==========================================
// 20. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ==========================================
// 21. GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("RailRaksha Error:", err.message);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Railway service request failed"
        : err.message,
  });
});

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log("------------------------------------");
    console.log("       RAILRAKSHA BACKEND");
    console.log("------------------------------------");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Railway API: ${BASE_URL}`);
    console.log(
      `API Key: ${API_KEY ? "Configured" : "Missing"}`
    );
    console.log("------------------------------------");
  });
}