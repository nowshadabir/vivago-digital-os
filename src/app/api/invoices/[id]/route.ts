import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type InvoiceLineItemPayload = {
  description?: string;
  qty?: number;
  unitPrice?: number;
};

type InvoicePayload = {
  invoiceNumber?: string;
  client?: string;
  project?: string;
  clientPhone?: string;
  clientEmail?: string;
  issuedDate?: string;
  status?: string;
  paymentMethod?: string;
  paymentType?: string;
  taxRate?: number;
  note?: string;
  terms?: string;
  signature?: string | null;
  lineItems?: InvoiceLineItemPayload[];
};

type InvoiceRecord = Prisma.InvoiceGetPayload<{
  include: {
    lineItems: true;
    createdBy: true;
  };
}>;

async function isAuthenticated() {
  const cookieStore = await cookies();
  return (
    cookieStore.get("auth_session")?.value === "1" &&
    Boolean(cookieStore.get("auth_user_id")?.value)
  );
}

function serializeInvoice(invoice: InvoiceRecord | null) {
  if (!invoice) {
    return null;
  }

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    client: invoice.clientName,
    project: invoice.projectName,
    clientPhone: invoice.clientPhone,
    clientEmail: invoice.clientEmail,
    issuedDate: invoice.issuedDate.toISOString().slice(0, 10),
    status: invoice.status,
    paymentMethod: invoice.paymentMethod,
    paymentType: invoice.paymentType,
    taxRate: invoice.taxRate,
    note: invoice.note ?? "",
    terms: invoice.terms ?? "",
    signature: invoice.signature ?? null,
    createdBy: invoice.createdBy,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
  };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const invoiceId = Number(id);
    if (!Number.isInteger(invoiceId)) {
      return NextResponse.json({ message: "Invalid invoice id" }, { status: 400 });
    }

    const payload = (await request.json()) as InvoicePayload;
    const client = payload.client?.trim();
    const project = payload.project?.trim();
    const clientPhone = payload.clientPhone?.trim();
    const clientEmail = payload.clientEmail?.trim();
    const issuedDate = payload.issuedDate;
    const status = payload.status?.trim() || "Draft";
    const paymentMethod = payload.paymentMethod?.trim() || "Bank Transfer";
    const paymentType = payload.paymentType?.trim() || "Advance Payment";
    const taxRate = Number.isFinite(payload.taxRate) ? Math.trunc(payload.taxRate ?? 0) : 0;
    const note = payload.note?.trim() || null;
    const terms = payload.terms?.trim() || null;
    const signature = payload.signature?.trim() || null;
    const lineItems = payload.lineItems ?? [];

    if (!client || !project || !clientPhone || !clientEmail || !issuedDate || lineItems.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const parsedLineItems = lineItems.map((item) => ({
      description: item.description?.trim() ?? "",
      qty: Number(item.qty ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
    }));

    if (parsedLineItems.some((item) => !item.description || item.qty <= 0 || item.unitPrice < 0)) {
      return NextResponse.json({ message: "Invalid line items" }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        clientName: client,
        projectName: project,
        clientPhone,
        clientEmail,
        issuedDate: new Date(`${issuedDate}T00:00:00`),
        status,
        paymentMethod,
        paymentType,
        taxRate,
        note,
        terms,
        signature,
        lineItems: {
          deleteMany: {},
          create: parsedLineItems,
        },
      },
      include: {
        lineItems: true,
        createdBy: true,
      },
    });

    return NextResponse.json({ invoice: serializeInvoice(updated) });
  } catch {
    return NextResponse.json({ message: "Unable to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const invoiceId = Number(id);
    if (!Number.isInteger(invoiceId)) {
      return NextResponse.json({ message: "Invalid invoice id" }, { status: 400 });
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unable to delete invoice" }, { status: 500 });
  }
}
