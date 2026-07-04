import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiMessages, mentorAssignments, diamondCheckpoints } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { streamChatCompletion, type ChatMessage } from "@/lib/ai/openrouter";
import { buildGlobalMentorSystemPrompt, type MentorPersonaKey } from "@/lib/ai/prompts/globalMentor";

const FEATURE = "global_mentor" as const;

const VALID_PERSONAS: MentorPersonaKey[] = [
  "netral",
  "disiplin_jepang",
  "keberanian_barat",
  "ketekunan_jerman",
  "harmoni_nordik",
  "ketegasan_korea",
  "diamond_tegas",
];

function isValidPersona(p: unknown): p is MentorPersonaKey {
  return typeof p === "string" && (VALID_PERSONAS as string[]).includes(p);
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const history = await db
    .select({ role: aiMessages.role, content: aiMessages.content, createdAt: aiMessages.createdAt })
    .from(aiMessages)
    .where(and(eq(aiMessages.userId, session.userId), eq(aiMessages.feature, FEATURE)))
    .orderBy(asc(aiMessages.createdAt))
    .limit(50);

  const [[latestAssignment], checkpointRows] = await Promise.all([
    db
      .select()
      .from(mentorAssignments)
      .where(eq(mentorAssignments.userId, session.userId))
      .orderBy(desc(mentorAssignments.assignedAt))
      .limit(1),
    db
      .select({ id: diamondCheckpoints.id })
      .from(diamondCheckpoints)
      .where(eq(diamondCheckpoints.userId, session.userId))
      .limit(1),
  ]);

  return NextResponse.json({
    history,
    currentPersona: latestAssignment?.persona ?? "netral",
    hasDiamondUnlock: checkpointRows.length > 0,
  });
}

const messageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  persona: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
  }
  const { message, persona: rawPersona } = parsed.data;

  // Diamond Tegas persona is gated behind having at least one Diamond Checkpoint.
  if (rawPersona === "diamond_tegas") {
    const rows = await db
      .select({ id: diamondCheckpoints.id })
      .from(diamondCheckpoints)
      .where(eq(diamondCheckpoints.userId, session.userId))
      .limit(1);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Diamond Mentor hanya tersedia setelah kamu mencapai Diamond Checkpoint pertama (level 50)." },
        { status: 403 }
      );
    }
  }

  // If a persona is provided and valid, upsert the mentorAssignments row
  const newPersona = isValidPersona(rawPersona) ? rawPersona : null;
  if (newPersona) {
    await db.insert(mentorAssignments).values({
      userId: session.userId,
      persona: newPersona,
    });
  }

  // Determine current persona
  let currentPersona: MentorPersonaKey = "netral";
  if (newPersona) {
    currentPersona = newPersona;
  } else {
    const [latestAssignment] = await db
      .select()
      .from(mentorAssignments)
      .where(eq(mentorAssignments.userId, session.userId))
      .orderBy(desc(mentorAssignments.assignedAt))
      .limit(1);
    if (latestAssignment && isValidPersona(latestAssignment.persona)) {
      currentPersona = latestAssignment.persona;
    }
  }

  // Fetch prior history (last 30 messages for context)
  const priorHistory = await db
    .select({ role: aiMessages.role, content: aiMessages.content })
    .from(aiMessages)
    .where(and(eq(aiMessages.userId, session.userId), eq(aiMessages.feature, FEATURE)))
    .orderBy(asc(aiMessages.createdAt))
    .limit(30);

  // Persist user message
  await db.insert(aiMessages).values({
    userId: session.userId,
    feature: FEATURE,
    role: "user",
    content: message,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: buildGlobalMentorSystemPrompt(currentPersona) },
    ...priorHistory.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    { role: "user", content: message },
  ];

  let upstream: ReadableStream<Uint8Array>;
  try {
    upstream = await streamChatCompletion(messages, { temperature: 0.6, maxTokens: 700 });
  } catch (err) {
    console.error("Global mentor stream failed:", err);
    return NextResponse.json({ error: "Mentor tidak bisa dihubungi saat ini. Coba lagi sebentar lagi." }, { status: 502 });
  }

  const userId = session.userId;
  const decoder = new TextDecoder();
  let fullText = "";

  const tee = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          controller.enqueue(value);
        }
        controller.close();
      } catch (err) {
        controller.error(err);
        return;
      }

      if (fullText.trim().length > 0) {
        await db
          .insert(aiMessages)
          .values({ userId, feature: FEATURE, role: "assistant", content: fullText })
          .catch((err) => console.error("Failed to persist mentor reply:", err));
      }
    },
  });

  return new Response(tee, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
