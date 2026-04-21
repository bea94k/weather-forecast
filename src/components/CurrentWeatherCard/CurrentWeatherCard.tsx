import type { CurrentWeather, LocationOption } from "../../types/weather";
import { formatDay, formatTemperature, weatherCodeToLabel } from "../../utils/formatters";
import styles from "./CurrentWeatherCard.module.scss";

interface CurrentWeatherCardProps {
  location: LocationOption;
  timezone: string;
  current: CurrentWeather;
  unitSymbol: "C" | "F";
}

export function CurrentWeatherCard({
  location,
  timezone,
  current,
  unitSymbol
}: CurrentWeatherCardProps) {
  return (
    <section className={styles.card}>
      <h2>{location.name}</h2>
      <p className={styles.time}>{formatDay(current.time, timezone)}</p>
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
