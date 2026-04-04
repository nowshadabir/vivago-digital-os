import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdatePayload = {
  id: string;
  name: string;
  position: string | null;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  image: string | null;
};

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("auth_session")?.value === "1";
    const authUserId = cookieStore.get("auth_user_id")?.value;

    if (!isAuthenticated || !authUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as UpdatePayload;

    if (!payload.name || !payload.username || !payload.email || !payload.role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE User
        SET
          name = ${payload.name},
          position = ${payload.position},
          username = ${payload.username},
          email = ${payload.email},
          role = ${payload.role},
          image = ${payload.image},
          updatedAt = NOW()
        WHERE id = ${authUserId}
      `
    );

    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        position: string | null;
        username: string;
        email: string;
        role: "USER" | "ADMIN";
        image: string | null;
      }>
    >(Prisma.sql`
      SELECT id, name, position, username, email, role, image
      FROM User
      WHERE id = ${authUserId}
      LIMIT 1
    `);

    const updatedUser = rows[0] ?? null;

    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json({ message: "Unable to update profile" }, { status: 500 });
  }
}
