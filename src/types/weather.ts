export type TemperatureUnit = "celsius" | "fahrenheit";
export type ForecastView = "hourly" | "daily";

export interface LocationOption {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface OpenMeteoResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  weatherCode: number;
}

export interface DailyForecastPoint {
  time: string;
  minTemperature: number;
  maxTemperature: number;
  weatherCode: number;
}

export interface WeatherViewModel {
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
}
