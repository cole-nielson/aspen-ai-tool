
import { useState, useEffect } from "react";

// Hook for using localStorage with React state
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });
  
  // Update localStorage when the state changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue] as const;
}
