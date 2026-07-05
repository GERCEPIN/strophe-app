import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

const BRAIN_SERVICE_URL = process.env.BRAIN_ANALYSIS_URL;

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  if (!BRAIN_SERVICE_URL) {
    return NextResponse.json({ error: "Layanan analisis otak belum dikonfigurasi." }, { status: 503 });
  }

  let body: { image_base64?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  if (!body.image_base64) {
    return NextResponse.json({ error: "Gambar wajib disertakan." }, { status: 400 });
  }

  // Basic size guard — base64 of a 2 MB image ≈ 2.7 MB string
  if (body.image_base64.length > 4_000_000) {
    return NextResponse.json({ error: "Gambar terlalu besar. Maksimal ~2 MB." }, { status: 413 });
  }

  try {
    const upstream = await fetch(BRAIN_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: body.image_base64, text: body.text ?? "" }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!upstream.ok) {
      const err = await upstream.text().catch(() => "");
      console.error("[brain-analysis] upstream error", upstream.status, err);
      return NextResponse.json({ error: "Analisis gagal. Coba lagi." }, { status: 502 });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[brain-analysis]", msg);
    return NextResponse.json({ error: "Analisis gagal. Coba lagi." }, { status: 500 });
  }
}
