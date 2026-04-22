import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocationChoice } from "./LocationChoice";
import type { LocationOption } from "../../../types/weather";

vi.mock("../LocationMapPicker/LocationMapPicker", () => ({
  LocationMapPicker: ({
    onLocationSelect
  }: {
    onLocationSelect: (location: LocationOption) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onLocationSelect({
          id: "custom-60.17-24.94",
          name: "Custom (60.17, 24.94)",
          latitude: 60.17,
          longitude: 24.94,
          timezone: "auto"
        })
      }
    >
      Mock map pick
    </button>
  )
}));

const locations: LocationOption[] = [
  { id: "helsinki", name: "Helsinki", latitude: 60.1699, longitude: 24.9384, timezone: "Europe/Helsinki" },
  { id: "london", name: "London", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London" }
];

describe("LocationChoice", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows search mode by default", () => {
    render(
      <LocationChoice
        locations={locations}
        activeLocationId="helsinki"
        onLocationSelect={() => undefined}
      />
    );

    expect(screen.getByLabelText("Search for a city")).toBeInTheDocument();
  });

  it("uses map picker selection in map mode", async () => {
    const user = userEvent.setup();
    const onLocationSelect = vi.fn();

    render(
      <LocationChoice
        locations={locations}
        activeLocationId="helsinki"
        onLocationSelect={onLocationSelect}
      />
    );

    const modeToggle = screen.getByRole("group", { name: "Location input mode" });
    await user.click(within(modeToggle).getByRole("button", { name: "Map" }));
    // simulate "user picked a point on a map" in a deterministic way
    await user.click(screen.getByRole("button", { name: "Mock map pick" }));

    expect(onLocationSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom-60.17-24.94",
        latitude: 60.17,
        longitude: 24.94
      })
    );
  });
});
