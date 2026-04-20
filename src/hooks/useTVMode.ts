import { useState, useEffect } from "react";

export const useTVMode = () => {
  const [tvModeEnabled, setTvModeEnabled] = useState(() => {
    const saved = localStorage.getItem("tvModeEnabled");
    // Default to true if not set
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("tvModeEnabled");
      setTvModeEnabled(saved === null ? true : saved === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    window.addEventListener("tvModeChanged", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tvModeChanged", handleStorageChange);
    };
  }, []);

  return { tvModeEnabled };
};

// Helper to update TV mode and dispatch event
export const setTVMode = (enabled: boolean) => {
  localStorage.setItem("tvModeEnabled", enabled.toString());
  window.dispatchEvent(new Event("tvModeChanged"));
};
