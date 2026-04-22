import styles from "./LocationModeToggle.module.scss";

type LocationInputMode = "search" | "map";

interface LocationModeToggleProps {
  value: LocationInputMode;
  onChange: (value: LocationInputMode) => void;
}

export function LocationModeToggle({ value, onChange }: LocationModeToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Location input mode">
      <button
        type="button"
        className={value === "search" ? styles.active : undefined}
        onClick={() => onChange("search")}
      >
        Search
      </button>
      <button
        type="button"
        className={value === "map" ? styles.active : undefined}
        onClick={() => onChange("map")}
      >
        Map
      </button>
    </div>
  );
}
