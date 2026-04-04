import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type PaymentRow = {
  id: number;
  date: Date;
  party: string;
  projectId: number | null;
  projectName: string | null;
  purpose: string;
  acknowledgement: string | null;
  method: string;
  amount: number;
  flow: string;
  costResponsibility: string | null;
  reimbursementClient: string | null;
  status: string;
  note: string | null;
};

type CreatePaymentPayload = {
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payments = await prisma.$queryRaw<PaymentRow[]>(Prisma.sql`
    SELECT
      pay.id,
      pay.date,
      pay.party,
      pay.projectId,
      p.name AS projectName,
      pay.purpose,
      pay.acknowledgement,
      pay.method,
      pay.amount,
      pay.flow,
      pay.costResponsibility,
      pay.reimbursementClient,
      pay.status,
      pay.note
    FROM payment pay
    LEFT JOIN project p ON p.id = pay.projectId
    ORDER BY pay.createdAt DESC
  `);

  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreatePaymentPayload;

    if (!payload.date || !payload.party?.trim() || !payload.purpose?.trim() || !payload.method || !payload.flow) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO payment (
          date,
          party,
          projectId,
          purpose,
          acknowledgement,
          method,
          amount,
          flow,
          costResponsibility,
          reimbursementClient,
          status,
          note,
          createdAt,
          updatedAt
        )
        VALUES (
          ${new Date(payload.date)},
          ${payload.party.trim()},
          ${payload.projectId ?? null},
          ${payload.purpose.trim()},
          ${payload.acknowledgement ?? null},
          ${payload.method},
          ${payload.amount ?? 0},
          ${payload.flow},
          ${payload.costResponsibility ?? null},
          ${payload.reimbursementClient?.trim() || null},
          ${payload.status ?? "Completed"},
          ${payload.note?.trim() || null},
          NOW(),
          NOW()
        )
      `
    );

    const created = await prisma.$queryRaw<PaymentRow[]>(Prisma.sql`
      SELECT
        pay.id,
        pay.date,
        pay.party,
        pay.projectId,
        p.name AS projectName,
        pay.purpose,
        pay.acknowledgement,
        pay.method,
        pay.amount,
        pay.flow,
        pay.costResponsibility,
        pay.reimbursementClient,
        pay.status,
        pay.note
      FROM payment pay
      LEFT JOIN project p ON p.id = pay.projectId
      WHERE pay.id = LAST_INSERT_ID()
      LIMIT 1
    `);

    const payment = created[0] ?? null;
    if (!payment) {
      return NextResponse.json({ message: "Unable to create payment" }, { status: 500 });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create payment" }, { status: 500 });
  }
}
