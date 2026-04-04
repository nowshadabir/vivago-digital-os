import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type ProfitLossRow = {
  id: number;
  clientId: number;
  clientName: string;
  projectId: number;
  projectName: string;
  revenue: number;
  companyCost: number;
  temporaryCost: number;
  note: string | null;
};

type CreateProfitLossPayload = {
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.$queryRaw<ProfitLossRow[]>(Prisma.sql`
    SELECT
      pl.id,
      pl.clientId,
      c.name AS clientName,
      pl.projectId,
      p.name AS projectName,
      pl.revenue,
      pl.companyCost,
      pl.temporaryCost,
      pl.note
    FROM profitlossrecord pl
    INNER JOIN client c ON c.id = pl.clientId
    INNER JOIN project p ON p.id = pl.projectId
    ORDER BY pl.createdAt DESC
  `);

  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateProfitLossPayload;

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
        INSERT INTO profitlossrecord (
          clientId,
          projectId,
          revenue,
          companyCost,
          temporaryCost,
          note,
          createdAt,
          updatedAt
        )
        VALUES (
          ${payload.clientId},
          ${payload.projectId},
          ${payload.revenue},
          ${payload.companyCost},
          ${payload.temporaryCost},
          ${payload.note?.trim() || null},
          NOW(),
          NOW()
        )
      `
    );

    const created = await prisma.$queryRaw<ProfitLossRow[]>(Prisma.sql`
      SELECT
        pl.id,
        pl.clientId,
        c.name AS clientName,
        pl.projectId,
        p.name AS projectName,
        pl.revenue,
        pl.companyCost,
        pl.temporaryCost,
        pl.note
      FROM profitlossrecord pl
      INNER JOIN client c ON c.id = pl.clientId
      INNER JOIN project p ON p.id = pl.projectId
      WHERE pl.id = LAST_INSERT_ID()
      LIMIT 1
    `);

    const record = created[0] ?? null;
    if (!record) {
      return NextResponse.json({ message: "Unable to create profit/loss record" }, { status: 500 });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create profit/loss record" }, { status: 500 });
  }
}
