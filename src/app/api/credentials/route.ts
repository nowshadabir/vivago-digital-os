import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CredentialRow = {
  id: number;
  projectId: number;
  projectName: string;
  category: string;
  service: string;
  endpoint: string;
  username: string;
  password: string;
  reviewDate: Date;
  status: string;
  note: string | null;
};

type CreateCredentialPayload = {
  projectId?: number;
  category?: string;
  service?: string;
  endpoint?: string;
  username?: string;
  password?: string;
  reviewDate?: string;
  status?: string;
  note?: string;
};

async function isAuthenticated() {
  const cookieStore = await cookies();
  return (
    cookieStore.get("auth_session")?.value === "1" &&
    Boolean(cookieStore.get("auth_user_id")?.value)
  );
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const credentials = await prisma.$queryRaw<CredentialRow[]>(Prisma.sql`
    SELECT
      cr.id,
      cr.projectId,
      p.name AS projectName,
      cr.category,
      cr.service,
      cr.endpoint,
      cr.username,
      cr.password,
      cr.reviewDate,
      cr.status,
      cr.note
    FROM Credential cr
    INNER JOIN Project p ON p.id = cr.projectId
    ORDER BY cr.createdAt DESC
  `);

  return NextResponse.json({ credentials });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateCredentialPayload;

    if (
      !payload.projectId ||
      !payload.category ||
      !payload.service ||
      !payload.endpoint ||
      !payload.username ||
      !payload.password ||
      !payload.reviewDate ||
      !payload.status
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO Credential (
          projectId,
          category,
          service,
          endpoint,
          username,
          password,
          reviewDate,
          status,
          note,
          createdAt,
          updatedAt
        )
        VALUES (
          ${payload.projectId},
          ${payload.category},
          ${payload.service},
          ${payload.endpoint},
          ${payload.username},
          ${payload.password},
          ${new Date(payload.reviewDate)},
          ${payload.status},
          ${payload.note?.trim() || null},
          NOW(),
          NOW()
        )
      `
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create credential" }, { status: 500 });
  }
}
