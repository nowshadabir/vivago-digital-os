import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";
import { hashOtpCode } from "@/lib/otp";

type VerifyLoginPayload = {
  challengeId?: number;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifyLoginPayload;
    const challengeId = payload.challengeId;
    const code = payload.code?.trim();

    if (!challengeId || !code) {
      return NextResponse.json({ ok: false, message: "OTP code is required." }, { status: 400 });
    }

    const challenge = await prisma.authOtp.findUnique({ where: { id: challengeId } });
    if (!challenge || challenge.purpose !== "login") {
      return NextResponse.json({ ok: false, message: "OTP request not found." }, { status: 404 });
    }

    if (challenge.verifiedAt) {
      return NextResponse.json({ ok: false, message: "OTP already used." }, { status: 400 });
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, message: "OTP expired. Please request a new one." }, { status: 400 });
    }

    if (challenge.attempts >= 5) {
      return NextResponse.json({ ok: false, message: "Too many attempts. Please request a new OTP." }, { status: 429 });
    }

    if (challenge.codeHash !== hashOtpCode(code)) {
      await prisma.authOtp.update({
        where: { id: challengeId },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ ok: false, message: "Invalid OTP code." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: challenge.email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });
    }

    await prisma.authOtp.update({
      where: { id: challengeId },
      data: { verifiedAt: new Date() },
    });

    const response = NextResponse.json({ ok: true });
    const authToken = await createSessionToken(user.id);

    response.cookies.set("auth_session", "1", sessionCookieOptions);
    response.cookies.set("auth_user_id", user.id, sessionCookieOptions);
    response.cookies.set("auth_token", authToken, sessionCookieOptions);

    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to verify OTP." }, { status: 500 });
  }
}