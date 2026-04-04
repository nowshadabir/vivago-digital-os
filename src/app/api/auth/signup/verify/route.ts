import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";
import { hashOtpCode } from "@/lib/otp";

type VerifySignupPayload = {
  challengeId?: number;
  code?: string;
};

type SignupPayload = {
  name: string;
  position: string | null;
  username: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  image: string | null;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifySignupPayload;
    const challengeId = payload.challengeId;
    const code = payload.code?.trim();

    if (!challengeId || !code) {
      return NextResponse.json({ ok: false, message: "OTP code is required." }, { status: 400 });
    }

    const challenge = await prisma.authOtp.findUnique({ where: { id: challengeId } });
    if (!challenge || challenge.purpose !== "signup") {
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

    const signupPayload = challenge.payload ? (JSON.parse(challenge.payload) as SignupPayload) : null;
    if (!signupPayload) {
      return NextResponse.json({ ok: false, message: "Signup session missing." }, { status: 400 });
    }

    const emailExists = await prisma.user.findUnique({ where: { email: signupPayload.email } });
    const usernameExists = await prisma.user.findUnique({ where: { username: signupPayload.username } });

    if (emailExists || usernameExists) {
      return NextResponse.json({ ok: false, message: "Email or username already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: signupPayload.name,
        position: signupPayload.position,
        username: signupPayload.username,
        email: signupPayload.email,
        password: signupPayload.passwordHash,
        role: signupPayload.role,
        image: signupPayload.image,
      },
    });

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