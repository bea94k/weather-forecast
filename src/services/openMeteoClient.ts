import type {
  LocationOption,
  OpenMeteoResponse,
  TemperatureUnit,
  WeatherViewModel
} from "../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const COMMON_PARAMS = {
  current:
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
  hourly: "temperature_2m,weather_code",
  daily: "weather_code,temperature_2m_max,temperature_2m_min",
  forecast_days: "7"
};

function buildUrl(location: LocationOption, unit: TemperatureUnit): URL {
  const url = new URL(BASE_URL);
  const temperature_unit = unit === "fahrenheit" ? "fahrenheit" : "celsius";

  const params = {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone,
    temperature_unit,
    ...COMMON_PARAMS
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

function assertValidResponse(data: unknown): asserts data is OpenMeteoResponse {
  // shallow check for the required fields
  if (
    !data ||
    typeof data !== "object" ||
    !("current" in data) ||
    !("hourly" in data) ||
    !("daily" in data)
  ) {
    throw new Error("Weather response is missing required fields.");
  }
}

function mapToViewModel(response: OpenMeteoResponse): WeatherViewModel {
  const hourlyPoints = response.hourly.time.slice(0, 12).map((time, index) => ({
    time,
    temperature: response.hourly.temperature_2m[index],
    weatherCode: response.hourly.weather_code[index]
  }));

  const dailyPoints = response.daily.time.slice(0, 7).map((time, index) => ({
    time,
    minTemperature: response.daily.temperature_2m_min[index],
    maxTemperature: response.daily.temperature_2m_max[index],
    weatherCode: response.daily.weather_code[index]
  }));

  return {
    current: {
      time: response.current.time,
      temperature: response.current.temperature_2m,
      feelsLike: response.current.apparent_temperature,
      humidity: response.current.relative_humidity_2m,
      windSpeed: response.current.wind_speed_10m,
      weatherCode: response.current.weather_code
    },
    hourly: hourlyPoints,
    daily: dailyPoints
  };
}

export async function fetchWeather(
  location: LocationOption,
  unit: TemperatureUnit
): Promise<WeatherViewModel> {
  const response = await fetch(buildUrl(location, unit));
  if (!response.ok) {
    throw new Error("Unable to fetch weather data.");
  }

  const data: unknown = await response.json();
  assertValidResponse(data);
  return mapToViewModel(data);
}
