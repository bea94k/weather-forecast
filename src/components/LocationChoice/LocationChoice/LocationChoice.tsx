import { useState } from "react";
import type { LocationOption } from "../../../types/weather";
import { LocationModeToggle } from "../LocationModeToggle/LocationModeToggle";
import { LocationMapPicker } from "../LocationMapPicker/LocationMapPicker";
import { LocationSearch } from "../LocationSearch/LocationSearch";
import styles from "./LocationChoice.module.scss";

interface LocationChoiceProps {
  onLocationSelect: (location: LocationOption) => void;
}

type LocationInputMode = "search" | "map";

export function LocationChoice({ onLocationSelect }: LocationChoiceProps) {
  const [inputMode, setInputMode] = useState<LocationInputMode>("search");

  return (
    <section className={styles.searchSection}>
      <div className={styles.group}>
        <p className={styles.label}>Location</p>
        <LocationModeToggle value={inputMode} onChange={setInputMode} />

        {inputMode === "search" && (
          <LocationSearch onLocationSelect={onLocationSelect} />
        )}

        {inputMode === "map" && (
          <LocationMapPicker onLocationSelect={onLocationSelect} />
        )}
      </div>
    </section>
  );
}
