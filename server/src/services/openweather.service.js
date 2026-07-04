const axios = require("axios");

const BASE_URL = "https://api.openweathermap.org";
const API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Fetches current weather data from OpenWeatherMap.
 * Supports city name or lat/lon.
 */
const getCurrentWeather = async ({ city, lat, lon }) => {
  const params = {
    appid: API_KEY,
    units: "metric",
    lang: "en",
  };

  if (city) {
    params.q = city.trim();
  } else if (lat !== undefined && lon !== undefined) {
    params.lat = lat;
    params.lon = lon;
  } else {
    throw new Error("Provide city name or coordinates");
  }

  const response = await axios.get(`${BASE_URL}/data/2.5/weather`, { params });
  const d = response.data;

  return {
    city: d.name,
    country: d.sys.country,
    lat: d.coord.lat,
    lon: d.coord.lon,
    temp: Math.round(d.main.temp),
    feels_like: Math.round(d.main.feels_like),
    temp_min: Math.round(d.main.temp_min),
    temp_max: Math.round(d.main.temp_max),
    humidity: d.main.humidity,
    pressure: d.main.pressure,
    wind_speed: d.wind.speed,
    wind_deg: d.wind.deg || 0,
    wind_direction: getWindDirection(d.wind.deg || 0),
    visibility: d.visibility ? Math.round(d.visibility / 1000) : null,
    condition: d.weather[0].main,
    description: capitalise(d.weather[0].description),
    icon: d.weather[0].icon,
    icon_url: `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`,
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
    timezone: d.timezone,
  };
};

/**
 * Fetches 5-day / 40-step forecast (3-hour intervals).
 */
const getForecast = async ({ city, lat, lon }) => {
  const params = {
    appid: API_KEY,
    units: "metric",
    cnt: 40,
  };

  if (city) {
    params.q = city.trim();
  } else if (lat !== undefined && lon !== undefined) {
    params.lat = lat;
    params.lon = lon;
  } else {
    throw new Error("Provide city name or coordinates");
  }

  const response = await axios.get(`${BASE_URL}/data/2.5/forecast`, { params });
  const list = response.data.list;

  // Build daily forecast by grouping by date
  const dailyMap = {};
  list.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyMap[date]) {
      dailyMap[date] = {
        date,
        temps: [],
        icons: [],
        descriptions: [],
        humidity: [],
        wind_speeds: [],
        pop: 0, // probability of precipitation
      };
    }
    dailyMap[date].temps.push(item.main.temp);
    dailyMap[date].icons.push(item.weather[0].icon);
    dailyMap[date].descriptions.push(item.weather[0].description);
    dailyMap[date].humidity.push(item.main.humidity);
    dailyMap[date].wind_speeds.push(item.wind.speed);
    dailyMap[date].pop = Math.max(dailyMap[date].pop, item.pop || 0);
  });

  // Take first 5 days and summarise each
  const daily = Object.values(dailyMap)
    .slice(0, 5)
    .map((day) => ({
      date: day.date,
      temp_max: Math.round(Math.max(...day.temps)),
      temp_min: Math.round(Math.min(...day.temps)),
      temp_avg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      wind_speed: Math.round(day.wind_speeds.reduce((a, b) => a + b, 0) / day.wind_speeds.length),
      icon: day.icons[Math.floor(day.icons.length / 2)], // midday icon
      icon_url: `https://openweathermap.org/img/wn/${day.icons[Math.floor(day.icons.length / 2)]}@2x.png`,
      description: capitalise(day.descriptions[Math.floor(day.descriptions.length / 2)]),
      precipitation_chance: Math.round(day.pop * 100),
    }));

  // Hourly forecast for the chart (next 24 hours = 8 items at 3h intervals)
  const hourly = list.slice(0, 8).map((item) => ({
    time: new Date(item.dt * 1000).toISOString(),
    temp: Math.round(item.main.temp),
    feels_like: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    wind_speed: item.wind.speed,
    icon: item.weather[0].icon,
    description: capitalise(item.weather[0].description),
    precipitation: item.rain ? item.rain["3h"] || 0 : 0,
    precipitation_chance: Math.round((item.pop || 0) * 100),
  }));

  return { daily, hourly };
};

/**
 * Search cities by name using OWM Geocoding API.
 */
const searchCities = async (query, limit = 5) => {
  const response = await axios.get(`${BASE_URL}/geo/1.0/direct`, {
    params: { q: query.trim(), limit, appid: API_KEY },
  });

  return response.data.map((item) => ({
    name: item.name,
    country: item.country,
    state: item.state || "",
    lat: item.lat,
    lon: item.lon,
    display: item.state
      ? `${item.name}, ${item.state}, ${item.country}`
      : `${item.name}, ${item.country}`,
  }));
};

// Utility helpers
const getWindDirection = (degrees) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
};

const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

module.exports = { getCurrentWeather, getForecast, searchCities };
