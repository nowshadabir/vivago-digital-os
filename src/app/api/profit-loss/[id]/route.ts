import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateProfitLossPayload = {
  clientId?: number;
  projectId?: number;
  revenue?: number;
  companyCost?: number;
  temporaryCost?: number;
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
  const recordId = parseId(id);
  if (!recordId) {
    return NextResponse.json({ message: "Invalid profit/loss id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdateProfitLossPayload;

    if (
      !payload.clientId ||
      !payload.projectId ||
      typeof payload.revenue !== "number" ||
      typeof payload.companyCost !== "number" ||
      typeof payload.temporaryCost !== "number"
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE profitlossrecord
        SET
          clientId = ${payload.clientId},
          projectId = ${payload.projectId},
          revenue = ${payload.revenue},
          companyCost = ${payload.companyCost},
          temporaryCost = ${payload.temporaryCost},
          note = ${payload.note?.trim() || null},
          updatedAt = NOW()
        WHERE id = ${recordId}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to update profit/loss record" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recordId = parseId(id);
  if (!recordId) {
    return NextResponse.json({ message: "Invalid profit/loss id" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM profitlossrecord WHERE id = ${recordId}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete profit/loss record" }, { status: 500 });
  }
}
