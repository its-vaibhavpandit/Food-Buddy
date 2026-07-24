"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Location, InfoCircle, RouteSquare, SearchNormal1, Gps } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { api } from "@/lib/api";

interface LocationPickerProps {
  onLocationSelect: (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    lat?: number;
    lng?: number;
  }) => void;
  defaultCoordinates?: { lat: number; lng: number };
}

interface LeafletMarker {
  setLatLng: (coords: [number, number]) => void;
  getLatLng: () => { lat: number; lng: number };
  on: (event: string, fn: () => void) => void;
  bindPopup: (text: string) => void;
}

interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => void;
  invalidateSize: () => void;
  off: () => void;
  remove: () => void;
  on: (event: string, fn: (e: { latlng: { lat: number; lng: number } }) => void) => void;
}

// Store coordinate: Ghazipur center
const STORE_COORDS = { lat: 25.5788, lng: 83.5780 };

// Popular City & Campus Hotspots for Quick One-Tap Selection
const POPULAR_SPOTS = [
  { name: "LPU Campus, Phagwara", lat: 31.2536, lng: 75.7037, city: "Phagwara" },
  { name: "Model Town, Jalandhar", lat: 31.3090, lng: 75.5800, city: "Jalandhar" },
  { name: "BHU Lanka, Varanasi", lat: 25.2755, lng: 82.9995, city: "Varanasi" },
  { name: "Ghazipur City", lat: 25.5788, lng: 83.5780, city: "Ghazipur" },
  { name: "Connaught Place, Delhi", lat: 28.6315, lng: 77.2167, city: "Delhi" },
  { name: "Hazratganj, Lucknow", lat: 26.8467, lng: 80.9462, city: "Lucknow" },
  { name: "Sector 18, Noida", lat: 28.5708, lng: 77.3261, city: "Noida" },
];

export function LocationPicker({ onLocationSelect, defaultCoordinates }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  const [addressDetails, setAddressDetails] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerInstanceRef = useRef<LeafletMarker | null>(null);
  const storeMarkerInstanceRef = useRef<unknown>(null);

  // Calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const { data } = await api.get("/location/reverse", { params: { lat, lng } });
      const nominatimData = data?.data;
      if (nominatimData && nominatimData.address) {
        const addr = nominatimData.address;
        const road = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || "";
        const house = addr.house_number ? `${addr.house_number}, ` : "";
        const street = `${house}${road}`.trim() || "Main Street Road";
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "Ghazipur";
        const state = addr.state || "Uttar Pradesh";
        const zipCode = (addr.postcode || "").replace(/\s/g, "") || "233001";

        const fullFormatted = [street, city, state, zipCode].filter(Boolean).join(", ");
        setAddressDetails(fullFormatted);

        onLocationSelect({
          street,
          city,
          state,
          zipCode,
          lat,
          lng,
        });

        const dist = calculateDistance(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
        setDistance(dist);
        setDeliveryTime(Math.round(15 + dist * 3));
        return;
      }
      
      // Fallback details
      const fallbackStreet = "Main Market Road";
      const fallbackCity = "Ghazipur";
      setAddressDetails(`${fallbackStreet}, ${fallbackCity}, Uttar Pradesh - 233001`);
      onLocationSelect({ street: fallbackStreet, city: fallbackCity, state: "Uttar Pradesh", zipCode: "233001", lat, lng });
    } catch {
      const fallbackStreet = "Main Market Road";
      const fallbackCity = "Ghazipur";
      setAddressDetails(`${fallbackStreet}, ${fallbackCity}, Uttar Pradesh - 233001`);
      onLocationSelect({ street: fallbackStreet, city: fallbackCity, state: "Uttar Pradesh", zipCode: "233001", lat, lng });
    } finally {
      setLoadingAddress(false);
    }
  }, [onLocationSelect]);

  // Center Map & Marker helper
  const moveToLocation = useCallback((lat: number, lng: number, zoom = 15) => {
    try {
      if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], zoom);
        markerInstanceRef.current.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
        setTimeout(() => {
          try {
            mapInstanceRef.current?.invalidateSize();
          } catch {
            /* ignore */
          }
        }, 200);
      }
    } catch {
      /* ignore */
    }
  }, [reverseGeocode]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  // Live Location Search API call
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get("/location/search", { params: { q: searchQuery } });
        if (data?.data && Array.isArray(data.data)) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const linkId = "leaflet-css";
    const scriptId = "leaflet-js";

    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L) return;

      const startLat = defaultCoordinates?.lat || STORE_COORDS.lat;
      const startLng = defaultCoordinates?.lng || STORE_COORDS.lng;

      try {
        const map = L.map(mapContainerRef.current).setView([startLat, startLng], 14);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const storeIcon = L.divIcon({
          className: "bg-flame-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-[10px]",
          html: "🏠",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const userIcon = L.divIcon({
          className: "bg-emerald-600 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-[12px]",
          html: "📍",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        storeMarkerInstanceRef.current = L.marker([STORE_COORDS.lat, STORE_COORDS.lng], { icon: storeIcon })
          .addTo(map)
          .bindPopup("<strong>Fast Food Buddy Central Kitchen</strong>");

        markerInstanceRef.current = L.marker([startLat, startLng], { icon: userIcon, draggable: true }).addTo(map);

        markerInstanceRef.current?.on("dragend", () => {
          try {
            const position = markerInstanceRef.current?.getLatLng();
            if (position) reverseGeocode(position.lat, position.lng);
          } catch {
            /* ignore */
          }
        });

        map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
          try {
            const { lat, lng } = e.latlng;
            markerInstanceRef.current?.setLatLng([lat, lng]);
            reverseGeocode(lat, lng);
          } catch {
            /* ignore */
          }
        });

        setMapLoaded(true);
        reverseGeocode(startLat, startLng);

        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch {
            /* ignore */
          }
        }, 300);
      } catch {
        setMapLoaded(true);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch {
        mapInstanceRef.current = null;
      }
    };
  }, [defaultCoordinates, reverseGeocode]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        moveToLocation(latitude, longitude, 15);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  const handleSelectSuggestion = (item: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchQuery(item.display_name);
    setShowSuggestions(false);
    moveToLocation(lat, lng, 15);
  };

  return (
    <Card className="overflow-hidden border border-[var(--color-border-val)]/60 shadow-md rounded-2xl bg-[var(--color-card-bg)]">
      {/* Search Header */}
      <div className="p-4 bg-[var(--color-bg)] border-b border-[var(--color-border-val)]/50 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <RouteSquare size={20} className="text-flame-500" />
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Map Location Search</h3>
              <p className="text-[10px] text-[var(--color-text-secondary)]">Search any city, campus, or area or tap popular spots.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            className="rounded-xl border-flame-200 text-flame-600 hover:bg-flame-50 text-xs font-semibold h-9 shrink-0 gap-1.5"
          >
            <Gps size={14} className="text-flame-500" />
            Detect GPS
          </Button>
        </div>

        {/* Live Search Input & Autocomplete Dropdown */}
        <div className="relative">
          <div className="relative">
            <SearchNormal1 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              type="text"
              placeholder="Search address e.g. LPU Phagwara, Varanasi, CP Delhi..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-9 h-10 rounded-xl text-xs bg-[var(--color-card-bg)] border-[var(--color-border-val)]"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-flame-500 border-t-transparent" />
            )}
          </div>

          {/* Autocomplete suggestions popup */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[var(--color-card-bg)] border border-[var(--color-border-val)] rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-[var(--color-border-val)]/40">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2.5 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] flex items-start gap-2 transition-colors"
                >
                  <Location size={14} className="text-flame-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Hotspot Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase shrink-0 mr-1">Hotspots:</span>
          {POPULAR_SPOTS.map((spot) => (
            <button
              key={spot.name}
              type="button"
              onClick={() => moveToLocation(spot.lat, spot.lng, 15)}
              className="bg-[var(--color-surface)] hover:bg-flame-500 hover:text-white text-[var(--color-text-secondary)] font-semibold px-2.5 py-1 rounded-full border border-[var(--color-border-val)]/60 shrink-0 transition-all text-[11px]"
            >
              📍 {spot.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Body */}
      <div ref={mapContainerRef} className="h-64 sm:h-80 w-full relative bg-[var(--color-surface)] z-10">
        {!mapLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--color-bg)] backdrop-blur-xs z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold">Loading Map Engine...</span>
          </div>
        )}
      </div>

      {/* Distance and delivery stats */}
      <div className="p-4 border-t border-[var(--color-border-val)]/50 space-y-3">
        {addressDetails && (
          <div className="flex gap-2 items-start bg-[var(--color-bg)] border border-[var(--color-border-val)]/50 p-3 rounded-xl">
            <InfoCircle size={16} className="text-flame-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Selected Delivery Address</span>
              <p className="text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">
                {loadingAddress ? "Fetching Address details..." : addressDetails}
              </p>
            </div>
          </div>
        )}

        {distance !== null && deliveryTime !== null && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-flame-50/30 border border-flame-100/40 p-3 rounded-xl text-center">
              <span className="text-[9px] font-bold text-flame-700/80 uppercase block mb-0.5">Kitchen Distance</span>
              <span className="text-base font-extrabold text-flame-600">
                {distance.toFixed(1)} km
              </span>
            </div>
            <div className="bg-emerald-50/30 border border-emerald-100/40 p-3 rounded-xl text-center">
              <span className="text-[9px] font-bold text-emerald-700/80 uppercase block mb-0.5">Estimated Delivery</span>
              <span className="text-base font-extrabold text-emerald-600">
                {deliveryTime} mins
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
