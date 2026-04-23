import { useEffect, useState } from "react";
import type { LocationOption } from "../../../types/weather";
import { fetchLocationSuggestions } from "../../../services/openMeteoGeocodingClient";
import { LocationCombobox } from "./LocationCombobox";

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
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(
    null
  );

  const normalizedQuery = manualCityQuery.trim().toLowerCase();
  const isListboxOpen =
    isSuggestionsOpen && normalizedQuery.length >= MIN_QUERY_LENGTH;
  const activeSuggestion =
    activeSuggestionIndex !== null ? suggestions[activeSuggestionIndex] : null;
  const activeOptionId = activeSuggestion
    ? `location-option-${activeSuggestion.id}`
    : undefined;

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
        setActiveSuggestionIndex(null);
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

  function handleManualCitySubmit() {
    if (!normalizedQuery) {
      return;
    }

    const selectedSuggestion =
      activeSuggestionIndex !== null ? suggestions[activeSuggestionIndex] : suggestions[0];

    if (selectedSuggestion) {
      onLocationSelect(selectedSuggestion);
      setManualCityQuery(selectedSuggestion.name);
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(null);
    }
  }

  function handleSuggestionSelect(location: LocationOption) {
    onLocationSelect(location);
    setManualCityQuery(location.name);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(null);
  }

  function handleInputChange(nextQuery: string) {
    setManualCityQuery(nextQuery);

    if (nextQuery.trim().toLowerCase().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestionsError(null);
      setIsLoadingSuggestions(false);
      setActiveSuggestionIndex(null);
    } else {
      setIsLoadingSuggestions(true);
      setSuggestionsError(null);
    }

    setIsSuggestionsOpen(true);
  }

  function handleCloseSuggestions() {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(null);
  }

  function handleClearInput() {
    setManualCityQuery("");
    setSuggestions([]);
    setSuggestionsError(null);
    setIsLoadingSuggestions(false);
    setActiveSuggestionIndex(null);
  }

  return (
    <LocationCombobox
      query={manualCityQuery}
      normalizedQuery={normalizedQuery}
      suggestions={suggestions}
      isLoadingSuggestions={isLoadingSuggestions}
      suggestionsError={suggestionsError}
      isListboxOpen={isListboxOpen}
      activeSuggestionIndex={activeSuggestionIndex}
      activeOptionId={activeOptionId}
      minQueryLength={MIN_QUERY_LENGTH}
      onQueryChange={handleInputChange}
      onOpen={() => setIsSuggestionsOpen(true)}
      onClose={handleCloseSuggestions}
      onClear={handleClearInput}
      onActiveSuggestionIndexChange={setActiveSuggestionIndex}
      onSuggestionSelect={handleSuggestionSelect}
      onSubmit={handleManualCitySubmit}
    />
  );
}
