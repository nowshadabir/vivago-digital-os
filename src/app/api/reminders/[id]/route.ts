import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateReminderPayload = {
  title?: string;
  type?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: string;
  status?: string;
  note?: string | null;
};

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

function normalizeReminder(reminder: ReminderRow) {
  return {
    ...reminder,
    note: reminder.note ?? "",
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reminderId = parseId(id);
  if (!reminderId) {
    return NextResponse.json({ message: "Invalid reminder id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdateReminderPayload;

    const existing = await prisma.$queryRaw<ReminderRow[]>(Prisma.sql`
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
      WHERE id = ${reminderId}
      LIMIT 1
    `);

    const current = existing[0];
    if (!current) {
      return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
    }

    const title = payload.title?.trim() || current.title;
    const type = payload.type?.trim() || current.type;
    const dueDate = payload.dueDate?.trim() || current.dueDate;
    const dueTime = payload.dueTime?.trim() || current.dueTime;
    const priority = payload.priority?.trim() || current.priority;
    const status = payload.status?.trim() || current.status;
    const note = payload.note !== undefined ? payload.note?.trim() || null : current.note;

    if (!title || !type || !dueDate || !dueTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE reminder
        SET
          title = ${title},
          type = ${type},
          dueDate = ${dueDate},
          dueTime = ${dueTime},
          priority = ${priority},
          status = ${status},
          note = ${note},
          updatedAt = NOW()
        WHERE id = ${reminderId}
      `
    );

    const updated = await prisma.$queryRaw<ReminderRow[]>(Prisma.sql`
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
      WHERE id = ${reminderId}
      LIMIT 1
    `);

    const reminder = updated[0] ? normalizeReminder(updated[0]) : null;
    if (!reminder) {
      return NextResponse.json({ message: "Unable to update reminder" }, { status: 500 });
    }

    return NextResponse.json({ reminder });
  } catch {
    return NextResponse.json({ message: "Unable to update reminder" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reminderId = parseId(id);
  if (!reminderId) {
    return NextResponse.json({ message: "Invalid reminder id" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM reminder WHERE id = ${reminderId}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete reminder" }, { status: 500 });
  }
}