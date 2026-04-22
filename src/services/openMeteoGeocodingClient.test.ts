import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLocationSuggestions } from "./openMeteoGeocodingClient";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchLocationSuggestions", () => {
  it("returns mapped location options from geocoding response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        results: [
          {
            id: 658225,
            name: "Helsinki",
            latitude: 60.1699,
            longitude: 24.9384,
            timezone: "Europe/Helsinki",
            admin1: "Uusimaa",
            country: "Finland"
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLocationSuggestions("helsinki");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result).toEqual([
      {
        id: "geocode-658225",
        name: "Helsinki, Uusimaa, Finland",
        latitude: 60.1699,
        longitude: 24.9384,
        timezone: "Europe/Helsinki"
      }
    ]);
  });

  it("returns empty results for blank queries without fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLocationSuggestions("   ");

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses only required geocoding params by default", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchLocationSuggestions("Paris");

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("name")).toBe("Paris");
    expect(requestedUrl.searchParams.get("count")).toBeNull();
    expect(requestedUrl.searchParams.get("language")).toBeNull();
    expect(requestedUrl.searchParams.get("format")).toBeNull();
  });

  it("throws friendly error on failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn()
      })
    );

    await expect(fetchLocationSuggestions("Berlin")).rejects.toThrow(
      "Unable to fetch location suggestions."
    );
  });
});
