"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  HandCoins,
  History,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_CLIENTS, MOCK_DUE_RECORDS, MOCK_PAYMENTS, MOCK_PROJECTS } from "@/lib/mock-data";

type PaymentFlow = "Received" | "Given";
type PaymentStatus = "Completed" | "Pending" | "Failed";
type PaymentMethod = "Bank Transfer" | "Cash" | "Card" | "bKash / Mobile" | "Nagad" | "Mobile Banking";
type CostResponsibility = "Company Expense" | "Client Reimbursable";
type DueStatus = "Upcoming" | "Due Today" | "Overdue" | "Collected";
type PaymentAcknowledgement = "Advance Payment" | "Partial Payment" | "Final Payment" | "Due Payment";

type TrackedInvoice = {
  id: number;
  invoiceNo: string;
  clientName: string;
  projectName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "Full Paid" | "Partially Paid" | "Draft" | "Sent" | "Due" | "Overdue";
};

type PaymentRecord = {
  id: number;
  date: string;
  party: string;
  invoiceNo?: string;
  projectId: number | null;
  projectName: string | null;
  purpose: string;
  acknowledgement: PaymentAcknowledgement | null;
  method: PaymentMethod;
  amount: number;
  flow: PaymentFlow;
  costResponsibility: CostResponsibility | null;
  reimbursementClient: string;
  status: PaymentStatus;
  note: string;
};

type DueRecord = {
  id: number;
  clientId: number | null;
  clientName: string | null;
  invoiceNo?: string;
  projectId: number | null;
  projectName: string | null;
  dueDate: string;
  amount: number;
  status: DueStatus;
  note: string;
};

const initialTrackedInvoices: TrackedInvoice[] = [
  {
    id: 1,
    invoiceNo: "INV-24-X4E2",
    clientName: "Acme Corp",
    projectName: "E-commerce Redesign",
    totalAmount: 250000,
    paidAmount: 150000,
    dueDate: "2024-05-15",
    status: "Partially Paid",
  },
  {
    id: 2,
    invoiceNo: "INV-24-Y5F3",
    clientName: "Global Tech",
    projectName: "LodgeOS Integration",
    totalAmount: 450000,
    paidAmount: 400000,
    dueDate: "2024-04-05",
    status: "Partially Paid",
  },
  {
    id: 3,
    invoiceNo: "INV-26-ZFT6",
    clientName: "Nebula Systems",
    projectName: "Mobile App Development",
    totalAmount: 300000,
    paidAmount: 0,
    dueDate: "2026-09-09",
    status: "Due",
  },
  {
    id: 4,
    invoiceNo: "INV-26-XD4L",
    clientName: "Starlight Inc",
    projectName: "Brand Identity & Web",
    totalAmount: 120000,
    paidAmount: 120000,
    dueDate: "2026-03-20",
    status: "Full Paid",
  },
];

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"dues" | "transactions" | "invoices">("dues");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [invoices, setInvoices] = useState<TrackedInvoice[]>(initialTrackedInvoices);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [dueSearch, setDueSearch] = useState("");
  const [dueStatusFilter, setDueStatusFilter] = useState<string>("All");

  const [txSearch, setTxSearch] = useState("");
  const [txFlowFilter, setTxFlowFilter] = useState<string>("All");

  // Record Payment Modal State
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<TrackedInvoice | null>(null);

  const [paymentFormData, setPaymentFormData] = useState({
    party: "",
    invoiceNo: "",
    projectName: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    method: "Bank Transfer" as PaymentMethod,
    flow: "Received" as PaymentFlow,
    purpose: "Invoice Settlement",
    acknowledgement: "Due Payment" as PaymentAcknowledgement,
    trxRef: "",
    note: "",
  });

  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setPayments(
        MOCK_PAYMENTS.map((p) => ({
          ...p,
          date: p.date,
          acknowledgement: (p.acknowledgement as PaymentAcknowledgement | null) ?? null,
          method: p.method as PaymentMethod,
          flow: p.flow as PaymentFlow,
          costResponsibility: p.costResponsibility as CostResponsibility | null,
          reimbursementClient: p.reimbursementClient ?? "",
          status: p.status as PaymentStatus,
          note: p.note ?? "",
        }))
      );

      setDues(
        MOCK_DUE_RECORDS.map((d) => ({
          ...d,
          dueDate: d.dueDate,
          invoiceNo: d.id === 1 ? "INV-24-X4E2" : d.id === 2 ? "INV-24-Y5F3" : "INV-26-ZFT6",
          status: d.status as DueStatus,
          note: d.note ?? "",
        }))
      );

      setLoading(false);
    };

    void run();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalDueReceivable = dues
      .filter((d) => d.status !== "Collected")
      .reduce((sum, d) => sum + d.amount, 0);

    const overdueDues = dues
      .filter((d) => d.status === "Overdue")
      .reduce((sum, d) => sum + d.amount, 0);

    const totalReceived = payments
      .filter((p) => p.flow === "Received" && p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalGiven = payments
      .filter((p) => p.flow === "Given" && p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const netCashFlow = totalReceived - totalGiven;

    return {
      totalDueReceivable,
      overdueDues,
      totalReceived,
      totalGiven,
      netCashFlow,
      activeDueCount: dues.filter((d) => d.status !== "Collected").length,
      txCount: payments.length,
    };
  }, [dues, payments]);

  // Open modal with pre-selected invoice or fresh
  const openRecordPaymentModal = (targetInvoiceNo?: string, clientName?: string, defaultAmount?: number) => {
    if (targetInvoiceNo) {
      const inv = invoices.find((i) => i.invoiceNo.toLowerCase() === targetInvoiceNo.toLowerCase());
      if (inv) {
        setSelectedInvoice(inv);
        setInvoiceSearchQuery(inv.invoiceNo);
        const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
        setPaymentFormData({
          party: inv.clientName,
          invoiceNo: inv.invoiceNo,
          projectName: inv.projectName,
          amount: String(defaultAmount ?? remaining),
          date: new Date().toISOString().slice(0, 10),
          method: "Bank Transfer",
          flow: "Received",
          purpose: `Payment for ${inv.invoiceNo}`,
          acknowledgement: remaining <= (defaultAmount ?? remaining) ? "Final Payment" : "Partial Payment",
          trxRef: "",
          note: `Received from ${inv.clientName} for ${inv.projectName}`,
        });
        setIsRecordPaymentModalOpen(true);
        return;
      }
    }

    // Fresh record
    setSelectedInvoice(null);
    setInvoiceSearchQuery("");
    setPaymentFormData({
      party: clientName || "",
      invoiceNo: "",
      projectName: "",
      amount: defaultAmount ? String(defaultAmount) : "",
      date: new Date().toISOString().slice(0, 10),
      method: "Bank Transfer",
      flow: "Received",
      purpose: "Client Payment",
      acknowledgement: "Due Payment",
      trxRef: "",
      note: "",
    });
    setIsRecordPaymentModalOpen(true);
  };

  // Select an invoice from search dropdown
  const handleSelectInvoice = (inv: TrackedInvoice) => {
    setSelectedInvoice(inv);
    setInvoiceSearchQuery(inv.invoiceNo);
    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
    setPaymentFormData((prev) => ({
      ...prev,
      party: inv.clientName,
      invoiceNo: inv.invoiceNo,
      projectName: inv.projectName,
      amount: String(remaining),
      purpose: `Payment for ${inv.invoiceNo}`,
      acknowledgement: remaining > 0 ? "Due Payment" : "Final Payment",
    }));
  };

  // Submit payment & update invoice + dues
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = Number(paymentFormData.amount) || 0;
    if (payAmount <= 0 || !paymentFormData.party.trim()) return;

    // 1. Create new payment record in Transaction History
    const newRecord: PaymentRecord = {
      id: Date.now(),
      date: paymentFormData.date,
      party: paymentFormData.party,
      invoiceNo: paymentFormData.invoiceNo || undefined,
      projectId: null,
      projectName: paymentFormData.projectName || null,
      purpose: paymentFormData.purpose || "Payment Record",
      acknowledgement: paymentFormData.acknowledgement,
      method: paymentFormData.method,
      amount: payAmount,
      flow: paymentFormData.flow,
      costResponsibility: null,
      reimbursementClient: "",
      status: "Completed",
      note: paymentFormData.trxRef ? `TRX# ${paymentFormData.trxRef} - ${paymentFormData.note}` : paymentFormData.note,
    };

    setPayments((prev) => [newRecord, ...prev]);

    // 2. If linked to an invoice, update the invoice's paid amount & status
    if (selectedInvoice || paymentFormData.invoiceNo) {
      const invNo = selectedInvoice?.invoiceNo || paymentFormData.invoiceNo;
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.invoiceNo.toLowerCase() === invNo.toLowerCase()) {
            const newPaid = inv.paidAmount + payAmount;
            const newStatus: TrackedInvoice["status"] =
              newPaid >= inv.totalAmount ? "Full Paid" : newPaid > 0 ? "Partially Paid" : "Due";
            return {
              ...inv,
              paidAmount: newPaid,
              status: newStatus,
            };
          }
          return inv;
        })
      );

      // 3. Update related due record if exists
      setDues((prev) =>
        prev.map((due) => {
          if (due.invoiceNo?.toLowerCase() === invNo.toLowerCase() || due.clientName === paymentFormData.party) {
            const remainingDue = Math.max(0, due.amount - payAmount);
            return {
              ...due,
              amount: remainingDue,
              status: remainingDue === 0 ? "Collected" : due.status,
            };
          }
          return due;
        })
      );
    }

    setPaymentSuccessMessage(
      `Successfully recorded payment of ${formatBDT(payAmount)} for ${paymentFormData.party}!`
    );
    setTimeout(() => setPaymentSuccessMessage(null), 4000);

    setIsRecordPaymentModalOpen(false);
  };

  // Filtered Dues
  const filteredDues = useMemo(() => {
    return dues.filter((due) => {
      const matchesSearch =
        !dueSearch ||
        (due.clientName?.toLowerCase().includes(dueSearch.toLowerCase()) ?? false) ||
        (due.projectName?.toLowerCase().includes(dueSearch.toLowerCase()) ?? false) ||
        (due.invoiceNo?.toLowerCase().includes(dueSearch.toLowerCase()) ?? false);

      const matchesStatus =
        dueStatusFilter === "All"
          ? true
          : dueStatusFilter === "Pending"
          ? due.status !== "Collected"
          : due.status === dueStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dues, dueSearch, dueStatusFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return payments.filter((tx) => {
      const matchesSearch =
        !txSearch ||
        tx.party.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.purpose.toLowerCase().includes(txSearch.toLowerCase()) ||
        (tx.invoiceNo?.toLowerCase().includes(txSearch.toLowerCase()) ?? false) ||
        tx.note.toLowerCase().includes(txSearch.toLowerCase());

      const matchesFlow = txFlowFilter === "All" ? true : tx.flow === txFlowFilter;

      return matchesSearch && matchesFlow;
    });
  }, [payments, txSearch, txFlowFilter]);

  // Invoices matching search query in modal
  const matchingInvoiceSuggestions = useMemo(() => {
    if (!invoiceSearchQuery.trim()) return [];
    return invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
        inv.projectName.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
    );
  }, [invoices, invoiceSearchQuery]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.1),transparent_25%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.1),transparent_23%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.08),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

      <AppSidebar activePath="/payments" />

      <SidebarInset className="relative space-y-6">
        {/* SUCCESS BANNER */}
        {paymentSuccessMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-semibold text-emerald-900 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{paymentSuccessMessage}</span>
          </div>
        )}

        {/* 1. TOP HEADER & PRIMARY ACTION */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Financial Operations</span>
              <span>/</span>
              <span className="text-cyan-700 font-medium">Payments & Receivables</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Payments & Dues
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm">
              Manage client dues, record invoice payments, and track cash transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/invoices/create">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-2 shadow-xs"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                Create Invoice
              </Button>
            </Link>

            <Button
              type="button"
              onClick={() => openRecordPaymentModal()}
              className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800 text-xs font-semibold gap-2 shadow-lg shadow-slate-900/10"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* 2. THREE-PILLAR KPI METRICS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Due Receivables */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Client Due List
                </span>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 border border-amber-200/60">
                  <HandCoins className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                {formatBDT(metrics.totalDueReceivable)}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{metrics.activeDueCount} active receivables</span>
                {metrics.overdueDues > 0 && (
                  <span className="font-semibold text-rose-600">
                    {formatBDT(metrics.overdueDues)} overdue
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Money In (Received) */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Total Collected
                </span>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200/60">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                {formatBDT(metrics.totalReceived)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Inflow from settled invoices & advances
              </p>
            </CardContent>
          </Card>

          {/* Money Out (Disbursements) */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                  Expenses & Outflows
                </span>
                <div className="rounded-xl bg-rose-50 p-2 text-rose-600 border border-rose-200/60">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                {formatBDT(metrics.totalGiven)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Company operations & project costs
              </p>
            </CardContent>
          </Card>

          {/* Net Balance */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                  Net Cash Position
                </span>
                <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600 border border-cyan-200/60">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                {formatBDT(metrics.netCashFlow)}
              </p>
              <p className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Positive Operational Margin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. PURPOSE NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("dues")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "dues"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
            }`}
          >
            <HandCoins className="h-4 w-4" />
            1. Due List From Clients
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === "dues" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {metrics.activeDueCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "transactions"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
            }`}
          >
            <History className="h-4 w-4" />
            2. Transaction History (Ledger)
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === "transactions" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {metrics.txCount}
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
            <FileSpreadsheet className="h-4 w-4" />
            3. Invoices & Settlement Tracker
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DUE LIST FROM CLIENTS                              */}
        {/* ========================================================= */}
        {activeTab === "dues" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by client, project, or invoice no..."
                  className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-xs"
                  value={dueSearch}
                  onChange={(e) => setDueSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                {["All", "Pending", "Overdue", "Due Today", "Upcoming", "Collected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDueStatusFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      dueStatusFilter === st
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Dues Table */}
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Client & Business</th>
                        <th className="px-4 py-3.5">Project / Purpose</th>
                        <th className="px-4 py-3.5">Invoice Ref</th>
                        <th className="px-4 py-3.5">Due Date</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Outstanding Amount</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredDues.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No client dues matching your filter.
                          </td>
                        </tr>
                      ) : (
                        filteredDues.map((due) => {
                          const isOverdue = due.status === "Overdue";
                          const isCollected = due.status === "Collected";

                          return (
                            <tr
                              key={due.id}
                              className={`hover:bg-slate-50/70 transition-colors ${
                                isCollected ? "opacity-60 bg-slate-50/40" : ""
                              }`}
                            >
                              <td className="px-5 py-4 font-semibold text-slate-950">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200/60">
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{due.clientName}</p>
                                    <p className="text-[11px] text-slate-500 font-normal">
                                      {due.note || "General Account Receivable"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-slate-700 font-medium">
                                {due.projectName || "Standard Project"}
                              </td>

                              <td className="px-4 py-4">
                                {due.invoiceNo ? (
                                  <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-200/50">
                                    {due.invoiceNo}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">-</span>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{due.dueDate}</span>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                    isCollected
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                      : isOverdue
                                      ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                      : due.status === "Due Today"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                      : "bg-slate-100 text-slate-700 border border-slate-200/60"
                                  }`}
                                >
                                  {isCollected && <CheckCircle2 className="h-3 w-3" />}
                                  {isOverdue && <CircleAlert className="h-3 w-3" />}
                                  {due.status}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-right font-mono text-sm font-bold text-slate-950">
                                {formatBDT(due.amount)}
                              </td>

                              <td className="px-5 py-4 text-right">
                                {isCollected ? (
                                  <span className="text-xs font-semibold text-emerald-700">
                                    Settled
                                  </span>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                      openRecordPaymentModal(
                                        due.invoiceNo,
                                        due.clientName ?? undefined,
                                        due.amount
                                      )
                                    }
                                    className="rounded-xl bg-slate-900 px-3.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 gap-1.5 shadow-xs"
                                  >
                                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                                    Collect
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TRANSACTION HISTORY (LEDGER)                       */}
        {/* ========================================================= */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by party, purpose, note, or TRX#..."
                  className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-xs"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Flow:</span>
                {["All", "Received", "Given"].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setTxFlowFilter(fl)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      txFlowFilter === fl
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {fl === "Received" ? "Money In (Received)" : fl === "Given" ? "Money Out (Given)" : "All Flows"}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Party / Beneficiary</th>
                        <th className="px-4 py-3.5">Purpose & Ref</th>
                        <th className="px-4 py-3.5">Payment Method</th>
                        <th className="px-4 py-3.5">Flow</th>
                        <th className="px-5 py-3.5 text-right">Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No transactions found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => {
                          const isReceived = tx.flow === "Received";

                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-5 py-4 font-mono font-medium text-slate-700">
                                {tx.date}
                              </td>

                              <td className="px-4 py-4 font-semibold text-slate-950">
                                <p className="font-bold">{tx.party}</p>
                                {tx.projectName && (
                                  <p className="text-[11px] text-slate-500 font-normal">
                                    Project: {tx.projectName}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <p className="font-medium text-slate-800">{tx.purpose}</p>
                                {tx.note && (
                                  <p className="text-[11px] text-slate-500 font-mono">
                                    {tx.note}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4 text-slate-700 font-medium">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium border border-slate-200/60">
                                  <CreditCard className="h-3 w-3 text-slate-500" />
                                  {tx.method}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                    isReceived
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                      : "bg-rose-50 text-rose-700 border border-rose-200/60"
                                  }`}
                                >
                                  {isReceived ? (
                                    <>
                                      <ArrowDownLeft className="h-3 w-3" />
                                      Received
                                    </>
                                  ) : (
                                    <>
                                      <ArrowUpRight className="h-3 w-3" />
                                      Given
                                    </>
                                  )}
                                </span>
                              </td>

                              <td
                                className={`px-5 py-4 text-right font-mono text-sm font-bold ${
                                  isReceived ? "text-emerald-700" : "text-slate-900"
                                }`}
                              >
                                {isReceived ? "+ " : "- "}
                                {formatBDT(tx.amount)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: INVOICES & SETTLEMENT TRACKER                      */}
        {/* ========================================================= */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-base text-slate-900">
                  Invoice Payment Status & Settlement
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Track payments allocated to active client invoices and update balances.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Invoice No</th>
                        <th className="px-4 py-3.5">Client & Project</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Invoiced</th>
                        <th className="px-4 py-3.5 text-right">Paid</th>
                        <th className="px-4 py-3.5 text-right">Remaining Due</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {invoices.map((inv) => {
                        const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                        const progressPct = Math.min(100, (inv.paidAmount / inv.totalAmount) * 100);

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-cyan-900">
                              {inv.invoiceNo}
                            </td>

                            <td className="px-4 py-4 font-semibold text-slate-950">
                              <p>{inv.clientName}</p>
                              <p className="text-[11px] text-slate-500 font-normal">{inv.projectName}</p>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase ${
                                  inv.status === "Full Paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : inv.status === "Partially Paid"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                    : "bg-slate-100 text-slate-700 border border-slate-200/60"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-semibold text-slate-900">
                              {formatBDT(inv.totalAmount)}
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-semibold text-emerald-700">
                              {formatBDT(inv.paidAmount)}
                              <div className="mt-1 h-1.5 w-24 ml-auto rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-bold text-slate-950">
                              {formatBDT(remaining)}
                            </td>

                            <td className="px-5 py-4 text-right">
                              {remaining === 0 ? (
                                <span className="text-xs font-bold text-emerald-700">Fully Settled</span>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => openRecordPaymentModal(inv.invoiceNo, inv.clientName, remaining)}
                                  className="rounded-xl bg-slate-900 px-3.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 gap-1.5 shadow-xs"
                                >
                                  <Plus className="h-3.5 w-3.5 text-emerald-400" />
                                  Record Payment
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* RECORD PAYMENT POPUP MODAL (SEARCH VIA INVOICE NO)       */}
        {/* ========================================================= */}
        {isRecordPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Record Payment & Update Invoice
                  </h3>
                  <p className="text-xs text-slate-500">
                    Search invoice number to auto-populate balance, or enter manual payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="space-y-4">
                {/* 1. SEARCH VIA INVOICE NUMBER */}
                <div className="space-y-1.5">
                  <Label htmlFor="invoiceSearch" className="text-xs font-bold text-slate-700">
                    Search Invoice Number (Optional)
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="invoiceSearch"
                      placeholder="e.g. INV-24-X4E2 or client name..."
                      className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-mono font-semibold"
                      value={invoiceSearchQuery}
                      onChange={(e) => {
                        setInvoiceSearchQuery(e.target.value);
                        if (selectedInvoice && e.target.value !== selectedInvoice.invoiceNo) {
                          setSelectedInvoice(null);
                        }
                      }}
                    />
                  </div>

                  {/* Matching Suggestions Dropdown */}
                  {!selectedInvoice && matchingInvoiceSuggestions.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg space-y-1 max-h-48 overflow-y-auto">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Matching Invoices:
                      </p>
                      {matchingInvoiceSuggestions.map((inv) => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => handleSelectInvoice(inv)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-cyan-50 hover:text-cyan-900 transition-colors"
                        >
                          <div>
                            <span className="font-mono font-bold text-slate-900">{inv.invoiceNo}</span>
                            <span className="text-slate-500 ml-2">({inv.clientName})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-900">
                              Due: {formatBDT(Math.max(0, inv.totalAmount - inv.paidAmount))}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Invoice Details Card */}
                {selectedInvoice && (
                  <div className="rounded-2xl border border-cyan-200/80 bg-cyan-50/60 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-950 text-sm">
                        {selectedInvoice.clientName}
                      </span>
                      <span className="font-mono font-bold text-cyan-800">
                        {selectedInvoice.invoiceNo}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-cyan-200/60 pt-2 text-slate-700">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500">Invoiced:</span>
                        <p className="font-bold font-mono">{formatBDT(selectedInvoice.totalAmount)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500">Paid so far:</span>
                        <p className="font-bold font-mono text-emerald-700">
                          {formatBDT(selectedInvoice.paidAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500">Remaining:</span>
                        <p className="font-bold font-mono text-slate-950">
                          {formatBDT(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PARTY / CLIENT NAME & AMOUNT */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="partyName" className="text-xs font-semibold text-slate-700">
                      Client / Party Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="partyName"
                      placeholder="e.g. Acme Corp"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={paymentFormData.party}
                      onChange={(e) => setPaymentFormData((prev) => ({ ...prev, party: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="payAmount" className="text-xs font-semibold text-slate-700">
                      Payment Amount (BDT) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="payAmount"
                      type="number"
                      min="1"
                      placeholder="e.g. 50000"
                      className="h-11 rounded-xl border-slate-200 text-xs font-mono font-bold"
                      value={paymentFormData.amount}
                      onChange={(e) => setPaymentFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* 3. METHOD & DATE */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="payMethod" className="text-xs font-semibold text-slate-700">
                      Payment Method
                    </Label>
                    <select
                      id="payMethod"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-xs outline-none focus:border-cyan-400"
                      value={paymentFormData.method}
                      onChange={(e) =>
                        setPaymentFormData((prev) => ({
                          ...prev,
                          method: e.target.value as PaymentMethod,
                        }))
                      }
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="bKash / Mobile">bKash / Mobile</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="payDate" className="text-xs font-semibold text-slate-700">
                      Payment Date
                    </Label>
                    <Input
                      id="payDate"
                      type="date"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={paymentFormData.date}
                      onChange={(e) => setPaymentFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* 4. TRX REFERENCE & PURPOSE */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="trxRef" className="text-xs font-semibold text-slate-700">
                      Transaction Reference / TRX#
                    </Label>
                    <Input
                      id="trxRef"
                      placeholder="e.g. TRX-998822 or Bank Ref"
                      className="h-11 rounded-xl border-slate-200 text-xs font-mono"
                      value={paymentFormData.trxRef}
                      onChange={(e) => setPaymentFormData((prev) => ({ ...prev, trxRef: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="payPurpose" className="text-xs font-semibold text-slate-700">
                      Purpose / Category
                    </Label>
                    <Input
                      id="payPurpose"
                      placeholder="e.g. Invoice Settlement / Advance"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={paymentFormData.purpose}
                      onChange={(e) => setPaymentFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 5. NOTES */}
                <div className="space-y-1.5">
                  <Label htmlFor="payNote" className="text-xs font-semibold text-slate-700">
                    Payment Note / Remarks
                  </Label>
                  <Input
                    id="payNote"
                    placeholder="Optional remarks or receipt details..."
                    className="h-10 rounded-xl border-slate-200 text-xs"
                    value={paymentFormData.note}
                    onChange={(e) => setPaymentFormData((prev) => ({ ...prev, note: e.target.value }))}
                  />
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRecordPaymentModalOpen(false)}
                    className="rounded-xl border-slate-200 bg-white text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800 text-xs font-semibold shadow-lg shadow-slate-900/10 gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Record & Update Invoice
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SidebarInset>
    </main>
  );
}
