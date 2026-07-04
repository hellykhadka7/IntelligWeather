import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Clock, X } from "lucide-react";
import { searchAPI, historyAPI } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

export default function SearchBar({ onCitySelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const ref = useRef(null);

  // Load history on mount
  useEffect(() => {
    historyAPI.getHistory()
      .then((res) => setHistory(res.data?.data || []))
      .catch(() => {});
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    searchAPI.searchCities(debouncedQuery)
      .then((res) => {
        setResults(res.data?.data || []);
        setShowDropdown(true);
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (city) => {
    setQuery(`${city.name}, ${city.country}`);
    setShowDropdown(false);
    setResults([]);
    onCitySelect(city);

    // Save to history (non-blocking)
    historyAPI.saveSearch({
      city: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    })
      .then(() => historyAPI.getHistory())
      .then((res) => setHistory(res.data?.data || []))
      .catch(() => {});
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      {/* Input */}
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
            searching ? "text-blue-400 animate-pulse" : "text-slate-400"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setShowDropdown(true);
          }}
          onFocus={() => (query.length >= 2 || history.length > 0) && setShowDropdown(true)}
          placeholder="Search any city worldwide..."
          className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition-all text-lg backdrop-blur-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (results.length > 0 || (history.length > 0 && !query)) && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50 shadow-2xl animate-slide-up">
          {/* Search Results */}
          {results.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-white/10">
                Search Results
              </div>
              {results.map((city, i) => (
                <button
                  key={`${city.lat}-${city.lon}-${i}`}
                  onClick={() => handleSelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-medium text-white text-sm">{city.name}</div>
                    <div className="text-slate-400 text-xs">{city.display}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Recent History (when no query) */}
          {!query && history.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-white/10 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Recent Searches
              </div>
              {history.slice(0, 5).map((item, i) => (
                <button
                  key={item._id || i}
                  onClick={() =>
                    handleSelect({
                      name: item.city,
                      country: item.country,
                      lat: item.lat,
                      lon: item.lon,
                      display: `${item.city}, ${item.country}`,
                    })
                  }
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="font-medium text-white text-sm">{item.city}</div>
                    <div className="text-slate-400 text-xs">{item.country}</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
