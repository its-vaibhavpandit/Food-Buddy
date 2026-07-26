import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    address: null,
  });

  const getLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
        loading: false,
      }));
      return Promise.reject("Geolocation not supported");
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          setState((prev) => ({
            ...prev,
            latitude,
            longitude,
            accuracy,
            loading: true,
          }));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.address) {
                const addr = data.address;
                const road = addr.road || addr.suburb || addr.neighbourhood || "";
                const house = addr.house_number ? `${addr.house_number}, ` : "";
                const street = `${house}${road}`.trim() || "GPS Spot";
                const city = addr.city || addr.town || addr.village || addr.county || "Local Area";
                const stateName = addr.state || "Uttar Pradesh";
                const zipCode = (addr.postcode || "").replace(/\s/g, "");

                const addressObj = { street, city, state: stateName, zipCode };

                setState((prev) => ({
                  ...prev,
                  loading: false,
                  address: addressObj,
                }));
                resolve({ latitude, longitude });
                return;
              }
            }

            // Fallback if nominatim API fails or blocks
            setState((prev) => ({
              ...prev,
              loading: false,
              address: { street: "GPS Location", city: "Current Spot", state: "Local Area", zipCode: "" },
            }));
            resolve({ latitude, longitude });
          } catch {
            // Quiet fallback without breaking UI
            setState((prev) => ({
              ...prev,
              loading: false,
              address: { street: "GPS Location", city: "Current Spot", state: "Local Area", zipCode: "" },
            }));
            resolve({ latitude, longitude });
          }
        },
        (error) => {
          let msg = "Could not fetch GPS coordinates.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. Please allow access in browser settings or use the search bar.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            msg = "Location request timed out.";
          }
          setState((prev) => ({
            ...prev,
            error: msg,
            loading: false,
          }));
          reject(msg);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }, []);

  return { ...state, getLocation };
}
