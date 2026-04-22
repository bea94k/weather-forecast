import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngLiteral, LeafletMouseEvent } from "leaflet";
import type { LocationOption } from "../../types/weather";
import styles from "./LocationSearch.module.scss";

interface LocationSearchProps {
  locations: LocationOption[];
  activeLocationId: string;
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

export function LocationSearch({
  locations,
  activeLocationId,
  onLocationSelect
}: LocationSearchProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<LatLngLiteral | null>(null);

  // memoization would be necessary when locations list grows long
  const matchedLocations = useMemo(
    () =>
      locations.filter((location) =>
        location.name.toLowerCase().includes(searchText.trim().toLowerCase())
      ),
    [locations, searchText]
  );

  function handleMapPick(point: LatLngLiteral) {
    setSelectedPoint(point);
    const latitude = Number(point.lat.toFixed(4));
    const longitude = Number(point.lng.toFixed(4));

    onLocationSelect({
      id: `custom-${latitude}-${longitude}`,
      name: `Custom (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      timezone: "auto", // "auto" for API timezone detection; UI uses timezone returned in weather response
      latitude,
      longitude
    });
  }

  return (
    <section className={styles.searchSection}>
      <label htmlFor="location-search" className={styles.label}>
        Search city preset
      </label>
      <input
        id="location-search"
        className={styles.input}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="e.g. London"
      />
      <div className={styles.buttons}>
        {matchedLocations.map((location) => (
          <button
            key={location.id}
            type="button"
            className={location.id === activeLocationId ? styles.activeButton : styles.button}
            onClick={() => onLocationSelect(location)}
          >
            {location.name}
          </button>
        ))}
      </div>

      <p className={styles.label}>Or pick a location from the map</p>
      <MapContainer
        center={[60.1699, 24.9384]}
        zoom={5}
        scrollWheelZoom
        style={{ height: "16rem", width: "100%", marginTop: "0.5rem", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPickLocation={handleMapPick} />
        {selectedPoint && <Marker position={selectedPoint} />}
      </MapContainer>
    </section>
  );
}
