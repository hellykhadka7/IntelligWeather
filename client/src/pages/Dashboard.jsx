import { useState, useCallback } from "react";
import SearchBar from "../components/ui/SearchBar";
import CurrentWeather from "../components/weather/CurrentWeather";
import ForecastCard from "../components/weather/ForecastCard";
import AQICard from "../components/aqi/AQICard";
import PollutantGrid from "../components/aqi/PollutantGrid";
import HealthAdvisory from "../components/aqi/HealthAdvisory";
import TemperatureChart from "../components/charts/TemperatureChart";
import AQIForecastChart from "../components/charts/AQIForecastChart";
import MLPredictionCard from "../components/prediction/MLPredictionCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import { weatherAPI, aqiAPI } from "../services/api";
import { CloudSun, MapPin } from "lucide-react";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCitySelect = useCallback(async (city) => {
    setSelectedCity(city);
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast(null);
    setAqi(null);
    setAlerts([]);

    const params = { lat: city.lat, lon: city.lon };

    try {
      // Fire weather and AQI requests in parallel for speed
      const [weatherRes, forecastRes, aqiRes] = await Promise.allSettled([
        weatherAPI.getCurrent(params),
        weatherAPI.getForecast(params),
        aqiAPI.getLive({ ...params, city: city.name }),
      ]);

      if (weatherRes.status === "fulfilled") {
        setWeather(weatherRes.value.data?.data);
      } else {
        throw new Error(weatherRes.reason?.message || "Failed to fetch weather");
      }

      if (forecastRes.status === "fulfilled") {
        setForecast(forecastRes.value.data?.data);
      }

      if (aqiRes.status === "fulfilled") {
        const aqiData = aqiRes.value.data?.data;
        setAqi(aqiData);

        // Fetch alerts after AQI is available
        aqiAPI.getAlerts({ ...params, city: city.name })
          .then((res) => setAlerts(res.data?.data?.alerts || []))
          .catch(() => {});
      }
    } catch (err) {
      setError(err.message || "Failed to load weather data. Check your API key.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient mb-3">
          Weather Intelligence
        </h2>
        <p className="text-slate-400 mb-8 text-base sm:text-lg">
          Real-time weather · AQI monitoring · ML-powered predictions
        </p>
        <SearchBar onCitySelect={handleCitySelect} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Fetching weather data..." />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-md mx-auto">
          <ErrorMessage message={error} onRetry={() => selectedCity && handleCitySelect(selectedCity)} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !weather && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <CloudSun className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Search any city</h3>
          <p className="text-slate-400 max-w-sm mx-auto text-sm">
            Get real-time weather, air quality index, pollutant breakdowns, and ML temperature predictions.
          </p>

          {/* Sample cities */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["London", "Tokyo", "New York", "Sydney", "Dubai", "Hyderabad"].map((c) => (
              <button
                key={c}
                onClick={() =>
                  handleCitySelect(
                    {
                      London:     { name: "London",     country: "GB", lat: 51.5074,  lon: -0.1278,  display: "London, GB"     },
                      Tokyo:      { name: "Tokyo",      country: "JP", lat: 35.6895,  lon: 139.6917, display: "Tokyo, JP"      },
                      "New York": { name: "New York",   country: "US", lat: 40.7128,  lon: -74.0060, display: "New York, US"   },
                      Sydney:     { name: "Sydney",     country: "AU", lat: -33.8688, lon: 151.2093, display: "Sydney, AU"     },
                      Dubai:      { name: "Dubai",      country: "AE", lat: 25.2048,  lon: 55.2708,  display: "Dubai, AE"      },
                      Hyderabad:  { name: "Hyderabad",  country: "IN", lat: 17.3850,  lon: 78.4867,  display: "Hyderabad, IN"  },
                    }[c]
                  )
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm transition-all hover-card"
              >
                <MapPin className="w-3 h-3" />
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard — shown when data is loaded */}
      {!loading && weather && (
        <div className="space-y-6 animate-fade-in">
          {/* Row 1: Current Weather + AQI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CurrentWeather data={weather} />
            </div>
            <div>
              <AQICard data={aqi} />
            </div>
          </div>

          {/* Row 2: Temperature Charts */}
          <TemperatureChart
            hourly={forecast?.hourly}
            forecastDaily={forecast?.daily}
          />

          {/* Row 3: 5-Day Forecast */}
          {forecast?.daily && <ForecastCard daily={forecast.daily} />}

          {/* Row 4: Pollutant Chart + Pollutant Grid */}
          {aqi?.components && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AQIForecastChart components={aqi.components} />
              <PollutantGrid components={aqi.components} />
            </div>
          )}

          {/* Row 5: Health Advisory + ML Prediction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthAdvisory aqiData={aqi} alerts={alerts} />
            <MLPredictionCard
              city={weather?.city}
              lat={selectedCity?.lat}
              lon={selectedCity?.lon}
            />
          </div>
        </div>
      )}
    </div>
  );
}
