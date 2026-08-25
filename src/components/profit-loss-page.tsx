"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  CreditCard,
  DollarSign,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  HardDrive,
  Layers,
  Percent,
  PieChart,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ExpenseCategory =
  | "Salary & Payroll"
  | "Software Subscriptions"
  | "Cloud & Infrastructure"
  | "Office Rent & Utilities"
  | "Contractor & Freelancers"
  | "Hardware & Devices"
  | "Marketing & Sales"
  | "Legal & Accounting";

type RevenueCategory =
  | "Custom Software Development"
  | "Monthly Maintenance & Retainer"
  | "UI/UX & Product Design"
  | "SaaS & API Subscriptions"
  | "Cloud Architecture Consulting";

type ExpenseItem = {
  id: number;
  date: string;
  category: ExpenseCategory;
  vendor: string;
  title: string;
  amount: number;
  paymentMethod: "Bank Transfer" | "Card" | "bKash / Mobile" | "Cash";
  isRecurring: boolean;
  projectAllocated?: string;
  status: "Settled" | "Pending Approval";
};

type RevenueItem = {
  id: number;
  date: string;
  invoiceNo: string;
  client: string;
  project: string;
  category: RevenueCategory;
  invoicedAmount: number;
  receivedAmount: number;
  status: "Full Paid" | "Partially Paid" | "Due";
};

type ProjectProfitSummary = {
  id: number;
  projectName: string;
  clientName: string;
  contractValue: number;
  totalCollected: number;
  directCOGS: number;
  allocatedPayroll: number;
  netProfit: number;
  marginPct: number;
  status: "Completed" | "In Progress" | "Review";
};

const initialRevenues: RevenueItem[] = [
  {
    id: 1,
    date: "2026-08-15",
    invoiceNo: "INV-26-ZFT6",
    client: "Nebula Systems",
    project: "Mobile App Development",
    category: "Custom Software Development",
    invoicedAmount: 300000,
    receivedAmount: 300000,
    status: "Full Paid",
  },
  {
    id: 2,
    date: "2026-08-01",
    invoiceNo: "INV-26-XD4L",
    client: "Starlight Inc",
    project: "Brand Identity & SaaS Web",
    category: "UI/UX & Product Design",
    invoicedAmount: 120000,
    receivedAmount: 120000,
    status: "Full Paid",
  },
  {
    id: 3,
    date: "2026-08-10",
    invoiceNo: "INV-26-X4E2",
    client: "Acme Corp",
    project: "E-commerce Redesign",
    category: "Custom Software Development",
    invoicedAmount: 250000,
    receivedAmount: 150000,
    status: "Partially Paid",
  },
  {
    id: 4,
    date: "2026-08-05",
    invoiceNo: "INV-26-Y5F3",
    client: "Global Tech",
    project: "LodgeOS Integration",
    category: "Cloud Architecture Consulting",
    invoicedAmount: 450000,
    receivedAmount: 400000,
    status: "Partially Paid",
  },
  {
    id: 5,
    date: "2026-08-20",
    invoiceNo: "INV-26-RET1",
    client: "Apex Health Ltd",
    project: "Healthcare OS Maintenance",
    category: "Monthly Maintenance & Retainer",
    invoicedAmount: 85000,
    receivedAmount: 85000,
    status: "Full Paid",
  },
];

const initialExpenses: ExpenseItem[] = [
  // Salaries
  {
    id: 1,
    date: "2026-08-01",
    category: "Salary & Payroll",
    vendor: "Core Engineering Team",
    title: "Monthly Developer Salaries (August)",
    amount: 220000,
    paymentMethod: "Bank Transfer",
    isRecurring: true,
    status: "Settled",
  },
  {
    id: 2,
    date: "2026-08-01",
    category: "Salary & Payroll",
    vendor: "Executive & Operations",
    title: "Executive Compensation & Admin Payroll",
    amount: 110000,
    paymentMethod: "Bank Transfer",
    isRecurring: true,
    status: "Settled",
  },
  // Subscriptions & SaaS Tools
  {
    id: 3,
    date: "2026-08-05",
    category: "Software Subscriptions",
    vendor: "GitHub Inc",
    title: "GitHub Enterprise & Copilot Business",
    amount: 16500,
    paymentMethod: "Card",
    isRecurring: true,
    status: "Settled",
  },
  {
    id: 4,
    date: "2026-08-08",
    category: "Software Subscriptions",
    vendor: "Figma Inc",
    title: "Figma Professional Team Plan (Design Seats)",
    amount: 12000,
    paymentMethod: "Card",
    isRecurring: true,
    status: "Settled",
  },
  {
    id: 5,
    date: "2026-08-12",
    category: "Software Subscriptions",
    vendor: "Slack Technologies",
    title: "Slack Business+ Workspace Plan",
    amount: 9800,
    paymentMethod: "Card",
    isRecurring: true,
    status: "Settled",
  },
  {
    id: 6,
    date: "2026-08-14",
    category: "Software Subscriptions",
    vendor: "OpenAI",
    title: "OpenAI API Usage Credits (AI Assistants)",
    amount: 18500,
    paymentMethod: "Card",
    isRecurring: false,
    projectAllocated: "Mobile App Development",
    status: "Settled",
  },
  // Cloud & Hosting
  {
    id: 7,
    date: "2026-08-03",
    category: "Cloud & Infrastructure",
    vendor: "DigitalOcean / AWS",
    title: "Production Droplets, Managed DB & S3 Buckets",
    amount: 32000,
    paymentMethod: "Card",
    isRecurring: true,
    status: "Settled",
  },
  {
    id: 8,
    date: "2026-08-10",
    category: "Cloud & Infrastructure",
    vendor: "Vercel Inc",
    title: "Vercel Pro Team Hosting & Edge Middleware",
    amount: 7500,
    paymentMethod: "Card",
    isRecurring: true,
    status: "Settled",
  },
  // Office Rent & Facilities
  {
    id: 9,
    date: "2026-08-01",
    category: "Office Rent & Utilities",
    vendor: "Gulshan Tech Tower",
    title: "Office Floor Rent (August 2026)",
    amount: 65000,
    paymentMethod: "Bank Transfer",
    isRecurring: true,
    status: "Settled",
  },
  {
    id: 10,
    date: "2026-08-07",
    category: "Office Rent & Utilities",
    vendor: "FiberLink & DESCO",
    title: "Dedicated Fiber Internet + Electricity Bill",
    amount: 14500,
    paymentMethod: "bKash / Mobile",
    isRecurring: true,
    status: "Settled",
  },
  // Contractors
  {
    id: 11,
    date: "2026-08-18",
    category: "Contractor & Freelancers",
    vendor: "Mobile QA Specialist",
    title: "Security & Penetration Testing Audit",
    amount: 35000,
    paymentMethod: "Bank Transfer",
    isRecurring: false,
    projectAllocated: "Mobile App Development",
    status: "Settled",
  },
];

const initialProjectProfitability: ProjectProfitSummary[] = [
  {
    id: 1,
    projectName: "Mobile App Development",
    clientName: "Nebula Systems",
    contractValue: 300000,
    totalCollected: 300000,
    directCOGS: 53500, // OpenAI + QA specialist
    allocatedPayroll: 120000,
    netProfit: 126500,
    marginPct: 42.1,
    status: "In Progress",
  },
  {
    id: 2,
    projectName: "LodgeOS Integration",
    clientName: "Global Tech",
    contractValue: 450000,
    totalCollected: 400000,
    directCOGS: 35000,
    allocatedPayroll: 140000,
    netProfit: 225000,
    marginPct: 56.2,
    status: "Review",
  },
  {
    id: 3,
    projectName: "E-commerce Redesign",
    clientName: "Acme Corp",
    contractValue: 250000,
    totalCollected: 150000,
    directCOGS: 25000,
    allocatedPayroll: 85000,
    netProfit: 40000,
    marginPct: 26.6,
    status: "In Progress",
  },
  {
    id: 4,
    projectName: "Brand Identity & SaaS Web",
    clientName: "Starlight Inc",
    contractValue: 120000,
    totalCollected: 120000,
    directCOGS: 12000,
    allocatedPayroll: 35000,
    netProfit: 73000,
    marginPct: 60.8,
    status: "Completed",
  },
];

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProfitLossPage() {
  const [timePeriod, setTimePeriod] = useState<"August 2026" | "Q3 2026" | "YTD 2026">("August 2026");
  const [activeTab, setActiveTab] = useState<"statement" | "projects" | "expenses" | "subscriptions">("statement");

  const [revenues, setRevenues] = useState<RevenueItem[]>(initialRevenues);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [projects] = useState<ProjectProfitSummary[]>(initialProjectProfitability);

  // Expense filter
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("All");
  const [expenseSearch, setExpenseSearch] = useState("");

  // Record Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "Software Subscriptions" as ExpenseCategory,
    vendor: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "Card" as ExpenseItem["paymentMethod"],
    isRecurring: false,
    projectAllocated: "",
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Core Financial Accounting Computations
  const financialMetrics = useMemo(() => {
    // 1. Gross Revenue Invoiced vs Realized Cash Collections
    const grossInvoicedRevenue = revenues.reduce((sum, r) => sum + r.invoicedAmount, 0);
    const realizedCashRevenue = revenues.reduce((sum, r) => sum + r.receivedAmount, 0);
    const accountsReceivable = grossInvoicedRevenue - realizedCashRevenue;

    // 2. Breakdown Expenses by Accounting Pillars
    const salaryTotal = expenses
      .filter((e) => e.category === "Salary & Payroll")
      .reduce((sum, e) => sum + e.amount, 0);

    const subscriptionTotal = expenses
      .filter((e) => e.category === "Software Subscriptions")
      .reduce((sum, e) => sum + e.amount, 0);

    const cloudTotal = expenses
      .filter((e) => e.category === "Cloud & Infrastructure")
      .reduce((sum, e) => sum + e.amount, 0);

    const rentUtilitiesTotal = expenses
      .filter((e) => e.category === "Office Rent & Utilities")
      .reduce((sum, e) => sum + e.amount, 0);

    const contractorTotal = expenses
      .filter((e) => e.category === "Contractor & Freelancers")
      .reduce((sum, e) => sum + e.amount, 0);

    const marketingTotal = expenses
      .filter((e) => e.category === "Marketing & Sales" || e.category === "Hardware & Devices" || e.category === "Legal & Accounting")
      .reduce((sum, e) => sum + e.amount, 0);

    // 3. Direct Cost of Services (COGS) vs Operating Expenses (OPEX)
    const totalCOGS = contractorTotal + cloudTotal; // Direct tech infrastructure & outsourced engineering
    const totalOPEX = salaryTotal + subscriptionTotal + rentUtilitiesTotal + marketingTotal;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 4. Gross Profit & Net Profit Margins
    const grossProfit = realizedCashRevenue - totalCOGS;
    const grossMarginPct = realizedCashRevenue > 0 ? (grossProfit / realizedCashRevenue) * 100 : 0;

    const netOperatingProfit = realizedCashRevenue - totalExpenses;
    const netProfitMarginPct = realizedCashRevenue > 0 ? (netOperatingProfit / realizedCashRevenue) * 100 : 0;

    // 5. Monthly Recurring Subscriptions & Fixed Burn Rate
    const monthlySaaSBurn = expenses
      .filter((e) => e.category === "Software Subscriptions" && e.isRecurring)
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyFixedPayroll = salaryTotal;

    return {
      grossInvoicedRevenue,
      realizedCashRevenue,
      accountsReceivable,
      salaryTotal,
      subscriptionTotal,
      cloudTotal,
      rentUtilitiesTotal,
      contractorTotal,
      marketingTotal,
      totalCOGS,
      totalOPEX,
      totalExpenses,
      grossProfit,
      grossMarginPct,
      netOperatingProfit,
      netProfitMarginPct,
      monthlySaaSBurn,
      monthlyFixedPayroll,
    };
  }, [revenues, expenses]);

  // Handle Recording New Expense
  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseForm.amount) || 0;
    if (amountNum <= 0 || !expenseForm.title.trim()) return;

    const newExpense: ExpenseItem = {
      id: Date.now(),
      date: expenseForm.date,
      category: expenseForm.category,
      vendor: expenseForm.vendor || expenseForm.category,
      title: expenseForm.title,
      amount: amountNum,
      paymentMethod: expenseForm.paymentMethod,
      isRecurring: expenseForm.isRecurring,
      projectAllocated: expenseForm.projectAllocated || undefined,
      status: "Settled",
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setIsExpenseModalOpen(false);

    setNotification(`Recorded ${expenseForm.category}: ${formatBDT(amountNum)} for ${expenseForm.title}`);
    setTimeout(() => setNotification(null), 4000);

    setExpenseForm({
      title: "",
      category: "Software Subscriptions",
      vendor: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: "Card",
      isRecurring: false,
      projectAllocated: "",
    });
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesCategory =
        expenseCategoryFilter === "All" ? true : item.category === expenseCategoryFilter;
      const matchesSearch =
        !expenseSearch ||
        item.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        item.vendor.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        (item.projectAllocated?.toLowerCase().includes(expenseSearch.toLowerCase()) ?? false);

      return matchesCategory && matchesSearch;
    });
  }, [expenses, expenseCategoryFilter, expenseSearch]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8 font-sans">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(59,130,246,0.1),transparent_25%),radial-gradient(circle_at_88%_14%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_85%_85%,rgba(245,158,11,0.08),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

      <AppSidebar activePath="/profit-loss" />

      <SidebarInset className="relative space-y-6">
        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 shadow-sm backdrop-blur-md animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* 1. TOP HEADER & CFO CONTROLS */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Financial Management</span>
              <span>/</span>
              <span className="text-cyan-700 font-medium">Software Company P&L</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Profit & Loss Statement
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm">
              Comprehensive financial health, client revenue, payroll, software subscriptions, and operating margins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Period Selector */}
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xs">
              {(["August 2026", "Q3 2026", "YTD 2026"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTimePeriod(period)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    timePeriod === period
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800 text-xs font-semibold gap-2 shadow-lg shadow-slate-900/10"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              Record Cost / Expense
            </Button>
          </div>
        </div>

        {/* 2. EXECUTIVE ACCOUNTING METRICS (Four Pillars) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Collected */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Realized Cash Revenue
                </span>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200/60">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-slate-950">
                {formatBDT(financialMetrics.realizedCashRevenue)}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Invoiced: {formatBDT(financialMetrics.grossInvoicedRevenue)}</span>
                <span className="font-semibold text-amber-700">
                  {formatBDT(financialMetrics.accountsReceivable)} due
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total OPEX & Costs */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Total Expenses (OPEX + COGS)
                </span>
                <div className="rounded-xl bg-rose-50 p-2 text-rose-600 border border-rose-200/60">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-slate-950">
                {formatBDT(financialMetrics.totalExpenses)}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Salaries: {formatBDT(financialMetrics.salaryTotal)}</span>
                <span>SaaS: {formatBDT(financialMetrics.subscriptionTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Gross Profit Margin */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Gross Profit (After COGS)
                </span>
                <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600 border border-cyan-200/60">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-slate-950">
                {formatBDT(financialMetrics.grossProfit)}
              </p>
              <p className="text-xs text-cyan-700 font-semibold flex items-center gap-1 pt-1">
                <Sparkles className="h-3.5 w-3.5" />
                {financialMetrics.grossMarginPct.toFixed(1)}% Gross Margin
              </p>
            </CardContent>
          </Card>

          {/* Net Operating Profit */}
          <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Net Operating Profit
                </span>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-800 border border-slate-200/60">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-emerald-700">
                {formatBDT(financialMetrics.netOperatingProfit)}
              </p>
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 pt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {financialMetrics.netProfitMarginPct.toFixed(1)}% Net Profit Margin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("statement")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "statement"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            1. Executive P&L Income Statement
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
            <Briefcase className="h-4 w-4" />
            2. Project Profitability Breakdown
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "expenses"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
            }`}
          >
            <Layers className="h-4 w-4" />
            3. Expense Master Ledger
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === "expenses" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {expenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "subscriptions"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            4. SaaS & Tool Subscriptions
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE P&L INCOME STATEMENT                     */}
        {/* ========================================================= */}
        {activeTab === "statement" && (
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
            {/* Standardized P&L Accounting Ledger */}
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Standard Income Statement ({timePeriod})
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      GAAP-standard software agency financial categorization
                    </CardDescription>
                  </div>
                  <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/60">
                    Net Margin: {financialMetrics.netProfitMarginPct.toFixed(1)}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 text-xs">
                {/* 1. REVENUE SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
                      I. REVENUE (INFLOWS)
                    </span>
                    <span className="font-display text-sm font-bold text-slate-900 font-mono">
                      {formatBDT(financialMetrics.realizedCashRevenue)}
                    </span>
                  </div>

                  <div className="space-y-2 pl-3 text-slate-600">
                    {revenues.map((rev) => (
                      <div key={rev.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{rev.client}</span>
                          <span className="text-slate-400 ml-2 font-mono">({rev.invoiceNo})</span>
                          <p className="text-[11px] text-slate-500">{rev.category}</p>
                        </div>
                        <span className="font-mono font-semibold text-slate-900">
                          {formatBDT(rev.receivedAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. COST OF SERVICES (COGS) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
                      II. COST OF SERVICES & DIRECT TECH (COGS)
                    </span>
                    <span className="font-display text-sm font-bold text-rose-700 font-mono">
                      - {formatBDT(financialMetrics.totalCOGS)}
                    </span>
                  </div>

                  <div className="space-y-2 pl-3 text-slate-600">
                    <div className="flex justify-between">
                      <span>Cloud Servers & Dedicated Infrastructure (AWS / DigitalOcean / Vercel)</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatBDT(financialMetrics.cloudTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Project Contractors & Security Audits</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatBDT(financialMetrics.contractorTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GROSS PROFIT SUB-TOTAL */}
                <div className="rounded-2xl border border-cyan-200/80 bg-cyan-50/60 p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-display font-bold text-cyan-950 text-sm">GROSS PROFIT</p>
                    <p className="text-[11px] text-cyan-800">Revenue minus direct software delivery costs</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-display text-base font-bold text-cyan-950">
                      {formatBDT(financialMetrics.grossProfit)}
                    </p>
                    <p className="text-[11px] font-semibold text-cyan-800">
                      {financialMetrics.grossMarginPct.toFixed(1)}% Gross Margin
                    </p>
                  </div>
                </div>

                {/* 3. OPERATING EXPENSES (OPEX) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
                      III. OPERATING EXPENSES (OPEX)
                    </span>
                    <span className="font-display text-sm font-bold text-rose-700 font-mono">
                      - {formatBDT(financialMetrics.totalOPEX)}
                    </span>
                  </div>

                  <div className="space-y-2 pl-3 text-slate-600">
                    <div className="flex justify-between">
                      <span>Team Salaries & Engineering Payroll</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatBDT(financialMetrics.salaryTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Software Tool Stack & SaaS Subscriptions (GitHub, Figma, Slack, OpenAI)</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatBDT(financialMetrics.subscriptionTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Office Rent, Electricity & Fiber Internet</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatBDT(financialMetrics.rentUtilitiesTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* NET PROFIT FINAL ROW */}
                <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 p-5 text-white flex items-center justify-between shadow-xl">
                  <div>
                    <p className="font-display text-xs font-bold uppercase tracking-widest text-emerald-400">
                      NET OPERATING PROFIT (EBITDA)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Net earnings retained in company reserve
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-display text-xl font-bold text-emerald-400">
                      {formatBDT(financialMetrics.netOperatingProfit)}
                    </p>
                    <p className="text-xs text-slate-300 font-bold">
                      {financialMetrics.netProfitMarginPct.toFixed(1)}% Net Margin
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Allocation & Monthly Burn Widget */}
            <div className="space-y-6">
              {/* Expense Category Breakdown */}
              <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-slate-900">
                    Cost Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Where the company capital is allocated
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  {/* Salaries */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-cyan-600" />
                        Salaries & Payroll
                      </span>
                      <span className="font-mono font-bold text-slate-950">
                        {formatBDT(financialMetrics.salaryTotal)} (
                        {(
                          (financialMetrics.salaryTotal / financialMetrics.totalExpenses) *
                          100
                        ).toFixed(0)}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full"
                        style={{
                          width: `${(financialMetrics.salaryTotal / financialMetrics.totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Office Rent & Facilities */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-amber-600" />
                        Office Rent & Facilities
                      </span>
                      <span className="font-mono font-bold text-slate-950">
                        {formatBDT(financialMetrics.rentUtilitiesTotal)} (
                        {(
                          (financialMetrics.rentUtilitiesTotal / financialMetrics.totalExpenses) *
                          100
                        ).toFixed(0)}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${(financialMetrics.rentUtilitiesTotal / financialMetrics.totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Software Subscriptions */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold flex items-center gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                        SaaS & Software Tools
                      </span>
                      <span className="font-mono font-bold text-slate-950">
                        {formatBDT(financialMetrics.subscriptionTotal)} (
                        {(
                          (financialMetrics.subscriptionTotal / financialMetrics.totalExpenses) *
                          100
                        ).toFixed(0)}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(financialMetrics.subscriptionTotal / financialMetrics.totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cloud Infrastructure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-violet-600" />
                        Cloud & Hosting
                      </span>
                      <span className="font-mono font-bold text-slate-950">
                        {formatBDT(financialMetrics.cloudTotal)} (
                        {(
                          (financialMetrics.cloudTotal / financialMetrics.totalExpenses) *
                          100
                        ).toFixed(0)}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{
                          width: `${(financialMetrics.cloudTotal / financialMetrics.totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Fixed Burn Card */}
              <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-slate-900">
                    Monthly Operational Burn Rate
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Fixed monthly commitments to keep operations humming
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Fixed Payroll Commitment</span>
                    <span className="font-mono font-bold text-slate-950">
                      {formatBDT(financialMetrics.monthlyFixedPayroll)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Recurring SaaS Stack</span>
                    <span className="font-mono font-bold text-slate-950">
                      {formatBDT(financialMetrics.monthlySaaSBurn)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Office Rent & Fiber</span>
                    <span className="font-mono font-bold text-slate-950">
                      {formatBDT(financialMetrics.rentUtilitiesTotal)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-sm text-slate-950">
                    <span>Total Fixed Monthly Burn</span>
                    <span className="font-mono text-rose-700">
                      {formatBDT(
                        financialMetrics.monthlyFixedPayroll +
                          financialMetrics.monthlySaaSBurn +
                          financialMetrics.rentUtilitiesTotal
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROJECT PROFITABILITY BREAKDOWN                     */}
        {/* ========================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-base text-slate-900">
                  Client Project Unit Economics & Margins
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Direct revenue versus engineering hours & dedicated server cost
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Project & Client</th>
                        <th className="px-4 py-3.5 text-right">Contract Value</th>
                        <th className="px-4 py-3.5 text-right">Cash Collected</th>
                        <th className="px-4 py-3.5 text-right">Direct COGS</th>
                        <th className="px-4 py-3.5 text-right">Payroll Allocated</th>
                        <th className="px-4 py-3.5 text-right">Net Project Profit</th>
                        <th className="px-5 py-3.5 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-950">
                            <p className="font-bold">{proj.projectName}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{proj.clientName}</p>
                          </td>

                          <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800">
                            {formatBDT(proj.contractValue)}
                          </td>

                          <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">
                            {formatBDT(proj.totalCollected)}
                          </td>

                          <td className="px-4 py-4 text-right font-mono text-slate-600">
                            {formatBDT(proj.directCOGS)}
                          </td>

                          <td className="px-4 py-4 text-right font-mono text-slate-600">
                            {formatBDT(proj.allocatedPayroll)}
                          </td>

                          <td className="px-4 py-4 text-right font-mono font-bold text-slate-950">
                            {formatBDT(proj.netProfit)}
                          </td>

                          <td className="px-5 py-4 text-right font-mono">
                            <span
                              className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${
                                proj.marginPct >= 50
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                                  : proj.marginPct >= 30
                                  ? "bg-cyan-50 text-cyan-800 border border-cyan-200/60"
                                  : "bg-amber-50 text-amber-800 border border-amber-200/60"
                              }`}
                            >
                              {proj.marginPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EXPENSE MASTER LEDGER                              */}
        {/* ========================================================= */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search expenses by vendor, description, or project..."
                  className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-xs"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Category:</span>
                {[
                  "All",
                  "Salary & Payroll",
                  "Software Subscriptions",
                  "Cloud & Infrastructure",
                  "Office Rent & Utilities",
                  "Contractor & Freelancers",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setExpenseCategoryFilter(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      expenseCategoryFilter === cat
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses Table */}
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Title & Vendor</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Payment Method</th>
                        <th className="px-4 py-3.5">Type</th>
                        <th className="px-5 py-3.5 text-right">Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredExpenses.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 font-mono font-medium text-slate-700">{item.date}</td>

                          <td className="px-4 py-4 font-semibold text-slate-950">
                            <p className="font-bold">{item.title}</p>
                            <p className="text-[11px] text-slate-500 font-normal">
                              Vendor: {item.vendor} {item.projectAllocated && `• Project: ${item.projectAllocated}`}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200/60">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-slate-700 font-medium">{item.paymentMethod}</td>

                          <td className="px-4 py-4">
                            {item.isRecurring ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-800 border border-cyan-200/60">
                                <RefreshCw className="h-3 w-3" />
                                Monthly
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">One-Time</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-mono font-bold text-rose-700 text-sm">
                            - {formatBDT(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SAAS & TOOL SUBSCRIPTIONS                          */}
        {/* ========================================================= */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Software & SaaS Stack Subscriptions
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Developer tooling, design licenses, AI credits, and team communication
                    </CardDescription>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    Monthly SaaS Run-Rate: {formatBDT(financialMetrics.subscriptionTotal)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">SaaS Vendor</th>
                        <th className="px-4 py-3.5">Plan / Description</th>
                        <th className="px-4 py-3.5">Billing Cadence</th>
                        <th className="px-4 py-3.5">Payment Method</th>
                        <th className="px-5 py-3.5 text-right">Monthly Cost (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses
                        .filter((e) => e.category === "Software Subscriptions" || e.category === "Cloud & Infrastructure")
                        .map((saas) => (
                          <tr key={saas.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-950">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold">
                                  <Cloud className="h-3.5 w-3.5" />
                                </div>
                                <span>{saas.vendor}</span>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-slate-700 font-medium">{saas.title}</td>

                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/60">
                                {saas.isRecurring ? "Monthly Recurring" : "Usage Based"}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-slate-600 font-mono">{saas.paymentMethod}</td>

                            <td className="px-5 py-4 text-right font-mono font-bold text-slate-950 text-sm">
                              {formatBDT(saas.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* RECORD EXPENSE / COST POPUP MODAL                         */}
        {/* ========================================================= */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Record Company Expense / Cost
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add salary disbursement, SaaS tool subscription, server invoice, or office bill.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRecordExpense} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="expTitle" className="text-xs font-semibold text-slate-700">
                    Expense Title / Item Description <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="expTitle"
                    placeholder="e.g. GitHub Copilot Subscription / July Payroll"
                    className="h-11 rounded-xl border-slate-200 text-xs"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="expCat" className="text-xs font-semibold text-slate-700">
                      Accounting Category
                    </Label>
                    <select
                      id="expCat"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-xs outline-none focus:border-cyan-400"
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          category: e.target.value as ExpenseCategory,
                        }))
                      }
                    >
                      <option value="Salary & Payroll">Salary & Payroll</option>
                      <option value="Software Subscriptions">Software Subscriptions</option>
                      <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                      <option value="Office Rent & Utilities">Office Rent & Utilities</option>
                      <option value="Contractor & Freelancers">Contractor & Freelancers</option>
                      <option value="Hardware & Devices">Hardware & Devices</option>
                      <option value="Marketing & Sales">Marketing & Sales</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expAmount" className="text-xs font-semibold text-slate-700">
                      Amount (BDT) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="expAmount"
                      type="number"
                      min="1"
                      placeholder="e.g. 25000"
                      className="h-11 rounded-xl border-slate-200 text-xs font-mono font-bold"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="expVendor" className="text-xs font-semibold text-slate-700">
                      Vendor / Beneficiary
                    </Label>
                    <Input
                      id="expVendor"
                      placeholder="e.g. GitHub / AWS / Landlord"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={expenseForm.vendor}
                      onChange={(e) => setExpenseForm((prev) => ({ ...prev, vendor: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expDate" className="text-xs font-semibold text-slate-700">
                      Date
                    </Label>
                    <Input
                      id="expDate"
                      type="date"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="expMethod" className="text-xs font-semibold text-slate-700">
                      Payment Method
                    </Label>
                    <select
                      id="expMethod"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-xs outline-none focus:border-cyan-400"
                      value={expenseForm.paymentMethod}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value as ExpenseItem["paymentMethod"],
                        }))
                      }
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                      <option value="bKash / Mobile">bKash / Mobile</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expProject" className="text-xs font-semibold text-slate-700">
                      Allocate to Project (Optional)
                    </Label>
                    <Input
                      id="expProject"
                      placeholder="e.g. Mobile App Development"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={expenseForm.projectAllocated}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({ ...prev, projectAllocated: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={expenseForm.isRecurring}
                    onChange={(e) =>
                      setExpenseForm((prev) => ({ ...prev, isRecurring: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-cyan-600"
                  />
                  <Label htmlFor="isRecurring" className="text-xs text-slate-700 font-medium">
                    This is a monthly recurring cost (e.g. SaaS subscription or payroll)
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="rounded-xl border-slate-200 bg-white text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800 text-xs font-semibold shadow-lg shadow-slate-900/10 gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Record Expense
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
