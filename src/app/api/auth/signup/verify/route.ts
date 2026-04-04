import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

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

    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        email: string;
        purpose: string;
        codeHash: string;
        payload: string | null;
        expiresAt: Date;
        verifiedAt: Date | null;
        attempts: number;
      }>
    >(Prisma.sql`
      SELECT id, email, purpose, codeHash, payload, expiresAt, verifiedAt, attempts
      FROM auth_otp
      WHERE id = ${challengeId}
      LIMIT 1
    `);

    const challenge = rows[0] ?? null;
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
      await prisma.$executeRaw(
        Prisma.sql`UPDATE auth_otp SET attempts = attempts + 1, updatedAt = NOW() WHERE id = ${challengeId}`
      );

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

    const userId = randomUUID();

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO User (
          id,
          name,
          position,
          username,
          email,
          password,
          role,
          image,
          createdAt,
          updatedAt
        )
        VALUES (
          ${userId},
          ${signupPayload.name},
          ${signupPayload.position},
          ${signupPayload.username},
          ${signupPayload.email},
          ${signupPayload.passwordHash},
          ${signupPayload.role},
          ${signupPayload.image},
          NOW(),
          NOW()
        )
      `
    );

    await prisma.$executeRaw(
      Prisma.sql`UPDATE auth_otp SET verifiedAt = NOW(), updatedAt = NOW() WHERE id = ${challengeId}`
    );

    const user = await prisma.user.findUnique({ where: { email: signupPayload.email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unable to create account." }, { status: 500 });
    }

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