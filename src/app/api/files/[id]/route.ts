import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateFilePayload = {
  projectId?: number;
  fileName?: string;
  language?: string;
  sizeKb?: number;
  storagePath?: string;
  fileDate?: string;
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
    const payload = (await request.json()) as UpdateFilePayload;

    if (
      !payload.projectId ||
      !payload.fileName ||
      !payload.language ||
      !payload.storagePath ||
      !payload.fileDate ||
      !payload.status
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE ProjectFile
        SET
          projectId = ${payload.projectId},
          fileName = ${payload.fileName},
          language = ${payload.language},
          sizeKb = ${payload.sizeKb ?? 0},
          storagePath = ${payload.storagePath},
          fileDate = ${new Date(payload.fileDate)},
          status = ${payload.status},
          note = ${payload.note?.trim() || null},
          updatedAt = NOW()
        WHERE id = ${Number(id)}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to update file record" }, { status: 500 });
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
        DELETE FROM ProjectFile
        WHERE id = ${Number(id)}
      `
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete file record" }, { status: 500 });
  }
}
