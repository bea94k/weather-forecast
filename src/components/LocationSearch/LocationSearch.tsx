import { useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import type { LocationOption } from "../../types/weather";
import styles from "./LocationSearch.module.scss";

interface LocationSearchProps {
  locations: LocationOption[];
  activeLocationId: string;
  onLocationSelect: (location: LocationOption) => void;
}

function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  const [latRaw, lonRaw] = input.split(",").map((value) => value.trim());
  if (!latRaw || !lonRaw) {
    return null;
  }

  const latitude = Number(latRaw);
  const longitude = Number(lonRaw);
  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function LocationSearch({
  locations,
  activeLocationId,
  onLocationSelect
}: LocationSearchProps) {
  const [searchText, setSearchText] = useState("");

  // memoization would be necessary when locations list grows long
  const matchedLocations = useMemo(
    () =>
      locations.filter((location) =>
        location.name.toLowerCase().includes(searchText.trim().toLowerCase())
      ),
    [locations, searchText]
  );

  function handleCoordinateSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseCoordinates(searchText);
    if (!parsed) {
      return;
    }

    onLocationSelect({
      id: `custom-${parsed.latitude}-${parsed.longitude}`,
      name: `Custom (${parsed.latitude.toFixed(2)}, ${parsed.longitude.toFixed(2)})`,
      timezone: "auto", // "auto" for API timezone detection; UI uses timezone returned in weather response
      ...parsed
    });
  }

  return (
    <section className={styles.searchSection}>
      <label htmlFor="location-search" className={styles.label}>
        Search city preset or type coordinates (lat,lon)
      </label>
      <form onSubmit={handleCoordinateSubmit} className={styles.form}>
        <input
          id="location-search"
          className={styles.input}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="e.g. London or 60.17,24.94"
        />
        <button type="submit" className={styles.submitButton}>
          Use coordinates
        </button>
      </form>

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
    </section>
  );
}
