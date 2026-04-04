import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { generateOtpCode, hashOtpCode, sendOtpEmail } from "@/lib/otp";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }

    const hasStructuredHash = user.password.includes(":");
    const passwordMatches = hasStructuredHash
      ? await verifyPassword(password, user.password)
      : user.password === password;

    if (!passwordMatches) {
      return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }

    if (!hasStructuredHash) {
      const upgradedHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: upgradedHash },
      });
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const challenge = await prisma.authOtp.create({
      data: {
        email: user.email,
        purpose: "login",
        codeHash,
        payload: null,
        expiresAt,
      },
      select: { id: true },
    });

    const challengeId = challenge.id;
    if (!challengeId) {
      return NextResponse.json({ ok: false, message: "Unable to create OTP." }, { status: 500 });
    }

    await sendOtpEmail({ to: user.email, code, purpose: "login" });

    return NextResponse.json({ ok: true, otpRequired: true, challengeId, email: user.email });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to login." }, { status: 500 });
  }
}
