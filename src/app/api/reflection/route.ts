import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { reflectionLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";

const VALID_TRACKS = ["core", "daya_ingat", "bahasa_inggris", "public_speaking", "jangka_panjang", "kesehatan", "keuangan"] as const;
type TrackValue = typeof VALID_TRACKS[number];

const createSchema = z.object({
  track: z.enum(VALID_TRACKS),
  level: z.number().int().positive(),
  question: z.string().min(3).max(500),
  answerText: z.string().min(10).max(3000),
});

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const entries = await db
    .select()
    .from(reflectionLogs)
    .where(eq(reflectionLogs.userId, session.userId))
    .orderBy(desc(reflectionLogs.createdAt))
    .limit(20);

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid", details: parsed.error.issues }, { status: 400 });
  }

  const { track, level, question, answerText } = parsed.data;

  const [inserted] = await db
    .insert(reflectionLogs)
    .values({
      userId: session.userId,
      track: track as TrackValue,
      level,
      question,
      answerText,
    })
    .returning();

  return NextResponse.json({ entry: inserted }, { status: 201 });
}
