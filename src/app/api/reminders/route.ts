import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type ReminderRow = {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  dueTime: string;
  priority: string;
  status: string;
  note: string | null;
};

type CreateReminderPayload = {
  title?: string;
  type?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: string;
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

function normalizeReminder(reminder: ReminderRow) {
  return {
    ...reminder,
    note: reminder.note ?? "",
  };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const reminders = await prisma.$queryRaw<ReminderRow[]>(Prisma.sql`
    SELECT
      id,
      title,
      type,
      dueDate,
      dueTime,
      priority,
      status,
      note
    FROM reminder
    ORDER BY createdAt DESC
  `);

  return NextResponse.json({ reminders: reminders.map(normalizeReminder) });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CreateReminderPayload;

    const title = payload.title?.trim();
    const type = payload.type?.trim();
    const dueDate = payload.dueDate?.trim();
    const dueTime = payload.dueTime?.trim();

    if (!title || !type || !dueDate || !dueTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO reminder (
          title,
          type,
          dueDate,
          dueTime,
          priority,
          status,
          note,
          createdAt,
          updatedAt
        )
        VALUES (
          ${title},
          ${type},
          ${dueDate},
          ${dueTime},
          ${payload.priority?.trim() || "Medium"},
          ${payload.status?.trim() || "Pending"},
          ${payload.note?.trim() || null},
          NOW(),
          NOW()
        )
      `
    );

    const created = await prisma.$queryRaw<ReminderRow[]>(Prisma.sql`
      SELECT
        id,
        title,
        type,
        dueDate,
        dueTime,
        priority,
        status,
        note
      FROM reminder
      WHERE id = LAST_INSERT_ID()
      LIMIT 1
    `);

    const reminder = created[0] ? normalizeReminder(created[0]) : null;
    if (!reminder) {
      return NextResponse.json({ message: "Unable to create reminder" }, { status: 500 });
    }

    return NextResponse.json({ reminder }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create reminder" }, { status: 500 });
  }
}