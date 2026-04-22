import { useState } from "react";
import type { FormEvent } from "react";
import type { LocationOption } from "../../types/weather";
import { LocationInputModeToggle } from "./LocationInputModeToggle";
import { LocationMapPicker } from "./LocationMapPicker";
import styles from "./LocationSearch.module.scss";

interface LocationSearchProps {
  locations: LocationOption[];
  activeLocationId: string;
  onLocationSelect: (location: LocationOption) => void;
}

type LocationInputMode = "search" | "map";

export function LocationSearch({
  locations,
  activeLocationId,
  onLocationSelect
}: LocationSearchProps) {
  const [manualCityQuery, setManualCityQuery] = useState("");
  const [inputMode, setInputMode] = useState<LocationInputMode>("search");

  function handleManualCitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Placeholder only; manual city search logic is intentionally not implemented yet.
  }

  return (
    <section className={styles.searchSection}>
      <p className={styles.label}>Popular</p>
      <div className={styles.buttons}>
        {locations.map((location) => (
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

      <p className={styles.label}>Choose location input mode</p>
      <LocationInputModeToggle value={inputMode} onChange={setInputMode} />

      {inputMode === "search" && (
        <form onSubmit={handleManualCitySubmit} className={styles.form}>
          <label htmlFor="manual-city-search" className={styles.visuallyHidden}>
            Search for a city
          </label>
          <input
            id="manual-city-search"
            className={styles.input}
            value={manualCityQuery}
            onChange={(event) => setManualCityQuery(event.target.value)}
            placeholder="Type city name"
          />
          <button type="submit" className={styles.submitButton}>
            Search
          </button>
        </form>
      )}

      {inputMode === "map" && (
        <LocationMapPicker onLocationSelect={onLocationSelect} />
      )}
    </section>
  );
}
