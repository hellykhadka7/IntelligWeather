import { Wind, AlertTriangle, Heart } from "lucide-react";
import Badge from "../ui/Badge";
import { getAQIHexColor } from "../../utils/helpers";

export default function AQICard({ data }) {
  if (!data) return null;

  const color = getAQIHexColor(data.aqi_value);

  return (
    <div className="glass-card p-6 animate-slide-up h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-400" />
          Air Quality
        </h3>
        {data.is_fallback && (
          <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
            Nearest Station
          </span>
        )}
      </div>

      {/* AQI Value */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
          style={{ backgroundColor: `${color}30`, border: `2px solid ${color}60` }}
        >
          {Math.round(data.aqi_value)}
        </div>
        <div>
          <Badge label={data.aqi_label} color={color} size="lg" />
          <p className="text-slate-400 text-xs mt-1">
            Risk: <span className="text-white font-medium">{data.risk_level}</span>
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            Main: <span className="text-white font-medium text-xs">{data.main_pollutant}</span>
          </p>
        </div>
      </div>

      {/* AQI Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>0 — Good</span>
          <span>500 — Hazardous</span>
        </div>
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="aqi-bar absolute inset-0" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all"
            style={{ left: `calc(${Math.min((data.aqi_value / 500) * 100, 97)}% - 7px)` }}
          />
        </div>
      </div>

      {/* Health Advisory */}
      <div className={`p-3 rounded-xl text-xs ${
        data.is_hazardous
          ? "bg-red-500/10 border border-red-500/20 text-red-300"
          : "bg-green-500/10 border border-green-500/20 text-green-300"
      }`}>
        <div className="flex items-start gap-2">
          {data.is_hazardous
            ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            : <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
          <p>{data.health_advisory}</p>
        </div>
      </div>

      {data.fallback_city && (
        <p className="text-slate-500 text-xs mt-2">
          Data from: {data.fallback_city}
        </p>
      )}
    </div>
  );
}
