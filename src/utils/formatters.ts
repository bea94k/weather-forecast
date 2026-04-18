const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm"
};

export function weatherCodeToLabel(code: number): string {
  return WEATHER_LABELS[code] ?? "Unknown";
}

export function formatTemperature(value: number, unitSymbol: "C" | "F"): string {
  return `${Math.round(value)}°${unitSymbol}`;
}

export function formatHour(isoDate: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone
  }).format(new Date(isoDate));
}

export function formatDay(isoDate: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: timezone
  }).format(new Date(isoDate));
}
