import { describe, it, expect } from "vitest";
import { parseInstingScenarioResponse } from "../instingScenario";

const VALID_PAYLOAD = JSON.stringify({
  scenario: "Kamu sedang rapat penting, tiba-tiba ada notif darurat dari keluarga.",
  options: [
    { id: "a", label: "Keluar diam-diam untuk cek HP" },
    { id: "b", label: "Izin keluar sebentar dengan jelas" },
    { id: "c", label: "Abaikan dulu sampai rapat selesai" },
  ],
  correctOptionId: "b",
  reasoning: "Izin dengan jelas menunjukkan profesionalisme sekaligus tanggung jawab keluarga.",
});

describe("parseInstingScenarioResponse", () => {
  it("parses a valid JSON response", () => {
    const result = parseInstingScenarioResponse(VALID_PAYLOAD);
    expect(result.correctOptionId).toBe("b");
    expect(result.options).toHaveLength(3);
  });

  it("strips markdown code fences (```json ... ```)", () => {
    const fenced = "```json\n" + VALID_PAYLOAD + "\n```";
    const result = parseInstingScenarioResponse(fenced);
    expect(result.correctOptionId).toBe("b");
  });

  it("strips plain code fences (``` ... ```)", () => {
    const fenced = "```\n" + VALID_PAYLOAD + "\n```";
    const result = parseInstingScenarioResponse(fenced);
    expect(result.scenario).toBeTruthy();
  });

  it("throws when correctOptionId does not match any option id", () => {
    const bad = JSON.stringify({
      scenario: "Test skenario",
      options: [
        { id: "a", label: "Opsi A" },
        { id: "b", label: "Opsi B" },
      ],
      correctOptionId: "z",
      reasoning: "Alasan.",
    });
    expect(() => parseInstingScenarioResponse(bad)).toThrow();
  });

  it("throws when scenario field is missing", () => {
    const bad = JSON.stringify({
      options: [{ id: "a", label: "Opsi A" }],
      correctOptionId: "a",
      reasoning: "Alasan.",
    });
    expect(() => parseInstingScenarioResponse(bad)).toThrow();
  });

  it("throws when options array is empty", () => {
    const bad = JSON.stringify({
      scenario: "Test skenario",
      options: [],
      correctOptionId: "a",
      reasoning: "Alasan.",
    });
    expect(() => parseInstingScenarioResponse(bad)).toThrow();
  });

  it("throws on completely invalid JSON", () => {
    expect(() => parseInstingScenarioResponse("bukan json sama sekali")).toThrow();
  });

  it("throws when reasoning is missing", () => {
    const bad = JSON.stringify({
      scenario: "Test skenario",
      options: [{ id: "a", label: "Opsi A" }],
      correctOptionId: "a",
    });
    expect(() => parseInstingScenarioResponse(bad)).toThrow();
  });
});
