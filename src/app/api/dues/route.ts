import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DueRow = {
  id: number;
  clientId: number | null;
  clientName: string | null;
  projectId: number | null;
  projectName: string | null;
  dueDate: Date;
  amount: number;
  status: string;
  note: string | null;
};

type CreateDuePayload = {
  clientId?: number | null;
  projectId?: number | null;
  dueDate?: string;
  amount?: number;
  status?: string;
  note?: string | null;
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

  const dues = await prisma.$queryRaw<DueRow[]>(Prisma.sql`
    SELECT
      d.id,
      d.clientId,
      c.name AS clientName,
      d.projectId,
      p.name AS projectName,
      d.dueDate,
      d.amount,
      d.status,
      d.note
    FROM duerecord d
    LEFT JOIN client c ON c.id = d.clientId
    LEFT JOIN project p ON p.id = d.projectId
    ORDER BY d.createdAt DESC
  `);

  return NextResponse.json({ dues });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateDuePayload;

    if (!payload.clientId || !payload.projectId || !payload.dueDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO duerecord (
          clientId,
          projectId,
          dueDate,
          amount,
          status,
          note,
          createdAt,
          updatedAt
        )
        VALUES (
          ${payload.clientId},
          ${payload.projectId},
          ${new Date(payload.dueDate)},
          ${payload.amount ?? 0},
          ${payload.status ?? "Upcoming"},
          ${payload.note?.trim() || null},
          NOW(),
          NOW()
        )
      `
    );

    const created = await prisma.$queryRaw<DueRow[]>(Prisma.sql`
      SELECT
        d.id,
        d.clientId,
        c.name AS clientName,
        d.projectId,
        p.name AS projectName,
        d.dueDate,
        d.amount,
        d.status,
        d.note
      FROM duerecord d
      LEFT JOIN client c ON c.id = d.clientId
      LEFT JOIN project p ON p.id = d.projectId
      WHERE d.id = LAST_INSERT_ID()
      LIMIT 1
    `);

    const due = created[0] ?? null;
    if (!due) {
      return NextResponse.json({ message: "Unable to create due record" }, { status: 500 });
    }

    return NextResponse.json({ due }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create due record" }, { status: 500 });
  }
}
