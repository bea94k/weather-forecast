import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { WeatherViewModel } from "./types/weather";
import { fetchWeather } from "./services/openMeteoClient";
import { fetchLocationSuggestions } from "./services/openMeteoGeocodingClient";

vi.mock("./services/openMeteoClient", () => ({
  fetchWeather: vi.fn()
}));
vi.mock("./services/openMeteoGeocodingClient", () => ({
  fetchLocationSuggestions: vi.fn()
}));

const mockFetchWeather = vi.mocked(fetchWeather);
const mockFetchLocationSuggestions = vi.mocked(fetchLocationSuggestions);

const mockWeather: WeatherViewModel = {
  timezone: "Europe/Helsinki",
  current: {
    time: "2026-04-21T12:00",
    temperature: 12,
    feelsLike: 10,
    humidity: 60,
    windSpeed: 15,
    weatherCode: 1
  },
  hourly: [
    { time: "2026-04-21T12:00", temperature: 12, weatherCode: 1 },
    { time: "2026-04-21T13:00", temperature: 13, weatherCode: 2 }
  ],
  daily: [
    { time: "2026-04-21", minTemperature: 7, maxTemperature: 13, weatherCode: 1 },
    { time: "2026-04-22", minTemperature: 8, maxTemperature: 14, weatherCode: 2 }
  ]
};

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchLocationSuggestions.mockResolvedValue([]);
  });
  afterEach(() => {
    cleanup();
  });

  it("renders loading and then success state", async () => {
    mockFetchWeather.mockResolvedValueOnce(mockWeather);
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading latest weather data...");
    expect(await screen.findByRole("heading", { name: "Helsinki" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next 12 hours" })).toBeInTheDocument();
  });

  it("renders error state when weather fetch fails", async () => {
    mockFetchWeather.mockRejectedValueOnce(new Error("Service down"));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load weather data. Service down"
    );
  });

  it("updates data when temperature unit changes", async () => {
    mockFetchWeather.mockResolvedValue(mockWeather);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Helsinki" });

    const unitGroup = screen.getByRole("group", { name: "Temperature unit" });
    await user.click(within(unitGroup).getByRole("button", { name: "F" }));

    await waitFor(() => {
      expect(mockFetchWeather).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "helsinki" }),
        "fahrenheit"
      );
    });
  });

  it("switches forecast view to daily", async () => {
    mockFetchWeather.mockResolvedValue(mockWeather);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Helsinki" });

    await user.click(screen.getByRole("button", { name: "Daily" }));
    expect(await screen.findByRole("heading", { name: "Next 7 days" })).toBeInTheDocument();
  });

  it("refetches when selecting another location from search", async () => {
    mockFetchWeather.mockResolvedValue(mockWeather);
    mockFetchLocationSuggestions.mockResolvedValue([
      {
        id: "geocode-2643743",
        name: "London, England, United Kingdom",
        latitude: 51.5085,
        longitude: -0.1257,
        timezone: "Europe/London"
      }
    ]);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Helsinki" });

    const locationForm = screen.getByLabelText("Start typing to see suggestions").closest("form");
    expect(locationForm).not.toBeNull();

    await user.type(screen.getByLabelText("Start typing to see suggestions"), "London");
    await screen.findByRole("option", {
      name: "London, England, United Kingdom"
    });
    await user.click(within(locationForm!).getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(mockFetchWeather).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "geocode-2643743" }),
        "celsius"
      );
    });
  });

  it("refetches when selecting a suggestion with keyboard enter", async () => {
    mockFetchWeather.mockResolvedValue(mockWeather);
    mockFetchLocationSuggestions.mockResolvedValue([
      {
        id: "geocode-5128581",
        name: "New York, New York, United States",
        latitude: 40.7143,
        longitude: -74.006,
        timezone: "America/New_York"
      }
    ]);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Helsinki" });

    const input = screen.getByLabelText("Start typing to see suggestions");
    await user.type(input, "Ne");
    await screen.findByRole("option", {
      name: "New York, New York, United States"
    });
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockFetchWeather).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "geocode-5128581" }),
        "celsius"
      );
    });
  });
});
