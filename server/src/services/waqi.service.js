const axios = require("axios");
const { haversineDistance } = require("../utils/helpers");

const WAQI_BASE = "https://api.waqi.info";
const TOKEN = process.env.WAQI_API_TOKEN;

/**
 * AQI level thresholds — WAQI scale (0–500)
 */
const AQI_LEVELS = [
  { max: 50,  level: 1, label: "Good",        color: "#00e400", risk: "Low" },
  { max: 100, level: 2, label: "Fair",         color: "#ffff00", risk: "Low-Moderate" },
  { max: 150, level: 3, label: "Moderate",     color: "#ff7e00", risk: "Moderate" },
  { max: 200, level: 4, label: "Poor",         color: "#ff0000", risk: "High" },
  { max: Infinity, level: 5, label: "Very Poor", color: "#8f3f97", risk: "Very High" },
];

/**
 * Health advisories by AQI level — reused from original project's normalize_aqi.py
 */
const HEALTH_ADVISORIES = {
  1: "Air quality is satisfactory. Enjoy outdoor activities!",
  2: "Air quality is acceptable. Sensitive groups may experience minor issues.",
  3: "Some groups may experience health effects. Consider limiting outdoor activities.",
  4: "Everyone may begin to experience health effects. Limit outdoor exposure.",
  5: "Health alert: Everyone should avoid outdoor activities.",
};

/**
 * Fallback Indian cities list — reused from original fetch_live_aqi.py
 */
const FALLBACK_CITIES = [
  { name: "Tirupati",      lat: 13.1939, lon: 79.2941 },
  { name: "Bangalore",     lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad",     lat: 17.3850, lon: 78.4867 },
  { name: "Chennai",       lat: 13.0827, lon: 80.2707 },
  { name: "Vellore",       lat: 12.9352, lon: 79.1325 },
  { name: "Nellore",       lat: 14.4426, lon: 79.9864 },
  { name: "Pune",          lat: 18.5204, lon: 73.8567 },
  { name: "Mumbai",        lat: 19.0760, lon: 72.8777 },
  { name: "Delhi",         lat: 28.7041, lon: 77.1025 },
  { name: "Jaipur",        lat: 26.9124, lon: 75.7873 },
  { name: "Kolkata",       lat: 22.5726, lon: 88.3639 },
  { name: "Ahmedabad",     lat: 23.0225, lon: 72.5714 },
  { name: "Lucknow",       lat: 26.8467, lon: 80.9462 },
  { name: "Chandigarh",    lat: 30.7333, lon: 76.8277 },
  { name: "Visakhapatnam", lat: 17.6869, lon: 83.2185 },
];

const getAQILevel = (value) =>
  AQI_LEVELS.find((l) => value <= l.max) || AQI_LEVELS[4];

const parseComponents = (iaqi = {}) => ({
  co:    iaqi.co?.v  ?? 0,
  no:    iaqi.no?.v  ?? 0,
  no2:   iaqi.no2?.v ?? 0,
  o3:    iaqi.o3?.v  ?? 0,
  so2:   iaqi.so2?.v ?? 0,
  pm2_5: iaqi.pm25?.v ?? 0,
  pm10:  iaqi.pm10?.v ?? 0,
  nh3:   iaqi.nh3?.v ?? 0,
});

const identifyMainPollutant = (components) => {
  const names = {
    co:    "Carbon Monoxide (CO)",
    no:    "Nitrogen Monoxide (NO)",
    no2:   "Nitrogen Dioxide (NO₂)",
    o3:    "Ozone (O₃)",
    so2:   "Sulfur Dioxide (SO₂)",
    pm2_5: "Fine Particulate (PM2.5)",
    pm10:  "Particulate Matter (PM10)",
    nh3:   "Ammonia (NH₃)",
  };
  const max = Object.entries(components).reduce(
    (best, [k, v]) => (v > best.val ? { key: k, val: v } : best),
    { key: "unknown", val: 0 }
  );
  return max.val === 0 ? "Low Pollution" : names[max.key] || max.key.toUpperCase();
};

const buildAQIResponse = (data, aqiValue, isFallback = false, fallbackCity = null) => {
  const components = parseComponents(data.iaqi);
  const levelInfo = getAQILevel(aqiValue);

  return {
    aqi_value: aqiValue,
    aqi_level: levelInfo.level,
    aqi_label: levelInfo.label,
    aqi_color: levelInfo.color,
    risk_level: levelInfo.risk,
    health_advisory: HEALTH_ADVISORIES[levelInfo.level],
    is_hazardous: levelInfo.level >= 4,
    components,
    main_pollutant: identifyMainPollutant(components),
    station_city: data.city?.name || "Unknown",
    is_fallback: isFallback,
    fallback_city: fallbackCity,
  };
};

/**
 * Fetch live AQI for a city by name or coordinates.
 * Falls back to nearest Indian city if direct lookup fails.
 */
const getLiveAQI = async ({ city, lat, lon }) => {
  // 1) Try direct city lookup first
  if (city) {
    try {
      const res = await axios.get(`${WAQI_BASE}/feed/${encodeURIComponent(city)}/`, {
        params: { token: TOKEN },
        timeout: 8000,
      });
      if (res.data.status === "ok") {
        const aqiValue = res.data.data.aqi;
        return buildAQIResponse(res.data.data, aqiValue, false);
      }
    } catch (_) {
      // Fall through to coordinate lookup
    }
  }

  // 2) Try coordinate-based lookup
  if (lat !== undefined && lon !== undefined) {
    try {
      const res = await axios.get(`${WAQI_BASE}/feed/here/`, {
        params: { lat, lon, token: TOKEN },
        timeout: 8000,
      });
      if (res.data.status === "ok") {
        const aqiValue = res.data.data.aqi;
        return buildAQIResponse(res.data.data, aqiValue, false);
      }
    } catch (_) {
      // Fall through to fallback
    }
  }

  // 3) Fallback: nearest city within 300km (reused from original project)
  if (lat !== undefined && lon !== undefined) {
    const nearby = FALLBACK_CITIES.map((c) => ({
      ...c,
      distance: haversineDistance(lat, lon, c.lat, c.lon),
    }))
      .filter((c) => c.distance <= 300)
      .sort((a, b) => a.distance - b.distance);

    for (const candidate of nearby) {
      try {
        const res = await axios.get(
          `${WAQI_BASE}/feed/${encodeURIComponent(candidate.name)}/`,
          { params: { token: TOKEN }, timeout: 8000 }
        );
        if (res.data.status === "ok") {
          const aqiValue = res.data.data.aqi;
          return buildAQIResponse(
            res.data.data,
            aqiValue,
            true,
            `${candidate.name} (${Math.round(candidate.distance)}km away)`
          );
        }
      } catch (_) {
        continue;
      }
    }
  }

  throw new Error("Could not fetch AQI data. No station available for this location.");
};

/**
 * Generate AQI alerts based on current AQI level and components.
 */
const generateAlerts = (aqiData) => {
  const alerts = [];
  const { aqi_level, components } = aqiData;

  if (aqi_level >= 4) {
    alerts.push({
      severity: "high",
      type: "health_hazard",
      message: "Air quality is hazardous. Avoid outdoor activities.",
      affected_groups: ["Everyone"],
    });
  } else if (aqi_level >= 3) {
    alerts.push({
      severity: "medium",
      type: "health_warning",
      message: "Sensitive groups should limit outdoor exposure.",
      affected_groups: ["Children", "Elderly", "Asthma patients"],
    });
  }

  if (components.pm2_5 > 35) {
    alerts.push({
      severity: "high",
      type: "pollutant_alert",
      message: "PM2.5 levels are dangerously high.",
      pollutant: "PM2.5",
    });
  }

  if (components.o3 > 150) {
    alerts.push({
      severity: "medium",
      type: "pollutant_alert",
      message: "Ozone levels are elevated.",
      pollutant: "O₃",
    });
  }

  return alerts;
};

module.exports = { getLiveAQI, generateAlerts, getAQILevel, HEALTH_ADVISORIES };
