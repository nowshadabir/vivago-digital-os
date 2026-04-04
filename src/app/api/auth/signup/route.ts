import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateOtpCode, hashOtpCode, sendOtpEmail } from "@/lib/otp";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFilename(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const position = String(formData.get("position") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "USER") as "USER" | "ADMIN";
    const imageFile = formData.get("image");

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Name, username, email and password are required." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email or username already exists." },
        { status: 409 }
      );
    }

    let imagePath: string | null = null;
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > MAX_PROFILE_IMAGE_SIZE) {
        return NextResponse.json({ ok: false, message: "Profile image must be 5MB or smaller." }, { status: 400 });
      }

      if (!ALLOWED_PROFILE_IMAGE_TYPES.has(imageFile.type)) {
        return NextResponse.json({ ok: false, message: "Only JPG, PNG, and WebP images are allowed." }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
      await mkdir(uploadDir, { recursive: true });

      const safeName = sanitizeFilename(imageFile.name || "profile-image");
      const uniqueFileName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      const bytes = await imageFile.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      imagePath = `/uploads/profiles/${uniqueFileName}`;
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const payload = {
      name,
      position: position || null,
      username,
      email,
      passwordHash: hashedPassword,
      role,
      image: imagePath,
    };

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO auth_otp (
          email,
          purpose,
          codeHash,
          payload,
          expiresAt,
          attempts,
          createdAt,
          updatedAt
        )
        VALUES (
          ${email},
          ${"signup"},
          ${codeHash},
          ${JSON.stringify(payload)},
          ${expiresAt},
          0,
          NOW(),
          NOW()
        )
      `
    );

    const otpRows = await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id FROM auth_otp WHERE email = ${email} AND purpose = 'signup' ORDER BY id DESC LIMIT 1
    `);

    const challengeId = otpRows[0]?.id ?? null;
    if (!challengeId) {
      return NextResponse.json({ ok: false, message: "Unable to create OTP." }, { status: 500 });
    }

    await sendOtpEmail({ to: email, code, purpose: "signup" });

    return NextResponse.json({ ok: true, otpRequired: true, challengeId, email }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to create account." }, { status: 500 });
  }
}
