import { describe, it, expect } from "vitest";
import { currencyAxis } from "../src/lib/chart-layout";
describe("financial chart axes", () => {
  it("uses round $200 intervals for the current service chart instead of $193.5", () => {
    expect(currencyAxis([67300, 31000, 18000]).ticks).toEqual([
      0, 20000, 40000, 60000, 80000,
    ]);
  });
  it("keeps all finite nonnegative points within the axis for small and large scopes", () => {
    for (const values of [
      [0],
      [1],
      [1750, 5999],
      [1333700, 685800],
      [3150400, 4800000],
    ]) {
      const axis = currencyAxis(values);
      expect(axis.high).toBeGreaterThanOrEqual(Math.max(...values));
      expect(axis.ticks[0]).toBe(0);
      expect(axis.ticks.at(-1)).toBe(axis.high);
      expect(axis.ticks.every(Number.isFinite)).toBe(true);
      expect(axis.ticks.length).toBeLessThanOrEqual(6);
    }
  });
  it("ignores invalid inputs without producing NaN SVG coordinates", () => {
    const axis = currencyAxis([NaN, Infinity, 10000]);
    expect(Number.isFinite(axis.high)).toBe(true);
    expect(axis.high).toBeGreaterThanOrEqual(10000);
  });
});
