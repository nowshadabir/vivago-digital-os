"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FilePlus2,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Canceled";
type PaymentMethod = "Bank Transfer" | "Cash" | "Card" | "Mobile Banking";
type PaymentType = "Advance Payment" | "Partial Payment" | "Final Payment";

type LineItem = {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  client: string;
  project: string;
  clientPhone: string;
  clientEmail: string;
  issuedDate: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  taxRate: number;
  note: string;
  terms: string;
  signature: string | null;
  lineItems: LineItem[];
  createdBy?: {
    id: string;
    name: string;
    role: "USER" | "ADMIN";
  } | null;
};

const initialInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-24-X4E2",
    client: "Acme Corp",
    project: "E-commerce Redesign",
    clientPhone: "+8801700000000",
    clientEmail: "billing@acme.com",
    issuedDate: "2024-03-25",
    status: "Paid",
    paymentMethod: "Bank Transfer",
    paymentType: "Advance Payment",
    taxRate: 5,
    note: "Thank you for your business.",
    terms: "Payment is due within 15 days.",
    signature: null,
    lineItems: [
      { id: 1, description: "UI Design Phase", qty: 1, unitPrice: 125000 },
      { id: 2, description: "Frontend Development", qty: 1, unitPrice: 125000 },
    ],
  },
  {
    id: 2,
    invoiceNumber: "INV-24-Y5F3",
    client: "Global Tech",
    project: "LodgeOS Integration",
    clientPhone: "+8801700000001",
    clientEmail: "accounts@globaltech.com",
    issuedDate: "2024-04-01",
    status: "Sent",
    paymentMethod: "Bank Transfer",
    paymentType: "Partial Payment",
    taxRate: 5,
    note: "Partial payment for Integration phase.",
    terms: "Payment is due within 7 days.",
    signature: null,
    lineItems: [
      { id: 1, description: "API Integration", qty: 1, unitPrice: 75000 },
    ],
  },
];

function lineTotal(item: { qty: number; unitPrice: number }) {
  return item.qty * item.unitPrice;
}

function invoiceAmount(invoice: Invoice) {
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const tax = (subTotal * invoice.taxRate) / 100;
  return subTotal + tax;
}

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClasses(status: InvoiceStatus) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-800";
    case "Sent":
      return "bg-sky-100 text-sky-800";
    case "Overdue":
      return "bg-rose-100 text-rose-800";
    case "Canceled":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setInvoices(initialInvoices);
      setIsLoading(false);
    }

    void loadInvoices();
  }, []);

  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoiceAmount(invoice), 0);
    const paid = invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + invoiceAmount(invoice), 0);
    const due = invoices
      .filter((invoice) => invoice.status !== "Paid" && invoice.status !== "Canceled")
      .reduce((sum, invoice) => sum + invoiceAmount(invoice), 0);

    return { totalInvoiced, paid, due };
  }, [invoices]);

  const draftCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "Draft").length,
    [invoices]
  );

  const handleDeleteInvoice = (invoiceId: number) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_48%)]" />

      <section className="relative w-full">
        <AppSidebar activePath="/invoices" />

        <SidebarInset className="space-y-5">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Invoice Center
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                Invoices
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Create, send, and export invoices as clean A4 PDFs.
              </p>
            </div>
            <Link href="/invoices/create">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 gap-2">
                <FilePlus2 className="h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              <>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="mt-2 h-8 w-20" />
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-2 h-7 w-28" />
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="mt-2 h-7 w-24" />
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="mt-2 h-7 w-24" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                      Invoices
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold text-slate-900">
                      {invoices.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                      Total Invoiced
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-slate-900">
                      {formatBDT(totals.totalInvoiced)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                      Paid
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
                      {formatBDT(totals.paid)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                      Due
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-amber-700">
                      {formatBDT(totals.due)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-slate-900">Invoice Register</CardTitle>
              <CardDescription className="text-slate-600 text-xs">
                Invoice number, client, project, amount, issued date, status, and actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-bold">
                      <th className="px-6 py-3.5">Invoice Number</th>
                      <th className="px-6 py-3.5">Client</th>
                      <th className="px-6 py-3.5">Project</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Issued</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index} className="border-b border-slate-100 text-slate-700">
                          <td className="px-6 py-4">
                            <SkeletonBlock className="h-4 w-28" />
                          </td>
                          <td className="px-6 py-4">
                            <SkeletonBlock className="h-4 w-28" />
                          </td>
                          <td className="px-6 py-4">
                            <SkeletonBlock className="h-4 w-28" />
                          </td>
                          <td className="px-6 py-4">
                            <SkeletonBlock className="h-4 w-24" />
                          </td>
                          <td className="px-6 py-4">
                            <SkeletonBlock className="h-4 w-24" />
                          </td>
                          <td className="px-6 py-4">
                            <SkeletonBlock className="h-6 w-20 rounded-full" />
                          </td>
                          <td className="px-6 py-4">
                            <SkeletonBlock className="ml-auto h-9 w-28" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">{invoice.client}</td>
                          <td className="px-6 py-4 text-slate-600">{invoice.project}</td>
                          <td className="px-6 py-4 font-bold text-slate-950 font-mono">
                            {formatBDT(invoiceAmount(invoice))}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{invoice.issuedDate}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                                invoice.status
                              )}`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Link href={`/invoices/create?id=${invoice.id}`}>
                                <Button
                                  variant="outline"
                                  className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100 rounded-xl gap-1.5"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50 rounded-xl"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                    {!isLoading && !invoices.length ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                          No invoices yet. Create your first invoice.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white rounded-2xl">
            <CardContent className="p-5 text-sm text-slate-700">
              {isLoading ? (
                <div className="space-y-3">
                  <SkeletonBlock className="h-5 w-36" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-64" />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                    <Mail className="h-3.5 w-3.5" />
                    Send Workflow
                  </span>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Create invoice when you receive advance, partial, or final payments, then mark status as
                    sent and share with client.
                  </p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Draft invoices: {draftCount}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </SidebarInset>
      </section>
    </main>
  );
}
