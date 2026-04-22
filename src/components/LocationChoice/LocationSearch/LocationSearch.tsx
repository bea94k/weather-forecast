import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { LocationOption } from "../../../types/weather";
import { fetchLocationSuggestions } from "../../../services/openMeteoGeocodingClient";
import styles from "./LocationSearch.module.scss";

interface LocationSearchProps {
  onLocationSelect: (location: LocationOption) => void;
}

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 500;

export function LocationSearch({
  onLocationSelect
}: LocationSearchProps) {
  const [manualCityQuery, setManualCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const normalizedQuery = manualCityQuery.trim().toLowerCase();
  useEffect(() => {
    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    const abortController = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const nextSuggestions = await fetchLocationSuggestions(normalizedQuery, {
          signal: abortController.signal
        });
        setSuggestions(nextSuggestions);
      } catch (error) {
        // Ignore cancellation errors to avoid flashing an error while typing.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSuggestions([]);
        setSuggestionsError("Could not load location suggestions.");
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      // abort old query when user keeps typing
      abortController.abort();
    };
  }, [normalizedQuery]);

  function handleManualCitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedQuery) {
      return;
    }

    const [firstSuggestion] = suggestions;

    if (firstSuggestion) {
      onLocationSelect(firstSuggestion);
      setManualCityQuery(firstSuggestion.name);
      setIsSuggestionsOpen(false);
    }
  }

  function handleSuggestionSelect(location: LocationOption) {
    onLocationSelect(location);
    setManualCityQuery(location.name); // re-runs the geocoding, but also fills the input with the chosen option
    setIsSuggestionsOpen(false);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsSuggestionsOpen(false);
    }
  }

  function handleInputChange(nextQuery: string) {
    setManualCityQuery(nextQuery);

    if (nextQuery.trim().toLowerCase().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestionsError(null);
      setIsLoadingSuggestions(false);
    } else {
      setIsLoadingSuggestions(true);
      setSuggestionsError(null);
    }

    setIsSuggestionsOpen(true);
  }

  return (
    <form onSubmit={handleManualCitySubmit} className={styles.form}>
      <label htmlFor="manual-city-search" className={styles.visuallyHidden}>
        Search for a city
      </label>
      <div className={styles.inputGroup}>
        <input
          id="manual-city-search"
          className={styles.input}
          value={manualCityQuery}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setIsSuggestionsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type city name"
          autoComplete="off"
          aria-expanded={isSuggestionsOpen}
          aria-controls="location-suggestion-list"
        />
        {isSuggestionsOpen && normalizedQuery.length >= MIN_QUERY_LENGTH && (
          <div id="location-suggestion-list" className={styles.suggestionPanel}>
            {isLoadingSuggestions && <p className={styles.statusText}>Loading suggestions...</p>}
            {!isLoadingSuggestions && suggestionsError && (
              <p className={styles.statusText}>{suggestionsError}</p>
            )}
            {!isLoadingSuggestions && !suggestionsError && suggestions.length === 0 && (
              <p className={styles.statusText}>No matches found.</p>
            )}
            {!isLoadingSuggestions && !suggestionsError && suggestions.length > 0 && (
              <ul className={styles.suggestionList}>
                {suggestions.map((location) => (
                  <li key={location.id}>
                    <button
                      type="button"
                      className={styles.suggestionButton}
                      onClick={() => handleSuggestionSelect(location)}
                    >
                      {location.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <button type="submit" className={styles.submitButton}>
        Search
      </button>
    </form>
  );
}
