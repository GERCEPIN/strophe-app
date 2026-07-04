import { z } from "zod";

export const instingScenarioAiSchema = z.object({
  scenario: z.string().min(5).max(1000),
  options: z.array(z.object({ id: z.string().min(1).max(10), label: z.string().min(1).max(300) })).min(2).max(6),
  correctOptionId: z.string().min(1).max(10),
  reasoning: z.string().min(5).max(1000),
});

export type InstingScenarioAiOutput = z.infer<typeof instingScenarioAiSchema>;

/** Strips markdown code fences some models wrap JSON in, then parses + validates. */
export function parseInstingScenarioResponse(raw: string): InstingScenarioAiOutput {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const json = JSON.parse(cleaned);
  const result = instingScenarioAiSchema.safeParse(json);
  if (!result.success) {
    throw new Error(`AI scenario response failed validation: ${result.error.message}`);
  }
  if (!result.data.options.some((o) => o.id === result.data.correctOptionId)) {
    throw new Error("AI scenario response's correctOptionId does not match any option id");
  }
  return result.data;
}
