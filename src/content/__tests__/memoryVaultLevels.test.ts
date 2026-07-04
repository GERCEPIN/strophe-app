import { describe, it, expect } from "vitest";
import { MEMORY_VAULT_LEVELS } from "../memoryVaultLevels";

describe("memoryVaultLevels content integrity", () => {
  it("has exactly 5 levels", () => {
    expect(MEMORY_VAULT_LEVELS).toHaveLength(5);
  });

  it("levels are numbered 1 through 5 in order", () => {
    const levels = MEMORY_VAULT_LEVELS.map((l) => l.level);
    expect(levels).toEqual([1, 2, 3, 4, 5]);
  });

  it("all level numbers are unique", () => {
    const levels = MEMORY_VAULT_LEVELS.map((l) => l.level);
    expect(new Set(levels).size).toBe(levels.length);
  });

  it("no level has empty term, prompt, answer, or explanation", () => {
    for (const item of MEMORY_VAULT_LEVELS) {
      expect(item.term.trim().length).toBeGreaterThan(0);
      expect(item.prompt.trim().length).toBeGreaterThan(0);
      expect(item.answer.trim().length).toBeGreaterThan(0);
      expect(item.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("each explanation contains an analogy (all use 'Analogi:' pattern)", () => {
    for (const item of MEMORY_VAULT_LEVELS) {
      expect(item.explanation).toContain("Analogi:");
    }
  });

  it("prompts are long enough to be meaningful (> 20 chars)", () => {
    for (const item of MEMORY_VAULT_LEVELS) {
      expect(item.prompt.length).toBeGreaterThan(20);
    }
  });

  it("all terms are distinct (no duplicate technique names)", () => {
    const terms = MEMORY_VAULT_LEVELS.map((l) => l.term);
    expect(new Set(terms).size).toBe(terms.length);
  });
});
