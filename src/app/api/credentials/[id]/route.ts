import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateCredentialPayload = {
  projectId?: number;
  category?: string;
  service?: string;
  endpoint?: string;
  username?: string;
  password?: string;
  reviewDate?: string;
  status?: string;
  note?: string;
};

async function isAuthenticated() {
  const cookieStore = await cookies();
  return (
    cookieStore.get("auth_session")?.value === "1" &&
    Boolean(cookieStore.get("auth_user_id")?.value)
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payload = (await request.json()) as UpdateCredentialPayload;

    if (
      !payload.projectId ||
      !payload.category ||
      !payload.service ||
      !payload.endpoint ||
      !payload.username ||
      !payload.password ||
      !payload.reviewDate ||
      !payload.status
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Credential
        SET
          projectId = ${payload.projectId},
          category = ${payload.category},
          service = ${payload.service},
          endpoint = ${payload.endpoint},
          username = ${payload.username},
          password = ${payload.password},
          reviewDate = ${new Date(payload.reviewDate)},
          status = ${payload.status},
          note = ${payload.note?.trim() || null},
          updatedAt = NOW()
        WHERE id = ${Number(id)}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to update credential" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM Credential
        WHERE id = ${Number(id)}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete credential" }, { status: 500 });
  }
}
