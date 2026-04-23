import { describe, expect, it } from "vitest";
import { weatherCodeToIcon } from "./formatters";

describe("weatherCodeToIcon", () => {
  it("returns an icon for known weather codes", () => {
    expect(weatherCodeToIcon(0)).toBe("☀️");
    expect(weatherCodeToIcon(61)).toBe("🌧️");
    expect(weatherCodeToIcon(95)).toBe("⛈️");
  });

  it("returns null for unknown weather code", () => {
    expect(weatherCodeToIcon(999)).toBeNull();
  });
});
