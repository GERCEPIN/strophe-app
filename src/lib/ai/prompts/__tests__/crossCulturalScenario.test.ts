import { describe, it, expect } from "vitest";
import { CULTURAL_CONTEXTS, buildCrossCulturalScenarioPrompt } from "../crossCulturalScenario";

describe("CULTURAL_CONTEXTS data integrity", () => {
  it("has exactly 8 cultural contexts", () => {
    expect(CULTURAL_CONTEXTS).toHaveLength(8);
  });

  it("all context IDs are unique", () => {
    const ids = CULTURAL_CONTEXTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all contexts have non-empty id and label", () => {
    for (const ctx of CULTURAL_CONTEXTS) {
      expect(ctx.id.trim().length).toBeGreaterThan(0);
      expect(ctx.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("no context id contains spaces (ids must be URL-safe)", () => {
    for (const ctx of CULTURAL_CONTEXTS) {
      expect(ctx.id).not.toContain(" ");
    }
  });
});

describe("buildCrossCulturalScenarioPrompt", () => {
  it("returns an object with system and user strings", () => {
    const result = buildCrossCulturalScenarioPrompt({ level: 1, culturalContextId: "jepang" });
    expect(typeof result.system).toBe("string");
    expect(typeof result.user).toBe("string");
  });

  it("user prompt includes the level number", () => {
    const result = buildCrossCulturalScenarioPrompt({ level: 3, culturalContextId: "jerman" });
    expect(result.user).toContain("3");
  });

  it("user prompt includes the cultural context label", () => {
    const result = buildCrossCulturalScenarioPrompt({ level: 2, culturalContextId: "brasil" });
    expect(result.user).toContain("Brasil");
  });

  it("system prompt includes withCoreRules content (non-empty)", () => {
    const result = buildCrossCulturalScenarioPrompt({ level: 1, culturalContextId: "india" });
    expect(result.system.length).toBeGreaterThan(100);
  });

  it("generates distinct user prompts for different cultural contexts", () => {
    const r1 = buildCrossCulturalScenarioPrompt({ level: 1, culturalContextId: "jepang" });
    const r2 = buildCrossCulturalScenarioPrompt({ level: 1, culturalContextId: "tiongkok" });
    expect(r1.user).not.toBe(r2.user);
  });

  it("builds prompts for all 8 contexts without throwing", () => {
    for (const ctx of CULTURAL_CONTEXTS) {
      expect(() =>
        buildCrossCulturalScenarioPrompt({ level: 1, culturalContextId: ctx.id })
      ).not.toThrow();
    }
  });
});
