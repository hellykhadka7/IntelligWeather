import { useState, useEffect, useCallback } from "react";

/**
 * Debounce hook — delays updating the value until after `delay` ms
 * without the value changing. Used for search-as-you-type.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
