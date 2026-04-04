import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateClientPayload = {
  name?: string;
  email?: string;
  number?: string;
  business?: string;
  status?: "Active" | "Follow Up" | "Delinquent" | "Inactive";
  projectCount?: number;
  totalPaid?: number;
  due?: number;
};

type ClientSummaryRow = {
  id: number;
  name: string;
  email: string;
  number: string;
  business: string;
  projectCount: bigint | number;
  totalPaid: number;
  due: number;
  status: string;
};

function normalizeClientRow(client: ClientSummaryRow) {
  return {
    ...client,
    projectCount: Number(client.projectCount),
  };
}

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
  const clientId = parseId(id);
  if (!clientId) {
    return NextResponse.json({ message: "Invalid client id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdateClientPayload;

    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const number = payload.number?.trim();
    const business = payload.business?.trim();

    if (!name || !email || !number || !business || !payload.status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE client
        SET
          name = ${name},
          email = ${email},
          number = ${number},
          business = ${business},
          status = ${payload.status},
          totalPaid = ${payload.totalPaid ?? 0},
          due = ${payload.due ?? 0},
          updatedAt = NOW()
        WHERE id = ${clientId}
      `
    );

    const rows = await prisma.$queryRaw<ClientSummaryRow[]>(Prisma.sql`
      SELECT
        c.id,
        c.name,
        c.email,
        c.number,
        c.business,
        CAST(COUNT(p.id) AS UNSIGNED) AS projectCount,
        c.totalPaid,
        c.due,
        c.status
      FROM client c
      LEFT JOIN project p ON p.clientId = c.id
      WHERE c.id = ${clientId}
      GROUP BY c.id, c.name, c.email, c.number, c.business, c.totalPaid, c.due, c.status, c.createdAt
      LIMIT 1
    `);

    const client = rows[0] ? normalizeClientRow(rows[0]) : null;
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to update client" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const clientId = parseId(id);
  if (!clientId) {
    return NextResponse.json({ message: "Invalid client id" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM client WHERE id = ${clientId}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete client" }, { status: 500 });
  }
}
