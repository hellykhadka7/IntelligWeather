/**
 * Format Unix timestamp to a readable time string.
 */
export const formatTime = (unixTimestamp) => {
  return new Date(unixTimestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format ISO date string to a short weekday label (Mon, Tue, etc.)
 */
export const formatDay = (dateString) => {
  return new Date(dateString).toLocaleDateString([], { weekday: "short" });
};

/**
 * Format ISO datetime to "Mon 14:00" label for charts.
 */
export const formatChartTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Get the wind direction cardinal label from degrees.
 */
export const getWindDirection = (degrees) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
};

/**
 * Returns a Tailwind colour class based on AQI value (0–500 WAQI scale).
 */
export const getAQIColorClass = (value) => {
  if (value <= 50) return "text-green-400";
  if (value <= 100) return "text-yellow-300";
  if (value <= 150) return "text-orange-400";
  if (value <= 200) return "text-red-500";
  return "text-purple-400";
};

/**
 * Returns a hex colour for AQI value — used in inline styles and charts.
 */
export const getAQIHexColor = (value) => {
  if (value <= 50) return "#00e400";
  if (value <= 100) return "#ffff00";
  if (value <= 150) return "#ff7e00";
  if (value <= 200) return "#ff0000";
  return "#8f3f97";
};

/**
 * Capitalise the first letter of a string.
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

/**
 * Format a temperature value with degree symbol.
 */
export const formatTemp = (temp, unit = "°C") => `${Math.round(temp)}${unit}`;

/**
 * Get the confidence colour class for ML predictions.
 */
export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return "text-green-400";
  if (confidence >= 0.6) return "text-yellow-300";
  return "text-orange-400";
};
