import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWeather } from "./openMeteoClient";
import type { LocationOption } from "../types/weather";

const testLocation: LocationOption = {
  id: "test-location",
  name: "Test Location",
  latitude: 60.1699,
  longitude: 24.9384,
  timezone: "Europe/Helsinki"
};

const hourlyTimes = Array.from({ length: 13 }, (_, i) => `2026-04-21T${String(i).padStart(2, "0")}:00`);
const dailyTimes = Array.from({ length: 8 }, (_, i) => `2026-04-${String(21 + i).padStart(2, "0")}`);

const validApiResponse = {
  timezone: "Europe/Helsinki",
  current: {
    time: "2026-04-21T12:00",
    temperature_2m: 13.2,
    relative_humidity_2m: 58,
    apparent_temperature: 11.8,
    weather_code: 2,
    wind_speed_10m: 19.4
  },
  hourly: {
    time: hourlyTimes,
    temperature_2m: hourlyTimes.map((_, i) => i + 1),
    weather_code: hourlyTimes.map(() => 2)
  },
  daily: {
    time: dailyTimes,
    temperature_2m_max: dailyTimes.map((_, i) => 15 + i),
    temperature_2m_min: dailyTimes.map((_, i) => 8 + i),
    weather_code: dailyTimes.map(() => 3)
  }
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("fetchWeather", () => {
  it("maps API response into app view model", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(validApiResponse)
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchWeather(testLocation, "celsius");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.timezone).toBe("Europe/Helsinki");
    expect(result.current.temperature).toBe(13.2);
    expect(result.hourly).toHaveLength(12);
    expect(result.daily).toHaveLength(7);
    expect(result.hourly[0]).toEqual({
      time: hourlyTimes[0],
      temperature: 1,
      weatherCode: 2
    });
  });

  it("requests fahrenheit unit when selected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(validApiResponse)
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchWeather(testLocation, "fahrenheit");

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });

  it("requests hourly forecast limited to next 12 hours", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(validApiResponse)
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchWeather(testLocation, "celsius");

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("forecast_hours")).toBe("12");
  });

  it("throws a friendly error when request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn()
      })
    );

    await expect(fetchWeather(testLocation, "celsius")).rejects.toThrow(
      "Unable to fetch weather data."
    );
  });

  it("throws when required fields are missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ timezone: "Europe/Helsinki" })
      })
    );

    await expect(fetchWeather(testLocation, "celsius")).rejects.toThrow(
      "Weather response is missing required fields."
    );
  });
});
