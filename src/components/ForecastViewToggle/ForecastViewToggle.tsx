import type { ForecastView } from "../../types/weather";
import styles from "./ForecastViewToggle.module.scss";

interface ForecastViewToggleProps {
  value: ForecastView;
  onChange: (value: ForecastView) => void;
}

export function ForecastViewToggle({ value, onChange }: ForecastViewToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Forecast view">
      <button
        type="button"
        className={value === "hourly" ? styles.active : undefined}
        onClick={() => onChange("hourly")}
      >
        Hourly
      </button>
      <button
        type="button"
        className={value === "daily" ? styles.active : undefined}
        onClick={() => onChange("daily")}
      >
        Daily
      </button>
    </div>
  );
}
