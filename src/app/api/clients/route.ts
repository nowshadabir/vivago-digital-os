import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateClientPayload = {
  name?: string;
  email?: string;
  number?: string;
  business?: string;
  status?: "Active" | "Follow Up" | "Delinquent" | "Inactive";
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.$queryRaw<ClientSummaryRow[]>(Prisma.sql`
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
    GROUP BY c.id, c.name, c.email, c.number, c.business, c.totalPaid, c.due, c.status, c.createdAt
    ORDER BY c.createdAt DESC
  `);

  return NextResponse.json({ clients: clients.map(normalizeClientRow) });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateClientPayload;

    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const number = payload.number?.trim();
    const business = payload.business?.trim();
    const status = payload.status ?? "Active";

    if (!name || !email || !number || !business) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO client (name, email, number, business, status, projectCount, totalPaid, due, createdAt, updatedAt)
        VALUES (${name}, ${email}, ${number}, ${business}, ${status}, 0, 0, 0, NOW(), NOW())
      `
    );

    const created = await prisma.$queryRaw<ClientSummaryRow[]>(Prisma.sql`
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
      WHERE c.email = ${email}
      GROUP BY c.id, c.name, c.email, c.number, c.business, c.totalPaid, c.due, c.status, c.createdAt
      ORDER BY c.id DESC
      LIMIT 1
    `);

    const client = created[0] ? normalizeClientRow(created[0]) : null;
    if (!client) {
      return NextResponse.json({ message: "Unable to create client" }, { status: 500 });
    }

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to create client" }, { status: 500 });
  }
}
