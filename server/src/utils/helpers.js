/**
 * Haversine formula — distance between two lat/lon points in km.
 * Reused from original fetch_live_aqi.py _calculate_distance().
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

/**
 * Format Unix timestamp to human-readable local time string.
 */
const formatTime = (unixTimestamp, timezoneOffset = 0) => {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  return date.toISOString().replace("T", " ").slice(0, 16);
};

module.exports = { haversineDistance, formatTime };
