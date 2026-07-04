/**
 * Seed script — run with `npm run db:seed`.
 * Idempotent: safe to run multiple times (uses onConflictDoNothing / upserts
 * where the schema has a unique constraint to key off of).
 */
import { db } from "./client";
import { coreSessionContent, memoryVaultItems, stockLessons, stockCaseStudies } from "./schema";
import { CORE_SESSION_LEVELS } from "../content/coreSessionLevels";
import { MEMORY_VAULT_LEVELS } from "../content/memoryVaultLevels";
import { STOCK_FUNDAMENTAL_LEVELS, FUNDAMENTAL_LEVEL1_CASE_STUDY, StockLessonSeed } from "../content/stockFundamentalLevels";
import { STOCK_TECHNICAL_LEVELS } from "../content/stockTechnicalLevels";
import { STOCK_MACRO_LEVELS } from "../content/stockMacroLevels";
import { STOCK_SENTIMENT_LEVELS } from "../content/stockSentimentLevels";
import { STOCK_RISK_LEVELS } from "../content/stockRiskLevels";
import { STOCK_LEGAL_LEVELS } from "../content/stockLegalLevels";
import { eq, and } from "drizzle-orm";

async function seedCoreSessions() {
  for (const level of CORE_SESSION_LEVELS) {
    const existing = await db
      .select()
      .from(coreSessionContent)
      .where(eq(coreSessionContent.level, level.level));

    if (existing.length > 0) {
      console.log(`  ↳ core session level ${level.level} already exists, skipping`);
      continue;
    }

    await db.insert(coreSessionContent).values({
      level: level.level,
      title: level.title,
      category: level.category,
      instructions: level.instructions,
      durationMinutes: level.durationMinutes,
    });
    console.log(`  ↳ seeded core session level ${level.level}: ${level.title}`);
  }
}

async function seedMemoryVault() {
  for (const item of MEMORY_VAULT_LEVELS) {
    const existing = await db
      .select()
      .from(memoryVaultItems)
      .where(and(eq(memoryVaultItems.level, item.level), eq(memoryVaultItems.term, item.term)));

    if (existing.length > 0) {
      console.log(`  ↳ memory vault level ${item.level} already exists, skipping`);
      continue;
    }

    await db.insert(memoryVaultItems).values({
      level: item.level,
      term: item.term,
      prompt: item.prompt,
      answer: item.answer,
      explanation: item.explanation,
    });
    console.log(`  ↳ seeded memory vault level ${item.level}: ${item.term}`);
  }
}

async function seedStockAcademy() {
  let level1LessonId: string | null = null;

  for (const lesson of STOCK_FUNDAMENTAL_LEVELS) {
    const existing = await db
      .select()
      .from(stockLessons)
      .where(and(eq(stockLessons.category, "fundamental"), eq(stockLessons.level, lesson.level)));

    if (existing.length > 0) {
      console.log(`  ↳ stock fundamental level ${lesson.level} already exists, skipping`);
      if (lesson.level === 1) level1LessonId = existing[0].id;
      continue;
    }

    const [inserted] = await db
      .insert(stockLessons)
      .values({
        category: "fundamental",
        level: lesson.level,
        title: lesson.title,
        analogy: lesson.analogy,
        contentMarkdown: lesson.contentMarkdown,
      })
      .returning({ id: stockLessons.id });

    console.log(`  ↳ seeded stock fundamental level ${lesson.level}: ${lesson.title}`);
    if (lesson.level === 1) level1LessonId = inserted.id;
  }

  if (level1LessonId) {
    const existingCase = await db
      .select()
      .from(stockCaseStudies)
      .where(eq(stockCaseStudies.lessonId, level1LessonId));

    if (existingCase.length === 0) {
      await db.insert(stockCaseStudies).values({
        lessonId: level1LessonId,
        scenarioText: FUNDAMENTAL_LEVEL1_CASE_STUDY.scenarioText,
        guidingQuestions: FUNDAMENTAL_LEVEL1_CASE_STUDY.guidingQuestions,
        isIllustrative: true,
      });
      console.log("  ↳ seeded fundamental level 1 case study (illustrative)");
    } else {
      console.log("  ↳ fundamental level 1 case study already exists, skipping");
    }
  }
}

type StockCategory = "fundamental" | "teknikal" | "makro_sektoral" | "sentimen_berita" | "manajemen_risiko" | "legal_compliance";

async function seedStockCategory(category: StockCategory, levels: StockLessonSeed[]) {
  for (const lesson of levels) {
    const existing = await db
      .select()
      .from(stockLessons)
      .where(and(eq(stockLessons.category, category), eq(stockLessons.level, lesson.level)));

    if (existing.length > 0) {
      console.log(`  ↳ stock ${category} level ${lesson.level} already exists, skipping`);
      continue;
    }

    await db.insert(stockLessons).values({
      category,
      level: lesson.level,
      title: lesson.title,
      analogy: lesson.analogy,
      contentMarkdown: lesson.contentMarkdown,
    });

    console.log(`  ↳ seeded stock ${category} level ${lesson.level}: ${lesson.title}`);
  }
}

async function main() {
  console.log("Seeding STROPHE content...\n");

  console.log("Sesi Inti (Core Session):");
  await seedCoreSessions();

  console.log("\nMemory Vault (Daya Ingat):");
  await seedMemoryVault();

  console.log("\nAkademi Analisis Saham — Fundamental:");
  await seedStockAcademy();

  console.log("\nAkademi Analisis Saham — Teknikal:");
  await seedStockCategory("teknikal", STOCK_TECHNICAL_LEVELS);

  console.log("\nAkademi Analisis Saham — Makro-Sektoral:");
  await seedStockCategory("makro_sektoral", STOCK_MACRO_LEVELS);

  console.log("\nAkademi Analisis Saham — Sentimen & Berita:");
  await seedStockCategory("sentimen_berita", STOCK_SENTIMENT_LEVELS);

  console.log("\nAkademi Analisis Saham — Manajemen Risiko:");
  await seedStockCategory("manajemen_risiko", STOCK_RISK_LEVELS);

  console.log("\nAkademi Analisis Saham — Legal & Compliance:");
  await seedStockCategory("legal_compliance", STOCK_LEGAL_LEVELS);

  console.log("\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
