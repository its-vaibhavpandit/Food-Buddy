"use client";

import { useState, useEffect, useCallback } from "react";
import { Location, TickCircle, Gps } from "iconsax-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/checkout/location-picker";
import { useGeolocation } from "@/hooks/use-geolocation";

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationConfirmed?: (location: {
    city: string;
    address: string;
    lat?: number;
    lng?: number;
  }) => void;
}

export function LocationModal({ open, onOpenChange, onLocationConfirmed }: LocationModalProps) {
  const [selectedAddress, setSelectedAddress] = useState<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    lat?: number;
    lng?: number;
  } | null>(null);

  const { getLocation, loading: geoLoading, error: geoError, address: geoAddress } = useGeolocation();
  const [locating, setLocating] = useState(false);

  const handleLocationPicked = (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    lat?: number;
    lng?: number;
  }) => {
    setSelectedAddress(address);
  };

  const saveAndConfirm = useCallback(
    (city: string, fullAddress: string, lat?: number, lng?: number) => {
      const finalCity = city || "My Location";
      localStorage.setItem("selectedCity", finalCity);
      localStorage.setItem("selectedAddress", fullAddress);
      if (lat && lng) {
        localStorage.setItem("userCoords", JSON.stringify({ lat, lng }));
      }

      // Trigger window event so other components update instantly
      window.dispatchEvent(new Event("location-changed"));

      if (onLocationConfirmed) {
        onLocationConfirmed({
          city: finalCity,
          address: fullAddress,
          lat,
          lng,
        });
      }
      onOpenChange(false);
    },
    [onLocationConfirmed, onOpenChange]
  );

  const handleUseGps = async () => {
    setLocating(true);
    try {
      await getLocation();
    } catch {
      // Handled in state
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (geoAddress) {
      const city = geoAddress.city || "Nearby";
      const fullAddr = `${geoAddress.street}, ${city}, ${geoAddress.state}`;
      saveAndConfirm(city, fullAddr);
    }
  }, [geoAddress, saveAndConfirm]);

  const handleConfirm = () => {
    if (!selectedAddress) return;
    const city = selectedAddress.city || "Nearby";
    const fullAddr = `${selectedAddress.street}, ${city}, ${selectedAddress.state} - ${selectedAddress.zipCode}`;
    saveAndConfirm(city, fullAddr, selectedAddress.lat, selectedAddress.lng);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-[var(--color-card-bg)] border-[var(--color-border-val)] rounded-3xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-flame-500">
            <Location size={24} variant="Bold" />
            <DialogTitle className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Choose Your Delivery Location
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[var(--color-text-secondary)]">
            Drag the pin on the map or detect your current GPS location to see food options near you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Quick GPS Location Button */}
          <Button
            type="button"
            onClick={handleUseGps}
            disabled={locating || geoLoading}
            className="w-full bg-flame-500/10 hover:bg-flame-500/20 text-flame-600 border border-flame-200/60 rounded-2xl h-12 text-xs font-bold gap-2 justify-center transition-all cursor-pointer"
          >
            <Gps size={18} className={locating || geoLoading ? "animate-spin" : ""} />
            {locating || geoLoading ? "Detecting GPS Location..." : "Use My Current GPS Location"}
          </Button>

          {geoError && (
            <p className="text-[11px] text-destructive text-center font-medium">{geoError}</p>
          )}

          {/* Interactive Map Picker */}
          <div className="rounded-2xl overflow-hidden border border-[var(--color-border-val)]/60">
            <LocationPicker onLocationSelect={handleLocationPicked} />
          </div>
        </div>

        {/* Selected Address Preview & Confirmation */}
        <div className="pt-3 border-t border-[var(--color-border-val)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
              Selected Spot
            </p>
            <p className="text-xs font-bold text-[var(--color-text-primary)] truncate max-w-[280px]">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}`
                : "Click on map to select spot"}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedAddress}
            className="w-full sm:w-auto bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-10 text-xs font-bold px-6 gap-2 shadow-md shadow-flame-500/20"
          >
            <TickCircle size={16} variant="Bold" />
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
