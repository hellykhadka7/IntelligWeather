const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Call FastAPI ML service to predict next-day temperature.
 *
 * @param {string} city - City name
 * @param {number[]} historicalTemps - Recent temperature readings
 * @param {number} [lat] - Optional latitude
 * @param {number} [lon] - Optional longitude
 */
const predictTemperature = async (city, historicalTemps, lat, lon) => {
  const response = await axios.post(
    `${ML_SERVICE_URL}/predict/temperature`,
    {
      city,
      historical_temps: historicalTemps,
      latitude: lat,
      longitude: lon,
    },
    { timeout: 10000 }
  );
  return response.data;
};

/**
 * Call FastAPI ML service for multi-day temperature forecast.
 *
 * @param {string} city - City name
 * @param {number[]} historicalTemps - Recent temperature readings
 * @param {number} [days=5] - Days to forecast
 */
const predictMultiDay = async (city, historicalTemps, days = 5) => {
  const response = await axios.post(
    `${ML_SERVICE_URL}/predict/multi-day`,
    {
      city,
      historical_temps: historicalTemps,
      days,
    },
    { timeout: 10000 }
  );
  return response.data;
};

/**
 * Health check for the ML service.
 */
const checkMLHealth = async () => {
  const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
  return response.data;
};

module.exports = { predictTemperature, predictMultiDay, checkMLHealth };
