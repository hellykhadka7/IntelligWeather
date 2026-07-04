import { Droplets, Wind, Gauge, Eye, Sunrise, Sunset, Thermometer } from "lucide-react";
import { formatTime, getWindDirection } from "../../utils/helpers";

export default function CurrentWeather({ data }) {
  if (!data) return null;

  const stats = [
    {
      icon: <Droplets className="w-4 h-4 text-blue-400" />,
      label: "Humidity",
      value: `${data.humidity}%`,
    },
    {
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
      label: "Wind",
      value: `${data.wind_speed} m/s ${data.wind_direction || ""}`,
    },
    {
      icon: <Gauge className="w-4 h-4 text-purple-400" />,
      label: "Pressure",
      value: `${data.pressure} hPa`,
    },
    {
      icon: <Eye className="w-4 h-4 text-green-400" />,
      label: "Visibility",
      value: data.visibility ? `${data.visibility} km` : "N/A",
    },
    {
      icon: <Sunrise className="w-4 h-4 text-amber-400" />,
      label: "Sunrise",
      value: formatTime(data.sunrise),
    },
    {
      icon: <Sunset className="w-4 h-4 text-orange-400" />,
      label: "Sunset",
      value: formatTime(data.sunset),
    },
  ];

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* City Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {data.city}
            <span className="text-slate-400 text-xl font-normal ml-2">{data.country}</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">{data.description}</p>
        </div>
        <img
          src={data.icon_url}
          alt={data.condition}
          className="w-16 h-16 drop-shadow-lg"
        />
      </div>

      {/* Main Temperature */}
      <div className="flex items-end gap-4 mb-6">
        <div>
          <div className="text-7xl font-extrabold text-white leading-none">
            {data.temp}
            <span className="text-4xl text-slate-300">°C</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
            <Thermometer className="w-4 h-4 text-orange-400" />
            Feels like {data.feels_like}°C
          </div>
          <div className="text-slate-500 text-xs mt-1">
            {data.temp_min}° / {data.temp_max}°
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="stat-badge">
            <div className="flex items-center gap-1.5 mb-1">
              {stat.icon}
              <span className="text-slate-400 text-xs">{stat.label}</span>
            </div>
            <span className="text-white font-semibold text-sm">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
