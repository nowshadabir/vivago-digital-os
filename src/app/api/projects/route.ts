import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type ProjectRow = {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  status: string;
  startDate: Date;
  estimatedDeadline: Date;
  valuation: number;
  companyCost: number;
  temporaryCost: number;
};

type CreateProjectPayload = {
  name?: string;
  clientId?: number;
  status?: string;
  startDate?: string;
  estimatedDeadline?: string;
  valuation?: number;
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

  const projects = await prisma.$queryRaw<ProjectRow[]>(Prisma.sql`
    SELECT
      p.id,
      p.name,
      p.clientId,
      c.name AS clientName,
      p.status,
      p.startDate,
      p.estimatedDeadline,
      p.valuation,
      p.companyCost,
      p.temporaryCost
    FROM Project p
    INNER JOIN Client c ON c.id = p.clientId
    ORDER BY p.createdAt DESC
  `);

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateProjectPayload;

    const name = payload.name?.trim();
    const clientId = payload.clientId;
    const status = payload.status?.trim() || "Planning";
    const startDate = payload.startDate;
    const estimatedDeadline = payload.estimatedDeadline;
    const valuation = payload.valuation ?? 0;

    if (!name || !clientId || !startDate || !estimatedDeadline) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO Project (
          name,
          clientId,
          status,
          startDate,
          estimatedDeadline,
          valuation,
          companyCost,
          temporaryCost,
          createdAt,
          updatedAt
        )
        VALUES (
          ${name},
          ${clientId},
          ${status},
          ${new Date(startDate)},
          ${new Date(estimatedDeadline)},
          ${valuation},
          0,
          0,
          NOW(),
          NOW()
        )
      `
    );

    const created = await prisma.$queryRaw<ProjectRow[]>(Prisma.sql`
      SELECT
        p.id,
        p.name,
        p.clientId,
        c.name AS clientName,
        p.status,
        p.startDate,
        p.estimatedDeadline,
        p.valuation,
        p.companyCost,
        p.temporaryCost
      FROM Project p
      INNER JOIN Client c ON c.id = p.clientId
      WHERE p.name = ${name} AND p.clientId = ${clientId}
      ORDER BY p.id DESC
      LIMIT 1
    `);

    const project = created[0] ?? null;
    if (!project) {
      return NextResponse.json({ message: "Unable to create project" }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create project" }, { status: 500 });
  }
}
