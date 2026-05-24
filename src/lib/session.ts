import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_MAX_AGE_S = 60 * 60 * 4; // 4 hours

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not configured");
  return secret;
}

export function createSession(
  role: string,
  response: NextResponse
): NextResponse {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${role}:${timestamp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  const token = `${payload}:${sig}`;

  response.cookies.set("admin-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TOKEN_MAX_AGE_S,
  });

  return response;
}

export function verifySession(request: NextRequest): string | null {
  const token = request.cookies.get("admin-session")?.value;
  if (!token) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [role, timestampStr, sig] = parts;
  const timestamp = Number(timestampStr);
  if (!role || !Number.isFinite(timestamp)) return null;

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (now - timestamp > TOKEN_MAX_AGE_S) return null;

  // Verify signature
  let expectedSig: string;
  try {
    expectedSig = createHmac("sha256", getSecret())
      .update(`${role}:${timestampStr}`)
      .digest("hex");
  } catch {
    return null;
  }

  // Timing-safe comparison
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expectedSig, "hex");
  if (a.length !== b.length) return null;

  try {
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return role;
}
