const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    lat: {
      type: Number,
    },
    lon: {
      type: Number,
    },
    searched_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Index for fast recent lookups
SearchHistorySchema.index({ searched_at: -1 });
// Compound index to check for duplicates quickly
SearchHistorySchema.index({ city: 1, searched_at: -1 });

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
