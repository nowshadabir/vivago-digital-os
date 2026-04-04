import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CredentialRow = {
  id: number;
  category: string;
  service: string;
  endpoint: string;
  username: string;
  password: string;
  reviewDate: Date;
  status: string;
  note: string | null;
};

type FileRow = {
  id: number;
  fileName: string;
  language: string;
  sizeKb: number;
  storagePath: string;
  fileDate: Date;
  status: string;
  note: string | null;
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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) {
    return NextResponse.json({ message: "Invalid project id" }, { status: 400 });
  }

  const credentials = await prisma.$queryRaw<CredentialRow[]>(Prisma.sql`
    SELECT id, category, service, endpoint, username, password, reviewDate, status, note
    FROM Credential
    WHERE projectId = ${projectId}
    ORDER BY createdAt DESC
  `);

  const files = await prisma.$queryRaw<FileRow[]>(Prisma.sql`
    SELECT id, fileName, language, sizeKb, storagePath, fileDate, status, note
    FROM ProjectFile
    WHERE projectId = ${projectId}
    ORDER BY createdAt DESC
  `);

  return NextResponse.json({ credentials, files });
}
