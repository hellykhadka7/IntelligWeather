const POLLUTANTS = [
  { key: "pm2_5",  label: "PM2.5",  unit: "μg/m³", color: "#ef4444", description: "Fine particles" },
  { key: "pm10",   label: "PM10",   unit: "μg/m³", color: "#f97316", description: "Coarse particles" },
  { key: "no2",    label: "NO₂",   unit: "μg/m³", color: "#a855f7", description: "Nitrogen Dioxide" },
  { key: "o3",     label: "O₃",    unit: "μg/m³", color: "#3b82f6", description: "Ozone" },
  { key: "so2",    label: "SO₂",   unit: "μg/m³", color: "#eab308", description: "Sulfur Dioxide" },
  { key: "co",     label: "CO",    unit: "μg/m³", color: "#6b7280", description: "Carbon Monoxide" },
  { key: "no",     label: "NO",    unit: "μg/m³", color: "#06b6d4", description: "Nitric Oxide" },
  { key: "nh3",    label: "NH₃",   unit: "μg/m³", color: "#84cc16", description: "Ammonia" },
];

export default function PollutantGrid({ components }) {
  if (!components) return null;

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-white mb-4">Pollutant Breakdown</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {POLLUTANTS.map((p) => {
          const value = components[p.key] ?? 0;
          return (
            <div
              key={p.key}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover-card"
            >
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: p.color }}
              >
                {p.label}
              </div>
              <div className="text-white font-bold text-lg">{value.toFixed(1)}</div>
              <div className="text-slate-500 text-xs">{p.unit}</div>
              <div className="text-slate-400 text-xs mt-1">{p.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
