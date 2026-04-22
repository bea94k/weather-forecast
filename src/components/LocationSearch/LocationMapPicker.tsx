import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngLiteral, LeafletMouseEvent } from "leaflet";
import type { LocationOption } from "../../types/weather";
import styles from "./LocationMapPicker.module.scss";

interface LocationMapPickerProps {
  onLocationSelect: (location: LocationOption) => void;
}

interface MapClickHandlerProps {
  onPickLocation: (point: LatLngLiteral) => void;
}

function MapClickHandler({ onPickLocation }: MapClickHandlerProps) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPickLocation(event.latlng);
    }
  });

  return null;
}

export function LocationMapPicker({ onLocationSelect }: LocationMapPickerProps) {
  const [selectedPoint, setSelectedPoint] = useState<LatLngLiteral | null>(null);

  function handleMapPick(point: LatLngLiteral) {
    setSelectedPoint(point);
    const latitude = Number(point.lat.toFixed(4));
    const longitude = Number(point.lng.toFixed(4));

    onLocationSelect({
      id: `custom-${latitude}-${longitude}`,
      name: `Custom (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      timezone: "auto", // API resolves timezone from selected coordinates.
      latitude,
      longitude
    });
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer className={styles.map} center={[60.1699, 24.9384]} zoom={10} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPickLocation={handleMapPick} />
        {selectedPoint && <Marker position={selectedPoint} />}
      </MapContainer>
    </div>
  );
}
