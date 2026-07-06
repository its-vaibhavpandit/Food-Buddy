"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Location, InfoCircle, RouteSquare } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

// Store coordinate: Ghazipur center
const STORE_COORDS = { lat: 25.5788, lng: 83.5780 };

export function LocationPicker({ onLocationSelect, defaultCoordinates }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  const [addressDetails, setAddressDetails] = useState<string | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const storeMarkerInstanceRef = useRef<any>(null);

  // Haversine formula to calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.suburb || addr.neighbourhood || "";
        const house = addr.house_number ? `${addr.house_number}, ` : "";
        const street = `${house}${road}`.trim() || "Picked Location";
        const city = addr.city || addr.town || addr.village || addr.county || "Ghazipur";
        const state = addr.state || "Uttar Pradesh";
        const zipCode = (addr.postcode || "").replace(/\s/g, "") || "233001";

        setAddressDetails(`${street}, ${city}, ${state} - ${zipCode}`);

        onLocationSelect({
          street,
          city,
          state,
          zipCode,
          lat,
          lng,
        });

        // Calculate distance from store
        const dist = calculateDistance(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
        setDistance(dist);
        // Estimate delivery time: 15 min base + 3 min per km
        setDeliveryTime(Math.round(15 + dist * 3));
      }
    } catch (error) {
      // Ignore geocoding errors silently
    } finally {
      setLoadingAddress(false);
    }
  }, [onLocationSelect]);

  useEffect(() => {
    // 1. Dynamically load Leaflet stylesheet & script
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

      const L = (window as any).L;
      if (!L) return;

      const startLat = defaultCoordinates?.lat || STORE_COORDS.lat;
      const startLng = defaultCoordinates?.lng || STORE_COORDS.lng;

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([startLat, startLng], 14);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Custom icon colors/styling via CSS/SVG
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

      // Add store marker
      storeMarkerInstanceRef.current = L.marker([STORE_COORDS.lat, STORE_COORDS.lng], { icon: storeIcon })
        .addTo(map)
        .bindPopup("<strong>Fast Food Buddy Kitchen</strong><br/>Your delicious orders prepare here!")
        .openPopup();

      // Add user/delivery marker (draggable)
      markerInstanceRef.current = L.marker([startLat, startLng], { icon: userIcon, draggable: true }).addTo(map);

      // Marker dragend listener
      markerInstanceRef.current.on("dragend", () => {
        const position = markerInstanceRef.current.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });

      // Map click listener (moves marker)
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        markerInstanceRef.current.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      setMapLoaded(true);
      reverseGeocode(startLat, startLng);
    };

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
      // Map cleanup if required
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [defaultCoordinates, reverseGeocode]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          markerInstanceRef.current.setLatLng([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        }
      },
      (err) => {
        // Ignore location errors
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <Card className="overflow-hidden border border-border/60 shadow-md rounded-2xl bg-white">
      {/* Map Header */}
      <div className="p-4 bg-cream-50/40 border-b border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <RouteSquare size={20} className="text-flame-500" />
          <div>
            <h3 className="font-bold text-sm text-foreground">Interactive Location Picker</h3>
            <p className="text-[10px] text-muted-foreground">Drag the pin or click on the map to set delivery spot.</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          className="rounded-xl border-flame-200 text-flame-600 hover:bg-flame-50 text-xs font-semibold h-9 shrink-0 gap-1.5"
        >
          <Location size={14} variant="Bold" />
          Locate Me
        </Button>
      </div>

      {/* Map Body */}
      <div ref={mapContainerRef} className="h-64 sm:h-80 w-full relative bg-cream-100/30">
        {!mapLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cream-50/20 backdrop-blur-xs z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
            <span className="text-xs text-muted-foreground font-semibold">Loading Map Engine...</span>
          </div>
        )}
      </div>

      {/* Distance and delivery stats */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {addressDetails && (
          <div className="flex gap-2 items-start bg-cream-50/30 border border-cream-100 p-3 rounded-xl">
            <InfoCircle size={16} className="text-flame-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Selected Location Address</span>
              <p className="text-xs text-foreground font-medium leading-relaxed truncate-2-lines">
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
              <span className="text-[9px] font-bold text-emerald-700/80 uppercase block mb-0.5">Estimated Time</span>
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
