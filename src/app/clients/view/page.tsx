"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Eye,
  FileCode2,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Globe,
  HandCoins,
  History,
  Layers,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  UserCheck,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_CLIENTS, ClientRecord, ClientStatus } from "../page";

type ClientProject = {
  id: number;
  name: string;
  status: "In Progress" | "Completed" | "Review" | "Planning";
  valuation: number;
  startDate: string;
  deadline: string;
  lead: string;
};

type ClientInvoice = {
  id: number;
  invoiceNo: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "Full Paid" | "Partially Paid" | "Due" | "Overdue";
  itemsSummary: string;
};

type ClientPayment = {
  id: number;
  date: string;
  purpose: string;
  method: string;
  trxNo: string;
  amount: number;
};

const CLIENT_PROJECTS_MAP: Record<number, ClientProject[]> = {
  1: [
    {
      id: 1,
      name: "E-commerce Redesign",
      status: "In Progress",
      valuation: 250000,
      startDate: "2024-03-01",
      deadline: "2024-05-15",
      lead: "Kazi Nowshad Abir",
    },
    {
      id: 4,
      name: "Brand Identity & SaaS Web",
      status: "Completed",
      valuation: 120000,
      startDate: "2024-01-10",
      deadline: "2024-02-28",
      lead: "Kazi Nowshad Abir",
    },
  ],
  2: [
    {
      id: 2,
      name: "LodgeOS Integration",
      status: "Review",
      valuation: 450000,
      startDate: "2024-02-15",
      deadline: "2024-04-20",
      lead: "Imtiaz",
    },
  ],
  3: [
    {
      id: 3,
      name: "Mobile App Development",
      status: "In Progress",
      valuation: 300000,
      startDate: "2024-04-01",
      deadline: "2024-07-30",
      lead: "Nowshad Abir",
    },
  ],
  4: [
    {
      id: 4,
      name: "Brand Identity Package",
      status: "Completed",
      valuation: 120000,
      startDate: "2024-01-05",
      deadline: "2024-02-15",
      lead: "Nowshad Abir",
    },
  ],
};

const CLIENT_INVOICES_MAP: Record<number, ClientInvoice[]> = {
  1: [
    {
      id: 1,
      invoiceNo: "INV-26-X4E2",
      date: "2026-08-10",
      dueDate: "2026-08-25",
      amount: 250000,
      paidAmount: 150000,
      status: "Partially Paid",
      itemsSummary: "E-commerce platform frontend milestone & cart API",
    },
    {
      id: 2,
      invoiceNo: "INV-24-AC01",
      date: "2024-01-15",
      dueDate: "2024-01-30",
      amount: 120000,
      paidAmount: 120000,
      status: "Full Paid",
      itemsSummary: "Brand identity design and design token system",
    },
  ],
  2: [
    {
      id: 3,
      invoiceNo: "INV-26-Y5F3",
      date: "2026-08-05",
      dueDate: "2026-08-20",
      amount: 450000,
      paidAmount: 400000,
      status: "Partially Paid",
      itemsSummary: "LodgeOS core enterprise backend & database migration",
    },
  ],
  3: [
    {
      id: 4,
      invoiceNo: "INV-26-ZFT6",
      date: "2026-08-15",
      dueDate: "2026-08-30",
      amount: 300000,
      paidAmount: 300000,
      status: "Full Paid",
      itemsSummary: "React Native iOS and Android application deliverables",
    },
  ],
  4: [
    {
      id: 5,
      invoiceNo: "INV-24-ST01",
      date: "2024-01-10",
      dueDate: "2024-01-25",
      amount: 120000,
      paidAmount: 120000,
      status: "Full Paid",
      itemsSummary: "Complete UI/UX kit & SaaS marketing landing pages",
    },
  ],
};

const CLIENT_PAYMENTS_MAP: Record<number, ClientPayment[]> = {
  1: [
    {
      id: 1,
      date: "2026-08-12",
      purpose: "E-commerce Milestone Phase 1 Advance",
      method: "Bank Transfer",
      trxNo: "EBL-TRX-94812",
      amount: 150000,
    },
    {
      id: 2,
      date: "2024-01-20",
      purpose: "Brand Identity Full Settlement",
      method: "Bank Transfer",
      trxNo: "SCB-8839120",
      amount: 120000,
    },
  ],
  2: [
    {
      id: 3,
      date: "2026-08-08",
      purpose: "LodgeOS Integration Stage 1 & 2 Settlement",
      method: "Bank Transfer",
      trxNo: "CT-8391024",
      amount: 400000,
    },
  ],
  3: [
    {
      id: 4,
      date: "2026-08-16",
      purpose: "Mobile App Development Full Payment",
      method: "Bank Transfer",
      trxNo: "BRAC-992144",
      amount: 300000,
    },
  ],
  4: [
    {
      id: 5,
      date: "2024-01-18",
      purpose: "Full Settlement for Starlight SaaS Website",
      method: "Card / Stripe",
      trxNo: "STRIPE-CH-91823",
      amount: 120000,
    },
  ],
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusBadgeClasses(status: ClientStatus) {
  switch (status) {
    case "VIP":
      return "bg-amber-50 text-amber-800 border-amber-200/80";
    case "Active":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    case "Follow Up":
      return "bg-cyan-50 text-cyan-800 border-cyan-200/80";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200/80";
  }
}

function ClientProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const clientId = rawId ? Number(rawId) || 1 : 1;

  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "invoices" | "payments">(
    "overview"
  );

  const client = useMemo(() => {
    return INITIAL_CLIENTS.find((c) => c.id === clientId) || INITIAL_CLIENTS[0];
  }, [clientId]);

  const projects = CLIENT_PROJECTS_MAP[client.id] || [];
  const invoices = CLIENT_INVOICES_MAP[client.id] || [];
  const payments = CLIENT_PAYMENTS_MAP[client.id] || [];

  const totalContractValuation = projects.reduce((sum, p) => sum + p.valuation, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8 font-sans">
      {/* Dynamic atmospheric background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_23%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_21%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/clients" />

        <SidebarInset className="space-y-6">
          {/* 1. HERO HEADER & QUICK ACTIONS */}
          <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-display text-2xl font-bold shadow-md shadow-slate-900/10">
                {client.business.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Link
                    href="/clients"
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Clients
                  </Link>
                  <span>/</span>
                  <span className="text-cyan-700 font-medium">Client Profile</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {client.business}
                  </h1>
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${statusBadgeClasses(
                      client.status
                    )}`}
                  >
                    {client.status} Client
                  </span>
                </div>

                <p className="text-xs text-slate-600 sm:text-sm">
                  Primary Contact: <span className="font-semibold text-slate-900">{client.contactName}</span> ({client.contactRole}) • Partner Since {client.clientSince}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href={`/invoices/create`}>
                <Button className="rounded-xl bg-slate-900 px-4 text-white hover:bg-slate-800 text-xs font-semibold gap-1.5 shadow-lg shadow-slate-900/10">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  Create Invoice
                </Button>
              </Link>

              <Link href={`/payments`}>
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-100 gap-1.5"
                >
                  <CircleDollarSign className="h-4 w-4 text-emerald-600" />
                  Record Payment
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. FINANCIAL & ACCOUNT KPI CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Contract Value
                  </span>
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700 border border-slate-200/60">
                    <Briefcase className="h-4 w-4 text-cyan-700" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                  {formatBDT(totalContractValuation || client.totalPaid + client.due)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{projects.length} Contracted Projects</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Inflow Paid
                  </span>
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200/60">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-emerald-700">
                  {formatBDT(client.totalPaid)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Realized lifetime payments</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Outstanding Receivables
                  </span>
                  <div className="rounded-xl bg-amber-50 p-2 text-amber-700 border border-amber-200/60">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-amber-700">
                  {formatBDT(client.due)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {client.due > 0 ? "Pending collection" : "Zero active dues"}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Invoices Issued
                  </span>
                  <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700 border border-cyan-200/60">
                    <Receipt className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                  {invoices.length} Invoices
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {invoices.filter((i) => i.status === "Full Paid").length} fully settled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 3. PROFILE NAVIGATION TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              <Building2 className="h-4 w-4" />
              1. Overview & Key Contacts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "projects"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              2. Contracted Projects
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  activeTab === "projects"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {projects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "invoices"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              <Receipt className="h-4 w-4" />
              3. Invoices & Billing
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  activeTab === "invoices"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {invoices.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "payments"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              4. Payment Transactions
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  activeTab === "payments"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {payments.length}
              </span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & KEY CONTACTS                            */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Company & Billing Information */}
              <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-slate-900">
                    Company & Account Details
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Official organization data and account assignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-100">
                    <div>
                      <p className="text-slate-500 font-semibold">Business Name</p>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{client.business}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold">Client Status</p>
                      <span
                        className={`inline-block mt-0.5 rounded-lg px-2.5 py-0.5 text-xs font-bold border ${statusBadgeClasses(
                          client.status
                        )}`}
                      >
                        {client.status} Account
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-100">
                    <div>
                      <p className="text-slate-500 font-semibold">Operating Territory</p>
                      <p className="font-medium text-slate-900 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {client.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold">Relationship Start</p>
                      <p className="font-medium text-slate-900 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {client.clientSince}
                      </p>
                    </div>
                  </div>

                  <div className="pb-2 border-b border-slate-100">
                    <p className="text-slate-500 font-semibold">Assigned Vivago Account Lead</p>
                    <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-cyan-700" />
                      {client.assignedLead} (Managing Director / Account Lead)
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-semibold">Internal Strategy & Notes</p>
                    <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                      {client.notes || "No additional strategic notes specified for this client."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stakeholder & Communication Channels */}
              <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-slate-900">
                    Primary Stakeholder & Contacts
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Direct communication channels for deliverables and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 font-bold text-lg border border-cyan-200/80">
                      {client.contactName.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{client.contactName}</p>
                      <p className="text-slate-500 font-medium">{client.contactRole}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-[11px] text-slate-500 font-semibold">Email Address</p>
                          <a
                            href={`mailto:${client.email}`}
                            className="font-mono font-bold text-slate-900 hover:text-cyan-800"
                          >
                            {client.email}
                          </a>
                        </div>
                      </div>
                      <a
                        href={`mailto:${client.email}`}
                        className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100"
                      >
                        Send Email
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-[11px] text-slate-500 font-semibold">Phone / WhatsApp</p>
                          <a
                            href={`tel:${client.phone}`}
                            className="font-mono font-bold text-slate-900 hover:text-cyan-800"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </div>
                      <a
                        href={`tel:${client.phone}`}
                        className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100"
                      >
                        Call
                      </a>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1">
                      <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Verified Account
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        All invoices and project deliverables are automatically synced with this primary profile.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CONTRACTED PROJECTS                                */}
          {/* ========================================================= */}
          {activeTab === "projects" && (
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Projects & Deliverables
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Software engineering and design projects commissioned by {client.business}
                    </CardDescription>
                  </div>
                  <Link href="/projects/create">
                    <Button size="sm" className="rounded-xl bg-slate-900 text-xs font-semibold gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      New Project
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Project Name</th>
                        <th className="px-4 py-3.5">Assigned Lead</th>
                        <th className="px-4 py-3.5">Timeline</th>
                        <th className="px-4 py-3.5 text-right">Contract Valuation</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No projects currently registered for this client.
                          </td>
                        </tr>
                      ) : (
                        projects.map((proj) => (
                          <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-950 text-sm">
                              {proj.name}
                            </td>

                            <td className="px-4 py-4 font-medium text-slate-700">
                              {proj.lead}
                            </td>

                            <td className="px-4 py-4 text-slate-600 font-mono text-[11px]">
                              {proj.startDate} → {proj.deadline}
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                              {formatBDT(proj.valuation)}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                  proj.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : proj.status === "In Progress"
                                    ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {proj.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <Link href={`/projects/view?id=${proj.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================= */}
          {/* TAB 3: INVOICES & BILLING                                 */}
          {/* ========================================================= */}
          {activeTab === "invoices" && (
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Invoices & Billing History
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      All generated invoices and settlement statements for {client.business}
                    </CardDescription>
                  </div>
                  <Link href="/invoices/create">
                    <Button size="sm" className="rounded-xl bg-slate-900 text-xs font-semibold gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      Create Invoice
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Invoice No</th>
                        <th className="px-4 py-3.5">Description</th>
                        <th className="px-4 py-3.5">Date / Due</th>
                        <th className="px-4 py-3.5 text-right">Invoiced Amount</th>
                        <th className="px-4 py-3.5 text-right">Paid Balance</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No invoices generated for this client yet.
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-slate-950">
                              {inv.invoiceNo}
                            </td>

                            <td className="px-4 py-4 font-medium text-slate-800 max-w-xs truncate">
                              {inv.itemsSummary}
                            </td>

                            <td className="px-4 py-4 font-mono text-[11px] text-slate-600">
                              <p>{inv.date}</p>
                              <p className="text-slate-400">Due {inv.dueDate}</p>
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                              {formatBDT(inv.amount)}
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">
                              {formatBDT(inv.paidAmount)}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                  inv.status === "Full Paid"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <Link href={`/invoices/create?id=${inv.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 gap-1"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  Invoice
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PAYMENT TRANSACTIONS                               */}
          {/* ========================================================= */}
          {activeTab === "payments" && (
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Payment Transaction Receipts
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Verified cash inflows and bank transfer records from {client.business}
                    </CardDescription>
                  </div>
                  <Link href="/payments">
                    <Button size="sm" className="rounded-xl bg-slate-900 text-xs font-semibold gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      Record Payment
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Date Tagged</th>
                        <th className="px-4 py-3.5">Purpose & Note</th>
                        <th className="px-4 py-3.5">Payment Method</th>
                        <th className="px-4 py-3.5">TRX Reference</th>
                        <th className="px-5 py-3.5 text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500">
                            No payment transactions recorded for this client.
                          </td>
                        </tr>
                      ) : (
                        payments.map((pmt) => (
                          <tr key={pmt.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-mono font-medium text-slate-700">
                              {pmt.date}
                            </td>

                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {pmt.purpose}
                            </td>

                            <td className="px-4 py-4 text-slate-700 font-medium">
                              {pmt.method}
                            </td>

                            <td className="px-4 py-4 font-mono text-[11px] text-slate-500">
                              {pmt.trxNo}
                            </td>

                            <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700 text-sm">
                              + {formatBDT(pmt.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </SidebarInset>
      </section>
    </main>
  );
}

export default function ClientViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
          Loading client profile...
        </div>
      }
    >
      <ClientProfileView />
    </Suspense>
  );
}
