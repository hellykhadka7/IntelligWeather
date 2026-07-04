import { AlertTriangle, Heart, Shield } from "lucide-react";

const HEALTH_TIPS = {
  1: {
    icon: <Heart className="w-5 h-5 text-green-400" />,
    color: "green",
    do: ["Enjoy outdoor activities", "Go jogging or cycling", "Open windows for fresh air"],
    dont: ["No special precautions needed"],
  },
  2: {
    icon: <Shield className="w-5 h-5 text-yellow-400" />,
    color: "yellow",
    do: ["Outdoor activities are generally safe", "Normal exercise is fine for most"],
    dont: ["Children avoid intense outdoor exercise", "Elderly avoid strenuous activities"],
  },
  3: {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    color: "orange",
    do: ["Wear N95 mask outdoors", "Keep windows closed", "Use air purifiers"],
    dont: ["Children avoid outdoor play", "Elderly avoid outdoor exercise", "Avoid intense sports"],
  },
  4: {
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    color: "red",
    do: ["Stay indoors as much as possible", "Run air purifiers continuously", "Increase water intake"],
    dont: ["Avoid all outdoor activities", "Do not open windows", "Do not exercise outdoors"],
  },
  5: {
    icon: <AlertTriangle className="w-5 h-5 text-purple-400" />,
    color: "purple",
    do: ["STAY INDOORS — this is critical!", "Seal all windows and doors", "Seek medical help immediately for symptoms"],
    dont: ["DO NOT go outdoors", "DO NOT exercise outdoors", "DO NOT ignore health symptoms"],
  },
};

const colorMap = {
  green:  { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-300",  badge: "bg-green-400" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-300", badge: "bg-yellow-400" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-300", badge: "bg-orange-400" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-300",    badge: "bg-red-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-300", badge: "bg-purple-400" },
};

export default function HealthAdvisory({ aqiData, alerts }) {
  if (!aqiData) return null;

  const level = aqiData.aqi_level || 1;
  const tips = HEALTH_TIPS[level] || HEALTH_TIPS[1];
  const c = colorMap[tips.color];

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-white mb-4">Health Advisory</h3>

      {/* Level Indicator */}
      <div className={`p-4 rounded-xl ${c.bg} border ${c.border} mb-4`}>
        <div className="flex items-center gap-3 mb-3">
          {tips.icon}
          <div>
            <div className={`font-bold ${c.text}`}>{aqiData.aqi_label}</div>
            <div className="text-slate-400 text-xs">{aqiData.health_advisory}</div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* What to Do */}
        <div>
          <h4 className="text-green-400 text-xs font-semibold uppercase mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            What to Do
          </h4>
          <ul className="space-y-1">
            {tips.do.map((item, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What NOT to Do */}
        <div>
          <h4 className="text-red-400 text-xs font-semibold uppercase mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Avoid
          </h4>
          <ul className="space-y-1">
            {tips.dont.map((item, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-amber-400 text-xs font-semibold uppercase">Active Alerts</h4>
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-xs ${
                alert.severity === "high"
                  ? "bg-red-500/10 border border-red-500/20 text-red-300"
                  : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-semibold capitalize">{alert.type?.replace("_", " ")}</span>
              </div>
              <p>{alert.message}</p>
              {alert.affected_groups && (
                <p className="mt-1 text-slate-400">
                  Affects: {alert.affected_groups.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
