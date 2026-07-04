import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Wind } from "lucide-react";
import { getAQIHexColor } from "../../utils/helpers";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  const color = getAQIHexColor(value);
  return (
    <div className="glass-card p-3 text-xs border border-white/20">
      <p className="text-slate-400 mb-1">{label}</p>
      <p style={{ color }} className="font-semibold">AQI: {Math.round(value)}</p>
    </div>
  );
};

export default function AQIForecastChart({ components }) {
  if (!components) return null;

  const pollutantData = [
    { name: "PM2.5", value: components.pm2_5 || 0 },
    { name: "PM10",  value: components.pm10  || 0 },
    { name: "NO₂",   value: components.no2   || 0 },
    { name: "O₃",    value: components.o3    || 0 },
    { name: "SO₂",   value: components.so2   || 0 },
    { name: "CO",    value: components.co    || 0 },
    { name: "NO",    value: components.no    || 0 },
    { name: "NH₃",   value: components.nh3   || 0 },
  ];

  const maxVal = Math.max(...pollutantData.map((d) => d.value), 1);

  const COLORS = ["#ef4444", "#f97316", "#a855f7", "#3b82f6", "#eab308", "#6b7280", "#06b6d4", "#84cc16"];

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Wind className="w-5 h-5 text-purple-400" />
        Pollutant Concentrations
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={pollutantData} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxVal * 1.2]}
            tickFormatter={(v) => v.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {pollutantData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
