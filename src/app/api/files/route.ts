import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type FileRow = {
  id: number;
  projectId: number;
  projectName: string;
  fileName: string;
  language: string;
  sizeKb: number;
  storagePath: string;
  fileDate: Date;
  status: string;
  note: string | null;
};

type CreateFilePayload = {
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const files = await prisma.$queryRaw<FileRow[]>(Prisma.sql`
    SELECT
      pf.id,
      pf.projectId,
      p.name AS projectName,
      pf.fileName,
      pf.language,
      pf.sizeKb,
      pf.storagePath,
      pf.fileDate,
      pf.status,
      pf.note
    FROM ProjectFile pf
    INNER JOIN Project p ON p.id = pf.projectId
    ORDER BY pf.createdAt DESC
  `);

  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateFilePayload;

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
        INSERT INTO ProjectFile (
          projectId,
          fileName,
          language,
          sizeKb,
          storagePath,
          fileDate,
          status,
          note,
          createdAt,
          updatedAt
        )
        VALUES (
          ${payload.projectId},
          ${payload.fileName},
          ${payload.language},
          ${payload.sizeKb ?? 0},
          ${payload.storagePath},
          ${new Date(payload.fileDate)},
          ${payload.status},
          ${payload.note?.trim() || null},
          NOW(),
          NOW()
        )
      `
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create file record" }, { status: 500 });
  }
}
