import { describe, it, expect } from "vitest";
import {
  checkNewCombos,
  getMetCombos,
  COMBO_RULES,
} from "@/lib/engine/skillCombo";

describe("skillCombo engine", () => {
  it("checkNewCombos returns empty when no requirements are met", () => {
    const trackLevels = { core: 1, daya_ingat: 1 };
    const result = checkNewCombos(trackLevels, []);
    expect(result).toHaveLength(0);
  });

  it("checkNewCombos returns combo when requirements are met and not already unlocked", () => {
    const trackLevels = { core: 10, daya_ingat: 5 };
    const result = checkNewCombos(trackLevels, []);
    expect(result.some((r) => r.code === "memory_master")).toBe(true);
  });

  it("checkNewCombos returns empty when already unlocked", () => {
    const trackLevels = { core: 10, daya_ingat: 5 };
    const result = checkNewCombos(trackLevels, ["memory_master"]);
    expect(result.some((r) => r.code === "memory_master")).toBe(false);
  });

  it("partial requirements don't unlock (only one track high enough)", () => {
    // core is at 10 but daya_ingat is only 3 — memory_master requires daya_ingat >= 5
    const trackLevels = { core: 10, daya_ingat: 3 };
    const result = checkNewCombos(trackLevels, []);
    expect(result.some((r) => r.code === "memory_master")).toBe(false);
  });

  it("getMetCombos returns correct combos based on track levels", () => {
    const trackLevels = { core: 20, daya_ingat: 10, jangka_panjang: 5, public_speaking: 5, keuangan: 5 };
    const result = getMetCombos(trackLevels);
    const codes = result.map((r) => r.code);
    expect(codes).toContain("memory_master");
    expect(codes).toContain("sharp_mind");
    expect(codes).toContain("long_game_player");
    expect(codes).toContain("confident_speaker");
    expect(codes).toContain("money_mind");
  });

  it("getMetCombos returns empty when no combos met", () => {
    const result = getMetCombos({ core: 1 });
    expect(result).toHaveLength(0);
  });

  it("COMBO_RULES has 5 entries", () => {
    expect(COMBO_RULES).toHaveLength(5);
  });
});
