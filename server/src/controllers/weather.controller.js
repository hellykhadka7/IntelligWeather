const { getCurrentWeather, getForecast } = require("../services/openweather.service");
const WeatherHistory = require("../models/WeatherHistory");

/**
 * GET /api/weather/current?city=London  OR  ?lat=51.5&lon=-0.1
 */
const getCurrent = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (lat === undefined || lon === undefined)) {
      return res.status(400).json({ success: false, error: "Provide city or lat/lon coordinates" });
    }

    const data = await getCurrentWeather({
      city,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    // Persist reading to MongoDB for ML use (non-blocking)
    _persistReading(data).catch(() => {});

    res.json({ success: true, data });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, error: "City not found" });
    }
    next(err);
  }
};

/**
 * GET /api/weather/forecast?city=London
 */
const getForecastData = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (lat === undefined || lon === undefined)) {
      return res.status(400).json({ success: false, error: "Provide city or lat/lon coordinates" });
    }

    const data = await getForecast({
      city,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    res.json({ success: true, data });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, error: "City not found" });
    }
    next(err);
  }
};

/**
 * Persist a weather reading to MongoDB for ML training data.
 * Keeps last 20 readings per city (rolling window).
 */
const _persistReading = async (weatherData) => {
  const cityKey = weatherData.city.toLowerCase();
  const reading = {
    timestamp: new Date(),
    temp: weatherData.temp,
    feels_like: weatherData.feels_like,
    humidity: weatherData.humidity,
    pressure: weatherData.pressure,
    wind_speed: weatherData.wind_speed,
    precipitation: 0,
  };

  await WeatherHistory.findOneAndUpdate(
    { city_key: cityKey },
    {
      $set: {
        city: weatherData.city,
        country: weatherData.country,
        lat: weatherData.lat,
        lon: weatherData.lon,
        updated_at: new Date(),
      },
      $push: {
        readings: {
          $each: [reading],
          $slice: -20, // Keep only the last 20 readings
        },
      },
    },
    { upsert: true, new: true }
  );
};

module.exports = { getCurrent, getForecastData };
