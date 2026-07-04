import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../auth";

describe("registerSchema", () => {
  const valid = { name: "Budi Santoso", email: "budi@example.com", password: "password123" };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("lowercases the email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "BUDI@EXAMPLE.COM" });
    expect(result.success && result.data.email).toBe("budi@example.com");
  });

  it("trims whitespace from name and email", () => {
    const result = registerSchema.safeParse({ ...valid, name: "  Budi  ", email: "  budi@example.com  " });
    expect(result.success && result.data.name).toBe("Budi");
  });

  it("rejects name shorter than 2 characters", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });

  it("rejects name longer than 100 characters", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A".repeat(101) }).success).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(registerSchema.safeParse({ ...valid, email: "bukan-email" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, email: "tanpa@domain" }).success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    expect(registerSchema.safeParse({ ...valid, password: "abc123" }).success).toBe(false);
  });

  it("rejects password longer than 200 characters", () => {
    expect(registerSchema.safeParse({ ...valid, password: "a".repeat(201) }).success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(registerSchema.safeParse({ email: "budi@example.com", password: "pass1234" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Budi", password: "pass1234" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Budi", email: "budi@example.com" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  const valid = { email: "budi@example.com", password: "password123" };

  it("accepts valid login data", () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it("lowercases the email", () => {
    const result = loginSchema.safeParse({ ...valid, email: "BUDI@EXAMPLE.COM" });
    expect(result.success && result.data.email).toBe("budi@example.com");
  });

  it("rejects invalid email format", () => {
    expect(loginSchema.safeParse({ ...valid, email: "bukan-email" }).success).toBe(false);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({ email: "budi@example.com" }).success).toBe(false);
    expect(loginSchema.safeParse({ password: "password123" }).success).toBe(false);
  });
});
