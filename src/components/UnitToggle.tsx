import type { TemperatureUnit } from "../types/weather";
import styles from "./UnitToggle.module.scss";

interface UnitToggleProps {
  value: TemperatureUnit;
  onChange: (value: TemperatureUnit) => void;
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Temperature unit">
      <button
        type="button"
        className={value === "celsius" ? styles.active : undefined}
        onClick={() => onChange("celsius")}
      >
        C
      </button>
      <button
        type="button"
        className={value === "fahrenheit" ? styles.active : undefined}
        onClick={() => onChange("fahrenheit")}
      >
        F
      </button>
    </div>
  );
}
