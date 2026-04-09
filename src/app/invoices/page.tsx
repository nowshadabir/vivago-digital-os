"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  FilePlus2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

type LineItemForm = {
  id: number;
  description: string;
  qty: string;
  unitPrice: string;
};

type InvoiceForm = {
  invoiceNumber: string;
  client: string;
  project: string;
  clientPhone: string;
  clientEmail: string;
  issuedDate: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  taxRate: string;
  note: string;
  terms: string;
  signature: string | null;
  lineItems: LineItemForm[];
};

type CurrentUser = {
  id: string;
  name: string;
  position: string | null;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
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

const companyLogoSrc = "/logo/logo.png";
const defaultSignatureSrc = "/uploads/profiles/signature/signature - kazi Nowshad Abir.png";

const defaultForm: InvoiceForm = {
  invoiceNumber: "",
  client: "",
  project: "",
  clientPhone: "",
  clientEmail: "",
  issuedDate: "",
  status: "Draft",
  paymentMethod: "Bank Transfer",
  paymentType: "Advance Payment",
  taxRate: "0",
  note: "",
  terms: "",
  signature: null,
  lineItems: [{ id: Date.now(), description: "", qty: "1", unitPrice: "0" }],
};

function lineTotal(item: { qty: number; unitPrice: number }) {
  return item.qty * item.unitPrice;
}

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClasses(status: InvoiceStatus) {
  if (status === "Paid") return "bg-emerald-100 text-emerald-700";
  if (status === "Sent") return "bg-cyan-100 text-cyan-700";
  if (status === "Overdue") return "bg-rose-100 text-rose-700";
  if (status === "Canceled") return "bg-slate-200 text-slate-700";

  return "bg-amber-100 text-amber-700";
}

function invoiceAmount(invoice: Invoice) {
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const taxAmount = (subTotal * invoice.taxRate) / 100;
  return subTotal + taxAmount;
}

function generateInvoiceNumber() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const code = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join("");

  return `INV-${year}-${code}`;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [formData, setFormData] = useState<InvoiceForm>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>({
    id: "1",
    name: "User",
    position: "Manager",
    username: "user",
    email: "user@example.com",
    role: "ADMIN"
  });

  useEffect(() => {
    async function loadInvoices() {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
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

  const resetForm = () => {
    setFormData({
      ...defaultForm,
      invoiceNumber: generateInvoiceNumber(),
      lineItems: [{ id: Date.now(), description: "", qty: "1", unitPrice: "0" }],
    });
    setEditingInvoiceId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (invoice: Invoice) => {
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      client: invoice.client,
      project: invoice.project,
      clientPhone: invoice.clientPhone,
      clientEmail: invoice.clientEmail,
      issuedDate: invoice.issuedDate,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      paymentType: invoice.paymentType,
      taxRate: String(invoice.taxRate),
      note: invoice.note,
      terms: invoice.terms,
      signature: invoice.signature,
      lineItems: invoice.lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        qty: String(item.qty),
        unitPrice: String(item.unitPrice),
      })),
    });
    setEditingInvoiceId(invoice.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const setField = (field: keyof Omit<InvoiceForm, "lineItems">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setSignatureFromFile = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, signature: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        signature: typeof reader.result === "string" ? reader.result : null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateLineItem = (id: number, field: keyof LineItemForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          description: "",
          qty: "1",
          unitPrice: "0",
        },
      ],
    }));
  };

  const removeLineItem = (id: number) => {
    setFormData((prev) => {
      if (prev.lineItems.length === 1) return prev;
      return {
        ...prev,
        lineItems: prev.lineItems.filter((item) => item.id !== id),
      };
    });
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
  };

  const handleSavePdf = () => {
    window.print();
  };

  const formPreview = useMemo(() => {
    const subTotal = formData.lineItems.reduce((sum, item) => {
      const qty = Number(item.qty);
      const unitPrice = Number(item.unitPrice);
      if (Number.isNaN(qty) || Number.isNaN(unitPrice)) return sum;
      return sum + qty * unitPrice;
    }, 0);

    const taxRate = Number(formData.taxRate);
    const taxAmount = Number.isNaN(taxRate) ? 0 : (subTotal * taxRate) / 100;
    const grandTotal = subTotal + taxAmount;

    return { subTotal, taxAmount, grandTotal };
  }, [formData.lineItems, formData.taxRate]);

  const noteLineBreakCount = useMemo(
    () => (formData.note.match(/\r?\n/g) ?? []).length,
    [formData.note]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    closeModal();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-6 text-slate-900 print:min-h-0 print:bg-white print:px-0 print:py-0 md:px-8 md:py-8">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          body {
            background: #ffffff !important;
          }

          .invoice-print-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #000000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-print-sheet * {
            background: transparent !important;
            color: #000000 !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #000000 !important;
            font-weight: 500 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            border-color: #64748b !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-print-sheet table thead tr {
            border-bottom: 2px solid #0f172a !important;
          }

          .invoice-print-sheet table thead th {
            color: #000000 !important;
            font-weight: 800 !important;
          }

          .invoice-print-sheet h1,
          .invoice-print-sheet h2,
          .invoice-print-sheet h3,
          .invoice-print-sheet .font-semibold,
          .invoice-print-sheet .font-bold {
            font-weight: 700 !important;
          }

          .invoice-print-sheet .print-solid-fallback {
            background: transparent !important;
            color: #000000 !important;
            border-color: #cbd5e1 !important;
          }

          .invoice-print-sheet .print-notes-terms {
            max-height: 120mm;
            overflow: hidden;
          }

          .invoice-print-sheet .print-note-text,
          .invoice-print-sheet .print-terms-text {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            word-break: break-word;
          }

          .invoice-print-sheet .print-note-text {
            -webkit-line-clamp: 4;
          }

          .invoice-print-sheet .print-terms-text {
            -webkit-line-clamp: 10;
          }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_48%)] print:hidden" />

      <section className="relative w-full print:hidden">
        <AppSidebar
          activePath="/invoices"
          className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]"
        />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Invoice Center</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">Invoices</h2>
              <p className="mt-1 text-sm text-slate-600">Create, send, and export invoices as clean A4 PDFs.</p>
            </div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateModal}>
              <FilePlus2 className="h-4 w-4" />
              Create Invoice
            </Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              <>
                <Card className="border-slate-200 bg-white"><CardContent className="p-5"><SkeletonBlock className="h-3 w-20" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white"><CardContent className="p-5"><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-7 w-28" /></CardContent></Card>
                <Card className="border-slate-200 bg-white"><CardContent className="p-5"><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-7 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white"><CardContent className="p-5"><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-7 w-24" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Invoices</p>
                    <p className="mt-1 font-display text-3xl font-semibold text-slate-900">{invoices.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Invoiced</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{formatBDT(totals.totalInvoiced)}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Paid</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-emerald-700">{formatBDT(totals.paid)}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Due</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-amber-700">{formatBDT(totals.due)}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Invoice Register</CardTitle>
              <CardDescription className="text-slate-600">
                Invoice number, client, project, amount, issued date, status, and actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Invoice Number</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Issued</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                      </tr>
                    )) : invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                        <td className="py-3">{invoice.client}</td>
                        <td className="py-3">{invoice.project}</td>
                        <td className="py-3 font-semibold text-slate-900">{formatBDT(invoiceAmount(invoice))}</td>
                        <td className="py-3">{invoice.issuedDate}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100"
                              onClick={() => openEditModal(invoice)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

          <Card className="border-slate-200 bg-white">
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
                  <p>
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
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 p-4 backdrop-blur-sm print:hidden">
          <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col overflow-hidden bg-white sm:h-[calc(100vh-2rem)] sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Invoice Builder</p>
                <h2 className="font-display text-xl font-semibold text-slate-950 sm:text-2xl">
                  {editingInvoiceId !== null ? "Update Invoice" : "Create Invoice"}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Close invoice modal">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Invoice Number</p>
                          <h3 className="mt-1 font-display text-2xl font-semibold text-slate-950 sm:text-3xl">
                            {formData.invoiceNumber || "INV-26-A4D3"}
                          </h3>
                        </div>
                        <Button type="button" className="bg-slate-900 text-white hover:bg-slate-800 print:hidden" onClick={handleSavePdf}>
                          Save as PDF
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="issuedDate">Issue Date</Label>
                          <div className="relative">
                            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="issuedDate"
                              type="date"
                              className="pl-10"
                              value={formData.issuedDate}
                              onChange={(event) => setField("issuedDate", event.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="invoiceStatus">Status</Label>
                          <select
                            id="invoiceStatus"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                            value={formData.status}
                            onChange={(event) => setField("status", event.target.value as InvoiceStatus)}
                          >
                            <option>Draft</option>
                            <option>Sent</option>
                            <option>Paid</option>
                            <option>Overdue</option>
                            <option>Canceled</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bill To</p>
                        <div className="mt-4 grid gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="invoiceClient">Client</Label>
                            <Input id="invoiceClient" placeholder="Client name" value={formData.client} onChange={(event) => setField("client", event.target.value)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="invoiceProject">Project</Label>
                            <Input id="invoiceProject" placeholder="Project name" value={formData.project} onChange={(event) => setField("project", event.target.value)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="invoiceClientPhone">Client Number</Label>
                            <Input id="invoiceClientPhone" placeholder="Client phone number" value={formData.clientPhone} onChange={(event) => setField("clientPhone", event.target.value)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="invoiceClientEmail">Client Email</Label>
                            <Input id="invoiceClientEmail" type="email" placeholder="client@email.com" value={formData.clientEmail} onChange={(event) => setField("clientEmail", event.target.value)} required />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Payment Info</p>
                        <div className="mt-4 grid gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="paymentType">Payment Type</Label>
                            <select id="paymentType" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.paymentType} onChange={(event) => setField("paymentType", event.target.value as PaymentType)}>
                              <option>Advance Payment</option>
                              <option>Partial Payment</option>
                              <option>Final Payment</option>
                            </select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <select id="paymentMethod" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.paymentMethod} onChange={(event) => setField("paymentMethod", event.target.value as PaymentMethod)}>
                              <option>Bank Transfer</option>
                              <option>Cash</option>
                              <option>Card</option>
                              <option>Mobile Banking</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Line Items</p>
                          <p className="mt-1 text-sm text-slate-600">Add the services or products billed in this invoice.</p>
                        </div>
                        <Button type="button" variant="outline" className="h-9 border-slate-300 bg-white" onClick={addLineItem}>
                          <Plus className="h-3.5 w-3.5" />
                          Add Item
                        </Button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {formData.lineItems.map((item, index) => {
                          const qty = Number(item.qty);
                          const unitPrice = Number(item.unitPrice);
                          const total = !Number.isNaN(qty) && !Number.isNaN(unitPrice) ? qty * unitPrice : 0;

                          return (
                            <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(0,1.6fr)_110px_130px_130px_auto] lg:items-center">
                              <Input placeholder="Description" value={item.description} onChange={(event) => updateLineItem(item.id, "description", event.target.value)} required={index === 0} />
                              <Input type="number" min="1" placeholder="Qty" value={item.qty} onChange={(event) => updateLineItem(item.id, "qty", event.target.value)} />
                              <Input type="number" min="0" placeholder="Rate" value={item.unitPrice} onChange={(event) => updateLineItem(item.id, "unitPrice", event.target.value)} />
                              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">{formatBDT(total)}</div>
                              <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => removeLineItem(item.id)} aria-label="Remove line item">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 text-bold">Note</p>
                      <textarea
                        id="invoiceNote"
                        rows={4}
                        placeholder="Short note, delivery message, or payment reminder..."
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                        value={formData.note}
                        onChange={(event) => setField("note", event.target.value)}
                      />
                      <p className="mt-2 text-xs text-slate-500">Line breaks: {noteLineBreakCount}</p>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Terms</p>
                      <textarea
                        id="invoiceTerms"
                        rows={4}
                        placeholder="Add payment terms, due date wording, or service conditions..."
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                        value={formData.terms}
                        onChange={(event) => setField("terms", event.target.value)}
                      />
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="grid gap-2">
                        <Label htmlFor="taxRate">Tax (%)</Label>
                        <Input id="taxRate" type="number" min="0" placeholder="0" value={formData.taxRate} onChange={(event) => setField("taxRate", event.target.value)} />
                      </div>
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span className="font-semibold text-slate-900">{formatBDT(formPreview.subTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Tax ({formData.taxRate || 0}%)</span>
                          <span className="font-semibold text-slate-900">{formatBDT(formPreview.taxAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                          <span>Grand Total</span>
                          <span>{formatBDT(formPreview.grandTotal)}</span>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Signature</p>
                          <p className="mt-1 text-sm text-slate-600">Upload a signature image for the printed invoice.</p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          Upload Signature
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => setSignatureFromFile(event.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                        {formData.signature ? (
                          <div className="space-y-2">
                            <img src={formData.signature} alt="Uploaded signature" className="h-20 w-auto object-contain" />
                            <button type="button" className="text-sm font-medium text-rose-600 hover:text-rose-700" onClick={() => setSignatureFromFile(null)}>
                              Remove signature
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No signature uploaded yet.</p>
                        )}
                      </div>
                    </section>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                        {editingInvoiceId !== null ? "Save Invoice" : "Create Invoice"}
                      </Button>
                      <Button type="button" variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="button" variant="outline" className="border-cyan-300 bg-white text-cyan-800 hover:bg-cyan-50" onClick={() => setField("status", "Sent") }>
                        <Mail className="h-4 w-4" />
                        Mark As Sent
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="hidden print:block">
          <div className="invoice-print-sheet w-[210mm] min-h-[297mm] bg-white px-[10mm] py-[10mm] text-slate-900 shadow-none">
            <div className="flex min-h-[277mm] flex-col">
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-6 border-b border-slate-300 pb-5">
              <div className="flex items-start gap-4">
                <img src={companyLogoSrc} alt="Vivago Digital logo" className="h-12 w-12 rounded-md object-contain" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">VIVAGO DIGITAL</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Invoice</h1>
                </div>
              </div>

              <div className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm text-slate-700">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Invoice Number</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formData.invoiceNumber || "INV-26-A4D3"}</p>
                <div className="mt-3 space-y-1">
                  <p>Date: {formData.issuedDate || "-"}</p>
                  <p>Status: <span className="font-semibold text-sky-800">{formData.status}</span></p>
                </div>
              </div>
                </div>

                <div className="grid gap-4 border-b border-slate-200 py-5 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">From</p>
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">Vivago Digital</p>
                  <p>Dhaka, Bangladesh</p>
                  <p>info@vivagodigital.com</p>
                  <p>accounts@vivagodigital.com</p>
                  <p>+880 1700-000000</p>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bill To</p>
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">{formData.client || "Client name"}</p>
                  <p>Project: {formData.project || "Project name"}</p>
                  <p>Number: {formData.clientPhone || "-"}</p>
                  <p>Email: {formData.clientEmail || "-"}</p>
                </div>
              </div>
                </div>

                <div className="py-5">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="print-solid-fallback border-b-2 border-slate-700 bg-sky-700 text-left text-xs uppercase tracking-[0.18em] text-white">
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Rate</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lineItems.map((item, index) => {
                    const qty = Number(item.qty) || 0;
                    const unitPrice = Number(item.unitPrice) || 0;
                    return (
                      <tr key={item.id} className="border-b border-slate-100 align-top text-slate-700">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-950">{item.description || `Item ${index + 1}`}</p>
                        </td>
                        <td className="px-4 py-3">{qty}</td>
                        <td className="px-4 py-3">{formatBDT(unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-950">{formatBDT(qty * unitPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="print-notes-terms space-y-4">
                <div className="rounded-md bg-transparent p-0 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Note</p>
                  <p className="print-note-text mt-2 leading-6 text-slate-700">{formData.note || "No additional note provided."}</p>
                </div>

                <div className="rounded-md bg-transparent p-0 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Terms</p>
                  <p className="print-terms-text mt-2 whitespace-pre-line leading-6">
                    {formData.terms || "Payment is due according to the selected invoice status and project agreement."}
                  </p>
                </div>

              </div>

              <div className="rounded-md bg-transparent p-0">
                <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-950">{formatBDT(formPreview.subTotal)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-slate-700">
                    <span>Tax ({formData.taxRate || 0}%)</span>
                    <span className="font-semibold text-slate-950">{formatBDT(formPreview.taxAmount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-sky-900">
                    <span>Grand Total</span>
                    <span>{formatBDT(formPreview.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-end pt-6">
              <div className="w-[38%]">
                <div className="bg-transparent px-0 py-3 text-center text-xs text-slate-500">
                  {formData.signature ? (
                    <img src={formData.signature} alt="Signature" className="mx-auto h-16 w-auto object-contain" />
                  ) : (
                    <img src={defaultSignatureSrc} alt="Authorized signature" className="mx-auto h-16 w-auto object-contain" />
                  )}
                </div>

                <div className="mt-1.5 border-t border-slate-200 pt-2 text-[11px] text-slate-700">
                  <p className="font-semibold text-slate-900">Prepared By</p>
                  <p>{currentUser?.name || "-"}</p>
                  <p>{currentUser?.position || currentUser?.role || "-"}</p>
                </div>
              </div>
            </div>

              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-[9px] uppercase tracking-[0.16em] text-slate-500">
                <span>This invoice is system-generated by Vivago Digital Operations</span>
                <span>Thank you for your business</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
