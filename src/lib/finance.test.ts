import { describe, it, expect } from "vitest";
import { mortgage, rentalYield } from "./finance";

describe("mortgage", () => {
  it("computes monthly payment for AED 2M, 20% down, 4.5%, 25y", () => {
    const r = mortgage(2_000_000, 20, 4.5, 25);
    expect(r.loan).toBe(1_600_000);
    expect(Math.round(r.monthly)).toBe(8893);
  });
  it("handles 0% interest", () => {
    expect(mortgage(1_200_000, 0, 0, 10).monthly).toBe(10_000);
  });
});

describe("rentalYield", () => {
  it("computes gross and net yield", () => {
    const r = rentalYield(1_000_000, 80_000, 15_000, 5_000);
    expect(r.gross).toBe(8);
    expect(r.net).toBe(6);
    expect(r.payback).toBeCloseTo(16.67, 1);
  });
});
