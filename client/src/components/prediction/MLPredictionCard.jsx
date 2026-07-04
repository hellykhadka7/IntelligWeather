import { useState, useEffect } from "react";
import { mlAPI } from "../../services/api";
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import { getConfidenceColor } from "../../utils/helpers";

export default function MLPredictionCard({ city, lat, lon }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mlAvailable, setMlAvailable] = useState(true);

  const fetchPrediction = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const res = await mlAPI.predict({ city, lat, lon });
      setPrediction(res.data);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when city changes
  useEffect(() => {
    if (city) fetchPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const TrendIcon = ({ trend }) => {
    if (trend === "rising")  return <TrendingUp  className="w-5 h-5 text-orange-400" />;
    if (trend === "falling") return <TrendingDown className="w-5 h-5 text-blue-400"   />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const trendColor = (trend) =>
    trend === "rising" ? "text-orange-400" : trend === "falling" ? "text-blue-400" : "text-slate-400";

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          ML Temperature Prediction
        </h3>
        {city && !loading && (
          <button
            onClick={fetchPrediction}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh prediction"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* No city selected */}
      {!city && (
        <div className="text-center py-6 text-slate-500">
          <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Search a city to get ML temperature predictions</p>
        </div>
      )}

      {/* Loading */}
      {city && loading && (
        <div className="flex items-center justify-center gap-3 py-6">
          <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
          <span className="text-slate-400 text-sm">Running prediction model...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium mb-1">Prediction Unavailable</p>
              <p className="text-xs text-amber-400/80">{error}</p>
              {error.includes("historical data") && (
                <p className="text-xs text-amber-400/60 mt-1">
                  Tip: Search this city a few times to build historical data, then try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prediction Result */}
      {prediction && !loading && !error && (() => {
        const d = prediction.data;
        return (
          <div className="animate-fade-in">
            {/* Main prediction */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Predicted Tomorrow</p>
                <div className="text-5xl font-extrabold text-white">
                  {d.predicted_temperature}
                  <span className="text-2xl text-slate-400">°C</span>
                </div>
                <div className={`flex items-center gap-1.5 mt-1.5 text-sm font-medium ${trendColor(d.trend)}`}>
                  <TrendIcon trend={d.trend} />
                  <span className="capitalize">{d.trend}</span>
                </div>
              </div>

              {/* Confidence Gauge */}
              <div className="flex flex-col items-center gap-1">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={d.confidence >= 0.8 ? "#4ade80" : d.confidence >= 0.6 ? "#facc15" : "#fb923c"}
                      strokeWidth="3"
                      strokeDasharray={`${d.confidence * 100} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center rotate-0">
                    <span className={`text-xs font-bold ${getConfidenceColor(d.confidence)}`}>
                      {Math.round(d.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">Confidence</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="stat-badge">
                <span className="text-slate-400 text-xs mb-1">R² Score</span>
                <span className="text-white font-bold text-sm">{d.r2_score?.toFixed(3)}</span>
              </div>
              <div className="stat-badge">
                <span className="text-slate-400 text-xs mb-1">Data Points</span>
                <span className="text-white font-bold text-sm">{d.data_points_used}</span>
              </div>
              <div className="stat-badge">
                <span className="text-slate-400 text-xs mb-1">Std Dev</span>
                <span className="text-white font-bold text-sm">{d.temperature_std_dev}°</span>
              </div>
            </div>

            {/* Recent temps mini-chart */}
            {d.recent_temps && d.recent_temps.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Recent Readings Used</p>
                <div className="flex items-end gap-1 h-10">
                  {d.recent_temps.map((t, i) => {
                    const minT = Math.min(...d.recent_temps);
                    const maxT = Math.max(...d.recent_temps);
                    const range = maxT - minT || 1;
                    const height = ((t - minT) / range) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-purple-400/40 border-t border-purple-400/60 transition-all"
                        style={{ height: `${Math.max(height, 8)}%` }}
                        title={`${t}°C`}
                      />
                    );
                  })}
                  <div
                    className="flex-1 rounded-t border-t-2 border-dashed border-purple-300"
                    style={{ height: "50%" }}
                    title={`Predicted: ${d.predicted_temperature}°C`}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>Historical</span>
                  <span className="text-purple-400">→ Predicted</span>
                </div>
              </div>
            )}

            {/* Model info */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-slate-600">
              <Brain className="w-3 h-3" />
              <span>LinearRegression · scikit-learn · FastAPI</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
