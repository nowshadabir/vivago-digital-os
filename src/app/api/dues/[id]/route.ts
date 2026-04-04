import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateDuePayload = {
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

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dueId = parseId(id);
  if (!dueId) {
    return NextResponse.json({ message: "Invalid due id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdateDuePayload;

    if (!payload.clientId || !payload.projectId || !payload.dueDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE duerecord
        SET
          clientId = ${payload.clientId},
          projectId = ${payload.projectId},
          dueDate = ${new Date(payload.dueDate)},
          amount = ${payload.amount ?? 0},
          status = ${payload.status ?? "Upcoming"},
          note = ${payload.note?.trim() || null},
          updatedAt = NOW()
        WHERE id = ${dueId}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to update due record" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dueId = parseId(id);
  if (!dueId) {
    return NextResponse.json({ message: "Invalid due id" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM duerecord WHERE id = ${dueId}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete due record" }, { status: 500 });
  }
}
