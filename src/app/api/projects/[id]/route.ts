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

type UpdateProjectPayload = {
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

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) {
    return NextResponse.json({ message: "Invalid project id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdateProjectPayload;

    const name = payload.name?.trim();
    const clientId = payload.clientId;
    const status = payload.status?.trim();
    const startDate = payload.startDate;
    const estimatedDeadline = payload.estimatedDeadline;
    const valuation = payload.valuation;

    if (!name || !clientId || !status || !startDate || !estimatedDeadline || typeof valuation !== "number") {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Project
        SET
          name = ${name},
          clientId = ${clientId},
          status = ${status},
          startDate = ${new Date(startDate)},
          estimatedDeadline = ${new Date(estimatedDeadline)},
          valuation = ${valuation},
          updatedAt = NOW()
        WHERE id = ${projectId}
      `
    );

    const rows = await prisma.$queryRaw<ProjectRow[]>(Prisma.sql`
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
      WHERE p.id = ${projectId}
      LIMIT 1
    `);

    const project = rows[0] ?? null;
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ message: "Unable to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) {
    return NextResponse.json({ message: "Invalid project id" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM Project WHERE id = ${projectId}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete project" }, { status: 500 });
  }
}
