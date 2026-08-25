"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_CLIENTS } from "@/lib/mock-data";

type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Full Paid"
  | "Partially Paid"
  | "Due"
  | "Overdue"
  | "Canceled";

function getStatusRibbonConfig(status: InvoiceStatus) {
  switch (status) {
    case "Full Paid":
      return {
        label: "FULL PAID",
        className: "ribbon-full-paid bg-emerald-600 border-emerald-700 text-white",
      };
    case "Partially Paid":
      return {
        label: "PARTIALLY PAID",
        className: "ribbon-partially-paid bg-amber-500 border-amber-600 text-white",
      };
    case "Sent":
      return {
        label: "SENT",
        className: "ribbon-sent bg-sky-600 border-sky-700 text-white",
      };
    case "Due":
      return {
        label: "DUE",
        className: "ribbon-due bg-orange-500 border-orange-600 text-white",
      };
    case "Overdue":
      return {
        label: "OVERDUE",
        className: "ribbon-overdue bg-rose-600 border-rose-700 text-white",
      };
    case "Canceled":
      return {
        label: "CANCELED",
        className: "ribbon-canceled bg-zinc-700 border-zinc-800 text-white",
      };
    case "Draft":
    default:
      return {
        label: "DRAFT",
        className: "ribbon-draft bg-slate-500 border-slate-600 text-white",
      };
  }
}

type BillingItem = {
  id: number;
  item: string;
  qty: string;
  rate: string;
  discount: string; // % discount
  tax: string; // % tax
};

type InvoiceData = {
  clientName: string;
  clientEmail: string;
  clientNumber: string;
  invoiceNo: string;
  invoiceDate: string;
  status: InvoiceStatus;
  dueDate: string;
  items: BillingItem[];
  clientNote: string;
  termsConditions: string;
  signature: string | null;
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateInvoiceNo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-26-${randomStr}`;
}

const defaultSignatureSrc = "/uploads/profiles/signature/signature - kazi Nowshad Abir.png";
const invoiceLogoSrc = "/logo/Invoicelogo_logo_trimmed.png";

type ClientDirectoryEntry = {
  id: number;
  business: string;
  contactName: string;
  email: string;
  number: string;
};

const CLIENT_DIRECTORY: ClientDirectoryEntry[] = [
  {
    id: 1,
    business: "Acme Corp",
    contactName: "Alex Vance",
    email: "billing@acme.com",
    number: "+880 1711-223344",
  },
  {
    id: 2,
    business: "Global Tech",
    contactName: "Sarah Connor",
    email: "accounts@globaltech.com",
    number: "+880 1819-556677",
  },
  {
    id: 3,
    business: "Nebula Systems",
    contactName: "David Bowman",
    email: "contact@nebulasystems.io",
    number: "+880 1912-334455",
  },
  {
    id: 4,
    business: "Starlight Inc",
    contactName: "Elena Rostova",
    email: "finance@starlight.org",
    number: "+880 1610-998877",
  },
];

function InvoiceCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  const [formData, setFormData] = useState<InvoiceData>({
    clientName: "",
    clientEmail: "",
    clientNumber: "",
    invoiceNo: "INV-26-0001",
    invoiceDate: "2026-08-25",
    status: "Draft",
    dueDate: "2026-09-09",
    items: [
      {
        id: 1,
        item: "",
        qty: "1",
        rate: "0",
        discount: "0",
        tax: "0",
      },
    ],
    clientNote: "Thank you for your business. We appreciate the opportunity to work with you.",
    termsConditions: "1. Payment is due within the stipulated due date.\n2. Please mention invoice number in your payment reference.\n3. Late payments may be subject to a standard 5% monthly fee.",
    signature: defaultSignatureSrc,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate dynamic invoice number and dates on mount without hydration mismatch
  useEffect(() => {
    if (!editId) {
      const today = new Date();
      const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      setFormData((prev) => ({
        ...prev,
        invoiceNo: generateInvoiceNo(),
        invoiceDate: today.toISOString().slice(0, 10),
        dueDate: due.toISOString().slice(0, 10),
      }));
    }
  }, [editId]);

  // Field change helper
  const handleFieldChange = (field: keyof InvoiceData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filtered matching clients based on typed business name
  const filteredClientSuggestions = useMemo(() => {
    if (!formData.clientName.trim()) return CLIENT_DIRECTORY;
    const query = formData.clientName.toLowerCase();
    return CLIENT_DIRECTORY.filter(
      (c) =>
        c.business.toLowerCase().includes(query) ||
        c.contactName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  }, [formData.clientName]);

  const selectClient = (client: ClientDirectoryEntry) => {
    setFormData((prev) => ({
      ...prev,
      clientName: client.business,
      clientEmail: client.email,
      clientNumber: client.number,
    }));
    setShowClientSuggestions(false);
  };

  // Line item manipulation
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          item: "",
          qty: "1",
          rate: "0",
          discount: "0",
          tax: "0",
        },
      ],
    }));
  };

  const removeItem = (id: number) => {
    setFormData((prev) => {
      if (prev.items.length === 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      };
    });
  };

  const updateItem = (id: number, field: keyof BillingItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  // Signature file handler
  const handleSignatureUpload = (file: File | null) => {
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

  // Financial calculations per item and totals
  const itemCalculations = useMemo(() => {
    return formData.items.map((item) => {
      const qty = Math.max(0, Number(item.qty) || 0);
      const rate = Math.max(0, Number(item.rate) || 0);
      const discountPct = Math.max(0, Math.min(100, Number(item.discount) || 0));
      const taxPct = Math.max(0, Number(item.tax) || 0);

      const baseAmount = qty * rate;
      const discountAmount = (baseAmount * discountPct) / 100;
      const taxableAmount = baseAmount - discountAmount;
      const taxAmount = (taxableAmount * taxPct) / 100;
      const finalAmount = taxableAmount + taxAmount;

      return {
        baseAmount,
        discountAmount,
        taxAmount,
        finalAmount,
      };
    });
  }, [formData.items]);

  const summary = useMemo(() => {
    const subtotal = itemCalculations.reduce((sum, item) => sum + item.baseAmount, 0);
    const totalDiscount = itemCalculations.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTax = itemCalculations.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = itemCalculations.reduce((sum, item) => sum + item.finalAmount, 0);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  }, [itemCalculations]);

  const isSubmitDisabled =
    !formData.clientName.trim() ||
    !formData.invoiceNo.trim() ||
    !formData.invoiceDate ||
    !formData.dueDate ||
    summary.grandTotal <= 0;

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 400));
    setSaveSuccess(true);

    setTimeout(() => {
      router.push("/invoices");
    }, 500);
  };

  const handleSaveAsPdf = () => {
    window.print();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 font-sans print:min-h-0 print:bg-white print:px-0 print:py-0 md:px-8 md:py-8">
      {/* SF Pro Display Font Declarations & Print Stylesheet */}
      <style jsx global>{`
        @font-face {
          font-family: 'SF Pro Display';
          src: url('/fonts/SFPRODISPLAYREGULAR.OTF') format('opentype');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'SF Pro Display';
          src: url('/fonts/SFPRODISPLAYMEDIUM.OTF') format('opentype');
          font-weight: 500 900;
          font-style: normal;
        }

        .sf-pro-font {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif !important;
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html, body {
            background: #ffffff !important;
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-a4-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-a4-sheet .corner-ribbon {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          .invoice-a4-sheet .ribbon-full-paid {
            background-color: #059669 !important;
            border-color: #047857 !important;
          }

          .invoice-a4-sheet .ribbon-partially-paid {
            background-color: #d97706 !important;
            border-color: #b45309 !important;
          }

          .invoice-a4-sheet .ribbon-draft {
            background-color: #64748b !important;
            border-color: #475569 !important;
          }

          .invoice-a4-sheet .ribbon-sent {
            background-color: #0284c7 !important;
            border-color: #0369a1 !important;
          }

          .invoice-a4-sheet .ribbon-due {
            background-color: #ea580c !important;
            border-color: #c2410c !important;
          }

          .invoice-a4-sheet .ribbon-overdue {
            background-color: #e11d48 !important;
            border-color: #be123c !important;
          }

          .invoice-a4-sheet .ribbon-canceled {
            background-color: #3f3f46 !important;
            border-color: #27272a !important;
          }

          .invoice-a4-sheet * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>

      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_23%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_21%)] print:hidden" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px] print:hidden" />

      {/* WEB UI VIEW */}
      <section className="relative w-full print:hidden">
        <AppSidebar activePath="/invoices" />

        <SidebarInset className="space-y-6">
          {/* HEADER & ACTIONS */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link
                  href="/invoices"
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Invoices
                </Link>
                <span>/</span>
                <span className="text-cyan-700 font-medium">
                  {isEditing ? "Edit Invoice" : "Create Invoice"}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {isEditing ? "Edit Invoice" : "Create Invoice"}
              </h1>
              <p className="text-xs text-slate-600 sm:text-sm">
                Fill in client details, billing items, and generate a clean invoice.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/invoices">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsPdf}
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl gap-2 shadow-xs font-semibold"
              >
                <Printer className="h-4 w-4 text-slate-600" />
                Save as PDF
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSaveInvoice(e as any)}
                disabled={isSubmitDisabled || isSubmitting}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 gap-2 font-semibold"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Saved!
                  </>
                ) : isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Invoice
                  </>
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveInvoice} className="space-y-6 pb-12">
            {/* 1. PRIMARY METADATA */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Client Information */}
              <Card className="relative z-30 border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-visible">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 rounded-t-3xl">
                  <CardTitle className="text-base text-slate-900">
                    Client Information (Bill To)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Client business name, email, and contact number
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6 overflow-visible">
                  {/* Business Name (Searchbar type with autocomplete suggestions) */}
                  <div className="relative z-40 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="clientName" className="text-xs font-semibold text-slate-700">
                        Business Name <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-[11px] text-cyan-700 font-medium">
                        Search or type to auto-fill
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="clientName"
                        placeholder="Search business name (e.g. Acme Corp)..."
                        className="pl-10 pr-9 h-11 rounded-xl border-slate-200 bg-white text-sm"
                        value={formData.clientName}
                        onChange={(e) => {
                          handleFieldChange("clientName", e.target.value);
                          setShowClientSuggestions(true);
                        }}
                        onFocus={() => setShowClientSuggestions(true)}
                        required
                        autoComplete="off"
                      />
                      {formData.clientName && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              clientName: "",
                              clientEmail: "",
                              clientNumber: "",
                            }));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rounded-full p-0.5"
                          title="Clear client info"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Floating Suggestion Dropdown */}
                    {showClientSuggestions && filteredClientSuggestions.length > 0 && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowClientSuggestions(false)}
                        />
                        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-900/10 max-h-60 overflow-y-auto no-scrollbar space-y-1 animate-in fade-in zoom-in-95">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Client Directory Suggestions</span>
                            <span className="font-normal text-slate-400">Click to auto-fill</span>
                          </div>
                          {filteredClientSuggestions.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => selectClient(client)}
                              className="flex w-full items-start justify-between rounded-xl p-2.5 text-left text-xs hover:bg-slate-50 transition-colors group cursor-pointer"
                            >
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                                  {client.business}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {client.contactName}
                                </p>
                              </div>
                              <div className="text-right space-y-0.5 text-[11px] text-slate-500">
                                <p className="font-mono text-slate-600">{client.email}</p>
                                <p className="font-mono text-slate-400">{client.number}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail" className="text-xs font-semibold text-slate-700">
                        Client Email
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="clientEmail"
                          type="email"
                          placeholder="info.nowshad@proton.me"
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.clientEmail}
                          onChange={(e) => handleFieldChange("clientEmail", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientNumber" className="text-xs font-semibold text-slate-700">
                        Client Number
                      </Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="clientNumber"
                          placeholder="+880 1700-000000"
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.clientNumber}
                          onChange={(e) => handleFieldChange("clientNumber", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Details */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-slate-900">
                    Invoice Details
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Invoice number, issue date, status, and due date
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Invoice No */}
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNo" className="text-xs font-semibold text-slate-700">
                        Invoice No <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="invoiceNo"
                        placeholder="e.g. INV-26-ZFT6"
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 font-mono"
                        value={formData.invoiceNo}
                        onChange={(e) => handleFieldChange("invoiceNo", e.target.value)}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="invoiceStatus" className="text-xs font-semibold text-slate-700">
                        Invoice Status
                      </Label>
                      <select
                        id="invoiceStatus"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 font-semibold"
                        value={formData.status}
                        onChange={(e) =>
                          handleFieldChange("status", e.target.value as InvoiceStatus)
                        }
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Full Paid">Full Paid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Due">Due</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Invoice Date */}
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate" className="text-xs font-semibold text-slate-700">
                        Invoice Date <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="invoiceDate"
                          type="date"
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.invoiceDate}
                          onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-xs font-semibold text-slate-700">
                        Due Date <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="dueDate"
                          type="date"
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.dueDate}
                          onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2. TABLE FOR BILLING */}
            <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Billing Items
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Item description, quantities, rates, discounts, and taxes
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 border-slate-300 bg-white rounded-xl gap-1.5 text-xs font-semibold"
                    onClick={addItem}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-[minmax(0,2.5fr)_90px_130px_110px_100px_130px_44px] gap-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Item / Description</span>
                  <span>Qty</span>
                  <span>Rate (BDT)</span>
                  <span>Discount (%)</span>
                  <span>Tax (%)</span>
                  <span className="text-right">Amount (BDT)</span>
                  <span></span>
                </div>

                {/* Items rows */}
                {formData.items.map((item, index) => {
                  const calc = itemCalculations[index];
                  return (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 lg:grid-cols-[minmax(0,2.5fr)_90px_130px_110px_100px_130px_44px] lg:items-center"
                    >
                      <div className="space-y-1 lg:space-y-0">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 lg:hidden">
                          Item Description
                        </Label>
                        <Input
                          placeholder="e.g. adadadasdjad WAw awdawd awd d aW DAD AD AD"
                          className="bg-white rounded-xl border-slate-200 text-sm"
                          value={item.item}
                          onChange={(e) => updateItem(item.id, "item", e.target.value)}
                          required={index === 0}
                        />
                      </div>

                      <div className="space-y-1 lg:space-y-0">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 lg:hidden">
                          Qty
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          className="bg-white rounded-xl border-slate-200 text-sm"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1 lg:space-y-0">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 lg:hidden">
                          Rate (BDT)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="bg-white rounded-xl border-slate-200 text-sm"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1 lg:space-y-0">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 lg:hidden">
                          Discount (%)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            className="bg-white rounded-xl border-slate-200 text-sm pr-7"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, "discount", e.target.value)}
                          />
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            %
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 lg:space-y-0">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 lg:hidden">
                          Tax (%)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="bg-white rounded-xl border-slate-200 text-sm pr-7"
                            value={item.tax}
                            onChange={(e) => updateItem(item.id, "tax", e.target.value)}
                          />
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            %
                          </span>
                        </div>
                      </div>

                      <div className="flex h-11 items-center justify-between lg:justify-end rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 font-mono">
                        <span className="text-[10px] font-bold uppercase text-slate-400 lg:hidden">
                          Total:
                        </span>
                        <span>{formatBDT(calc ? calc.finalAmount : 0)}</span>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={formData.items.length === 1}
                          className="h-11 w-11 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl disabled:opacity-30"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Summary Totals Calculation */}
                <div className="mt-6 flex flex-col items-end border-t border-slate-200 pt-5">
                  <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {formatBDT(summary.subtotal)}
                      </span>
                    </div>

                    {summary.totalDiscount > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-700">
                        <span>Total Discount</span>
                        <span className="font-semibold font-mono">
                          - {formatBDT(summary.totalDiscount)}
                        </span>
                      </div>
                    )}

                    {summary.totalTax > 0 && (
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Total Tax</span>
                        <span className="font-semibold text-slate-900 font-mono">
                          + {formatBDT(summary.totalTax)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-slate-900">
                        Grand Total
                      </span>
                      <span className="font-display text-lg font-bold text-emerald-700 font-mono">
                        {formatBDT(summary.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. NOTES, TERMS & SIGNATURE */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <CardTitle className="text-base text-slate-900">
                      Note for Client
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Message, appreciation, or special instructions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <textarea
                      rows={3}
                      placeholder="Write a note to the client..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10"
                      value={formData.clientNote}
                      onChange={(e) => handleFieldChange("clientNote", e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <CardTitle className="text-base text-slate-900">
                      Terms & Conditions
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Payment rules, deadlines, and legal conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <textarea
                      rows={4}
                      placeholder="Specify terms and conditions..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10"
                      value={formData.termsConditions}
                      onChange={(e) => handleFieldChange("termsConditions", e.target.value)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* My Signature Field */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-slate-900">
                    My Signature
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Company signature positioned at the bottom right of the invoice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Signature Preview</p>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 shadow-xs hover:bg-slate-50 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Custom
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                    {formData.signature ? (
                      <div className="space-y-3">
                        <img
                          src={formData.signature}
                          alt="Signature preview"
                          className="mx-auto h-20 max-w-[220px] object-contain"
                        />
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs text-slate-500">Active signature</span>
                          <button
                            type="button"
                            onClick={() => handleFieldChange("signature", null)}
                            className="text-xs font-semibold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">No signature selected.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldChange("signature", defaultSignatureSrc)}
                          className="rounded-xl text-xs"
                        >
                          Use Default Signature
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <p className="font-semibold text-slate-800">Kazi Nowshad Abir</p>
                    <p>Managing Director, Vivago Technologies</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BOTTOM ACTIONS */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Link href="/invoices">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-slate-200 bg-white px-6 rounded-2xl text-sm font-semibold"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsPdf}
                className="h-12 border-slate-200 bg-white px-6 rounded-2xl text-sm font-semibold gap-2 shadow-xs"
              >
                <Printer className="h-4 w-4" />
                Save as PDF
              </Button>
              <Button
                type="submit"
                disabled={isSubmitDisabled || isSubmitting}
                className="h-12 bg-slate-900 px-8 text-white hover:bg-slate-800 rounded-2xl text-sm font-semibold shadow-xl shadow-slate-900/10 gap-2"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Saved!
                  </>
                ) : isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Invoice
                  </>
                )}
              </Button>
            </div>
          </form>
        </SidebarInset>
      </section>

      {/* PRINT-ONLY A4 INVOICE SHEET (Matches exact reference design using SF Pro Display) */}
      <div className="hidden print:block sf-pro-font">
        <div className="invoice-a4-sheet relative overflow-hidden w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[15mm] text-slate-950 shadow-none sf-pro-font">
          {/* Corner Status Ribbon */}
          <div className="absolute top-0 right-0 h-32 w-32 overflow-hidden pointer-events-none z-20">
            <div
              className={`corner-ribbon absolute transform rotate-45 text-center font-extrabold tracking-[0.16em] text-[8.5px] py-1.5 right-[-42px] top-[30px] w-[160px] shadow-sm uppercase ${getStatusRibbonConfig(formData.status).className} border-y`}
            >
              {getStatusRibbonConfig(formData.status).label}
            </div>
          </div>

          <div className="flex min-h-[267mm] flex-col justify-between">
            <div>
              {/* 1. TOP HEADER: Logo on Left, Vivago Contacts on Right */}
              <div className="flex items-center justify-between pb-6">
                <div>
                  <img
                    src={invoiceLogoSrc}
                    alt="Vivago Technologies logo"
                    className="w-[260px] max-w-[280px] h-auto object-contain"
                  />
                </div>

                <div className="text-right text-[11.5px] leading-relaxed text-slate-700 font-normal space-y-1">
                  <p className="flex items-center justify-end gap-1.5 text-slate-800">
                    <MapPin className="h-3 w-3 text-slate-500 stroke-[1.8]" />
                    <span>Dhaka, Bangladesh</span>
                  </p>
                  <p className="flex items-center justify-end gap-1.5 text-slate-800">
                    <Mail className="h-3 w-3 text-slate-500 stroke-[1.8]" />
                    <span>info@getvivago.com</span>
                  </p>
                  <p className="flex items-center justify-end gap-1.5 text-slate-800">
                    <Phone className="h-3 w-3 text-slate-500 stroke-[1.8]" />
                    <span>+880 1700-000000</span>
                  </p>
                  <p className="flex items-center justify-end gap-1.5 text-slate-800">
                    <Globe className="h-3 w-3 text-slate-500 stroke-[1.8]" />
                    <span>www.getvivago.com</span>
                  </p>
                </div>
              </div>

              {/* 2. LARGE BOLD "INVOICE" TITLE & HORIZONTAL DIVIDER */}
              <div className="pt-2">
                <h1 className="text-[44px] font-extrabold tracking-tight text-[#071329] leading-none">
                  INVOICE
                </h1>
                <div className="w-full border-t border-slate-900 mt-5 mb-7"></div>
              </div>

              {/* 3. CLIENT INFO AT LEFT, INVOICE DETAILS ON RIGHT */}
              <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 pb-10 text-[12px]">
                {/* Client Info (Left) */}
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    BILL TO
                  </p>
                  <p className="text-lg font-bold tracking-tight text-slate-950 pt-0.5">
                    {formData.clientName || "Acme Corp"}
                  </p>
                  <p className="text-slate-800 text-[12px] pt-1">
                    <span className="font-semibold text-slate-950">Email:</span>{" "}
                    <span className="text-slate-700">{formData.clientEmail || "-"}</span>
                  </p>
                  <p className="text-slate-800 text-[12px]">
                    <span className="font-semibold text-slate-950">Phone:</span>{" "}
                    <span className="text-slate-700">{formData.clientNumber || "-"}</span>
                  </p>
                </div>

                {/* Invoice Details (Right) */}
                <div className="space-y-2 text-right">
                  <div className="space-y-1.5 inline-block text-left min-w-[210px] ml-auto text-[12px]">
                    <div className="flex justify-between gap-6">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        INVOICE NO.:
                      </span>
                      <span className="font-bold text-slate-950 font-mono text-[12px]">
                        {formData.invoiceNo}
                      </span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        INVOICE DATE:
                      </span>
                      <span className="font-medium text-slate-800">
                        {formData.invoiceDate}
                      </span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        STATUS:
                      </span>
                      <span className="font-bold uppercase text-slate-950 tracking-wide text-[12px]">
                        {formData.status}
                      </span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        DUE DATE:
                      </span>
                      <span className="font-medium text-slate-800">
                        {formData.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BILLING TABLE */}
              <div className="py-2">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-left text-[10.5px] uppercase tracking-[0.14em] text-slate-950 font-bold">
                      <th className="pb-2.5 pr-4">ITEM DESCRIPTION</th>
                      <th className="pb-2.5 px-3 text-center">QTY</th>
                      <th className="pb-2.5 px-3 text-right">RATE</th>
                      <th className="pb-2.5 px-3 text-center">DISCOUNT</th>
                      <th className="pb-2.5 px-3 text-center">TAX</th>
                      <th className="pb-2.5 pl-4 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const calc = itemCalculations[index];
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-200/60 align-top text-slate-800"
                        >
                          <td className="py-3.5 pr-4 font-normal text-slate-950 text-[12px] leading-relaxed max-w-[280px]">
                            {item.item || `Item ${index + 1}`}
                          </td>
                          <td className="py-3.5 px-3 text-center text-[12px] font-medium">
                            {item.qty || 1}
                          </td>
                          <td className="py-3.5 px-3 text-right font-medium text-[12px]">
                            {formatBDT(Number(item.rate) || 0)}
                          </td>
                          <td className="py-3.5 px-3 text-center text-[12px]">
                            {Number(item.discount) > 0 ? `${item.discount}%` : "-"}
                          </td>
                          <td className="py-3.5 px-3 text-center text-[12px]">
                            {Number(item.tax) > 0 ? `${item.tax}%` : "-"}
                          </td>
                          <td className="py-3.5 pl-4 text-right font-bold text-slate-950 text-[12px]">
                            {formatBDT(calc ? calc.finalAmount : 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 5. NOTES, TERMS & SUMMARY TOTALS */}
              <div className="grid grid-cols-[1.3fr_0.7fr] gap-10 pt-8 text-[12px]">
                {/* Left: Notes & Terms (clean typography, no boxes) */}
                <div className="space-y-6 pr-4">
                  {formData.clientNote && (
                    <div className="space-y-1.5">
                      <p className="font-bold uppercase tracking-[0.14em] text-[10px] text-slate-600">
                        NOTE:
                      </p>
                      <p className="text-slate-700 leading-relaxed text-[11.5px] font-normal">
                        {formData.clientNote}
                      </p>
                    </div>
                  )}

                  {formData.termsConditions && (
                    <div className="space-y-1.5">
                      <p className="font-bold uppercase tracking-[0.14em] text-[10px] text-slate-600">
                        TERMS & CONDITIONS:
                      </p>
                      <p className="whitespace-pre-line text-slate-700 leading-relaxed text-[11.5px] font-normal">
                        {formData.termsConditions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Total Billing Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-700 text-[12px]">
                    <span className="font-normal">Subtotal</span>
                    <span className="font-medium text-slate-950">
                      {formatBDT(summary.subtotal)}
                    </span>
                  </div>

                  {summary.totalDiscount > 0 && (
                    <div className="flex justify-between text-[12px] text-slate-700">
                      <span className="font-normal">Discount</span>
                      <span className="font-medium text-emerald-700">
                        - {formatBDT(summary.totalDiscount)}
                      </span>
                    </div>
                  )}

                  {summary.totalTax > 0 && (
                    <div className="flex justify-between text-[12px] text-slate-700">
                      <span className="font-normal">Tax</span>
                      <span className="font-medium text-slate-950">
                        + {formatBDT(summary.totalTax)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-900 pt-3 flex justify-between items-baseline text-slate-950">
                    <span className="uppercase tracking-[0.12em] text-[11px] font-bold">
                      GRAND TOTAL
                    </span>
                    <span className="text-[15px] font-bold tracking-tight">
                      {formatBDT(summary.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. SIGNATURE & FOOTER */}
            <div className="pt-10">
              <div className="flex justify-end">
                <div className="w-[190px] text-center">
                  {formData.signature && (
                    <img
                      src={formData.signature}
                      alt="Authorized signature"
                      className="mx-auto h-12 object-contain"
                    />
                  )}
                  <div className="mt-1.5 border-t border-slate-900 pt-1.5 text-[11px]">
                    <p className="font-bold text-slate-950">Authorized Signature</p>
                    <p className="text-slate-500 font-normal text-[10.5px]">Vivago Technologies</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-300 pt-3 text-[8.5px] uppercase tracking-[0.18em] text-slate-400 font-medium">
                <span>THIS INVOICE IS SYSTEM-GENERATED BY VIVAGO TECHNOLOGIES OPERATIONS</span>
                <span>THANK YOU FOR YOUR BUSINESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function InvoiceCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
          Loading invoice builder...
        </div>
      }
    >
      <InvoiceCreateForm />
    </Suspense>
  );
}
