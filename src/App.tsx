import { useEffect, useState } from "react";
import { PRESET_LOCATIONS } from "./constants/locations";
import { fetchWeather } from "./services/openMeteoClient";
import type {
  ForecastView,
  LocationOption,
  TemperatureUnit,
  WeatherViewModel
} from "./types/weather";
import { CurrentWeatherCard } from "./components/CurrentWeatherCard/CurrentWeatherCard";
import { ErrorState } from "./components/ErrorState/ErrorState";
import { ForecastList } from "./components/ForecastList/ForecastList";
import { ForecastViewToggle } from "./components/ForecastViewToggle/ForecastViewToggle";
import { LoadingState } from "./components/LoadingState/LoadingState";
import { LocationChoice } from "./components/LocationChoice/LocationChoice/LocationChoice";
import { UnitToggle } from "./components/UnitToggle/UnitToggle";
import styles from "./App.module.scss";

const DEFAULT_LOCATION = PRESET_LOCATIONS[0];

export default function App() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationOption>(DEFAULT_LOCATION);
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");
  const [view, setView] = useState<ForecastView>("hourly");
  const [weather, setWeather] = useState<WeatherViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // prevent state updates after the effect is cleaned up, 
    // eg. component unmounts before fetch finishes
    let isCancelled = false;

    async function loadWeather() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const nextWeather = await fetchWeather(selectedLocation, unit);

        if (!isCancelled) {
          setWeather(nextWeather);
          if (selectedLocation.timezone !== nextWeather.timezone) {
            setSelectedLocation((previous) => ({
              ...previous,
              timezone: nextWeather.timezone
            }));
          }
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Unknown weather error.";
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWeather();
    return () => {
      isCancelled = true;
    };
  }, [selectedLocation, unit]);

  const unitSymbol = unit === "celsius" ? "C" : "F";

  return (
    <main className={styles.app}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <h1>Weather Forecast</h1>
          <p>Current conditions and short-term forecast by location.</p>
        </header>

        <LocationChoice
          locations={PRESET_LOCATIONS}
          activeLocationId={selectedLocation.id}
          onLocationSelect={setSelectedLocation}
        />

        <div className={styles.controls}>
          <UnitToggle value={unit} onChange={setUnit} />
          <ForecastViewToggle value={view} onChange={setView} />
        </div>

        {isLoading && <LoadingState />}
        {!isLoading && errorMessage && <ErrorState message={errorMessage} />}
        {!isLoading && !errorMessage && weather && (
          <section className={styles.content}>
            <CurrentWeatherCard
              location={selectedLocation}
              timezone={weather.timezone}
              current={weather.current}
              unitSymbol={unitSymbol}
            />
            <ForecastList
              timezone={weather.timezone}
              view={view}
              hourly={weather.hourly}
              daily={weather.daily}
              unitSymbol={unitSymbol}
            />
          </section>
        )}
      </section>
    </main>
  );
}
