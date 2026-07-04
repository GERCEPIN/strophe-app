import { describe, it, expect } from "vitest";
import { LOGIC_PUZZLES, PUZZLE_LEVELS, getPuzzlesByLevel } from "../logicPuzzles";

describe("logicPuzzles content integrity", () => {
  it("has exactly 15 puzzles total (5 levels × 3)", () => {
    expect(LOGIC_PUZZLES).toHaveLength(15);
  });

  it("each level has exactly 3 puzzles", () => {
    for (const level of PUZZLE_LEVELS) {
      expect(getPuzzlesByLevel(level)).toHaveLength(3);
    }
  });

  it("all puzzle IDs are unique", () => {
    const ids = LOGIC_PUZZLES.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every puzzle's correctId matches one of its own options", () => {
    for (const puzzle of LOGIC_PUZZLES) {
      const optionIds = puzzle.options.map((o) => o.id);
      expect(optionIds).toContain(puzzle.correctId);
    }
  });

  it("every puzzle has at least 2 options", () => {
    for (const puzzle of LOGIC_PUZZLES) {
      expect(puzzle.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("no puzzle has empty question, explanation, or option labels", () => {
    for (const puzzle of LOGIC_PUZZLES) {
      expect(puzzle.question.trim().length).toBeGreaterThan(0);
      expect(puzzle.explanation.trim().length).toBeGreaterThan(0);
      for (const opt of puzzle.options) {
        expect(opt.id.trim().length).toBeGreaterThan(0);
        expect(opt.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("all puzzles belong to levels 1-5", () => {
    for (const puzzle of LOGIC_PUZZLES) {
      expect(puzzle.level).toBeGreaterThanOrEqual(1);
      expect(puzzle.level).toBeLessThanOrEqual(5);
    }
  });

  it("getPuzzlesByLevel returns empty array for an out-of-range level", () => {
    // @ts-expect-error — intentional invalid input
    expect(getPuzzlesByLevel(99)).toHaveLength(0);
  });
});
