import type {
  DailyForecastPoint,
  ForecastView,
  HourlyForecastPoint
} from "../../types/weather";
import {
  formatDay,
  formatHour,
  formatTemperature,
  weatherCodeToIcon,
  weatherCodeToLabel
} from "../../utils/formatters";
import styles from "./ForecastList.module.scss";

interface ForecastListProps {
  view: ForecastView;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  unitSymbol: "C" | "F";
}

export function ForecastList({
  view,
  hourly,
  daily,
  unitSymbol
}: ForecastListProps) {
  const items =
    view === "hourly"
      ? hourly.map((point) => ({
          key: point.time,
          label: formatHour(point.time),
          temperatureText: formatTemperature(point.temperature, unitSymbol),
          conditionIcon: weatherCodeToIcon(point.weatherCode),
          conditionText: weatherCodeToLabel(point.weatherCode)
        }))
      : daily.map((point) => ({
          key: point.time,
          label: formatDay(point.time),
          temperatureText: `${formatTemperature(point.minTemperature, unitSymbol)} - ${formatTemperature(point.maxTemperature, unitSymbol)}`,
          conditionIcon: weatherCodeToIcon(point.weatherCode),
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
            <span className={styles.conditionWithIcon}>
              {item.conditionIcon && <span aria-hidden="true">{item.conditionIcon}</span>}
              <span>{item.conditionText}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
