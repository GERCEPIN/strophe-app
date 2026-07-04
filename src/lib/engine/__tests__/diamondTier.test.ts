import { describe, it, expect } from "vitest";
import {
  CHECKPOINT_INTERVAL,
  nextCheckpointLevel,
  isCheckpointLevel,
  highestPassedCheckpoint,
  multiplierForLevel,
  applyResetProtection,
} from "../diamondTier";

describe("diamond tier engine", () => {
  it("checkpoints land every 50 levels", () => {
    expect(isCheckpointLevel(50)).toBe(true);
    expect(isCheckpointLevel(100)).toBe(true);
    expect(isCheckpointLevel(49)).toBe(false);
    expect(CHECKPOINT_INTERVAL).toBe(50);
  });

  it("computes the next checkpoint from any current level", () => {
    expect(nextCheckpointLevel(1)).toBe(50);
    expect(nextCheckpointLevel(49)).toBe(50);
    expect(nextCheckpointLevel(50)).toBe(100);
    expect(nextCheckpointLevel(51)).toBe(100);
  });

  it("highestPassedCheckpoint floors to the last multiple of 50", () => {
    expect(highestPassedCheckpoint(1)).toBe(0);
    expect(highestPassedCheckpoint(49)).toBe(0);
    expect(highestPassedCheckpoint(50)).toBe(50);
    expect(highestPassedCheckpoint(120)).toBe(100);
  });

  it("multiplier is 1x below any checkpoint", () => {
    expect(multiplierForLevel(10, 0)).toBe(1);
  });

  it("multiplier scales 3x -> 5x as the user progresses through a Diamond tier", () => {
    const justAfter = multiplierForLevel(51, 50);
    const midway = multiplierForLevel(75, 50);
    const atNext = multiplierForLevel(100, 50);

    expect(justAfter).toBeCloseTo(3, 1);
    expect(midway).toBeGreaterThan(justAfter);
    expect(atNext).toBeCloseTo(5, 1);
  });

  it("Diamond Reset Protection: a passed checkpoint never un-passes", () => {
    expect(applyResetProtection(true, false)).toBe(true); // stays passed
    expect(applyResetProtection(false, true)).toBe(true); // newly passed
    expect(applyResetProtection(false, false)).toBe(false);
    expect(applyResetProtection(true, true)).toBe(true);
  });
});
