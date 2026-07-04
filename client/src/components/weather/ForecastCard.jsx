import { Droplets, Wind, CloudRain } from "lucide-react";
import { formatDay } from "../../utils/helpers";

export default function ForecastCard({ daily }) {
  if (!daily || daily.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-white mb-4">5-Day Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {daily.map((day, i) => (
          <div
            key={day.date}
            className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10 hover-card"
          >
            <span className="text-slate-400 text-xs font-medium uppercase mb-2">
              {i === 0 ? "Today" : formatDay(day.date)}
            </span>
            <img
              src={day.icon_url}
              alt={day.description}
              className="w-10 h-10 mb-2"
            />
            <div className="text-white font-bold text-sm">{day.temp_max}°</div>
            <div className="text-slate-400 text-xs">{day.temp_min}°</div>

            <div className="mt-2 flex flex-col gap-1 w-full">
              {day.precipitation_chance > 0 && (
                <div className="flex items-center justify-center gap-1 text-blue-300 text-xs">
                  <CloudRain className="w-3 h-3" />
                  {day.precipitation_chance}%
                </div>
              )}
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                <Droplets className="w-3 h-3 text-blue-400" />
                {day.humidity}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
