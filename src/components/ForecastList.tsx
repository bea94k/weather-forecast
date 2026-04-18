import type {
  DailyForecastPoint,
  ForecastView,
  HourlyForecastPoint
} from "../types/weather";
import {
  formatDay,
  formatHour,
  formatTemperature,
  weatherCodeToLabel
} from "../utils/formatters";
import styles from "./ForecastList.module.scss";

interface ForecastListProps {
  timezone: string;
  view: ForecastView;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  unitSymbol: "C" | "F";
}

export function ForecastList({
  timezone,
  view,
  hourly,
  daily,
  unitSymbol
}: ForecastListProps) {
  const items =
    view === "hourly"
      ? hourly.map((point) => ({
          key: point.time,
          label: formatHour(point.time, timezone),
          temperatureText: formatTemperature(point.temperature, unitSymbol),
          conditionText: weatherCodeToLabel(point.weatherCode)
        }))
      : daily.map((point) => ({
          key: point.time,
          label: formatDay(point.time, timezone),
          temperatureText: `${formatTemperature(point.minTemperature, unitSymbol)} - ${formatTemperature(point.maxTemperature, unitSymbol)}`,
          conditionText: weatherCodeToLabel(point.weatherCode)
        }));

  return (
    <section className={styles.wrapper} aria-label={`${view} forecast`}>
      <h3>{view === "hourly" ? "Next 12 hours" : "Next 7 days"}</h3>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            <span>{item.label}</span>
            <strong>{item.temperatureText}</strong>
            <span>{item.conditionText}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
