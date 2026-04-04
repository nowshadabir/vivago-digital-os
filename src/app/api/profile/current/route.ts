import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("auth_session")?.value === "1";
    const authUserId = cookieStore.get("auth_user_id")?.value;

    if (!isAuthenticated || !authUserId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const users = await prisma.$queryRaw<
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

    const user = users[0] ?? null;

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
