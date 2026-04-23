import type { CurrentWeather, LocationOption } from "../../types/weather";
import {
  formatDay,
  formatHour,
  formatTemperature,
  weatherCodeToIcon,
  weatherCodeToLabel
} from "../../utils/formatters";
import styles from "./CurrentWeatherCard.module.scss";

interface CurrentWeatherCardProps {
  location: LocationOption;
  current: CurrentWeather;
  unitSymbol: "C" | "F";
}

export function CurrentWeatherCard({
  location,
  current,
  unitSymbol
}: CurrentWeatherCardProps) {
  const conditionIcon = weatherCodeToIcon(current.weatherCode);

  return (
    <section className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.locationMeta}>
          <h2>{location.name}</h2>
          <p className={styles.time}>
            {formatDay(current.time)} at {formatHour(current.time)}
          </p>
        </div>
        {conditionIcon && (
          <span aria-hidden="true" className={styles.topRightIcon}>
            {conditionIcon}
          </span>
        )}
      </div>
      <p className={styles.temperature}>{formatTemperature(current.temperature, unitSymbol)}</p>
      <p className={styles.description}>{weatherCodeToLabel(current.weatherCode)}</p>
      <dl className={styles.stats}>
        <div>
          <dt>Feels like</dt>
          <dd>{formatTemperature(current.feelsLike, unitSymbol)}</dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{Math.round(current.windSpeed)} km/h</dd>
        </div>
      </dl>
    </section>
  );
}
