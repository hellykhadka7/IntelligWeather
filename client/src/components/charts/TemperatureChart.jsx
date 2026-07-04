import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatChartTime } from "../../utils/helpers";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-card p-3 text-xs border border-white/20">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {Math.round(p.value)}°C
        </p>
      ))}
    </div>
  );
};

export default function TemperatureChart({ hourly, forecastDaily }) {
  // Build chart data from hourly forecast
  const hourlyData = (hourly || []).map((h) => ({
    time: formatChartTime(h.time),
    temp: h.temp,
    feels_like: h.feels_like,
  }));

  // Build daily data from 5-day forecast
  const dailyData = (forecastDaily || []).map((d, i) => ({
    time: i === 0 ? "Today" : new Date(d.date).toLocaleDateString([], { weekday: "short" }),
    high: d.temp_max,
    low: d.temp_min,
    avg: d.temp_avg,
  }));

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        Temperature Trends
      </h3>

      {/* 24-Hour Chart */}
      {hourlyData.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase mb-3">Next 24 Hours</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temp"
                name="Temperature"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#tempGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="feels_like"
                name="Feels Like"
                stroke="#a78bfa"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#feelsGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 5-Day High/Low Chart */}
      {dailyData.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase mb-3">5-Day High / Low</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}°`} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="high" name="High" stroke="#f97316" strokeWidth={2} fill="url(#highGrad)" dot={{ fill: "#f97316", r: 3 }} />
              <Area type="monotone" dataKey="low" name="Low" stroke="#38bdf8" strokeWidth={2} fill="url(#lowGrad)" dot={{ fill: "#38bdf8", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
