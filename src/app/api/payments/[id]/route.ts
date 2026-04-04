import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdatePaymentPayload = {
  date?: string;
  party?: string;
  projectId?: number | null;
  purpose?: string;
  acknowledgement?: string | null;
  method?: string;
  amount?: number;
  flow?: string;
  costResponsibility?: string | null;
  reimbursementClient?: string | null;
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
  const paymentId = parseId(id);
  if (!paymentId) {
    return NextResponse.json({ message: "Invalid payment id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdatePaymentPayload;

    if (!payload.date || !payload.party?.trim() || !payload.purpose?.trim() || !payload.method || !payload.flow) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE payment
        SET
          date = ${new Date(payload.date)},
          party = ${payload.party.trim()},
          projectId = ${payload.projectId ?? null},
          purpose = ${payload.purpose.trim()},
          acknowledgement = ${payload.acknowledgement ?? null},
          method = ${payload.method},
          amount = ${payload.amount ?? 0},
          flow = ${payload.flow},
          costResponsibility = ${payload.costResponsibility ?? null},
          reimbursementClient = ${payload.reimbursementClient?.trim() || null},
          status = ${payload.status ?? "Completed"},
          note = ${payload.note?.trim() || null},
          updatedAt = NOW()
        WHERE id = ${paymentId}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to update payment" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const paymentId = parseId(id);
  if (!paymentId) {
    return NextResponse.json({ message: "Invalid payment id" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM payment WHERE id = ${paymentId}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete payment" }, { status: 500 });
  }
}
