import { describe, it, expect } from "vitest";
import { healthProfileSchema, financeProfileSchema, visionSchema, onboardingSchema } from "../onboarding";

describe("healthProfileSchema", () => {
  it("accepts a fully valid health profile", () => {
    const result = healthProfileSchema.safeParse({
      heightCm: 170,
      weightKg: 65,
      activityLevel: "moderate",
      goal: "ideal",
      skinType: "kombinasi",
      skinConcerns: "Jerawat di dahi",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (all fields optional)", () => {
    expect(healthProfileSchema.safeParse({}).success).toBe(true);
  });

  it("rejects heightCm above 300", () => {
    expect(healthProfileSchema.safeParse({ heightCm: 301 }).success).toBe(false);
  });

  it("rejects negative heightCm", () => {
    expect(healthProfileSchema.safeParse({ heightCm: -5 }).success).toBe(false);
  });

  it("rejects weightKg above 400", () => {
    expect(healthProfileSchema.safeParse({ weightKg: 401 }).success).toBe(false);
  });

  it("rejects invalid activityLevel enum", () => {
    expect(healthProfileSchema.safeParse({ activityLevel: "super_aktif" }).success).toBe(false);
  });

  it("rejects invalid goal enum", () => {
    expect(healthProfileSchema.safeParse({ goal: "gemuk" }).success).toBe(false);
  });

  it("rejects invalid skinType enum", () => {
    expect(healthProfileSchema.safeParse({ skinType: "berminyak" }).success).toBe(false);
  });

  it("accepts all valid activityLevel values", () => {
    const levels = ["sedentary", "light", "moderate", "active", "very_active"];
    for (const level of levels) {
      expect(healthProfileSchema.safeParse({ activityLevel: level }).success).toBe(true);
    }
  });

  it("accepts all valid goal values", () => {
    for (const goal of ["kurus", "ideal", "otot"]) {
      expect(healthProfileSchema.safeParse({ goal }).success).toBe(true);
    }
  });
});

describe("financeProfileSchema", () => {
  it("accepts valid finance profile", () => {
    const result = financeProfileSchema.safeParse({
      incomeRange: "5-10 juta",
      monthlyExpenseRange: "3-5 juta",
      financialGoal: "Beli rumah dalam 5 tahun",
      notes: "Masih punya cicilan motor",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (all fields optional)", () => {
    expect(financeProfileSchema.safeParse({}).success).toBe(true);
  });

  it("rejects financialGoal longer than 500 characters", () => {
    expect(financeProfileSchema.safeParse({ financialGoal: "a".repeat(501) }).success).toBe(false);
  });

  it("rejects notes longer than 1000 characters", () => {
    expect(financeProfileSchema.safeParse({ notes: "a".repeat(1001) }).success).toBe(false);
  });
});

describe("visionSchema", () => {
  it("accepts valid vision input", () => {
    const result = visionSchema.safeParse({
      visi5Tahun: "Punya bisnis sendiri dan hidup bebas finansial.",
      blueprintBisnis: {
        tahun1: "Riset pasar dan validasi ide",
        tahun5: "Ekspansi ke 3 kota",
        tahun10: "IPO atau exit",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    expect(visionSchema.safeParse({}).success).toBe(true);
  });

  it("rejects visi5Tahun longer than 2000 characters", () => {
    expect(visionSchema.safeParse({ visi5Tahun: "a".repeat(2001) }).success).toBe(false);
  });

  it("trims whitespace from visi5Tahun", () => {
    const result = visionSchema.safeParse({ visi5Tahun: "  Impian  " });
    expect(result.success && result.data.visi5Tahun).toBe("Impian");
  });
});

describe("onboardingSchema (composite)", () => {
  it("accepts a fully populated onboarding payload", () => {
    const result = onboardingSchema.safeParse({
      vision: { visi5Tahun: "Mandiri finansial" },
      health: { heightCm: 165, weightKg: 60, activityLevel: "light" },
      finance: { incomeRange: "5-10 juta" },
      prayer: { city: "Jakarta", country: "Indonesia" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (all sub-schemas optional)", () => {
    expect(onboardingSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid nested data", () => {
    expect(
      onboardingSchema.safeParse({ health: { heightCm: 999 } }).success
    ).toBe(false);
  });
});
