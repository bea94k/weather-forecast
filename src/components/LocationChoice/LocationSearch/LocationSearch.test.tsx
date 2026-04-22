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

    await user.type(screen.getByLabelText("Search for a city"), "Paris");

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

    await user.type(screen.getByLabelText("Search for a city"), "Pa");
    const suggestionButton = await screen.findByRole("button", {
      name: "Paris, Ile-de-France, France"
    });
    await user.click(suggestionButton);

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

    const input = screen.getByLabelText("Search for a city");
    await user.type(input, "Lo");
    await screen.findByRole("button", {
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
});
