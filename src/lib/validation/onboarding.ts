import { z } from "zod";

/** Feature 23 — Kompas 5 Tahun + Feature 27 — Blueprint 1-5-10 Tahun. */
export const visionSchema = z.object({
  visi5Tahun: z.string().trim().max(2000).optional(),
  blueprintBisnis: z
    .object({
      tahun1: z.string().trim().max(1000).optional(),
      tahun5: z.string().trim().max(1000).optional(),
      tahun10: z.string().trim().max(1000).optional(),
    })
    .optional(),
});

/** ⚠️ Feature 29/30 — health & skin data, required before ANY nutrition/skincare advice. */
export const healthProfileSchema = z.object({
  heightCm: z.number().positive().max(300).optional(),
  weightKg: z.number().positive().max(400).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  goal: z.enum(["kurus", "ideal", "otot"]).optional(),
  skinType: z.enum(["kering", "oily", "sensitif", "kombinasi", "normal"]).optional(),
  skinConcerns: z.string().trim().max(1000).optional(),
});

/** ⚠️ Feature 33 — finance data, required before ANY financial advice. */
export const financeProfileSchema = z.object({
  incomeRange: z.string().trim().max(200).optional(),
  monthlyExpenseRange: z.string().trim().max(200).optional(),
  financialGoal: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** ⚠️ Feature 32 — location, required before ANY prayer-time content. */
export const prayerProfileSchema = z.object({
  city: z.string().trim().max(200).optional(),
  country: z.string().trim().max(200).optional(),
  madhab: z.string().trim().max(50).optional(),
});

export const onboardingSchema = z.object({
  vision: visionSchema.optional(),
  health: healthProfileSchema.optional(),
  finance: financeProfileSchema.optional(),
  prayer: prayerProfileSchema.optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
