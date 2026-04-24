import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __clearLocationCacheForTests,
  fetchLocationSuggestions
} from "./openMeteoGeocodingClient";

afterEach(() => {
  __clearLocationCacheForTests();
  vi.restoreAllMocks();
  vi.useRealTimers();
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

  it("returns cached suggestions for repeated identical query within TTL", async () => {
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

    const firstReqResult = await fetchLocationSuggestions("Helsinki");
    const secondReqResult = await fetchLocationSuggestions("Helsinki");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(secondReqResult).toEqual(firstReqResult);
  });

  it("re-fetches suggestions after cache TTL expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T00:00:00.000Z"));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchLocationSuggestions("Paris");

    vi.setSystemTime(new Date("2026-04-21T00:05:01.000Z")); // over 5 min later
    await fetchLocationSuggestions("Paris");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deduplicates in-flight requests for the same query", async () => {
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: vi.fn().mockResolvedValue({ results: [] })
            });
          }, 0);
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const firstRequest = fetchLocationSuggestions("Warsaw");
    const secondRequest = fetchLocationSuggestions("Warsaw");
    const [firstReqResult, secondReqResult] = await Promise.all([firstRequest, secondRequest]);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(firstReqResult).toEqual(secondReqResult);
  });

  it("does not cache failed geocoding requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn()
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [] })
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchLocationSuggestions("Warsaw")).rejects.toThrow(
      "Unable to fetch location suggestions."
    );
    await fetchLocationSuggestions("Warsaw");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reuses cache for normalized query variants", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchLocationSuggestions("Paris");
    await fetchLocationSuggestions(" paris ");

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
