import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiMessages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { streamChatCompletion, type ChatMessage } from "@/lib/ai/openrouter";
import { buildInvestorCoachSystemPrompt, INVESTOR_DISCLAIMER } from "@/lib/ai/prompts/investorCoach";

const FEATURE = "investor_coach" as const;

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const history = await db
    .select({ role: aiMessages.role, content: aiMessages.content, createdAt: aiMessages.createdAt })
    .from(aiMessages)
    .where(and(eq(aiMessages.userId, session.userId), eq(aiMessages.feature, FEATURE)))
    .orderBy(asc(aiMessages.createdAt));

  return NextResponse.json({ history, disclaimer: INVESTOR_DISCLAIMER });
}

const messageSchema = z.object({ message: z.string().trim().min(1).max(4000) });

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
  }
  const { message } = parsed.data;

  const priorHistory = await db
    .select({ role: aiMessages.role, content: aiMessages.content })
    .from(aiMessages)
    .where(and(eq(aiMessages.userId, session.userId), eq(aiMessages.feature, FEATURE)))
    .orderBy(asc(aiMessages.createdAt));

  const isFirstMessage = priorHistory.length === 0;

  await db.insert(aiMessages).values({ userId: session.userId, feature: FEATURE, role: "user", content: message });

  const messages: ChatMessage[] = [
    { role: "system", content: buildInvestorCoachSystemPrompt() },
    ...priorHistory.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    { role: "user", content: message },
  ];

  if (isFirstMessage) {
    // Belt-and-suspenders: even though the system prompt instructs the model
    // to open with the disclaimer, we don't rely on the model alone for a
    // compliance-relevant statement — we prime it explicitly too.
    messages.splice(1, 0, {
      role: "system",
      content: `(Ini pesan pertama di percakapan ini — WAJIB buka balasanmu dengan disclaimer: "${INVESTOR_DISCLAIMER}")`,
    });
  }

  let upstream: ReadableStream<Uint8Array>;
  try {
    upstream = await streamChatCompletion(messages, { temperature: 0.5, maxTokens: 800 });
  } catch (err) {
    console.error("Investor coach stream failed:", err);
    return NextResponse.json({ error: "Coach sedang tidak bisa dihubungi. Coba lagi sebentar lagi." }, { status: 502 });
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
          .catch((err) => console.error("Failed to persist investor coach reply:", err));
      }
    },
  });

  return new Response(tee, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
