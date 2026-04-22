import type { LocationOption } from "../types/weather";
import type {
  OpenMeteoGeocodingResponse,
  OpenMeteoGeocodingResult
} from "../types/geocoding";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface FetchLocationSuggestionsOptions {
  signal?: AbortSignal;
}

function buildGeocodingUrl(query: string): URL {
  const url = new URL(GEOCODING_BASE_URL);
  const trimmedQuery = query.trim();

  url.searchParams.set("name", trimmedQuery);

  return url;
}

function isGeocodingResult(data: unknown): data is OpenMeteoGeocodingResult {
  return (
    !!data &&
    typeof data === "object" &&
    "name" in data &&
    "latitude" in data &&
    "longitude" in data &&
    "timezone" in data
  );
}

function mapResultToLocation(result: OpenMeteoGeocodingResult): LocationOption {
  const details = [result.admin1, result.country].filter(Boolean).join(", ");
  const label = details ? `${result.name}, ${details}` : result.name;
  const stableId = typeof result.id === "number" ? String(result.id) : `${result.latitude},${result.longitude}`;

  return {
    id: `geocode-${stableId}`,
    name: label,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone
  };
}

export async function fetchLocationSuggestions(
  query: string,
  options: FetchLocationSuggestionsOptions = {}
): Promise<LocationOption[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const response = await fetch(buildGeocodingUrl(trimmedQuery), {
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error("Unable to fetch location suggestions.");
  }

  const data: unknown = await response.json();
  const geocodingResponse = data as OpenMeteoGeocodingResponse;
  const rawResults = geocodingResponse.results ?? [];

  return rawResults.filter(isGeocodingResult).map(mapResultToLocation);
}
