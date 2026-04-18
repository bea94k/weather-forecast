import type { LocationOption } from "../types/weather";

export const DEFAULT_LOCATION: LocationOption = {
  id: "helsinki",
  name: "Helsinki",
  latitude: 60.1699,
  longitude: 24.9384,
  timezone: "Europe/Helsinki"
};

export const PRESET_LOCATIONS: LocationOption[] = [
  DEFAULT_LOCATION,
  {
    id: "london",
    name: "London",
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: "Europe/London"
  },
  {
    id: "new-york",
    name: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York"
  },
  {
    id: "tokyo",
    name: "Tokyo",
    latitude: 35.6764,
    longitude: 139.65,
    timezone: "Asia/Tokyo"
  }
];
