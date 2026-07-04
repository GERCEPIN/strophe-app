import { NextResponse } from "next/server";
import { getCurrentSession, SessionPayload } from "./session";

/**
 * Use at the top of any API route handler that requires a logged-in user.
 * Returns either the session payload, or a ready-to-return 401 response.
 */
export async function requireUser(): Promise<
  { session: SessionPayload; unauthorized: null } | { session: null; unauthorized: NextResponse }
> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: "Belum login. Silakan login dulu." }, { status: 401 }),
    };
  }
  return { session, unauthorized: null };
}
