import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLocationSuggestions } from "../../../services/openMeteoGeocodingClient";
import { LocationSearch } from "./LocationSearch";

vi.mock("../../../services/openMeteoGeocodingClient", () => ({
  fetchLocationSuggestions: vi.fn()
}));

const mockFetchLocationSuggestions = vi.mocked(fetchLocationSuggestions);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  mockFetchLocationSuggestions.mockResolvedValue([]);
});

describe("LocationSearch", () => {
  it("fetches suggestions when query has at least two chars", async () => {
    const user = userEvent.setup();
    render(<LocationSearch onLocationSelect={() => undefined} />);

    await user.type(screen.getByLabelText("Start typing to see suggestions"), "Paris");

    await waitFor(() => {
      expect(mockFetchLocationSuggestions).toHaveBeenCalledWith(
        "paris",
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      );
    });
  });

  it("allows selecting a returned suggestion", async () => {
    const user = userEvent.setup();
    const onLocationSelect = vi.fn();
    mockFetchLocationSuggestions.mockResolvedValue([
      {
        id: "geocode-2988507",
        name: "Paris, Ile-de-France, France",
        latitude: 48.8534,
        longitude: 2.3488,
        timezone: "Europe/Paris"
      }
    ]);

    render(<LocationSearch onLocationSelect={onLocationSelect} />);

    const input = screen.getByLabelText("Start typing to see suggestions");
    await user.type(input, "Pa");
    const suggestionOption = await screen.findByRole("option", {
      name: "Paris, Ile-de-France, France"
    });
    await user.click(suggestionOption);

    expect(onLocationSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "geocode-2988507"
      })
    );
  });

  it("uses first suggestion when submitting search", async () => {
    const user = userEvent.setup();
    const onLocationSelect = vi.fn();
    mockFetchLocationSuggestions.mockResolvedValue([
      {
        id: "geocode-2643743",
        name: "London, England, United Kingdom",
        latitude: 51.5085,
        longitude: -0.1257,
        timezone: "Europe/London"
      }
    ]);

    render(<LocationSearch onLocationSelect={onLocationSelect} />);

    const input = screen.getByLabelText("Start typing to see suggestions");
    await user.type(input, "Lo");
    await screen.findByRole("option", {
      name: "London, England, United Kingdom"
    });

    const form = input.closest("form");
    expect(form).not.toBeNull();
    await user.click(within(form!).getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(onLocationSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "geocode-2643743"
        })
      );
    });
  });

  it("supports arrow key navigation with active descendant", async () => {
    const user = userEvent.setup();
    mockFetchLocationSuggestions.mockResolvedValue([
      {
        id: "geocode-2643743",
        name: "London, England, United Kingdom",
        latitude: 51.5085,
        longitude: -0.1257,
        timezone: "Europe/London"
      },
      {
        id: "geocode-5128581",
        name: "New York, New York, United States",
        latitude: 40.7143,
        longitude: -74.006,
        timezone: "America/New_York"
      }
    ]);

    render(<LocationSearch onLocationSelect={() => undefined} />);

    const input = screen.getByLabelText("Start typing to see suggestions");
    await user.type(input, "Ne");
    await screen.findByRole("option", { name: "New York, New York, United States" });

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", "location-option-geocode-2643743");

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", "location-option-geocode-5128581");
  });

  it("shows empty-state feedback when there are no matches", async () => {
    const user = userEvent.setup();
    mockFetchLocationSuggestions.mockResolvedValue([]);

    render(<LocationSearch onLocationSelect={() => undefined} />);

    await user.type(screen.getByLabelText("Start typing to see suggestions"), "xx");

    expect(await screen.findByText("No matches found.")).toBeInTheDocument();
  });

  it("shows error feedback when suggestion fetch fails", async () => {
    const user = userEvent.setup();
    mockFetchLocationSuggestions.mockRejectedValue(new Error("Service unavailable"));

    render(<LocationSearch onLocationSelect={() => undefined} />);

    await user.type(screen.getByLabelText("Start typing to see suggestions"), "berlin");

    expect(await screen.findByText("Could not load location suggestions.")).toBeInTheDocument();
  });
});
