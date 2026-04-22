import { useState } from "react";
import type { FormEvent } from "react";
import type { LocationOption } from "../../../types/weather";
import styles from "./LocationSearch.module.scss";

interface LocationSearchProps {
  locations: LocationOption[];
  onLocationSelect: (location: LocationOption) => void;
}

export function LocationSearch({
  locations,
  onLocationSelect
}: LocationSearchProps) {
  const [manualCityQuery, setManualCityQuery] = useState("");

  function handleManualCitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = manualCityQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return;
    }

    const matchedLocation = locations.find(
      (location) => location.name.toLowerCase() === normalizedQuery
    );

    if (matchedLocation) {
      onLocationSelect(matchedLocation);
    }
  }

  return (
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
        list="preset-city-options"
      />
      <datalist id="preset-city-options">
        {locations.map((location) => (
          <option key={location.id} value={location.name} />
        ))}
      </datalist>
      <button type="submit" className={styles.submitButton}>
        Search
      </button>
    </form>
  );
}
