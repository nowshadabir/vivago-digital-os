import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type InvoiceLineItemPayload = {
  id?: number;
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

function generateInvoiceNumber() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const code = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join("");

  return `INV-${year}-${code}`;
}

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
    createdBy: invoice.createdBy
      ? {
          id: invoice.createdBy.id,
          name: invoice.createdBy.name,
          role: invoice.createdBy.role,
        }
      : null,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
  };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      lineItems: {
        orderBy: { id: "asc" },
      },
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invoices: invoices.map((invoice) => ({
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
  })) });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as InvoicePayload;
    const invoiceNumber = payload.invoiceNumber?.trim() || generateInvoiceNumber();
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
    const createdById = (await cookies()).get("auth_user_id")?.value ?? null;

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

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber,
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
        createdById,
        lineItems: {
          create: parsedLineItems,
        },
      },
      include: {
        lineItems: {
          orderBy: { id: "asc" },
        },
        createdBy: true,
      },
    });

    return NextResponse.json({ invoice: await serializeInvoice(created) }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ message: "Invoice number already exists" }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to create invoice" }, { status: 500 });
  }
}