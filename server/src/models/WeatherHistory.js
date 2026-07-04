const mongoose = require("mongoose");

/**
 * Stores per-city temperature history for ML predictions.
 * Replaces the original weather_data.json with a proper DB-backed store.
 * Rolling window: keeps last 20 readings per city.
 */
const WeatherHistorySchema = new mongoose.Schema(
  {
    city_key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "",
    },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    readings: [
      {
        timestamp: { type: Date, default: Date.now },
        temp: Number,
        feels_like: Number,
        humidity: Number,
        pressure: Number,
        wind_speed: Number,
        aqi: Number,
        precipitation: { type: Number, default: 0 },
      },
    ],
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

WeatherHistorySchema.index({ city_key: 1 });

module.exports = mongoose.model("WeatherHistory", WeatherHistorySchema);
