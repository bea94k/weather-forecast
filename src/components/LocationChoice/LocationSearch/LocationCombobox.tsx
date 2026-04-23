import { useEffect, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { LocationOption } from "../../../types/weather";
import styles from "./LocationSearch.module.scss";

interface LocationComboboxProps {
  query: string;
  normalizedQuery: string;
  suggestions: LocationOption[];
  isLoadingSuggestions: boolean;
  suggestionsError: string | null;
  isListboxOpen: boolean;
  activeSuggestionIndex: number | null;
  activeOptionId?: string;
  minQueryLength: number;
  onQueryChange: (nextQuery: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onClear: () => void;
  onActiveSuggestionIndexChange: (nextIndex: number | null) => void;
  onSuggestionSelect: (location: LocationOption) => void;
  onSubmit: () => void;
}

// separated html/aria and keyboard interaction from the main logic, for readability
// combobox following ARIA APG pattern https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
export function LocationCombobox({
  query,
  normalizedQuery,
  suggestions,
  isLoadingSuggestions,
  suggestionsError,
  isListboxOpen,
  activeSuggestionIndex,
  activeOptionId,
  minQueryLength,
  onQueryChange,
  onOpen,
  onClose,
  onClear,
  onActiveSuggestionIndexChange,
  onSuggestionSelect,
  onSubmit
}: LocationComboboxProps) {
  const optionRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const hasSuggestionResults =
    !isLoadingSuggestions && !suggestionsError && suggestions.length > 0;

  useEffect(() => {
    if (!activeOptionId) {
      return;
    }

    const activeOptionElement = optionRefs.current[activeOptionId];
    if (activeOptionElement && typeof activeOptionElement.scrollIntoView === "function") {
      activeOptionElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeOptionId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isListboxOpen) {
        if (suggestions.length > 0) {
          onOpen();
          onActiveSuggestionIndexChange(0);
        }
        return;
      }

      if (suggestions.length > 0) {
        const nextIndex =
          activeSuggestionIndex === null || activeSuggestionIndex === suggestions.length - 1
            ? 0
            : activeSuggestionIndex + 1;
        onActiveSuggestionIndexChange(nextIndex);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isListboxOpen) {
        if (suggestions.length > 0) {
          onOpen();
          onActiveSuggestionIndexChange(suggestions.length - 1);
        }
        return;
      }

      if (suggestions.length > 0) {
        const nextIndex =
          activeSuggestionIndex === null || activeSuggestionIndex === 0
            ? suggestions.length - 1
            : activeSuggestionIndex - 1;
        onActiveSuggestionIndexChange(nextIndex);
      }
      return;
    }

    if (event.key === "Enter" && isListboxOpen) {
      if (activeSuggestionIndex !== null) {
        event.preventDefault();
        onSuggestionSelect(suggestions[activeSuggestionIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      if (isListboxOpen) {
        onClose();
      } else {
        onClear();
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="manual-city-search" className={styles.fieldLabel}>
        Start typing to see suggestions
      </label>
      <div className={styles.inputGroup}>
        <input
          id="manual-city-search"
          className={styles.input}
          role="combobox"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={onOpen}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isListboxOpen}
          aria-controls="location-suggestion-list"
          aria-activedescendant={activeOptionId}
          onBlur={onClose}
        />
        {isListboxOpen && normalizedQuery.length >= minQueryLength && (
          <div className={styles.suggestionPanel}>
            <p className={hasSuggestionResults ? styles.visuallyHidden : styles.statusText} role="status">
              {isLoadingSuggestions && "Loading suggestions..."}
              {!isLoadingSuggestions && suggestionsError && suggestionsError}
              {!isLoadingSuggestions && !suggestionsError && suggestions.length === 0 && "No matches found."}
              {hasSuggestionResults && (
                `${suggestions.length} location suggestions available.`
              )}
            </p>
            {hasSuggestionResults && (
              <ul
                id="location-suggestion-list"
                className={styles.suggestionList}
                role="listbox"
                aria-label="Location suggestions"
              >
                {suggestions.map((location, index) => {
                  const optionId = `location-option-${location.id}`;
                  const isActive = index === activeSuggestionIndex;
                  return (
                    <li
                      key={location.id}
                      id={optionId}
                      ref={(element) => {
                        optionRefs.current[optionId] = element;
                      }}
                      role="option"
                      aria-selected={isActive}
                      className={`${styles.suggestionOption} ${isActive ? styles.activeOption : ""}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSuggestionSelect(location)}
                    >
                      {location.name}
                    </li>
                  );
                })}
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
